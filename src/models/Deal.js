const mongoose = require("mongoose");

const dealSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      minlength: [5, "Title must be at least 5 characters"],
      maxlength: [100, "Title cannot exceed 100 characters"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      minlength: [10, "Description must be at least 10 characters"],
      maxlength: [500, "Description cannot exceed 500 characters"],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },
    orignalPrice: {
      type: Number,
      required: [true, "Original Price is required"],
      min: [0, "Original Price cannot be negative"],
    },
    url: {
      type: String,
      required: [true, "URL is required"],
      trim: true,
    },
    category: {
      type: String,
      enum: ["High-Tech", "Maison", "Mode", "Loisirs", "Autres"],
      required: [true, "Category is required"],
      trim: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    temperature: {
      type: Number,
      default: 0,
      required: true,
    },
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: { createdAt: "createdAt" } }
);

module.exports = mongoose.model("Deal", dealSchema);
