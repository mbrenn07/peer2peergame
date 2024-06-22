import { Box, Button, Stack, TextField, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import './login.css';
import { useEffect, useState } from "react";
import Peer from "peerjs";

function Login() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [error, setError] = useState(null);

  const login = () => {
    const tempPeer = new Peer(username);
    
    tempPeer.on("open", () => {
      tempPeer.destroy();
      setError(null);
      localStorage.setItem("username", username ?? localStorage.getItem("username"));
      navigate("/lobby");
    });

    tempPeer.on("error", () => {
      setError("That username is currently being used");
    })

  }

  useEffect(() => {
    if (localStorage.getItem("username")) {
      login();
    }
  }, []);

  return (
    <Box id="loginContainer" sx={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100vw", height: "100vh" }}>
      <Stack sx={{ backgroundColor: "rgba(0, 0, 0, .7)", padding: 2 }}>
        <TextField value={username}
          onChange={(event) => {
            setUsername(event.target.value);
          }} variant="standard" inputProps={{ style: { fontSize: 40, textAlign: "center" }, id: "usernameText" }}
          InputLabelProps={{ style: { fontSize: 40 } }} sx={{mb: 1}}/>
        {error && <Typography sx={{ textAlign: "center", color: "red", margin: 0 }}>{error}</Typography>}
        <Button disabled={username.length === 0} onClick={login} id="loginButton" sx={{ mt: 1, boxShadow: "2px 2px 2px white", fontSize: 30 }} variant="contained">Submit Username</Button>
      </Stack>
    </Box>
  );
}

export default Login;
