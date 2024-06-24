import { Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import './login.css';
import { useRef, useEffect, useState, useContext, useCallback } from "react";
import { ConnectionContext } from './ConnectionContext.js';
import testLevel from "./testLevel.json"
import LevelRenderer from "./levelRenderer.js";
import lodash from "lodash";

function TheKingsSport() {
  const navigate = useNavigate();
  const dragTrackerRef = useRef(null);
  const otherPlayerEntitiesRef = useRef(null);
  const connectionContext = useContext(ConnectionContext);

  const handlePeerData = (data) => {
    data.forEach((dataItem) => {
      if (dataItem.command === "updateState") {
        if (dataItem.entity === "player") {
          setOtherPlayerState(dataItem.data);
        } else if (dataItem.entity === "entities") {
          setOtherPlayerEntities(dataItem.data);
        }
      }
    });
  }

  const [dragTracker, setDragTracker] = useState({});
  const [gameEntities, setGameEntities] = useState([]);
  const [otherPlayerEntities, setOtherPlayerEntities] = useState([]);
  const [currentLevel, setCurrentLevel] = useState(testLevel); //NOSONAR
  const [keysPressed, setKeysPressed] = useState(
    {
      up: false,
      down: false,
      left: false,
      right: false,
    }
  );

  const [otherPlayerState, setOtherPlayerState] = useState({
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
    dragAction: "firing",
  });
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
    dragAction: "firing",
  });

  useEffect(() => {
    dragTrackerRef.current = dragTracker;
  }, [dragTracker]);

  useEffect(() => {
    otherPlayerEntitiesRef.current = otherPlayerEntities;
  }, [otherPlayerEntities]);

  const determineCollision = (points, physicsObject, newX, newY) => {
    const x = Math.min(points[2].x, points[0].x);
    const y = Math.min(points[2].y, points[0].y);
    const width = Math.abs(Math.max(points[2].x, points[0].x) - x);
    const height = Math.abs(Math.max(points[2].y, points[0].y) - y);
    if (
      newX < x + width &&
      newX + physicsObject.width > x &&
      newY < y + height &&
      newY + physicsObject.height > y
    ) {
      const leftDiff = Math.abs(physicsObject.x - (x + width));
      const rightDiff = Math.abs(physicsObject.x + physicsObject.width - x);
      const topDiff = Math.abs(physicsObject.y - (y + height));
      const bottomDiff = Math.abs(physicsObject.y + physicsObject.height - y);
      const closestDiff = Math.min(leftDiff, rightDiff, topDiff, bottomDiff);

      if (leftDiff === closestDiff) {
        physicsObject.terrainCollidingLeft = x + width;
      } else if (rightDiff === closestDiff) {
        physicsObject.terrainCollidingRight = x - physicsObject.width;
      } else if (topDiff === closestDiff) {
        physicsObject.terrainCollidingTop = y + height;
      } else {
        physicsObject.terrainCollidingBottom = y - physicsObject.height;
      }
    }
  }

  //currently assuming every shape is a rectangle
  const determineCollisions = (physicsObject) => {
    physicsObject.terrainCollidingBottom = false;
    physicsObject.terrainCollidingTop = false;
    physicsObject.terrainCollidingLeft = false;
    physicsObject.terrainCollidingRight = false;

    const newX = physicsObject.x + physicsObject.xSpeed;
    const newY = physicsObject.y + physicsObject.ySpeed;

    currentLevel.shapes.forEach((shape) => {
      if (shape.points.length === 4) {
        determineCollision(shape.points, physicsObject, newX, newY)
      }
    });

    gameEntities.forEach((entity) => {
      if (entity.isCollider && !physicsObject.isCollider) {
        const points = [
          { x: entity.x, y: entity.y },
          { x: entity.x, y: entity.y + entity.height },
          { x: entity.x + entity.width, y: entity.y + entity.height },
          { x: entity.x + entity.width, y: entity.y },
        ];
        determineCollision(points, physicsObject, newX, newY);
      }
    });

    otherPlayerEntitiesRef.current.forEach((entity) => {
      if (entity.isCollider && !physicsObject.isCollider) {
        const points = [
          { x: entity.x, y: entity.y },
          { x: entity.x, y: entity.y + entity.height },
          { x: entity.x + entity.width, y: entity.y + entity.height },
          { x: entity.x + entity.width, y: entity.y },
        ];
        determineCollision(points, physicsObject, newX, newY);
      }
    });
  }

  //a physics object must have (assume x and y for all):
  //speed, max speed, acceleration, the 4 terrain collidings
  //coordinates, drag and gravity
  const enforcePhysics = (physicsObject) => {
    physicsObject.xSpeed = physicsObject.xSpeed + physicsObject.xAcceleration;
    physicsObject.ySpeed = physicsObject.ySpeed + physicsObject.yAcceleration;

    if (physicsObject.xSpeed > physicsObject.xMaxSpeed) {
      physicsObject.xSpeed = physicsObject.xMaxSpeed
    } else if (physicsObject.xSpeed < -physicsObject.xMaxSpeed) {
      physicsObject.xSpeed = -physicsObject.xMaxSpeed;
    }

    if (physicsObject.ySpeed > physicsObject.yMaxSpeed) {
      physicsObject.ySpeed = physicsObject.yMaxSpeed
    } else if (physicsObject.ySpeed < -physicsObject.yMaxSpeed) {
      physicsObject.ySpeed = -physicsObject.yMaxSpeed;
    }

    determineCollisions(physicsObject);

    if (!physicsObject.isCollider) {
      if (physicsObject.type === "arrow" && (physicsObject.terrainCollidingRight || physicsObject.terrainCollidingLeft)) {
        if (physicsObject.terrainCollidingRight) {
          physicsObject.x = physicsObject.terrainCollidingRight;
        } else {
          physicsObject.x = physicsObject.terrainCollidingLeft;
        }
        physicsObject.isCollider = true;
      } else {
        if (physicsObject.xSpeed > 0) {
          if (physicsObject.terrainCollidingRight === false) {
            physicsObject.x = physicsObject.x + physicsObject.xSpeed;
          } else {
            physicsObject.xSpeed = 0;
            physicsObject.x = physicsObject.terrainCollidingRight;
          }
        } else {
          if (physicsObject.terrainCollidingLeft === false) { //NOSONAR
            physicsObject.x = physicsObject.x + physicsObject.xSpeed;
          } else {
            physicsObject.xSpeed = 0;
            physicsObject.x = physicsObject.terrainCollidingLeft;
          }
        }

        if (physicsObject.ySpeed > 0) {
          if (physicsObject.terrainCollidingBottom === false) {
            physicsObject.y = physicsObject.y + physicsObject.ySpeed;
          } else {
            physicsObject.ySpeed = 0;
            physicsObject.y = physicsObject.terrainCollidingBottom;
          }
        } else {
          if (physicsObject.terrainCollidingTop === false) { //NOSONAR
            physicsObject.y = physicsObject.y + physicsObject.ySpeed;
          } else {
            physicsObject.ySpeed = 0;
            physicsObject.y = physicsObject.terrainCollidingTop;
          }
        }
      }
    }



    physicsObject.xAcceleration = 0;
    physicsObject.yAcceleration = 0;

    if (physicsObject.xSpeed >= physicsObject.xDrag) {
      physicsObject.xSpeed = physicsObject.xSpeed - physicsObject.xDrag;
    } else if (physicsObject.xSpeed <= -physicsObject.xDrag) {
      physicsObject.xSpeed = physicsObject.xSpeed + physicsObject.xDrag;
    } else {
      physicsObject.xSpeed = 0;
    }

    physicsObject.ySpeed = physicsObject.ySpeed + physicsObject.yGravity;
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

    if (dragTrackerRef.current.fired) {
      const arrowSpeed = 20;

      const ratio = Math.abs(Math.atan((dragTrackerRef.current.startCoord.y - dragTrackerRef.current.cursorPos.y) / (dragTrackerRef.current.startCoord.x - dragTrackerRef.current.cursorPos.x))) / (Math.PI / 2);

      //use angle to find ratio, then just use coordinates to find + or -
      let itemXSpeed = (1 - ratio) * arrowSpeed;
      let itemYSpeed = ratio * arrowSpeed;

      const movingLeft = dragTrackerRef.current.startCoord.x < dragTrackerRef.current.cursorPos.x;
      const movingUp = dragTrackerRef.current.startCoord.y > dragTrackerRef.current.cursorPos.y;


      if (movingLeft) {
        itemXSpeed = -itemXSpeed;
      }

      if (movingUp) {
        itemYSpeed = -itemYSpeed;
      }

      gameEntities.push({
        type: "arrow",
        x: movingLeft ? playerState.x - currentLevel.grid.spacing : playerState.x,
        y: playerState.y + (playerState.height / 4),
        xAcceleration: 0,
        yAcceleration: 0,
        xSpeed: itemXSpeed,
        ySpeed: -itemYSpeed,
        xMaxSpeed: 20,
        yMaxSpeed: 20,
        xDrag: .01,
        yGravity: .1,
        width: currentLevel.grid.spacing,
        height: currentLevel.grid.spacing / 4,
        color: "#964B00",
        terrainCollidingLeft: false,
        terrainCollidingRight: false,
        terrainCollidingTop: false,
        terrainCollidingBottom: false,
        isCollider: false,
      });
      setDragTracker({});
    }

    enforcePhysics(playerState);
    gameEntities.forEach((gameEntity) => {
      enforcePhysics(gameEntity);
    });

    connectionContext.connection?.send(
      [
        {
          command: "updateState",
          entity: "player",
          data: {
            x: playerState.x,
            y: playerState.y,
            width: playerState.width,
            height: playerState.height,
            color: playerState.color,
          },
        },
        {
          command: "updateState",
          entity: "entities",
          data: gameEntities.map((entity) => {
            return {
              x: entity.x,
              y: entity.y,
              width: entity.width,
              height: entity.height,
              color: entity.color,
              isCollider: entity.isCollider,
            }
          })
        },
      ]
    )
    setPlayerState({ ...playerState });
    setGameEntities([...gameEntities]);

  }


  useEffect(() => {
    if (connectionContext.connection === undefined || Object.keys(connectionContext.connection).length === 0) {
      navigate("../lobby");
      return;
    }

    connectionContext.connection?.on("data", (data) => {
      handlePeerData(data);
    });

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

  //speed, max speed, acceleration, the 4 terrain collidings
  //coordinates, drag and gravity

  const onDragEnd = () => {
    if (playerState.dragAction === "firing") {
      dragTracker.fired = true;
      setDragTracker({ ...dragTracker });
    }
  }

  const handleMouseMove = useCallback(lodash.throttle((e) => {
    setDragTracker((dragTracker) => {
      dragTracker.cursorPos = { x: e.pageX, y: e.pageY }
      return dragTracker
    });
  }, 16), []);

  return (
    <Box
      onMouseDown={(e) => {
        setDragTracker({ dragging: true, startCoord: { x: e.pageX, y: e.pageY } });
      }}

      onMouseMove={(e) => {
        if (dragTracker.dragging) {
          handleMouseMove(e);
        }
      }}

      onMouseUp={(e) => {
        if (dragTracker.dragging) {
          onDragEnd();
        }
      }}

      sx={{ backgroundColor: "cornsilk", overflow: "hidden" }}>
      <LevelRenderer level={currentLevel} childrenFirst>
        <rect fill={playerState.color} x={playerState.x} y={playerState.y} width={playerState.width} height={playerState.height} />
        <rect fill={otherPlayerState.color} x={otherPlayerState.x} y={otherPlayerState.y} width={otherPlayerState.width} height={otherPlayerState.height} />
        {(dragTracker.dragging && dragTracker.cursorPos && dragTracker.startCoord) && <path d={`M ${dragTracker.startCoord.x} ${dragTracker.startCoord.y} Q ${(dragTracker.startCoord.x + dragTracker.cursorPos.x) / 2} ${((dragTracker.startCoord.y + dragTracker.cursorPos.y) / 2)} ${dragTracker.cursorPos.x} ${dragTracker.cursorPos.y}`} stroke="gray" strokeWidth="1" fill="transparent" />}
        {gameEntities.map((gameEntity) => <rect fill={gameEntity.color} x={gameEntity.x} y={gameEntity.y} width={gameEntity.width} height={gameEntity.height} />)}
        {otherPlayerEntities.map((gameEntity) => <rect fill={gameEntity.color} x={gameEntity.x} y={gameEntity.y} width={gameEntity.width} height={gameEntity.height} />)}
      </LevelRenderer>
    </Box>
  );
}

export default TheKingsSport;
