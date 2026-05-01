import { useRef, useEffect, useState, useCallback } from 'react'

export function useMouseTilt({ maxTiltX = 15, maxTiltY = 10, lerpFactor = 0.1 } = {}) {
  const containerRef = useRef(null)
  const rafRef = useRef(null)
  const targetRef = useRef({ x: 0, y: 0 })
  const currentRef = useRef({ x: 0, y: 0 })
  const hoveredRef = useRef(false)
  const timeRef = useRef(0)

  const [transform, setTransform] = useState({
    rotateX: 0,
    rotateY: 0,
    translateY: 0,
    isHovered: false,
  })

  const lerp = (a, b, t) => a + (b - a) * t

  const animate = useCallback((timestamp) => {
    timeRef.current = timestamp
    const float = hoveredRef.current ? 0 : Math.sin(timestamp * 0.0008) * 8

    currentRef.current.x = lerp(currentRef.current.x, targetRef.current.x, lerpFactor)
    currentRef.current.y = lerp(currentRef.current.y, targetRef.current.y, lerpFactor)

    setTransform({
      rotateX: currentRef.current.y,
      rotateY: currentRef.current.x,
      translateY: float,
      isHovered: hoveredRef.current,
    })

    rafRef.current = requestAnimationFrame(animate)
  }, [lerpFactor])

  useEffect(() => {
    rafRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(rafRef.current)
  }, [animate])

  const onMouseMove = useCallback((e) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    const dx = (e.clientX - centerX) / (rect.width / 2)
    const dy = (e.clientY - centerY) / (rect.height / 2)
    targetRef.current = {
      x: Math.max(-maxTiltX, Math.min(maxTiltX, dx * maxTiltX)),
      y: Math.max(-maxTiltY, Math.min(maxTiltY, -dy * maxTiltY)),
    }
  }, [maxTiltX, maxTiltY])

  const onMouseEnter = useCallback(() => {
    hoveredRef.current = true
  }, [])

  const onMouseLeave = useCallback(() => {
    hoveredRef.current = false
    targetRef.current = { x: 0, y: 0 }
  }, [])

  return { containerRef, transform, handlers: { onMouseMove, onMouseEnter, onMouseLeave } }
}
