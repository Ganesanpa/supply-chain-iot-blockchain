const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

const connectDB = require("./config/db");
const User = require("./models/User");

const authRoutes = require("./routes/authRoutes");
const batchRoutes = require("./routes/batchRoutes");
const adminRoutes = require("./routes/adminRoutes");
const alertRoutes = require("./routes/alertRoutes");





dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// ✅ CREATE DEFAULT ADMIN
const createAdmin = async () => {
  try {
    const existing = await User.findOne({ email: "admin@scm.com" });

   if (!existing) {
      const admin = new User({
        name: "admin",
        email: "admin@scm.com",
        password: "admin123", // will be hashed automatically
        role: "admin",
        status: "approved",
      });

      await admin.save();

      console.log("✅ Admin created");
    } else {
      console.log("ℹ️ Admin already exists");
    }
  } catch (error) {
    console.error("❌ Error creating admin:", error.message);
  }
};

// Routes
app.get("/", (req, res) => {
  res.send("Farm Supply Chain Backend Running 🚜");
});

app.use("/api/auth", authRoutes);
app.use("/api/batches", batchRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/alerts", alertRoutes);
const PORT = process.env.PORT || 5000;

// ✅ START SERVER PROPERLY
const startServer = async () => {
  try {
    await connectDB(); // 🔥 wait for DB connection

    await createAdmin(); // 🔥 run after DB connected

 app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
  
});

  } catch (error) {
    console.error("❌ Startup error:", error.message);
    process.exit(1);
  }
  
};

startServer();