// models/stylerClothes.js
import mongoose from "mongoose";
const { Schema } = mongoose;

const StylerClothesSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    image: { type: String, trim: true },
    color: { type: String, required: true, trim: true },
    category: { 
      type: String, 
      required: true, 
      enum: ['dress', 'shirt', 'pants', 'jacket', 'skirt', 'top', 'shorts', 
             'suit', 'blazer', 'sweater', 'coat', 'tshirt', 'frock',
             'saree', 'kurta', 'lehenga', 'churidar', 'kurti', 'gown', 
             'salwar suit', 'anarkali', 'bridal wear', 'party wear', 
             'crop top & skirt', 'tops & tunics', 't-shirt', 'jean pants', 
             'palazzo', 'leggings', 'jackets / shrugs', 'nightwear', 
             'maternity wear', 'abaya / burkha', 'men\'s shirt', 
             'men\'s t-shirt', 'men\'s trouser', 'jeans', 'joggers', 
             'hoodies', 'sweatshirts', 'sherwani', 'ethnic wear', 
             'kids casual wear', 'newborn dress'],
      trim: true 
    },

    skinTone: [{ 
      type: String, 
      enum: ["fair", "light", "medium", "tan", "deep", "dark"],
      trim: true 
    }],

    gender: { 
      type: String, 
      enum: ["male", "female", "unisex"],
      trim: true 
    },

    age: { type: Number, min: 0, max: 120 },

    price: { type: Number, default: 0, min: 0 },

    usageCount: { type: Number, default: 0, min: 0 },

    occasion: [{
      type: String,
      enum: ["casual", "formal", "business", "party", "wedding", "sports", "beach"]
    }],

    note: { type: String, trim: true, default: "" },

    ownerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
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

// Add validation for occasion array (1-4 items)
StylerClothesSchema.path('occasion').validate(function(value) {
  return value && value.length >= 1 && value.length <= 4;
}, 'Please select between 1 and 4 occasions');

StylerClothesSchema.index({ ownerId: 1, category: 1 });

export const StylerClothes = mongoose.model("StylerClothes", StylerClothesSchema);
