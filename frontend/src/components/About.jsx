import React from "react";
import { FaGithub, FaLinkedinIn } from "react-icons/fa";
import Footer from "./Footer";

export default function About() {
    return (
        <div>
            <section className="min-h-screen py-16 px-6 md:px-12 lg:px-24 bg-gradient-to-br from-[#061021] via-[#071428] to-[#08122a] text-slate-100">
            {/* Container */}
            <div className="max-w-100vw mx-auto flex flex-col justify-center items-center">
                {/* Header / Hero */}
                <div className=" w-full">
                    <div className="space-y-6 pt-15 w-full flex flex-col items-center justify-center text-center">
                        <h2 className="text-4xl md:text-5xl font-extrabold leading-tight">
                            <span className="inline-block bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-yellow-500">
                                NexLoop
                            </span>
                            — A smarter way to master coding
                        </h2>

                        <p className="text-slate-300 w-[40%] mt-10  flex flex-col items-center justify-center">
                            An advanced coding platform designed to help developers learn, practice,
                            and master problem-solving skills in a structured, fun, and secure
                            environment. Practice with confidence — no spoilers, just progress.
                        </p>
                    </div>
                </div>

                {/* Features grid */}
                <div id="features" className="mt-22 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {[
                        {
                            title: "Solve DSA Problems",
                            desc: "Practice problems categorized by topic & difficulty with stepwise progress tracking.",
                        },
                        {
                            title: "Custom Sprints",
                            desc: "Make focused collections from bookmarked problems and timebox your practice.",
                        },
                        {
                            title: "AI-Powered Tutor",
                            desc: "Get hints and guidance that teach, not reveal — adaptive help when you need it.",
                        },
                        {
                            title: "Compete & Rank",
                            desc: "Leaderboards, contests, and streaks to keep you motivated and accountable.",
                        },
                        {
                            title: "Secure & Modern",
                            desc: "JWT & OAuth, fast editors (Monaco), and responsive UI with light/dark themes.",
                        },
                        {
                            title: "Community Focused",
                            desc: "Share problems, discuss solutions, and learn together in moderated threads.",
                        },
                    ].map((f) => (
                        <article
                            key={f.title}
                            className="card bg-white/3 border border-white/6 p-5 rounded-2xl shadow-sm hover:shadow-lg transition-shadow"
                        >
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-yellow-500/20 text-yellow-400">
                                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
                                        <path d="M4 12h16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                        <path d="M10 6l6 6-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-lg">{f.title}</h4>
                                    <p className="text-slate-300 text-sm mt-1">{f.desc}</p>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>

                {/* Technology*/}
                <div className="w-[40%] card mt-20  p-6  bg-white/3 border border-white/6 rounded-2xl">
                    <h3 className=" font-semibold text-4xl text-center">Our Technology</h3>
                    <p className="text-slate-300 mt-2 max-w-xl text-center">We use a modern, robust stack to deliver a fast, secure, and reliable experience.</p>

                    <div className="mt-4 flex flex-col gap-3">
                        <div>
                            <h5 className="font-medium text-4xl text-center">Frontend</h5>
                            <div className="mt-5  flex-wrap gap-2 flex justify-center items-center">
                                {['React', 'Vite', 'TailwindCSS', 'Monaco Editor', 'Redux Toolkit'].map((t) => (
                                    <span key={t} className="badge badge-sm badge-outline">{t}</span>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h5 className="font-medium text-4xl text-center">Backend</h5>
                            <div className="mt-5 flex-wrap gap-2 flex justify-center items-center">
                                {['Node.js', 'Express', 'MongoDB', 'Redis', 'JWT'].map((t) => (
                                    <span key={t} className="badge badge-sm badge-outline">{t}</span>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h5 className="font-medium text-4xl text-center">Integrations</h5>
                            <div className="mt-5 flex flex-wrap gap-2  justify-center items-center">
                                {['Judge0 API', 'OAuth', 'Cloudinary', 'Google GenAI'].map((t) => (
                                    <span key={t} className="badge badge-sm badge-outline">{t}</span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Team card */}
                <div id="team" className="w-[60%] mt-20 card p-6 bg-white/3 border border-white/6 rounded-2xl">
                    <h3 className="text-2xl font-semibold">Meet the Team</h3>
                    <p className="text-slate-300 mt-2">The minds behind NexLoop.</p>

                    <div className="mt-6 flex items-start gap-4">
                        <div className="avatar ">
                            <div className="w-20 rounded-full ring ring-yellow-500/30">
                                {/* Replace src with real photo */}
                                <img src="/nakul.JPG" alt="Nakul Kumar avatar" />
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <div className="flex items-center ml-9 justify-between gap-4">
                                <div>
                                    <h4 className="text-lg font-semibold flex items-center">Nakul Kumar</h4>
                                    <p className="text-slate-300 text-sm">Full Stack Developer</p>
                                </div>
                            </div>

                            <p className="mt-3 text-slate-300">The mind and muscle behind HackForge, passionate about building tools that empower coders to learn faster and better.</p>

                            <div className="mt-4 flex gap-3">
                                <a className="btn btn-sm bg-yellow-500 text-black hover:bg-yellow-400" href="https://nakulkumar.vercel.app/" target="_blank">View Portfolio</a>
                            </div>
                        </div>
                    </div>
                </div>

                
            </div>
            
        </section>
        <Footer></Footer>
        </div>
    );
}

