const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
  },

  {
    timestamps: true,
    indexes: [{ email: 1 }, { username: 1 }],
  }
);

// Helper methods
userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  return {
    id: user._id,
    username: user.username,
    email: user.email,
    userAmounts: user.userAmounts,
    dateAmounts: user.dateAmounts,
    createdAt: user.createdAt,
  };
};

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
