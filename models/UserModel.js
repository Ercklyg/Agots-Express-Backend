// models/usersModel.js
import pool from "../config/db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import validator from "validator";

// TABLE: users
// id | username | password | role | first_name | email | phone | created_at

/* ---------------------- REGISTER USER ---------------------- */
export const registerUser = async (username, password, role, first_name, email, phone) => {
  if (!username || !password || !role)
    throw new Error("Username, Password and Role are required");

  // optional fields for customer (others can be NULL)
  if (email && !validator.isEmail(email)) {
    throw new Error("Invalid email format");
  }

  if (
    !validator.isStrongPassword(password, {
      minLength: 8,
      minNumbers: 1,
      minSymbols: 1,
    })
  ) {
    throw new Error("Weak password. Must include 8 chars, 1 number, 1 symbol.");
  }

  const hashedPassword = bcrypt.hashSync(password, 10);

  const [result] = await pool.query(
    `INSERT INTO users (username, password, role, first_name, email, phone)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [username, hashedPassword, role, first_name, email, phone]
  );

  return { id: result.insertId };
};

/* ---------------------- LOGIN USER ---------------------- */
export const loginUser = async (username, password) => {
  const [rows] = await pool.query(
    "SELECT * FROM users WHERE username = ? LIMIT 1",
    [username]
  );

  const user = rows[0];
  if (!user) throw new Error("User not found");

  const isMatch = bcrypt.compareSync(password, user.password);
  if (!isMatch) throw new Error("Incorrect password");

  const token = jwt.sign(
    { id: user.id, role: user.role },
    process.env.SECRET,
    { expiresIn: "1d" }
  );

  return {
    token,
    id: user.id,
    role: user.role,
    username: user.username,
  };
};

/* ---------------------- GET USER BY ID ---------------------- */
export const getUserById = async (id) => {
  const [rows] = await pool.query("SELECT * FROM users WHERE id = ?", [id]);
  return rows[0];
};

/* ---------------------- GET ALL USERS ---------------------- */
export const getAllUsers = async () => {
  const [rows] = await pool.query("SELECT * FROM users ORDER BY id DESC");
  return rows;
};
