import './App.css'

export default function App() {
  return (
    <main>
      <div id="zadani">
        <span id="operand1">12</span><span id="operator1">+</span><span id="neznama"><span
            id="operand2">34</span></span><span id="rovnase">=</span><span id="vysledek">46</span>
      </div>
  
      <div id="tlacitka">
        <span id="n1" class="border">1</span><span id="n2" class="border">2</span><span id="n3" class="border">3</span><span
          id="n4" class="border">4</span><span id="n5" class="border">5</span><span id="n6" class="border">6</span><span
          id="n7" class="border">7</span><span id="n8" class="border">8</span><span id="n9" class="border">9</span><span
          id="n0" class="border">0</span>
  
        <object id="odeslat" data="images/send_24dp_FILL0_wght400_GRAD0_opsz24.svg" class="border"></object>
        <object id="smazat" data="images/backspace_24dp_FILL0_wght400_GRAD0_opsz24.svg" class="border"></object>
      </div>
  
      <div id="menu">
        <object id="menu" data="images/menu_24dp_FILL0_wght400_GRAD0_opsz24.svg" class="border"></object>
      </div>
    </main>
  )
}
