import React, { Suspense } from 'react';
import { Main } from './containers/Main';
import { Uzd } from './containers/Uzd';
// import { Analytics } from './containers/Analytics';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import './App.scss';
import 'bootstrap/dist/css/bootstrap.css';
import { Preloader } from './components/Preloader/Preloader';

const router = createBrowserRouter([
    {
        path: '/',
        element: <Main />,
    },
    {
        path: '/zun',
        element: <Uzd />,
    },
    // {
    //     path: '/analytics',
    //     element: <Analytics />,
    // },
]);

function App() {
    return (
        <Suspense fallback={<Preloader onlyIcon={true} />}>
            <RouterProvider router={router} />
        </Suspense>
    );
}

export default App;
