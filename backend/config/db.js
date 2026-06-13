const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    console.log("MONGODB_URI =", process.env.MONGODB_URI);
    console.log("MONGO_URI =", process.env.MONGO_URI);

    await mongoose.connect(
      process.env.MONGODB_URI || process.env.MONGO_URI
    );

    console.log("MongoDB Connected ✅");
  } catch (error) {
    console.log("MongoDB Error:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;