import React from 'react'
import ReactDOM from 'react-dom/client'
import {createBrowserRouter, RouterProvider} from "react-router-dom"
import Welcome from './Welcome'
import App from "./App.jsx";
import ErrorPage from "./ErrorPage.jsx";
import UserDetail from "./UserDetail.jsx";
import AccountDetail from "./AccountDetail.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App/>,
    errorElement: <ErrorPage/>,
    children: [
      {
        index: true,
        element: <Welcome/>,
      }, {
        path: "createUser",
        element: <Welcome/>,
      }, {
        path: "user/:userId",
        element: <UserDetail/>,
      }, {
        path: "account/:accountId",
        element: <AccountDetail/>,
      }, {
        path: "deposit/:accountId",
        element: <Welcome/>,
      }, {
        path: "withdrawal/:accountId",
        element: <Welcome/>,
      }, {
        path: "transfer/:accountId",
        element: <Welcome/>,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  // <React.StrictMode>
  <RouterProvider router={router}/>
  // </React.StrictMode>
)