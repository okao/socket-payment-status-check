import ReactDOM from 'react-dom/client';
import Application from './Application';
import SocketContextComponent from './contexts/SocketContextComponent';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
    <SocketContextComponent>
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Application />} />
                <Route path="/login" element={<Login />} />
            </Routes>
        </BrowserRouter>
    </SocketContextComponent>
);
