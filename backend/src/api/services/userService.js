const User = require("../models/userModel");

const getMyProfile = async (userId) => {
  const user = await User.findByPk(userId, {
    attributes: { exclude: ["password"] },
  });

  if (!user) {
    throw new Error("User not found");
  }

  return user;
};

module.exports = { getMyProfile };
