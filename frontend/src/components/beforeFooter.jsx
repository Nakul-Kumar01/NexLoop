
import React from 'react';
import { NavLink } from 'react-router';

const BeforeFooter = () => {
  return (
    <section className="bg-[#061021] text-white py-20 text-center">
      <h1 className="text-4xl font-bold mb-4 text-[#FE9A00]">Ready to Test Your Mettle?</h1>
      <p className="text-lg mb-8 text-gray-400 max-w-2xl mx-auto">
        Sign up today and join a thriving community of coders. Sharpen your skills, compete in challenges, and forge your path to success.
      </p>
      <NavLink to={"/problem"}  className="btn bg-[#FE9A00] text-[#061021] hover:bg-opacity-90 px-6 py-3 rounded-lg">
          Get Started for Free
      </NavLink>
    </section>
  );
};

export default BeforeFooter;