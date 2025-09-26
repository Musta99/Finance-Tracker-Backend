import User from "../models/user.js";
import jwt from "jsonwebtoken";

const signUp = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and Password are required",
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(401).json({
        message: "Email Already in use",
      });
    }

    const user = new User({ email, password });
    await user.save();

    res.status(201).json({
      message: "Account is created successfully",
      data: {
        id: user._id,
        email: user.email,
      },
    });
  } catch (err) {
    next(err);
  }
};

const logIn = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        message: "Please provide Email and Passoword",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        message: "You dont have account with this Email",
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid Password",
      });
    }

    const generatedToken = jwt.sign(
      {
        id: user._id,
      },
      process.env.SECRET_KEY_TOKEN,
      { expiresIn: 60 * 60 }
    );

    res.status(200).json({
      message: "Successfully logged in",
      data: {
        id: user._id,
        email: user.email,
        token: generatedToken,
      },
    });
  } catch (err) {
    next(err);
  }
};

export { signUp, logIn };
