import { useEffect, useRef } from 'react'

export default function CustomCursor() {
  const cursorRef = useRef(null)

  useEffect(() => {
    const isFinePointer = window.matchMedia('(pointer: fine)').matches
    if (!isFinePointer) return

    const cursor = cursorRef.current
    const onMove = e => {
      cursor.style.left = e.clientX + 'px'
      cursor.style.top = e.clientY + 'px'
    }
    const onEnter = () => cursor.classList.add('hover')
    const onLeave = () => cursor.classList.remove('hover')

    document.addEventListener('mousemove', onMove)

    const targets = document.querySelectorAll('a, button, input, select, [data-cursor]')
    targets.forEach(el => {
      el.addEventListener('mouseenter', onEnter)
      el.addEventListener('mouseleave', onLeave)
    })

    return () => {
      document.removeEventListener('mousemove', onMove)
      targets.forEach(el => {
        el.removeEventListener('mouseenter', onEnter)
        el.removeEventListener('mouseleave', onLeave)
      })
    }
  }, [])

  return <div ref={cursorRef} className="custom-cursor hidden md:block" />
}
