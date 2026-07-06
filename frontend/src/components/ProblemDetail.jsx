import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Briefcase, Tag, Lightbulb, Building2, Code2, Sparkles } from 'lucide-react'

export default function ProblemDetail({ problem }) {
  const {
    tags = [],
    companies = [],
    hint = [
      'Try to think about the problem in terms of smaller subproblems',
      'Consider using a hash map to store intermediate results',
      'Think about the time complexity - can you optimize it?',
    ],
  } = problem || {}

  const [openSection, setOpenSection] = useState(null)

  const toggleSection = (section) => {
    setOpenSection(openSection === section ? null : section)
  }

  const getDifficultyColor = (difficulty) => {
    const colors = {
      easy: 'from-green-500 to-emerald-600',
      medium: 'from-yellow-500 to-orange-500',
      hard: 'from-red-500 to-rose-600'
    }
    return colors[difficulty?.toLowerCase()] || colors.medium
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 120, damping: 20 }}
      className="relative w-full p-6 mt-10 rounded-2xl overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #061021 0%, #071428 50%, #08122a 100%)',
        border: '1px solid rgba(254, 154, 0, 0.1)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(254, 154, 0, 0.05)'
      }}
    >
      

      

      {/* Stats Grid */}

      {/* Collapsible Sections */}
      <div className="relative z-10 space-y-3">
        {/* Tags Section */}
        <motion.div 
          className="rounded-xl border border-gray-700/50 overflow-hidden"
          style={{ 
            background: openSection === 'tags' 
              ? 'linear-gradient(135deg, rgba(254, 154, 0, 0.05), rgba(7, 20, 40, 0.8))'
              : 'rgba(7, 20, 40, 0.5)'
          }}
        >
          <button
            onClick={() => toggleSection('tags')}
            className="w-full px-4 py-3 flex items-center justify-between hover:bg-white/5 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#FE9A00] to-[#FE9A00]/60 flex items-center justify-center">
                <Tag className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-semibold text-gray-200">Topic Tags</span>
            </div>
            <motion.div
              animate={{ rotate: openSection === 'tags' ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </motion.div>
          </button>

          <AnimatePresence>
            {openSection === 'tags' && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="px-4 pb-4 pt-2">
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag, i) => (
                      <motion.span
                        key={i}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.03 }}
                        whileHover={{ scale: 1.05, y: -2 }}
                        className="px-3 py-1.5 text-xs font-medium rounded-lg border border-[#FE9A00]/30 bg-gradient-to-r from-[#071428] to-[#08122a] text-gray-200 hover:border-[#FE9A00]/60 transition-all cursor-pointer"
                        style={{ boxShadow: '0 2px 8px rgba(254, 154, 0, 0.1)' }}
                      >
                        {tag}
                      </motion.span>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Companies Section */}
        <motion.div 
          className="rounded-xl border border-gray-700/50 overflow-hidden"
          style={{ 
            background: openSection === 'companies' 
              ? 'linear-gradient(135deg, rgba(254, 154, 0, 0.05), rgba(7, 20, 40, 0.8))'
              : 'rgba(7, 20, 40, 0.5)'
          }}
        >
          <button
            onClick={() => toggleSection('companies')}
            className="w-full px-4 py-3 flex items-center justify-between hover:bg-white/5 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#FE9A00] to-[#FE9A00]/60 flex items-center justify-center">
                <Building2 className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-semibold text-gray-200">Asked By Companies</span>
            </div>
            <motion.div
              animate={{ rotate: openSection === 'companies' ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </motion.div>
          </button>

          <AnimatePresence>
            {openSection === 'companies' && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="px-4 pb-4 pt-2 flex gap-5 space-y-2">
                  {companies.length === 0 ? (
                    <div className="text-xs  text-gray-400 text-center py-2">No companies listed</div>
                  ) : (
                    companies.map((company, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        whileHover={{ x: 6, scale: 1.02 }}
                        className="flex items-center gap-3 p-2 rounded-lg bg-[#08122a]/50 border border-gray-700/30 hover:border-[#FE9A00]/40 transition-all cursor-pointer"
                      >
                        <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-gradient-to-br from-[#FE9A00]/20 to-[#FE9A00]/5 border border-[#FE9A00]/30 text-[#FE9A00] font-bold text-sm">
                          {String(company).charAt(0).toUpperCase()}
                        </div>
                        <div className="text-sm font-medium text-gray-200">{company}</div>
                      </motion.div>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Hints Section */}
        <motion.div 
          className="rounded-xl border border-gray-700/50 overflow-hidden"
          style={{ 
            background: openSection === 'hints' 
              ? 'linear-gradient(135deg, rgba(254, 154, 0, 0.05), rgba(7, 20, 40, 0.8))'
              : 'rgba(7, 20, 40, 0.5)'
          }}
        >
          <button
            onClick={() => toggleSection('hints')}
            className="w-full px-4 py-3 flex items-center justify-between hover:bg-white/5 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#FE9A00] to-[#FE9A00]/60 flex items-center justify-center">
                <Lightbulb className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-semibold text-gray-200">Solution Hints</span>
            </div>
            <motion.div
              animate={{ rotate: openSection === 'hints' ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </motion.div>
          </button>

          <AnimatePresence>
            {openSection === 'hints' && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="px-4 pb-4 pt-2 space-y-2">
                  {hint.length === 0 ? (
                    <div className="text-xs text-gray-400 text-center py-2">No hints available</div>
                  ) : (
                    hint.map((h, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="relative p-3 rounded-lg bg-gradient-to-r from-[#071428] to-[#08122a] border border-[#FE9A00]/20 text-sm text-gray-200 leading-relaxed"
                        style={{ boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)' }}
                      >
                        <div className="flex gap-2">
                          <div className="flex-shrink-0 w-5 h-5 rounded-full bg-[#FE9A00]/20 flex items-center justify-center text-[#FE9A00] text-xs font-bold">
                            {i + 1}
                          </div>
                          <div className="flex-1">{h}</div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Decorative bottom line */}
      <motion.div 
        className="relative z-10 mt-6 h-0.5 w-full bg-gradient-to-r from-transparent via-[#FE9A00]/50 to-transparent rounded-full"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: 0.5, duration: 1 }}
      />
    </motion.div>
  )
}