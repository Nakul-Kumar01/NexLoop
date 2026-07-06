import { Link, NavLink, useLocation } from "react-router";

export default function Header() {
  const location = useLocation();

  const links = [
    { name: "Problems", to: "/problem", key: "problem" },
    { name: "contests", to: "/contests", key: "contests" },
    { name: "Leaderboard", to: "/Leaderboard", key: "Leaderboard" },
    { name: "Interview", to: "/interview", key: "interview" },
  ];

  return (
    <div className="fixed top-0  w-full left-1/2 md:w-[80%] lg:w-[50%] -translate-x-1/2 z-50">
      <div className="flex items-center justify-evenly flex-wrap gap-6 px-8 py-1 rounded-bl-2xl rounded-br-2xl shadow-xl backdrop-blur-lg bg-[rgba(253,253,253,0)] border border-white/10">
        <NavLink to="/" >
          <svg
            width="140"
            height="35"
            viewBox="0 0 280 80"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="nexLoopGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#FE9A00" />
                <stop offset="100%" stopColor="#FFD166" />
              </linearGradient>
            </defs>

            {/* Icon */}
            <g transform="translate(10,10)">
              <circle
                cx="30"
                cy="30"
                r="26"
                stroke="url(#nexLoopGradient)"
                strokeWidth="4"
                fill="none"
              />

              {/* Inner Loop Arrow */}
              <path
                d="M30 14
         A16 16 0 1 1 18 46"
                stroke="url(#nexLoopGradient)"
                strokeWidth="4"
                fill="none"
                strokeLinecap="round"
              />

              <polygon
                points="18,46 22,38 26,44"
                fill="#FE9A00"
              />
            </g>

            {/* Text */}
            <text
              x="80"
              y="52"
              fontSize="32"
              fontWeight="700"
              fontFamily="Poppins, sans-serif"
              fill="url(#nexLoopGradient)"
              // className="invisible  md:inline"
            >
              Nex
            </text>

            <text
              x="145"
              y="52"
              fontSize="32"
              fontWeight="700"
              fontFamily="Poppins, sans-serif"
              fill="#FFFFFF"
              // className="invisible  md:inline"
            >
              Loop
            </text>
          </svg>

        </NavLink>
        {links.map((link) => {
          const isActive = location.pathname === link.to;

          return (
            <Link
              key={link.key}
              to={link.to}
              id="headerFont"
              className={`
              relative text-white   font-medium text-lg transition-all duration-300
              ${isActive ? "text-yellow-600" : "hover:text-yellow-600"}
            `}
            >
              {link.name}
              {/* underline animation */}
              <span
                className={`
                absolute left-0 -bottom-1 h-[2px] w-0 bg-yellow-600 rounded-full 
                transition-all duration-300 
                ${isActive ? "w-full" : "group-hover:w-full"}
              `}
              />
            </Link>
          )
        })}
      </div>
    </div>
  );
}
