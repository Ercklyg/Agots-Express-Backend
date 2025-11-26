import express from "express";
import * as AdminController from "../controllers/AdminControllers.js";

const AdminRoutes = express.Router();

AdminRoutes.get("/all", AdminController.Getall);
AdminRoutes.post("/register", AdminController.register);
AdminRoutes.post("/login", AdminController.login);

//testing

export default AdminRoutes;
