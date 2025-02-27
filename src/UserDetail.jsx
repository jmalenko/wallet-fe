import {useState, useEffect} from "react";
import {useParams} from 'react-router-dom';
import {Link} from "react-router-dom";

export default function UserDetail() {
  let {userId} = useParams();
  const [accounts, setAccounts] = useState();

  useEffect(() => {
    try {
      fetch('http://localhost:8080/wallet/' + 'getAccounts/' + userId)
        .then((res) => {
          return res.json();
        })
        .then((data) => {
          setAccounts(data);
      });
    } catch (error) {
      console.error("Error: " + error.message);
    }
  }, []);

  return (
    <main>
      <h1>User detail</h1>

      <h2>Accounts</h2>

      <table>
        <thead>
        <tr>
          <th>Account Id</th>
          <th>Currency</th>
        </tr>
        </thead>
        <tbody>
          {accounts && accounts.map(account => {
            return (
              <tr key={account.id}>
                <td>
                  <Link to={`/account/${account.id}`}>{account.id}</Link>
                </td>
                <td>
                  {account.currency}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </main>
  )
}
