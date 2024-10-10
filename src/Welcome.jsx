import {useState, useEffect} from "react";
import {useNavigate} from 'react-router-dom';
import {CookiesProvider, useCookies} from 'react-cookie';

export default function Welcome() {
  const [seznamTridy, setSeznamTridy] = useState();
  const [seznamCviceni, setSeznamCviceni] = useState();

  const [predmet, setPredmet] = useState("matematika");
  const [trida, setTrida] = useState();
  const [cviceni, setCviceni] = useState();

  const [firstLoad, setFirstLoad] = useState(true);

  let navigate = useNavigate();

  const [cookies, setCookie] = useCookies();

  console.log("Next: trida=" + cookies.tridaNext + ", cviceni=" + cookies.cviceniNext);

  useEffect(() => {
     fetch(import.meta.env.VITE_API_BASE_URL + 'api/' + predmet + '/seznam_tridy')
      .then((res) => {
        return res.json();
      })
      .then((data) => {
        // console.log("Response: " + JSON.stringify(data));
        setSeznamTridy(data);
        setTrida(firstLoad && cookies.tridaNext
          ? cookies.tridaNext
          : Object.keys(data)[0]);
      });
  }, []);

  useEffect(() => {
    fetch(import.meta.env.VITE_API_BASE_URL + 'api/' + predmet + '/seznam_cviceni/' + (trida || 1))
      .then((res) => {
        return res.json();
      })
      .then((data) => {
        // console.log("Response: " + JSON.stringify(data));
        setSeznamCviceni(data);
        setCviceni((firstLoad && cookies.cviceniNext) || cookies.tridaNext == trida
          ? cookies.cviceniNext
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
