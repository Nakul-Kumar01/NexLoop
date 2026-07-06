# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.









### Using tailwindcss with Vite+React:
ES Modules vs. CommonJS:
JavaScript has two main module systems: ES modules (using import and export) and CommonJS (using require and module.exports).
Vite and ES Modules:
Vite is designed to work well with ES modules, and it often defaults to treating JavaScript files as ES modules, especially if your package.json has "type": "module".
postcss.config.js:
This file is used to configure PostCSS, a tool for transforming CSS. It typically uses CommonJS syntax.
The Error:
If Vite tries to load postcss.config.js as an ES module, it will throw an error because module.exports is not valid ES module syntax. 
Solutions
-Rename to postcss.config.cjs:
The simplest solution is to rename the file to postcss.config.cjs. This explicitly tells Vite to treat it as a CommonJS file, even if your project is generally set up for ES modules.


1) do all steps mentioned in tailwindCss website
2) npm install -D tailwindcss postcss autoprefixer @tailwindcss/postcss
3) create postcss.config.cjs and paste this :
module.exports = {
  plugins: {
    '@tailwindcss/postcss': {},
    autoprefixer: {},
  }
}






### to use Awsome Font in React(tailwind) project
1) npm install @fortawesome/react-fontawesome @fortawesome/free-brands-svg-icons
2) import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
3) import { faLinkedinIn } from '@fortawesome/free-brands-svg-icons';
4) now use int jsx, <FontAwesomeIcon icon={faLinkedinIn} />



### to use Animation on scroll(AOS) in react + tailwind ###
1) npm install aos
2) *** in main.jsx ***  // ek barr hi krna hai pure project me
   import React, { useEffect } from 'react';
   import AOS from 'aos';
   import 'aos/dist/aos.css';
3) useEffect(() => {     // also in main.jsx // in its function // ek barr pure project me
    AOS.init({
      duration: 1000, // Animation duration in milliseconds
      once: true, // Whether animation should happen only once
    });
  }, []); 
4) data-aos="fade-up"  // use this to animate the required element on scroll
Add data-aos attributes to elements you want to animate. Common animations include:
fade-up, fade-down, fade-left, fade-right
zoom-in, zoom-out
slide-up, slide-down You can also customize with attributes like:
data-aos-delay="200" (delay in ms)
data-aos-duration="1200" (duration in ms)
data-aos-easing="ease-in-out" (easing function)




### DaisyUi + tailwind + wind 
- follow doc of daisyUi
- lucid react for icons


### react-hook-form


### zod liberary
- used for schema validation 
- what is difference b/w validator and zod
- to use it we have to use hookform/resolvers

## task to be done:
- sinup page more feature
- how can i add speacial character in password