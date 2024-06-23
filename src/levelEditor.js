import { Box, Stack, Divider, IconButton, TextField, Typography, Modal } from "@mui/material";
import { Delete, BorderStyle, Download, Upload, Crop32, Pentagon } from '@mui/icons-material';
import './login.css';
import { useEffect, useState } from "react";

function Game1() {
    const [openDimensionModal, setOpenDimensionModal] = useState(false);
    const [openUploadModal, setOpenUploadModal] = useState(false);
    const [levelWidth, setLevelWidth] = useState();
    const [levelHeight, setLevelHeight] = useState();
    const [currentLevel, setCurrentLevel] = useState({});
    const [scrollPosition, setScrollPosition] = useState({ x: 0, y: 0 });
    const [isDrawing, setIsDrawing] = useState(false);
    const [drawingMode, setDrawingMode] = useState();
    const [drawingPoints, setDrawingPoints] = useState([]);
    const [cursorLocation, setCursorLocation] = useState();
    const [levelShapes, setLevelShapes] = useState([]);

    useEffect(() => {
        const level = JSON.parse(localStorage.getItem("currentLevel"));
        if (level) {
            loadLevel(level);
        } else {
            createNewLevel();
        }
    }, []);

    const loadLevel = (level) => {
        setLevelHeight(level.height);
        setLevelWidth(level.width);
        setLevelShapes(level.shapes);
        setCurrentLevel(level);
    }

    const createNewLevel = () => {
        setLevelHeight(window.innerHeight);
        setLevelWidth(window.innerWidth);
        setLevelShapes([]);
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

    const addShape = (drawingPoints) => {
        levelShapes.push(drawingPoints);
        setLevelShapes([...levelShapes]);
    }

    const createDrawingPreview = () => {
        if (drawingPoints.length > 0 && cursorLocation) {
            let points = [];
            if (drawingMode === "poly") {
                points = [...drawingPoints];
            } else if (drawingMode === "rect") {
                if (drawingPoints.length === 4) {
                    return;
                }

                points = [...drawingPoints];
                points.push({ x: cursorLocation.x, y: drawingPoints[0].y });
                points.push({ x: cursorLocation.x, y: cursorLocation.y });
                points.push({ x: drawingPoints[0].x, y: cursorLocation.y });

                //ensures we get a full rectangle
                points.push(drawingPoints[0]);
            }

            const lines = [];
            for (let i = 0; i < points.length - 1; i++) {
                lines.push(
                    <line
                        style={{ cursor: "pointer" }}
                        x1={points[i].x} y1={points[i].y} x2={points[i + 1].x} y2={points[i + 1].y} stroke="black" strokeWidth="4" strokeDasharray="4" />
                );
            }

            return (
                <>
                    {points.map((point) => <circle fill="black" r={5} cx={point.x} cy={point.y} />)}
                    {lines}
                </>
            );
        }
    }

    useEffect(() => {
        if (!isDrawing) {
            setDrawingPoints([]);
            setCursorLocation(undefined);
        }
    }, [isDrawing]);

    const drawLevelShapes = () => {
        return levelShapes.map((levelShape) => {
            let points = "";
            levelShape.forEach((point) => {
                points = points + point.x + "," + point.y + " ";
            });
            return (
                <svg width={levelWidth} height={levelHeight} style={{ position: "relative" }}>
                    <polygon points={points} />
                </svg>
            );
        });
    }

    useEffect(() => {
        const level = {};
        level.width = levelWidth;
        level.height = levelHeight;
        level.shapes = levelShapes;

        localStorage.setItem("currentLevel", JSON.stringify(level))
        setCurrentLevel(level);
    }, [levelWidth, levelHeight, levelShapes]);

    return (
        <>
            <Box sx={{ background: "cornsilk", width: "100vw", height: "100vh", overflow: "scroll" }}
                onScroll={(e) => {
                    setScrollPosition({ x: e.target.scrollLeft, y: e.target.scrollTop });
                }}
            >
                <Box onMouseMove={(e) => {
                    if (isDrawing) {
                        setCursorLocation({ x: e.pageX + scrollPosition.x, y: e.pageY + scrollPosition.y });
                    }
                }}

                    onMouseDown={(e) => {
                        if (drawingMode === "rect") {
                            setIsDrawing(true);
                            setDrawingPoints([{ x: e.pageX + scrollPosition.x, y: e.pageY + scrollPosition.y }]);
                        }
                    }}

                    onMouseUp={(e) => {
                        if (drawingMode === "rect" && isDrawing) {
                            setIsDrawing(false);
                            const newX = e.pageX + scrollPosition.x;
                            const newY = e.pageY + scrollPosition.y;
                            drawingPoints.push({ x: newX, y: drawingPoints[0].y });
                            drawingPoints.push({ x: newX, y: newY });
                            drawingPoints.push({ x: drawingPoints[0].x, y: newY });
                            setDrawingPoints([...drawingPoints]);
                            addShape(drawingPoints);
                        }
                    }}

                    onClick={(e) => {
                        if (drawingMode === "poly") {
                            if (!isDrawing) {
                                setIsDrawing(true);
                                setDrawingPoints([]);
                            }
                            drawingPoints.push({ x: e.pageX + scrollPosition.x, y: e.pageY + scrollPosition.y });
                            setDrawingPoints([...drawingPoints]);
                        
                            const x = e.pageX + scrollPosition.x - drawingPoints[0].x;
                            const y = e.pageY + scrollPosition.y - drawingPoints[0].y;
                            const distance = Math.sqrt((x * x) + (y * y));
                            if (distance < 10) {
                                setIsDrawing(false);
                                addShape(drawingPoints);
                            }
                        }
                    }}
                    onContextMenu={(e) => {
                        setIsDrawing(false);
                        e.preventDefault();
                    }}
                    sx={{ overflow: "clip", width: parseInt(levelWidth), height: parseInt(levelHeight), border: "1px dashed black" }}>
                    <svg width={levelWidth} height={levelHeight}>
                        {createDrawingPreview()}
                        {drawLevelShapes()}
                    </svg>
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
                        <IconButton onClick={() => {
                            setIsDrawing(false);
                            setDrawingMode(drawingMode === "rect" ? undefined : "rect");
                        }}>
                            {drawingMode === "rect" ?
                                (
                                    <Crop32 color="primary" />
                                )
                                :
                                (
                                    <Crop32 />
                                )}
                        </IconButton>
                        <IconButton onClick={() => {
                            setIsDrawing(false);
                            setDrawingMode(drawingMode === "poly" ? undefined : "poly");
                        }}>
                            {drawingMode === "poly" ?
                                (
                                    <Pentagon color="primary" />
                                )
                                :
                                (
                                    <Pentagon />
                                )}
                        </IconButton>
                        <IconButton onClick={() => createNewLevel()}>
                            <Delete color="error" />
                        </IconButton>
                    </Stack>
                </Box>
            </Box >
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
