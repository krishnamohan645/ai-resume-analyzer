require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { connectDB } = require("./src/config/database");
const analyzeRoutes = require("./src/api/routes/analyzeRoutes");
const authRoutes = require("./src/api/routes/authRoutes");
const userRoutes = require("./src/api/routes/userRoutes");

const app = express();

app.set("trust proxy", 1);

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "https://ai-resume-analyzer-ruddy-one.vercel.app",
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/analyze", analyzeRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Something went wrong" });
});

// console.log(require("crypto").randomBytes(64).toString("hex"));

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  console.log("Database connected successfully");
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
