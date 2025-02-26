import {useState, useEffect} from "react";
import {useParams} from 'react-router-dom';

export default function AccountDetail() {
  let {accountId} = useParams();
  const [accountInfo, setAccountInfo] = useState();
  const [balance, setBalance] = useState();
  const [transactions, setTransactions] = useState();
  const [dailyBalances, setDailyBalances] = useState();

  useEffect(() => {
    try {
      fetch(import.meta.env.VITE_API_BASE_URL + 'getAccountInfo/' + accountId)
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
      fetch(import.meta.env.VITE_API_BASE_URL + 'getTransactions/' + accountId)
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
      fetch(import.meta.env.VITE_API_BASE_URL + 'getDailyBalances/' + accountId)
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
  // Proper formatting
  var real = amount.whole + amount.decimal / 100;
  var text = (real).toLocaleString(undefined, {minimumFractionDigits: 2});

  return (
    <div>{text}</div>
  );
}
