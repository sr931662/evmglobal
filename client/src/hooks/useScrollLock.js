import { useEffect } from 'react'
import { getLenis } from './useLenis'

export function useScrollLock() {
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    getLenis()?.stop()

    return () => {
      document.body.style.overflow = prev
      getLenis()?.start()
    }
  }, [])
}
