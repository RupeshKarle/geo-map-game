import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from "./components/Layout";

import Login from './pages/Login';
import Register from './pages/Register';
import Locations from './pages/Locations';
import Game from './pages/Game';
import Leaderboard from './pages/Leaderboard';
import Admin from './pages/Admin';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout><Locations /></Layout>} />
        <Route path="/leaderboard" element={<Layout><Leaderboard /></Layout>} />
        <Route path="/admin" element={<Layout><Admin /></Layout>} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/game/:locationId" element={<Game />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;