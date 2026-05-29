import TypingIndicator from './TypingIndicator'
import LensResponse from '../lens/LensResponse'

export default function MessageBubble({ message, isStreamingThis, lensViewActive }) {
  const isUser = message.role === 'user'

  if (isUser) {
    return (
      <div
        data-testid="message-user"
        className="flex justify-end px-4 py-2"
      >
        <div className="max-w-[75%] md:max-w-[65%] px-4 py-3 rounded-3xl bg-[#2f2f2f] text-gray-100 text-sm leading-relaxed">
          {message.rawText}
        </div>
      </div>
    )
  }

  // Assistant
  return (
    <div
      data-testid="message-assistant"
      className="flex justify-start px-4 py-2"
    >
      {/* Avatar */}
      <div className="shrink-0 w-7 h-7 rounded-full bg-white flex items-center justify-center mr-3 mt-0.5">
        <svg className="w-4 h-4 text-black" viewBox="0 0 41 41" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M37.532 16.87a9.963 9.963 0 00-.856-8.184 10.078 10.078 0 00-10.855-4.835 9.964 9.964 0 00-7.505-3.360 10.079 10.079 0 00-9.612 6.977 9.967 9.967 0 00-6.664 4.834 10.08 10.08 0 001.24 11.817 9.965 9.965 0 00.856 8.185 10.079 10.079 0 0010.855 4.835 9.965 9.965 0 007.504 3.360 10.078 10.078 0 009.617-6.981 9.967 9.967 0 006.663-4.834 10.079 10.079 0 00-1.243-11.814z" fill="currentColor"/>
        </svg>
      </div>

      <div className="flex-1 min-w-0 max-w-[80%] md:max-w-[70%]">
        {isStreamingThis && message.rawText === '' ? (
          <TypingIndicator />
        ) : (
          <LensResponse
            segments={message.segments}
            rawText={message.rawText}
            lensViewActive={lensViewActive}
          />
        )}
      </div>
    </div>
  )
}
