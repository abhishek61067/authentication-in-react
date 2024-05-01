import { useState } from "react";
import Axios from "axios";

const Register = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleFormSubmit = (e) => {
    e.preventDefault();
    // post request
    Axios.post("http://localhost:3000/register", { username, password })
      .then((res) => {
        console.log(res?.data ?? "response data not found");
        alert(res?.data ?? "response data not found");
      })
      .catch((e) => {
        console.log("error in axios: ", e);
      });
  };

  return (
    <div>
      <h1>Register</h1>
      <form action="" onSubmit={handleFormSubmit}>
        <label htmlFor="username">Username:</label>
        <br />
        <input
          id="username"
          type="text"
          name="username"
          required
          onChange={(e) => {
            setUsername(e.target.value);
          }}
        />
        <br />
        <label htmlFor="password">Password:</label>
        <br />
        <input
          id="password"
          type="password"
          name="password"
          required
          onChange={(e) => {
            setPassword(e.target.value);
          }}
        />
        <br />
        <input type="submit" />
      </form>
    </div>
  );
};

export default Register;
