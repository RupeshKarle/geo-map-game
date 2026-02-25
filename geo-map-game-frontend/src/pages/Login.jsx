import { useState } from 'react';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';

export default function Login() {
 const [email, setEmail] = useState('');
 const [password, setPassword] = useState('');
 const navigate = useNavigate();

 const handleLogin = async () => {
  try {
   const res = await api.post('/login', { email, password });

   localStorage.setItem('token', res.data.token);
   localStorage.setItem('user', JSON.stringify(res.data.user));

   navigate('/');
  } catch (err) {
   alert('Login failed');
  }
 };

 return (
  <div>
    <h2>Login</h2>
    <input placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
    <input placeholder="Password" type="password"
      onChange={(e) => setPassword(e.target.value)} />
    <button onClick={handleLogin}>Login</button>
  </div>
 );
}