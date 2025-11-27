// controllers/UsersController.js
import * as UserModel from "../models/UserModel.js";

/* GET ALL USERS */
export const getAll = async (req, res) => {
  try {
    const users = await UserModel.getAllUsers();
    res.status(200).json({ success: true, users });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

/* REGISTER */
export const register = async (req, res) => {
  const { username, password, role, first_name, email, phone } = req.body;

  try {
    const data = await UserModel.registerUser(
      username,
      password,
      role,
      first_name,
      email,
      phone
    );

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: data,
    });

  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
};

/* LOGIN */
export const login = async (req, res) => {
  const { username, password } = req.body;

  try {
    const data = await UserModel.loginUser(username, password);

    res.status(200).json({
      success: true,
      token: data.token,
      id: data.id,
      role: data.role,
      username: data.username,
    });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
};
