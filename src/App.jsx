import "./App.css";
import {useState, useEffect, useRef} from "react";
import {useNavigate, useParams} from 'react-router-dom';

export default function App() {
  const EMPTY = "";
  const MAX_LENGTH = 2;

  const STATE_THINKING = 1;
  const STATE_ANSWERED = 2;
  const STATE_LOADING = 3;

  const RESULT_NOT_DEFINED = 0;
  const RESULT_CORRECT = 1;
  const RESULT_INCORRECT = 2;

  const INDICATOR_TIMEOUT = 2000;
  const STATUS_TIMEOUT = 3000;

  const state = useRef(STATE_LOADING);
  const exerciseNextRef = useRef();

  const [exercise, setExercise] = useState();
  const [answer, setAnswer] = useState();

  const [result, setResult] = useState(RESULT_NOT_DEFINED);
  const [exerciseNext, setExerciseNext] = useState();

  // const [menuVisible, setMenuVisible] = useState(false);
  const [incorrectAnswers, setIncorrectAnswers] = useState([]); // Incorrect answers for the current exercise
  const [timeFrom, setTimeFrom] = useState();
  const [history, setHistory] = useState([]);

  let { trida } = useParams();
  let { cviceni } = useParams();
  const [message, setMessage] = useState();

  useEffect(() => {
    fetch('http://localhost:8000/matematika/' + trida + '/' + cviceni)
      .then((res) => {
        return res.json();
      })
      .then((data) => {
        if (state.current == STATE_LOADING) { // 1st exercise
          console.log("New exercise: " + JSON.stringify(data));
          state.current = STATE_THINKING;
          setExercise(data);
          setAnswer(EMPTY);
          setTimeFrom(new Date());
        } else { // use this exercise after the current exercise
          console.log("Next exercise: " + JSON.stringify(data));
          setExerciseNext(data);
        }
      });
  }, [exercise]);

  useEffect(() => {
    exerciseNextRef.current = exerciseNext;
  }, [exerciseNext]);

  function onAddDigit(digit) {
    if (state.current != STATE_THINKING) return;

    // console.log("Add digit: " + answer + " + " + digit);
    if (answer.length < MAX_LENGTH || answer.length < exercise.zadani[exercise.neznama].toString().length) {
      setAnswer(answer + digit);
    } else {
      setMessage("Není povoleno zadat příliš dlouhé číslo")
    }
  }

  function onSubmit() {
    if (state.current != STATE_THINKING) return;
    if (answer.length === 0) {
      setMessage("Musíš zadat číslo")
      return
    }

    state.current = STATE_ANSWERED;
    const expectedAnswer =  Number(exercise.zadani[Number(exercise.neznama)])
    const actualAnswer = Number(answer)
    const correct = expectedAnswer === actualAnswer
    console.log(correct ? "Correct" : "Incorrect. Expected answer: " + expectedAnswer + ", actual answer: " + actualAnswer);
    if (correct) {
      setResult(RESULT_CORRECT);
      const timeTo = new Date();
      const timeDiff = timeTo.getTime() - timeFrom.getTime();
      setHistory([...history, [exercise, incorrectAnswers, timeDiff]]);

      setTimeout(() => {
        setState(STATE_THINKING);
        setAnswer(EMPTY);
        setResult(RESULT_NOT_DEFINED);
        setIncorrectAnswers([]);
        if (exerciseNextRef.current != null) {
          state.current = STATE_THINKING;
          setExercise(exerciseNextRef.current);
          setExerciseNext(null);
          setTimeFrom(new Date());
        } else {
          console.log("Loading exercise");
          state.current = STATE_LOADING;
        }
      },  INDICATOR_TIMEOUT);
    } else {
      setResult(RESULT_INCORRECT);
      setIncorrectAnswers(incorrectAnswers + 1);

      setTimeout(() => {
        state.current = STATE_THINKING;
        setAnswer(EMPTY);
        setResult(RESULT_NOT_DEFINED);
      },  INDICATOR_TIMEOUT);
    }
  }

  function onDelete() {
    if (state.current !== STATE_THINKING) return;

    // console.log("Clear answer");
    setAnswer(EMPTY);
  }

  function onShowMenu() {
    // setMenuVisible(!menuVisible);
    // const element = document.getElementById("menuScreen")
    // element.style.visibility = menuVisible ? "visible" : "hidden";
  }

  // Status

  let timeout = null;

  useEffect(() => {
    if (message != null) {
      clearTimeout(timeout);

      timeout = setTimeout(() => hideStatus(), STATUS_TIMEOUT);

      return () => {
        clearTimeout(timeout);
      };
    }
  }, [message]);

  function hideStatus() {
    setMessage(null);
  }

  // Physical keys

  useEffect(() => {
    document.addEventListener('keydown', onKeyDown);

    return function () {
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [answer]);

  const onKeyDown = (event) => {
    if (state.current !== STATE_THINKING) return;

    if (isFinite(event.key)) // test for a digit
      onAddDigit(event.key);
    else if (event.key === "Escape")
      onDelete()
    else if (event.key === "Backspace") {
      setAnswer(answer.substring(0, answer.length - 1));
    } else if (event.key === "Enter")
      onSubmit()
  }

  let cviceniNazev = "TODO Název cvičení";

  return state.current == STATE_LOADING ? (
    <main>
      <LoadingScreen title={cviceniNazev} text="Nahrávám cvičení" />
    </main>
    ) : (
    <main>
      <Zadani exercise={exercise} answer={answer} showCorrect={result === RESULT_CORRECT} showIncorrect={result === RESULT_INCORRECT} />

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


      {message != null &&
        <div id="message">{message}</div>}
    </main>
  );
}

function Zadani({ exercise, answer, showCorrect, showIncorrect }) {
  // Experimentally set the font-size
  //   exercise.zadani.length     font-size
  //   5                          17
  //   7                          13
  //   9                           9
  const fontSize1 = 17;
  const length1 = 5;
  const deltaPerUnitLength = -2;

  let fontSize = exercise == null ? fontSize1 : (exercise.zadani.length - length1) * deltaPerUnitLength + fontSize1;
  // console.debug("Zadani font-size: " + fontSize);
  const neznamaHeight = fontSize + 3;
  // TODO Other dimensions should be adjusted as well: position of correct/incorrect icons, vertical position of exercise

  return (
    <div id="zadani" style={{"fontSize": fontSize + "vw"}}>
      {exercise != null && Object.keys(exercise.zadani).map(i => (
        i == exercise.neznama ? (
          <span key={i} className="neznama_wrapper">
            <span id="neznama" style={{"height": neznamaHeight + "vw"}}>
              <span>{answer}</span>
            </span>
            <IconCorrect isVisible={showCorrect}/>
            <IconIncorrect isVisible={showIncorrect}/>
          </span>
        ) : (
          <span key={i}>{exercise.zadani[i]}</span>)))
      }
    </div>
  );
}

function ButtonDigit({value, onAddDigit}) {

  function onClick() {
    onAddDigit(value);
  }

  return (
    <span onClick={onClick} className="icon">
      {value}
    </span>
  );
}

function ButtonSubmit({onSubmit}) {
  return (
    <img
      id="submit"
      className="icon"
      onClick={onSubmit}
      src="/images/send_24dp_FILL0_wght400_GRAD0_opsz24.svg"
      alt="Submit" />
  );
}

function ButtonDelete({onDelete}) {
  return (
    <img
      id="delete"
      className="icon"
      onClick={onDelete}
      src="/images/backspace_24dp_FILL0_wght400_GRAD0_opsz24.svg"
      alt="Delete" />
  );
}

function ButtonMenu({ onShowMenu }) {
  return (
    <img
      id="menu"
      className="icon"
      onClick={onShowMenu}
      src="/images/menu_24dp_FILL0_wght400_GRAD0_opsz24.svg"
      alt="Menu" />
  );
}

function IconCorrect({ isVisible }) {
  return isVisible ? (
    <img
      id="correct"
      src="/images/check_24dp_FILL0_wght400_GRAD0_opsz24.svg"
      alt="Correct" />
  ) : (
    <></>
  );
}

function IconIncorrect({ isVisible }) {
  return isVisible ? (
    <img
      id="incorrect"
      src="/images/close_24dp_FILL0_wght400_GRAD0_opsz24.svg"
      alt="Incorrect" />
  ) : (
    <></>
  );
}

function LoadingScreen({title, text}) {
  return (
    <div id="loading">
      <h3>{title}</h3>
      <p>{text}</p>
    </div>
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
