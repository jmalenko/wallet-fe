import {useEffect, useRef, useState} from "react";
import {useNavigate, useParams} from 'react-router-dom';
import {useLocalStorage} from "./useLocalStorage";
import {doneContains} from "./shared.js";

export default function MathPractice() {
  const EMPTY = "";
  const MAX_LENGTH = 2;

  const NUMBER_OF_TOTAL_EXERCISES_TO_GET_TO_NEXT_LEVEL = import.meta.env.PROD ? 10 : 3; // This is used with current state, so the state will have old value, the actual value is higher by 1.
  const NUMBER_OF_CORRECT_EXERCISES_TO_GET_TO_NEXT_LEVEL = NUMBER_OF_TOTAL_EXERCISES_TO_GET_TO_NEXT_LEVEL - 1;

  const LOG_MAX_LENGTH = 1000;

  const STATE_THINKING = 1;
  const STATE_ANSWERED = 2;
  const STATE_LOADING = 3;
  const STATE_LOADING_NEXT = 4;
  const STATE_END = 5;

  const INDICATOR_TIMEOUT = import.meta.env.PROD ? 2000 : 200;
  const STATUS_TIMEOUT = import.meta.env.PROD ? 3000 : 300;

  const state = useRef(STATE_LOADING);
  const exerciseNextRef = useRef();

  const [exercise, setExercise] = useState();
  const [answer, setAnswer] = useState(); // string

  const [exerciseNext, setExerciseNext] = useState();

  const [menuVisible, setMenuVisible] = useState(false);
  const [incorrectAnswers, setIncorrectAnswers] = useState(); // Incorrect answers for the current exercise
  const [timeFrom, setTimeFrom] = useState();
  const [history, setHistory] = useState([]);

  const [message, setMessage] = useState();

  const [predmet, setPredmet] = useState("matematika");
  let {trida} = useParams();
  let {cviceni} = useParams();

  let navigate = useNavigate();
  let fetchAbortController;
  const cviceniNextRef = useRef();

  const [log, setLog] = useLocalStorage("log", JSON.stringify([]));
  const [done, setDone] = useLocalStorage("done", JSON.stringify([])); // Set stored as array
  const [next, setNext] = useLocalStorage("next", JSON.stringify({})); // TODO Consider getting next from done (as the first item that's not done)

  useEffect(() => {
    fetchExercise(cviceni);
  }, [exercise]);

  useEffect(() => {
    setLog(log => [...log, {
      timestamp: Date().valueOf(),
      predmet: predmet,
      trida: trida,
      cviceni: cviceni,
      event: "Start",
      exercise: "",
      answerExpected: "",
      answerActual: "",
      correctIndicator: "",
      duration: ""
    }]);
  }, []);

  function fetchExercise(cviceni_) {
    if (fetchAbortController) {
      console.error('Logical error: The next fetch must not happen before the current ends.');
    }

    fetchAbortController = new AbortController();
    fetch(import.meta.env.VITE_API_BASE_URL + 'api/' + predmet + '/' + trida + '/' + cviceni_, {signal: fetchAbortController.signal})
      .then((res) => {
        return res.json();
      })
      .then((data) => {
        if (state.current == STATE_LOADING) { // 1st exercise
          if (import.meta.env.DEV)
            console.debug("Data: " + JSON.stringify(data));
          console.log("New exercise: " + dataToString(data));
          state.current = STATE_THINKING;
          setExercise(data);
          setAnswer(EMPTY);
          setIncorrectAnswers([]);
          const now = new Date();
          setTimeFrom(now);

          // Trim log
          if (LOG_MAX_LENGTH < log.length) {
            setLog(log => log.slice(-LOG_MAX_LENGTH));
          }

          setLog(log => [...log, {
            timestamp: now.valueOf(),
            predmet: predmet,
            trida: trida,
            cviceni: cviceni,
            event: "Nový příklad",
            exercise: dataToString(data),
            answerExpected: "",
            answerActual: "",
            correctIndicator: "",
            duration: ""
          }]);
        } else { // use this exercise after the current exercise
          if (import.meta.env.DEV)
            console.debug("Data: " + JSON.stringify(data));
          console.log("Next exercise: " + dataToString(data));
          setExerciseNext(data);
        }
      })
      .catch(err => {
        if (err.name === 'AbortError') {
          console.debug('Fetch request was canceled');
        } else {
          throw err;
        }
      })
  }

  useEffect(() => {
    exerciseNextRef.current = exerciseNext;
  }, [exerciseNext]);

  function onAddDigit(digit) {
    if (state.current != STATE_THINKING) return;

    console.debug("Add digit: " + answer + " + " + digit);
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
    const now = new Date();
    const timeTo = now;
    const timeDiff = timeTo.getTime() - timeFrom.getTime();
    if (isCorrect()) {
      console.log("Correct answer");

      setHistory([...history, [exercise, incorrectAnswers, timeDiff]]);

      setLog(log => [...log, {
        timestamp: now.valueOf(),
        predmet: predmet,
        trida: trida,
        cviceni: cviceni,
        event: "Odpověď",
        exercise: dataToString(exercise),
        answerExpected: exercise.zadani[Number(exercise.neznama)],
        answerActual: answer,
        correctIndicator: "Správně",
        duration: timeDiff
      }]);

      let moveToNextLevel_ = moveToNextLevel(incorrectAnswers);
      if (moveToNextLevel_) {
        console.log("Next level");

        let el = {predmet: predmet, trida: trida, cviceni: cviceni};
        if (!doneContains(done, el)) {
          setDone([...done, el]);
        }

        setLog(log => [...log, {
          timestamp: now.valueOf(),
          predmet: predmet,
          trida: trida,
          cviceni: cviceni,
          event: "Další cvičení",
          exercise: "",
          answerExpected: "",
          answerActual: "",
          correctIndicator: "",
          duration: ""
        }]);

        if (fetchAbortController)
          fetchAbortController.abort();
        getNextLevel();
      }

      setTimeout(() => {
        if (moveToNextLevel_) {
          console.debug("Timeout for answer indicator");
          if (cviceniNextRef.current != null) {
            if (cviceniNextRef.current.end) {
              console.info("This was the last exercise");
              state.current = STATE_END;
              setExerciseNext(null); // set some state variable to force rerender
            } else {
              state.current = STATE_LOADING_NEXT;
              navigate("/" + predmet + "/" + trida + "/" + cviceniNextRef.current.id);
              setTimeout(() => {
                console.debug("Timeout for loading screen");
                if (exerciseNextRef.current != null) {
                  state.current = STATE_THINKING;
                  setExercise(exerciseNextRef.current);
                  setExerciseNext(null);
                  setAnswer(EMPTY);
                  setIncorrectAnswers([]);
                  setTimeFrom(new Date());

                  setLog(log => [...log, {
                    timestamp: Date().valueOf(),
                    predmet: predmet,
                    trida: trida,
                    cviceni: cviceniNextRef.current ? (cviceniNextRef.current.end ? "END" : cviceniNextRef.current.id) : (cviceni + " +1?"), // TODO Should use cviceniNextRef.current, but it's sometimes null
                    event: "Nový příklad",
                    exercise: dataToString(exerciseNextRef.current),
                    answerExpected: exerciseNextRef.current.zadani[Number(exerciseNextRef.current.neznama)],
                    answerActual: "",
                    correctIndicator: "",
                    duration: ""
                  }]);

                  setHistory([]);
                  cviceniNextRef.current = null;
                } else {
                  state.current = STATE_LOADING;
                }
              }, INDICATOR_TIMEOUT);
            }
          } else {
            console.warn("TODO");
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

          setLog(log => [...log, {
            timestamp: Date().valueOf(),
            predmet: predmet,
            trida: trida,
            cviceni: cviceni,
            event: "Nový příklad",
            exercise: dataToString(exerciseNextRef.current),
            answerExpected: "",
            answerActual: "",
            correctIndicator: "",
            duration: ""
          }]);

        } else {
          console.debug("Loading exercise");
          state.current = STATE_LOADING;
        }
      }, INDICATOR_TIMEOUT);
    } else {
      let expectedAnswer = Number(exercise.zadani[Number(exercise.neznama)]);
      let actualAnswer = Number(answer);
      console.log("Incorrect answer. Expected: " + expectedAnswer + ", actual: " + actualAnswer);

      setIncorrectAnswers([...incorrectAnswers, actualAnswer]);

      setLog(log => [...log, {
        timestamp: now.valueOf(),
        predmet: predmet,
        trida: trida,
        cviceni: cviceni,
        event: "Odpověď",
        exercise: dataToString(exercise),
        answerExpected: expectedAnswer,
        answerActual: actualAnswer,
        correctIndicator: "Chyba",
        duration: timeDiff
      }]);

      setTimeout(() => {
        state.current = STATE_THINKING;
        setAnswer(EMPTY);
      }, INDICATOR_TIMEOUT);
    }
  }

  function isCorrect() {
    if (![STATE_THINKING, STATE_ANSWERED].includes(state.current))
      return false;

    let expectedAnswer = Number(exercise.zadani[Number(exercise.neznama)]);
    let actualAnswer = Number(answer);
    let correct = expectedAnswer === actualAnswer;
    return correct
  }

  function dataToString(data) {
    const n = Number(data.neznama);
    let zadaniStr = "";
    for (let i = 0; i < data.zadani.length; i++) {
      if (i)
        zadaniStr += " ";
      zadaniStr += i === n ? "…" : data.zadani[i];
    }
    return zadaniStr;
  }

  function moveToNextLevel(incorrectAnswersCurrent) {
    if (history.length + 1 < NUMBER_OF_TOTAL_EXERCISES_TO_GET_TO_NEXT_LEVEL) // +1 because the actual state is passed in parameter
      return false;

    let correct = 0;
    let correctString = "";
    let from = Math.max(history.length - NUMBER_OF_TOTAL_EXERCISES_TO_GET_TO_NEXT_LEVEL + 1, 0)
    for (let i = from; i < history.length; i++) {
      const incorrectAnswers = history[i][1].length;
      if (incorrectAnswers === 0) {
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
    console.debug((moveToNextLevel ? "Move to next level" : "Don't move to next level") + ". Correct " + correct + " out of " + NUMBER_OF_TOTAL_EXERCISES_TO_GET_TO_NEXT_LEVEL + ", min is " + NUMBER_OF_CORRECT_EXERCISES_TO_GET_TO_NEXT_LEVEL + ", summary: " + correctString);
    return moveToNextLevel;

  }

  function countCorrectInLast() {
    let correct = 0;
    let from = Math.max(history.length - NUMBER_OF_TOTAL_EXERCISES_TO_GET_TO_NEXT_LEVEL, 0)
    for (let i = from; i < history.length; i++) {
      const incorrectAnswers = history[i][1].length;
      if (incorrectAnswers === 0)
        correct++;
    }

    return correct;
  }


  function getNextLevel() {
    fetch(import.meta.env.VITE_API_BASE_URL + 'api/' + predmet + '/dalsi_cviceni/' + trida + '/' + cviceni)
      .then((res) => {
        return res.json();
      })
      .then((data) => {
        console.info("Next level is: " + JSON.stringify(data));
        cviceniNextRef.current = data;
        if (!data.end) {
          fetchExercise(data.id);
        }
        console.debug("Setting next cviceni: " + predmet + ", " + trida + ", " + cviceni);
        setNext({
          predmet: predmet,
          trida: trida,
          cviceni: data.id
        });
      });
  }

  function onDelete() {
    if (state.current !== STATE_THINKING) return;

    setAnswer(EMPTY);
  }

  function onShowMenu() {
    setMenuVisible(!menuVisible);
  }

  function onHome() {
    navigate("/");
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
    else if (event.key === "Backspace")
      setAnswer(answer.substring(0, answer.length - 1));
    else if (import.meta.env.DEV && event.key === "a") {
      const expectedAnswer = String(exercise.zadani[Number(exercise.neznama)]);
      setAnswer(expectedAnswer);
    } else if (event.key === "Enter")
      onSubmit()
  }

  return [STATE_LOADING, STATE_LOADING_NEXT].includes(state.current) ? (
    <>
      <LoadingScreen title={cviceniNextRef.current ? cviceniNextRef.current.nazev : ""}
                     text1={state.current == STATE_LOADING_NEXT ? "Výborně! Postupuješ na další cvičení." : ""}
                     text2="Nahrávám cvičení..."/>
    </>
  ) : state.current == STATE_END ? (
    <>
      <EndScreen/>
    </>
  ) : menuVisible ? (
    <>
      <MenuScreen onHome={onHome} cviceniCelkem={history.length} spravnychVPoslednich={countCorrectInLast()}
                  minSpravnych={NUMBER_OF_CORRECT_EXERCISES_TO_GET_TO_NEXT_LEVEL} poslednich={NUMBER_OF_TOTAL_EXERCISES_TO_GET_TO_NEXT_LEVEL} log={log}/>
      <ButtonMenu onShowMenu={onShowMenu} isMenuVisible={menuVisible}/>
    </>
  ) : (
    <>
      <Zadani exercise={exercise} answer={answer}
              showCorrect={state.current == STATE_ANSWERED && isCorrect()}
              showIncorrect={state.current == STATE_ANSWERED && !isCorrect()}/>

      <div id="tlacitka">
        <ButtonDigit value={1} onAddDigit={onAddDigit}/>
        <ButtonDigit value={2} onAddDigit={onAddDigit}/>
        <ButtonDigit value={3} onAddDigit={onAddDigit}/>
        <ButtonDigit value={4} onAddDigit={onAddDigit}/>
        <ButtonDigit value={5} onAddDigit={onAddDigit}/>
        <ButtonDigit value={6} onAddDigit={onAddDigit}/>
        <ButtonDigit value={7} onAddDigit={onAddDigit}/>
        <ButtonDigit value={8} onAddDigit={onAddDigit}/>
        <ButtonDigit value={9} onAddDigit={onAddDigit}/>
        <ButtonDigit value={0} onAddDigit={onAddDigit}/>

        <ButtonSubmit onSubmit={onSubmit}/>
        <ButtonDelete onDelete={onDelete}/>
      </div>

      <ButtonMenu onShowMenu={onShowMenu} isMenuVisible={menuVisible}/>

      {message != null &&
        <div id="message">{message}</div>}
    </>
  );
}

function Zadani({exercise, answer, showCorrect, showIncorrect}) {
  // Experimentally set the font-size
  //   exercise.zadani.length     font-size
  //   5                          17
  //   7                          13
  //   9                           9
  const fontSize1 = 17;
  const length1 = 5;
  const deltaPerUnitLength = -2;

  let fontSize = exercise == null ? fontSize1 : (exercise.zadani.length - length1) * deltaPerUnitLength + fontSize1;
  console.debug("Zadani font-size: " + fontSize);
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
      alt="Submit"/>
  );
}

function ButtonDelete({onDelete}) {
  return (
    <img
      id="delete"
      className="icon"
      onClick={onDelete}
      src="/images/backspace_24dp_FILL0_wght400_GRAD0_opsz24.svg"
      alt="Delete"/>
  );
}

function ButtonMenu({onShowMenu, isMenuVisible}) {
  return (
    <img
      id="menu"
      className="icon"
      onClick={onShowMenu}
      src={isMenuVisible ? "/images/close_24dp_5F6368_FILL0_wght400_GRAD0_opsz24.svg" : "/images/menu_24dp_FILL0_wght400_GRAD0_opsz24.svg"}
      alt="Menu"/>
  );
}

function IconCorrect({isVisible}) {
  return isVisible ? (
    <img
      id="correct"
      src="/images/correct__check_24dp_FILL0_wght400_GRAD0_opsz24.svg"
      alt="Correct"/>
  ) : (
    <></>
  );
}

function IconIncorrect({isVisible}) {
  return isVisible ? (
    <img
      id="incorrect"
      src="/images/incorrect__close_24dp_FILL0_wght400_GRAD0_opsz24.svg"
      alt="Incorrect"/>
  ) : (
    <></>
  );
}

function LoadingScreen({title, text1, text2}) {
  return (
    <div id="loading">
      <p>{text1}</p>
      <h3>{title}</h3>
      <p>{text2}</p>
    </div>
  );
}

function EndScreen() {
  let navigate = useNavigate();

  function onClick() {
    navigate("/");
  }

  return (
    <div id="loading">
      <p>Výborně!</p>
      <p>Vyřešil jsi všechna cvičení v této třídě.</p>

      <img
        className="icon"
        onClick={onClick}
        src="/images/send_24dp_FILL0_wght400_GRAD0_opsz24.svg"
        alt="Přejít na rozcestník"/>
    </div>
  );
}

function MenuScreen({onHome, cviceniCelkem, spravnychVPoslednich, minSpravnych, poslednich, log}) {
  return (
    <div id="menuScreen">
      <div id="state">
        {cviceniCelkem < poslednich ? (
          <p>Máš správně {spravnychVPoslednich} z posledních {poslednich} příkladů. Zatím bylo jen {cviceniCelkem} příkladů.</p>
        ) : (
          <p>Máš správně {spravnychVPoslednich} z posledních {poslednich} příkladů.</p>
        )}
        <p>Pro postup do dalšího cvičení musíš mít správně {minSpravnych} z posledních {poslednich} příkladů.</p>
      </div>

      <table id="history">
        <thead>
        <tr>
          <th>Čas</th>
          <th>Předmět</th>
          <th>Třída</th>
          <th>Cvičení</th>
          <th>Událost</th>
          <th>Zadání</th>
          <th>Odpověď<br/>očekávaná</th>
          <th>Odpověď<br/>skutečná</th>
          <th>Hodnocení</th>
          <th>Doba</th>
        </tr>
        </thead>
        <tbody>
        {Object.keys(log).map(i => {
          const l = log[i];

          const date = new Date(l.timestamp);
          const year = date.getFullYear();
          const month = date.getMonth();
          const monthStr = (month < 9 ? "0" : "") + (month + 1);
          const day = date.getDate();
          const dayStr = (day <= 9 ? "0" : "") + day;

          const hour = date.getHours();
          const hourStr = (hour <= 9 ? "0" : "") + hour;
          const minute = date.getMinutes();
          const minuteStr = (minute <= 9 ? "0" : "") + minute;
          const second = date.getSeconds();
          const secondStr = (second <= 9 ? "0" : "") + second;
          const millisecond = date.getMilliseconds();
          let millisecondStr = ["000", millisecond].join("");
          millisecondStr = millisecondStr.substring(millisecondStr.length - 3);

          const timeStr = year + "-" + monthStr + "-" + dayStr + " " + hourStr + ":" + minuteStr + ":" + secondStr + "." + millisecondStr;

          const durationRounded = l.duration != "" ? Math.round(l.duration / 100) / 10 : "";

          const highlightRow = ["Start", "Další cvičení"].includes(l.event) ? "cell-highlight-start" : "";
          const highlight = l.correctIndicator == "Chyba" ? "cell-highlight-incorrect" : "";

          return (
            <tr key={i} className={highlightRow}>
              <td>{timeStr}</td>
              <td>{l.predmet}</td>
              <td>{l.trida}</td>
              <td>{l.cviceni}</td>
              <td>{l.event}</td>
              <td>{l.exercise}</td>
              <td>{l.answerExpected}</td>
              <td>{l.answerActual}</td>
              <td className={highlight}>{l.correctIndicator}</td>
              <td>{durationRounded}</td>
            </tr>
          )
        })}
        </tbody>
      </table>

      <ButtonHome onHome={onHome}/>
    </div>
  );
}

function ButtonHome({onHome}) {
  return (
    <img
      id="home"
      className="icon"
      onClick={onHome}
      src="/images/home_24dp_FILL0_wght400_GRAD0_opsz24.svg"
      alt="Přejít na rozcestník"/>
  );
}
