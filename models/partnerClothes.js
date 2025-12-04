// Api/models/partnerClothes.js
import mongoose from "mongoose";
const { Schema } = mongoose;

const PartnerClothSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },

    image: {
      type: String,
      trim: true,
      default: "https://yourcdn.com/default-cloth.jpg"
    },

    color: { type: String, required: true, trim: true },
    
    category: { 
      type: String, 
      required: true, 
      enum: ['dress', 'shirt', 'pants', 'jacket', 'skirt', 'top', 'shorts',
             'suit', 'blazer', 'sweater', 'coat', 'tshirt', 'frock',
             'saree', 'kurta', 'lehenga'],
      trim: true 
    },

    
    brand: { type: String, required: true, trim: true },

    price: { type: Number, default: 0, min: 0 },

    stock: { type: Number, default: 0, min: 0 },

    description: { type: String, trim: true, default: "" },

    occasion: [{
      type: String,
      enum: ["casual", "formal", "business", "party", "wedding", "sports", "beach"]
    }],

    suitableSkinTones: [{
      type: String,
      enum: ["fair", "light", "medium", "tan", "deep", "dark"]
    }],

    size: { type: String, trim: true, default: "" },

    gender: {
      type: String,
      enum: ["male", "female", "unisex"],
      default: "unisex",
      trim: true
    },

    ownerType: { type: String, enum: ["partner"], default: "partner" },

    ownerId: {
      type: Schema.Types.ObjectId,
      ref: "Partner",
      required: true,
      index: true,
    },

    visibility: {
      type: String,
      enum: ["public", "private"],
      default: "public"
    },

    views: [{
      stylerId: {
        type: Schema.Types.ObjectId,
        ref: "Styler",
        required: true
      },
      viewedAt: {
        type: Date,
        default: Date.now
      }
    }],
  },
  { timestamps: true }
);

// Add validation for occasion array (1-4 items)
PartnerClothSchema.path('occasion').validate(function(value) {
  return value && value.length >= 1 && value.length <= 4;
}, 'Please select between 1 and 4 occasions');


PartnerClothSchema.index({ name: "text", color: "text", category: "text", brand: "text" });
PartnerClothSchema.index({ price: 1 });
PartnerClothSchema.index({ visibility: 1, ownerType: 1, createdAt: -1 });

export const PartnerCloth = mongoose.model("PartnerCloth", PartnerClothSchema);
