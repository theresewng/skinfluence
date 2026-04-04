require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const commentRoutes = require("./routes/comments");

const productRoutes = require("./routes/products");
const ingredientRoutes = require("./routes/ingredients");
const authRoutes = require("./routes/auth");

const app = express();
const PORT = 5000;

// CORS middleware
app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// Preflight handler for all routes
app.options("/", (req, res) => res.sendStatus(200));

app.use(express.json());

// request logger (optional but helpful)
app.use((req, res, next) => {
  console.log(req.method, req.url);
  next();
});

app.use((req, res, next) => {
  console.log("Incoming:", req.method, req.url);
  next();
});

// routes
app.use("/api/products", productRoutes);
app.use("/api/ingredients", ingredientRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/comments", commentRoutes);

// database connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error(err));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
