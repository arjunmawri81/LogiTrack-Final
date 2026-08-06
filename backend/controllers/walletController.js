const Wallet = require("../models/Wallet");
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
// CREATE RAZORPAY ORDER
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

    // Razorpay instance yahan banao (env sure se load hogi)
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    // Razorpay amount paise mein hoti hai (multiply by 100)
    const shortId = String(req.user.id).slice(-8);
    const shortTs = String(Date.now()).slice(-8);
    const options = {
      amount: Math.round(rechargeAmount * 100),
      currency: "INR",
      receipt: `wlt_${shortId}_${shortTs}`,  // max ~21 chars
    };

    const order = await razorpay.orders.create(options);

    res.status(200).json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error("Razorpay Order Error:", error);
    res.status(500).json({
      success: false,
      message: error?.error?.description || error.message,
    });
  }
};


// ================================
// VERIFY RAZORPAY PAYMENT & RECHARGE WALLET
// ================================
const verifyRazorpayPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, amount } = req.body;

    // Signature verify karo (security ke liye)
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Payment verification failed. Invalid signature.",
      });
    }

    const rechargeAmount = Number(amount) / 100; // paise se rupee

    const wallet = await Wallet.findOneAndUpdate(
      { merchantId: req.user.id },
      {
        $inc: { balance: rechargeAmount },
        $push: {
          transactions: {
            amount: rechargeAmount,
            type: "CREDIT",
            description: `Wallet Recharge via Razorpay (${razorpay_payment_id})`,
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
};