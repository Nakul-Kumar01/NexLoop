import React, { useRef } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

const FeaturedCourses = () => {
  const scrollRef = useRef(null);

  const courses = [
    {
      title: "Introduction to Gen AI",
      description: "Understand GenAI deeply: from fundamentals to internal mechanisms.",
      level: "All Levels",
      duration: "Ongoing",
      image: "https://i.ytimg.com/vi/WOyZid8OkkI/sddefault.jpg",
      link: "https://youtube.com/playlist?list=PLd7PleJR_EFfRYiLdagOsv4FczMl1Cxt_&si=U0ls2EyaVyq-jxbC",
    },
    {
      title: "Introduction to System Design",
      description: "System Design (LLD) for systems from scratch here",
      level: "All Levels",
      duration: "40+ Hours",
      image: "https://i.ytimg.com/vi/AK0hu0Zxua4/sddefault.jpg",
      link: "https://youtube.com/playlist?list=PLQEaRBV9gAFvzp6XhcNFpk1WdOcyVo9qT&si=0KgyS1yRHqSP3UNf",
    },
    {
      title: "Data Structures & Algorithms",
      description: "Data Structures & Algorithms using C++",
      level: "All Levels",
      duration: "200+ Hours",
      image: "https://i.ytimg.com/vi/moZNKL37w-s/sddefault.jpg",
      link: "https://youtube.com/playlist?list=PLQEaRBV9gAFu4ovJ41PywklqI7IyXwr01&si=0jONe0Nk14K1P2YW",
    },
    {
      title: "Full Stack Web Development",
      description: "Become a Full Stack Web Developer with MERN Stack",
      level: "Intermediate",
      duration: "50+ Hours",
      image: "https://i.ytimg.com/vi/1pcikNlDB-4/hq720.jpg?sqp=-oaymwEnCNAFEJQDSFryq4qpAxkIARUAAIhCGAHYAQHiAQoIGBACGAY4AUAB&rs=AOn4CLCtoWVmGSnfu8S6W131StC7Iy-kDA",
      link: "https://youtube.com/playlist?list=PLQEaRBV9gAFsistSzOgnD4cWgFGRVda4X&si=CqnOtloE2CLxuCPi",
    },
  ];

  const scroll = (direction) => {
    const { current } = scrollRef;
    if (!current) return;
    const scrollAmount = current.offsetWidth - 200;
    current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  return (
    <section className="py-20 bg-gradient-to-b from-[#061021] via-[#071428] to-[#08122a] text-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <motion.h2
          className="text-4xl md:text-5xl font-bold mb-4 text-[#FE9A00]"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          Level Up with Our Featured Courses
        </motion.h2>
        <motion.p
          className="text-gray-400 text-lg mb-12 max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          Guided learning paths designed by industry experts to master key concepts and technologies.
        </motion.p>

        {/* Scroll Buttons */}
        <div className="relative ">
          <button
            onClick={() => scroll("left")}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-[#FE9A00] backdrop-blur-sm  text-white hover:text-[#061021] rounded-full p-3 shadow-lg transition-all"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <div
            ref={scrollRef}
            className="flex overflow-x-auto gap-6 pb-4 scrollbar-hide scroll-smooth snap-x snap-mandatory px-12"
          >
            {courses.map((course, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.05, y: -5 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="w-[300px] md:min-w-[340px] flex-shrink-0 card bg-[#071428] shadow-lg hover:shadow-[#FE9A00]/20 transition-all duration-300 hover:bg-[#08122a] rounded-xl overflow-hidden snap-start"
              >
                <figure className="relative">
                  <img
                    src={course.image}
                    alt={course.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-2 left-2 bg-[#FE9A00] text-[#061021] text-xs font-bold px-2 py-1 rounded">
                    {course.level}
                  </div>
                  {course.duration && (
                    <div className="absolute top-2 right-2 bg-[#FE9A00] text-[#061021] text-xs font-bold px-2 py-1 rounded">
                      {course.duration}
                    </div>
                  )}
                </figure>
                <div className="card-body p-6 text-left">
                  <h3 className="card-title text-xl font-semibold mb-2">
                    {course.title}
                  </h3>
                  <p className="text-gray-400 mb-4 text-sm">
                    {course.description}
                  </p>
                  <a
                    href={course.link}
                    target="_blank"
                    className="btn bg-[#FE9A00] border-0 text-[#061021] hover:bg-opacity-90 w-full font-semibold"
                  >
                    View Course
                  </a>
                </div>
              </motion.div>
            ))}
          </div>

          <button
            onClick={() => scroll("right")}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-[#FE9A00] backdrop-blur-sm  text-white hover:text-[#061021] rounded-full p-3 shadow-lg transition-all"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedCourses;
