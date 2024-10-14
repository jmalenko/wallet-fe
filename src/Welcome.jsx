import {useState, useEffect} from "react";
import {useNavigate} from 'react-router-dom';
import {useLocalStorage} from "./useLocalStorage.js";
import {doneContains} from "./shared.js";

export default function Welcome() {
  const [seznamTridy, setSeznamTridy] = useState();
  const [seznamCviceni, setSeznamCviceni] = useState();

  const [predmet, setPredmet] = useState("matematika");
  const [trida, setTrida] = useState();
  const [cviceni, setCviceni] = useState();

  const [firstLoad, setFirstLoad] = useState(true);

  let navigate = useNavigate();

  const [done, setDone] = useLocalStorage("done", JSON.stringify([]));
  const [next, setNext] = useLocalStorage("next", JSON.stringify({}));

  console.debug("Done: " + JSON.stringify(done));
  console.debug("Next: predmet=" + next.predmet + ", trida=" + next.trida + ", cviceni=" + next.cviceni);

  useEffect(() => {
    fetch(import.meta.env.VITE_API_BASE_URL + 'api/' + predmet + '/seznam_tridy')
      .then((res) => {
        return res.json();
      })
      .then((data) => {
        // console.debug("Data: " + JSON.stringify(data));
        setSeznamTridy(data);
        setTrida(firstLoad && next && next.hasOwnProperty('trida')
          ? next.trida
          : Object.keys(data)[0]);
      });
  }, []);

  useEffect(() => {
    fetch(import.meta.env.VITE_API_BASE_URL + 'api/' + predmet + '/seznam_cviceni/' + (trida || 1))
      .then((res) => {
        return res.json();
      })
      .then((data) => {
        // console.debug("Data: " + JSON.stringify(data));
        setSeznamCviceni(data);
        setCviceni((firstLoad && next && next.hasOwnProperty('cviceni')) || next.trida === trida
          ? next.cviceni
          : Object.keys(data)[0]);
        setFirstLoad(false);
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
    <main id="welcome">
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
            <select onChange={onChangeTrida} value={trida}>{
              seznamTridy !== undefined && Object.keys(seznamTridy).map(id => (
                <option key={id} value={id}>{seznamTridy[id]}</option>))
            }</select>
          </td>
        </tr>

        <tr>
          <td><label>Cvičení:</label></td>
          <td>
            <select onChange={onChangeCviceni} value={cviceni}>{
              seznamCviceni !== undefined && Object.keys(seznamCviceni).map(id => {
                  let passed = doneContains(done, {predmet: predmet, trida: trida, cviceni: id});
                  let className = passed ? "passed" : "";
                  let mark = passed ? " ✔" : "" // For: 1. Accessibility, 2. Firefox doesn't set the background with pure CSS (only programmatically)
                  return (
                    <option key={id} value={id} className={className}>{id}: {seznamCviceni[id]}{mark}</option>
                  )
                }
              )
            }</select>
          </td>
        </tr>

        </tbody>
      </table>

      <img
        id="start"
        className="icon"
        onClick={onClickStart}
        src="/images/play_arrow_24dp_5F6368_FILL0_wght400_GRAD0_opsz24.svg"
        alt="Start"/>
    </main>
  );
}
