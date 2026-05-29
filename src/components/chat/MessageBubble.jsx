import TypingIndicator from './TypingIndicator'
import LensResponse from '../lens/LensResponse'

export default function MessageBubble({ message, isStreamingThis, lensViewActive, onOpenRationale }) {
  const isUser = message.role === 'user'

  if (isUser) {
    return (
      <div data-testid="message-user" className="flex justify-end px-4 py-2">
        <div className="max-w-[75%] md:max-w-[65%] px-4 py-3 rounded-3xl bg-[#e8e8e8] dark:bg-[#2f2f2f] text-gray-800 dark:text-gray-100 text-sm leading-relaxed chat-message">
          {message.rawText}
        </div>
      </div>
    )
  }

  const hasLensData = lensViewActive && message.segments?.length > 0
  const isFinished = !isStreamingThis
  // Edge case: stream finished but returned empty content
  const isEmpty = isFinished && !message.rawText?.trim()

  return (
    <div data-testid="message-assistant" className="flex justify-start px-4 py-2">
      {/* Avatar */}
      <div className="shrink-0 w-7 h-7 rounded-full bg-white flex items-center justify-center mr-3 mt-0.5">
        <svg className="w-4 h-4 text-black" viewBox="0 0 41 41" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M37.532 16.87a9.963 9.963 0 00-.856-8.184 10.078 10.078 0 00-10.855-4.835 9.964 9.964 0 00-7.505-3.360 10.079 10.079 0 00-9.612 6.977 9.967 9.967 0 00-6.664 4.834 10.08 10.08 0 001.24 11.817 9.965 9.965 0 00.856 8.185 10.079 10.079 0 0010.855 4.835 9.965 9.965 0 007.504 3.360 10.078 10.078 0 009.617-6.981 9.967 9.967 0 006.663-4.834 10.079 10.079 0 00-1.243-11.814z" fill="currentColor"/>
        </svg>
      </div>

      <div className="flex-1 min-w-0 max-w-[80%] md:max-w-[70%] flex flex-col gap-2 chat-message">
        {isStreamingThis && message.rawText === '' ? (
          <TypingIndicator />
        ) : isEmpty ? (
          <p data-testid="empty-response" className="text-sm text-gray-500 italic">
            No response received.
          </p>
        ) : (
          <LensResponse
            segments={message.segments}
            rawText={message.rawText}
            lensViewActive={lensViewActive}
          />
        )}

        {/* Rationale button — shown when Lens View is on and message is done */}
        {hasLensData && isFinished && (
          <button
            data-testid="rationale-button"
            onClick={() => onOpenRationale?.(message)}
            className="
              self-start flex items-center gap-1.5 px-3 py-1 rounded-full text-xs
              border border-white/15 text-gray-400
              hover:border-white/30 hover:text-gray-200
              transition-all duration-150
            "
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            Rationale
          </button>
        )}
      </div>
    </div>
  )
}
