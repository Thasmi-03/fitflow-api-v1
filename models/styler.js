import mongoose from "mongoose";
const { Schema } = mongoose;

const StylerSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    bio: { type: String, trim: true },
    gender: { type: String, enum: ["male", "female", "other"], default: "other" },
    dateOfBirth: { type: Date },
    country: { type: String, trim: true },
    skinTone: { type: String, enum: ["fair", "medium", "dark"] },
    role: { type: String, enum: ["styler", "admin"], default: "styler" },
  },
  { timestamps: true }
);

// Virtual field to calculate age from dateOfBirth
StylerSchema.virtual('age').get(function() {
  if (!this.dateOfBirth) return null;
  const today = new Date();
  const birthDate = new Date(this.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
});

// Ensure virtual fields are included when converting to JSON
StylerSchema.set('toJSON', { virtuals: true });
StylerSchema.set('toObject', { virtuals: true });

export const Styler = mongoose.model("Styler", StylerSchema);
