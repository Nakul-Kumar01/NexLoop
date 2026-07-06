import React, { useMemo, useState, useRef, useEffect } from "react";
import { useSelector } from "react-redux";
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import dayjs from "dayjs";
import {
  ResponsiveContainer,
  PieChart, Pie, Cell, Tooltip,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  LineChart,
  Line,
  Legend
} from "recharts";
import CalendarHeatmap from "react-calendar-heatmap";
import { Tooltip as ReactTooltip } from 'react-tooltip';
import { FaAward, FaCalendarAlt, FaEnvelope, FaUser } from "react-icons/fa";
import { motion } from "framer-motion";
import axiosClient from "../utils/axiosClient";
import "react-calendar-heatmap/dist/styles.css";
import Footer from "./Footer";
// import "react-calendar-heatmap/dist/react-calendar-heatmap.css";


const DIFF_COLORS = {
  easy: "#10B981",
  medium: "#F59E0B",
  hard: "#EF4444"
};

export default function MyProfile() {
  // your state comes from redux; you said the user object looks like:
  // { firstName, lastName, emailId, role, solvedProblems, totalPoints, rank, joinDate }
  const { user } = useSelector((state) => state.profile || {});
  console.log("user profile:", user);
  const firstName = user?.firstName || "User";
  const lastName = user?.lastName || "";
  const email = user?.emailId || user?.email || "-";
  const joinDate = user?.joinDate || user?.createdAt || null;
  const totalPoints = user?.totalPoints ?? 0;
  const rank = user?.rank ?? "--";

  const [submissionHistory, setSubmissionHistory] = useState([]);
  const [subHistoryDate, setSubHistoryDate] = useState(null);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [historyError, setHistoryError] = useState(null);

  // request for userSubmissionHistory
  useEffect(() => {
    const fetchSubmissionHistory = async () => {
      setLoadingHistory(true);
      setHistoryError(null);
      try {
        const response = await axiosClient.get(`/problem/userSubmissionHistory`);
        console.log("-->", response.data.submissions);
        setSubmissionHistory(response.data.submissions);
        const normalized = response.data.submissions.map(s => ({ ...s, createdAt: s.createdAt ? dayjs(s.createdAt).toISOString() : null }));
        setSubHistoryDate(normalized);
      } catch (error) {
        console.error('Error fetching History:', error);
        setHistoryError(err?.message || 'Failed to load history');
      } finally {
        setLoadingHistory(false);
      }
    };

    fetchSubmissionHistory();
  }, []);

  // ensure we read the solved problems array from the shape you described
  const solved = Array.isArray(user?.solvedProblems) ? user.solvedProblems : [];

  // UI toggles
  const [visible, setVisible] = useState({ easy: true, medium: true, hard: true });
  const [areaCurve, setAreaCurve] = useState('monotone');
  const containerRef = useRef(null);

  const toggleVisible = (k) => setVisible(v => ({ ...v, [k]: !v[k] }));


  // #### LEFT PIE CHART ####
  // difficulty counts (use createdAt as date source if present)
  const difficultyCounts = useMemo(() => {
    const res = { easy: 0, medium: 0, hard: 0 };
    for (const p of solved) {
      const d = (p?.difficulty || "").toString().toLowerCase();
      if (d.includes('easy')) res.easy++;
      else if (d.includes('medium')) res.medium++;
      else if (d.includes('hard')) res.hard++;
      else {
        // fallback: try heuristics (if rating/level present)
        const rating = p?.rating || p?.difficultyLevel || p?.level;
        if (typeof rating === 'number') {
          if (rating >= 1600) res.hard++;
          else if (rating >= 1100) res.medium++;
          else res.easy++;
        } else {
          // put unknown into easy to keep the pie visible
          res.easy++;
        }
      }
    }
    return res;
  }, [solved]);

  const totalSolved = solved.length;
  const target = 25;
  const progressPct = Math.min(100, Math.round((totalSolved / target) * 100));

  // Pie data for recharts (respect visibility toggles)
  const pieData = useMemo(() => ([
    { name: 'Easy', key: 'easy', value: visible.easy ? difficultyCounts.easy : 0, color: DIFF_COLORS.easy },
    { name: 'Medium', key: 'medium', value: visible.medium ? difficultyCounts.medium : 0, color: DIFF_COLORS.medium },
    { name: 'Hard', key: 'hard', value: visible.hard ? difficultyCounts.hard : 0, color: DIFF_COLORS.hard }
  ]), [difficultyCounts, visible]);



  // ### RIGHT TOP GRAPH ###
  const lastNDaysData = useMemo(() => {
    const n = 15; // 15 points = last 14 days + today
    const days = Array.from({ length: n }).map((_, i) => {
      const d = dayjs().subtract(n - 1 - i, 'day');
      return { date: d.format('YYYY-MM-DD'), label: d.format('MMM D'), easy: 0, medium: 0, hard: 0, total: 0 };
    });
    // console.log(solved);
    // console.log(submissionHistory);
    for (const p of submissionHistory) {
      const raw = p?.createdAt;
      if (!raw) continue;
      const ds = dayjs(raw).format('YYYY-MM-DD');
      const idx = days.findIndex(x => x.date === ds);
      if (idx === -1) continue;
      // find the matching problem in 'solve' by problemId
      const match = solved.find(s => s._id === p.problemId);
      if (!match) continue;

      // assign difficulty from 'solve'
      p.difficulty = match.difficulty;
      const d = (p?.difficulty || '').toString().toLowerCase();
      if (d.includes('easy')) days[idx].easy++;
      else if (d.includes('medium')) days[idx].medium++;
      else if (d.includes('hard')) days[idx].hard++;
      else days[idx].easy++;
      days[idx].total++;
    }

    return days;
  }, [submissionHistory.length]);

  // ### RIGHT MIDDLE GRAPH ###
  const acceptedTrend = useMemo(() => {
    const n = 30;
    const days = Array.from({ length: n }).map((_, i) => {
      const d = dayjs().subtract(n - 1 - i, 'day');
      return { date: d.format('YYYY-MM-DD'), label: d.format('MMM D'), count: 0 };
    });
    for (const p of submissionHistory) {
      const raw = p?.createdAt;
      if (!raw) continue;
      const ds = dayjs(raw).format('YYYY-MM-DD');
      const idx = days.findIndex(x => x.date === ds);
      if (idx >= 0) days[idx].count++;
    }
    return days;
  }, [submissionHistory.length]);

  // ### RIGHT HEATMAP ### 
  const heatmapValues = useMemo(() => {
    const map = {};
    for (const p of submissionHistory) {
      const raw = p?.createdAt;
      if (!raw) continue;
      const k = dayjs(raw).format('YYYY-MM-DD');
      map[k] = (map[k] || 0) + 1;
    }
    return Object.keys(map).map(k => ({ date: k, count: map[k] }));
  }, [submissionHistory.length]);

  // small convenience: compute reasonable X axis interval (avoid NaN or very large values)
  const safeInterval = (len, desiredTicks = 6) => {
    if (!len || len <= 1) return 0;
    // floor to keep tick count <= desiredTicks
    const approx = Math.max(0, Math.floor(len / desiredTicks));
    return approx;
  };

  // Pie tooltip content renderer
  const PieTip = ({ active, payload }) => {
    if (!active || !payload || !payload.length) return null;
    const p = payload[0];
    const name = p.name;
    const value = p.value;
    const total = difficultyCounts.easy + difficultyCounts.medium + difficultyCounts.hard || 1;
    const pct = Math.round((value / total) * 100);
    return (
      <div className="bg-[#0f1724] text-slate-100 p-2 rounded-md border border-slate-700 text-sm">
        <div className="font-semibold">{name}</div>
        <div className="text-xs mt-1">{value} solved • {pct}%</div>
      </div>
    );
  };

  return (
    <div ref={containerRef} className="min-h-screen pt-20 p-6 bg-gradient-to-br from-[#061021] via-[#071428] to-[#08122a] text-slate-200">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* LEFT */}
        <div className="lg:col-span-4 space-y-6">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.28 }} className="card p-6 rounded-2xl shadow-2xl border border-slate-700 bg-opacity-10 backdrop-blur-sm">
            <div className="flex items-center gap-4">
              <div className="avatar">
                <div className="w-24 h-24 rounded-full ring-4 ring-yellow-500 overflow-hidden bg-gradient-to-br from-yellow-500/20 to-transparent flex items-center justify-center text-yellow-400 text-3xl">
                  <DotLottieReact src="https://lottie.host/77be2808-05f8-4198-8089-e2df4f1026e9/RrB0UdFcNU.lottie" loop autoplay />
                </div>
              </div>
              <div className="flex-1">
                <div className="text-2xl font-semibold tracking-tight">{firstName} {lastName}</div>
                <div className="text-sm text-slate-300 flex items-center gap-2 mt-1"><FaEnvelope /> <span>{email}</span></div>
                <div className="text-xs text-slate-400 mt-2 flex items-center gap-2"><FaCalendarAlt /> Joined {joinDate ? dayjs(joinDate).format('DD MMM, YYYY') : '-'}</div>
              </div>
            </div>

            <div className="divider my-4 before:bg-slate-700 after:bg-slate-700" />

            <div className="grid grid-cols-2 gap-3">
              <div className="stat bg-transparent border border-slate-700 rounded-xl p-3">
                <div className="stat-figure text-yellow-400"><FaAward /></div>
                <div className="stat-title text-slate-300">Rank</div>
                <div className="stat-value text-lg">#{rank}</div>
              </div>

              <div className="stat bg-transparent border border-slate-700 rounded-xl p-3">
                <div className="stat-figure text-yellow-400"><FaUser /></div>
                <div className="stat-title text-slate-300">Points</div>
                <div className="stat-value text-lg">{totalPoints}</div>
              </div>
            </div>

            
          </motion.div>

          {/* PIE (Recharts) */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.32 }} className="card p-6 rounded-2xl border border-slate-700 bg-opacity-10 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">Problems Solved</h3>
              <div className="text-xs text-slate-400">{totalSolved} total</div>
            </div>

            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={78} innerRadius={40} paddingAngle={6} isAnimationActive>
                    {pieData.map((entry, i) => (
                      <Cell key={entry.key || i} fill={entry.color} stroke={entry.value === 0 ? 'transparent' : undefined} />
                    ))}
                  </Pie>
                  <Tooltip content={<PieTip />} />
                </PieChart>
              </ResponsiveContainer>

              <div className="mt-8 grid grid-cols-3 gap-2 text-center">
                {['easy', 'medium', 'hard'].map((k) => (
                  <button key={k} onClick={() => toggleVisible(k)} className="p-3 rounded-lg border border-slate-700 bg-transparent flex flex-col items-center gap-1">
                    <div className="text-xs text-slate-300 capitalize">{k}</div>
                    <div className="text-lg font-medium" style={{ color: k === 'easy' ? DIFF_COLORS.easy : k === 'medium' ? DIFF_COLORS.medium : DIFF_COLORS.hard }}>{difficultyCounts[k]}</div>
                    <div className="text-[10px] text-slate-400">{visible[k] ? 'visible' : 'hidden'}</div>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>

        </div>

        {/* RIGHT */}
        <div className="lg:col-span-8 mt-40 lg:mt-0 space-y-6">

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.32 }} className="card p-6 rounded-2xl border border-slate-700 bg-opacity-10 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="text-lg font-semibold">Recent Activity</h3>
                <div className="text-sm text-slate-400">Total for period: {lastNDaysData.reduce((s, d) => s + d.total, 0)}</div>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-400">
                <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-sm block" style={{ background: DIFF_COLORS.easy }}></span> Easy</div>
                <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-sm block" style={{ background: DIFF_COLORS.medium }}></span> Medium</div>
                <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-sm block" style={{ background: DIFF_COLORS.hard }}></span> Hard</div>

                <div className="ml-4 flex items-center gap-2">
                  <button className={`btn btn-xs ${areaCurve === 'monotone' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setAreaCurve('monotone')}>Smooth</button>
                  <button className={`btn btn-xs ${areaCurve === 'linear' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setAreaCurve('linear')}>Linear</button>
                </div>
              </div>
            </div>

            <div className="mt-4 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={lastNDaysData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gEasy" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={DIFF_COLORS.easy} stopOpacity={0.6} /><stop offset="95%" stopColor={DIFF_COLORS.easy} stopOpacity={0} /></linearGradient>
                    <linearGradient id="gMed" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={DIFF_COLORS.medium} stopOpacity={0.6} /><stop offset="95%" stopColor={DIFF_COLORS.medium} stopOpacity={0} /></linearGradient>
                    <linearGradient id="gHard" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={DIFF_COLORS.hard} stopOpacity={0.6} /><stop offset="95%" stopColor={DIFF_COLORS.hard} stopOpacity={0} /></linearGradient>
                  </defs>

                  <CartesianGrid strokeDasharray="3 3" stroke="#0b1220" />
                  <XAxis dataKey="label" tick={{ fontSize: 12 }} interval={safeInterval(lastNDaysData.length, 7)} />
                  <YAxis />
                  <Tooltip content={({ active, payload, label }) => active ? (
                    <div className="bg-[#0f1724] text-slate-100 p-3 rounded-lg border border-slate-700 shadow-lg text-sm">
                      <div className="font-semibold">{label}</div>
                      <div className="mt-1">Total: <span className="font-medium">{(payload?.reduce?.((s, p) => s + (p.value || 0), 0)) || 0}</span></div>
                      <div className="mt-2 space-y-1">
                        {payload?.map(p => (
                          <div key={p.dataKey} className="flex items-center gap-2"><span className="w-2 h-2 rounded-full" style={{ background: (p.dataKey === 'easy' ? DIFF_COLORS.easy : p.dataKey === 'medium' ? DIFF_COLORS.medium : DIFF_COLORS.hard) }}></span> {p.dataKey}: {p.value}</div>
                        ))}
                      </div>
                    </div>
                  ) : null} />

                  {visible.easy && <Area type={areaCurve} dataKey="easy" stroke={DIFF_COLORS.easy} fillOpacity={1} fill="url(#gEasy)" />}
                  {visible.medium && <Area type={areaCurve} dataKey="medium" stroke={DIFF_COLORS.medium} fillOpacity={1} fill="url(#gMed)" />}
                  {visible.hard && <Area type={areaCurve} dataKey="hard" stroke={DIFF_COLORS.hard} fillOpacity={1} fill="url(#gHard)" />}
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>



          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.34 }} className="card p-6 rounded-2xl border border-slate-700 bg-opacity-10 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="text-lg font-semibold">Recent Accepted Submissions Trend</h3>
                <div className="text-sm text-slate-400">Total for period: {acceptedTrend.reduce((s, d) => s + d.count, 0)}</div>
              </div>
            </div>

            <div className="mt-4 h-56">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={acceptedTrend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#0b1220" />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} interval={safeInterval(acceptedTrend.length, 8)} />
                  <YAxis />
                  <Tooltip formatter={(value) => [value, 'Accepted']} />
                  <Legend verticalAlign="bottom" payload={[{ value: 'Accepted Submissions', type: 'line', color: DIFF_COLORS.medium }]} />
                  <Line type="monotone" dataKey="count" stroke={DIFF_COLORS.medium} strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* heatmap */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.36 }}
            className="overflow-visible card p-6 rounded-2xl border border-slate-700 bg-opacity-10 backdrop-blur-sm"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">Submissions this year</h3>
              <div className="text-sm text-slate-400">
                {totalSolved} submissions in {dayjs().format('YYYY')}
              </div>
            </div>

            <CalendarHeatmap
              startDate={dayjs().subtract(1, 'year').add(1, 'day').format('YYYY-MM-DD')}
              endDate={dayjs().format('YYYY-MM-DD')}
              values={heatmapValues}
              classForValue={(value) => {
                if (!value) return 'color-empty';
                if (value.count >= 6) return 'color-scale-4';
                if (value.count >= 4) return 'color-scale-3';
                if (value.count >= 2) return 'color-scale-2';
                return 'color-scale-1';
              }}
              tooltipDataAttrs={(value) => {
                if (!value || !value.date) return {};
                return {
                  'data-tooltip-id': 'heatmap-tooltip',
                  'data-tooltip-content': `${value.date} - ${value.count || 0} submissions`,
                };
              }}
              showWeekdayLabels
            />

            <ReactTooltip id="heatmap-tooltip" />
          </motion.div>

          

        </div>

      </div>
      <Footer></Footer>
    </div>
  );
}
