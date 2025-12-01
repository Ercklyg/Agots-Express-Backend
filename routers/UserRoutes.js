import express from "express";
import * as UsersController from "../controllers/UserControllers.js";

const UsersRoutes = express.Router();

// ------------------- USERS -------------------
UsersRoutes.get("/all", UsersController.getAll);
UsersRoutes.post("/register", UsersController.register);
UsersRoutes.post("/login", UsersController.login);



export default UsersRoutes;
