const { createToken } = require("./utils/auth/JWT");
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const session = require("express-session");
const jwt = require("jsonwebtoken");
const { verifyJWT } = require("./utils/auth/JWT");

// configuration for dotenv
require("dotenv").config();

//secret key
const secretKey = "jwtsecret";
// bcrypt setup
const bcrypt = require("bcrypt");
const saltRounds = 10;

const app = express();

// whilelisted origins
const whitelist = ["http://localhost:5173", "http://example2.com"];

// configuring cors option
const corsOption = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  // optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204,
  methods: ["GET", "PUT", "POST"],
  credentials: true,
};

app.use(cors(corsOption));

// configuring session option
const sessionOption = {
  key: "userId",
  secret: "keyboard",
  resave: false,
  saveUninitialized: false,
  cookie: {
    expires: 1000 * 60 * 5, // 15 seconds
  },
};

// cookie-parser
app.use(cookieParser([]));

// body-parser
// parse application/json
app.use(bodyParser.json());

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// creating session
app.use(session(sessionOption));

// we need to use express.json() in order to work with object passed from frontend in route handler
app.use(express.json());

const mysql = require("mysql");

const port = 3000;

// integration with database
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "react-authentication",
});

// route handler for register
app.post("/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  // inserting into table in database
  bcrypt.hash(password, saltRounds, function (err, hash) {
    // Store hash in your password DB.
    db.query(
      "INSERT INTO users (username, password) VALUES(?, ?)",
      [username, hash],
      (error, result) => {
        if (!error) {
          res.send("inserted to the database successfully");
        } else {
          console.log("error in database: ", error);
          res.send({ err: error });
        }
      }
    );
  });
});

// route handler to check if user is authenticated using JWT
// protected route
app.get("/isAuth", verifyJWT, (req, res) => {
  res.send("User Authenticated");
});

// get route handler for login
app.get("/login", (req, res) => {
  if (req.session.user) {
    res.send({ loggedIn: true, user: req.session.user });
  } else {
    res.send({ loggedIn: false });
  }
});

// post route handler for login
app.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  // selecting from table in database
  try {
    db.query(
      "SELECT * FROM users WHERE  username=?",
      username,
      (error, result) => {
        // if there is a database error

        if (error) {
          res.status(500).json({ auth: false, error });
          return;
        }
        // if user is found
        if (result?.length > 0) {
          // compare passwords
          bcrypt.compare(
            password,
            result[0].password,
            function (err, bcryptResult) {
              // result == true
              if (bcryptResult) {
                const user = result[0];
                const accessToken = createToken(user);
                // store the user data in session
                res.cookie("accesstoken", accessToken, {
                  maxAge: 1000 * 60 * 10, // 10 minute
                });
                res.status(200).json({
                  auth: true,
                  accessToken,
                  result,
                });
                return;
              } else {
                res
                  .status(400)
                  .json({ auth: false, message: "wrong password" });
                return;
              }
            }
          );
        }
        // if no user found with given credentials
        else {
          res.status(400).json({ auth: false, message: "Username dont exist" });
        }
      }
    );
  } catch (e) {
    console.error(`Error in loginUser ${e}`);
    res.status(500).json({ error: e });
  }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
