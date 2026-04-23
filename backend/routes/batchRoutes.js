const express = require("express");
const router = express.Router();
const Batch = require("../models/Batch");
const { protect } = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");
const Alert = require("../models/Alert");
const User = require("../models/User");

// ================= HELPER =================
const isValidLocation = (lat, lng) => {
  return (
    lat !== undefined &&
    lng !== undefined &&
    lat !== null &&
    lng !== null &&
    !isNaN(lat) &&
    !isNaN(lng) &&
    Number(lat) !== 0 &&
    Number(lng) !== 0
  );
};
const getValidCoords = (lat, lng) => {
  const parsedLat = Number(lat);
  const parsedLng = Number(lng);

  if (
    !isNaN(parsedLat) &&
    !isNaN(parsedLng) &&
    parsedLat >= -90 &&
    parsedLat <= 90 &&
    parsedLng >= -180 &&
    parsedLng <= 180 &&
    parsedLat !== 0 &&
    parsedLng !== 0
  ) {
    return { lat: parsedLat, lng: parsedLng };
  }

  return null;
};

const getUserFallbackLocation = async (userId) => {
  const user = await User.findById(userId).select("location");
  if (!user || !user.location) return null;

  const parsedLat = Number(user.location.lat);
  const parsedLng = Number(user.location.lng);

  if (
    !isNaN(parsedLat) &&
    !isNaN(parsedLng) &&
    parsedLat >= -90 &&
    parsedLat <= 90 &&
    parsedLng >= -180 &&
    parsedLng <= 180 &&
    parsedLat !== 0 &&
    parsedLng !== 0
  ) {
    return { lat: parsedLat, lng: parsedLng };
  }

  return null;
};

// ================= CREATE BATCH =================
router.post(
  "/create",
  protect,
  authorizeRoles("farmer"),
  async (req, res) => {
    try {
      const { product, quantity, harvestDate, deviceId, lat, lng } = req.body;

      const batch = new Batch({
        product,
        quantity,
        harvestDate,
        deviceId,
        stage: "distributor",
        history: ["farmer", "distributor"],
        timestamps: {
          farmer: new Date().toLocaleString(),
          distributor: new Date().toLocaleString(),
        },
        isActive: false,
        trackingStartedAt: null,
        trackingEndedAt: null,
        locationHistory: [],
        eventHistory: [
          {
            action: "created",
            stage: "farmer",
            by: req.user.id,
            role: req.user.role,
            note: "Batch created by farmer",
            timestamp: new Date(),
          },
        ],
      });

      // 1. Try browser location from request
      let finalLocation = getValidCoords(lat, lng);
      let source = "browser";

      // 2. If browser location missing, use registered user location
      if (!finalLocation) {
        finalLocation = await getUserFallbackLocation(req.user.id);
        source = "registered";
      }

      // 3. Save if any valid location exists
      if (finalLocation) {
        batch.location = finalLocation;

        batch.locationHistory.push({
          lat: finalLocation.lat,
          lng: finalLocation.lng,
          stage: "farmer",
          source,
          timestamp: new Date(),
        });
      }

      await batch.save();

      console.log("📦 Batch created:", batch._id);

      res.status(201).json(batch);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// ================= GET ALL BATCHES =================
router.get("/", protect, async (req, res) => {
  const batches = await Batch.find();
  res.json(batches);
});


// ================= GET ACTIVE BATCH =================
router.get("/active/current", async (req, res) => {
  try {
    const batch = await Batch.findOne({ isActive: true });

    if (!batch) {
      return res.status(404).json({ message: "No active batch" });
    }

   res.json({
  _id: batch._id,
  product: batch.product,
  temperature: batch.temperature || 0,
  humidity: batch.humidity || 0,
  vibration: batch.vibration || 0,
  location: batch.location || { lat: 0, lng: 0 },
  locationHistory: batch.locationHistory || [],
  stage: batch.stage,
  isActive: batch.isActive
});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// ================= ACTIVATE BATCH =================
router.put("/:id/activate", async (req, res) => {
  try {
    const batch = await Batch.findById(req.params.id);

    if (!batch) {
      return res.status(404).json({ message: "Batch not found" });
    }

    if (batch.stage === "delivered") {
      return res.status(400).json({
        message: "Delivered batch cannot be activated"
      });
    }

    await Batch.updateMany({ isActive: true }, { isActive: false });

    batch.isActive = true;
    batch.trackingStartedAt = new Date();
    batch.trackingEndedAt = null;

    await batch.save();

    res.json({
      message: "Batch activated for tracking",
      batch
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// ================= DEACTIVATE BATCH =================
router.put("/:id/deactivate", async (req, res) => {
  try {
    const batch = await Batch.findById(req.params.id);

    if (!batch) {
      return res.status(404).json({ message: "Batch not found" });
    }

    batch.isActive = false;
    batch.trackingEndedAt = new Date();

    await batch.save();

    res.json({
      message: "Batch deactivated",
      batch
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// ================= SENSOR (ACTIVE BATCH) =================
router.put("/sensor/active", async (req, res) => {
  try {
   let { temperature, humidity, vibration, light, lat, lng } = req.body;
  // 🔥 PRINT RAW DATA FROM ESP32
    console.log("📡 Incoming Sensor Data:");
    console.log("🌡 Temperature:", temperature);
    console.log("💧 Humidity:", humidity);
    console.log("📳 Vibration:", vibration);
    console.log("📍 Latitude:", lat);
    console.log("📍 Longitude:", lng);
    const batch = await Batch.findOne({ isActive: true });

    if (!batch) {
      return res.status(404).json({ message: "No active batch found" });
    }

    // ✅ Sensor updates
    if (!isNaN(temperature)) batch.temperature = temperature;
    if (!isNaN(humidity)) batch.humidity = humidity;
    if (vibration !== undefined) batch.vibration = vibration;
    if (!isNaN(light)) batch.light = light;
    // ✅ GPS handling
    if (isValidLocation(lat, lng)) {
      const parsedLat = Number(lat);
      const parsedLng = Number(lng);

      batch.location = { lat: parsedLat, lng: parsedLng };

      const lastLocation =
        batch.locationHistory?.[batch.locationHistory.length - 1];

      const shouldStoreHistory =
        !lastLocation ||
        Math.abs(lastLocation.lat - parsedLat) > 0.0005 ||
        Math.abs(lastLocation.lng - parsedLng) > 0.0005 ||
        lastLocation.stage !== batch.stage;

      if (shouldStoreHistory) {
        batch.locationHistory.push({
          lat: parsedLat,
          lng: parsedLng,
          stage: batch.stage,
          source: "gps",
          timestamp: new Date()
        });
      }
    }

    await batch.save();

    // ✅ Alerts
    if (temperature > 35)
      await Alert.create({ batchId: batch._id, type: "Temperature", message: "High temp" });

    if (humidity > 80)
      await Alert.create({ batchId: batch._id, type: "Humidity", message: "High humidity" });

    if (vibration === 1)
      await Alert.create({ batchId: batch._id, type: "Vibration", message: "Shock detected" });

    if (light > 50) {
  await Alert.create({
    batchId: batch._id,
    type: "Light",
    message: "Possible package opened or light exposure detected"
  });
}
    console.log("📥 Sensor updated:", batch._id);

    res.json({ message: "Sensor data updated", batchId: batch._id });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ================= UPDATE STAGE =================
router.put("/:id/stage", protect, async (req, res) => {
  try {
    const { stage, lat, lng } = req.body;
    const nextStage = stage.toLowerCase();

    const batch = await Batch.findById(req.params.id);

    if (!batch) {
      return res.status(404).json({ message: "Batch not found" });
    }

    const role = req.user.role.toLowerCase();

    if (
      (nextStage === "warehouse" && role !== "distributor") ||
      (nextStage === "retailer" && role !== "warehouse") ||
      (nextStage === "delivered" && role !== "retailer")
    ) {
      return res.status(403).json({
        message: "Not allowed to perform this stage update",
      });
    }

    batch.stage = nextStage;
    batch.history.push(nextStage);
    batch.timestamps[nextStage] = new Date().toLocaleString();

    batch.eventHistory = batch.eventHistory || [];
    batch.eventHistory.push({
      action: nextStage === "delivered" ? "delivered" : "transferred",
      stage: nextStage,
      by: req.user.id,
      role: req.user.role,
      note:
        nextStage === "delivered"
          ? "Batch marked as delivered"
          : `Batch moved to ${nextStage}`,
      timestamp: new Date(),
    });

    // 1. Try browser location from request
    let finalLocation = getValidCoords(lat, lng);
    let source = "browser";

    // 2. If browser location missing, use registered user location
    if (!finalLocation) {
      finalLocation = await getUserFallbackLocation(req.user.id);
      source = "registered";
    }

    // 3. Save checkpoint if any valid location exists
    if (finalLocation) {
      batch.location = finalLocation;

      batch.locationHistory.push({
        lat: finalLocation.lat,
        lng: finalLocation.lng,
        stage: nextStage,
        source,
        timestamp: new Date(),
      });
    }

    // Stop tracking if delivered
    if (nextStage === "delivered") {
      batch.isActive = false;
      batch.trackingEndedAt = new Date();

      batch.blockchain = {
        txHash: "0x" + Math.random().toString(16).substring(2, 10),
        blockNumber: Math.floor(Math.random() * 100000),
        digitalSignature: "SIG-" + Date.now(),
      };
    }

    await batch.save();

    res.json(batch);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ================= GET SINGLE BATCH =================
router.get("/:id", async (req, res) => {
  try {
    const batch = await Batch.findById(req.params.id)
      .populate("eventHistory.by", "name email role"); // 🔥 IMPORTANT

    if (!batch) {
      return res.status(404).json({ message: "Batch not found" });
    }

    res.json(batch);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// ================= MANUAL LOCATION UPDATE =================
router.put("/:id/location", protect, async (req, res) => {
  try {
    const { lat, lng } = req.body;

    const batch = await Batch.findById(req.params.id);

    if (!batch) {
      return res.status(404).json({ message: "Batch not found" });
    }

    if (isValidLocation(lat, lng)) {
      const parsedLat = Number(lat);
      const parsedLng = Number(lng);

      batch.location = { lat: parsedLat, lng: parsedLng };

      batch.locationHistory.push({
        lat: parsedLat,
        lng: parsedLng,
        stage: batch.stage,
        source: "manual",
        timestamp: new Date()
      });
    }

    await batch.save();

    res.json(batch);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


module.exports = router;