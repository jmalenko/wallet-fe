import "./styles.css";
import {Link, Outlet} from "react-router-dom";

export default function App() {
  return (
    <main>
      <Outlet/>

      <hr/>
      <Link to="/">Home</Link>
    </main>
  );
}