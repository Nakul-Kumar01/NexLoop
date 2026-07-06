import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";
import axiosClient from "../utils/axiosClient";
import Editor from "@monaco-editor/react";
import { motion, AnimatePresence } from "framer-motion";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import Confetti from "react-confetti";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import toast, { Toaster } from "react-hot-toast";
import {
    FileText,
    Trophy,
    CheckCircle,
    Play,
    Code,
    Send,
    XCircle,
    ChartNoAxesCombined,
} from "lucide-react";

// Color theme and language maps
const THEME = {
    bg1: "#061021",
    bg2: "#071428",
    bg3: "#08122a",
    accent: "#f59e0b", // tailwind yellow-500 equivalent
};

const langMap = {
    cpp: "C++",
    java: "Java",
    python: "Python",
};

export default function ContestSolve() {
    const { id } = useParams(); // contest id
    const navigate = useNavigate();

    // data
    const [contest, setContest] = useState(null);
    const [problems, setProblems] = useState([]);
    const [problemCount, setProblemCount] = useState(0);
    const [selectedLanguage, setSelectedLanguage] = useState("cpp");

    // editor + runtime states
    const [code, setCode] = useState("");
    const [runResult, setRunResult] = useState(null);
    const [submitResult, setSubmitResult] = useState(null);
    const [loading, setLoading] = useState(false);

    // UI state
    const [activeLeftTab, setActiveLeftTab] = useState("description");
    // const [activeRightTab, setActiveRightTab] = useState("code");
    const editorRef = useRef(null);

    // editor/console layout
    const [consoleCollapsed, setConsoleCollapsed] = useState(false);

    // autosave debounce
    const saveTimerRef = useRef(null);

    // animations & success
    const [showConfetti, setShowConfetti] = useState(false);
    const [progress, setProgress] = useState(0);
    const [showCheck, setShowCheck] = useState(false);

    // contest timing & solved tracking
    const [remaining, setRemaining] = useState(null);
    const solvedSetRef = useRef(new Set());

    // helper to compute current problem id
    const currentProblem = problems[problemCount];
    const currentProblemId = currentProblem?._id;

    // ========== FETCH CONTEST ===========
    useEffect(() => {
        let isMounted = true;
        const fetchContest = async () => {
            setLoading(true);
            try {
                const res = await axiosClient.get(`/contest/${id}`);
                if (!isMounted) return;
                const contestData = res.data.contest;
                setContest(contestData);
                setProblems(contestData.problems || []);

                // if no problems or less than 1 -> redirect home with message
                if (!contestData.problems || contestData.problems.length === 0) {
                    toast.error("Contest has no problems. Redirecting home...");
                    navigate("/");
                    return;
                }

                // load initial code for first problem (safe guard)
                const initialProblem = contestData.problems[0];
                const codeForLang = getStartCodeForProblem(initialProblem, selectedLanguage);
                setCode(codeForLang);

                setLoading(false);
            } catch (err) {
                console.error("Error fetching contest:", err);
                toast.error("Failed to load contest. Redirecting home...");
                navigate("/");
            }
        };

        fetchContest();

        return () => {
            isMounted = false;
        };
    }, [id]);

    // ========== handle countdown & auto-close ===========
    useEffect(() => {
        if (!contest) return;

        const updateRemaining = () => {
            const now = Date.now();
            const end = new Date(contest.endTime).getTime();
            if (now >= end) {
                setRemaining(0);
                // contest already over -> close and redirect
                handleContestCloseAndRedirect(true);
                return;
            }

            const msLeft = Math.max(0, end - now);
            setRemaining(msLeft);
        };

        updateRemaining();
        const t = setInterval(updateRemaining, 1000);
        return () => clearInterval(t);
    }, [contest]);

    // ========== update code on problem/language change (safe) ===========
    useEffect(() => {
        if (!problems || !problems[problemCount]) return;
        const p = problems[problemCount];
        const saved = loadDraft(id, p._id, selectedLanguage);
        if (saved) {
            setCode(saved);
            return;
        }
        const codeForLang = getStartCodeForProblem(p, selectedLanguage);
        setCode(codeForLang);

        // clear previous run/submit results when switching problems
        setRunResult(null);
        setSubmitResult(null);
    }, [selectedLanguage, problems, problemCount]);

    // ========== autosave drafts ==========
    useEffect(() => {
        // don't autosave when there's no current problem
        if (!currentProblemId) return;

        // debounce save
        if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
        saveTimerRef.current = setTimeout(() => {
            saveDraft(id, currentProblemId, selectedLanguage, code);
        }, 800);

        return () => {
            if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
        };
    }, [code, selectedLanguage, currentProblemId]);

    // ========== when accepted run confetti animation ===========
    useEffect(() => {
        if (submitResult?.status?.id === 3) {
            // accepted
            setShowConfetti(true);
            setShowCheck(false);
            setProgress(0);

            let p = 0;
            const interval = setInterval(() => {
                p += 4;
                if (p >= 100) {
                    p = 100;
                    clearInterval(interval);
                    setTimeout(() => setShowCheck(true), 250);
                }
                setProgress(p);
            }, 25);

            const confettiTimer = setTimeout(() => setShowConfetti(false), 4500);

            // update solved set (idempotent)
            if (currentProblemId) solvedSetRef.current.add(currentProblemId);

            // if all solved -> close/redirect
            if (problems && solvedSetRef.current.size >= problems.length) {
                handleContestCloseAndRedirect();
            }

            return () => {
                clearInterval(interval);
                clearTimeout(confettiTimer);
            };
        } else {
            setShowConfetti(false);
            setProgress(0);
            setShowCheck(false);
        }
    }, [submitResult]);

    // ========== helpers ===========
    function getStartCodeForProblem(problem, shortLangKey) {
        try {
            const langName = langMap[shortLangKey];
            const sc = problem.startCode.find((s) => s.language === langName);
            if (!sc) return "";
            // prefer UserCode, but fallback to combined header+user+footer
            if (sc.UserCode && sc.UserCode.trim()) return sc.UserCode;
            return (sc.HeaderCode || "") + (sc.UserCode || "") + (sc.FooterCode || "");
        } catch (err) {
            return "";
        }
    }

    function loadDraft(contestId, problemId, languageKey) {
        try {
            const key = `contest:${contestId}:problem:${problemId}:lang:${languageKey}`;
            return localStorage.getItem(key);
        } catch (err) {
            return null;
        }
    }

    function saveDraft(contestId, problemId, languageKey, codeContent) {
        try {
            const key = `contest:${contestId}:problem:${problemId}:lang:${languageKey}`;
            localStorage.setItem(key, codeContent);
        } catch (err) {
            // ignore
        }
    }

    async function handleContestCloseAndRedirect(force = false) {
        // Try to call backend to mark closed. If backend doesn't have endpoint, we still redirect.
        // try {
        //     // endpoint best-effort. If your backend uses different route, change this.
        //     await axiosClient.patch(`/contest/close/${id}`, { force });
        // } catch (err) {
        //     // ignore server error; we'll still redirect
        //     console.warn("auto-close failed (server):", err?.message || err);
        // }

        toast.success("Contest finished — taking you home.");
        setTimeout(() => navigate("/"), 700);
    }

    // ========== actions: run / submit ===========
    const handleRun = async () => {
        if (!currentProblemId) return toast.error("Problem not ready yet.");
        setLoading(true);
        setRunResult(null);
        saveDraft(id, currentProblemId, selectedLanguage, code);

        try {
            const payload = { code, language: selectedLanguage};
            const res = await axiosClient.post(`/submission/run/${currentProblemId}`, payload);
            setRunResult(res.data);
            // show console automatically when running
            // setActiveRightTab("console");
            // setConsoleCollapsed(false);
        } catch (err) {
            console.error(err);
            setRunResult({ success: false, error: "Server error" });
            // setActiveRightTab("console");
            // setConsoleCollapsed(false);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitCode = async () => {
        if (!currentProblemId) return toast.error("Problem not ready yet.");
        setLoading(true);
        setSubmitResult(null);
        saveDraft(id, currentProblemId, selectedLanguage, code);

        try {
            const payload = { code, language: selectedLanguage,problemId:currentProblemId };
            const res = await axiosClient.post(`/contest/${id}/submitcode`, payload);
            setSubmitResult(res.data);

            // if accepted, update solved set
            if (res.data?.status?.id === 3 && currentProblemId) {
                solvedSetRef.current.add(currentProblemId);
            }

            setActiveLeftTab("result");

            // if solved all -> auto close
            if (problems && solvedSetRef.current.size >= problems.length) {
                handleContestCloseAndRedirect();
            }
        } catch (err) {
            console.error("submit error", err);
            toast.error("Submit failed. Try again.");
        } finally {
            setLoading(false);
        }
    };

    // ========== small UI helpers ===========
    const getDifficultyColor = (difficulty) => {
        switch (difficulty) {
            case "easy":
                return "text-green-500";
            case "medium":
                return "text-yellow-500";
            case "hard":
                return "text-red-500";
            default:
                return "text-gray-500";
        }
    };

    const formatRemaining = (ms) => {
        if (ms === null) return "--:--:--";
        if (ms <= 0) return "00:00:00";
        const s = Math.floor(ms / 1000);
        const hrs = Math.floor(s / 3600);
        const mins = Math.floor((s % 3600) / 60);
        const secs = s % 60;
        return `${String(hrs).padStart(2, "0")}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
    };

    // protect against empty data while loading
    if (!contest || problems.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-screen" style={{ background: THEME.bg1 }}>
                <Toaster />
                <div className="text-center text-gray-300">
                    <div className="loading loading-spinner loading-lg text-yellow-500 mb-4" />
                    <div>Loading contest...</div>
                </div>
            </div>
        );
    }

    // ========== main render ===========
    return (
        <div className="min-h-[100vh] pt-5" style={{ background: `linear-gradient(180deg, ${THEME.bg1}, ${THEME.bg3})` }}>
            <Toaster />

            <div className="max-w-full h-full  mx-auto px-4 py-1">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="text-xl font-bold text-yellow-400">{contest.name}</h1>
                    </div>


                </div>

                <PanelGroup direction="horizontal">
                    {/* Left panel: problem list + description */}
                    <Panel defaultSize={35}>
                        <div className="h-[89vh] flex flex-col rounded-xl border" style={{ borderColor: THEME.bg2, background: `${THEME.bg2}66` }}>
                            {/* Tabs */}
                            <div className="tabs tabs-bordered bg-transparent p-3">
                                {["description", "submissions", "result"].map((tab) => (
                                    <button
                                        key={tab}
                                        className={`tab tab-sm ${activeLeftTab === tab ? "tab-active text-yellow-500" : "text-gray-400"}`}
                                        onClick={() => setActiveLeftTab(tab)}
                                    >
                                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                    </button>
                                ))}
                            </div>

                            <div className="flex-1 overflow-auto p-4">
                                <AnimatePresence mode="wait">
                                    {problems[problemCount] && (
                                        <motion.div key={`left-${activeLeftTab}`} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                                            {activeLeftTab === "description" && (
                                                <div>
                                                    <div className="flex items-start justify-between">
                                                        <div>
                                                            <h2 className="text-xl font-bold text-yellow-400">{problems[problemCount].title}</h2>
                                                            <div className={`badge mt-2 ${getDifficultyColor(problems[problemCount].difficulty)}`}>{problems[problemCount].difficulty}</div>
                                                        </div>

                                                        <div className="text-right text-xs text-gray-300">
                                                            <div>Problem {problemCount + 1} / {problems.length}</div>
                                                            <div className="mt-2">Solved: {solvedSetRef.current.size}</div>
                                                        </div>
                                                    </div>

                                                    <div className="mt-4 whitespace-pre-wrap text-sm text-gray-200 leading-relaxed">{problems[problemCount].discription}</div>

                                                    <div className="mt-6">
                                                        <h3 className="text-sm font-semibold text-yellow-400">Examples</h3>
                                                        <div className="space-y-3 mt-3">
                                                            {problems[problemCount].visibleTestCases.map((ex, i) => (
                                                                <div key={i} className="bg-[#0e213d]/60 p-3 rounded">
                                                                    <div className="text-xs font-mono text-gray-300"><strong className="text-yellow-400">Input:</strong> {ex.input}</div>
                                                                    <div className="text-xs font-mono text-gray-300 mt-1"><strong className="text-yellow-400">Output:</strong> {ex.output}</div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {activeLeftTab === "submissions" && (
                                                <div>
                                                    {/* This expects a component SubmissionHistory available in your project */}
                                                    <h3 className="text-yellow-400 font-semibold">My Submissions</h3>
                                                    <div className="mt-3 text-sm text-gray-300">Submission history for this problem will appear here.</div>
                                                </div>
                                            )}

                                            {activeLeftTab === "result" && (
                                                <div>
                                                    <h3 className="text-yellow-400 font-semibold">Last Submission</h3>

                                                    {submitResult ? (
                                                        <div className="mt-3">
                                                            {submitResult.status?.id === 3 ? (
                                                                <div className="p-3 rounded bg-[#071428]/70">
                                                                    <div className="text-green-400 font-bold">Accepted</div>
                                                                    <div className="text-xs text-gray-300 mt-2">{submitResult.testCasesPassed} / {submitResult.testCasesTotal} passed</div>
                                                                </div>
                                                            ) : (
                                                                <div className="p-3 rounded bg-[#071428]/70">
                                                                    <div className="text-red-400 font-bold">{submitResult.status?.description || 'Failed'}</div>
                                                                    <pre className="mt-2 text-xs text-gray-300 whitespace-pre-wrap">{submitResult.errorMessage}</pre>
                                                                </div>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <div className="text-gray-400 mt-3">No submissions yet. Click Submit from the editor panel.</div>
                                                    )}
                                                </div>
                                            )}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            <div className="p-3 border-t" style={{ borderColor: THEME.bg2 }}>
                                <div className="flex items-center justify-between gap-2">
                                    <button
                                        className="btn btn-ghost btn-sm"
                                        onClick={() => setProblemCount((pc) => Math.max(0, pc - 1))}
                                        disabled={problemCount === 0}
                                    >
                                        Prev
                                    </button>

                                    <div className="text-xs text-gray-300">Problem {problemCount + 1} / {problems.length}</div>

                                    <button
                                        className="btn btn-ghost btn-sm"
                                        onClick={() => setProblemCount((pc) => Math.min(problems.length - 1, pc + 1))}
                                        disabled={problemCount >= problems.length - 1}
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        </div>
                    </Panel>

                    <PanelResizeHandle className="w-1 bg-transparent hover:bg-yellow-600" />

                    {/* Right panel: editor + console */}
                    <Panel defaultSize={65}>
                        <div className="h-[89vh] flex flex-col rounded-xl border" style={{ borderColor: THEME.bg2, background: `${THEME.bg3}66` }}>
                            <PanelGroup direction="vertical">
                                <Panel defaultSize={80}>
                                    <div className="h-full flex flex-col">
                                        {/* editor tabs */}
                                        <div className="flex  items-center justify-between p-3 border-b" style={{ borderColor: THEME.bg2 }}>

                                            <div className="flex gap-2">
                                                {["python", "java", "cpp"].map((langKey) => (
                                                    <button key={langKey} className={`btn btn-sm ${selectedLanguage === langKey ? "bg-yellow-500 text-black" : "btn-ghost text-gray-300"}`} onClick={() => setSelectedLanguage(langKey)}>{langKey === 'cpp' ? 'C++' : langKey.charAt(0).toUpperCase() + langKey.slice(1)}</button>
                                                ))}
                                            </div>

                                            <div className="text-right text-sm flex flex-row gap-3 justify-center">
                                                <div className="font-mono text-xs text-gray-300 pt-1">Time Remaining</div>
                                                <div className="font-semibold text-yellow-400">{formatRemaining(remaining)}</div>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <div className="text-xs text-gray-300">Solved: {solvedSetRef.current.size} / {problems.length}</div>

                                                <div className="flex gap-2 items-center">
                                                    {/* <button className="btn btn-ghost btn-sm" onClick={() => { setActiveRightTab('console'); setConsoleCollapsed(false); }}>Console</button> */}

                                                    <button className="btn btn-sm bg-yellow-500 text-black" onClick={handleSubmitCode} disabled={loading}>{loading ? '...' : <><Send className="w-4 h-4 mr-1" /> Submit</>}</button>

                                                    <button className="btn btn-outline btn-sm" onClick={handleRun} disabled={loading}>{loading ? '...' : <><Play className="w-4 h-4 mr-1" /> Run</>}</button>

                                                    {/* <button className={`btn btn-sm ${consoleCollapsed ? 'btn-ghost text-gray-300' : 'bg-yellow-500 text-black'}`} onClick={() => setConsoleCollapsed((s) => !s)}>
                                                        {consoleCollapsed ? 'Show Console' : 'Hide Console'}
                                                    </button> */}
                                                </div>
                                            </div>
                                        </div>

                                        {/* editor */}
                                        <div className={`flex-1 transition-all duration-200 ${consoleCollapsed ? '' : ''}`} style={{ borderColor: THEME.bg2 }}>
                                            <Editor
                                                height="100%"
                                                language={selectedLanguage}
                                                theme="vs-dark"
                                                value={code}
                                                onChange={(v) => setCode(v || "")}
                                                onMount={(editor, monaco) => {
                                                    editorRef.current = editor;
                                                    monaco.editor.defineTheme("contest-dark", {
                                                        base: "vs-dark",
                                                        inherit: true,
                                                        rules: [],
                                                        colors: {
                                                            "editor.background": THEME.bg1,
                                                        },
                                                    });
                                                    monaco.editor.setTheme("contest-dark");
                                                }}
                                                options={{ fontSize: 14, minimap: { enabled: false }, automaticLayout: true }}
                                            />
                                        </div>
                                    </div>
                                </Panel>
                                <PanelResizeHandle className="w-full h-1 bg-transparent hover:bg-yellow-600"></PanelResizeHandle>

                                <Panel defaultSize={20}>
                                    {/* console & testcases - collapsible */}
                                    <div className="h-full overflow-hidden">
                                        <AnimatePresence>

                                            <motion.div
                                                key="console-area"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                transition={{ duration: 0.2 }}
                                                className="h-full"
                                            >
                                                <div className="h-full grid grid-cols-2 gap-2 p-1 overflow-auto">
                                                    <div className="p-1 rounded bg-[#0e213d]/60">
                                                        <div className="flex items-center justify-between">
                                                            <h4 className="text-yellow-400 font-semibold">Test Cases (visible)</h4>
                                                            <button className="btn btn-xs btn-ghost" onClick={() => navigator.clipboard.writeText(currentProblem?.visibleTestCases.map(tc => tc.input).join(''))}>Copy</button>
                                                        </div>
                                                        <div className="mt-2  text-xs">
                                                            {problems[problemCount].visibleTestCases.map((tc, i) => (
                                                                <div key={i} className="font-mono bg-[#071428]/40 p-2 rounded">{tc.input}</div>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    <div className="p-3 rounded bg-[#0e213d]/60 overflow-auto">
                                                        <div className="flex items-center justify-between">
                                                            <h4 className="text-yellow-400 font-semibold">Console / Run Results</h4>
                                                            <div className="text-xs text-gray-400">{runResult ? 'Last run' : 'No runs yet'}</div>
                                                        </div>

                                                        <div className="mt-2 text-xs font-mono text-gray-200">
                                                             {(runResult) ? (
                                                    (runResult[0]?.compileErr) ? (
                                                        <div>
                                                            <div className="flex justify-between items-center mb-2">
                                                                <strong className="text-sm text-red-500">Compilation Error</strong>
                                                                <button
                                                                    onClick={() => navigator.clipboard.writeText(runResult[0].compileErr)}
                                                                    className="text-xs px-2 py-1 rounded bg-slate-700 hover:bg-slate-600"
                                                                >
                                                                    Copy
                                                                </button>
                                                            </div>

                                                            <pre
                                                                className="bg-[#0e213d]/80 p-4 rounded-xl text-xs font-mono border border-[#071428] shadow-md
                 whitespace-pre-wrap break-words overflow-x-auto max-h-64"
                                                            >
                                                                {runResult[0].compileErr}
                                                            </pre>
                                                        </div>
                                                    ) : (
                                                        <div className="space-y-4">
                                                            {runResult?.map(({ status, output }, i) => (
                                                                <motion.div
                                                                    key={i}
                                                                    className="bg-[#0e213d]/80 p-4 rounded-xl text-xs font-mono border border-[#071428] shadow-md"
                                                                    initial={{ opacity: 0, y: 10 }}
                                                                    animate={{ opacity: 1, y: 0 }}
                                                                    transition={{ delay: i * 0.05 }}
                                                                >
                                                                    <div className={`${status?.id === 3 ? "text-green-500" : "text-red-500"} font-bold mb-2`}>
                                                                        {status?.id === 3 ? 'Passed' : 'Failed'}
                                                                    </div>
                                                                    <div><strong>Input:</strong> {problems[problemCount]?.visibleTestCases[i]?.input}</div>
                                                                    <div><strong>Output:</strong> {output}</div>
                                                                    <div><strong>Expected:</strong> {problems[problemCount]?.visibleTestCases[i]?.output}</div>
                                                                </motion.div>
                                                            ))}
                                                        </div>
                                                    )
                                                ) : (
                                                    <div className="text-gray-500 flex items-center gap-2">
                                                        <Play className="w-5 h-5" /> Click "Run" to test your code with the example test cases.
                                                    </div>
                                                )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>

                                        </AnimatePresence>
                                    </div>
                                </Panel>
                            </PanelGroup>
                        </div>
                    </Panel>
                </PanelGroup>

            </div>
        </div>
    );
}
