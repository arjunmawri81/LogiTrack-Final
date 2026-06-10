const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
require("dotenv").config();

const User = require("./models/User");

mongoose.connect(process.env.MONGODB_URI)
.then(async () => {

  const hash = await bcrypt.hash(
    "Admin@123",
    10
  );

  await User.updateOne(
    { email: "arjun@gmail.com" },
    {
      $set: {
        password: hash,
        role: "ADMIN"
      }
    }
  );

  console.log("Password Reset Success");
  process.exit();

});