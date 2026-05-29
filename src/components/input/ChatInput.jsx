import { useState, useRef, useEffect } from 'react'
import LensTogglePill from './LensTogglePill'

export default function ChatInput({ onSend, onLensToggle, lensViewActive = false, disabled = false }) {
  const [value, setValue] = useState('')
  const textareaRef = useRef(null)

  // Auto-resize textarea to fit content, cap at 192px (max-h-48)
  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 192) + 'px'
  }, [value])

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
    // Reset height
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
  }

  return (
    <div className="px-4 pb-6 pt-2">
      <div className="w-full max-w-3xl mx-auto">
        <div className="
          flex flex-col gap-2 px-4 py-3 rounded-3xl
          bg-[#2f2f2f] dark:bg-[#2f2f2f]
          border border-white/10 dark:border-white/10
          focus-within:border-white/20
          transition-colors
        ">
          <textarea
            ref={textareaRef}
            data-testid="chat-input"
            rows={1}
            value={value}
            onChange={e => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Message ChatGPT"
            disabled={disabled}
            aria-label="Message input"
            className="
              w-full resize-none bg-transparent text-sm text-gray-100
              placeholder-gray-500 outline-none leading-6
              overflow-y-auto
            "
            style={{ minHeight: '24px', maxHeight: '192px' }}
          />

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
