import cors from "cors";
import "dotenv/config.js";
import express from "express";
import AdminRoutes from "./routers/AdminRoutes.js";
import CustomerRoutes from "./routers/CustomerRoutes.js";
import StaffRoutes from "./routers/StaffRoutes.js";
import RiderRoutes from "./routers/RiderRoutes.js";

const app = express();

const corsOptions = {
  origin: "http://localhost:5173", // your frontend
  credentials: true,
};

// ✅ MUST COME BEFORE routes
app.use(cors(corsOptions));
app.use(express.json());

// Routes
app.use("/admin", AdminRoutes);
app.use("/customer", CustomerRoutes);
app.use("/staff", StaffRoutes);
app.use("/rider", RiderRoutes);

app.listen(process.env.PORT || 5000, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
