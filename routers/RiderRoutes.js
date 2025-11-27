import express from "express";
import * as RiderController from "../controllers/RiderControllers.js";

const RiderRoutes = express.Router();

RiderRoutes.get("/all", RiderController.GetAll);
RiderRoutes.post("/register", RiderController.register);
RiderRoutes.post("/login", RiderController.login);

export default RiderRoutes;
