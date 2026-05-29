import { useCallback } from 'react'
import { useChat as useChatContext } from '../context/ChatContext'
import { streamResponse } from '../services/groqService'

export function useChat() {
  const { state, dispatch } = useChatContext()

  const sendMessage = useCallback(async (text) => {
    const userId = crypto.randomUUID()
    const assistantId = crypto.randomUUID()

    dispatch({
      type: 'SEND_MESSAGE',
      payload: { id: userId, role: 'user', rawText: text, segments: null, timestamp: Date.now() },
    })

    dispatch({
      type: 'START_ASSISTANT_MESSAGE',
      payload: { id: assistantId, role: 'assistant', rawText: '', segments: null, timestamp: Date.now() },
    })

    // Build conversation history for Groq (exclude the empty assistant stub)
    const history = [
      ...state.messages.map(m => ({ role: m.role, content: m.rawText })),
      { role: 'user', content: text },
    ]

    let fullText = ''

    try {
      for await (const chunk of streamResponse({ messages: history, lensView: state.lensViewActive })) {
        fullText += chunk
        dispatch({ type: 'STREAM_CHUNK', id: assistantId, chunk })
      }

      dispatch({
        type: 'FINALISE_MESSAGE',
        id: assistantId,
        rawText: fullText,
        segments: null, // Phase 4 will parse Lens View JSON here
      })
    } catch (err) {
      dispatch({ type: 'SET_ERROR', error: err.message })
      // Replace empty assistant stub with the error text so it's visible in chat
      dispatch({
        type: 'FINALISE_MESSAGE',
        id: assistantId,
        rawText: `⚠ ${err.message}`,
        segments: null,
      })
    }
  }, [dispatch, state.messages, state.lensViewActive])

  return { state, sendMessage, dispatch }
}
