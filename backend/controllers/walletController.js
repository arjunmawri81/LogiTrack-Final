const Wallet = require("../models/Wallet");

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
// RECHARGE WALLET
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

    let wallet = await Wallet.findOne({
      merchantId: req.user.id,
    });

    if (!wallet) {
      wallet = await Wallet.create({
        merchantId: req.user.id,
      });
    }

    wallet.balance += rechargeAmount;

    wallet.transactions.push({
      amount: rechargeAmount,
      type: "CREDIT",
      description: "Wallet Recharge",
      createdAt: new Date(), // Ensure timestamp is recorded
    });

    await wallet.save();

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

    let wallet = await Wallet.findOne({
      merchantId: req.user.id,
    });

    if (!wallet) {
      const newWallet = await Wallet.create({
        merchantId: req.user.id,
      });

      return res.status(400).json({
        success: false,
        message: "Insufficient wallet balance",
        wallet: newWallet,
      });
    }

    if (wallet.balance < Number(amount)) {
      return res.status(400).json({
        success: false,
        message: "Insufficient wallet balance",
      });
    }

    wallet.balance -= Number(amount);

    wallet.transactions.push({
      amount: Number(amount),
      type: "DEBIT",
      description: description || "Wallet Debit",
      createdAt: new Date(),
    });

    await wallet.save();

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

    const totalCredit = wallet.transactions
      .filter((t) => t.type === "CREDIT")
      .reduce((sum, t) => sum + t.amount, 0);

    const totalDebit = wallet.transactions
      .filter((t) => t.type === "DEBIT")
      .reduce((sum, t) => sum + t.amount, 0);

    res.status(200).json({
      success: true,
      balance: wallet.balance,
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
};