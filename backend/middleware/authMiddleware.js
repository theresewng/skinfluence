// const jwt = require("jsonwebtoken");

// function verifyToken(req, res, next) {
//   console.log("VERIFY TOKEN HIT"); // 👈 top
//   const authHeader = req.headers.authorization;
//   if (!authHeader) return res.status(401).json({ error: "Access denied" });

//   const token = authHeader.startsWith("Bearer ")
//     ? authHeader.split(" ")[1]
//     : authHeader;

//   try {
//     const decoded = jwt.verify(
//       token,
//       process.env.JWT_SECRET || "fallbackSecret",
//     );
//     req.userId = decoded.id;
//     req.userRole = decoded.role;
//     console.log("DECODED:", decoded); // 👈 should show role
//     next();
//   } catch (err) {
//     res.status(401).json({ error: "Invalid token" });
//   }
// }
// 1️⃣ Get Authorization header
// const authHeader = req.headers.authorization;
//   console.log("HEADER:", authHeader);
//   console.log("VERIFY TOKEN CALLED");

//   if (!authHeader) {
//     return res.status(401).json({ error: "Access denied" });
//   }

//   const token = authHeader.startsWith("Bearer ")
//     ? authHeader.split(" ")[1]
//     : authHeader;

//   try {
//     const decoded = jwt.verify(
//       token,
//       process.env.JWT_SECRET || "fallbackSecret",
//     );

//     req.userId = decoded.id;
//     req.userRole = decoded.role;

//     console.log("DECODED:", decoded);
//     next();
//   } catch (error) {
//     res.status(401).json({ error: "Invalid token" });
//   }
// }

// module.exports = verifyToken;

const jwt = require("jsonwebtoken");

function verifyToken(req, res, next) {
  // 1️⃣ Get Authorization header
  const authHeader = req.headers.authorization;
  console.log("=== verifyToken called ===");
  console.log("Authorization header:", authHeader);

  if (!authHeader) {
    console.log("No authorization header found");
    return res.status(401).json({ error: "Access denied" });
  }

  const token = authHeader.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : authHeader;

  console.log("Token extracted:", token);

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "fallbackSecret",
    );
    console.log("Decoded token:", decoded);

    // attach to request
    req.userId = decoded.id;
    req.userRole = decoded.role;

    console.log("req.userId set to:", req.userId);
    console.log("req.userRole set to:", req.userRole);

    next();
  } catch (error) {
    console.log("Token verification failed:", error.message);
    res.status(401).json({ error: "Invalid token" });
  }
}

module.exports = verifyToken;
