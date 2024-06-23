import { Box, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import './login.css';
import { useEffect, useState, useContext } from "react";
import { ConnectionContext } from './ConnectionContext.js';
import testLevel from "./testLevel.json"
import LevelRenderer from "./levelRenderer.js";

function TheKingsSport() {
  const navigate = useNavigate();
  const connectionContext = useContext(ConnectionContext);

  const handlePeerData = (data) => {
    console.log(data);
  }

  const [currentLevel, setCurrentLevel] = useState(testLevel);
  const [keysPressed, setKeysPressed] = useState(
    {
      up: false,
      down: false,
      left: false,
      right: false,
    }
  );

  const [playerState, setPlayerState] = useState({
    x: currentLevel.grid.spacing * 2,
    y: currentLevel.grid.spacing * 14,
    xAcceleration: 0,
    yAcceleration: 0,
    xAccelerationIncrement: 2,
    yAccelerationIncrement: 2,
    xSpeed: 0,
    ySpeed: 0,
    xMaxSpeed: 10,
    yMaxSpeed: 10,
    xDrag: 1,
    yGravity: .5,
    width: currentLevel.grid.spacing / 2,
    height: currentLevel.grid.spacing,
    color: "#9932CC",
    terrainCollidingLeft: false,
    terrainCollidingRight: false,
    terrainCollidingTop: false,
    terrainCollidingBottom: false,
    lastGrounded: 0,
  });

  //currently assuming every shape is a rectangle
  const determineCollisions = () => {
    playerState.terrainCollidingBottom = false;
    playerState.terrainCollidingTop = false;
    playerState.terrainCollidingLeft = false;
    playerState.terrainCollidingRight = false;

    const newPlayerX = playerState.x + playerState.xSpeed;
    const newPlayerY = playerState.y + playerState.ySpeed;

    currentLevel.shapes.forEach((shape) => {
      if (shape.points.length === 4) {
        const x = Math.min(shape.points[2].x, shape.points[0].x);
        const y = Math.min(shape.points[2].y, shape.points[0].y);
        const width = Math.abs(Math.max(shape.points[2].x, shape.points[0].x) - x);
        const height = Math.abs(Math.max(shape.points[2].y, shape.points[0].y) - y);
        if (
          newPlayerX < x + width &&
          newPlayerX + playerState.width > x &&
          newPlayerY < y + height &&
          newPlayerY + playerState.height > y
        ) {
          const leftDiff = Math.abs(playerState.x - (x + width));
          const rightDiff = Math.abs(playerState.x + playerState.width - x);
          const topDiff = Math.abs(playerState.y - (y + height));
          const bottomDiff = Math.abs(playerState.y + playerState.height - y);
          const closestDiff = Math.min(leftDiff, rightDiff, topDiff, bottomDiff);
          console.log(shape)

          if (leftDiff === closestDiff) {
            playerState.terrainCollidingLeft = x + width;
          } else if (rightDiff === closestDiff) {
            playerState.terrainCollidingRight = x - playerState.width;
          } else if (topDiff === closestDiff) {
            playerState.terrainCollidingTop = y + height;
          } else {
            playerState.terrainCollidingBottom = y - playerState.height;
          }
        }
      }
    });
  }

  const operateGameLoop = () => {
    if (keysPressed.up) {
      if (playerState.terrainCollidingBottom && playerState.ySpeed > 0) {
        playerState.lastGrounded = new Date().getTime();
      }
      if (((new Date().getTime()) - playerState.lastGrounded) < 200) {
        playerState.yAcceleration = -playerState.yAccelerationIncrement;
      }
    }
    if (keysPressed.down) {
      playerState.yAcceleration = playerState.yAccelerationIncrement;
    }
    if (keysPressed.left) {
      playerState.xAcceleration = -playerState.xAccelerationIncrement;
    }
    if (keysPressed.right) {
      playerState.xAcceleration = playerState.xAccelerationIncrement;
    }

    playerState.xSpeed = playerState.xSpeed + playerState.xAcceleration;
    playerState.ySpeed = playerState.ySpeed + playerState.yAcceleration;

    if (playerState.xSpeed > playerState.xMaxSpeed) {
      playerState.xSpeed = playerState.xMaxSpeed
    } else if (playerState.xSpeed < -playerState.xMaxSpeed) {
      playerState.xSpeed = -playerState.xMaxSpeed;
    }

    if (playerState.ySpeed > playerState.yMaxSpeed) {
      playerState.ySpeed = playerState.yMaxSpeed
    } else if (playerState.ySpeed < -playerState.yMaxSpeed) {
      playerState.ySpeed = -playerState.yMaxSpeed;
    }

    determineCollisions();

    if (playerState.xSpeed > 0) {
      if (playerState.terrainCollidingRight === false) {
        playerState.x = playerState.x + playerState.xSpeed;
      } else {
        playerState.x = playerState.terrainCollidingRight;
      }
    } else {
      if (playerState.terrainCollidingLeft === false) { //NOSONAR
        playerState.x = playerState.x + playerState.xSpeed;
      } else {
        playerState.x = playerState.terrainCollidingLeft;
      }
    }

    if (playerState.ySpeed > 0) {
      if (playerState.terrainCollidingBottom === false) {
        playerState.y = playerState.y + playerState.ySpeed;
      } else {
        playerState.ySpeed = 0;
        playerState.y = playerState.terrainCollidingBottom;
      }
    } else {
      if (playerState.terrainCollidingTop === false) { //NOSONAR
        playerState.y = playerState.y + playerState.ySpeed;
      } else {
        playerState.ySpeed = 0;
        playerState.y = playerState.terrainCollidingTop;
      }
    }


    playerState.xAcceleration = 0;
    playerState.yAcceleration = 0;

    if (playerState.xSpeed >= playerState.xDrag) {
      playerState.xSpeed = playerState.xSpeed - playerState.xDrag;
    } else if (playerState.xSpeed <= -playerState.xDrag) {
      playerState.xSpeed = playerState.xSpeed + playerState.xDrag;
    } else {
      playerState.xSpeed = 0;
    }

    playerState.ySpeed = playerState.ySpeed + playerState.yGravity;

    setPlayerState({ ...playerState });
  }


  useEffect(() => {
    // if (connectionContext.connection === null || Object.keys(connectionContext.connection).length === 0) {
    //     navigate("../lobby");
    //     return;
    // }

    // connectionContext.connection.on("data", (data) => {
    //     handlePeerData(data);
    // });

    document.addEventListener('keydown', (event) => {
      if (playerState === undefined || playerState === null) {
        return;
      }

      switch (event.code) {
        case 'KeyW':
        case 'ArrowUp':
          keysPressed.up = true;
          break;
        case 'KeyS':
        case 'ArrowDown':
          keysPressed.down = true;
          break;
        case 'KeyA':
        case 'ArrowLeft':
          keysPressed.left = true;
          break;
        case 'KeyD':
        case 'ArrowRight':
          keysPressed.right = true;
          break;
        default:
          break;
      }

      setKeysPressed({ ...keysPressed });
    }, false);

    document.addEventListener('keyup', (event) => {
      if (playerState === undefined || playerState === null) {
        return;
      }

      switch (event.code) {
        case 'KeyW':
        case 'ArrowUp':
          keysPressed.up = false;
          break;
        case 'KeyS':
        case 'ArrowDown':
          keysPressed.down = false;
          break;
        case 'KeyA':
        case 'ArrowLeft':
          keysPressed.left = false;
          break;
        case 'KeyD':
        case 'ArrowRight':
          keysPressed.right = false;
          break;
        default:
          break;
      }

      setKeysPressed({ ...keysPressed });
    }, false);

    const gameLoop = setInterval(() => {
      requestAnimationFrame(operateGameLoop);
    }, 16);

    return () => clearInterval(gameLoop);
  }, []);

  return (
    <Box sx={{ backgroundColor: "cornsilk", overflow: "hidden" }}>
      <LevelRenderer level={currentLevel}>
        <rect fill={playerState.color} x={playerState.x} y={playerState.y} width={playerState.width} height={playerState.height} />
      </LevelRenderer>
      {/* <Button onClick={() => connectionContext.connection.send("hello")}> hello </Button> */}
    </Box>
  );
}

export default TheKingsSport;
