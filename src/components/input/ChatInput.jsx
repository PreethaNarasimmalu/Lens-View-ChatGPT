import { useState } from 'react'
import LensTogglePill from './LensTogglePill'

export default function ChatInput({ onSend, onLensToggle, lensViewActive = false, disabled = false }) {
  const [value, setValue] = useState('')

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      submit()
    }
  }

  function submit() {
    const trimmed = value.trim()
    if (!trimmed || disabled) return
    onSend?.(trimmed)
    setValue('')
  }

  return (
    <div className="px-4 pb-6 pt-2">
      <div className="w-full max-w-3xl mx-auto">
        <div className="
          flex flex-col gap-2 px-4 py-3 rounded-3xl
          bg-[#2f2f2f]
          border border-white/10
          focus-within:border-white/20
          transition-colors
        ">
          {/* Text input row */}
          <textarea
            data-testid="chat-input"
            rows={1}
            value={value}
            onChange={e => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Message ChatGPT"
            disabled={disabled}
            className="
              w-full resize-none bg-transparent text-sm text-gray-100
              placeholder-gray-500 outline-none leading-6
              max-h-48 overflow-y-auto
            "
            style={{ minHeight: '24px' }}
          />

          {/* Bottom row: lens pill + send */}
          <div className="flex items-center justify-between gap-2">
            <LensTogglePill active={lensViewActive} onToggle={onLensToggle} />

            <button
              onClick={submit}
              disabled={!value.trim() || disabled}
              aria-label="Send message"
              className="
                flex items-center justify-center w-8 h-8 rounded-full shrink-0
                transition-colors
                disabled:bg-white/10 disabled:text-gray-500 disabled:cursor-not-allowed
                enabled:bg-white enabled:text-black enabled:hover:bg-gray-200
              "
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-gray-600 mt-3">
          ChatGPT can make mistakes. Consider checking important information.
        </p>
      </div>
    </div>
  )
}
