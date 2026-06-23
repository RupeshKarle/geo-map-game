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
          <Route path="/" element={<Layout><Locations /></Layout>} />
          <Route path="/profile" element={<Layout><Profile /></Layout>} />
          <Route path="/leaderboard" element={<Layout><Leaderboard /></Layout>} />
          <Route path="/admin" element={<Layout><Admin /></Layout>} />
          <Route path="/admin-req" element={<Layout><AdminReq /></Layout>} />
          <Route path="/game/:locationId" element={<Game />} />
          <Route path="/manage-group" element={<Layout><ManageGroup /></Layout>} />
          <Route path="/group/:groupId" element={<Layout><Group /></Layout>} />
          <Route path="/invite" element={<Layout><SendInvite /></Layout>} />
          <Route path="/group-invite" element={<Layout><GroupInvite /></Layout>} />
        </Route>
      </Routes>
    </HashRouter>
  );
}

export default App;