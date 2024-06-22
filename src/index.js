import React, { useMemo, useState } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import Login from './login';
import Lobby from './lobby'
import reportWebVitals from './reportWebVitals';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { ConnectionContext } from './ConnectionContext.js';
import Game1 from './game1.js';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: "hsl(270deg 100% 7%)",
      contrastText: "#fff",
    },
    secondary: {
      main: "hsl(104deg 100% 95%)",
    }
  },
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <BaseComponent/>
);

function BaseComponent () {
  const [connection, setConnection] = useState({});
  const connectionObj = useMemo(() => {
    return {connection: connection, setConnection: setConnection}
}, [connection, setConnection]);

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <ConnectionContext.Provider value={connectionObj}>
      <Router>
        <Routes>
          <Route exact path="/" element={<Login/>} />
          <Route path="/lobby" element={<Lobby/>} />
          <Route path="/game1" element={<Game1/>} />
        </Routes>
      </Router>
      </ConnectionContext.Provider>
    </ThemeProvider>
  );
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
