import cors from "cors";
import "dotenv/config.js";
import express from "express";
import StatsRoutes from "./routers/StatsRoutes.js";
import UsersRoutes from "./routers/UserRoutes.js";
import DashboardRoutes from "./routers/DashboardRoutes.js";

const app = express();

app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());

app.use("/users", UsersRoutes);
app.use("/stats", StatsRoutes);
app.use("/dashboard", DashboardRoutes);

app.listen(process.env.PORT || 5000, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
