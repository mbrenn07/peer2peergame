import { Box, Button, Stack, TextField } from "@mui/material";
import { useNavigate } from "react-router-dom";
import './login.css';
import { useEffect, useState } from "react";

function Login() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");

  const login = () => {
    localStorage.setItem("username", username);
    navigate("/lobby");
  }

  useEffect(() => {
    if (localStorage.getItem("username")) {
      navigate("/lobby");
    }
  }, []);

  return (
    <Box id="loginContainer" sx={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100vw", height: "100vh" }}>
      <Stack spacing={2} sx={{ backgroundColor: "rgba(0, 0, 0, .7)", padding: 2 }}>
        <TextField value={username}
          onChange={(event) => {
            setUsername(event.target.value);
          }} variant="standard" inputProps={{ style: { fontSize: 40, textAlign: "center" }, id: "usernameText" }}
          InputLabelProps={{ style: { fontSize: 40 } }} />
        <Button disabled={username.length === 0} onClick={login} id="loginButton" sx={{ boxShadow: "2px 2px 2px white", fontSize: 30 }} variant="contained">Submit Username</Button>
      </Stack>
    </Box>
  );
}

export default Login;
