// models/usersModel.js
import pool from "../config/db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import validator from "validator";

// TABLE: users
// id | username | password | role | first_name | email | phone | address | created_at

/* ---------------------- REGISTER USER ---------------------- */
export const registerUser = async (
  username,
  password,
  role,
  first_name,
  email,
  phone,
  address
) => {
  if (!username || !password || !role)
    throw new Error("Username, Password and Role are required");

  // Optional validation
  if (email && !validator.isEmail(email)) throw new Error("Invalid email format");

  if (
    !validator.isStrongPassword(password, {
      minLength: 8,
      minNumbers: 1,
      minSymbols: 1,
    })
  ) {
    throw new Error(
      "Weak password. Must include 8 chars, 1 number, 1 symbol."
    );
  }

  const hashedPassword = bcrypt.hashSync(password, 10);

  const [result] = await pool.query(
    `INSERT INTO users (username, password, role, first_name, email, phone, address)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [username, hashedPassword, role, first_name, email, phone, address]
  );

  return {
    id: result.insertId,
    username,
    role,
    first_name,
    email,
    phone,
    address,
  };
};

/* ---------------------- LOGIN USER ---------------------- */
export const loginUser = async (username) => {
  const [rows] = await pool.query(
    "SELECT * FROM users WHERE username = ? LIMIT 1",
    [username]
  );

  const user = rows[0];
  if (!user) throw new Error("User not found");

  // Password comparison will be handled in controller
  return user;
};

/* ---------------------- GENERATE JWT ---------------------- */
export const generateToken = (payload) => {
  return jwt.sign(payload, process.env.SECRET, { expiresIn: "1d" });
};

/* ---------------------- GET USER BY ID ---------------------- */
export const getUserById = async (id) => {
  const [rows] = await pool.query("SELECT * FROM users WHERE id = ?", [id]);
  return rows[0];
};

/* ---------------------- GET ALL USERS ---------------------- */
export const getAllUsers = async () => {
  const [rows] = await pool.query(
    "SELECT id, username, role, first_name, email, phone, address, created_at FROM users ORDER BY id DESC"
  );
  return rows;
};

/* ---------------------- UPDATE USER ---------------------- */
export const updateUser = async (id, data) => {
  const { first_name, email, phone, address, password } = data;

  // If password is updated, hash it
  let hashedPassword = null;
  if (password) hashedPassword = bcrypt.hashSync(password, 10);

  const [result] = await pool.query(
    `UPDATE users 
     SET first_name = ?, email = ?, phone = ?, address = ?, ${hashedPassword ? "password = ?" : ""} 
     WHERE id = ?`,
    hashedPassword
      ? [first_name, email, phone, address, hashedPassword, id]
      : [first_name, email, phone, address, id]
  );

  return result.affectedRows > 0;
};
