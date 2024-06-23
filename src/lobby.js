import { CardActionArea, CardContent, Box, Button, Card, Grid, Link, Stack, TextField, Typography } from "@mui/material";
import './login.css';
import { Peer } from "peerjs";
import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { ConnectionContext } from './ConnectionContext.js';

function Lobby() {
    const navigate = useNavigate();
    const connectionContext = useContext(ConnectionContext);

    const games = [
        {
            name: "The King's Sport",
            description: "A multiplayer archery arena",
            url: "the-kings-sport",
            multiplayer: true,
        },
        {
            name: "Level Editor",
            description: "Create levels for other games",
            url: "level-editor",
            multiplayer: false,
        },
    ];

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

    const onConnected = (newConnection) => {
        setError(null);
        setIsConnected(true);
        connectionContext.setConnection(newConnection);
    }

    const logout = () => {
        localStorage.removeItem("username");
        peer?.destroy();
        navigate("/");
    }

    useEffect(() => {
        activeConnection?.on("open", () => {
            onConnected(activeConnection);
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
                if (data.command === "playGame") {
                    navigate(data.url);
                }
            })
            conn.on("open", () => {
                setLobbyPartner(conn.peer);
                setActiveConnection(conn);
                onConnected(conn);
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
                    <Link onClick={logout} sx={{ textAlign: "right", color: "red", cursor: "pointer" }} noWrap> Logout </Link>
                </Stack>
            </Box>
            <Box sx={{ width: "100%", height: "100%", display: "flex", alignItems: "end", justifyContent: "center" }}>
                <Stack justifyContent="space-between" sx={{ height: "calc(50% + 89.5px)", width: 520 }}>
                    <Stack spacing={2} sx={{ backgroundColor: "rgba(0, 0, 0, .7)", padding: 2 }}>
                        <TextField value={lobbyPartner} disabled={isConnected}
                            onChange={(event) => {
                                setError(null);
                                setLobbyPartner(event.target.value);
                            }} variant="standard" inputProps={{ style: { fontSize: 40, textAlign: "center" }, id: "usernameText" }}
                            InputLabelProps={{ style: { fontSize: 40 } }} />
                        {(error && lobbyPartner) && <Typography sx={{ textAlign: "center", color: "red", margin: 0 }}>{error}</Typography>}
                        {isConnected ? (
                            <Typography sx={{ fontSize: 30, textAlign: "center", color: "green", height: 64.5, lineHeight: 2 }}> Connected! </Typography>
                        )
                            :
                            (
                                <Button disabled={lobbyPartner.length === 0} onClick={createLobby} id="loginButton" sx={{ boxShadow: "2px 2px 2px white", fontSize: 30 }} variant="contained">Invite Player to Lobby</Button>
                            )}
                    </Stack>
                    <Box sx={{ width: "140%", height: 179 * 1.5, backgroundColor: "rgba(0, 0, 0, .7)", mb: 3, position: "relative", transform: "translateX(-13.5%)", padding: 2, pb: 0 }}>
                        <Grid sx={{ height: "100%", width: "100%" }} spacing={2} container>
                            {games.map((game) => <GameCard key={game.name} name={game.name} description={game.description} url={game.url} activeConnection={activeConnection} multiplayer={game.multiplayer}/>)}
                        </Grid>
                    </Box>
                </Stack>
            </Box>
        </Box>
    );
}

function GameCard(props) {
    const navigate = useNavigate();

    const goToGame = () => {
        props.activeConnection?.send({command: "playGame", url: "../" + props.url})
        navigate("../" + props.url);
    }

    return (
        <Grid item xs={4} sx={{ height: "50%" }}>
            <Card sx={{ height: "100%", overflowY: "auto" }}>
                <CardActionArea disabled={!(!props.multiplayer || props.activeConnection)} onClick={goToGame} sx={{height: "100%", opacity: (!props.multiplayer || props.activeConnection) ? null : .3}}>
                    <CardContent sx={{padding: 1.5}}>
                        <Typography gutterBottom variant="h5">
                            {props.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {props.description}
                        </Typography>
                    </CardContent>
                </CardActionArea>
            </Card>
        </Grid>
    );
}

export default Lobby;
