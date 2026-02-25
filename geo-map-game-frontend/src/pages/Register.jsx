import { useState } from 'react';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';

export default function Register() {
 const [email, setEmail] = useState('');
 const [password, setPassword] = useState('');
 const navigate = useNavigate();

 const handleRegister = async () => {
  try {
   const res = await api.post('/register', { email, password });
   navigate('/login');
  } catch (err) {
   alert('Registration failed');
  }
 };

 return (
  <div>
    <h2>Register</h2>
    <input placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
    <input placeholder="Password" type="password"
      onChange={(e) => setPassword(e.target.value)} />
    <button onClick={handleRegister}>Register</button>
  </div>
 );
}