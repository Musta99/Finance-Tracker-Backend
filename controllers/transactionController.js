import Transaction from "../models/transaction.js";

const createTransaction = async (req, res, next) => {
  try {
    const payLoad = req.body;

    const transaction = new Transaction(payLoad);
    await transaction.save();

    res.status(201).json({
      message: "Successfully created new Transaction",
      data: transaction,
    });
  } catch (err) {
    next(err);
  }
};

// Fetch Transaction

const fetchTransaction = async (req, res, next) => {
  try {
    const { type, user } = req.query;
    const filter = {};
    if (type) filter.type = type;
    if (user) filter.user = user;

    const txs = await Transaction.find(filter);
    res.status(200).json({
      message: "Successfully Fetched Transactions",
      data: txs,
    });
  } catch (err) {
    next(err);
  }
};

// Update Transaction
const updateTransaction = async (req, res, next) => {
  try {
    const { transactionId } = req.params;
    const updatedPayload = req.body;

    console.log(transactionId);
    const tx = await Transaction.findOneAndUpdate(
      transactionId,
      updatedPayload,
      { new: true }
    );

    res.status(200).json({
      message: "Transaction is successfully Updated",
      data: tx,
    });
  } catch (err) {
    next(err);
  }
};

// Delete Transaction
const deleteTransaction = async (req, res, next) => {
  try {
    const { transactionId } = req.params;
    console.log(transactionId);

    const tx = await Transaction.findOneAndDelete(transactionId);

    res.status(200).json({
      message: "Transaction has been successfully deleted",
    });
  } catch (err) {
    next(err);
  }
};

export {
  createTransaction,
  fetchTransaction,
  updateTransaction,
  deleteTransaction,
};
