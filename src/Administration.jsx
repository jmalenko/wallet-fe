import {useNavigate} from 'react-router-dom';
import {useLocalStorage} from "./useLocalStorage.js";
import Log from "./Log.jsx";

export default function Administration() {

  let navigate = useNavigate();

  function onHome() {
    navigate("/");
  }

  // ===

  const [log, setLog] = useLocalStorage("log", []);

  function onClearLocalStorage(event) {
    setLog([]); // Hack: This is here to update state.

    localStorage.clear(); // Clear localStorage
  }

  // ===

  return (
    <>
      <ButtonHome onHome={onHome}/>

      <div id="admin">
        <h4>Administrace</h4>
        Log has {log.length} items.
        <button onClick={onClearLocalStorage}>Clear localStorage</button>

        <h4>Log</h4>
        <Log log={log}/>
      </div>
    </>
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
