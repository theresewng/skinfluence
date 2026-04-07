const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const verifyToken = require("../middleware/authMiddleware");

// GET ROUTE (Public - Anyone can see plants)s
// router.get("/", async (req, res) => {
//   try {
//     const limit = req.query.limit ? parseInt(req.query.limit) : null;
//     const skip = parseInt(req.query.skip) || 0;

//     let query = Product.find().skip(skip);

//     if (limit) {
//       query = query.limit(limit);
//     }

//     const products = await query;

//     res.json(products);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// router.get("/", async (req, res) => {
//   try {
//     const { limit, skip = 0, search = "" } = req.query;

//     const parsedLimit = limit ? parseInt(limit) : null;
//     const parsedSkip = parseInt(skip);

//     // 🔥 Build search query
//     const query = search
//       ? {
//           $or: [
//             { productName: { $regex: search, $options: "i" } },
//             { brand: { $regex: search, $options: "i" } },
//             { category: { $regex: search, $options: "i" } },
//           ],
//         }
//       : {};

//     let dbQuery = Product.find(query).skip(parsedSkip);

//     if (parsedLimit) {
//       dbQuery = dbQuery.limit(parsedLimit);
//     }

//     const products = await dbQuery;

//     res.json(products);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// GET all unique brands
router.get("/brands/all", async (req, res) => {
  try {
    const brands = await Product.distinct("brand");
    res.json(brands);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const { limit, skip = 0, search = "", brand = "" } = req.query;

    const parsedLimit = limit ? parseInt(limit) : null;
    const parsedSkip = parseInt(skip);

    const query = {
      ...(search && {
        $or: [
          { productName: { $regex: search, $options: "i" } },
          { brand: { $regex: search, $options: "i" } },
          { category: { $regex: search, $options: "i" } },
        ],
      }),
      ...(brand && { brand: { $regex: `^${brand}$`, $options: "i" } }), // use regex for case-insensitive match
    };

    let dbQuery = Product.find(query).skip(parsedSkip);

    if (parsedLimit) {
      dbQuery = dbQuery.limit(parsedLimit);
    }

    const products = await dbQuery;

    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET SINGLE PRODUCT BY ID
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/", verifyToken, async (req, res) => {
  try {
    const newProduct = new Product(req.body);
    await newProduct.save();
    res.status(201).json(newProduct);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE ROUTE (protected - only logged in users)
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Product deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
