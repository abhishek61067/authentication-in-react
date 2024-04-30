const express = require("express");
const cors = require("cors");
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
  db.query(
    "INSERT INTO users (username, password) VALUES(?, ?)",
    [username, password],
    (error, result) => {
      console.log("error in database: ", error);
      if (!error) {
        res.send("inserted to the database successfully");
      }
    }
  );
});

// route handler for login
app.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  // selecting from table in database
  db.query(
    "SELECT * FROM users WHERE  username=? AND password=?",
    [username, password],
    (error, result) => {
      // if there is a database error
      if (error) {
        res.send({ err: error });
      }

      // if user is found
      if (result.length > 0) {
        res.send(result);
      }
      // if no user found with given credentials
      else {
        res.send({ message: "Invalid Username or Password" });
      }
    }
  );
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
