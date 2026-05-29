import { useState } from 'react'
import Sidebar from './components/layout/Sidebar'
import TopBar from './components/layout/TopBar'
import ChatArea from './components/chat/ChatArea'
import ChatInput from './components/input/ChatInput'
import RationalePanel from './components/lens/RationalePanel'
import ErrorBanner from './components/ui/ErrorBanner'
import ThemeToggle from './components/ui/ThemeToggle'
import { ChatProvider } from './context/ChatContext'
import { useChat } from './hooks/useChat'

function ChatShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [rationaleMessage, setRationaleMessage] = useState(null)
  const { state, sendMessage, dispatch } = useChat()

  return (
    <div className="flex h-screen overflow-hidden bg-white dark:bg-[#212121] text-gray-900 dark:text-gray-100">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex flex-col flex-1 min-w-0">
        {/* Mobile top bar */}
        <TopBar onMenuOpen={() => setSidebarOpen(true)} />

        {/* Desktop header — model name left, theme toggle right */}
        <div className="hidden md:flex items-center justify-between px-6 py-3 border-b border-black/5 dark:border-white/5">
          <button className="flex items-center gap-1.5 text-sm font-semibold text-gray-800 dark:text-gray-100 hover:text-black dark:hover:text-white transition-colors">
            ChatGPT
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {/* Theme toggle — top right on desktop */}
          <ThemeToggle />
        </div>

        {state.error && (
          <ErrorBanner
            message={state.error}
            onDismiss={() => dispatch({ type: 'SET_ERROR', error: null })}
          />
        )}

        <ChatArea
          messages={state.messages}
          isStreaming={state.isStreaming}
          lensViewActive={state.lensViewActive}
          onPresetClick={sendMessage}
          onOpenRationale={setRationaleMessage}
        />
        <ChatInput
          onSend={sendMessage}
          onLensToggle={() => dispatch({ type: 'TOGGLE_LENS_VIEW' })}
          lensViewActive={state.lensViewActive}
          disabled={state.isStreaming}
        />
      </div>

      {rationaleMessage && (
        <RationalePanel
          message={rationaleMessage}
          onClose={() => setRationaleMessage(null)}
        />
      )}
    </div>
  )
}

export default function App() {
  return (
    <ChatProvider>
      <ChatShell />
    </ChatProvider>
  )
}
