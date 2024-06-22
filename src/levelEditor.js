import { Box, Stack, Divider, IconButton, TextField, Typography, Modal } from "@mui/material";
import { BorderStyle, Download, Upload } from '@mui/icons-material';
import './login.css';
import { useEffect, useState } from "react";

function Game1() {
    const [openDimensionModal, setOpenDimensionModal] = useState(false);
    const [openUploadModal, setOpenUploadModal] = useState(false);
    const [levelWidth, setLevelWidth] = useState();
    const [levelHeight, setLevelHeight] = useState();
    const [currentLevel, setCurrentLevel] = useState({});

    useEffect(() => {
        const level = JSON.parse(localStorage.getItem("currentLevel"));
        if (level) {
            loadLevel(level);
        } else {
            setLevelHeight(window.innerHeight);
            setLevelWidth(window.innerWidth);
        }
    }, []);

    const loadLevel = (level) => {
        setLevelHeight(level.height);
        setLevelWidth(level.width);
        setCurrentLevel(level);
    }

    function download(filename, text) {
        const element = document.createElement('a');
        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
        element.setAttribute('download', filename);

        element.style.display = 'none';
        document.body.appendChild(element);

        element.click();

        document.body.removeChild(element);
    }

    useEffect(() => {
        const level = {};
        level.width = levelWidth;
        level.height = levelHeight;

        localStorage.setItem("currentLevel", JSON.stringify(level))
        setCurrentLevel(level);
    }, [levelWidth, levelHeight]);

    return (
        <>
            <Box sx={{ background: "cornsilk", width: "100vw", height: "100vh", overflow: "scroll" }}>
                <Box sx={{ width: parseInt(levelWidth), height: parseInt(levelHeight), border: "1px dashed black" }}>

                </Box>
                <Box sx={{ height: 40, width: 500, position: "absolute", top: "calc(100% - 25px)", left: "50%", transform: "translate(-50%, -100%)", backgroundColor: "rgba(0, 0, 0, .7)" }}>
                    <Stack direction="row" divider={<Divider orientation="vertical" flexItem />} >
                        <IconButton onClick={() => setOpenDimensionModal(true)}>
                            <BorderStyle />
                        </IconButton>
                        <IconButton onClick={() => download("currentLevel.txt", JSON.stringify(currentLevel))}>
                            <Download />
                        </IconButton>
                        <IconButton onClick={() => setOpenUploadModal(true)}>
                            <Upload />
                        </IconButton>
                    </Stack>
                </Box>
            </Box>
            <Modal
                open={openDimensionModal}
                onClose={() => {
                    setOpenDimensionModal(false);
                }}
            >
                <Box sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 400,
                    bgcolor: 'background.paper',
                    border: '2px solid #000',
                    boxShadow: 24,
                    p: 2,
                }}>
                    <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
                        Set level dimensions
                    </Typography>
                    <Stack spacing={1.5} sx={{ width: "90%" }}>
                        <TextField label="Width" variant="outlined" value={levelWidth}
                            onChange={(event) => {
                                setLevelWidth(event.target.value);
                            }} />
                        <TextField label="Height" variant="outlined" value={levelHeight}
                            onChange={(event) => {
                                setLevelHeight(event.target.value);
                            }} />
                    </Stack>
                </Box>
            </Modal>
            <Modal
                open={openUploadModal}
                onClose={() => {
                    setOpenUploadModal(false);
                }}
            >
                <Box sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 400,
                    bgcolor: 'background.paper',
                    border: '2px solid #000',
                    boxShadow: 24,
                    p: 2,
                }}>
                    <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
                        Upload level from disk
                    </Typography>
                    <Stack spacing={1.5} sx={{ width: "90%" }}>
                        <input onChange={(e) => {
                            const file = e.target.files[0];
                            const reader = new FileReader();
                            reader.addEventListener('load', (event) => {
                                try {
                                    const newLevel = JSON.parse(event.target.result)
                                    loadLevel(newLevel);
                                } catch (e) {
                                    alert("Invalid Level");
                                }
                            });
                            reader.readAsText(file);
                        }} type="file" accept=".txt" />
                    </Stack>
                </Box>
            </Modal>
        </>
    );
}

export default Game1;
