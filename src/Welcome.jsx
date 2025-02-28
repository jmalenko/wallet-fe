import {useNavigate, Link} from "react-router-dom";
import useFetch from './useFetch.js';

export default function Welcome() {
  const {data, loading, error} = useFetch(import.meta.env.VITE_API_BASE_URL + 'getUsers');
  let navigate = useNavigate();

  function onCreateUser() {
    try {
      fetch(import.meta.env.VITE_API_BASE_URL + 'createUser')
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

      <p><em>Instead of a proper user management (with user creation and logging in), just select a user you want to become or create a new user.</em></p>

      {loading && <p className="loading">List of users is loading...</p>}
      {error && <p className="error">Error: {error.message}</p>}
      {data && (
        <table>
          <thead>
          <tr>
            <th>User name</th>
          </tr>
          </thead>
          <tbody>
          {data.map(user => {
            return (
              <tr key={user.id}>
                <td>
                  <Link to={`/user/${user.id}`}>X {user.name}</Link>
                </td>
              </tr>
            )
          })}
          </tbody>
        </table>
      )}

      <br/>
      <button onClick={onCreateUser}>Create a new user</button>
    </main>
  )
}
