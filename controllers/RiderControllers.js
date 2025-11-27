import * as RiderModel from "../models/RiderModel.js";

export const GetAll = async (req, res) => {
  try {
    const users = await RiderModel.getUser();
    res.status(200).json({ success: true, users });
  } catch (e) {
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const register = async (req, res) => {
  const { username, password } = req.body;

  try {
    const newUser = await RiderModel.createUser(username, password);
    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: newUser,
    });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
};

export const login = async (req, res) => {
  const { username, password } = req.body;

  try {
    const data = await RiderModel.login(username, password);
    res.status(200).json({
      success: true,
      token: data.token,
      id: data.id,
    });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
};
