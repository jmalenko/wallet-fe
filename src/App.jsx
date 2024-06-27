import "./App.css";
import { useState } from "react";

export default function App() {
  const [value, setValue] = useState("");

  function onAddDigit(digit) {
    setValue(value + digit);
  }

  return (
    <main>
      <div id="zadani">
        <span id="operand1">12</span>
        <span id="operator1">+</span>
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

        <object
          id="odeslat"
          data="images/send_24dp_FILL0_wght400_GRAD0_opsz24.svg"
          class="border"
        ></object>
        <object
          id="smazat"
          data="images/backspace_24dp_FILL0_wght400_GRAD0_opsz24.svg"
          class="border"
        ></object>
      </div>

      <div id="menu">
        <object
          id="menu"
          data="images/menu_24dp_FILL0_wght400_GRAD0_opsz24.svg"
          class="border"
        ></object>
      </div>
    </main>
  );
}

function ButtonDigit({ value, onAddDigit }) {
  const [state, setState] = useState(value);

  function handleClick() {
    onAddDigit(state);
  }

  return (
    <span onClick={handleClick} class="border">
      {value}
    </span>
  );
}
