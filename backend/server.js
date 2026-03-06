require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const productRoutes = require("./routes/products");
const authRoutes = require("./routes/auth");

const app = express();
const PORT = 5000;

// middleware
app.use(cors({ origin: "http://localhost:3000" }));
app.use(express.json());

// request logger (optional but helpful)
app.use((req, res, next) => {
  console.log(req.method, req.url);
  next();
});

// routes
app.use("/api/products", productRoutes);
app.use("/api/auth", authRoutes);

// database connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error(err));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
