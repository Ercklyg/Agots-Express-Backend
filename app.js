import cors from "cors";
import "dotenv/config.js";
import express from "express";
import http from "http";
import path from "path";
import { Server } from "socket.io";

import AnalyticsRoutes from "./routers/AnalyticsRoutes.js";
import announcementsRoutes from "./routers/AnnouncementRoutes.js";
import DashboardRoutes from "./routers/DashboardRoutes.js";
import feedbackRoutes from "./routers/FeedbackRoutes.js";
import landingRoutes from "./routers/LandingRoutes.js";
import menuRoutes from "./routers/MenuRoutes.js";
import RiderRoutes from "./routers/RiderRoutes.js";
import StatsRoutes from "./routers/StatsRoutes.js";
import UsersRoutes from "./routers/UserRoutes.js";
import customerRoutes from "./routers/CustomerRoutes.js";
import StaffRoutes from "./routers/StaffRoutes.js";
import cartRoutes from "./routers/CartRoutes.js";
import orderRoutes from "./routers/OrderRoutes.js";

const app = express();
const server = http.createServer(app);

// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});
app.locals.io = io;

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);
  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

// Middlewares
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// Routes
app.use("/users", UsersRoutes); // user management
app.use("/rider", RiderRoutes); // rider endpoints
app.use("/api/feedback", feedbackRoutes);
app.use("/stats", StatsRoutes);
app.use("/dashboard", DashboardRoutes);
app.use("/api/announcements", announcementsRoutes);
app.use("/analytics", AnalyticsRoutes);
app.use("/api", menuRoutes);
app.use("/landing", landingRoutes);
app.use("/customer", customerRoutes);
app.use("/staff", StaffRoutes); // Staff endpoints
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
