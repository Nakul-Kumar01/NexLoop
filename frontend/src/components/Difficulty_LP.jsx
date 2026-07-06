import { motion } from "framer-motion";
import { NavLink } from "react-router";

const levels = [
  {
    title: "Easy Peasy",
    desc: "Perfect for beginners to get started and build foundational knowledge.",
    problems: "9+",
    color: "#22C55E", // green
    btnColor: "bg-[#22C55E] hover:bg-[#16A34A]",
  },
  {
    title: "Medium Gains",
    desc: "Challenge yourself with moderately difficult problems to strengthen your skills.",
    problems: "7+",
    color: "#FE9A00", // your theme orange
    btnColor: "bg-[#FE9A00] hover:bg-[#e08800]",
  },
  {
    title: "Hardcore Mode",
    desc: "Tackle complex problems designed to push your limits and deepen your expertise.",
    problems: "6+",
    color: "#EF4444", // red
    btnColor: "bg-[#EF4444] hover:bg-[#DC2626]",
  },
];

export default function DifficultySection() {
  return (
    <section className="py-20 bg-gradient-to-b from-[#061021] via-[#071428] to-[#08122a] text-white relative overflow-hidden">
      {/* Animated background glows */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] bg-[#FE9A00]/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-[#FE9A00]/5 rounded-full blur-3xl animate-ping"></div>
      </div>

      <div className="max-w-6xl mx-auto text-center px-6">
        <motion.h2
          className="text-4xl md:text-5xl font-bold mb-4"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          Start Your <span className="text-[#FE9A00]">Journey</span>
        </motion.h2>
        <motion.p
          className="text-gray-400 text-lg max-w-2xl mx-auto mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          Dive into problems based on difficulty or explore curated topic collections.
        </motion.p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {levels.map((lvl, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.05, y: -5 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="relative card bg-[#071428]/70 backdrop-blur-md border border-[#FE9A00]/10 rounded-2xl shadow-lg hover:shadow-[#FE9A00]/20 overflow-hidden"
            >
              {/* Top accent bar */}
              <div
                className="absolute top-0 left-0 w-full h-1.5"
                style={{ backgroundColor: lvl.color }}
              ></div>

              <div className="card-body text-left p-8">
                <h3 className="text-2xl font-semibold mb-2">{lvl.title}</h3>
                <p className="text-gray-400 mb-6 text-sm">{lvl.desc}</p>

                <p className="text-gray-500 text-xs tracking-wider mb-2">
                  PROBLEMS AVAILABLE
                </p>
                <p
                  className="text-sm font-bold mb-4"
                  style={{ color: lvl.color }}
                >
                  {lvl.problems}
                </p>
                <NavLink to={"/problem"} className={`btn ${lvl.btnColor} border-0 w-full text-white font-semibold transition-transform hover:scale-[1.02]`}>
                    View Problems
                </NavLink>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
