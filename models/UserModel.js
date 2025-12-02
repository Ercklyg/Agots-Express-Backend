import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import validator from "validator";
import pool from "../config/db.js";

// ---------------------- REGISTER USER ----------------------
export const registerUser = async (
  username,
  password, // plain password from controller
  role,
  first_name,
  email,
  phone,
  address
) => {
  if (!username || !password || !role)
    throw new Error("Username, Password and Role are required");

  // Optional email validation
  if (email) {
    if (!validator.isEmail(email)) {
      throw new Error("Invalid email format");
    }

    // Stricter Gmail validation using regex
    const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    if (!gmailRegex.test(email)) {
      throw new Error("Email must be a valid Gmail address (example@gmail.com)");
    }
  }

  // Password strength validation
  if (
    !validator.isStrongPassword(password, {
      minLength: 8,
      minNumbers: 1,
      minSymbols: 1,
    })
  ) {
    throw new Error("Weak password. Must include 8 chars, 1 number, 1 symbol.");
  }

  // Hash password inside the model
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


// ---------------------- LOGIN USER ----------------------
export const loginUser = async (username) => {
  const [rows] = await pool.query(
    "SELECT * FROM users WHERE username = ? LIMIT 1",
    [username]
  );

  const user = rows[0];
  if (!user) throw new Error("User not found");

  return user; // password is hashed
};

// ---------------------- GENERATE JWT ----------------------
export const generateToken = (payload) => {
  return jwt.sign(payload, process.env.SECRET, { expiresIn: "1d" });
};
