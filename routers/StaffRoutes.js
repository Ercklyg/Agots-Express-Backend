import express from "express";
import * as StaffController from "../controllers/StaffControllers.js";

const StaffRoutes = express.Router();

StaffRoutes.get("/all", StaffController.GetAll);
StaffRoutes.post("/register", StaffController.register);
StaffRoutes.post("/login", StaffController.login);

export default StaffRoutes;
