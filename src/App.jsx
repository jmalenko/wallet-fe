import "./App.css";
import { useState, useEffect } from "react";

export default function App() {
  const EMPTY = "";
  const MAX_LENGHT = 2;

  const STATE_THINKING = 1;
  const STATE_ANSWERED = 2;

  const RESULT_NOT_DEFINED = 0;
  const RESULT_CORRECT = 1;
  const RESULT_INCORRECT = 2;

  const INDICATOR_TIMEOUT = 2000;

  const [exercise, setExercise] = useState();
  const [answer, setAnswer] = useState(EMPTY);
  const [state, setState] = useState(STATE_THINKING);
  const [result, setResult] = useState(RESULT_NOT_DEFINED);
  const [exerciseNext, setExerciseNext] = useState();

  // const [menuVisible, setMenuVisible] = useState(false);
  const [incorrectAnswers, setIncorrectAnswers] = useState([]); // Incorrect answers for the current exercise
  const [timeFrom, setTimeFrom] = useState(new Date());
  const [history, setHistory] = useState([]);

  useEffect(() => {
    fetch('http://localhost:8000/matematika')
      .then((res) => {
        return res.json();
      })
      .then((data) => {
        console.log("New exercise: " + JSON.stringify(data));
        if (!exercise) { // 1st exercise
          setExercise([data.zadani[0], data.zadani[2], data.zadani[4]]);
        } else { // use this exercise after the current exercise
          setExerciseNext([data.zadani[0], data.zadani[2], data.zadani[4]]);
        }
      });
  }, [exercise]);

  function onAddDigit(digit) {
    if (state != STATE_THINKING) return;

    if (answer.length < MAX_LENGHT) {
      setAnswer(answer + digit);
    } // TODO else show message
  }

  function onSubmit() {
    if (state != STATE_THINKING) return;
    if (answer.length == 0) return; // TODO show message

    setState(STATE_ANSWERED);
    if (answer == Math.abs(exercise[1])) {
      setResult(RESULT_CORRECT);
      const timeTo = new Date();
      const timeDiff = timeTo.getTime() - timeFrom.getTime();
      setHistory([...history, [exercise, incorrectAnswers, timeDiff]]);

      setTimeout(() => {
        setState(STATE_THINKING);
        setAnswer(EMPTY);
        setExercise(exerciseNext);
        setResult(RESULT_NOT_DEFINED);
        setIncorrectAnswers([]);
        setTimeFrom(new Date());
      },  INDICATOR_TIMEOUT);
    } else {
      setResult(RESULT_INCORRECT);
      setIncorrectAnswers(incorrectAnswers + 1);

      setTimeout(() => {
        setState(STATE_THINKING);
        setAnswer(EMPTY);
        setResult(RESULT_NOT_DEFINED);
      },  INDICATOR_TIMEOUT);
    }
  }

  function onDelete() {
    if (state != STATE_THINKING) return;

    setAnswer(EMPTY);
  }

  function onShowMenu() {
    // setMenuVisible(!menuVisible);
    // const element = document.getElementById("menuScreen")
    // element.style.visibility = menuVisible ? "visible" : "hidden";
  }

  return (
    <main>
      <div id="zadani">
        {exercise != null && <>
          <span id="operand1">{exercise[0]}</span>
          <span id="operator">{0 <= exercise[1] ? "+" : "–"}</span>
          <span className="indicator_wrapper">
            <span id="neznama">
              <span id="operand2">{answer}</span>
            </span>
            <IconCorrect isVisible={result == RESULT_CORRECT} />
            <IconIncorrect isVisible={result == RESULT_INCORRECT} />
          </span>
          <span id="rovnase">=</span>
          <span id="vysledek">{exercise[2]}</span>
        </>}
      </div>

      <div id="tlacitka">
        <ButtonDigit value={1} onAddDigit={onAddDigit} />
        <ButtonDigit value={2} onAddDigit={onAddDigit} />
        <ButtonDigit value={3} onAddDigit={onAddDigit} />
        <ButtonDigit value={4} onAddDigit={onAddDigit} />
        <ButtonDigit value={5} onAddDigit={onAddDigit} />
        <ButtonDigit value={6} onAddDigit={onAddDigit} />
        <ButtonDigit value={7} onAddDigit={onAddDigit} />
        <ButtonDigit value={8} onAddDigit={onAddDigit} />
        <ButtonDigit value={9} onAddDigit={onAddDigit} />
        <ButtonDigit value={0} onAddDigit={onAddDigit} />

        <ButtonSubmit onSubmit={onSubmit} />
        <ButtonDelete onDelete={onDelete} />
      </div>

      <ButtonMenu onShowMenu={onShowMenu} />

      <IconCorrect isVisible={result == RESULT_CORRECT} />
      <IconIncorrect isVisible={result == RESULT_INCORRECT} />

      <MenuScreen isVisible={menuVisible} history={history} />
    </main>
  );
}

function ButtonDigit({ value, onAddDigit }) {
  const [state, setState] = useState(value);

  function onClick() {
    onAddDigit(state);
  }

  return (
    <span onClick={onClick} className="icon">
      {value}
    </span>
  );
}

function ButtonSubmit({ onSubmit }) {
  return (
    <img
      id="submit"
      className="icon"
      onClick={onSubmit}
      src="images/send_24dp_FILL0_wght400_GRAD0_opsz24.svg"
    ></img>
  );
}

function ButtonDelete({ onDelete }) {
  return (
    <img
      id="delete"
      className="icon"
      onClick={onDelete}
      src="images/backspace_24dp_FILL0_wght400_GRAD0_opsz24.svg"
    ></img>
  );
}

function ButtonMenu({ onShowMenu }) {
  return (
    <img
      id="menu"
      className="icon"
      onClick={onShowMenu}
      src="images/menu_24dp_FILL0_wght400_GRAD0_opsz24.svg"
    ></img>
  );
}

function IconCorrect({ isVisible }) {
  return isVisible ? (
    <img
      id="correct"
      src="images/check_24dp_FILL0_wght400_GRAD0_opsz24.svg"
    ></img>
  ) : (
    <></>
  );
}

function IconIncorrect({ isVisible }) {
  return isVisible ? (
    <img
      id="incorrect"
      src="images/close_24dp_FILL0_wght400_GRAD0_opsz24.svg"
    ></img>
  ) : (
    <></>
  );
}

function MenuScreen({ isVisible, history }) {
  let xValues = [];
  let yValues = [];
  let yValuesBar = [];

  let c = 0;
  history.forEach((element) => {
    xValues.push(++c);
    yValues.push(element[2] / 1000);
    yValuesBar.push(element[1].length);
  });

  new Chart("myChart", {
    type: "line",
    data: {
      labels: xValues,
      datasets: [
        {
          label: "Doba [s]",
          data: yValues,
          backgroundColor: "rgba(0,255,0,1.0)",
          borderColor: "rgba(0,255,0,0.1)",
          borderWidth: 10,
          fill: false,
          tension: 0.1,
        },
        {
          label: "Počet chyb",
          data: yValuesBar,
          backgroundColor: "rgba(255,0,0,1.0)",
          borderColor: "rgba(255,0,0,0.1)",
          fill: false,
          borderWidth: 10,
          tension: 0.1,
        },
      ],
    },
    options: {
      legend: {
        position: "bottom",
      },
      aspectRatio: 3.1,
    },
  });

  return (
    <div id="menuScreen">
      <canvas id="myChart"></canvas>
    </div>
  );
}
