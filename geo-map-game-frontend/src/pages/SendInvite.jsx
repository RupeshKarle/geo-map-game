import { useEffect, useState } from "react";
import api from "../api/axios";
import { Navigate } from "react-router-dom";

export default function SendInvite() {
 const [statusMsg, setStatusMsg] = useState("");
 const [isCopied, setIsCopied] = useState({});
 const [invites, setInvites] = useState([]);
 const [invitees, setInvitees] = useState([]);

 useEffect(() => {
   fetchInvites();
   invitedMembers();
 }, []);

 const fetchInvites = async () => {
   const res = await api.get("/invites");
   setInvites(res.data);
 };

 const invitedMembers = async () => {
   const res = await api.get("/invites/members");
   setInvitees(res.data);
 };

 const createInvite = async (group_id) => {
  try {
   const res = await api.post("/invites", {group_id});
   fetchInvites();
  } catch (err) {
   setStatusMsg(err.message);
  }
 }

 const shareViaWA = async (token, type) => {
  try {
   const link = `${import.meta.env.VITE_FRONTEND_URL}/${ (type == 'reg') ? `register?token=${token}` : `group-invite?token=${token}`}`;
   window.open(`https://wa.me/?text=${link}`, '_blank');
  } catch (err) {
   console.log(err.message);
  }
 }

 const copy = async (token, type, id) => {
  try {
   const link = `${import.meta.env.VITE_FRONTEND_URL}/${ (type == 'reg') ? `register?token=${token}` : `group-invite?token=${token}`}`;
   await navigator.clipboard.writeText(link);
   setIsCopied((prev) => ({
    ...prev, [id]: true
   }));
   setTimeout(() => setIsCopied((prev) => ({
    ...prev, [id]: false
   })), 2000);
  } catch (err) {
   setIsCopied((prev) => ({
    ...prev, [id]: false
   }));
  }
 }

 return (
  <div className="max-w-6xl mx-auto px-4 py-8">

   <h2 className="text-3xl md:text-4xl font-bold mb-8 text-white">
     Invite Links
   </h2>

    {/* TABLE */}
   <div className="overflow-x-auto rounded-2xl shadow-lg">
    <table className="min-w-full bg-white dark:bg-slate-800">

      <thead className="bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-200">
        <tr>
          <th className="px-6 py-4 text-left text-sm font-semibold">Type</th>
          <th className="px-6 py-4 text-left text-sm font-semibold">Status</th>
          <th className="px-6 py-4 text-left text-sm font-semibold">Action</th>
        </tr>
      </thead>

      <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
        {invites.map((invite, index) => (
          <tr
            key={invite.id ?? `index-${index}`}
            className="hover:bg-gray-50 dark:hover:bg-slate-700 transition"
          >
            <td className="px-6 py-4 font-semibold text-gray-800 dark:text-white">
              {invite.type}
            </td>

            <td className="px-6 py-4 text-gray-700 dark:text-gray-200">
              {(invite?.is_valid ?? false) ? 'Active' : 'Inactive'}
            </td>

            <td className="px-6 py-4 font-semibold text-blue-600 dark:text-blue-400">
              {(invite?.token)
               ? 
               <>
                <button
                  onClick={() =>
                    (invite.is_valid)
                      ? disable(invite.id)
                      : enable(invite.id)
                  }
                  className={`px-4 py-1 rounded-lg text-white transition
                  ${
                    invite.is_valid
                      ? "bg-red-500 hover:bg-red-600"
                      : "bg-green-500 hover:bg-green-600"
                  }`}
                >
                  {invite.is_valid ? "Inactivate" : "Activate"}
                </button>
                <button
                  onClick={() => shareViaWA(invite.token, invite.i_type) }
                  className={`px-4 py-1 rounded-lg text-white transition bg-green-500 hover:bg-green-600`}
                >
                 WhatsApp Share
                </button>
                <button
                  onClick={() => copy(invite.token, invite.i_type, (invite.id ?? `index-${index}`))}
                  className={`px-4 py-1 rounded-lg text-white transition bg-green-500 hover:bg-green-600`}
                >
                 { isCopied[invite.id ?? `index-${index}`] ? 'Copied' : 'Copy' }
                </button>
               </>
               : (
                <button
                  onClick={() => createInvite(invite.g_id) }
                  className={`px-4 py-1 rounded-lg text-white transition bg-green-500 hover:bg-green-600`}
                >
                 Create Invite
                </button>
               )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
   </div>
    
   {statusMsg && (
     <p className="mt-3 text-green-600 dark:text-red-400 text-sm">
       {statusMsg}
     </p>
   )}
   <h2 className="text-3xl md:text-4xl font-bold mb-8 text-white">
     Invited Members
   </h2>

    {/* TABLE */}
   <div className="overflow-x-auto rounded-2xl shadow-lg">
    <table className="min-w-full bg-white dark:bg-slate-800">

      <thead className="bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-200">
        <tr>
          <th className="px-6 py-4 text-left text-sm font-semibold">Type</th>
          <th className="px-6 py-4 text-left text-sm font-semibold">User Name</th>
          <th className="px-6 py-4 text-left text-sm font-semibold">Email</th>
          <th className="px-6 py-4 text-left text-sm font-semibold">Group Name</th>
        </tr>
      </thead>

      <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
        {invitees.map((invitee, index) => (
          <tr
            key={invitee.uid ?? `index-${index}`}
            className="hover:bg-gray-50 dark:hover:bg-slate-700 transition"
          >
            <td className="px-6 py-4 font-semibold text-gray-800 dark:text-white">
              {invitee.group_id ? 'Group Invite' : 'Game Invite'}
            </td>

            <td className="px-6 py-4 text-gray-700 dark:text-gray-200">
              {invitee.name}
            </td>

            <td className="px-6 py-4 text-gray-700 dark:text-gray-200">
              {invitee.email}
            </td>

            <td className="px-6 py-4 font-semibold text-blue-600 dark:text-blue-400">
              {(invitee?.group_name ?? "-")}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
   </div>
    
   {/* {statusMsg && (
     <p className="mt-3 text-green-600 dark:text-red-400 text-sm">
       {statusMsg}
     </p>
   )} */}
  </div>
 );
};