import bcrypt from "bcryptjs";
import * as UserModel from "../models/UserModel.js";

/* REGISTER */
export const register = async (req, res) => {
  const { username, password, role, first_name, email, phone, address } =
    req.body;

  try {
    const data = await UserModel.registerUser(
      username,
      password, // plain password
      role,
      first_name,
      email,
      phone,
      address
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
    const user = await UserModel.loginUser(username);

    // Compare plain password with hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new Error("Invalid username or password");

    const token = UserModel.generateToken({ id: user.id, role: user.role });

    res.status(200).json({
      success: true,
      token,
      id: user.id,
      role: user.role,
      username: user.username,
      first_name: user.first_name,
      email: user.email,
      phone: user.phone,
      address: user.address,
    });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
};

/* GET ALL USERS */
export const getAll = async (req, res) => {
  try {
    const [rows] = (await UserModel.getAllUsers?.()) || [];
    const sanitizedUsers = rows.map((u) => ({
      id: u.id,
      username: u.username,
      role: u.role,
      first_name: u.first_name,
      email: u.email,
      phone: u.phone,
      address: u.address,
      created_at: u.created_at,
    }));

    res.status(200).json({ success: true, users: sanitizedUsers });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};
