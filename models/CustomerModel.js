import pool from "../config/db.js";
import validator from "validator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// GET ALL CUSTOMERS
export const getCustomers = async () => {
  const [rows] = await pool.query("SELECT * FROM tbcustomer");
  return rows;
};

// REGISTER CUSTOMER
export const createCustomer = async (f_name, email, p_num, username, password) => {
  if (!f_name || !email || !p_num || !username || !password) {
    const error = new Error("All fields are required");
    error.statusCode = 400;
    throw error;
  }

  if (!validator.isEmail(email)) {
    const error = new Error("Invalid email format");
    error.statusCode = 400;
    throw error;
  }

  if (!validator.isMobilePhone(p_num, "any")) {
    const error = new Error("Invalid phone number");
    error.statusCode = 400;
    throw error;
  }

  if (username.length < 4) {
    const error = new Error("Username must be at least 4 characters");
    error.statusCode = 400;
    throw error;
  }

  if (
    !validator.isStrongPassword(password, {
      minLength: 8,
      minNumbers: 1,
      minSymbols: 1,
    })
  ) {
    const error = new Error("Password is not strong enough");
    error.statusCode = 400;
    throw error;
  }

  const hashedPassword = bcrypt.hashSync(password, 10);

  const [result] = await pool.query(
    `INSERT INTO tbcustomer 
    (f_name, email, p_num, username, password) 
    VALUES (?, ?, ?, ?, ?)`,
    [f_name, email, p_num, username, hashedPassword]
  );

  return { id: result.insertId };
};

// LOGIN CUSTOMER
export const login = async (username, password) => {
  const [rows] = await pool.query(
    "SELECT * FROM tbcustomer WHERE username = ?",
    [username]
  );

  const customer = rows[0];

  if (!customer) {
    const error = new Error("Customer not found");
    error.statusCode = 404;
    throw error;
  }

  const isMatch = bcrypt.compareSync(password, customer.password);

  if (!isMatch) {
    const error = new Error("Incorrect password");
    error.statusCode = 400;
    throw error;
  }

  const token = jwt.sign(
    { id: customer.id },
    process.env.SECRET,
    { expiresIn: "1d" }
  );

  return {
    token,
    id: customer.id,
    username: customer.username,
    f_name: customer.f_name,
    email: customer.email,
    p_num: customer.p_num,
  };
};

// GET CUSTOMER BY ID
export const getCustomer = async (ID) => {
  const [rows] = await pool.query(
    "SELECT * FROM tbcustomer WHERE id = ?",
    [ID]
  );
  return rows[0];
};
