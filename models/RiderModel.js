import pool from "../config/db.js";
import validator from "validator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const getUser = async () => {
  const [rows] = await pool.query("SELECT * FROM tbrider");
  return rows;
};

export const createUser = async (username, password) => {
  if (!username || !password) {
    const error = new Error("Username and Password are required");
    error.statusCode = 400;
    throw error;
  }

  if (!validator.isStrongPassword(password, { minLength: 8, minNumbers: 1, minSymbols: 1 })) {
    const error = new Error("Password is not strong enough");
    error.statusCode = 400;
    throw error;
  }

  const hashedPassword = bcrypt.hashSync(password, 10);

  const [result] = await pool.query(
    "INSERT INTO tbrider(username, password) VALUES (?, ?)",
    [username, hashedPassword]
  );

  return { id: result.insertId };
};

export const login = async (username, password) => {
  const [rows] = await pool.query("SELECT * FROM tbrider WHERE username = ?", [username]);
  const rider = rows[0];

  if (!rider) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  const isMatch = bcrypt.compareSync(password, rider.password);
  if (!isMatch) {
    const error = new Error("Incorrect password");
    error.statusCode = 400;
    throw error;
  }

  const token = jwt.sign({ id: rider.id }, process.env.SECRET, { expiresIn: "1d" });

  return {
    token,
    id: rider.id,
  };
};

export const getUserById = async (ID) => {
  const [rows] = await pool.query("SELECT * FROM tbrider WHERE id = ?", [ID]);
  return rows[0];
};
