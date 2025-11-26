import jwt from "jsonwebtoken";
import * as UserModel from "../models/UserModel.js";

const authHandler = async (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization) {
    res.status(401).json({
      success: false,
      message: [{ result: "You do not have permission to acces the app." }],
    });
  }
  const token = authorization.split(" ")[1];

  try {
    const { ID } = jwt.verify(token, process.env.SECRET);
    const user = await UserModel.getUser(ID);
    // req.user = user.ID;

    next();
  } catch (err) {
    res.status(401).json({
      success: false,
      message: [{ result: "Request is unauthorized." }],
    });
  }
};

export default authHandler;
