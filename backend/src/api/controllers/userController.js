const userService = require("../services/userService");

const getMyProfile = async (req, res, next) => {
  try {
    const user = await userService.getMyProfile(req.user.id);
    res.status(200).json({
      message: "User profile fetched successfully",
      user,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getMyProfile };
