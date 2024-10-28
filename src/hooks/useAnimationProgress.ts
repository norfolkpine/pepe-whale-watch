import { useState, useEffect } from 'react'

export const useAnimationProgress = (duration: number, delay: number = 0) => {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    let rafId: number
    let startTime: number

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const elapsed = timestamp - startTime - delay
      const newProgress = Math.min(elapsed / duration, 1)
      setProgress(newProgress)

      if (newProgress < 1) {
        rafId = requestAnimationFrame(animate)
      }
    }

    rafId = requestAnimationFrame(animate)

    return () => {
      if (rafId) cancelAnimationFrame(rafId)
    }
  }, [duration, delay])

  return progress
}
