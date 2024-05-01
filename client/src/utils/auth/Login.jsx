import { useState } from "react";
import Axios from "axios";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginStatus, setLoginStatus] = useState("");

  const handleFormSubmit = (e) => {
    e.preventDefault();
    // post request
    Axios.post("http://localhost:3000/login", { username, password })
      .then((res) => {
        console.log(res.data);
        if (res.data.message || res.data.err) {
          setLoginStatus(res.data.message || res.data.err);
        } else {
          setLoginStatus(res.data[0].username);
        }
      })
      .catch((e) => {
        console.log("error in axios: ", e);
      });
  };

  return (
    <div>
      <h1>Login</h1>
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
        <br />
        <br />
        <h2>{loginStatus}</h2>
      </form>
    </div>
  );
};

export default Login;
