// models/stylerClothes.js
import mongoose from "mongoose";
const { Schema } = mongoose;

const StylerClothesSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    image: { type: String, trim: true },
    color: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },

    skinTone: { 
      type: String, 
      enum: ["fair", "light", "medium", "tan", "deep", "dark"],
      trim: true 
    },

    gender: { 
      type: String, 
      enum: ["male", "female", "unisex"],
      trim: true 
    },

    age: { type: Number, min: 0, max: 120 },

    price: { type: Number, default: 0, min: 0 },

    usageCount: { type: Number, default: 0, min: 0 },

    occasion: {
      type: String,
      enum: ["casual", "formal", "business", "party", "wedding", "sports", "beach"],
      default: "casual",
      trim: true
    },

    note: { type: String, trim: true, default: "" },

    ownerId: {
      type: Schema.Types.ObjectId,
      ref: "Styler",
      required: true,
      index: true
    },

    visibility: {
      type: String,
      enum: ["private"],
      default: "private"
    },
  },
  { timestamps: true }
);

StylerClothesSchema.index({ ownerId: 1, category: 1 });

export const StylerClothes = mongoose.model("StylerClothes", StylerClothesSchema);
