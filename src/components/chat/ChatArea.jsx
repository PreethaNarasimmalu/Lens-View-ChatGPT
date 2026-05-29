import { useRef, useEffect } from 'react'
import EmptyState from './EmptyState'
import MessageBubble from './MessageBubble'

export default function ChatArea({ messages, isStreaming, lensViewActive, onPresetClick, onOpenRationale }) {
  const bottomRef = useRef(null)

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView?.({ behavior: 'smooth', block: 'end' })
    }
  }, [messages])

  const isEmpty = messages.length === 0

  // Show hint when Lens View is ON but existing messages have no segments
  // (they were sent before Lens View was enabled)
  const hasUnanalysedMessages = lensViewActive &&
    messages.some(m => m.role === 'assistant' && !m.segments && m.rawText?.trim())

  return (
    <div
      data-testid="chat-area"
      className="flex-1 overflow-y-auto flex flex-col"
    >
      {isEmpty ? (
        <EmptyState onPresetClick={onPresetClick} />
      ) : (
        <div className="flex flex-col py-4 max-w-3xl mx-auto w-full">
          {/* Hint banner when Lens View is ON but responses predate it */}
          {hasUnanalysedMessages && (
            <div className="mx-4 mb-4 px-4 py-2.5 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center gap-2 text-xs text-violet-500 dark:text-violet-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20A10 10 0 0012 2z" />
              </svg>
              Lens View is ON — send a new message to see claims annotated.
            </div>
          )}

          {messages.map((msg, idx) => {
            const isLastAssistant =
              msg.role === 'assistant' && idx === messages.length - 1
            return (
              <MessageBubble
                key={msg.id}
                message={msg}
                isStreamingThis={isStreaming && isLastAssistant}
                lensViewActive={lensViewActive}
                onOpenRationale={onOpenRationale}
              />
            )
          })}
          <div ref={bottomRef} aria-hidden="true" />
        </div>
      )}
    </div>
  )
}
