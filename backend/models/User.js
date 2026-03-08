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
  savedProductIDs: [String], // array of ObjectIds referencing Product documents
});

module.exports = mongoose.model("User", UserSchema);
