import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import axiosClient from "../utils/axiosClient";
import { NavLink } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import { Search, RefreshCw, CheckCircle2, Zap, Clock, Tag } from "lucide-react";

export default function ProblemListComponent() {
  const { user } = useSelector((state) => state.auth || {});
  const [problems, setProblems] = useState([]);
  const [solvedProblems, setSolvedProblems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // UI state
  const [filters, setFilters] = useState({ difficulty: "all", tag: "all", status: "all" });
  const [q, setQ] = useState(""); // raw typing value
  const [search, setSearch] = useState(""); // debounced value
  const [sort, setSort] = useState("latest");
  const [page, setPage] = useState(1);
  const [totalProblemsInDB, setTotalProblemsInDB] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  // let totalProblemsInDB,totalPages;

  // debounce search (300ms)
  useEffect(() => {
    const t = setTimeout(() => setSearch(q.trim()), 300);
    return () => clearTimeout(t);
  }, [q]);

  useEffect(() => {
    let mounted = true;
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [problemsResponse, solvedResponse] = await Promise.all([
          axiosClient.get(`/problem/getAllProblem?page=${page}`),
          user ? axiosClient.get("/problem/problemSolvedByUser") : Promise.resolve({ data: [] }),
        ]);
        console.log(problemsResponse);
        setTotalProblemsInDB(problemsResponse.data.total);
        setTotalPages(problemsResponse.data.totalPages)
        if (!mounted) return;
        setProblems(Array.isArray(problemsResponse.data.problems) ? problemsResponse.data.problems : []);
        if (user) setSolvedProblems(Array.isArray(solvedResponse.data) ? solvedResponse.data : []);
      } catch (err) {
        console.error("Problem fetch error:", err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    fetchData();
    return () => (mounted = false);
  }, [user, page]);

  const difficultyOptions = useMemo(
    () => [
      { value: "all", label: "All" },
      { value: "easy", label: "Easy" },
      { value: "medium", label: "Medium" },
      { value: "hard", label: "Hard" },
    ],
    []
  );

  const tagOptions = useMemo(() => ["all", "array", "linkedList", "graph", "dp", "tree", "strings"], []);

  const filteredProblems = useMemo(() => {
    const normalize = (s = "") => String(s).toLowerCase();
    let list = problems.filter((p) => {
      const dMatch = filters.difficulty === "all" || normalize(p.difficulty) === filters.difficulty;
      const tags = Array.isArray(p.tags) ? p.tags : String(p.tags || "").split(",").map((t) => t.trim());
      const tMatch = filters.tag === "all" || tags.map(normalize).includes(filters.tag);
      const sMatch = filters.status === "all" || (filters.status === "solved" ? solvedProblems.some((sp) => sp._id === p._id) : true);
      const qMatch = !search || normalize(p.title).includes(normalize(search)) || (p.description && normalize(p.description).includes(normalize(search)));
      return dMatch && tMatch && sMatch && qMatch;
    });

    if (sort === "latest") list.sort((a, b) => (new Date(b.createdAt || 0)) - (new Date(a.createdAt || 0)));
    if (sort === "oldest") list.sort((a, b) => (new Date(a.createdAt || 0)) - (new Date(b.createdAt || 0)));
    if (sort === "difficulty") list.sort((a, b) => difficultyWeight(a.difficulty) - difficultyWeight(b.difficulty));

    return list;
  }, [problems, solvedProblems, filters, search, sort]);

  return (
    <div className="min-h-screen w-full pt-25  sm:pt-20 px-2 sm:p-6" style={{ backgroundColor: "#061021", color: "white" }}>
      {/* Decorative blobs */}
      <div className="pointer-events-none fixed -top-40 -left-40 w-[680px] h-[680px] rounded-full bg-gradient-to-tr from-[#061021] via-[#071428] to-[#08122a] opacity-30 blur-[120px] transform-gpu" />
      <div className="pointer-events-none fixed -bottom-36 -right-36 w-[520px] h-[520px] rounded-full bg-gradient-to-br from-[#FE9A00] via-[#8b5cf6] to-[#06b6d4] opacity-10 blur-[140px] transform-gpu" />

      <div className="max-w-7xl mx-auto">
        <motion.header
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 w-[100%] flex flex-col   sm:flex-row items-start gap-4 "
        >
          <div className="w-[45%]">
            <h1 className="text-4xl lg:text-5xl font-extrabold mb-1" style={{ color: "#FE9A00" }}>
              <span className="text-[#5BBBBB]">Coding</span> Problems
            </h1>
            <p className="text-slate-300 max-w-xl">Practice, track progress and level up ✦</p>

          </div>

          <div className="w-[90%] lg:w-[55%]">
            <div className="bg-[#071428]/40 w-[100%] p-3 rounded-2xl border border-slate-700/30">
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Search titles, descriptions, tags..."
                    className="input input-ghost w-full pl-10 bg-transparent text-white placeholder-slate-400"
                    aria-label="Search problems"
                  />
                </div>

                <button
                  className="btn btn-sm bg-[#FE9A00] text-[#061021] border-0 hover:brightness-95"
                  onClick={() => {
                    setFilters({ difficulty: "all", tag: "all", status: "all" });
                    setQ("");
                    setSearch("");
                    setSort("latest");
                  }}
                  title="Reset filters"
                >
                  <RefreshCw size={16} />
                </button>
              </div>

              <div className="mt-3 grid grid-cols-3 gap-2">
                <select className="select select-bordered bg-[#08122a]/40 text-white text-sm" value={filters.difficulty} onChange={(e) => setFilters((s) => ({ ...s, difficulty: e.target.value }))}>
                  {difficultyOptions.map((d) => (
                    <option key={d.value} value={d.value}>{d.label}</option>
                  ))}
                </select>

                <select className="select select-bordered bg-[#08122a]/40 text-white text-sm" value={filters.tag} onChange={(e) => setFilters((s) => ({ ...s, tag: e.target.value }))}>
                  {tagOptions.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>

                <select className="select select-bordered bg-[#08122a]/40 text-white text-sm" value={filters.status} onChange={(e) => setFilters((s) => ({ ...s, status: e.target.value }))}>
                  <option value="all">All</option>
                  <option value="solved">Solved</option>
                </select>
              </div>

              <div className="mt-3 flex items-center gap-2">
                <select className="select select-bordered bg-[#08122a]/40 text-white text-sm" value={sort} onChange={(e) => setSort(e.target.value)}>
                  <option value="latest">Latest</option>
                  <option value="oldest">Oldest</option>
                  <option value="difficulty">Difficulty</option>
                </select>

                <div className="ml-auto text-sm text-slate-400">Showing <strong className="text-white">{filteredProblems.length}</strong> / <strong className="text-white">{totalProblemsInDB}</strong></div>
              </div>
            </div>
          </div>
        </motion.header>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Left column: stats card (sticky) */}
          <aside className="lg:col-span-1 hidden lg:block">
            <div className="sticky top-24 space-y-4">
              <div className="bg-gradient-to-br from-[#071428]/60 to-[#08122a]/40 rounded-2xl p-5 border border-slate-700/30 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-slate-300 text-sm">Library</h3>
                    <div className="text-white text-2xl font-bold">{totalProblemsInDB}</div>
                    <p className="text-slate-400 text-xs">Problems in library</p>
                  </div>
                  <div className="flex flex-col items-end">
                    <div className="text-2xl font-semibold" style={{ color: "#7ee7b7" }}>{solvedProblems.length}</div>
                    <div className="text-slate-400 text-xs">Solved</div>
                  </div>
                </div>

                <div className="mt-4">
                  <ProgressRing percent={totalProblemsInDB ? Math.round((solvedProblems.length / totalProblemsInDB) * 100) : 0} />
                </div>
              </div>

              <div className="bg-[#071428]/30 rounded-2xl p-4 border border-slate-700/30">
                <h4 className="text-slate-300 text-sm mb-2 flex items-center gap-2"><Tag size={14} /> Popular tags</h4>
                <div className="flex flex-wrap gap-2">
                  {tagOptions.filter((t) => t !== "all").map((t) => (
                    <button key={t} onClick={() => setFilters((s) => ({ ...s, tag: t }))} className={`btn btn-xs btn-outline rounded-full text-xs ${filters.tag === t ? "border-[#FE9A00] text-[#FE9A00]" : "text-slate-300"}`}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-[#071428]/30 rounded-2xl p-4 border border-slate-700/30">
                <h4 className="text-slate-300 text-sm mb-2">Pro Tips</h4>
                <ul className="text-slate-400 text-sm space-y-2">
                  <li>Use filters to narrow down fast.</li>
                  <li>Click a problem to open description and submit solutions.</li>
                  <li>Marked solved items highlight automatically.</li>
                </ul>
              </div>
            </div>
          </aside>

          {/* Right column: problem list */}
          <main className="lg:col-span-3">
            <div className="rounded-2xl px-2 sm:p-6 bg-gradient-to-br from-[#071428]/50 to-[#08122a]/40 border border-slate-700/30 shadow-lg">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-2xl font-bold">Problems</h2>
                <div className="text-slate-400">Showing {filteredProblems.length} of {totalProblemsInDB}</div>
              </div>

              {isLoading ? (
                <div className="grid gap-4">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <div key={i} className="animate-pulse bg-[#061021]/30 rounded-lg p-6 h-28" />
                  ))}
                </div>
              ) : filteredProblems.length === 0 ? (
                <div className="text-center py-12">
                  <svg className="mx-auto h-16 w-16 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 className="mt-4 text-xl font-medium text-slate-300">No problems found</h3>
                  <p className="mt-2 text-slate-500">Try adjusting filters or adding new problems.</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  <div className="grid grid-cols-12 gap-4 px-4 py-2 rounded-lg text-slate-400 font-medium bg-[#061021]/10">
                    <div className="col-span-6">Title</div>
                    <div className="col-span-3 text-center">Difficulty</div>
                    <div className="col-span-3 text-center">Tags</div>
                  </div>

                  <AnimatePresence>
                    {filteredProblems.map((problem) => (
                      <ProblemCard key={problem._id} problem={problem} isSolved={solvedProblems.some((sp) => sp._id === problem._id)} />
                    ))}

                  </AnimatePresence>
                  <div className="flex justify-center gap-4 mt-6">
                    <button
                      onClick={() => (page > 1 ? setPage((p) => p - 1) : null)}
                      disabled={page === 1}
                      className="btn btn-outline btn-primary  disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                    >
                      ← Prev
                    </button>

                    <span className="text-lg font-semibold text-gray-700">
                      Page {page} / {totalPages}
                    </span>

                    <button
                      onClick={() => (page < totalPages ? setPage((p) => p + 1) : null)}
                      disabled={page === totalPages}
                      className="btn btn-outline btn-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                    >
                      Next →
                    </button>
                  </div>

                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

// ----------------------- Subcomponents -----------------------
function ProblemCard({ problem, isSolved }) {
  const tags = Array.isArray(problem.tags) ? problem.tags : String(problem.tags || "").split(",").map((t) => t.trim());

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      layout
      whileHover={{ scale: 1.01, boxShadow: "0 10px 30px rgba(0,0,0,0.4)" }}
      className={`card bg-[#061021]/20 backdrop-blur-sm rounded-lg border p-0 overflow-hidden ${isSolved ? "border-green-500/30" : "border-slate-700/40"}`}
    >
      <div className="card-body py-4 px-6">
        <div className="grid grid-cols-12 gap-4 items-center">
          <div className="col-span-6">
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <h3 className="text-lg font-semibold">
                  <NavLink to={`/problem/${problem._id}`} className="hover:text-[#FE9A00] transition-colors">
                    {problem.title}
                  </NavLink>
                </h3>
              </div>

              {isSolved && (
                <div className="badge badge-success gap-2 p-2 ml-2">Solved</div>
              )}
            </div>
          </div>

          <div className="col-span-3 flex justify-center">
            <div className={`badge badge-lg ${getDifficultyBadgeColor(problem.difficulty)}`}>{problem.difficulty}</div>
          </div>

          <div className="col-span-3 flex justify-center">
            <div className="flex flex-wrap gap-2 justify-center">
              {tags.slice(0, 4).map((tag) => (
                <span key={tag} className="badge badge-outline badge-lg">{tag}</span>
              ))}
              {tags.length > 4 && <span className="text-slate-400 text-xs">+{tags.length - 4}</span>}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function ProgressRing({ percent = 0 }) {
  const size = 64;
  const stroke = 6;
  const radius = (size - stroke) / 2;
  const circ = 2 * Math.PI * radius;
  const dash = (percent / 100) * circ;

  return (
    <div className="flex items-center gap-3">
      <svg width={size} height={size} className="rounded-full" aria-hidden>
        <defs>
          <linearGradient id="g1" x1="0" x2="1">
            <stop offset="0%" stopColor="#FE9A00" />
            <stop offset="100%" stopColor="#7ee7b7" />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={radius} stroke="#0b1220" strokeWidth={stroke} fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#g1)"
          strokeWidth={stroke}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={`${dash} ${circ - dash}`}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <div>
        <div className="text-white font-semibold text-lg">{percent}%</div>
        <div className="text-slate-400 text-xs">Completion</div>
      </div>
    </div>
  );
}

// ----------------------- Helpers -----------------------
function difficultyWeight(d) {
  const s = String(d || "").toLowerCase();
  if (s === "easy") return 1;
  if (s === "medium") return 2;
  if (s === "hard") return 3;
  return 0;
}

function getDifficultyBadgeColor(difficulty) {
  if (!difficulty) return "badge-neutral";
  switch (String(difficulty).toLowerCase()) {
    case "easy":
      return "badge-success";
    case "medium":
      return "badge-warning";
    case "hard":
      return "badge-error";
    default:
      return "badge-ghost";
  }
}
