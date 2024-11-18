import {useEffect, useState} from "react";
import {useParams} from "react-router-dom";
import {dataToString} from "./shared.js";

export default function MathPracticePrint() {

  const [exercises, setExercises] = useState();

  const [predmet, setPredmet] = useState("matematika");
  let {trida} = useParams();
  let {cviceni} = useParams();

  useEffect(() => {
    fetch(import.meta.env.VITE_API_BASE_URL + 'api/' + predmet + '/' + trida + '/' + cviceni + '/tisk')
      .then((res) => {
        return res.json();
      })
      .then((data) => {
        setExercises(data);
        setTimeout(() => window.print(), 1);
      })
  }, []);

  return exercises !== undefined ? (
    <div id="print" onLoad="window.print()">
      <h1>{exercises.nazev_cviceni}</h1>
      {Object.values(exercises.priklady).map(priklad => {
        return (
          <div>{dataToString(priklad)}</div>
        )
      })}
    </div>
  ) : (
    <div>Nahrávám</div>
  );
}
