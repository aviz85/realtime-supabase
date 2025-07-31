'use client'

import { useTheme } from '@/lib/contexts/ThemeContext'

export default function ThemeToggle() {
  const { toggleTheme, isDark, mounted } = useTheme()

  // Don't render anything until mounted to prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="relative p-3 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 opacity-50">
        <div className="w-6 h-6" />
      </div>
    )
  }

  return (
    <button
      onClick={toggleTheme}
      className="relative p-3 rounded-2xl bg-white/10 dark:bg-gray-800/50 backdrop-blur-xl border border-white/20 dark:border-gray-700/30 hover:bg-white/20 dark:hover:bg-gray-700/50 transition-all duration-300 group"
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      <div className="relative w-6 h-6 overflow-hidden">
        {/* Sun Icon */}
        <div
          className={`absolute inset-0 transform transition-all duration-500 ${
            isDark ? 'rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100'
          }`}
        >
          <svg
            className="w-6 h-6 text-yellow-500 group-hover:text-yellow-400 transition-colors"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </svg>
        </div>

        {/* Moon Icon */}
        <div
          className={`absolute inset-0 transform transition-all duration-500 ${
            isDark ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-0 opacity-0'
          }`}
        >
          <svg
            className="w-6 h-6 text-blue-400 group-hover:text-blue-300 transition-colors"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
            />
          </svg>
        </div>
      </div>

      {/* Glow effect */}
      <div
        className={`absolute inset-0 rounded-2xl transition-all duration-300 ${
          isDark
            ? 'bg-blue-500/20 shadow-lg shadow-blue-500/25'
            : 'bg-yellow-500/20 shadow-lg shadow-yellow-500/25'
        } opacity-0 group-hover:opacity-100`}
      />
    </button>
  )
}