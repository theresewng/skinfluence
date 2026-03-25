const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true, // no two users can have the same name
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    // enum guarantees that ONLY these specific strings can be saved
    enum: ["user", "admin"],
    default: "user", // every new registration automatically gets the lowest privilege
  },
  
  savedProductIDs: [String], // array of Product IDs as strings
  savedIngredientIDs: [String],
});

module.exports = mongoose.model("User", UserSchema);
