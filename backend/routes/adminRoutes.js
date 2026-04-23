// routes/adminRoutes.js
const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { protect } = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

// ✅ Get all users
router.get("/users", protect, authorizeRoles("admin"), async (req, res) => {
  const users = await User.find();
  res.json(users);
});

// ✅ Approve user
router.patch("/approve/:id", protect, authorizeRoles("admin"), async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) return res.status(404).json({ message: "User not found" });

  user.status = "approved";
  await user.save();

  res.json({ message: "User approved" });
});

// ✅ Reject user
router.delete("/reject/:id", protect, authorizeRoles("admin"), async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ message: "User rejected" });
});

module.exports = router;