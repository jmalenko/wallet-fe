import "./Welcome.css";
import {useState, useEffect} from "react";
import {useNavigate} from 'react-router-dom';

export default function Welcome() {
  const [seznamTridy, setSeznamTridy] = useState();
  const [seznamCviceni, setSeznamCviceni] = useState();

  const [predmet, setPredmet] = useState("matematika");
  const [trida, setTrida] = useState();
  const [cviceni, setCviceni] = useState();

  let navigate = useNavigate();

  useEffect(() => {
    fetch('http://localhost:8000/' + predmet + '/seznam_tridy')
      .then((res) => {
        return res.json();
      })
      .then((data) => {
        // console.log("Response: " + JSON.stringify(data));
        setSeznamTridy(data);
        setTrida(Object.keys(data)[0]);
      });
  }, []);

  useEffect(() => {
    fetch('http://localhost:8000/' + predmet + '/seznam_cviceni/' + (trida || 1))
      .then((res) => {
        return res.json();
      })
      .then((data) => {
        // console.log("Response: " + JSON.stringify(data));
        setSeznamCviceni(data);
        setCviceni(Object.keys(data)[0]);
      });
  }, [trida]);

  function onClickStart() {
    navigate("/" + predmet + "/" + trida + "/" + cviceni)
  }

  function onChangeTrida(event) {
    setTrida(event.target.value)
  }

  function onChangeCviceni(event) {
    setCviceni(event.target.value)
  }

  return (
    <main>
      <table>
        <tbody>

        <tr>
          <td><label>Předmět:</label></td>
          <td>
            <select id="predmet" className="empty" disabled>
              <option value="math">Matematika</option>
            </select>
          </td>
        </tr>

        <tr>
          <td><label>Třída:</label></td>
          <td>
            <select onChange={onChangeTrida}>{
              seznamTridy !== undefined && Object.keys(seznamTridy).map(id => (
                <option key={id} value={id}>{seznamTridy[id]}</option>))
            }</select>
          </td>
        </tr>

        <tr>
          <td><label>Cvičení:</label></td>
          <td>
            <select onChange={onChangeCviceni}>{
              seznamCviceni !== undefined && Object.keys(seznamCviceni).map(id => (
                <option key={id} value={id}>{id}: {seznamCviceni[id]}</option>))
            }</select>
          </td>
        </tr>

        </tbody>
      </table>

      <button onClick={onClickStart}>Start</button>
    </main>
  );
}
