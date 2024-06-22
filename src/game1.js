import { Box, Button, Stack, TextField, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import './login.css';
import { useEffect, useState } from "react";
import { useContext } from 'react';
import { ConnectionContext } from './ConnectionContext.js';

function Game1() {
    const navigate = useNavigate();
    const connectionContext = useContext(ConnectionContext);

    const handlePeerData = (data) => {

    }

    useEffect(() => {
        console.log("yo");
        if (connectionContext.connection === null || Object.keys(connectionContext.connection).length === 0) {
            navigate("../lobby");
            return;
        }

        connectionContext.connection.on("data", (data) => {
            console.log(handlePeerData);
        });
    }, []);

  return (
    <Box>
      <Button onClick={() => connectionContext.connection.send("hello")}> hello </Button>
    </Box>
  );
}

export default Game1;
