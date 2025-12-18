import mongoose from "mongoose";
const { Schema } = mongoose;

const WearHistorySchema = new Schema(
  {
    dressId: {
      type: Schema.Types.ObjectId,
      ref: "StylerClothes",
      required: true,
      index: true
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    wornAt: {
      type: Date,
      required: true,
      default: Date.now
    },
    color: {
      type: String,
      required: true,
      trim: true
    },
    category: {
      type: String,
      required: true,
      trim: true
    }
  },
  { timestamps: true }
);

// Index for efficient querying
WearHistorySchema.index({ userId: 1, wornAt: -1 });
WearHistorySchema.index({ category: 1 });
WearHistorySchema.index({ color: 1 });

export const WearHistory = mongoose.model("WearHistory", WearHistorySchema);
