import { useCallback } from 'react'
import { useChat as useChatContext } from '../context/ChatContext'

// Phase 2: hardcoded placeholder — replaced in Phase 3 with Groq streaming
const PLACEHOLDER_RESPONSE =
  "This is a placeholder response. In Phase 3, this will be replaced with a real streaming response from Groq's llama-3.3-70b-versatile model. The Lens View feature will then annotate each claim as VERIFIED, UNCERTAIN, or ASSUMPTION."

export function useChat() {
  const { state, dispatch } = useChatContext()

  const sendMessage = useCallback((text) => {
    const userId = crypto.randomUUID()
    const assistantId = crypto.randomUUID()

    // Append user message
    dispatch({
      type: 'SEND_MESSAGE',
      payload: { id: userId, role: 'user', rawText: text, segments: null, timestamp: Date.now() },
    })

    // Start assistant message (empty, streaming)
    dispatch({
      type: 'START_ASSISTANT_MESSAGE',
      payload: { id: assistantId, role: 'assistant', rawText: '', segments: null, timestamp: Date.now() },
    })

    // Simulate word-by-word streaming with setInterval
    const words = PLACEHOLDER_RESPONSE.split(' ')
    let i = 0
    const interval = setInterval(() => {
      if (i < words.length) {
        dispatch({
          type: 'STREAM_CHUNK',
          id: assistantId,
          chunk: (i === 0 ? '' : ' ') + words[i],
        })
        i++
      } else {
        clearInterval(interval)
        dispatch({
          type: 'FINALISE_MESSAGE',
          id: assistantId,
          rawText: PLACEHOLDER_RESPONSE,
          segments: null,
        })
      }
    }, 60)
  }, [dispatch])

  return { state, sendMessage, dispatch }
}
