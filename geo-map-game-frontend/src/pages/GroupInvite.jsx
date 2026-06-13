import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function GroupInvite() {
 const navigate = useNavigate();
 const [searchParam] = useSearchParams();
 const token = searchParam.get('token') || null;
 
 useEffect(() => {
  validateInvite();
 }, []);

 const validateInvite = async () => {
  try {
   const res = await api.post(`invites/validate`, {token});
   if (res.data.message) {
    alert(res.data.message);
    navigate('/');
   }
  } catch (err) {
   console.log(err?.message);
   navigate('/');
  }
 };
};