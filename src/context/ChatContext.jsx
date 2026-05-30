import { createContext, useContext, useReducer } from 'react'

const ChatContext = createContext(null)

const initialState = {
  messages: [],
  isStreaming: false,
  lensViewActive: false,
  rationaleOpen: false,
  activeMessage: null,
  error: null,
}

function chatReducer(state, action) {
  switch (action.type) {
    case 'SEND_MESSAGE':
      return {
        ...state,
        messages: [...state.messages, action.payload],
        error: null,
      }
    case 'START_ASSISTANT_MESSAGE':
      return {
        ...state,
        isStreaming: true,
        messages: [...state.messages, action.payload],
      }
    case 'STREAM_CHUNK':
      return {
        ...state,
        messages: state.messages.map(m =>
          m.id === action.id ? { ...m, rawText: m.rawText + action.chunk } : m
        ),
      }
    case 'FINALISE_MESSAGE':
      return {
        ...state,
        isStreaming: false,
        messages: state.messages.map(m =>
          m.id === action.id ? { ...m, rawText: action.rawText, segments: action.segments, formattedText: action.formattedText ?? null } : m
        ),
      }
    case 'SET_STREAMING':
      return { ...state, isStreaming: action.value }
    case 'TOGGLE_LENS_VIEW':
      return { ...state, lensViewActive: !state.lensViewActive }
    case 'OPEN_RATIONALE':
      return { ...state, rationaleOpen: true, activeMessage: action.message }
    case 'CLOSE_RATIONALE':
      return { ...state, rationaleOpen: false, activeMessage: null }
    case 'CLEAR_CHAT':
      return { ...initialState }
    case 'SET_ERROR':
      return { ...state, isStreaming: false, error: action.error }
    default:
      return state
  }
}

export function ChatProvider({ children }) {
  const [state, dispatch] = useReducer(chatReducer, initialState)
  return (
    <ChatContext.Provider value={{ state, dispatch }}>
      {children}
    </ChatContext.Provider>
  )
}

export function useChat() {
  return useContext(ChatContext)
}
