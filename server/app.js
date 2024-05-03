const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const session = require("express-session");
const jwt = require("jsonwebtoken");

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

// verifying jwt
const verifyJWT = (req, res, next) => {
  const token = req.headers["token"];
  if (!token) {
    res.send("We need token to authenticate");
  } else {
    console.log("token received from frontend: ", token);
    // validating token
    jwt.verify(token, secretKey, (err, decoded) => {
      if (err) {
        res.json({ auth: false, message: "Invalid token" });
      } else {
        console.log("token validated");
        req.userId = decoded.id;
        next();
      }
    });
  }
};

// route handler to check if user is authenticated using JWT
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
  db.query(
    "SELECT * FROM users WHERE  username=?",
    username,
    (error, result) => {
      // if there is a database error
      if (error) {
        res.json({ auth: false, err: error });
      }

      // if user is found
      if (result.length > 0) {
        // compare passwords
        bcrypt.compare(
          password,
          result[0].password,
          function (err, bcryptResult) {
            // result == true
            if (bcryptResult) {
              const id = result[0].userId;
              const token = jwt.sign({ id }, secretKey, {
                expiresIn: 300,
              });
              req.session.user = result;
              console.log("req.session.user: ", req?.session?.user);
              console.log("password matches");
              res.json({
                auth: true,
                token,
                result,
              });
            } else {
              res.json({ auth: false, message: "wrong password" });
            }
          }
        );
      }
      // if no user found with given credentials
      else {
        res.json({ auth: false, message: "Username dont exist" });
      }
    }
  );
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
