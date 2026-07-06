import React from 'react';
import { Plus, Edit, Trash2, Home, RefreshCw, Zap,Video } from 'lucide-react';
import { NavLink } from 'react-router'; // if you use react-router-dom, change to 'react-router-dom'

export default function AdminPanel() {
  const adminOptions = [
    {
      id: 'create',
      title: 'Create Problem',
      description: 'Add a new coding problem to the platform',
      icon: Plus,
      route: '/admin/create'
    },
    {
      id: 'update',
      title: 'Update Problem',
      description: 'Edit existing problems and their details',
      icon: Edit,
      route: '/admin/update'
    },
    {
      id: 'delete',
      title: 'Delete Problem',
      description: 'Remove problems from the platform',
      icon: Trash2,
      route: '/admin/delete'
    },
    {
      id: 'video',
      title: 'Video Problem',
      description: 'Upload And Delete Videos',
      icon: Video,
      color: 'btn-success',
      bgColor: 'bg-success/10',
      route: '/admin/video'
    },
    {
      id: 'contestCreate',
      title: 'Create Contest',
      description: 'Create a contest',
      icon: Plus,
      color: 'btn-success',
      bgColor: 'bg-success/10',
      route: '/admin/createContest'
    }
  ];

  return (
    // page wrapper: deep gradient using your three dark blues
    <div
      className="min-h-screen text-white"
      style={{
        background: 'linear-gradient(160deg, #061021 0%, #071428 45%, #08122a 100%)'
      }}
    >
      <div className="container mx-auto px-6 py-12">
        {/* Top bar / header */}
        <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
              Admin Panel
            </h1>
            <p className="mt-2 text-sm text-white/70 max-w-xl">
              Manage coding problems on your platform — fast actions, safer edits and a clear audit trail.
            </p>
          </div>


        </header>

        {/* Cards grid */}
        <main>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {adminOptions.map((opt) => {
              const Icon = opt.icon;
              return (
                <article
                  key={opt.id}
                  className="relative rounded-2xl p-6 shadow-2xl border border-white/6 bg-gradient-to-b from-white/2 to-transparent hover:from-white/3 hover:to-transparent transition transform hover:-translate-y-2"
                >
                  {/* decorative top-left corner accent */}
                  <div className="absolute -top-3 -left-3 w-14 h-14 rounded-xl bg-gradient-to-br from-yellow-500/20 to-transparent blur-sm pointer-events-none" />

                  <div className="flex flex-col items-center text-center">
                    <div className="flex items-center justify-center w-20 h-20 rounded-full mb-4 bg-white/6 border border-white/8 shadow-inner">
                      <div className="w-12 h-12 flex items-center justify-center rounded-full bg-gradient-to-tr from-yellow-500/30 to-transparent">
                        <Icon className="w-6 h-6 text-yellow-400" />
                      </div>
                    </div>

                    <h3 className="text-xl font-semibold mb-2">{opt.title}</h3>
                    <p className="text-sm text-white/70 mb-6 max-w-xs">{opt.description}</p>

                    <div className="w-full flex flex-col sm:flex-row gap-3 justify-center">
                      <NavLink
                        to={opt.route}
                        className="btn btn-sm w-full sm:w-auto bg-yellow-500 text-black hover:bg-yellow-600 focus:ring-2 focus:ring-yellow-400"
                        aria-label={`Go to ${opt.title}`}
                      >
                        {opt.title}
                      </NavLink>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          {/* floating helper / add new */}
          <NavLink
            to="/admin/create"
            className="fixed bottom-8 right-8 hidden md:flex items-center gap-3 px-5 py-3 rounded-full shadow-2xl bg-yellow-500 text-black transform hover:scale-105 transition"
            aria-label="Create new problem"
          >
            <Plus className="w-4 h-4" />
            <span className="font-medium">Create</span>
          </NavLink>
        </main>

        {/* small footer note */}
        <footer className="mt-12 text-center text-white/50 text-xs">
          Tip: Use <span className="text-yellow-400">Audit Logs</span> to review all changes. Keep destructive actions protected behind confirmations.
        </footer>
      </div>
    </div>
  );
}

/*
  Add this to your tailwind.config.js to register a daisyUI theme using your palette.
  Paste into module.exports and restart the dev server.

  // tailwind.config.js (snippet)
  module.exports = {
    theme: {
      extend: {},
    },
    plugins: [require('daisyui')],
    daisyui: {
      themes: [
        {
          mydark: {
            primary: '#071428',
            'base-100': '#061021',
            'secondary': '#08122a',
            accent: '#f59e0b', // yellow-500
            neutral: '#0b1226',
            'base-content': '#ffffff'
          }
        }
      ]
    }
  }

  Tips:
  - If using react-router-dom, change import to: import { NavLink } from 'react-router-dom';
  - Keep lucide-react icons installed: npm i lucide-react
  - The design uses small glass / frosted effects (backdrop blur). Ensure 'backdrop-filter' is enabled in your CSS build if you customize PostCSS.
  - Use the floating Create button for quick access on desktop only; mobile users can use the grid CTAs.
*/
