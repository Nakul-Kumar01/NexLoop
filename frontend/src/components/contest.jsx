import React, { useEffect, useMemo, useState } from "react";
import axiosClient from "../utils/axiosClient";
import { Link } from "react-router"; // keep as you had it; swap to react-router-dom if you use that

export default function ContestSection() {
  const [latestContest, setLatestContest] = useState([]);
  const [userContestHistory, setUserContestHistory] = useState([]);
  const [now, setNow] = useState(Date.now());
  const [registering, setRegistering] = useState({}); // { [contestId]: boolean }

  useEffect(() => {
    const fetchContest = async () => {
      try {
        const [response1, response2] = await Promise.all([
          axiosClient.get(`/contest/allContests`),
          axiosClient.get(`/contest/:id/userContestHistory`),
        ]);
        setLatestContest(response1.data.contests || []);
        setUserContestHistory(response2.data.history || []);
      } catch (err) {
        console.error("failed to fetch contests", err);
      }
    };
    fetchContest();
  }, []);

  // tick every second to update countdowns
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  // Helper: Set of contest IDs the user has in their history (registered/participated)
  const registeredContestIds = useMemo(() => {
    const s = new Set();
    (userContestHistory || []).forEach((entry) => {
      const id = entry?.contest?.id || entry?.contest?._id;
      if (id) s.add(String(id));
    });
    return s;
  }, [userContestHistory]);

  // Determine upcoming contests to show:
  // - For contests that are currently live (start <= now < end): show ONLY if user is registered.
  // - For future contests (start > now): show always (user can register).
  const upcomingContests = useMemo(() => {
    const nowTs = Date.now();
    return (latestContest || [])
      .filter((c) => {
        if (!c) return false;
        const start = c.startTime ? new Date(c.startTime).getTime() : 0;
        const end = c.endTime ? new Date(c.endTime).getTime() : Infinity;

        // if it's currently live:
        const isLive = start <= nowTs && nowTs < end;
        if (isLive) {
          // only show live contests if user has registered
          return registeredContestIds.has(String(c._id || c.id));
        }

        // otherwise (future contests) show them
        return start > nowTs;
      })
      .sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
  }, [latestContest, now, registeredContestIds]);

  // Past history sorted
  const pastHistory = useMemo(() => {
    return (userContestHistory || [])
      .slice()
      .sort((a, b) => new Date(b.participatedAt) - new Date(a.participatedAt));
  }, [userContestHistory]);

  // Format helpers
  function formatTimeRemaining(ms) {
    if (ms <= 0) return "Started";
    const total = Math.floor(ms / 1000);
    const d = Math.floor(total / (3600 * 24));
    const h = Math.floor((total % (3600 * 24)) / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;
    return `${d}d ${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }

  function friendlyDate(iso) {
    try {
      return new Date(iso).toLocaleString();
    } catch (e) {
      return iso;
    }
  }

  // Proper register function (no hooks inside). Optimistically updates userContestHistory on success.
  async function registerForContest(contestId) {
    if (!contestId) return;
    const id = String(contestId);
    // prevent duplicate clicks
    if (registering[id]) return;
    setRegistering((p) => ({ ...p, [id]: true }));
    try {
      const response = await axiosClient.post(`/contest/${id}/join`);
      // Attempt to use server-returned entry if available
      const entryFromServer = response?.data?.entry || response?.data?.historyEntry || response?.data;
      if (entryFromServer && (entryFromServer.contest || entryFromServer.contestId)) {
        // If server returns full entry, prepend it
        // normalize to { contest: { id, name, ... }, points, attempt, solvedProblems, createdAt }
        const normalized = entryFromServer.contest
          ? entryFromServer
          : {
            contest: {
              id: entryFromServer.contestId || id,
              name: entryFromServer.contestName || (latestContest.find((c) => String(c._id || c.id) === id)?.name || "Contest"),
              startTime: entryFromServer.startTime,
              endTime: entryFromServer.endTime,
              status: entryFromServer.status,
            },
            points: entryFromServer.points ?? 0,
            attempt: entryFromServer.attempt ?? 0,
            solvedProblems: entryFromServer.solvedProblems ?? [],
            participatedAt: entryFromServer.createdAt ?? new Date().toISOString(),
          };
        setUserContestHistory((prev) => [normalized, ...(prev || [])]);
      } else {
        // If no entry returned, build a minimal entry from latestContest and push
        const contestMeta = latestContest.find((c) => String(c._id || c.id) === id) || {};
        const syntheticEntry = {
          contest: {
            id,
            name: contestMeta.name || "Contest",
            startTime: contestMeta.startTime,
            endTime: contestMeta.endTime,
            status: contestMeta.status,
          },
          points: 0,
          attempt: 0,
          solvedProblems: [],
          participatedAt: new Date().toISOString(),
        };
        setUserContestHistory((prev) => [syntheticEntry, ...(prev || [])]);
      }
      // Optionally, you can show a toast here to confirm registration
      // toast.success("Registered successfully");
    } catch (err) {
      console.error("Registration failed", err);
      // toast.error("Registration failed");
    } finally {
      setRegistering((p) => ({ ...p, [id]: false }));
    }
  }

  return (
    <div
      className="min-h-screen py-24 sm:py-17 "
      style={{
        background: "linear-gradient(180deg, #061021 0%, #071428 40%, #08122a 100%)",
        color: "#e6eef8",
      }}
    >
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl" style={{ background: "rgba(255, 184, 0, 0.06)" }}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="#f6c94a" strokeWidth="1.5">
              <path d="M12 2l2 5 5 .5-4 3 1.2 5L12 14l-6.2 1.5L7 10 3 7.5 8 7l2-5z" />
            </svg>
            <h1 className="text-4xl font-extrabold tracking-tight">Coding Contests</h1>
          </div>
          <p className="mt-4 text-gray-300">Test your skills, compete with others, and win exciting prizes.</p>
        </div>

        {/* Live & Upcoming header */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Live & Upcoming</h2>
            <div className="text-sm text-gray-300">{upcomingContests.length} upcoming</div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingContests.length === 0 && (
              <div className="col-span-full p-8 rounded-xl border border-gray-700/30 bg-[#071428] shadow-lg">
                <h3 className="text-lg font-semibold">No upcoming contests</h3>
                <p className="mt-2 text-gray-300">We don't have any scheduled contests right now. Check back soon</p>
              </div>
            )}

            {upcomingContests.map((contest) => {
              const start = contest.startTime ? new Date(contest.startTime).getTime() : 0;
              const end = contest.endTime ? new Date(contest.endTime).getTime() : Infinity;
              const timeLeft = start - now;
              const isLive = start <= now && now < end;
              const id = String(contest._id || contest.id);
              const isRegistered = registeredContestIds.has(id);
              const isRegistering = !!registering[id];

              // Button states:
              // - Live & Registered -> show "Join" (link to contest)
              // - Live & NOT registered -> (we already filtered these out)
              // - Future & NOT registered -> show "Register"
              // - Future & Registered -> show "Registered" badge
              return (
                <article key={id} className="p-6  rounded-2xl border border-gray-700/40 bg-gradient-to-b from-[#08122a]/60 to-[#071428]/40 shadow-2xl">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-xl font-semibold">{contest.name}</h3>
                      <div className="mt-2 flex items-center justify-between gap-3 text-sm text-gray-300">
                        <div className="inline-flex items-center  gap-2">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.5">
                            <path d="M12 8v4l3 3" />
                            <circle cx="12" cy="12" r="9" />
                          </svg>
                          <span>{isLive ? `Live — started ${friendlyDate(contest.startTime)}` : `Starts: ${friendlyDate(contest.startTime)}`}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="inline-block px-3 py-1 rounded-full text-sm font-medium" style={{ backgroundColor: "rgba(246,201,74,0.14)", color: "#f6c94a" }}>
                        {isLive ? "Live" : "Upcoming"}
                      </span>
                    </div>
                  </div>

                  <div className="mt-6 flex items-center justify-between gap-4">
                    <div>
                      <div className="text-xs text-gray-400">{isLive ? "Ends in" : "Time left"}</div>
                      <div className="mt-2 text-lg font-semibold">{formatTimeRemaining(isLive ? end - now : timeLeft)}</div>
                    </div>
                    {/* {console.log(id)} */}
                    <div className="flex items-center gap-3">
                      {!isLive && !isRegistered && (

                        <button
                          onClick={() => registerForContest(id)}
                          disabled={isRegistering}
                          className="btn px-6 py-3 rounded-full shadow-md"
                          style={{ backgroundColor: "#f6c94a", color: "#071428" }}
                        >
                          {isRegistering ? "Registering..." : "Register"}
                        </button>
                      )}

                      {!isLive && isRegistered && (
                        <div className="px-4 py-2 rounded-full text-sm font-medium" style={{ backgroundColor: "rgba(246,201,74,0.12)", color: "#f6c94a" }}>
                          Registered
                        </div>
                      )}

                      {isLive && isRegistered && (
                        <Link to={`/contests/${id}`} className="btn px-6 py-3 rounded-full shadow-md" style={{ backgroundColor: "#f6c94a", color: "#071428" }}>
                          Join
                        </Link>
                      )}
                    </div>
                  </div>

                  <div className="mt-5 border-t border-gray-700/20 pt-4 text-sm text-gray-300 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="avatar placeholder">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center text-black bg-yellow-400">
                          _NEX_
                        </div>
                      </div>
                      <div>
                        <div className="text-sm">Hosted by <span className="font-medium">NexLoop</span></div>
                        <div className="text-xs text-gray-400">Open to all</div>
                      </div>
                    </div>

                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* Past Contests (from user history) */}
        <section className="mt-16">
          <h2 className="text-2xl font-bold mb-4">Past Contests</h2>

          <div className="space-y-4">
            {pastHistory.length === 0 && (
              <div className="p-6 rounded-xl border border-gray-700/30 bg-[#071428]">
                <p className="text-gray-300">No past contests available.</p>
              </div>
            )}

            {pastHistory.map((entry, idx) => {
              const contest = entry.contest || {};
              const contestId = entry?.contest?.id || entry?.contest?._id;
              console.log(entry)
              return (
                <div key={idx} className="p-4 rounded-xl border border-gray-700/30 bg-[#08122a]/60 flex items-center justify-between">
                  <div>
                    <div className="font-semibold">{contest.name || "—"}</div>
                    <div className="text-xs text-gray-400">Participated: {friendlyDate(entry.participatedAt)}</div>
                    {(entry?.attempt)?<div className="text-xs text-gray-400">Solved: {(entry.solvedProblems || []).length} / attempted: {entry.attempt || 0}</div> : <div className="text-xs text-gray-400">Not Attempted yet</div>}
                  </div>

                  {(entry?.attempt)?(
                     <div className="text-right">
                    <div className="text-sm font-bold text-yellow-400">{entry.points ?? 0} pts</div>
                    <Link to={`/contest/${contestId}`} className="text-xs mt-1 block text-gray-300 underline">
                      View results
                    </Link>
                  </div>
                  ): ""}
                </div>
              );
            })}
          </div>
        </section>

        <div className="h-24" />
      </div>
    </div>
  );
}
