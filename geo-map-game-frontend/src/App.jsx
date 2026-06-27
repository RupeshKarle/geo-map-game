// import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HashRouter, Routes, Route } from 'react-router-dom';
import Layout from "./components/Layout";
import ProtectedRoute from './components/ProtectedRoute';

import Login from './pages/Login';
import Register from './pages/Register';
import Locations from './pages/Locations';
import Game from './pages/Game';
import Leaderboard from './pages/Leaderboard';
import Admin from './pages/Admin';
import AdminReq from './pages/AdminReq';
import ManageGroup from './pages/ManageGroup';
import Group from './pages/Group';
import Profile from './pages/Profile';
import SendInvite from './pages/SendInvite';
import GroupInvite from './pages/GroupInvite';
import { useEffect } from 'react';
import { connectSocket, getSocket } from './services/socketService.js';
import api from './api/axios.js';

function App() {

  useEffect(() => {

    const init = async () => {

      const token = localStorage.getItem("token");

      if (!token) return;

      try {

        // validate token
        await api.get("/users/profile");

        connectSocket(token);

      } catch (err) {

        console.log("TOKEN INVALID", { err });

      }
    };

    init();

  }, []);


  return (
    <HashRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Secured Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/" element={<Locations />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/admin-req" element={<AdminReq />} />
            <Route path="/game/:locationId" element={<Game />} />
            <Route path="/manage-group" element={<ManageGroup />} />
            <Route path="/group/:groupId" element={<Group />} />
            <Route path="/invite" element={<SendInvite />} />
            <Route path="/group-invite" element={<GroupInvite />} />
          </Route>
        </Route>
      </Routes>
    </HashRouter>
  );
}

export default App;