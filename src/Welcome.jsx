import "./Welcome.css";
import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';

export default function Welcome() {
  const [predmet, setPredmet] = useState("matematika");
  const [seznam, setSeznam] = useState();
  const [selected, setSelected] = useState();
  let navigate = useNavigate();

  useEffect(() => {
    fetch('http://localhost:8000/' + predmet + '/seznam')
      .then((res) => {
        return res.json();
      })
      .then((data) => {
        // console.log("Response: " + JSON.stringify(data));
        setSeznam(data);
        setSelected(data[0][0]);
      });
  }, []);

  function onClick() {
    navigate("/" + predmet + "/" + selected)
  }

  function handleChange(event) {
    setSelected(event.target.value)
  }

  return (
    <main>
      <table>
      <tbody>
        {/*<tr>*/}
        {/*  <td><label>Třída:</label></td>*/}
        {/*  <td>*/}
        {/*    <select id="predmet" className="empty">*/}
        {/*      <option value="1">1. třída</option>*/}
        {/*      <option value="2">2. třída</option>*/}
        {/*    </select>*/}
        {/*  </td>*/}
        {/*</tr>*/}

        {/*<tr>*/}
        {/*  <td><label>Předmět:</label></td>*/}
        {/*  <td>*/}
        {/*    <select id="predmet" className="empty">*/}
        {/*      <option value="math">Matematika</option>*/}
        {/*      <option value="math">Český jazyk</option>*/}
        {/*    </select>*/}
        {/*  </td>*/}
        {/*</tr>*/}

        <tr>
          <td><label>Cvičení:</label></td>
          <td>
            <select onChange={handleChange}>{
              seznam !== undefined && seznam.map(x =>
                  <option key={x[0]} value={x[0]}>{x[0]}: {x[1]}</option> )
            }</select>
          </td>
        </tr>
        </tbody>
      </table>

      <button onClick={onClick}>Start</button>
    </main>
  );
}
