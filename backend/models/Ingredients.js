const mongoose = require("mongoose");

const IngredientSchema = new mongoose.Schema({
  name: {
    type: String,
    default: "Unknown Product",
  },
  short_description: {
    type: String,
  },
  what_is_it: {
    type: String,
  },
  what_does_it_do: {
    type: String,
  },
  who_is_it_good_for: {
    type: String,
  },
  who_should_avoid: {
    type: String,
  },
});

module.exports = mongoose.model("Ingredient", IngredientSchema);
