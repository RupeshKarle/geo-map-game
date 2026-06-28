import { useEffect, useState, useRef } from "react";
import api from "../api/axios";

export default function AdminGroupRequests() {
  const [requests, setRequests] = useState([]);
  const hasFetchedRef = useRef(false);
  useEffect(() => {
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await api.get("/admin/group-admin-requests");
      setRequests(res.data.users);
    } catch (err) {
      alert("Failed to load requests");
    }
  };

  const approveUser = async (userId) => {
    try {
      await api.post(`/admin/approve-group-admin/${userId}`);
      fetchRequests();
    } catch {
      alert("Approval failed");
    }
  };

  const rejectUser = async (userId) => {
    try {
      await api.post(`/admin/reject-group-admin/${userId}`);
      fetchRequests();
    } catch {
      alert("Reject failed");
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h2 className="text-3xl font-bold mb-8 text-white">
        Group Admin Requests
      </h2>

      <div className="overflow-x-auto rounded-2xl shadow-lg">
        <table className="min-w-full bg-white dark:bg-slate-800">
          <thead className="bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold">
                User Name
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold">
                Group Name
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold">
                Email
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold">
                Points
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
            {requests.length === 0 && (
              <tr>
                <td
                  colSpan="4"
                  className="px-6 py-6 text-center text-gray-500 dark:text-gray-400"
                >
                  No pending requests.
                </td>
              </tr>
            )}

            {requests.map((user) => (
              <tr
                key={user.id}
                className="hover:bg-gray-50 dark:hover:bg-slate-700 transition"
              >
                <td className="px-6 py-4 text-gray-800 dark:text-white">
                  {user.name}
                </td>

                <td className="px-6 py-4 text-gray-800 dark:text-white">
                  {user.group_name}
                </td>

                <td className="px-6 py-4 text-gray-700 dark:text-gray-200">
                  {user.email}
                </td>

                <td className="px-6 py-4 text-blue-600 dark:text-blue-400">
                  {user.points}
                </td>

                <td className="px-6 py-4 flex gap-3">
                  <button
                    onClick={() => approveUser(user.id)}
                    className="px-3 py-1 rounded-lg bg-green-600 text-white hover:bg-green-700"
                  >
                    Approve
                  </button>

                  <button
                    onClick={() => rejectUser(user.id)}
                    className="px-3 py-1 rounded-lg bg-red-600 text-white hover:bg-red-700"
                  >
                    Reject
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
