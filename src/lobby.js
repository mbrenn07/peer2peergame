import { Box, Button, Stack, TextField, Typography } from "@mui/material";
import './login.css';
import { Peer } from "peerjs";
import { useEffect, useState } from "react";

function Lobby() {
    const username = localStorage.getItem("username");
    const peer = new Peer(username);
    let activeConnection;

    const [lobbyPartner, setLobbyPartner] = useState("");

    const createLobby = () => {
        activeConnection = peer.connect(lobbyPartner);
    }

    useEffect(() => {
        peer.on("connection", (conn) => {
            conn.on("data", (data) => {
                // Will print 'hi!'
                console.log(data);
            });
            conn.on("open", () => {
                conn.send("connected");
            });
        });
    }, []);

    return (
        <Box id="loginContainer" sx={{ width: "100vw", height: "100vh", overflow: "clip" }}>
            <Box sx={{ backgroundColor: "rgba(0, 0, 0, .3)", position: "absolute", left: "100%", top: "0%", transform: "translateX(-100%)", padding: 1 }}>
                <Typography noWrap> Logged in as: <span id="usernameText">{username}</span> </Typography>
            </Box>
            <Box sx={{ width: "100%", height: "100%",  display: "flex", alignItems: "center", justifyContent: "center"}}>
                <Stack spacing={2} sx={{ backgroundColor: "rgba(0, 0, 0, .7)", padding: 2 }}>
                    <TextField value={lobbyPartner}
                        onChange={(event) => {
                            setLobbyPartner(event.target.value);
                        }} variant="standard" inputProps={{ style: { fontSize: 40, textAlign: "center" }, id: "usernameText" }}
                        InputLabelProps={{ style: { fontSize: 40 } }} />
                    <Button disabled={lobbyPartner.length === 0} onClick={createLobby} id="loginButton" sx={{ boxShadow: "2px 2px 2px white", fontSize: 30 }} variant="contained">Invite Player to Lobby</Button>
                </Stack>
            </Box>
        </Box>
    );
}

export default Lobby;
