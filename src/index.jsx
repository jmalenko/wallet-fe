import React from 'react'
import ReactDOM from 'react-dom/client'
import {createBrowserRouter, RouterProvider, Outlet} from "react-router-dom"
import MathPractice from './MathPractice.jsx'
import Welcome from './Welcome'
import App from "./App.jsx";
import ErrorPage from "./ErrorPage.jsx";

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
        path: "matematika/:trida/:cviceni",
        element: <MathPractice/>,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  // <React.StrictMode>
    <RouterProvider router={router}/>
  // </React.StrictMode>
)