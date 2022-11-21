import "./App.css";
import { useState, useCallback, useRef } from "react";
import produce from "immer";
import Button from "@mui/material/Button";
import Slider from "@mui/material/Slider";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import CloseIcon from "@mui/icons-material/Close";

/* Global */
const numRows = 20;
const numCols = 40;
const operations = [
  [0, 1],
  [0, -1],
  [1, -1],
  [-1, 1],
  [1, 1],
  [-1, -1],
  [1, 0],
  [-1, 0],
];
const startSpeed = 2;

/* Leeres Grid erstellen */
const generateEmptyGrid = () => {
  const rows = [];
  for (let i = 0; i < numRows; i++) {
    rows.push(Array.from(Array(numCols), () => 0));
  }
  return rows;
};

/* Zufalls Grid erstellen */
const generateRandomGrid = () => {
  const rows = [];
  for (let i = 0; i < numRows; i++) {
    rows.push(Array.from(Array(numCols), () => (Math.random() > 0.8 ? 1 : 0)));
  }
  return rows;
};

/* Gleiter Objekt erstellen */
const generateGridWithGlider = () => {
  /* Array erstellen */
  const rows = [];
  for (let i = 0; i < numRows; i++) {
    rows.push(Array.from(Array(numCols), () => 0));
  }
  /* Mittlere Zelle finden (Startpunkt für das Objekt) */
  const middleCellPos = [
    Math.round((rows.length - 1) / 2),
    Math.round((rows[0].length - 1) / 2),
  ];
  //console.log(middleCellPos)
  /* Glider erstellen */
  rows[middleCellPos[0] - 1][middleCellPos[1]] = 1;
  rows[middleCellPos[0]][middleCellPos[1] + 1] = 1;
  rows[middleCellPos[0] + 1][middleCellPos[1] - 1] = 1;
  rows[middleCellPos[0] + 1][middleCellPos[1]] = 1;
  rows[middleCellPos[0] + 1][middleCellPos[1] + 1] = 1;
  /* Array zurück */
  return rows;
};

/* Spaceship Objekt erstellen */
const generateGridWithLWSpaceShip = () => {
  /* Array erstellen */
  const rows = [];
  for (let i = 0; i < numRows; i++) {
    rows.push(Array.from(Array(numCols), () => 0));
  }
  /* Mittlere Zelle finden (Startpunkt für das Objekt) */
  const middleCellPos = [
    Math.round((rows.length - 1) / 2),
    Math.round((rows[0].length - 1) / 2),
  ];
  //console.log(middleCellPos)
  /* Glider erstellen */
  /* Reihe -1 */
  rows[middleCellPos[0] - 1][middleCellPos[1] - 2] = 1;
  rows[middleCellPos[0] - 1][middleCellPos[1] - 1] = 1;
  rows[middleCellPos[0] - 1][middleCellPos[1]] = 1;
  rows[middleCellPos[0] - 1][middleCellPos[1] + 1] = 1;
  /* Reihe 0 */
  rows[middleCellPos[0]][middleCellPos[1] - 3] = 1;
  rows[middleCellPos[0]][middleCellPos[1] + 1] = 1;
  /* Reihe 1 */
  rows[middleCellPos[0] + 1][middleCellPos[1] + 1] = 1;
  /* Reihe 2 */
  rows[middleCellPos[0] + 2][middleCellPos[1] - 3] = 1;
  rows[middleCellPos[0] + 2][middleCellPos[1]] = 1;
  /* Array zurück */
  return rows;
};

/* Function component */
function App() {
  /* Simulation speed ref */
  const simSpeed = useRef(startSpeed);

  /* DOM ref for overlay div*/
  const overlayDiv = useRef(null);

  /* Grid state*/
  const [grid, setGrid] = useState(() => {
    return generateEmptyGrid();
  });

  /* Running state */
  const [running, setRunning] = useState(false); // defaults to false

  /* Keep track if simualtion is running by using a ref*/
  const runningRef = useRef(running);
  runningRef.current = running;

  const oneStep = function () {
    /* set the grid in the state */
    setGrid((g) => {
      return produce(g, (gridCopy) => {
        // go thru the current grid g
        for (let i = 0; i < numRows; i++) {
          for (let j = 0; j < numCols; j++) {
            // how many neighbours does the cell have?
            let neighbours = 0;
            operations.forEach(([x, y]) => {
              const newI = i + x;
              const newJ = j + y;
              // check the bounds
              if (newI >= 0 && newI < numRows && newJ >= 0 && newJ < numCols) {
                neighbours += g[newI][newJ]; // add 1 to the neighbours if cell has the value of 1
              } else {
                let newItmp = newI; 
                let newJtmp = newJ;
                // Offene Welt
                if (newI < 0) {
                  newItmp = numRows - 1;
                }
                if (newI >= numRows) {
                  newItmp = 0;
                }
                if (newJ < 0) {
                  newJtmp = numCols - 1;
                }
                if (newJ >= numCols) {
                  newJtmp = 0;
                }
                neighbours += g[newItmp][newJtmp]; // add 1 to the neighbours if cell has the value of 1
              }
            });

            /* Rule 1 and 3 */
            if (neighbours < 2 || neighbours > 3) {
              gridCopy[i][j] = 0; // cell dies
            } else if (g[i][j] === 0 && neighbours === 3) {
              gridCopy[i][j] = 1; // cell becomes alive
            }
          }
        }
      });
    });
  };

  /* Run simulation callback function (does not re-run on every render)
   * Function has to keep track of running value, so use ref
   */
  const runSimulation = useCallback(() => {
    /* Return if not runningRef */
    if (!runningRef.current) {
      return;
    }

    /* One animation step */
    oneStep();

    // Simulate (recursive call)
    setTimeout(runSimulation, (1 / simSpeed.current) * 1000);
  }, []); // only run once

  /* Slider change */
  const handleSliderChange = function (event, newSpeed) {
    //console.log(newSpeed, "slider change");
    simSpeed.current = newSpeed;
  };

  /* Return JSX Component */
  return (
    <div className="App">
      <h1 style={{ color: "#1976d2" }}>Conway`s game of life</h1>
      <hr></hr>
      <Button
        variant="contained"
        style={{ margin: "1em" }}
        onClick={() => {
          setRunning(!running);
          if (!running) {
            runningRef.current = true; // update the ref
            runSimulation(); // run the simulation
          }
        }}
      >
        {running ? "Stop" : "Start"}
      </Button>
      <Button
        variant="contained"
        style={{ margin: "1em" }}
        onClick={() => {
          setGrid(generateEmptyGrid());
          setRunning(false);
        }}
      >
        Clear
      </Button>
      <Button
        style={{ marginRight: "2em" }}
        onClick={() => {
          /* Return if we are already running */
          if (runningRef.current) {
            return;
          }
          oneStep();
        }}
      >
        Next Step
      </Button>
      <Button
        variant="contained"
        style={{ margin: "1em" }}
        onClick={() => {
          setGrid(generateRandomGrid());
        }}
      >
        Random
      </Button>
      <Button
        variant="contained"
        style={{ margin: "1em" }}
        onClick={() => {
          setGrid(generateGridWithGlider());
        }}
      >
        Create Glider
      </Button>
      <Button
        variant="contained"
        style={{ margin: "1em" }}
        onClick={() => {
          setGrid(generateGridWithLWSpaceShip());
        }}
      >
        Create LW-Spaceship
      </Button>
      <div
        style={{
          display: "flex",
          gap: "1em",
          justifyContent: "center",
          alignItems: "center",
          maxWidth: "800px",
          margin: "0 auto",
        }}
      >
        <div>Simulation speed</div>
        <div className="sliderDiv">
          <Slider
            aria-label="Simulation speed"
            defaultValue={startSpeed}
            min={1}
            max={10}
            onChange={(_, val) => {
              handleSliderChange(_, val);
            }}
          />
        </div>
      </div>
      <hr></hr>
      <div
        className="Grid"
        style={{
          display: "grid",
          width: "90%",
          margin: "2em auto",
          gridTemplateColumns: `repeat(${numCols}, auto)`,
        }}
      >
        {grid.map((rows, i) =>
          rows.map((col, k) => (
            <div
              key={`cell-${i}-${k}`}
              onClick={() => {
                /* copy of the grid */
                const newGrid = produce(grid, (gridCopy) => {
                  gridCopy[i][k] = grid[i][k] ? 0 : 1;
                });
                setGrid(newGrid); /* set the grid in the state */
              }}
              style={{
                padding: "0.15em",
                backgroundColor: grid[i][k]
                  ? "rgba(25, 118, 210, 0.65)"
                  : undefined,
                border: "1px solid rgba(25, 118, 210, 0.8)",
                aspectRatio: "1", // quadrat
              }}
            />
          ))
        )}
      </div>

      <div id="overlay" ref={overlayDiv}>
        <div className="rules">
          <List
            sx={{
              width: "100%",
              maxWidth: 600,
              margin: "auto",
              bgcolor: "background.paper",
              borderRadius: "1em",
              padding: "4em",
            }}
          >
            <CloseIcon
              style={{ position: "absolute", right: "1em", top: "0.5em" }}
              onClick={() => {
                overlayDiv.current.style.display = "none";
              }}
            />
            <h3>
              Rules (
              <a href="https://en.wikipedia.org/wiki/Conway%27s_Game_of_Life">
                Wiki
              </a>
              )
            </h3>
            <ListItem>
              Any live cell with fewer than two live neighbours dies, as if by
              underpopulation.
            </ListItem>
            <ListItem>
              Any live cell with two or three live neighbours lives on to the
              next generation.
            </ListItem>
            <ListItem>
              Any live cell with more than three live neighbours dies, as if by
              overpopulation.
            </ListItem>
            <ListItem>
              Any dead cell with exactly three live neighbours becomes a live
              cell, as if by reproduction.
            </ListItem>
          </List>
        </div>
      </div>

      <div className="footericon">
        <Button
          className="infoBtn"
          variant="contained"
          sx={{
            padding: "1em",
            borderRadius: "50%",
          }}
          onClick={() => {
            overlayDiv.current.style.display = "block";
          }}
        >
          <InfoOutlinedIcon id="infoicon" fontSize="large" />
        </Button>
      </div>
    </div>
  );
}

export default App;
