import { useRef, useEffect } from 'react'
import EmptyState from './EmptyState'
import MessageBubble from './MessageBubble'

export default function ChatArea({ messages, isStreaming, lensViewActive, onPresetClick, onOpenRationale }) {
  const bottomRef = useRef(null)

  // Auto-scroll on new messages or stream chunks
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView?.({ behavior: 'smooth', block: 'end' })
    }
  }, [messages])

  const isEmpty = messages.length === 0

  return (
    <div
      data-testid="chat-area"
      className="flex-1 overflow-y-auto flex flex-col"
    >
      {isEmpty ? (
        <EmptyState onPresetClick={onPresetClick} />
      ) : (
        <div className="flex flex-col py-4 max-w-3xl mx-auto w-full">
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
