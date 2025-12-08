import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const { Schema } = mongoose;

const UserSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["styler", "partner", "admin"],
      required: true,
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
    favorites: [{
      type: Schema.Types.ObjectId,
      ref: "PartnerCloth"
    }],
    name: {
      type: String,
    },
    location: {
      type: String,
    },
    phone: {
      type: String,
    },
    profilePhoto: {
      type: String,
    },
    skinTone: {
      type: String,
      enum: ['fair', 'light', 'medium', 'tan', 'deep', 'dark', 'reddish', 'olive', 'pale'],
    },
    skinToneDetectedAt: {
      type: Date,
    },
    preferredStyle: {
      type: String,
    },
  },
  { timestamps: true }
);

// Hash password before saving
UserSchema.pre("save", async function (next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified("password")) return next();

  try {
    // Hash password with cost of 10
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

UserSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

UserSchema.set("toJSON", { virtuals: true });

export const User = mongoose.model("User", UserSchema);

// Function to drop old accountId index (call this after DB connection)
export const dropAccountIdIndex = async () => {
  try {
    if (mongoose.connection.readyState === 1) {
      const collection = mongoose.connection.collection("users");
      const indexes = await collection.indexes();
      const accountIdIndex = indexes.find(idx => 
        idx.key && idx.key.accountId !== undefined
      );
      
      if (accountIdIndex) {
        await collection.dropIndex(accountIdIndex.name);
        console.log("✓ Dropped old accountId index");
      }
    }
  } catch (error) {
    // Index might not exist, which is fine
    if (error.code !== 27 && error.codeName !== "IndexNotFound") {
      console.error("Error dropping accountId index:", error.message);
    }
  }
};
 