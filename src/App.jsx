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

  const [value, setValue] = useState(EMPTY);
  const [state, setState] = useState(STATE_THINKING);
  const [result, setResult] = useState(RESULT_NOT_DEFINED);

  function onAddDigit(digit) {
    if (state != STATE_THINKING)
      return
    
    if (value.length < MAX_LENGHT) {
      setValue(value + digit);
    } // TODO else show message
  }

  function onSubmit() {
    setState(STATE_ANSWERED)
    if (value == 34) {
      setResult(RESULT_CORRECT)

      setTimeout(() => {
          setState(STATE_THINKING)
          setValue(EMPTY)
          setResult(RESULT_NOT_DEFINED)
      }, 3000);
    } else {
      setResult(RESULT_INCORRECT)

      setTimeout(() => {
        setState(STATE_THINKING)
        setValue(EMPTY)
        setResult(RESULT_NOT_DEFINED)
      }, 3000);
    }
  }

  function onDelete() {
    if (state != STATE_THINKING)
      return

    setValue(EMPTY);
  }

  function onShowMenu() {}

  return (
    <main>
      <div id="zadani">
        <span id="operand1">12</span>
        <span id="operator">+</span>
        <span id="neznama">
          <span id="operand2">{value}</span>
        </span>
        <span id="rovnase">=</span>
        <span id="vysledek">46</span>
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

      {/* <ButtonMenu onShowMenu={onShowMenu} /> */}

      <IconCorrect isVisible={result == RESULT_CORRECT} />
      <IconIncorrect isVisible={result == RESULT_INCORRECT} />
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
    <p></p>
  );
}

function IconIncorrect({ isVisible }) {
  return isVisible ? (
    <img
      id="incorrect"
      src="images/close_24dp_FILL0_wght400_GRAD0_opsz24.svg"
    ></img>
  ) : (
    <p></p>
  );
}
