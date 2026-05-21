import { useEffect, useRef } from 'react'
import { useAnimation, useInView } from 'framer-motion'

export function useScrollAnimation(threshold = 0.15) {
  const ref = useRef(null)
  const controls = useAnimation()
  const isInView = useInView(ref, { once: true, amount: threshold })

  useEffect(() => {
    if (isInView) controls.start('visible')
  }, [isInView, controls])

  return { ref, controls }
}

export const fadeUpVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.33, 1, 0.68, 1] } },
}

export const fadeUpStagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
}

export const fadeUpChild = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.33, 1, 0.68, 1] } },
}

export const scaleIn = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.7, ease: [0.33, 1, 0.68, 1] } },
}
