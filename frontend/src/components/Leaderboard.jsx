import React, { useEffect, useState } from "react";
// Real imports - no more mocks!
import axiosClient from "../utils/axiosClient";
import { useSelector } from "react-redux";

import {
  Trophy,
  Star,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
  Code,
  BarChart2,
  FileText,
} from "lucide-react";
import { NavLink } from "react-router";

/**
 * Renders a rank icon (Trophy) with specific colors for top ranks.
 * @param {number} rank - The user's rank.
 */
const RankIcon = ({ rank }) => {
  if (rank === 1) {
    return (
      <Trophy
        className="w-6 h-6 text-yellow-400"
        aria-label="Rank 1"
        fill="#facc15"
      />
    );
  }
  if (rank === 2) {
    return (
      <Trophy
        className="w-6 h-6 text-gray-400"
        aria-label="Rank 2"
        fill="#9ca3af"
      />
    );
  }
  if (rank === 3) {
    return (
      <Trophy
        className="w-6 h-6 text-yellow-700"
        aria-label="Rank 3"
        fill="#b45309"
      />
    );
  }
  // For other ranks, display the number
  return (
    <span className="text-lg font-semibold text-gray-400 w-6 text-center">
      {rank}
    </span>
  );
};


export default function Leaderboard() {
  const [leaderboardUsers, setLeaderboardUsers] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  // Get the logged-in user's data from the Redux store
  const { user } = useSelector((state) => state.profile || {});
  console.log("Leaderboard User-->", user);
  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);


  const res = { easy: 0, medium: 0, hard: 0 };
  const difficultyCounts = () => {
    for (const p of user?.solvedProblems) {
      if (p.difficulty === 'easy') res.easy++;
      else if (p.difficulty === 'medium') res.medium++;
      else if (p.difficulty === 'hard') res.hard++;
    }
  }
  if(user)
  difficultyCounts();


  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null); // Clear previous errors
      const { data } = await axiosClient.get(`/user/Leaderboard?page=${page}`);
      setLeaderboardUsers(data.users);
      setTotalUsers(data.totalUsers);
      setTotalPages(data.totalPages);
    } catch (err) {
      setError("Failed to fetch leaderboard. Please try again later.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  // Helper to format large numbers
  const formatPoints = (points) => {
    return new Intl.NumberFormat().format(points || 0);
  };

  // Helper to get a formatted join date
  const getJoinDate = () => {
    if (!user?.joinDate) return "N/A";
    try {
      return new Date(user.joinDate).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (e) {
      return "N/A";
    }
  };

  // A placeholder avatar generator
  const getAvatar = (name, customText = "") => {
    const text = customText || name?.charAt(0).toUpperCase() || "U";
    return `https://placehold.co/100x100/08122a/white?text=${text}`;
  };

  const UserRankRow = ({ rankUser, isCurrentUser }) => (
    <tr
      className={`border-b transition-all duration-200 ${isCurrentUser
          ? "bg-yellow-500/10 border-yellow-500/20"
          : "border-[#071428] hover:bg-[#071428]"
        }`}
    >
      {/* Rank Cell */}
      <td className="p-4 md:p-5 font-medium text-white">
        <div className="flex items-center justify-start h-full">
          {isCurrentUser ? (
            <span className="text-lg font-bold text-yellow-400 w-6 text-center">
              #{rankUser.rank}
            </span>
          ) : (
            <RankIcon rank={rankUser.rank} />
          )}
        </div>
      </td>

      {/* User Cell */}
      <td className="p-4 md:p-5">
        <div className="flex items-center gap-4">
          <div className="avatar">
            <div className="w-10 h-10 rounded-full">
              <img
                src={rankUser.avatar || getAvatar(rankUser.firstName)}
                alt={rankUser.firstName}
                onError={(e) => { e.target.src = getAvatar(rankUser.firstName); }}
              />
            </div>
          </div>
          <span
            className={`text-lg font-medium ${isCurrentUser ? "text-yellow-400" : "text-white"
              }`}
          >
            {rankUser.firstName}
          </span>
        </div>
      </td>

      {/* Points Cell */}
      <td className="p-4 md:p-5 text-center">
        <div className="flex items-center justify-center gap-2 text-lg font-semibold text-gray-200">
          <Star className="w-5 h-5 text-yellow-500" />
          {formatPoints(rankUser.totalPoints)}
        </div>
      </td>

      {/* Solved Cell */}
      <td className="p-4 md:p-5 text-center">
        <div className="flex items-center justify-center gap-2 text-lg font-semibold text-gray-200">
          <Code className="w-5 h-5 text-blue-400" />
          {rankUser.solvedProblems || 0}
        </div>
      </td>
    </tr>
  );


  return (
    <div className=" pt-25 sm:pt-20  bg-[#061021] text-gray-200 p-4  font-sans">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* --- Left Column: Leaderboard --- */}
        <div className="lg:col-span-2">
          {/* Header */}
          <header className="mb-6">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
              Leaderboard
            </h1>
            <p className="text-lg text-gray-400">
              See where you stand among the best coders on the platform.
            </p>
          </header>

          {/* Leaderboard Table Container */}
          <div className="bg-[#08122a] rounded-xl shadow-2xl overflow-hidden border border-[#071428]">
            <div className="overflow-x-auto">
              <table className="table min-w-full text-base">
                {/* Table Head */}
                <thead className="bg-[#071428]">
                  <tr className="border-b border-blue-900">
                    <th className="p-4 md:p-5 text-sm text-gray-400 uppercase tracking-wider text-left">
                      Rank
                    </th>
                    <th className="p-4 md:p-5 text-sm text-gray-400 uppercase tracking-wider text-left">
                      User
                    </th>
                    <th className="p-4 md:p-5 text-sm text-gray-400 uppercase tracking-wider text-center">
                      Coding Points
                    </th>
                    <th className="p-4 md:p-5 text-sm text-gray-400 uppercase tracking-wider text-center">
                      Problems Solved
                    </th>
                  </tr>
                </thead>

                {/* Table Body */}
                <tbody>
                  {/* Pinned Current User Row - as per image */}
                  {user && (
                    <tr
                      className="border-b-2 border-dashed border-yellow-500/30 bg-[#071428] sticky top-0"
                      title="Your Current Standing"
                    >
                      <td className="p-4 md:p-5 font-medium">
                        <div className="flex items-center justify-start h-full text-lg font-bold text-yellow-400 w-6 text-center">
                          #{user.rank}
                        </div>
                      </td>
                      <td className="p-4 md:p-5">
                        <div className="flex items-center gap-4">
                          <div className="avatar">
                            <div className="w-10 h-10 rounded-full ring-2 ring-yellow-500">
                              <img
                                src={user.avatar || getAvatar(user.firstName)}
                                alt={user.firstName}
                                onError={(e) => { e.target.src = getAvatar(user.firstName); }}
                              />
                            </div>
                          </div>
                          <span className="text-lg font-bold text-yellow-400">
                            {user.firstName} (You)
                          </span>
                        </div>
                      </td>
                      <td className="p-4 md:p-5 text-center">
                        <div className="flex items-center justify-center gap-2 text-lg font-bold text-yellow-400">
                          <Star className="w-5 h-5" fill="#facc15" />
                          {formatPoints(user.totalPoints)}
                        </div>
                      </td>
                      <td className="p-4 md:p-5 text-center">
                        <div className="flex items-center justify-center gap-2 text-lg font-bold text-yellow-400">
                          <Code className="w-5 h-5" />
                          {user.solvedProblems.length || 0}
                        </div>
                      </td>
                    </tr>
                  )}

                  {/* Loading State */}
                  {loading && (
                    <tr>
                      <td colSpan={4} className="h-96">
                        <div className="flex justify-center items-center">
                          <Loader2 className="w-12 h-12 text-yellow-500 animate-spin" />
                        </div>
                      </td>
                    </tr>
                  )}

                  {/* Error State */}
                  {error && !loading && (
                    <tr>
                      <td colSpan={4} className="h-96">
                        <div className="flex flex-col justify-center items-center text-red-500">
                          <AlertCircle className="w-12 h-12 mb-4" />
                          <p className="text-xl">{error}</p>
                        </div>
                      </td>
                    </tr>
                  )}

                  {/* Leaderboard Users */}
                  {!loading && !error &&
                    leaderboardUsers
                      .filter(lbUser => lbUser._id !== user?._id) // Filter out the current user
                      .map((lbUser) => (
                        <UserRankRow
                          key={lbUser._id}
                          rankUser={lbUser}
                          isCurrentUser={false} // Already handled the current user
                        />
                      ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {!loading && !error && totalPages > 1 && (
              <div className="p-4 md:p-6 flex items-center justify-between border-t border-[#071428]">
                <span className="text-sm text-gray-400">
                  Page {page} of {totalPages} (Total {totalUsers} users)
                </span>
                <div className="join">
                  <button
                    className="join-item btn btn-outline btn-sm border-blue-800 text-white hover:bg-blue-800"
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page === 1}
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Prev
                  </button>
                  <button
                    className="join-item btn btn-outline btn-sm border-blue-800 text-white hover:bg-blue-800"
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page === totalPages}
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* --- Right Column: User Profile Card --- */}
        {/* This column will be sticky on large screens for a great UX */}
        <div className="lg:col-span-1 lg:sticky lg:top-8 self-start">
          {user && (
            <div className="bg-[#08122a] rounded-xl shadow-2xl border border-[#071428] p-6">
              {/* User Header */}
              <div className="flex flex-col items-center mb-6">
                <div className="avatar mb-4">
                  <div className="w-24 h-24 rounded-full ring-4 ring-yellow-500 ring-offset-base-100 ring-offset-2">
                    <img
                      src={user.avatar || getAvatar(user.firstName)}
                      alt={user.firstName}
                      onError={(e) => { e.target.src = getAvatar(user.firstName); }}
                    />
                  </div>
                </div>
                <h2 className="text-3xl font-bold text-white">
                  {user.firstName} {user.lastName}
                </h2>
                <span className="badge badge-lg bg-yellow-500/10 text-yellow-400 border-yellow-500/30 mt-2 py-3 px-4 text-sm font-semibold">
                  This is you
                </span>
              </div>

              {/* User Stats Grid */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-[#071428] p-4 rounded-lg text-center">
                  <div className="text-sm text-gray-400 uppercase mb-1">Rank</div>
                  <div className="text-3xl font-bold text-yellow-500">
                    #{user.rank}
                  </div>
                </div>
                <div className="bg-[#071428] p-4 rounded-lg text-center">
                  <div className="text-sm text-gray-400 uppercase mb-1">Points</div>
                  <div className="text-3xl font-bold text-white">
                    {formatPoints(user.totalPoints)}
                  </div>
                </div>
              </div>

              {/* Solved Statistics */}
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
                  <BarChart2 className="w-5 h-5 text-gray-400" />
                  Solved Statistics
                </h3>
                <div className="space-y-3">
                  {/* Total Solved */}
                  <div className="flex justify-between items-center text-lg">
                    <span className="text-gray-300">Total Solved:</span>
                    <span className="font-bold text-white">{user.solvedProblems.length || 0}</span>
                  </div>
                  {/* Note: As discussed, Easy/Medium/Hard data isn't in the user object. */}
                  {/* If you add it later, you can map it out here like this: */}
                  <div className="flex justify-between items-center text-gray-500 text-sm">
                    <span>Easy:</span>
                    <span className="font-medium">{res?.easy || 0}</span>
                  </div>
                  <div className="flex justify-between items-center text-gray-500 text-sm">
                    <span>Medium:</span>
                    <span className="font-medium">{res?.medium || 0}</span>
                  </div>
                  <div className="flex justify-between items-center text-gray-500 text-sm">
                    <span>Hard:</span>
                    <span className="font-medium">{res?.hard || 0}</span>
                  </div>
                </div>
              </div>

              {/* Recent Solved Problems */}
              <div>
                <h3 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-gray-400" />
                  Recent Solved Problems
                </h3>
                {/* Note: 'Recent problems' data isn't in the user object. */}
                <div className="grid grid-cols-1 gap-2">
                  {user.solvedProblems.slice(0, 4).map((p, index) => (
                    <NavLink
                      to={`/problem/${p._id}`}
                      key={index}
                      className="bg-[#0e1b33] hover:bg-[#12264d] transition-all duration-200 rounded-md px-3 py-2 text-sm border border-[#1e2a45]"
                    >
                      {p.title}
                    </NavLink>
                  ))}
                </div>
              </div>

              {/* Join Date */}
              <div className="mt-6 text-center text-sm text-gray-500">
                Joined on {getJoinDate()}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

