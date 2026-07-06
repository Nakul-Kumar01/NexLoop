import { motion } from "framer-motion";
import { Code, BarChart3, Tag, Lock } from "lucide-react";

const features = [
  {
    icon: <Code className="w-8 h-8 text-[#FE9A00]" />,
    title: "Vast Problem Library",
    desc: "Access a wide array of coding challenges, from beginner-friendly to highly complex.",
  },
  {
    icon: <BarChart3 className="w-8 h-8 text-[#FE9A00]" />,
    title: "Difficulty Levels",
    desc: "Filter problems by difficulty (Easy, Medium, Hard) to match your current skill level.",
  },
  {
    icon: <Tag className="w-8 h-8 text-[#FE9A00]" />,
    title: "Topic-wise Challenges",
    desc: "Focus on specific areas like Data Structures, Algorithms, and Dynamic Programming.",
  },
  {
    icon: <Lock className="w-8 h-8 text-[#FE9A00]" />,
    title: "Real-time Contests",
    desc: "Participate in exciting coding contests, test your speed, and accuracy against others.",
  },
];

export default function FeaturesSection() {
  return (
    <section className="py-20 bg-gradient-to-b from-[#061021] via-[#071428] to-[#08122a] text-white relative overflow-hidden">
      {/* Glow background animation */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/2 left-1/3 w-[600px] h-[600px] bg-[#FE9A00]/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-[#FE9A00]/5 rounded-full blur-3xl animate-ping"></div>
      </div>

      <div className="max-w-6xl mx-auto text-center px-6">
        <motion.h2
          className="text-4xl md:text-5xl font-bold mb-4"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          Everything You Need to <span className="text-[#FE9A00]">Excel</span>
        </motion.h2>
        <motion.p
          className="text-gray-400 text-lg max-w-2xl mx-auto mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          NexLoop provides a comprehensive suite of tools and resources to help you on your coding journey.
        </motion.p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((f, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.05, y: -5 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="card bg-[#071428]/60 backdrop-blur-md border border-[#FE9A00]/20 shadow-xl hover:shadow-[#FE9A00]/20 transition-all duration-300"
            >
              <div className="card-body items-center text-center p-8">
                <div className="p-3 bg-[#08122a] rounded-2xl shadow-inner shadow-[#FE9A00]/30 mb-4">
                  {f.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2 text-[#FE9A00]/90">{f.title}</h3>
                <p className="text-gray-400 text-sm">{f.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
