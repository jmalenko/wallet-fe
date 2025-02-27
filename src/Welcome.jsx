import {useState, useEffect} from "react";
import {useNavigate, Link} from "react-router-dom";

export default function Welcome() {
  const [users, setUsers] = useState();
  let navigate = useNavigate();

  useEffect(() => {
    try {
      fetch('http://localhost:8080/wallet/' + 'getUsers')
        .then((res) => {
          return res.json();
        })
        .then((data) => {
          // console.debug("Data: " + JSON.stringify(data));
          setUsers(data);
        })
        .catch(reason => {
          console.error("Error: " + reason);
        });
    } catch (error) {
      // FUTURE Handle errors better in the entire app
      console.error("Error: " + error.message);
    }
  }, []);

  function onCreateUser() {
    try {
      fetch('http://localhost:8080/wallet/' + 'createUser')
        .then((res) => {
          return res.json();
        })
        .then((data) => {
          alert("User created with id " + data.id + ". Let's navigate to the user detail.")
          navigate("/user/" + data.id)
        });
    } catch (error) {
      console.error("Error: " + error.message);
    }
  }

  return (
    <main>
      <h1>Welcome to Wallet app</h1>

      <h2>Users</h2>

      <p>Instead of a proper user management (with user creation and logging in), just select a user you want to become or create a new user.</p>

      <table>
        <thead>
        <tr>
          <th>User name</th>
        </tr>
        </thead>
        <tbody>
        {users && users.map(user => {
          return (
            <tr key={user.id}>
              <td>
                <Link to={`/user/${user.id}`}>{user.name}</Link>
              </td>
            </tr>
          )
        })}
        </tbody>
      </table>

      <br/>
      <button onClick={onCreateUser}>Create a new user</button>
    </main>
  )
}
