import User from "../models/user.js";

// Get user profile info
const getUserInfo = async (req, res, next) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);
    res.status(200).json({
      message: "User fetched successfuly",
      data: user,
    });
  } catch (err) {
    next(err);
  }
};

// update user profile information
const updateUserInfo = async (req, res, next) => {
  try {
    const updatedData = req.body;

    const user = await User.findByIdAndUpdate(req.userId, updatedData, {
      new: true,
    });

    res.status(200).json({
      message: "User updated successfully",
      data: user,
    });
  } catch (err) {
    next(err);
  }
};

export { getUserInfo, updateUserInfo };
