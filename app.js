import cors from "cors";
import "dotenv/config.js";
import express from "express";
import announcementsRoutes from "./routers/AnnouncementRoutes.js";
import DashboardRoutes from "./routers/DashboardRoutes.js";
import feedbackRoutes from "./routers/FeedbackRoutes.js";
import menuRoutes from "./routers/MenuRoutes.js"; // Import menu routes
import StatsRoutes from "./routers/StatsRoutes.js";
import UsersRoutes from "./routers/UserRoutes.js";

const app = express();

app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());

app.use("/users", UsersRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/stats", StatsRoutes);
app.use("/dashboard", DashboardRoutes);
app.use("/api/announcements", announcementsRoutes);

app.use("/api", menuRoutes); // Add the new menu routes

app.listen(process.env.PORT || 5000, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
