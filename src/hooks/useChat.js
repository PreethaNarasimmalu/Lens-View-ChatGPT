import { useCallback } from 'react'
import { useChat as useChatContext } from '../context/ChatContext'
import { streamResponse, classifyResponse } from '../services/groqService'
import { parseLensResponse } from '../utils/parseLensResponse'

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

    const history = [
      ...state.messages.map(m => ({ role: m.role, content: m.rawText })),
      { role: 'user', content: text },
    ]

    let fullText = ''

    try {
      // Pass 1 — stream the plain answer (always uses standard prompt)
      for await (const chunk of streamResponse({ messages: history })) {
        fullText += chunk
        dispatch({ type: 'STREAM_CHUNK', id: assistantId, chunk })
      }

      // Finalise with the streamed text so user can read it immediately
      dispatch({
        type: 'FINALISE_MESSAGE',
        id: assistantId,
        rawText: fullText,
        segments: null,
        formattedText: null,
      })

      // Pass 2 — run critic classification silently if Lens View is ON
      if (state.lensViewActive) {
        dispatch({ type: 'START_CLASSIFYING', id: assistantId })

        const classifyRaw = await classifyResponse({ answer: fullText, question: text })
        const segments = parseLensResponse(classifyRaw)

        dispatch({
          type: 'APPLY_SEGMENTS',
          id: assistantId,
          segments,
          formattedText: fullText,
        })
      }
    } catch (err) {
      dispatch({ type: 'SET_ERROR', error: err.message })
      dispatch({
        type: 'FINALISE_MESSAGE',
        id: assistantId,
        rawText: `⚠ ${err.message}`,
        segments: null,
        formattedText: null,
      })
    }
  }, [dispatch, state.messages, state.lensViewActive])

  return { state, sendMessage, dispatch }
}
