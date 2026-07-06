
import React from 'react';
import { NavLink } from 'react-router';

const Footer = () => {
    return (
        <footer className="bg-[#071428] text-white py-8 flex flex-col">
            <div className="container mx-auto  flex  md:flex-row justify-between items-center px-3 sm:px-50">
                <div className=" w-[30%] mb-4 md:mb-0">
                    <div  >
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
                            >
                                Loop
                            </text>
                        </svg>
                    </div>
                    <p className="text-gray-400 text-sm">
                        Sharpen your coding skills and forge your future with our comprehensive problem-solving platform.
                    </p>
                </div>

                <div className='mx-2'>
                    <h4 className="font-semibold mb-2 text-gray-300">QUICK LINKS</h4>
                    <ul className="space-y-1 text-gray-400">
                        <li><NavLink to={"/about"} className="hover:text-[#FE9A00]">About Us</NavLink></li>
                        <li><NavLink to={"/contact"} className="hover:text-[#FE9A00]">Contact</NavLink></li>
                        <li><NavLink to={"/privacy"} className="hover:text-[#FE9A00]">Privacy Policy</NavLink></li>
                    </ul>
                </div>
                <div>
                    <h4 className="font-semibold mb-2 text-gray-300">CONNECT WITH US</h4>
                    <ul className="space-y-1 text-gray-400">
                        <li><a href="https://github.com/Nakul-Kumar01" target='_blank' className="hover:text-[#FE9A00]">GitHub</a></li>
                        <li><a href="https://x.com/Nakul1001" target='_blank' className="hover:text-[#FE9A00]">Twitter</a></li>
                        <li><a href="https://www.linkedin.com/in/nakulkumar126/" target='_blank' className="hover:text-[#FE9A00]">LinkedIn</a></li>
                    </ul>
                </div>

            </div>
            <div className="text-center text-gray-500 text-sm mt-8">
                © 2026 NexLoop. All rights reserved.
            </div>
        </footer>
    );
};

export default Footer;