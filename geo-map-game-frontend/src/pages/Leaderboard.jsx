import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function Leaderboard() {
  const navigate = useNavigate();

  const [pages, setPages] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [loadedPages, setLoadedPages] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const limit = 10;
  const loadingRef = useRef(false);

  const fetchPage = async (page) => {
    if (loadingRef.current) return;
    loadingRef.current = true;

    try {
      const res = await api.get(
        `/leaderboard?page=${page}&limit=${limit}`
      );

      setPages((prev) => ({
        ...prev,
        [page]: res.data.leaderboard,
      }));

      setTotalPages(res.data.totalPages);
      setLoadedPages((prev) => Math.max(prev, page));
    } catch (err) {
      alert(err?.response?.data?.message ?? "Something went wrong!");
      navigate("/");
    }

    loadingRef.current = false;
  };

  useEffect(() => {
    fetchPage(1);
    fetchPage(2);
  }, []);

  const handlePageChange = (page) => {
    setCurrentPage(page);

    if (page === loadedPages && page < totalPages) {
      fetchPage(page + 1);
    }
  };

  const leaders = pages[currentPage] || [];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">

      <h2 className="text-3xl md:text-4xl font-bold mb-8 text-white">
        🏆 Leaderboard
      </h2>

      {/* TABLE */}
      <div className="overflow-x-auto rounded-2xl shadow-lg">
        <table className="min-w-full bg-white dark:bg-slate-800">

          <thead className="bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold">Rank</th>
              <th className="px-6 py-4 text-left text-sm font-semibold">Player</th>
              <th className="px-6 py-4 text-left text-sm font-semibold">Points</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
            {leaders.map((user, index) => (
              <tr
                key={user.id}
                className="hover:bg-gray-50 dark:hover:bg-slate-700 transition"
              >
                <td className="px-6 py-4 font-semibold text-gray-800 dark:text-white">
                  {(currentPage - 1) * limit + index + 1}
                </td>

                <td className="px-6 py-4 text-gray-700 dark:text-gray-200">
                  {user.name}
                </td>

                <td className="px-6 py-4 font-semibold text-blue-600 dark:text-blue-400">
                  {user.points} pts
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
  );
}