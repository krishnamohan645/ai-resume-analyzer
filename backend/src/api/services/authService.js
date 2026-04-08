const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const generateToken = (user) => {
  return jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};
const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

const register = async ({ name, email, password }) => {
  const existingUser = await User.findOne({ where: { email } });

  if (existingUser) {
    throw new Error("User already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = await User.create({ name, email, password: hashedPassword });
  const token = generateToken(newUser);

  return {
    token,
    user: { id: newUser.id, name: newUser.name, email: newUser.email },
  };
};

const login = async ({ email, password }) => {
  const user = await User.findOne({ where: { email } });

  if (!user) {
    throw new Error("Invalid Credentials");
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error("Invalid credentials");
  }

  const token = generateToken(user);

  return {
    token,
    user: { id: user.id, name: user.name, email: user.email },
  };
};

module.exports = { register, login, generateToken, verifyToken };
