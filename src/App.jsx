import "./App.css";
import {useEffect, useRef, useState} from "react";
import {useNavigate, useParams} from 'react-router-dom';

export default function App() {
  const EMPTY = "";
  const MAX_LENGTH = 2;

  const NUMBER_OF_TOTAL_EXERCISES_TO_GET_TO_NEXT_LEVEL = 10; // This is used with current state, so the state will have old value, the actual value is higher by 1.
  const NUMBER_OF_CORRECT_EXERCISES_TO_GET_TO_NEXT_LEVEL = NUMBER_OF_TOTAL_EXERCISES_TO_GET_TO_NEXT_LEVEL - 1;

  const STATE_THINKING = 1;
  const STATE_ANSWERED = 2;
  const STATE_LOADING = 3;
  const STATE_LOADING_NEXT = 4;

  const INDICATOR_TIMEOUT = 2000;
  const STATUS_TIMEOUT = 3000;

  const state = useRef(STATE_LOADING);
  const exerciseNextRef = useRef();

  const [exercise, setExercise] = useState();
  const [answer, setAnswer] = useState();

  const [exerciseNext, setExerciseNext] = useState();

  // const [menuVisible, setMenuVisible] = useState(false);
  const [incorrectAnswers, setIncorrectAnswers] = useState(); // Incorrect answers for the current exercise
  const [timeFrom, setTimeFrom] = useState();
  const [history, setHistory] = useState([]);

  const [message, setMessage] = useState();

  const [predmet, setPredmet] = useState("matematika");
  let { trida } = useParams();
  let { cviceni } = useParams();

  let navigate = useNavigate();
  let fetchAbortController;
  let cviceniNext = null;

  useEffect(() => {
    fetchExercise(cviceni);
  }, [exercise]);

  function fetchExercise(cviceni_) {
    if (fetchAbortController) {
      console.error('Logical error: The next fetch must not happen before the current ends. ', err);
    }

    fetchAbortController = new AbortController();
    fetch('http://localhost:8000/' + predmet + '/' + trida + '/' + cviceni_, { signal: fetchAbortController.signal })
      .then((res) => {
        return res.json();
      })
      .then((data) => {
        if (state.current == STATE_LOADING) { // 1st exercise
          console.log("New exercise: " + JSON.stringify(data));
          state.current = STATE_THINKING;
          setExercise(data);
          setAnswer(EMPTY);
          setIncorrectAnswers([]);
          setTimeFrom(new Date());
        } else { // use this exercise after the current exercise
          console.log("Next exercise: " + JSON.stringify(data));
          setExerciseNext(data);
        }
      })
      .catch(err => {
        if (err.name === 'AbortError') {
          console.log('Fetch request was canceled');
        } else {
          console.error('Fetch error: ', err);
        }
      })
  }

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
    if (isCorrect()) {
      console.log("Correct answer");

      const timeTo = new Date();
      const timeDiff = timeTo.getTime() - timeFrom.getTime();
      setHistory([...history, [exercise, incorrectAnswers, timeDiff]]);

      let moveToNextLevel_ = moveToNextLevel(incorrectAnswers);
      if (moveToNextLevel_) {
        console.log("Next level");
        if (fetchAbortController)
          fetchAbortController.abort();
        getNextLevel();
      }

      setTimeout(() => {
        if (moveToNextLevel_) {
          console.log("Timeout for answer indicator");
          state.current = STATE_LOADING_NEXT;
          if (cviceniNext != null) {
            console.log("cviceniNext = " + cviceniNext);
            navigate("/" + predmet + "/" + trida + "/" + cviceniNext);
            setTimeout(() => {
              console.log("Timeout for loading screen");
              if (exerciseNextRef.current != null) {
                state.current = STATE_THINKING;
                setExercise(exerciseNextRef.current);
                setExerciseNext(null);
                setAnswer(EMPTY);
                setIncorrectAnswers([]);
                setTimeFrom(new Date());

                setHistory([]);
              } else {
                state.current = STATE_LOADING;
              }
            },  INDICATOR_TIMEOUT);
          } else {
            console.log("TODO");
            // TODO may not be loaded
          }
          return;
        }

        if (exerciseNextRef.current != null) {
          state.current = STATE_THINKING;
          setExercise(exerciseNextRef.current);
          setExerciseNext(null);
          setAnswer(EMPTY);
          setIncorrectAnswers([]);
          setTimeFrom(new Date());
        } else {
          console.log("Loading exercise");
          state.current = STATE_LOADING;
        }
      },  INDICATOR_TIMEOUT);
    } else {
      let expectedAnswer =  Number(exercise.zadani[Number(exercise.neznama)]);
      let actualAnswer = Number(answer);
      console.log("Incorrect answer. Expected: " + expectedAnswer + ", actual: " + actualAnswer);

      setIncorrectAnswers([...incorrectAnswers, actualAnswer]);

      setTimeout(() => {
        state.current = STATE_THINKING;
        setAnswer(EMPTY);
      },  INDICATOR_TIMEOUT);
    }
  }

  function moveToNextLevel(incorrectAnswersCurrent) {
    if (history.length + 1 < NUMBER_OF_TOTAL_EXERCISES_TO_GET_TO_NEXT_LEVEL)
        return false;

    let correct = 0;
    let correctString = "";
    for (let i = history.length - NUMBER_OF_TOTAL_EXERCISES_TO_GET_TO_NEXT_LEVEL + 1; i < history.length; i++) {
      const incorrectAnswers2 = history[i][1].length;
      if (incorrectAnswers2 === 0) {
        correct++;
        correctString += ".";
      } else {
        correctString += "X";
      }
    }
    if (incorrectAnswersCurrent.length) {
      correctString += "X";
    } else {
      correct++;
      correctString += ".";
    }

    let moveToNextLevel = NUMBER_OF_CORRECT_EXERCISES_TO_GET_TO_NEXT_LEVEL <= correct;
    console.log((moveToNextLevel ? "Move to next level" : "Don't move to next level") + ". Correct " + correct + " vs " + NUMBER_OF_CORRECT_EXERCISES_TO_GET_TO_NEXT_LEVEL + ", summary: " + correctString);
    return moveToNextLevel;
  }

  function getNextLevel() {
    fetch('http://localhost:8000/' + predmet + '/dalsi_cviceni/' + trida + '/' + cviceni)
      .then((res) => {
        return res.json();
      })
      .then((data) => {
        console.log("Next level is: " + JSON.stringify(data));
        cviceniNext = data;
        if (data == "END") {
          console.log("TODO");
          // TODO Show "Vyborne jsi dokoncil vsechna cviceni. Gratulujeme! Muzes pokracovat dalsi tridou."
        } else {
          fetchExercise(cviceniNext);
        }
      });
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

  // Message

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

  let cviceniNazev = "TODO Název cvičení " + cviceni + "<br/>" + state.current;

  function isCorrect() {
    if (! [STATE_THINKING, STATE_ANSWERED].includes(state.current))
      return false;

    let expectedAnswer =  Number(exercise.zadani[Number(exercise.neznama)]);
    let actualAnswer = Number(answer);
    let correct = expectedAnswer === actualAnswer;
    return correct
  }

  return [STATE_LOADING, STATE_LOADING_NEXT].includes(state.current) ? (
    <main>
      <LoadingScreen title={cviceniNazev} text="Nahrávám cvičení" />
    </main>
    ) : (
    <main>
      <Zadani exercise={exercise} answer={answer}
              showCorrect={state.current == STATE_ANSWERED && isCorrect()}
              showIncorrect={state.current == STATE_ANSWERED && !isCorrect()} />

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
