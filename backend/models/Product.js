// const mongoose = require("mongoose");

// const PlantSchema = new mongoose.Schema({
//   commonName: {
//     type: String,
//     default: "Unknown Plant",
//   },
//   family: {
//     type: String,
//   },
//   category: {
//     type: String,
//   },
//   origin: {
//     type: String,
//   },
//   climate: {
//     type: String,
//   },
//   imgUrl: {
//     type: String,
//   },
// });

// module.exports = mongoose.model("Plant", PlantSchema);


const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
  productName: {
    type: String,
    default: "Unknown Product",
  },
  brand: {
    type: String,
  },
  usageType: {
    type: String,
  },
  category: {
    type: String,
  },
  ingredients: {
    type: String,
  },
  imageURL: {
    type: String,
  },
});

module.exports = mongoose.model("Product", ProductSchema);
