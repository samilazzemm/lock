// // // const express = require("express");
// // // const mongoose = require("mongoose");
// // // const cors = require("cors");
// // // const axios = require("axios");
// // // require("dotenv").config(); // Load environment variables

// // // const doorRoutes = require("./routes/doorRoutes");
// // // const userRoutes = require("./routes/authRoutes");

// // // const app = express();
// // // app.use(express.json());

// // // // ✅ Allow requests only from your ngrok frontend
// // // const allowedOrigin = "https://smartdoorlocksys.netlify.app"; // Replace with your actual frontend URL
// // // app.use(cors({
// // //   origin: allowedOrigin,
// // //   methods: ["GET", "POST", "PUT", "DELETE"],
// // //   allowedHeaders: ["Content-Type", "Authorization"],
// // // }));

// // // // ✅ MongoDB connection
// // // mongoose.connect(process.env.MONGO_URI, {
// // //   useNewUrlParser: true,
// // //   useUnifiedTopology: true,
// // // })
// // // .then(() => console.log("✅ Connected to MongoDB"))
// // // .catch((err) => console.error("❌ MongoDB connection error:", err));

// // // // ✅ API Routes
// // // app.use("/api/doors", doorRoutes);
// // // app.use("/api/auth", userRoutes);

// // // // ✅ ESP32 LED Control
// // // const ESP32_IP = "192.168.43.6"; // Replace with your ESP32's IP
// // // app.post("/api/doors/led/:state", async (req, res) => {
// // //   const state = req.params.state;

// // //   try {
// // //     const response = await axios.get(`http://${ESP32_IP}/led/${state}`, { timeout: 1000 });
// // //     res.json({ message: `LED ${state.toUpperCase()}`, espResponse: response.data });
// // //   } catch (error) {
// // //     console.error("❌ ESP32 Error:", error.message);
// // //     res.status(500).json({
// // //       error: "ESP32 not responding",
// // //       details: error.message || error,
// // //     });
// // //   }
// // // });

// // // // ✅ Start server
// // // const PORT = process.env.PORT || 5000;
// // // app.listen(PORT, () => {
// // //   console.log(`🚀 Server running at http://localhost:${PORT}`);
// // // });
// // const express = require("express");
// // const mongoose = require("mongoose");
// // const cors = require("cors");
// // const axios = require("axios");
// // require("dotenv").config(); // Load environment variables

// // const doorRoutes = require("./routes/doorRoutes");
// // const userRoutes = require("./routes/authRoutes");

// // const app = express();
// // app.use(express.json());

// // // ✅ CORS - Allow specific frontend origin
// // const allowedOrigin = process.env.FRONTEND_URL || "https://smartdoorlocksys.netlify.app";
// // app.use(cors({
// //   origin: allowedOrigin,
// //   methods: ["GET", "POST", "PUT", "DELETE"],
// //   allowedHeaders: ["Content-Type", "Authorization"],
// // }));

// // // ✅ MongoDB connection
// // const MONGO_URI = process.env.MONGO_URI;
// // if (!MONGO_URI) {
// //   console.error("❌ MONGO_URI is not set in environment variables.");
// //   process.exit(1);
// // }

// // mongoose.connect(MONGO_URI)
// //   .then(() => console.log("✅ Connected to MongoDB"))
// //   .catch((err) => {
// //     console.error("❌ MongoDB connection error:", err.message);
// //     process.exit(1);
// //   });

// // // ✅ API Routes
// // app.use("/api/doors", doorRoutes);
// // app.use("/api/auth", userRoutes);

// // // ✅ ESP32 LED Control
// // const ESP32_IP = process.env.ESP32_IP || "192.168.43.6"; // From .env or fallback
// // app.post("/api/doors/led/:state", async (req, res) => {
// //   const state = req.params.state;

// //   try {
// //     const response = await axios.get(`http://${ESP32_IP}/led/${state}`, { timeout: 1000 });
// //     res.json({ message: `LED ${state.toUpperCase()}`, espResponse: response.data });
// //   } catch (error) {
// //     console.error("❌ ESP32 Error:", error.message);
// //     res.status(500).json({
// //       error: "ESP32 not responding",
// //       details: error.message,
// //     });
// //   }
// // });

// // // ✅ Start server
// // const PORT = process.env.PORT || 5000;
// // app.listen(PORT, () => {
// //   console.log(`🚀 Server running at http://localhost:${PORT}`);
// // });
// const express = require("express");
// const mongoose = require("mongoose");
// const cors = require("cors");
// const axios = require("axios");
// require("dotenv").config(); // Load environment variables

// const doorRoutes = require("./routes/doorRoutes");
// const userRoutes = require("./routes/authRoutes");

// const app = express();
// app.use(express.json());

// // CORS - Allow specific frontend origin
// const allowedOrigin = process.env.FRONTEND_URL || "https://smartdoorlocksys.netlify.app";
// app.use(cors({
//   origin: allowedOrigin,
//   methods: ["GET", "POST", "PUT", "DELETE"],
//   allowedHeaders: ["Content-Type", "Authorization"],
// }));

// // MongoDB connection
// mongoose.connect(process.env.MONGO_URI)
//   .then(() => console.log("Connected to MongoDB"))
//   .catch((err) => {
//     console.error("MongoDB connection error:", err.message);
//     process.exit(1);
//   });

// // API Routes
// app.use("/api/doors", doorRoutes);
// app.use("/api/auth", userRoutes);

// // ESP32 LED Control
// const ESP32_IP = process.env.ESP32_IP || "192.168.43.6";
// app.post("/api/doors/led/:state", async (req, res) => {
//   const state = req.params.state;
//   try {
//     const response = await axios.get(`http://${ESP32_IP}/led/${state}`, { timeout: 1000 });
//     res.json({ message: `LED ${state.toUpperCase()}`, espResponse: response.data });
//   } catch (error) {
//     console.error("ESP32 Error:", error.message);
//     res.status(500).json({ error: "ESP32 not responding", details: error.message });
//   }
// });

// // Start server
// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//   console.log(`Server running at http://localhost:${PORT}`);
// });
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const axios = require("axios");
require("dotenv").config();
const authMiddleware = require('./middleware/authMiddleware');

const app = express();
app.use(express.json());

// CORS Config
const allowedOrigin = process.env.FRONTEND_URL;
app.use(cors({
  origin: allowedOrigin,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"], 
  credentials: true
}));

//

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch(err => {
    console.error("❌ MongoDB error:", err);
    process.exit(1);
  });

// Routes
const logRoutes = require('./routes/logsRoutes');
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next(); // Don't forget next()!
});
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/doors", require("./routes/doorRoutes"));
//
app.use('/api/logs', logRoutes);

// ESP32 LED Control
const ESP32_IP = process.env.ESP32_IP;

app.post("/api/doors/led/:state", async (req, res) => {
  try {
    const { state } = req.params;
    const response = await axios.get(`http://${ESP32_IP}/led/${state}`, { timeout: 1000 });
    res.json({ message: `LED ${state.toUpperCase()}`, response: response.data });
  } catch (err) {
    console.error("❌ ESP32 Error:", err.message);
    res.status(500).json({ error: "ESP32 not responding", details: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
