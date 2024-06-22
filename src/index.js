import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import Login from './login';
import Lobby from './lobby'
import reportWebVitals from './reportWebVitals';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

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
  <React.StrictMode>
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route exact path="/" element={<Login/>} />
          <Route path="/lobby" element={<Lobby/>} />
        </Routes>
      </Router>
    </ThemeProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
