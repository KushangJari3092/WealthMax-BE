const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    // required: true 
  },
  razorpay_payment_id: { 
    type: String, 
    // required: true 
  },
  razorpay_order_id: { 
    type: String, 
    // required: true 
  },
  amount: { 
    type: Number, 
    required: true 
  },
  status: { 
    type: String, 
    enum: ["success", "failed"], 
    default: "success" 
  },
  type: { 
    type: String, 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
});

module.exports = mongoose.model("Transaction", transactionSchema);