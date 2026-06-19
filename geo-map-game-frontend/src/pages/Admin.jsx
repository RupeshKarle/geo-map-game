import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function Admin() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [point, setPoint] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");

  const [totalLocations, setTotalLocation] = useState(0);
  const [totalGroups, setTotalGroups] = useState(0);

  const [pages, setPages] = useState({});
  const [gPages, setGPages] = useState({});
  const [currentPage, setCurrentPage] = useState({
    'groups': 1,
    'locations': 1
  });
  const [loadedPages, setLoadedPages] = useState({
    'groups': 0,
    'locations': 0
  });
  const [totalPages, setTotalPages] = useState({
    'groups': 1,
    'locations': 1
  });

  const limit = 10;
  const loadingRef = useRef(false);
  const gLoadingRef = useRef(false);

  const fetchPage = async (page) => {
    if (loadingRef.current) return;
    loadingRef.current = true;

    try {
      const res = await api.get(
        `/locations?page=${page}&limit=${limit}`
      );

      let lL = res.data.locations?.length || 0;
      
      if (!res.data.totalPages == 0) {
        setPages((prev) => ({
          ...prev,
          [page]: res.data.locations,
        }));
        setTotalPages((prev) => ({
          ...prev, 
          'locations': res.data.totalPages
        }));
        setLoadedPages((prev) => ({
          ...prev, 
          'locations': Math.max((prev?.['locations'] || 0), page)
        }));
        setTotalLocation(res.data.totalRecords ?? 0);
      }
      loadingRef.current = false;
      if (lL == limit && page == totalPages['locations']) {
        return fetchPage(page + 1);
      }
    } catch (err) {
      alert(err?.response?.data?.message ?? "Something went wrong!");
      navigate("/");
    }

    loadingRef.current = false;
  };

  const fetchGroupsPage = async (page) => {
    if (gLoadingRef.current) return;
    gLoadingRef.current = true;

    try {
      const res = await api.get(
        `/groups/paginated?page=${page}&limit=${limit}`
      );

      let gL = res.data.groups?.length || 0;
      
      if (!res.data.totalPages == 0) {
        setGPages((prev) => ({
          ...prev,
          [page]: res.data.groups,
        }));
        setTotalPages((prev) => ({
          ...prev, 
          'locations': res.data.totalPages
        }));
        setLoadedPages((prev) => ({
          ...prev, 
          'groups': Math.max((prev?.['groups'] || 0), page)
        }));
        setTotalGroups(res.data.totalRecords ?? 0);
      }
      gLoadingRef.current = false;
      if (gL == limit && page == totalPages['groups']) {
        return fetchGroupsPage(page + 1);
      }
    } catch (err) {
      alert(err?.response?.data?.message ?? err.message ?? "Something went wrong!");
      navigate("/");
    }

    gLoadingRef.current = false;
  };

  useEffect(() => {
    fetchPage(1);
    fetchGroupsPage(1);
  }, []);

  const handlePageChange = (ofPage = 'locations', page) => {
    setCurrentPage((prev) => ({
      ...prev,
      [ofPage]: page
    }));

    if (page === loadedPages[ofPage] && page < totalPages[ofPage]) {
      (ofPage == 'locations') 
        ? fetchPage(page + 1)
        : fetchGroupsPage(page + 1);
    }
  };

  const locations = pages[currentPage['locations']] || [];
  const groups = gPages[currentPage['groups']] || [];
  
  const addLocation = async () => {
    if (!title || !point || !lat || !lng) return alert("All fields required");

    await api.post("/locations", {
      title,
      point,
      latitude: parseFloat(lat),
      longitude: parseFloat(lng),
    });

    setTitle("");
    setPoint("");
    setLat("");
    setLng("");
    fetchPage(1);
    setTotalLocation(prev => prev + 1);
  };

  const disableLocation = async (id) => {
    await api.patch(`/locations/${id}/disable`);
    fetchPage(currentPage['locations']);
  };

  const enableLocation = async (id) => {
    await api.patch(`/locations/${id}/enable`);
    fetchPage(currentPage['locations']);
  };

  const closeGroup = async (id) => {
    await api.patch(`/groups/${id}/${false}`);
    fetchGroupsPage(currentPage['groups']);
  };

  const openGroup = async (id) => {
    await api.patch(`/groups/${id}/${true}`);
    fetchGroupsPage(currentPage['groups']);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">

      {/* Title */}
      <h2 className="text-3xl font-bold mb-6 
                     text-white">
        Admin Dashboard
      </h2>

      {/* ADD LOCATION CARD */}
      <div className="bg-white dark:bg-slate-800 
                      p-6 rounded-2xl shadow-lg mb-8">
        <h3 className="font-semibold text-lg mb-4 
                       text-gray-700 dark:text-gray-200">
          Add Location
        </h3>

        {/* Responsive Grid */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">

          <input
            className="border dark:border-slate-600 
                       bg-gray-50 dark:bg-slate-700 
                       text-gray-800 dark:text-white
                       p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <input
            className="border dark:border-slate-600 
                       bg-gray-50 dark:bg-slate-700 
                       text-gray-800 dark:text-white
                       p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Point"
            value={point}
            onChange={(e) => setPoint(e.target.value)}
          />

          <input
            className="border dark:border-slate-600 
                       bg-gray-50 dark:bg-slate-700 
                       text-gray-800 dark:text-white
                       p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Latitude"
            value={lat}
            onChange={(e) => setLat(e.target.value)}
          />

          <input
            className="border dark:border-slate-600 
                       bg-gray-50 dark:bg-slate-700 
                       text-gray-800 dark:text-white
                       p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Longitude"
            value={lng}
            onChange={(e) => setLng(e.target.value)}
          />

          <button
            onClick={addLocation}
            className="bg-gradient-to-r from-blue-500 to-purple-600 
                       text-white px-4 py-2 rounded-lg 
                       hover:scale-105 transition-transform"
          >
            Add
          </button>

        </div>
      </div>

      {/* LOCATIONS LIST CARD */}
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
                  {loc.winner ?? 'Not found'}
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
        {/* PAGINATION */}
        <div className="flex flex-wrap justify-center mt-6 gap-2">

          <button
            disabled={currentPage['locations'] === 1}
            onClick={() => handlePageChange('locations', currentPage['locations'] - 1)}
            className="px-3 py-1 rounded-lg bg-gray-200 dark:bg-slate-700 disabled:opacity-50"
          >
            ◀
          </button>

          {Array.from({ length: loadedPages['locations'] }).map((_, i) => {
            const page = i + 1;

            return (
              <button
                key={page}
                onClick={() => handlePageChange('locations', page)}
                className={`px-3 py-1 rounded-lg transition ${
                  currentPage['locations'] === page
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 dark:bg-slate-700 text-gray-800 dark:text-white"
                }`}
              >
                {page}
              </button>
            );
          })}

          <button
            disabled={currentPage['locations'] === totalPages['locations']}
            onClick={() => handlePageChange('locations', currentPage['locations'] + 1)}
            className="px-3 py-1 rounded-lg bg-gray-200 dark:bg-slate-700 disabled:opacity-50"
          >
            ▶
          </button>

        </div>
      </div>

      {/* GROUPS LIST CARD */}
      <div className="bg-white dark:bg-slate-800 
        p-6 rounded-2xl shadow-lg mb-8 overflow-x-auto rounded-2xl shadow-lg">
        <h3 className="font-semibold text-lg mb-4 
                       text-gray-700 dark:text-gray-200">
          Groups
        </h3>
        <table className="min-w-full bg-white dark:bg-slate-800">

          <thead className="bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold">Name</th>
              <th className="px-6 py-4 text-left text-sm font-semibold">Owner</th>
              <th className="px-6 py-4 text-left text-sm font-semibold">Is Open</th>
              <th className="px-6 py-4 text-left text-sm font-semibold">Action</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
            {groups.map((group) => (
              <tr
                key={group.id}
                className="hover:bg-gray-50 dark:hover:bg-slate-700 transition"
              >
                <td className="px-6 py-4 font-semibold text-gray-800 dark:text-white">
                  {group.name}
                </td>
                <td className="px-6 py-4 text-gray-700 dark:text-gray-200">
                  {group.owner ?? 'ADMIN'}
                </td>
                <td className="px-6 py-4 text-gray-700 dark:text-gray-200">
                  {group.is_open ? 'True' : 'False'}
                </td>

                <td className="px-6 py-4 font-semibold text-blue-600 dark:text-blue-400">
                  <button
                    onClick={() =>
                      group?.is_open
                        ? closeGroup(group.id)
                        : openGroup(group.id)
                    }
                    className={`px-4 py-1 rounded-lg text-white transition
                    ${
                      group.is_open
                        ? "bg-red-500 hover:bg-red-600"
                        : "bg-green-500 hover:bg-green-600"
                    }`}
                  >
                    {group.is_open ? "Close" : "Open"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>

        </table>
        {/* PAGINATION */}
        <div className="flex flex-wrap justify-center mt-6 gap-2">

          <button
            disabled={currentPage['groups'] === 1}
            onClick={() => handlePageChange('groups', currentPage['groups'] - 1)}
            className="px-3 py-1 rounded-lg bg-gray-200 dark:bg-slate-700 disabled:opacity-50"
          >
            ◀
          </button>

          {Array.from({ length: loadedPages['groups'] }).map((_, i) => {
            const page = i + 1;

            return (
              <button
                key={page}
                onClick={() => handlePageChange('groups', page)}
                className={`px-3 py-1 rounded-lg transition ${
                  currentPage['groups'] === page
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 dark:bg-slate-700 text-gray-800 dark:text-white"
                }`}
              >
                {page}
              </button>
            );
          })}

          <button
            disabled={currentPage['groups'] === totalPages['groups']}
            onClick={() => handlePageChange('groups', currentPage['groups'] + 1)}
            className="px-3 py-1 rounded-lg bg-gray-200 dark:bg-slate-700 disabled:opacity-50"
          >
            ▶
          </button>

        </div>
      </div>

    </div>
  );
}