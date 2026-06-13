import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function Group() {
 const { groupId } = useParams();
 const [group, setGroup] = useState("");
 const [totalLocations, setTotalLocation] = useState(0);
 const navigate = useNavigate();

 const [showMembers, setShowMembers] = useState(false);
 const [showLocations, setShowLocations] = useState(false);

 const [title, setTitle] = useState("");
 const [lat, setLat] = useState("");
 const [lng, setLng] = useState("");

 const [memberEmail, setMemberEmail] = useState("");
 const [members, setMembers] = useState([]);
 const [loading, setLoading] = useState(false);

  const [pages, setPages] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [loadedPages, setLoadedPages] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const limit = 10;
  const loadingRef = useRef(false);
  const groupDataRef = useRef(false);

  const fetchPage = async (page) => {
    if (loadingRef.current) return;
    loadingRef.current = true;

    try {
      const res = await api.post(
        `/locations/grouped?page=${page}&limit=${limit}`,
        { group_id: groupId}
      );

      // if (!res?.data?.locations?.length) return;
      let lL = res.data.locations?.length || 0;
      
      if (!res.data.totalPages == 0) {
        setPages((prev) => ({
          ...prev,
          [page]: res.data.locations,
        }));
        setTotalPages(res.data.totalPages);
        setLoadedPages((prev) => Math.max(prev, page));
        setTotalLocation(res.data.totalRecords ?? 0);
      }
      
      loadingRef.current = false;
      if (lL == limit && page == totalPages) {
        return fetchPage(page + 1);
      }
    } catch (err) {
      alert(err?.response?.data?.message ?? "Something went wrong!");
      navigate("/");
    }
  };

  useEffect(() => {
    getGroupInfo();
    fetchPage(1);
  }, []);

  const handlePageChange = (page) => {
    setCurrentPage(page);

    if (page === loadedPages && page < totalPages) {
      fetchPage(page + 1);
    }
  };

  const locations = pages[currentPage] || [];

 const getGroupInfo = async () => {
  try {
    if (groupDataRef.current) return;
    groupDataRef.current = true;
   setLoading(true);
   const res = await api.get(`/groups/${groupId}`);
   setGroup(res.data.name);
   setMembers(res.data.members || []);
    groupDataRef.current = false;
  } catch (err) {
   alert("Failed to load requests");
  } finally {
   setLoading(false);
  }
 };

 const addMember = async () => {
  if (!memberEmail.trim()) {
    return alert("Enter member email");
  }

  if (members.length >= 10) {
    return alert("Maximum 10 members allowed");
  }

  try {
    const res = await api.get(
      `/users/by-email?email=${encodeURIComponent(memberEmail)}`
    );

    const user = res.data;

    if (!user) {
      return alert("User not found");
    }

    const exists = members.some(
      (m) => m.id === user.id
    );

    if (exists) {
      return alert("User already added");
    }

    setMembers((prev) => [...prev, user]);
    setMemberEmail("");
  } catch (err) {
    alert("User not found");
  }
};

const removeMember = (userId) => {
 setMembers((prev) =>
  prev.filter((m) => m.id !== userId)
 );
};

const addLocation = async () => {
  if (!title || !lat || !lng) {
    return alert("All fields required");
  }

  await api.post(`locations`, {
    title,
    latitude: parseFloat(lat),
    longitude: parseFloat(lng),
    group_id: groupId
  });

  setTitle("");
  setLat("");
  setLng("");
  fetchPage(1);
  setTotalLocation(prev => prev + 1);
};

const disableLocation = async (id) => {
  await api.patch(`/locations/${id}/disable`, { group_id: groupId });
  fetchPage(currentPage);
};

const enableLocation = async (id) => {
  await api.patch(`/locations/${id}/enable`, { group_id: groupId });
  fetchPage(currentPage);
};
// END GROUP LOCATIONS

const updateGroup = async () => {
 try {
  const payload = {
    name: group,
    members: members.map((m) => m.id),
  };

  await api.put(`/groups/${groupId}`, payload);

  alert("Group has been updated successfully");
 } catch (err) {
   alert("Failed to save group");
 }
};

 return (
  <div className="max-w-6xl mx-auto px-4 py-6">
   {/* Title */}
   <h2 className="text-3xl font-bold mb-6 
                  text-white">
     Manage group
   </h2>

   {/* GROUP NAME INPUT */}
   <div className="bg-white dark:bg-slate-800 
                   p-6 rounded-2xl shadow-lg mb-8">
     
     <div className="grid grid-cols-1 gap-4">
      <input
       id="gname"
       className="border dark:border-slate-600
                  bg-gray-50 dark:bg-slate-700
                  text-gray-800 dark:text-white
                  p-2 rounded-lg font-bold"
       placeholder="Group Name"
       value={group}
       onChange={(e) =>
        setGroup((prev) => ({
          ...prev,
          name: e.target.value,
        }))
       }
      />

      {/* <p className="text-sm text-gray-500 mt-2">
        {members.length}/10 members
      </p> */}
      <div
        className="bg-white dark:bg-slate-800
                  p-6 rounded-2xl shadow-lg mb-8"
      >
        <button
          type="button"
          onClick={() => setShowMembers((v) => !v)}
          className="w-full flex items-center justify-between"
        >
          <h3 className="text-lg font-semibold">
            Group Members ({members.length}/10)
          </h3>

          <span className="text-xl">
            {showMembers ? "▲" : "▼"}
          </span>
        </button>

        <div
          className={`overflow-hidden transition-all duration-300 ${
            showMembers ? "max-h-[1000px] mt-4" : "max-h-0"
          }`}
        >
          <div className="flex gap-2">
            <input
              type="email"
              placeholder="Member Email"
              value={memberEmail}
              onChange={(e) => setMemberEmail(e.target.value)}
              className="flex-1 border dark:border-slate-600
                        bg-gray-50 dark:bg-slate-700
                        text-gray-800 dark:text-white
                        p-2 rounded-lg"
            />

            <button
              onClick={addMember}
              disabled={members.length >= 10}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg"
            >
              Add Member
            </button>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="text-left p-2 border">Name</th>
                  <th className="text-left p-2 border">Email</th>
                  <th className="text-left p-2 border">Action</th>
                </tr>
              </thead>

              <tbody>
                {members.map((member) => (
                  <tr key={member.id}>
                    <td className="p-2 border">{member.name}</td>
                    <td className="p-2 border">{member.email}</td>

                    <td className="p-2 border">
                      <button
                        onClick={() => removeMember(member.id)}
                        className="bg-red-500 text-white px-3 py-1 rounded"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <div
  className="bg-white dark:bg-slate-800
             p-6 rounded-2xl shadow-lg mb-8"
>
  <button
    type="button"
    onClick={() => setShowLocations((v) => !v)}
    className="w-full flex items-center justify-between"
  >
    <h3 className="text-lg font-semibold">
      Group Locations ({totalLocations})
    </h3>

    <span className="text-xl">
      {showLocations ? "▲" : "▼"}
    </span>
  </button>

  <div
    className={`overflow-hidden transition-all duration-300 ${
      showLocations ? "max-h-[1500px] mt-4" : "max-h-0"
    }`}
  >
    {/* Add Location Form */}

    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <input
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="border dark:border-slate-600
                   bg-gray-50 dark:bg-slate-700
                   text-gray-800 dark:text-white
                   p-2 rounded-lg"
      />

      <input
        placeholder="Latitude"
        value={lat}
        onChange={(e) => setLat(e.target.value)}
        className="border dark:border-slate-600
                   bg-gray-50 dark:bg-slate-700
                   text-gray-800 dark:text-white
                   p-2 rounded-lg"
      />

      <input
        placeholder="Longitude"
        value={lng}
        onChange={(e) => setLng(e.target.value)}
        className="border dark:border-slate-600
                   bg-gray-50 dark:bg-slate-700
                   text-gray-800 dark:text-white
                   p-2 rounded-lg"
      />

      <button
        onClick={addLocation}
        className="bg-blue-500 text-white rounded-lg"
      >
        Add
      </button>
    </div>

    {/* Location List */}

    <div className="bg-white dark:bg-slate-800 
        p-6 rounded-2xl shadow-lg mb-8 overflow-x-auto rounded-2xl shadow-lg">
        <h3 className="font-semibold text-lg mb-4 
                       text-gray-700 dark:text-gray-200">
          Locations
        </h3>
        <table className="min-w-full bg-white dark:bg-slate-800">

          <thead className="bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold">Title</th>
              <th className="px-6 py-4 text-left text-sm font-semibold">Group Name</th>
              <th className="px-6 py-4 text-left text-sm font-semibold">Winner</th>
              <th className="px-6 py-4 text-left text-sm font-semibold">Action</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
            {locations.map((loc) => (
              <tr
                key={loc.id}
                className="hover:bg-gray-50 dark:hover:bg-slate-700 transition"
              >
                <td className="px-6 py-4 font-semibold text-gray-800 dark:text-white">
                  {loc.title}
                </td>
                <td className="px-6 py-4 text-gray-700 dark:text-gray-200">
                  {loc.group_name ?? 'GLOBAL LOCATION'}
                </td>
                <td className="px-6 py-4 text-gray-700 dark:text-gray-200">
                  {loc.winner ?? "Not found"}
                </td>

                <td className="px-6 py-4 font-semibold text-blue-600 dark:text-blue-400">
                  <button
                    onClick={() =>
                      loc?.is_active
                        ? disableLocation(loc.id)
                        : enableLocation(loc.id)
                    }
                    className={`px-4 py-1 rounded-lg text-white transition
                    ${
                      loc.is_active
                        ? "bg-red-500 hover:bg-red-600"
                        : "bg-green-500 hover:bg-green-600"
                    }`}
                  >
                    {loc.is_active ? "Disable" : "Enable"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>

        </table>
      </div>

      {/* PAGINATION */}
      <div className="flex flex-wrap justify-center mt-6 gap-2">

        <button
          disabled={currentPage === 1}
          onClick={() => handlePageChange(currentPage - 1)}
          className="px-3 py-1 rounded-lg bg-gray-200 dark:bg-slate-700 disabled:opacity-50"
        >
          ◀
        </button>

        {Array.from({ length: loadedPages }).map((_, i) => {
          const page = i + 1;

          return (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`px-3 py-1 rounded-lg transition ${
                currentPage === page
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 dark:bg-slate-700 text-gray-800 dark:text-white"
              }`}
            >
              {page}
            </button>
          );
        })}

        <button
          disabled={currentPage === totalPages}
          onClick={() => handlePageChange(currentPage + 1)}
          className="px-3 py-1 rounded-lg bg-gray-200 dark:bg-slate-700 disabled:opacity-50"
        >
          ▶
        </button>
      </div>
  </div>
</div>


    <div>
       <button
         onClick={updateGroup}
         className="bg-green-600 text-white px-6 py-2 rounded-lg"
       >
         Save Group
       </button>
      </div>
     </div>
   </div>
  </div>
 );
}