import {useState, useEffect} from "react";
import {Link} from "react-router-dom";

export default function Welcome() {
  const [users, setUsers] = useState();

  useEffect(() => {
    try {
      fetch(import.meta.env.VITE_API_BASE_URL + 'getUsers')
        .then((res) => {
          return res.json();
        })
        .then((data) => {
          // console.debug("Data: " + JSON.stringify(data));
          setUsers(data);
      });
    } catch (error) {
      // FUTURE Handle errors better in the entire app
      console.error("Error: " + error.message);
    }
  }, []);

  function onCreateUser() {
    navigate("/createUser")
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

      <button onClick={onCreateUser}>Create a new user</button>
    </main>
  )
}
