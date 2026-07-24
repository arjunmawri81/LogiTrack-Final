const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });

const User = require("../models/User");

const email = process.argv[2] || process.env.RESET_ADMIN_EMAIL;
const newPassword = process.argv[3] || process.env.RESET_ADMIN_PASSWORD;

if (!email || !newPassword) {
  console.error(" Error: Email and password must be provided.");
  console.log("Usage: node resetAdmin.js <email> <newPassword>");
  console.log("  OR set RESET_ADMIN_EMAIL and RESET_ADMIN_PASSWORD environment variables.");
  process.exit(1);
}

const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;

if (!mongoUri) {
  console.error(" Error: MONGODB_URI is not set in environment.");
  process.exit(1);
}

mongoose
  .connect(mongoUri)
  .then(async () => {
    const hash = await bcrypt.hash(newPassword, 10);

    const result = await User.updateOne(
      { email: email.toLowerCase() },
      {
        $set: {
          password: hash,
          role: "ADMIN"
        }
      }
    );

    if (result.matchedCount === 0) {
      console.error(` User with email "${email}" not found.`);
    } else {
      console.log(` Admin password reset successfully for user: ${email}`);
    }

    process.exit(0);
  })
  .catch((err) => {
    console.error(" Database connection/update error:", err.message);
    process.exit(1);
  });
