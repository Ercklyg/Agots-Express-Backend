import express from "express";
import * as CustomerController from "../controllers/CustomerController.js";

const CustomerRoutes = express.Router();

CustomerRoutes.get("/all", CustomerController.GetAll);
CustomerRoutes.post("/register", CustomerController.register);
CustomerRoutes.post("/login", CustomerController.login);

export default CustomerRoutes;
