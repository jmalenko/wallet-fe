import {useNavigate, Link} from "react-router-dom";
import useFetch from './useFetch.js';
import {useEffect} from "react";

export default function Welcome() {
  const {myFetch, data, loading, error} = useFetch(import.meta.env.VITE_API_BASE_URL + 'getUsers');
  const {myFetch: myFetchCreateUser, data: dataCreateUser, loading: loadingCreateUser, error: errorCreateUser} =
    useFetch(import.meta.env.VITE_API_BASE_URL + 'createUser', true);
  let navigate = useNavigate();

  function onCreateUser() {
    myFetchCreateUser()
  }

  useEffect(() => {
    if (dataCreateUser) {
      myFetch();
    }
  }, [dataCreateUser])

  return (
    <main>
      <h1>Welcome to Wallet app</h1>

      <h2>Users</h2>

      <p><em>Instead of a proper user management (with user creation and logging in), just select a user you want to become or create a new user.</em></p>

      {loading && <p className="loading">List of users is loading...</p>}
      {error && <p className="error">Error: {error.message}</p>}
      {data &&
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
                  <Link to={`/user/${user.id}`}>{user.name}</Link>
                </td>
              </tr>
            )
          })}
          </tbody>
        </table>
      }

      <br/>
      <button onClick={onCreateUser}>Create a new user</button>
      {loadingCreateUser && <p className="loading">Creating a new user...</p>}
      {errorCreateUser && <p className="error">Error: {errorCreateUser.message}</p>}
      {dataCreateUser &&
        <p>
          User created with name <Link to={`/user/${dataCreateUser.id}`}>{dataCreateUser.name}</Link>.
        </p>
      }
    </main>
  )
}
