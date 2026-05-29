import ThemeToggle from '../ui/ThemeToggle'

export default function TopBar({ onMenuOpen }) {
  return (
    <header className="flex items-center justify-between px-4 py-3 border-b border-white/5 md:hidden bg-[#212121]">
      <button
        onClick={onMenuOpen}
        aria-label="Open sidebar"
        className="flex items-center justify-center w-8 h-8 rounded-lg text-gray-400 hover:text-gray-200 hover:bg-white/10 transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <span className="text-sm font-medium text-gray-200">ChatGPT</span>

      <ThemeToggle />
    </header>
  )
}
