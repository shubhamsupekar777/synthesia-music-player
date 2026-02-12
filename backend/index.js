import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/connectDB.js";
import router from "./routes/authRoutes.js";
import songRouter from "./routes/songRoutes.js";
dotenv.config(".env");
const PORT = process.env.PORT || 5001;

const app = express();
app.use(express.json());

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);

// connect your Database
connectDB();

app.use("/api/songs", songRouter);
app.use("/api/auth", router);

app.listen(PORT, () => console.log(`Server is running on Port ${PORT}`));
