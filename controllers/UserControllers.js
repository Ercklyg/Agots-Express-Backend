// controllers/UsersController.js
import * as UserModel from "../models/UserModel.js";
import bcrypt from "bcryptjs";

/* GET ALL USERS */
export const getAll = async (req, res) => {
  try {
    const users = await UserModel.getAllUsers();
    // Return users without exposing password
    const sanitizedUsers = users.map((u) => ({
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

/* REGISTER */
export const register = async (req, res) => {
  const { username, password, role, first_name, email, phone, address } =
    req.body;

  try {
    // Hash password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    const data = await UserModel.registerUser(
      username,
      hashedPassword,
      role,
      first_name,
      email,
      phone,
      address
    );

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: {
        id: data.id,
        username: data.username,
        role: data.role,
        first_name: data.first_name,
        email: data.email,
        phone: data.phone,
        address: data.address,
        created_at: data.created_at,
      },
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

    if (!user) throw new Error("Invalid username or password");

    // Compare hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new Error("Invalid username or password");

    // Optionally: generate JWT token here
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
