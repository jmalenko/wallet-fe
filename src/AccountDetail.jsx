import {useState, useEffect} from "react";
import {useParams, useNavigate, Link} from 'react-router-dom';
import {amountToString} from "./shared.js";

export default function AccountDetail() {
  let {accountId} = useParams();
  const [accountInfo, setAccountInfo] = useState();
  const [transactions, setTransactions] = useState();
  const [dailyBalances, setDailyBalances] = useState();
  let navigate = useNavigate();

  useEffect(() => {
    try {
      fetch('http://localhost:8080/wallet/' + 'getAccountInfo/' + accountId)
        .then((res) => {
          return res.json();
        })
        .then((data) => {
          setAccountInfo(data);
        });
    } catch (error) {
      console.error("Error: " + error.message);
    }
  }, []);

  useEffect(() => {
    try {
      fetch('http://localhost:8080/wallet/' + 'getTransactions/' + accountId)
        .then((res) => {
          return res.json();
        })
        .then((data) => {
          setTransactions(data);
        });
    } catch (error) {
      console.error("Error: " + error.message);
    }
  }, []);

  useEffect(() => {
    try {
      fetch('http://localhost:8080/wallet/' + 'getDailyBalances/' + accountId)
        .then((res) => {
          return res.json();
        })
        .then((data) => {
          setDailyBalances(data);
        });
    } catch (error) {
      console.error("Error: " + error.message);
    }
  }, []);

  function onReceiveExternal() {
    try {
      fetch('http://localhost:8080/wallet/' + 'receiveExternal/' + accountId)
        .then((res) => {
          return res.json();
        })
        .then((data) => {
          alert("You received " + amountToString(data.amount) + " " + accountInfo?.currency + ". Let's reload the page.")
          window.location.reload();
        });
    } catch (error) {
      console.error("Error: " + error.message);
    }
  }

  function onSendExternal() {
    navigate("/transfer/" + accountId + "/external")
  }

  function onSendInternal() {
    navigate("/transfer/" + accountId + "/internal")
  }

  return (
    <main>
      <h1>Account detail</h1>

      <table>
        <tbody>
        <tr>
          <td>Account Id</td>
          <td>{accountId}</td>
        </tr>
        <tr>
          <td>Currency</td>
          <td>{accountInfo?.currency}</td>
        </tr>
        <tr>
          <td>Balance</td>
          <td>
            {accountInfo &&
              <Amount amount={accountInfo.balance}/>
            }
          </td>
        </tr>
        </tbody>
      </table>

      <br/>
      <button onClick={onReceiveExternal}>Deposit money from external account</button>
      <br/>
      <br/>
      <button onClick={onSendExternal}>Withdraw money to external account</button>
      <br/>
      <br/>
      <button onClick={onSendInternal}>Send money to an account (that can be owned by another user)</button>

      <h2>Transactions</h2>

      <table>
        <thead>
        <tr>
          <th>Date</th>
          <th>Reference</th>
          <th>Counterparty</th>
          <th>Amount</th>
        </tr>
        </thead>
        <tbody>
        {transactions && (0 < transactions.length ?
            transactions.map(transaction => {
              let counterpartyText = transaction.counterpartyAccount.id ? "internal " + transaction.counterpartyAccount.id : "external " + transaction.counterpartyAccount;
              return (
                <tr key={transaction.id}>
                  <td>{transaction.created}</td>
                  <td>{transaction['reference']}</td>
                  <td>{counterpartyText}</td>
                  <td><Amount amount={transaction.amount}/></td>
                </tr>
              )
            })
            :
            (
              <p>No data.</p>
            )
        )}
        </tbody>
      </table>


      <h2>Daily balances</h2>

      <table>
        <thead>
        <tr>
          <th>Date</th>
          <th>Amount</th>
        </tr>
        </thead>
        <tbody>
        {dailyBalances && (0 < dailyBalances.length ?
            dailyBalances.map(dailyBalance => {
              return (
                <tr key={dailyBalance.date}>
                  <td>{dailyBalance.date}</td>
                  <td><Amount amount={dailyBalance.amount}/></td>
                </tr>
              )
            })
            :
            (
              <p>No data.</p>
            )
        )}
        </tbody>
      </table>
    </main>
  )
}

function Amount({amount}) {
  return (
    <div>{amountToString(amount)}</div>
  );
}
