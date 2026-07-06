import { useState, useRef, useEffect } from "react";
import { useParams } from 'react-router';
import axiosClient from "../utils/axiosClient";
import Editor from "@monaco-editor/react";
import SubmissionHistory from "./SubmissionHistory";
import Confetti from "react-confetti";
import { useWindowSize } from "react-use";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { ChartNoAxesCombined, Code, FileText, HelpCircle, Trophy, CheckCircle, XCircle, Play, Send, Tag, Building2, Lightbulb, Bookmark } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ChatAi from "./ChatAi";
import Editorial from "./Editorial";
import ProblemDetail from "./ProblemDetail";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";

const langMap = {
    cpp: 'C++',
    java: 'Java',
    python: 'Python'
};

export default function Solve() {
    const [problem, setProblem] = useState(null);
    const [selectedLanguage, setSelectedLanguage] = useState('cpp');
    const [loading, setLoading] = useState(false);
    const [code, setCode] = useState('');
    const [runResult, setRunResult] = useState(null);
    const [submitResult, setSubmitResult] = useState(null);
    const [activeLeftTab, setActiveLeftTab] = useState('description');
    const [activeRightTab, setActiveRightTab] = useState('code');
    const editorRef = useRef(null);
    let { problemId } = useParams();
    const problemDetailRef = useRef(null);
    // const [askAi, setAskAi] = useState(false);

    // animation states
    const { width, height } = useWindowSize();
    const [showConfetti, setShowConfetti] = useState(false);
    const [progress, setProgress] = useState(0); // progress for circular animation
    const [showCheck, setShowCheck] = useState(false);

    // when submission result becomes accepted, run animations
    useEffect(() => {
        if (submitResult?.status.id === 3) {
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

    useEffect(() => {
        const fetchProblem = async () => {
            setLoading(true);
            try {
                const response = await axiosClient.get(`/problem/problemById/${problemId}`);
                const CodeForUser = response.data.startCode.find(sc => sc.language === langMap[selectedLanguage]).UserCode;
                console.log(CodeForUser);
                setProblem(response.data);
                setCode(CodeForUser);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching problem:', error);
                setLoading(false);
            }
        };

        fetchProblem();
    }, [problemId]);

    // Update code when language changes
    useEffect(() => {
        if (problem) {
            const CodeForUser = problem.startCode.find(sc => sc.language === langMap[selectedLanguage])?.UserCode || '';
            setCode(CodeForUser);
        }
    }, [selectedLanguage, problem]);

    const getDifficultyColor = (difficulty) => {
        switch (difficulty) {
            case 'easy': return 'text-green-500';
            case 'medium': return 'text-yellow-500';
            case 'hard': return 'text-red-500';
            default: return 'text-gray-500';
        }
    };

    const handleLanguageChange = (language) => {
        setSelectedLanguage(language);
    };

    const getLanguageForMonaco = (lang) => {
        switch (lang) {
            case 'python': return 'python';
            case 'java': return 'java';
            case 'cpp': return 'cpp';
            default: return 'python';
        }
    };

    const handleEditorChange = (value) => {
        setCode(value || '');
    };

    const handleEditorDidMount = (editor, monaco) => {
        editorRef.current = editor;
        // Define custom theme
        monaco.editor.defineTheme('custom-dark', {
            base: 'vs-dark',
            inherit: true,
            rules: [],
            colors: {
                'editor.background': '#061021',
                'editor.foreground': '#e5e7eb',
                'editorLineNumber.foreground': '#6b7280',
                'editorCursor.foreground': '#eab308',
                'editor.selectionBackground': '#08122a',
                'editor.inactiveSelectionBackground': '#071428',
            }
        });
        monaco.editor.setTheme('custom-dark');
    };

    const handleRun = async () => {
        setLoading(true);
        setRunResult(null);

        try {
            const response = await axiosClient.post(`/submission/run/${problemId}`, {
                code,
                language: selectedLanguage
            });
            console.log(response);

            setRunResult(response.data);
            setLoading(false);
            setActiveRightTab("console")
        } catch (error) {
            console.error('Error running code:', error);
            setRunResult({
                success: false,
                error: 'Internal server error'
            });
            setLoading(false);
            setActiveRightTab("console")
        }
    };

    const handleSubmitCode = async () => {
        setLoading(true);
        setSubmitResult(null);

        try {
            const response = await axiosClient.post(`/submission/submit/${problemId}`, {
                code: code,
                language: selectedLanguage
            });
            console.log(response);
            setSubmitResult(response.data);
            setLoading(false);
            setActiveLeftTab('result');
        } catch (error) {
            console.error('Error submitting code:', error);
            setSubmitResult(null);
            setLoading(false);
            setActiveLeftTab('result');
        }
    };

    if (loading && !problem) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-[#061021] to-[#08122a]">
                <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    <span className="loading loading-spinner loading-lg text-yellow-500"></span>
                </motion.div>
            </div>
        );
    }


    const pills = [
        {
            label: 'Topics',
            count: problem?.tags?.length || 0,
            icon: Tag,
            color: 'from-blue-500 to-cyan-500',
            bgHover: 'hover:bg-blue-500/10',
            section: 'tags'
        },
        {
            label: 'Companies',
            count: problem?.companies?.length || 0,
            icon: Building2,
            color: 'from-purple-500 to-pink-500',
            bgHover: 'hover:bg-purple-500/10',
            section: 'companies'
        },
        {
            label: 'Hint',
            count: problem?.hint?.length || 0,
            icon: Lightbulb,
            color: 'from-orange-500 to-yellow-500',
            bgHover: 'hover:bg-orange-500/10',
            section: 'hints'
        }
    ]

    const scrollToSection = () => {
        problemDetailRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "start",
        });
    };

    return (
        <div className="pt-15 w-[100%] h-[100vh] bg-gradient-to-br from-[#061021] to-[#08122a] text-gray-200 min-h-screen flex  relative overflow-hidden">
            {/* Background subtle animation */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(234,179,8,0.05),transparent)] animate-pulse-slow"></div>
                <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1IiBoZWlnaHQ9IjUiPgo8cmVjdCB3aWR0aD0iNSIgaGVpZ2h0PSI1IiBmaWxsPSIjMDgxMjJhIj48L3JlY3Q+CjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IiMwNzE0MjgiPjwvcmVjdD4KPC9zdmc+')] opacity-5"></div>
            </div>
            <PanelGroup direction="horizontal" className="flex flex-col md:flex-row">
                <Panel defaultSize={25}>
                    {/* Left Panel */}
                    <motion.div
                        className="w-full h-[90vh] flex flex-col border-r border-[#071428] bg-[#071429]/40 backdrop-blur-xl shadow-2xl"
                        initial={{ x: -50, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ duration: 0.6 }}
                    >
                        {/* Left Tabs */}
                        <div className="tabs tabs-bordered bg-[#071429]/40 backdrop-blur-md px-4 sticky top-0 z-10 shadow-md ">
                            {["description", "editorial", "solutions", "submissions", "result"].map((tab) => (
                                <motion.button
                                    key={tab}
                                    className={`tab text-sm tracking-wide transition-all duration-300 ${activeLeftTab === tab
                                        ? "tab-active text-yellow-500 border-b-2 border-yellow-500 font-semibold"
                                        : "hover:text-yellow-400 text-gray-400"
                                        }`}
                                    onClick={() => setActiveLeftTab(tab)}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    {tab === 'description' && <FileText className="w-4 h-4 mr-1" />}
                                    {tab === 'editorial' && <HelpCircle className="w-4 h-4 mr-1" />}
                                    {tab === 'solutions' && <Code className="w-4 h-4 mr-1" />}
                                    {tab === 'submissions' && <Trophy className="w-4 h-4 mr-1" />}
                                    {tab === 'result' && <CheckCircle className="w-4 h-4 mr-1" />}
                                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                </motion.button>
                            ))}
                        </div>

                        {/* Left Content */}
                        <div className="flex-1 overflow-y-auto p-6">
                            <AnimatePresence mode="wait">
                                {problem && (
                                    <motion.div
                                        key={activeLeftTab}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        {activeLeftTab === "description" && (
                                            <div className="overflow-auto">
                                                <div className="flex justify-between items-center gap-4 mb-6">
                                                    <div className="flex flex-col items-start gap-3">
                                                        <h1 className="text-2xl font-bold text-yellow-500">{problem.title}</h1>
                                                        <div className="flex gap-5">
                                                            <motion.div
                                                                className={`badge border-2 px-3 py-1 rounded-full ${getDifficultyColor(problem.difficulty)}`}
                                                                whileHover={{ scale: 1.1, rotate: 5 }}
                                                            >
                                                                {problem.difficulty.charAt(0).toUpperCase() + problem.difficulty.slice(1)}

                                                            </motion.div>
                                                            <div className="font-extralight text-sm">
                                                                {problem.difficulty === "easy" && <div>+2🪙</div>}
                                                                {problem.difficulty === "medium" && <div>+4🪙</div>}
                                                                {problem.difficulty === "hard" && <div>+8🪙</div>}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {/* Info Pills */}
                                                    <div className="flex items-center gap-2 mt-3 mr-3">
                                                        {pills.map((pill, index) => {
                                                            const Icon = pill.icon
                                                            return (
                                                                <motion.button
                                                                    key={pill.label}
                                                                    onClick={scrollToSection}
                                                                    initial={{ opacity: 0, y: -10 }}
                                                                    animate={{ opacity: 1, y: 0 }}
                                                                    transition={{ delay: index * 0.1 }}
                                                                    whileTap={{ scale: 0.95 }}
                                                                    className={`flex items-center  gap-2 px-3 py-1.5 rounded-lg bg-[#071428] border border-gray-700/50 ${pill.bgHover} transition-all cursor-pointer group`}
                                                                    style={{
                                                                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)'
                                                                    }}
                                                                >
                                                                    <div className={`w-6 h-6 rounded-md bg-gradient-to-br ${pill.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                                                                        <Icon className="w-2.5 h-2.5 text-white" />
                                                                    </div>
                                                                    <span className="text-xs font-medium  text-gray-300 group-hover:text-white transition-colors">
                                                                        {pill.label}
                                                                    </span>
                                                                    {pill.count > 0 && (
                                                                        <span className="text-xs font-bold text-gray-400 bg-gray-700/50 px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                                                                            {pill.count}
                                                                        </span>
                                                                    )}
                                                                </motion.button>
                                                            )
                                                        })}
                                                    </div>
                                                </div>

                                                <div className="prose max-w-none text-gray-300">
                                                    <div className="whitespace-pre-wrap text-sm leading-relaxed">
                                                        {problem.discription}
                                                    </div>
                                                </div>

                                                <div className="mt-8">
                                                    <h3 className="text-lg font-semibold mb-4 text-yellow-400">Examples:</h3>
                                                    <div className="space-y-4">
                                                        {problem.visibleTestCases.map((example, index) => (
                                                            <motion.div
                                                                key={index}
                                                                className="bg-[#0e213d]/80 border border-[#071428] p-4 rounded-xl shadow-lg  transition-all duration-300"
                                                                initial={{ opacity: 0, y: 20 }}
                                                                animate={{ opacity: 1, y: 0 }}
                                                                transition={{ delay: index * 0.1 }}
                                                            >
                                                                <h4 className="font-semibold mb-2 text-yellow-400">
                                                                    Example {index + 1}:
                                                                </h4>
                                                                <div className="space-y-2 text-sm font-mono text-gray-300">
                                                                    <div>
                                                                        <strong className="text-yellow-500">Input:</strong> {example.input}
                                                                    </div>
                                                                    <div>
                                                                        <strong className="text-yellow-500">Output:</strong> {example.output}
                                                                    </div>
                                                                    <div>
                                                                        <strong className="text-yellow-500">Explanation:</strong>{" "}
                                                                        {example.explanation}
                                                                    </div>
                                                                </div>
                                                            </motion.div>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div ref={problemDetailRef} className="mt-10 scroll-mt-20">
                                                    <ProblemDetail problem={problem} />
                                                </div>
                                            </div>
                                        )}

                                        {activeLeftTab === "editorial" && (
                                            <div className="prose max-w-none">
                                                <h2 className="text-xl font-bold mb-4 text-yellow-400">Editorial</h2>
                                                <div className="whitespace-pre-wrap text-sm leading-relaxed text-gray-300">
                                                    <Editorial secureUrl={problem.secureUrl} thumbnailUrl={problem.thumbnailUrl} duration={problem.duration}></Editorial>
                                                </div>
                                            </div>
                                        )}

                                        {activeLeftTab === "solutions" && (
                                            <div className="overflow-auto">
                                                <h2 className="text-xl font-bold mb-4 text-yellow-400">Solutions</h2>
                                                <div className="space-y-6">
                                                    {problem.referenceSolution?.map((solution, index) => (
                                                        <motion.div
                                                            key={index}
                                                            className="border border-[#071428] rounded-xl bg-[#0e213d]/80 shadow-xl  transition-all duration-300 overflow-hidden"
                                                        >
                                                            <div className="bg-[#122642]/80 px-4 py-2 rounded-t-xl border-b border-[#071428]">
                                                                <h3 className="font-semibold text-yellow-500">
                                                                    {problem?.title} - {solution?.language}
                                                                </h3>
                                                            </div>
                                                            <div className="p-4">
                                                                <pre className="bg-[#061021] p-4 rounded-xl text-sm overflow-x-auto text-gray-200 border border-[#071428] shadow-inner">
                                                                    <code>{solution?.SolutionClass}</code>
                                                                </pre>
                                                            </div>
                                                        </motion.div>
                                                    )) || (
                                                            <p className="text-gray-500">Solutions will be available after you solve the problem.</p>
                                                        )}
                                                </div>
                                            </div>
                                        )}

                                        {activeLeftTab === "submissions" && (
                                            <div className="overflow-auto">
                                                <h2 className="text-xl font-bold mb-4 text-yellow-400">My Submissions</h2>
                                                <div className="text-gray-500">
                                                    <SubmissionHistory problemId={problemId}></SubmissionHistory>
                                                </div>
                                            </div>
                                        )}
                                        {activeLeftTab === 'result' && (
                                            <div className="flex-1 p-6 overflow-y-auto h-full relative">
                                                <h3 className="font-semibold mb-6 text-yellow-400">Submission Result</h3>

                                                {showConfetti && (
                                                    <div className="pointer-events-none absolute left-0 top-20 z-20">
                                                        <Confetti
                                                            width={Math.max(300, Math.floor(width / 2))}
                                                            height={height}
                                                            numberOfPieces={220}
                                                            recycle={false}
                                                            gravity={0.22}
                                                            colors={['#eab308', '#facc15', '#fde047']}
                                                        />
                                                    </div>
                                                )}

                                                {submitResult ? (
                                                    <motion.div
                                                        className="relative z-10 h-full"
                                                        initial={{ opacity: 0, scale: 0.95 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        transition={{ duration: 0.4 }}
                                                    >
                                                        {submitResult.status.id === 3 ? (
                                                            <div className="h-full flex flex-col rounded-2xl border-2 border-yellow-500/20 bg-gradient-to-br from-[#061021] to-[#08122a] p-6 shadow-2xl overflow-hidden relative">
                                                                <div className="absolute inset-0 pointer-events-none">
                                                                    {[...Array(10)].map((_, i) => (
                                                                        <motion.div
                                                                            key={i}
                                                                            className="absolute w-1 h-1 bg-yellow-300 rounded-full"
                                                                            initial={{ opacity: 0, scale: 0, x: Math.random() * 100 + '%', y: Math.random() * 100 + '%' }}
                                                                            animate={{
                                                                                opacity: [0, 1, 0],
                                                                                scale: [0, 1, 0],
                                                                                y: ['0%', '-50%']
                                                                            }}
                                                                            transition={{
                                                                                duration: Math.random() * 2 + 1,
                                                                                delay: Math.random() * 0.5,
                                                                                repeat: Infinity,
                                                                                repeatDelay: Math.random() * 2
                                                                            }}
                                                                        />
                                                                    ))}
                                                                </div>

                                                                <div className="grid grid-cols-12 gap-6 flex-1 items-center relative z-10">
                                                                    <div className="col-span-12 md:col-span-4 flex items-center justify-center">
                                                                        <div
                                                                            className="w-40 h-40 md:w-44 md:h-44 p-1 rounded-full bg-gradient-to-br from-[#071428] to-[#061021] shadow-inner ring-4 ring-yellow-500/20 overflow-hidden"
                                                                        >
                                                                            <CircularProgressbar
                                                                                className="text-yellow-500 font-extrabold"
                                                                                value={progress}
                                                                                text={showCheck ? "100%" : `${Math.round(progress)}%`}
                                                                                styles={buildStyles({
                                                                                    textSize: '22px',
                                                                                    textColor: showCheck ? "#facc15" : "#f59e0b",
                                                                                    pathColor: "#f59e0b",
                                                                                    trailColor: "#071428",
                                                                                    backgroundColor: "#061021",
                                                                                })}
                                                                            />
                                                                        </div>
                                                                    </div>

                                                                    <div className="col-span-12 md:col-span-8 flex flex-col justify-between">
                                                                        <div>
                                                                            <div className="flex items-start justify-between gap-4">
                                                                                <div>
                                                                                    <h4 className="font-extrabold text-2xl md:text-3xl text-yellow-300 leading-tight">
                                                                                        {showCheck ? (
                                                                                            <motion.span
                                                                                                className="flex items-center gap-2"
                                                                                                initial={{ scale: 0.5 }}
                                                                                                animate={{ scale: 1 }}
                                                                                                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                                                                                            >
                                                                                                <ChartNoAxesCombined className="text-yellow-300" /> Accepted
                                                                                            </motion.span>
                                                                                        ) : (
                                                                                            'Finalizing Results...'
                                                                                        )}
                                                                                    </h4>
                                                                                    <p className="mt-2 text-sm text-gray-300 max-w-xl">
                                                                                        Great job — your solution passed the checks.
                                                                                    </p>
                                                                                </div>

                                                                                <motion.div
                                                                                    className={`flex items-center justify-center p-3 rounded-lg transition-transform duration-300 ${showCheck ? 'bg-yellow-500 text-black scale-105' : 'bg-yellow-500/20 text-yellow-200'}`}
                                                                                    animate={showCheck ? { rotate: [0, 10, -10, 0] } : {}}
                                                                                    transition={{ duration: 0.5 }}
                                                                                >
                                                                                    <Trophy className="w-6 h-6" />
                                                                                </motion.div>
                                                                            </div>

                                                                            <div className="mt-6">
                                                                                <motion.div
                                                                                    className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-yellow-500 text-black font-mono font-extrabold text-2xl tracking-wide shadow-lg"
                                                                                    initial={{ scale: 0.9 }}
                                                                                    animate={{ scale: 1 }}
                                                                                    transition={{ type: "spring" }}
                                                                                >
                                                                                    <span className="text-xl">✔</span>
                                                                                    <span>{submitResult.testCasesPassed}</span>
                                                                                    <span className="text-base font-medium text-black/70">/</span>
                                                                                    <span className="text-xl">{submitResult.testCasesTotal}</span>
                                                                                    <span className="ml-3 text-sm font-medium text-black/60">{showCheck ? 'All Passed' : 'Running'}</span>
                                                                                </motion.div>
                                                                            </div>

                                                                            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                                                                                {[
                                                                                    { label: 'Runtime', value: `${submitResult.runtime.toFixed(3)} sec`, color: 'yellow-400' },
                                                                                    { label: 'Memory', value: `${submitResult.memory.toFixed(1)} KB`, color: 'yellow-400' },
                                                                                    { label: 'Status', value: 'Accepted', icon: <CheckCircle className="w-4 h-4" />, color: 'green-400' }
                                                                                ].map((stat, i) => (
                                                                                    <motion.div
                                                                                        key={i}
                                                                                        className="p-3 rounded-lg bg-[#071428] border border-yellow-500/10 flex flex-col overflow-hidden relative"
                                                                                        initial={{ y: 20, opacity: 0 }}
                                                                                        animate={{ y: 0, opacity: 1 }}
                                                                                        transition={{ delay: i * 0.1 }}
                                                                                    >
                                                                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-yellow-500/5 animate-shimmer"></div>
                                                                                        <span className="text-xs text-gray-400">{stat.label}</span>
                                                                                        <span className={`font-semibold text-${stat.color} text-lg flex items-center gap-2`}>
                                                                                            {stat.icon}
                                                                                            {stat.value}
                                                                                        </span>
                                                                                    </motion.div>
                                                                                ))}
                                                                            </div>
                                                                        </div>

                                                                        <div className="mt-6">
                                                                            <motion.div
                                                                                className={`inline-flex items-center gap-3 px-4 py-2 rounded-full ${showCheck ? 'bg-yellow-500 text-black' : 'bg-yellow-500/10 text-yellow-300'} font-semibold transition-transform duration-300`}
                                                                                animate={showCheck ? { scale: [1, 1.05, 1] } : {}}
                                                                                transition={{ repeat: Infinity, duration: 1.5 }}
                                                                            >
                                                                                {showCheck ? 'All Tests Passed — Well done!' : 'Finalizing results...'}
                                                                            </motion.div>
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                <div className="pointer-events-none">
                                                                    <div className="absolute -left-8 -top-8 w-28 h-28 rounded-full opacity-10 animate-pulse" style={{ background: 'radial-gradient(circle, rgba(250,204,21,0.12), transparent)' }} />
                                                                    <div className="absolute right-6 bottom-6 w-16 h-16 rounded-full opacity-8 animate-pulse" style={{ background: 'radial-gradient(circle, rgba(250,204,21,0.08), transparent)' }} />
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <motion.div
                                                                className="rounded-xl p-6 bg-[#061021] border border-red-600/30 shadow-md"
                                                                initial={{ opacity: 0, scale: 0.95 }}
                                                                animate={{ opacity: 1, scale: 1 }}
                                                                transition={{ duration: 0.4 }}
                                                            >
                                                                <h4 className="font-bold text-lg text-red-400 flex items-center gap-2">
                                                                    <XCircle /> {submitResult.status.description || 'Failed'}
                                                                </h4>
                                                                <p className="mt-3 text-sm text-gray-300">
                                                                    Test Cases Passed: <span className="text-yellow-400 font-medium">{submitResult.testCasesPassed}</span> / {submitResult.testCasesTotal}
                                                                </p>
                                                                <div className="mt-4">
                                                                    <pre className="text-xs">{submitResult.errorMessage}</pre>
                                                                </div>
                                                            </motion.div>
                                                        )}
                                                    </motion.div>
                                                ) : (
                                                    <div className="text-gray-500">Click "Submit" to submit your solution for evaluation.</div>
                                                )}
                                            </div>
                                        )}
                                        {activeLeftTab === 'askAi' && (
                                            <div className="prose max-w-none">
                                                <h2 className="text-xl font-bold mb-4">NEX AI</h2>
                                                <div className="whitespace-pre-wrap text-sm leading-relaxed">
                                                    <ChatAi problem={problem}></ChatAi>
                                                </div>
                                            </div>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                </Panel>
                <PanelResizeHandle className="w-1 hover:bg-yellow-600" />
                <Panel defaultSize={25}>
                    {/* Right Panel */}
                    <motion.div
                        className="w-full h-[90vh] flex flex-col bg-[#0b1a33]/60 backdrop-blur-xl shadow-2xl overflow-auto"
                        initial={{ x: 50, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ duration: 0.6 }}
                    >
                        {/* Right Tabs */}
                        <div className="tabs tabs-bordered bg-[#0e213d]/80 backdrop-blur-md px-4 sticky top-0 z-10 shadow-md">
                            {["code", "console"].map((tab) => (
                                <motion.button
                                    key={tab}
                                    className={`tab text-sm tracking-wide transition-all duration-300 ${activeRightTab === tab
                                        ? "tab-active text-yellow-500 border-b-2 border-yellow-500 font-semibold"
                                        : "hover:text-yellow-400 text-gray-400"
                                        }`}
                                    onClick={() => setActiveRightTab(tab)}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    {tab === 'code' && <Code className="w-4 h-4 mr-1" />}
                                    {tab === 'console' && <Play className="w-4 h-4 mr-1" />}
                                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                </motion.button>
                            ))}
                        </div>

                        {/* Right Content */}
                        <div className="flex-1 flex flex-col h-[85vh]">
                            <AnimatePresence mode="wait">
                                {activeRightTab === "code" && (
                                    <motion.div
                                        key="code"
                                        className="flex-1 h-[85vh] flex flex-col"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        {/* Language Selector */}
                                        <div className="flex justify-between items-center p-4 border-b border-[#071428] bg-[#0e213d]/80">
                                            <div className="flex gap-2">
                                                {["python", "java", "cpp"].map((lang) => (
                                                    <motion.button
                                                        key={lang}
                                                        className={`btn btn-sm rounded-full ${selectedLanguage === lang
                                                            ? "bg-yellow-500 text-black hover:bg-yellow-400"
                                                            : "btn-ghost text-gray-400 hover:text-yellow-400"
                                                            }`}
                                                        onClick={() => handleLanguageChange(lang)}
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.9 }}
                                                    >
                                                        {lang === "cpp" ? "C++" : lang === "python" ? "Python" : "Java"}
                                                    </motion.button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Monaco Editor */}
                                        <div className="flex-1  border border-[#071428] rounded-md overflow-hidden shadow-inner">
                                            <Editor
                                                height="100%"
                                                language={getLanguageForMonaco(selectedLanguage)}
                                                value={code}
                                                onChange={handleEditorChange}
                                                onMount={handleEditorDidMount}
                                                theme="custom-dark"
                                                options={{
                                                    fontSize: 14,
                                                    minimap: { enabled: false },
                                                    scrollBeyondLastLine: false,
                                                    automaticLayout: true,
                                                    tabSize: 2,
                                                    insertSpaces: true,
                                                    wordWrap: "on",
                                                    lineNumbers: "on",
                                                    glyphMargin: false,
                                                    folding: true,
                                                    lineDecorationsWidth: 10,
                                                    lineNumbersMinChars: 3,
                                                    renderLineHighlight: "line",
                                                    selectOnLineNumbers: true,
                                                    roundedSelection: false,
                                                    readOnly: false,
                                                    cursorStyle: "line",
                                                    mouseWheelZoom: true,
                                                    cursorBlinking: "smooth",
                                                    smoothScrolling: true,
                                                }}
                                            />
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="p-4 border-t border-[#071428] flex justify-between bg-[#0e213d]/80">
                                            <div className="flex gap-2">
                                                <motion.button
                                                    className="btn btn-ghost btn-sm text-gray-400 hover:text-yellow-400 flex items-center gap-1"
                                                    onClick={() => setActiveRightTab("console")}
                                                    whileHover={{ scale: 1.05 }}
                                                >
                                                    <Play className="w-4 h-4" /> Console
                                                </motion.button>
                                            </div>
                                            <div className="flex gap-2">
                                                {loading ? (<div className="loading loading-spinner loading-md text-yellow-400"></div>) : (
                                                    <>
                                                        <motion.button
                                                            className={`btn btn-sm rounded-full bg-yellow-500 text-black hover:bg-yellow-400 transition flex items-center gap-1 `}
                                                            onClick={() => setActiveLeftTab('askAi')}
                                                            // disabled={loading}
                                                            whileHover={{ scale: 1.05 }}
                                                            whileTap={{ scale: 0.95 }}
                                                        >
                                                            Ask Ai
                                                        </motion.button>
                                                        <motion.button
                                                            className={`btn btn-outline btn-sm rounded-full border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-black transition flex items-center gap-1`}
                                                            onClick={handleRun}
                                                            // disabled={loading}
                                                            whileHover={{ scale: 1.05 }}
                                                            whileTap={{ scale: 0.95 }}
                                                        >
                                                            <Play className="w-4 h-4" /> Run
                                                        </motion.button>
                                                        <motion.button
                                                            className={`btn btn-sm rounded-full bg-yellow-500 text-black hover:bg-yellow-400 transition flex items-center gap-1`}
                                                            onClick={handleSubmitCode}
                                                            // disabled={loading}
                                                            whileHover={{ scale: 1.05 }}
                                                            whileTap={{ scale: 0.95 }}
                                                        >
                                                            <Send className="w-4 h-4" /> Submit
                                                        </motion.button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {activeRightTab === "console" && (
                                    <motion.div
                                        key="console"
                                        className="flex-1 flex flex-col"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <div className="flex-1 grid grid-rows-2 overflow-hidden">
                                            <div className="flex-1 p-4 overflow-y-auto border-b border-[#071428]">
                                                <h3 className="font-semibold mb-4 text-yellow-400 flex items-center gap-2">
                                                    <FileText className="w-5 h-5" /> Test Cases
                                                </h3>
                                                <div className="space-y-4">
                                                    {problem.visibleTestCases.map(({ input, output }, i) => (
                                                        <motion.div
                                                            key={i}
                                                            className="bg-[#0e213d]/80 p-4 rounded-xl text-xs font-mono border border-[#071428] shadow-md"
                                                            initial={{ opacity: 0, y: 10 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            transition={{ delay: i * 0.05 }}
                                                        >
                                                            <div>
                                                                <strong className="text-yellow-500">Input:</strong> {input}
                                                            </div>
                                                            <div>
                                                                <strong className="text-yellow-500">Output:</strong> {output}
                                                            </div>
                                                        </motion.div>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="flex-1 p-4 overflow-y-auto">
                                                <h3 className="font-semibold mb-4 text-yellow-400 flex items-center gap-2">
                                                    <CheckCircle className="w-5 h-5" /> Test Results
                                                </h3>
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
                                                                    <div><strong>Input:</strong> {problem.visibleTestCases[i].input}</div>
                                                                    <div><strong>Output:</strong> {output}</div>
                                                                    <div><strong>Expected:</strong> {problem.visibleTestCases[i].output}</div>
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
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                </Panel>
            </PanelGroup>

        </div>
    )
}