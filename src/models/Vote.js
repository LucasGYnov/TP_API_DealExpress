const mongoose = require("mongoose");

const voteSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["hot", "cold"],
      required: true,
    },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    item: { type: mongoose.Schema.Types.ObjectId, ref: "Item", required: true },
  },
  { timestamps: { createdAt: "createdAt" } }
);

const Vote = mongoose.model("Vote", voteSchema);

module.exports = Vote;
