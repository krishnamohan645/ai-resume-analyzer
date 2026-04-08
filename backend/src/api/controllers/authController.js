const authService = require("../services/authService");

const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      throw new Error("All fields are required");
    }
    const result = await authService.register({ name, email, password });
    res.status(201).json({
      message: "User registered successfully",
      ...result,
    });
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }
    const result = await authService.login({ email, password });
    res.status(200).json({
      message: "User logged in successfully",
      ...result,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login };
