const Wallet = require("../models/Wallet");
const PendingOrder = require("../models/PendingOrder");
const Razorpay = require("razorpay");
const crypto = require("crypto");

// ================================
// GET WALLET
// ================================
const getWallet = async (req, res) => {
  try {
    let wallet = await Wallet.findOne({
      merchantId: req.user.id,
    });

    if (!wallet) {
      wallet = await Wallet.create({
        merchantId: req.user.id,
      });
    }

    res.status(200).json({
      success: true,
      wallet,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ================================
// CREATE RAZORPAY ORDER (PURE RAZORPAY INTEGRATION)
// ================================
const createRazorpayOrder = async (req, res) => {
  try {
    const { amount } = req.body;

    const rechargeAmount = Number(amount);
    if (!rechargeAmount || rechargeAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid amount",
      });
    }

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      return res.status(400).json({
        success: false,
        message: "Razorpay Key ID or Secret is missing in backend/.env file",
      });
    }

    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    const shortId = String(req.user.id).slice(-8);
    const shortTs = String(Date.now()).slice(-8);
    const options = {
      amount: Math.round(rechargeAmount * 100), // Razorpay expects amount in paise
      currency: "INR",
      receipt: `wlt_${shortId}_${shortTs}`,
      notes: {
        merchantId: String(req.user.id),
      },
    };

    const order = await razorpay.orders.create(options);

    // Save PendingOrder in Mongo for fast DB-level webhook merchantId resolution
    try {
      await PendingOrder.create({
        razorpayOrderId: order.id,
        merchantId: req.user.id,
        amount: rechargeAmount,
        status: "PENDING",
      });
      console.log(`[RAZORPAY_RECHARGE_AUDIT] PENDING_ORDER_CREATED | OrderID: ${order.id} | Merchant: ${req.user.id}`);
    } catch (dbErr) {
      console.warn(`[RAZORPAY_RECHARGE_AUDIT] Could not save PendingOrder DB record:`, dbErr.message);
    }

    res.status(200).json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: keyId,
    });
  } catch (error) {
    console.error("Razorpay Order Error:", error);
    res.status(500).json({
      success: false,
      message: error?.error?.description || error.message || "Failed to create Razorpay order",
    });
  }
};

// ================================================
// CENTRALIZED ATOMIC WALLET RECHARGE HELPER
// Prevents race conditions & double credit using MongoDB atomic write lock ($ne)
// ================================================
const executeAtomicWalletRecharge = async ({
  merchantId,
  razorpayOrderId,
  razorpayPaymentId,
  rechargeAmount,
  source = "UNKNOWN",
}) => {
  const roundedAmount = Math.round(Number(rechargeAmount) * 100) / 100;
  if (!merchantId || !razorpayPaymentId || roundedAmount <= 0) {
    throw new Error("Invalid parameters for atomic wallet recharge");
  }

  // ATOMIC DATABASE UPDATE:
  // MongoDB executes this query with a document-level write lock.
  // The query condition `"transactions.razorpayPaymentId": { $ne: razorpayPaymentId }`
  // guarantees that if 2 or more requests hit simultaneously for the same paymentId,
  // ONLY THE FIRST REQUEST WILL MATCH AND MODIFY THE DOCUMENT.
  // Subsequent requests will find $ne evaluates to FALSE and return null!
  const updatedWallet = await Wallet.findOneAndUpdate(
    {
      merchantId: merchantId,
      "transactions.razorpayPaymentId": { $ne: razorpayPaymentId },
    },
    {
      $inc: { balance: roundedAmount },
      $push: {
        transactions: {
          razorpayPaymentId: razorpayPaymentId,
          razorpayOrderId: razorpayOrderId || null,
          amount: roundedAmount,
          type: "CREDIT",
          description: `Wallet Recharge via Razorpay (${razorpayPaymentId})`,
          createdAt: new Date(),
        },
      },
    },
    { new: true }
  );

  if (updatedWallet) {
    // Mark PendingOrder as COMPLETED
    if (razorpayOrderId) {
      await PendingOrder.findOneAndUpdate(
        { razorpayOrderId: razorpayOrderId },
        { status: "COMPLETED" }
      ).catch(() => {});
    }

    console.log(
      `[RAZORPAY_RECHARGE_AUDIT] SUCCESS | Timestamp: ${new Date().toISOString()} | Merchant: ${merchantId} | PaymentID: ${razorpayPaymentId} | OrderID: ${razorpayOrderId} | Amount: ₹${roundedAmount} | Source: ${source} | New Balance: ₹${updatedWallet.balance}`
    );
    return {
      success: true,
      isDuplicate: false,
      wallet: updatedWallet,
    };
  }

  // If updatedWallet is null, check why:
  // Either the wallet doesn't exist yet, OR the paymentId has already been credited!
  const existingWallet = await Wallet.findOne({ merchantId });

  if (existingWallet) {
    const isAlreadyCredited = existingWallet.transactions.some(
      (t) => t.razorpayPaymentId === razorpayPaymentId
    );

    if (isAlreadyCredited) {
      console.log(
        `[RAZORPAY_RECHARGE_AUDIT] DUPLICATE_SKIPPED | Timestamp: ${new Date().toISOString()} | Merchant: ${merchantId} | PaymentID: ${razorpayPaymentId} | Amount: ₹${roundedAmount} | Source: ${source} | Current Balance: ₹${existingWallet.balance}`
      );
      return {
        success: true,
        isDuplicate: true,
        wallet: existingWallet,
      };
    }
  }

  // If wallet didn't exist at all, create it now atomically with the transaction
  const newWallet = await Wallet.create({
    merchantId: merchantId,
    balance: roundedAmount,
    transactions: [
      {
        razorpayPaymentId: razorpayPaymentId,
        razorpayOrderId: razorpayOrderId || null,
        amount: roundedAmount,
        type: "CREDIT",
        description: `Wallet Recharge via Razorpay (${razorpayPaymentId})`,
        createdAt: new Date(),
      },
    ],
  });

  console.log(
    `[RAZORPAY_RECHARGE_AUDIT] NEW_WALLET_SUCCESS | Timestamp: ${new Date().toISOString()} | Merchant: ${merchantId} | PaymentID: ${razorpayPaymentId} | Amount: ₹${roundedAmount} | Source: ${source}`
  );

  return {
    success: true,
    isDuplicate: false,
    wallet: newWallet,
  };
};

// ================================
// VERIFY RAZORPAY PAYMENT & RECHARGE WALLET (FRONTEND CALLBACK)
// ================================
const verifyRazorpayPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, amount } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      console.log(`[RAZORPAY_RECHARGE_AUDIT] FAILED_VERIFY | Missing parameters`);
      return res.status(400).json({
        success: false,
        message: "Missing Razorpay verification parameters",
      });
    }

    // 1. Verify signature using HMAC-SHA256
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "")
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      console.log(`[RAZORPAY_RECHARGE_AUDIT] INVALID_SIGNATURE | PaymentID: ${razorpay_payment_id}`);
      return res.status(400).json({
        success: false,
        message: "Payment verification failed. Invalid Razorpay signature.",
      });
    }

    // 2. Fetch exact order amount & verify merchant ownership from Razorpay API
    let rechargeAmount;
    try {
      const keyId = process.env.RAZORPAY_KEY_ID;
      const keySecret = process.env.RAZORPAY_KEY_SECRET;
      const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });
      const order = await razorpay.orders.fetch(razorpay_order_id);
      if (!order || !order.amount) {
        throw new Error("Razorpay order not found or invalid");
      }

      // OWNERSHIP CHECK: Ensure the order belongs to the requesting merchant
      const orderOwnerMerchantId = order.notes?.merchantId;
      if (!orderOwnerMerchantId || String(orderOwnerMerchantId) !== String(req.user.id)) {
        console.log(`[RAZORPAY_RECHARGE_AUDIT] OWNERSHIP_MISMATCH | OrderID: ${razorpay_order_id} | Claimed by: ${req.user.id} | Actual owner: ${orderOwnerMerchantId}`);
        return res.status(403).json({
          success: false,
          message: "This payment does not belong to your account.",
        });
      }

      rechargeAmount = order.amount / 100; // Authoritative Razorpay order amount in paise -> divide by 100
    } catch (orderErr) {
      if (orderErr.status === 403) return; // already handled
      console.error("[RAZORPAY_RECHARGE_AUDIT] ORDER_FETCH_FAILED:", orderErr.message);
      return res.status(400).json({
        success: false,
        message: "Could not verify payment amount with Razorpay server. If money was deducted, your wallet will automatically credit via Webhook shortly.",
      });
    }

    // 3. Execute Atomic Wallet Recharge
    const result = await executeAtomicWalletRecharge({
      merchantId: req.user.id,
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      rechargeAmount: rechargeAmount,
      source: "FRONTEND_VERIFY",
    });

    res.status(200).json({
      success: true,
      message: result.isDuplicate
        ? "Payment already processed and wallet credited"
        : "Wallet Recharged Successfully",
      wallet: result.wallet,
    });
  } catch (error) {
    console.error("[RAZORPAY_RECHARGE_AUDIT] ERROR_VERIFY:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to verify Razorpay payment",
    });
  }
};

// ================================
// RAZORPAY WEBHOOK HANDLER (OFFICIAL SDK VERIFICATION & CRASH FALLBACK)
// ================================
const handleRazorpayWebhook = async (req, res) => {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_KEY_SECRET;
    const signature = req.headers["x-razorpay-signature"];

    if (!webhookSecret || !signature) {
      console.log(`[RAZORPAY_RECHARGE_AUDIT] WEBHOOK_FAILED | Missing signature or webhook secret`);
      return res.status(400).json({
        success: false,
        message: "Missing webhook signature or secret",
      });
    }

    // Official Razorpay SDK Webhook Signature Validation
    const rawBodyString = req.rawBody ? req.rawBody.toString("utf8") : (typeof req.body === "string" ? req.body : JSON.stringify(req.body));
    const isValidSignature = Razorpay.validateWebhookSignature(
      rawBodyString,
      signature,
      webhookSecret
    );

    if (!isValidSignature) {
      console.log(`[RAZORPAY_RECHARGE_AUDIT] WEBHOOK_INVALID_SIGNATURE | Signature verification failed`);
      return res.status(400).json({
        success: false,
        message: "Invalid webhook signature",
      });
    }

    const event = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const eventType = event.event;

    console.log(`[RAZORPAY_RECHARGE_AUDIT] WEBHOOK_RECEIVED | Event: ${eventType}`);

    if (eventType === "payment.captured" || eventType === "order.paid") {
      const payment = event.payload?.payment?.entity;
      if (payment && payment.status === "captured") {
        const paymentId = payment.id;
        const orderId = payment.order_id;
        const rechargeAmount = Number(payment.amount || 0) / 100; // Razorpay amount is in paise -> divide by 100

        let targetMerchantId = payment.notes?.merchantId;

        // STEP 1: Fast & Reliable Mongo DB Lookup via PendingOrder collection
        if (!targetMerchantId && orderId) {
          try {
            const pendingRecord = await PendingOrder.findOne({ razorpayOrderId: orderId });
            if (pendingRecord && pendingRecord.merchantId) {
              targetMerchantId = String(pendingRecord.merchantId);
              console.log(`[RAZORPAY_RECHARGE_AUDIT] WEBHOOK_RESOLVED_MERCHANT_VIA_DB | OrderID: ${orderId} -> MerchantID: ${targetMerchantId}`);
            }
          } catch (pendingErr) {
            console.warn(`[RAZORPAY_RECHARGE_AUDIT] PendingOrder DB lookup warning:`, pendingErr.message);
          }
        }

        // STEP 2: Fallback to Razorpay API fetch if DB record was missing
        if (!targetMerchantId && orderId) {
          try {
            const keyId = process.env.RAZORPAY_KEY_ID;
            const keySecret = process.env.RAZORPAY_KEY_SECRET;
            if (keyId && keySecret) {
              const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });
              const order = await razorpay.orders.fetch(orderId);
              targetMerchantId = order?.notes?.merchantId;
            }
          } catch (fetchErr) {
            console.error(`[RAZORPAY_RECHARGE_AUDIT] WEBHOOK_ORDER_FETCH_FAILED | OrderID: ${orderId}:`, fetchErr.message);
          }
        }

        if (targetMerchantId && rechargeAmount > 0) {
          await executeAtomicWalletRecharge({
            merchantId: targetMerchantId,
            razorpayOrderId: orderId,
            razorpayPaymentId: paymentId,
            rechargeAmount: rechargeAmount,
            source: "WEBHOOK_EVENT",
          });
        } else {
          console.log(`[RAZORPAY_RECHARGE_AUDIT] WEBHOOK_SKIPPED | Merchant ID could not be resolved for order ${orderId}`);
        }
      } else {
        console.log(`[RAZORPAY_RECHARGE_AUDIT] WEBHOOK_PAYMENT_NOT_CAPTURED | Status: ${payment?.status}`);
      }
    } else if (eventType === "payment.failed") {
      const payment = event.payload?.payment?.entity;
      console.log(`[RAZORPAY_RECHARGE_AUDIT] WEBHOOK_PAYMENT_FAILED | PaymentID: ${payment?.id} | Reason: ${payment?.error_description}`);
    }

    // Always return 200 OK for valid webhooks so Razorpay stops retrying
    res.status(200).json({
      success: true,
      message: "Webhook received and processed",
    });
  } catch (err) {
    console.error("[RAZORPAY_RECHARGE_AUDIT] WEBHOOK_ERROR:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ================================
// RECHARGE WALLET (Legacy - direct)
// ================================
const rechargeWallet = async (req, res) => {
  try {
    const { amount } = req.body;

    // Improved Recharge Validation
    const rechargeAmount = Number(amount);
    if (!rechargeAmount || rechargeAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid amount",
      });
    }

    // Verify with your actual gateway (Razorpay/Cashfree/etc.)
    // const isValid = await verifyPaymentWithGateway(paymentGatewayOrderId, paymentGatewaySignature, amount);
    // if (!isValid) return res.status(400).json({ success: false, message: "Payment verification failed" });

    const wallet = await Wallet.findOneAndUpdate(
      { merchantId: req.user.id },
      {
        $inc: { balance: rechargeAmount },
        $push: {
          transactions: {
            amount: rechargeAmount,
            type: "CREDIT",
            description: "Wallet Recharge",
            createdAt: new Date(),
          },
        },
      },
      { new: true, upsert: true }
    );

    res.status(200).json({
      success: true,
      message: "Wallet Recharged Successfully",
      wallet,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ================================
// DEBIT WALLET
// ================================
const debitWallet = async (req, res) => {
  try {
    const { amount, description } = req.body;    

    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid amount",
      });
    }

    const wallet = await Wallet.findOneAndUpdate(
      { merchantId: req.user.id, balance: { $gte: Number(amount) } },
      {
        $inc: { balance: -Number(amount) },
        $push: {
          transactions: {
            amount: Number(amount),
            type: "DEBIT",
            description: description || "Wallet Debit",
            createdAt: new Date(),
          },
        },
      },
      { new: true }
    );

    if (!wallet) {
      return res.status(400).json({
        success: false,
        message: "Insufficient wallet balance",
      });
    }

    res.status(200).json({
      success: true,
      message: "Amount Debited Successfully",
      wallet,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ================================
// GET TRANSACTIONS
// ================================
const getTransactions = async (req, res) => {
  try {
    const wallet = await Wallet.findOne({
      merchantId: req.user.id,
    });

    // Transactions sorted by newest first
    res.status(200).json({
      success: true,
      transactions:
        wallet?.transactions?.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        ) || [],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ================================
// WALLET SUMMARY
// ================================
const getWalletSummary = async (req, res) => {
  try {
    const wallet = await Wallet.findOne({
      merchantId: req.user.id,
    });

    if (!wallet) {
      return res.status(200).json({
        success: true,
        balance: 0,
        totalCredit: 0,
        totalDebit: 0,
      });
    }

    const totalCredit = Number(
      wallet.transactions
        .filter((t) => t.type === "CREDIT")
        .reduce((sum, t) => sum + (t.amount || 0), 0)
        .toFixed(2)
    );

    const totalDebit = Number(
      wallet.transactions
        .filter((t) => t.type === "DEBIT")
        .reduce((sum, t) => sum + (t.amount || 0), 0)
        .toFixed(2)
    );

    res.status(200).json({
      success: true,
      balance: Number((wallet.balance || 0).toFixed(2)),
      totalCredit,
      totalDebit,
      totalTransactions: wallet.transactions.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getWallet,
  rechargeWallet,
  debitWallet,
  getTransactions,
  getWalletSummary,
  createRazorpayOrder,
  verifyRazorpayPayment,
  handleRazorpayWebhook,
};