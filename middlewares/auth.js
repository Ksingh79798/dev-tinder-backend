// /* eslint-disable no-undef */
// const jwt = require("jsonwebtoken");
// const User = require("../models/user");
// require("dotenv").config();
// const PASSWORD = process.env.PASSWORD;

// const userAuth = async (req, res, next) => {
//   try {
//     // const cookies = req.cookies;
//     const { token } = req.cookies;
//     console.log("token", token);

//     if (!token) {
//       return res.status(401).send("Please Login");
//     }
//     const decodemsg = await jwt.verify(token, PASSWORD);
//     console.log("decodemsg", decodemsg);

//     const { _id } = decodemsg;
//     const user = await User.findById(_id);
//     if (!user) {
//       throw new Error("user not found");
//     }
//     // res.send(user);
//     req.user = user; /* I have just attached of user into request */
//     next();
//   } catch (err) {
//     res.status(400).send("ERROR:" + err.message);
//   }
// };

// module.exports = {
//   userAuth,
// };

const jwt = require("jsonwebtoken");
const User = require("../models/user");
require("dotenv").config();
const PASSWORD = process.env.PASSWORD;

const userAuth = async (req, res, next) => {
  try {
    // Get token from cookies or Authorization header
    let token = req?.cookies?.token;
    console.log("Token:----", token);

    // Check Authorization header if no cookie token
    if (!token && req.headers.authorization) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication required. Please login.",
      });
    }

    try {
      const decoded = await jwt.verify(token, PASSWORD);
      const user = await User.findById(decoded._id);
      console.log("hiiii");
      if (!user) {
        return res.status(401).json({
          success: false,
          message: "User not found",
        });
      }

      // Attach user to request object
      req.user = user;
      next();
    } catch (error) {
      if (error.name === "JsonWebTokenError") {
        return res.status(401).json({
          success: false,
          message: "Invalid token",
        });
      }
      if (error.name === "TokenExpiredError") {
        return res.status(401).json({
          success: false,
          message: "Token expired",
        });
      }
      throw error;
    }
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Authentication error",
      error: err.message,
    });
  }
};

module.exports = {
  userAuth,
};
