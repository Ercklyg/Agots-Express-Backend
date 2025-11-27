import * as CustomerModel from "../models/CustomerModel.js";

// GET ALL
export const GetAll = async (req, res) => {
  try {
    const customers = await CustomerModel.getCustomers();
    res.status(200).json({ success: true, customers });
  } catch (e) {
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// REGISTER CUSTOMER
export const register = async (req, res) => {
  const { f_name, email, p_num, username, password } = req.body;

  try {
    const newCustomer = await CustomerModel.createCustomer(
      f_name,
      email,
      p_num,
      username,
      password
    );

    res.status(201).json({
      success: true,
      message: "Customer registered successfully",
      customer: newCustomer,
    });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
};

// LOGIN CUSTOMER
export const login = async (req, res) => {
  const { username, password } = req.body;

  try {
    const data = await CustomerModel.login(username, password);

    res.status(200).json({
      success: true,
      token: data.token,
      id: data.id,
      username: data.username,
      f_name: data.f_name,
      email: data.email,
      p_num: data.p_num,
    });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
};
