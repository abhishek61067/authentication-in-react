import { useEffect, useState } from "react";
import Axios from "axios";
Axios.defaults.withCredentials = true;

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginStatus, setLoginStatus] = useState(false);

  const handleFormSubmit = (e) => {
    e.preventDefault();
    // post request
    Axios.post("http://localhost:3000/login", { username, password })
      .then((res) => {
        console.log(res.data);
        if (!res.data.auth) {
          setLoginStatus(false);
        } else {
          setLoginStatus(true);
          localStorage.setItem("token", res.data.token);
        }
      })
      .catch((e) => {
        console.log("error in axios: ", e);
      });
  };

  const userAuthenticated = () => {
    console.log("user authenticated btn clicked");
    Axios.get("http://localhost:3000/isAuth", {
      headers: {
        "x-access-token": localStorage.getItem("token"),
      },
    })
      .then((res) => console.log(res.data))
      .catch((e) => console.log("error in axios:", e));
  };

  useEffect(() => {
    Axios.get("http://localhost:3000/login")
      .then((response) => {
        if (response.data.loggedIn) {
          setLoginStatus(response.data.user[0].username);
        }
      })
      .catch((err) => console.log(err));
  }, []);

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
        {loginStatus && (
          <button onClick={userAuthenticated}>User Authenticated</button>
        )}
      </form>
    </div>
  );
};

export default Login;
