import jwt from "jsonwebtoken";

const authMiddleware = (req, res, next) => {
  const authHeaders = req.headers.authorization;
  if (!authHeaders || !authHeaders.startsWith("Bearer")) {
    return res.status(400).json({
      message: "Token is Missing",
    });
  }

  const token = authHeaders.split(" ")[1];

  //   console.log("Token", token);

  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY_TOKEN);
    req.userId = decoded.id;

    console.log("userToken", req.userId);
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

export { authMiddleware };
