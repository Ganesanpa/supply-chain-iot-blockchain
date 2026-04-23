const mongoose = require("mongoose");

const alertSchema = new mongoose.Schema({
  batchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Batch"
  },

  type: String,
  message: String,

  timestamp: {
    type: Date,
    default: Date.now
  }

});

module.exports = mongoose.model("Alert", alertSchema);