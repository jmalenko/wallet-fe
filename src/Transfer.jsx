import {useState, useEffect} from "react";
import {useParams, useNavigate, Link} from 'react-router-dom';
import {numberToAmount} from "./shared.js";


export default function Transfer() {
  let {accountId} = useParams();
  let {type} = useParams();
  let navigate = useNavigate();

  const [formData, setFormData] = useState({
    counterpartyAccountId: "",
    amount: "",
    reference: "",
    errors: {},
    loading: false,
  });

  const title = type === "external" ? "Withdraw" : "Transfer";
  const endPoint = type === "external" ? "sendExternal" : "sendInternal";

  const handleChange = (event) => {
    const {name, value} = event.target;
    setFormData((prevState) => ({...prevState, [name]: value}));
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.counterpartyAccountId) {
      errors.counterpartyAccountId = "Counterparty account Id is required";
    }

    if (!formData.amount) {
      errors.amount = "Amount is required";
    } else {
      if (isNaN(formData.amount)) {
        errors.amount = "Amount must be a number";
      } else if (formData.amount < 0) {
        errors.amount = "Amount must be a positive number";
      }
    }

    setFormData((prevState) => ({...prevState, errors}));

    return Object.keys(errors).length === 0;
  };

  function handleError(error) {
    alert(error);
  }

  const handleSubmit = (event) => {
    event.preventDefault();
    if (validateForm()) {
      setFormData((prevState) => ({...prevState, loading: true}));

      var resultStatus;
      try {
        let amount = numberToAmount(formData.amount);
        fetch(import.meta.env.VITE_API_BASE_URL + endPoint + '/' + accountId + '/' + encodeURIComponent(formData.counterpartyAccountId) + '/' + amount.whole + '/' + amount.decimal + '/' + encodeURIComponent(formData.reference))
          .then((res) => {
            resultStatus = res.status;
            return res.json();
          })
          .then((data) => {
            setFormData((prevState) => ({...prevState, loading: false}));
            if (resultStatus === 200) {
              alert("Transaction created with id " + data.id + ". Let's navigate to the account detail.");
              navigate("/account/" + accountId);
            } else {
              handleError("Cannot process transaction: " + data.message);
            }
          })
          .catch((err) => {
            handleError("Cannot process transaction: " + err.message);
          });
      } catch (error) {
        setFormData((prevState) => ({...prevState, loading: false}));
        handleError(error.message);
      }
    }
  };

  return (
    <>
      <h1>{title}</h1>

      <form onSubmit={handleSubmit}>
        <div className="form-item">
          <label>Counterparty account Id:</label>
          <input type="text" name="counterpartyAccountId" value={formData.counterpartyAccountId} onChange={handleChange}/>
          {formData.errors.counterpartyAccountId && (
            <p>{formData.errors.counterpartyAccountId}</p>
          )}
        </div>

        <div className="form-item">
          <label>Amount:</label>
          <input type="text" name="amount" value={formData.amount} onChange={handleChange}/>
          {formData.errors.amount && (
            <p>{formData.errors.amount}</p>
          )}
        </div>

        <div className="form-item">
          <label>Reference:</label>
          <input type="text" name="reference" value={formData.reference} onChange={handleChange}/>
          {formData.errors.reference && (
            <p>{formData.errors.reference}</p>
          )}
        </div>

        <input type="submit" value="Submit" disabled={formData.loading}/>
        {formData.loading && (
          <div>Loading...</div>
        )}
      </form>

      <br/>
      <Link to={`/account/${accountId}`}>Back to account detail</Link>
    </>
  );

}
