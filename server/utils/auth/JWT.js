const { sign, verify } = require("jsonwebtoken");

// create token
const createToken = (user) => {
  const tokenSecret = process.env.SECRET_KEY;
  const accessToken = sign(
    { username: user.username, id: user.userid },
    tokenSecret
  );
  return accessToken;
};

// verify token
// verifying jwt
const verifyJWT = (req, res, next) => {
  const tokenSecret = process.env.SECRET_KEY;
  try {
    const token = req.cookies["accesstoken"];
    if (!token) {
      res.send("We need token to authenticate");
    } else {
      console.log("token received from frontend: ", token);
      // validating token
      verify(token, tokenSecret, (err, decoded) => {
        if (err) {
          res.json({ auth: false, message: "Invalid token" });
        } else {
          console.log("token validated");
          req.userId = decoded.id;
          next();
        }
      });
    }
  } catch (e) {
    console.log("error in verifyJWT: ", e);
    res.status(500).json({
      auth: false,
      error: e.message,
      message: "Internal Server Error",
    });
  }
};

module.exports = { createToken, verifyJWT };
