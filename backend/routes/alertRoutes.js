const express = require("express");
const router = express.Router();
const Alert = require("../models/Alert");

// CREATE ALERT
router.post("/", async (req, res) => {
  try {
    const alert = new Alert(req.body);
    await alert.save();

    res.json(alert);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET ALERTS BY BATCH
router.get("/:batchId", async (req, res) => {
  const alerts = await Alert.find({ batchId: req.params.batchId })
    .sort({ timestamp: -1 });

  res.json(alerts);
});

module.exports = router;