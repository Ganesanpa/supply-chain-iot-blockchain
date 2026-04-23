const express = require("express");
const router = express.Router();
const User = require("../models/User");

const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
// REGISTER
// 

router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role, address, lat, lng } = req.body;

    const existing = await User.findOne({ email });

    if (existing) {
      return res.status(400).json({
        message: "Email already registered",
      });
    }

    const user = new User({
      name,
      email,
      password,
      role,
      address,
      status: "pending", // ✅ good to be explicit
      location: {
        lat: lat ?? null,
        lng: lng ?? null,
      },
    });

    // 🔥 THIS WAS MISSING
    await user.save();

    res.status(201).json({
      message: "Registration successful. Wait for admin approval.",
      user,
    });

  } catch (error) {
    console.log("REGISTER ERROR:", error);
    res.status(500).json({
      error: error.message,
    });
  }
});
// LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // Compare hashed password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }

    if (user.status !== "approved") {
      return res.status(403).json({
        message: "Account not approved"
      });
    }

    // 🔐 CREATE TOKEN
    const token = jwt.sign(
      {
        id: user._id,
      role: user.role.toLowerCase()
      },
       process.env.JWT_SECRET, // later move to .env
      { expiresIn: "1d" }
    );

    res.json({
      message: "Login success",
      token,
      user: {
        id: user._id,
        role: user.role,
        name: user.name
      }
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;