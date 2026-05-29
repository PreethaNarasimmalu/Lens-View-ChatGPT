import { useState } from 'react'
import Sidebar from './components/layout/Sidebar'
import TopBar from './components/layout/TopBar'
import ChatArea from './components/chat/ChatArea'
import ChatInput from './components/input/ChatInput'

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  function handleSend(text) {
    // Phase 2 will wire this up
    console.log('send:', text)
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#212121] text-gray-100">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex flex-col flex-1 min-w-0">
        <TopBar onMenuOpen={() => setSidebarOpen(true)} />

        {/* Model selector bar — desktop only */}
        <div className="hidden md:flex items-center px-6 py-3 border-b border-white/5">
          <button className="flex items-center gap-1.5 text-sm font-semibold text-gray-100 hover:text-white transition-colors">
            ChatGPT
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        <ChatArea onPresetClick={handleSend} />
        <ChatInput onSend={handleSend} />
      </div>
    </div>
  )
}
