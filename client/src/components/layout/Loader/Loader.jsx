import { useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import styles from './Loader.module.css'

export default function Loader({ onComplete }) {
  const [exiting, setExiting] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setExiting(true), 2100)
    return () => clearTimeout(t)
  }, [])

  return (
    <AnimatePresence onExitComplete={onComplete}>
      {!exiting && (
        <motion.div
          id="loader-root"
          className={styles.root}
          exit={{ opacity: 0, transition: { duration: 0.1, delay: 1.3 } }}
        >
          <motion.div
            className={styles.door}
            style={{ transformOrigin: 'top' }}
            initial={{ scaleY: 0 }}
            exit={{ scaleY: 1, transition: { duration: 0.8, delay: 0.5, ease: [0.91, 0, 0.09, 1] } }}
          />

          <div className={styles.inner}>
            <div className={styles.logoWrap}>
              <motion.div
                className={styles.logo}
                initial={{ y: '110%', opacity: 0 }}
                animate={{ y: 0, opacity: 1, transition: { duration: 0.8, delay: 1.0, ease: [0.34, 1.56, 0.64, 1] } }}
                exit={{ y: '-50%', opacity: 0, transition: { duration: 0.5, ease: [0.55, 0, 1, 0.45] } }}
              >
                E
              </motion.div>
            </div>

            <div className={styles.textMask}>
              <motion.p
                className={styles.text}
                initial={{ y: '110%', opacity: 0 }}
                animate={{ y: 0, opacity: 1, transition: { duration: 0.5, delay: 0.5, ease: [0.33, 1, 0.68, 1] } }}
                exit={{ y: '-50%', opacity: 0, transition: { duration: 0.5, ease: [0.55, 0, 1, 0.45] } }}
              >
                Curating Experience
              </motion.p>
            </div>

            <motion.div
              className={styles.barContainer}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { duration: 0.2, delay: 0.3 } }}
              exit={{ y: '-50%', opacity: 0, transition: { duration: 0.5, ease: [0.55, 0, 1, 0.45] } }}
            >
              <motion.div
                className={styles.bar}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1, transition: { duration: 1.5, ease: [0.76, 0, 0.24, 1] } }}
              />
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
