import { Suspense } from 'react';
import { Main } from './containers/Main';
// import { Uzd } from './containers/Uzd';
import { ZunStables } from './containers/ZunStables';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import './App.scss';
import 'bootstrap/dist/css/bootstrap.css';
import { Preloader } from './components/Preloader/Preloader';
// import { Earn } from './containers/Earn';

const router = createBrowserRouter([
    {
        path: '/',
        element: <Main />,
    },
    // {
    //     path: '/zun',
    //     element: <Uzd />,
    // },
    {
        path: '/zun-stables',
        element: <ZunStables />,
    },
    // {
    //     path: '/earn',
    //     element: <Earn />,
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
