const mongoose = require("mongoose");

const batchSchema = new mongoose.Schema({

  product: {
    type: String,
    required: true
  },

  quantity: {
    type: Number,
    required: true
  },

  harvestDate: String,

  stage: {
    type: String,
    default: "distributor"
  },

  freshness: {
    type: String,
    default: "Fresh"
  },

  history: {
    type: [String],
    default: ["farmer"]
  },

  timestamps: {
    type: Object,
    default: {}
  },

  location: {
    lat: Number,
    lng: Number
  },

  // ✅ ADD THESE
  temperature: {
    type: Number,
    default: 0
  },

  humidity: {
    type: Number,
    default: 0
  },

  vibration: {
    type: Number,
    default: 0
  },
  light: {
  type: Number,
  default: 0
},

  blockchain: {
    txHash: String,
    blockNumber: Number,
    digitalSignature: String
  },

  isActive: {
    type: Boolean,
    default: false
  },

  trackingStartedAt: {
    type: Date,
    default: null
  },

  trackingEndedAt: {
    type: Date,
    default: null
  },
eventHistory: [
  {
    action: String,
    stage: String,
   by: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "User"
},
    role: String,
    note: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }
],

deviceId: {
  type: String,
  default: null
},
locationHistory: [
  {
    lat: Number,
    lng: Number,
    stage: String,
    source: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }
],


}, { timestamps: true });

module.exports = mongoose.model("Batch", batchSchema);