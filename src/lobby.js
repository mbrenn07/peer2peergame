import { Box, Button, Link, Stack, TextField, Typography } from "@mui/material";
import './login.css';
import { Peer } from "peerjs";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Lobby() {
    const navigate = useNavigate();

    const [lobbyPartner, setLobbyPartner] = useState("");
    const [peer, setPeer] = useState(null);
    const [username, setUsername] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [activeConnection, setActiveConnection] = useState(null);
    const [error, setError] = useState(null);

    const createLobby = () => {
        const connection = peer.connect(lobbyPartner);
        setActiveConnection(connection);
    }

    const onConnected = () => {
        setError(null);
        setIsConnected(true);
    }

    const logout = () => {
        localStorage.removeItem("username");
        peer?.destroy();
        navigate("/");
    }

    useEffect(() => {
        activeConnection?.on("data", (data) => {
            console.log(data);
        });
        activeConnection?.on("open", () => {
            onConnected();
        });
    }, [activeConnection]);

    useEffect(() => {
        peer?.destroy();
        if (username) {
            setPeer(new Peer(username));
        }
    }, [username]);

    useEffect(() => {
        peer?.on("connection", (conn) => {
            conn.on("data", (data) => {
                console.log(data);
            });
            conn.on("open", () => {
                setLobbyPartner(conn.peer);
                onConnected();
            });
        });
        peer?.on("error", () => {
            setError("That user is not currently online");
        });
    }, [peer]);

    useEffect(() => {
        if (!localStorage.getItem("username")) {
            navigate("/");
        }

        setUsername(localStorage.getItem("username"));

        return () => {
            peer?.destroy();
        }
    }, []);

    return (
        <Box id="loginContainer" sx={{ width: "100vw", height: "100vh", overflow: "clip" }}>
            <Box sx={{ backgroundColor: "rgba(0, 0, 0, .3)", position: "absolute", left: "100%", top: "0%", transform: "translateX(-100%)", padding: 1 }}>
                <Stack>
                    <Typography noWrap> Logged in as: <span id="usernameText">{username}</span> </Typography>
                    <Link onClick={logout} sx={{ textAlign: "right", color: "red", cursor: "pointer"}} noWrap> Logout </Link>
                </Stack>
            </Box>
            <Box sx={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Stack spacing={2} sx={{ backgroundColor: "rgba(0, 0, 0, .7)", padding: 2 }}>
                    <TextField value={lobbyPartner} disabled={isConnected}
                        onChange={(event) => {
                            setLobbyPartner(event.target.value);
                        }} variant="standard" inputProps={{ style: { fontSize: 40, textAlign: "center" }, id: "usernameText" }}
                        InputLabelProps={{ style: { fontSize: 40 } }} />
                    {error && <Typography sx={{ textAlign: "center", color: "red", margin: 0 }}>{error}</Typography>}
                    { isConnected ? (
                        <Typography sx={{ fontSize: 30, textAlign: "center", color: "green", height: 64.5, lineHeight: 2}}> Connected! </Typography>
                    )
                    :
                    (
                        <Button disabled={lobbyPartner.length === 0} onClick={createLobby} id="loginButton" sx={{ boxShadow: "2px 2px 2px white", fontSize: 30 }} variant="contained">Invite Player to Lobby</Button>
                    )}
                </Stack>
            </Box>
        </Box>
    );
}

export default Lobby;
