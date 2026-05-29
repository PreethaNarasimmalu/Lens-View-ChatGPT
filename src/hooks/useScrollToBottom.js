import { useEffect, useRef } from 'react'

export function useScrollToBottom(dependency) {
  const ref = useRef(null)

  useEffect(() => {
    if (ref.current) {
      ref.current.scrollIntoView({ behavior: 'smooth', block: 'end' })
    }
  }, [dependency])

  return ref
}
