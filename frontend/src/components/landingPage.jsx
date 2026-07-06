import { Star, Rocket, Trophy, Repeat } from "lucide-react";
import { motion } from "framer-motion";
import { useSelector } from "react-redux";
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import FeaturesSection from "./Features_LP";
import DifficultySection from "./Difficulty_LP";
import FeaturedCourses from "./FeaturedCourses_LP";
import BeforeFooter from "./beforeFooter";
import Footer from "./Footer";
import { NavLink } from "react-router";

export default function LandingPage() {


  const user = useSelector((state) => state.auth.user);
  const mydata = useSelector((state) => state.profile || {});
// console.log(mydata)

  return (
    <>
      <div className="min-h-screen w-full pt-20 sm:pt-0 relative bg-gradient-to-b from-[#061021] via-[#071428] to-[#08122a] text-white overflow-hidden">
        {/* background blobs (neon) */}
        <div className="pointer-events-none absolute -top-40 -left-40 w-[720px] h-[720px] rounded-full bg-gradient-to-tr from-[#6ee7b7] via-[#7c3aed] to-[#ec4899] opacity-18 blur-[160px] transform-gpu" />
        <div className="pointer-events-none absolute -bottom-36 -right-36 w-[620px] h-[620px] rounded-full bg-gradient-to-br from-[#06b6d4] via-[#8b5cf6] to-[#f43f5e] opacity-14 blur-[140px] transform-gpu" />

        {/* subtle starfield overlay for texture */}
        <div className="absolute inset-0 bg-[radial-gradient(transparent,rgba(255,255,255,0.02))] mix-blend-overlay pointer-events-none" />

        {/* Hero */}
        <main className="relative z-10 max-w-6xl mx-auto px-6 py-12 lg:py-18">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">

            {/* Left - Copy */}
            <div className="space-y-6">
              <h1
                className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight"
              >
                Forge Your Skills.{' '}
                <span className="bg-clip-text text-yellow-500">real-time</span>{' '}
                battles &amp; contests
              </h1>

              <p
                className="text-lg text-slate-300 max-w-xl"
              >
                Join NexLoop to practice coding, compete with peers, and elevate your problem-solving abilities to new heights.
              </p>

              <div className="flex flex-wrap gap-4 items-center">
                <NavLink
                  to="/problem"
                  className="relative hover:scale-101 hover:cursor-pointer inline-flex items-center rounded-full px-8 py-3 bg-amber-500 font-semibold text-white shadow-2xl "
                  aria-label="Explore problems"
                >
                  <Rocket className="w-5 h-5 mr-3 text-amber-950" />
                  Explore Problems
                </NavLink>

                  <NavLink
                  to="/contests"
                  className="inline-flex items-center hover:scale-101 cursor-pointer gap-3 rounded-full px-6 py-3 border border-white/10 bg-white/5 shadow-sm font-semibold text-white/90 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30"
                  aria-label="Explore problems"
                >
                  <Trophy className="w-4 h-4 text-amber-400" />
                  Join Contest
                </NavLink>

                <span className="inline-flex items-center text-sm text-slate-400 ml-2">No credit card required</span>
              </div>

              {/* quick stats */}
              <div className="mt-6 flex gap-6 flex-wrap">
                <Stat label="Active Problems" value="1.2k+" accent="from-cyan-400 to-violet-400" />
                <Stat label="Live Contests" value="18" accent="from-rose-400 to-pink-400" />
                <Stat label="Top Coders" value="3.4k" accent="from-amber-400 to-yellow-300" />
              </div>
            </div>

            {/* Right - Card / Profile */}
            <div className="flex items-center justify-center">
              <motion.div
                initial={{ scale: 0.98, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6 }}
                className="w-full max-w-md bg-gradient-to-br from-white/5 to-white/3 backdrop-blur-md border border-white/6 rounded-2xl shadow-xl p-6"
                style={{ boxShadow: '0 12px 40px rgba(12,15,25,0.6)' }}
              >
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-lg scale-x-[-1]   flex items-center justify-center text-white text-xl font-bold"><DotLottieReact
                    src="https://lottie.host/d0e7537f-b882-4cce-86cb-5207f7da1307/IT2i5ajhNC.lottie"
                    loop
                    autoplay
                  /></div>
                  <div>
                    <div  className="font-semibold">{user?.firstName}</div>
                    <div className="text-sm text-slate-300">User • Competitive Coder</div>
                  </div>
                  <div className="ml-auto text-slate-400 text-sm">Rank {mydata?.user?.rank}</div>
                </div>

                <div className="mt-4 text-sm text-slate-300">
                  <p>
                    Ready for the next challenge? solve problems
                  </p>
                </div>

                <div className="mt-6  flex gap-6">
                  <NavLink to="/problem" className=" flex-1 rounded-full text-sm px-8 py-3 bg-amber-500 font-semibold text-white shadow-2xl hover:scale-101 hover:cursor-pointer text-center">Start Challenge</NavLink>
                  <NavLink to={`/${user?.firstName}` } className="rounded-full flex items-center px-4 py-2 text-sm border border-white/10 bg-transparent text-slate-200 hover:scale-101 hover:cursor-pointer ">View Profile</NavLink>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Decorative icons floating */}
          <motion.div
            animate={{ y: [0, -12, 0] }}
            transition={{ duration: 5, repeat: Infinity }}
            className="absolute right-16 bottom-28 opacity-70"
          >
            <Star className="w-10 h-10 text-indigo-300/90" />
          </motion.div>
        </main>

        {/* Right vertical brand */}


      </div>
      <FeaturesSection></FeaturesSection>
      <DifficultySection></DifficultySection>
      <FeaturedCourses></FeaturedCourses>
      <BeforeFooter></BeforeFooter>
      <Footer></Footer>
    </>
  );
}

function Stat({ label, value, accent = 'from-cyan-400 to-violet-400' }) {
  return (
    <div className="flex flex-col">
      <span className="text-xl font-bold inline-flex items-center gap-2">
        <span className={`inline-block h-2 w-2 rounded-full bg-gradient-to-r ${accent}`} />
        {value}
      </span>
      <span className="text-sm text-slate-400">{label}</span>
    </div>
  );
}
