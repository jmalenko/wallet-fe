import "./App.css";
import { useState } from "react";

export default function App() {
  const EMPTY = "";
  const MAX_LENGHT = 2;

  const STATE_THINKING = 1;
  const STATE_ANSWERED = 2;

  const RESULT_NOT_DEFINED = 0;
  const RESULT_CORRECT = 1;
  const RESULT_INCORRECT = 2;

  const [excercise, setExcercise] = useState(createExcercise());
  const [answer, setAnswer] = useState(EMPTY);
  const [state, setState] = useState(STATE_THINKING);
  const [result, setResult] = useState(RESULT_NOT_DEFINED);

  const [menuVisible, setMenuVisible] = useState(false);
  const [count, setCount] = useState(0); // Count of correct answers
  const [countErrors, setCountErrors] = useState(0); // Count of incorrect answers for the current excercise
  const [timeFrom, setTimeFrom] = useState(new Date());
  const [history, setHistory] = useState([]);

  function onAddDigit(digit) {
    if (state != STATE_THINKING) return;

    if (answer.length < MAX_LENGHT) {
      setAnswer(answer + digit);
    } // TODO else show message
  }

  function onSubmit() {
    if (state != STATE_THINKING) return;

    setState(STATE_ANSWERED);
    if (answer == Math.abs(excercise[1])) {
      setResult(RESULT_CORRECT);
      setCount(count + 1);
      const timeTo = new Date();
      const timeDiff = timeTo.getTime() - timeFrom.getTime();
      setHistory([...history, [excercise, countErrors, timeDiff]]);

      setTimeout(() => {
        setState(STATE_THINKING);
        setAnswer(EMPTY);
        setExcercise(createExcercise());
        setResult(RESULT_NOT_DEFINED);
        setTimeFrom(new Date());
      }, 3000);
    } else {
      setResult(RESULT_INCORRECT);
      setCountErrors(countErrors + 1);

      setTimeout(() => {
        setState(STATE_THINKING);
        setAnswer(EMPTY);
        setResult(RESULT_NOT_DEFINED);
      }, 3000);
    }
  }

  function createExcercise() {
    // a + b = c
    const a = 6 + Math.floor(Math.random() * 15);
    const c = 6 + Math.floor(Math.random() * 15);
    const b = c - a;
    return [a, b, c];
  }

  function onDelete() {
    if (state != STATE_THINKING) return;

    setAnswer(EMPTY);
  }

  function onShowMenu() {
    setMenuVisible(!menuVisible);
  }

  return (
    <main>
      <div id="zadani">
        <span id="operand1">{excercise[0]}</span>
        <span id="operator">{0 <= excercise[1] ? "+" : "–"}</span>
        <span id="neznama">
          <span id="operand2">{answer}</span>
        </span>
        <span id="rovnase">=</span>
        <span id="vysledek">{excercise[2]}</span>
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
    <span onClick={onClick} class="border">
      {value}
    </span>
  );
}

function ButtonSubmit({ onSubmit }) {
  return (
    <img
      id="submit"
      class="icon"
      onClick={onSubmit}
      src="images/send_24dp_FILL0_wght400_GRAD0_opsz24.svg"
    ></img>
  );
}

function ButtonDelete({ onDelete }) {
  return (
    <img
      id="delete"
      class="icon"
      onClick={onDelete}
      src="images/backspace_24dp_FILL0_wght400_GRAD0_opsz24.svg"
    ></img>
  );
}

function ButtonMenu({ onShowMenu }) {
  return (
    <img
      id="menu"
      class="icon"
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
    yValuesBar.push(element[1]);
  });

  new Chart("myChart", {
    type: "line",
    data: {
      labels: xValues,
      datasets: [
        {
          backgroundColor: "rgba(0,0,255,1.0)",
          borderColor: "rgba(0,0,255,0.1)",
          data: yValues,
          fill: false,
        },
      ],
    },
    options: {},
  });

  return isVisible ? (
    <div id="menuScreen">
      <p>Počet přikladů: {history.length}</p>
      <canvas id="myChart"></canvas>
    </div>
  ) : (
    <></>
  );
}
