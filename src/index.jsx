import React from 'react'
import ReactDOM from 'react-dom/client'
import {
    createBrowserRouter,
    RouterProvider,
} from "react-router-dom"
import App from './App'
import Welcome from './Welcome'

const router = createBrowserRouter([
    {
        path: "/",
		    element: <Welcome/>,
    },
    {
        path: "matematika",
        element: <App/>,
    },
    {
        path: "matematika/:trida/:lekce",
        element: <App/>,
    },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
    <RouterProvider router={router}/>
)