const express = require("express");
const cors = require("cors");

// bcrypt setup
const bcrypt = require("bcrypt");
const saltRounds = 10;

const app = express();
app.use(cors());
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

// route handlers
app.get("/users", (req, res) => {
  res.send("Users!");
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

// route handler for login
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
        res.send({ err: error });
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
              console.log("password matches");
              res.send(result);
            } else {
              console.log("password didnt match");
              res.send({ message: "wrong password" });
            }
          }
        );
      }
      // if no user found with given credentials
      else {
        res.send({ message: "Username dont exist" });
      }
    }
  );
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
