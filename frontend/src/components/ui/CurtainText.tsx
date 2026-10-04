import { useState, useCallback, useRef, type CSSProperties } from 'react'

export interface CurtainTextProps {
  text?: string
  direction?: 'up' | 'down'
  baseColor?: string
  activeColor?: string
  fontClass?: string
  fontSize?: string
  textClassName?: string
  activeClassName?: string
  tracking?: string
  staggerMs?: number
  durationMs?: number
  easing?: string
  resetOnLeave?: boolean
  className?: string
  style?: CSSProperties
}

export function CurtainText({
  text = 'CURTAIN',
  direction = 'up',
  baseColor = '#ffffff',
  activeColor = '#a889c7',
  fontClass = 'font-black',
  fontSize,
  textClassName = '',
  activeClassName = '',
  tracking = 'tracking-widest',
  staggerMs = 60,
  durationMs = 400,
  easing = 'cubic-bezier(.77,0,.18,1)',
  resetOnLeave = true,
  className = '',
  style: rootCustomStyle,
}: CurtainTextProps) {
  const [triggered, setTriggered] = useState(false)
  const [animKey, setAnimKey] = useState(0)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const exitY = direction === 'up' ? '-100%' : '100%'
  const enterY = direction === 'up' ? '100%' : '-100%'

  const hasTailwindFontSize = /\btext-\S+/.test(textClassName)
  const resolvedFontSize = hasTailwindFontSize
    ? undefined
    : (fontSize ?? 'clamp(1.5rem, 6vw, 5rem)')
  const resolvedActiveClass = activeClassName || textClassName

  const handleEnter = useCallback(() => {
    if (!resetOnLeave) {
      setTriggered(false)
      setAnimKey((k) => k + 1)
      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => setTriggered(true), 20)
    } else {
      setTriggered(true)
    }
  }, [resetOnLeave])

  const handleLeave = useCallback(() => {
    if (resetOnLeave) setTriggered(false)
  }, [resetOnLeave])

  const getTransitionStyle = (delay: number): CSSProperties => ({
    transitionProperty: 'transform',
    transitionDuration: `${durationMs}ms`,
    transitionTimingFunction: easing,
    transitionDelay: `${delay}ms`,
  })

  const style = {
    base: (delay: number): CSSProperties => ({
      ...(resolvedFontSize && { fontSize: resolvedFontSize }),
      color: baseColor,
      willChange: 'transform',
      transform: triggered ? `translateY(${exitY})` : 'translateY(0%)',
      display: 'block',
      ...getTransitionStyle(delay),
    }),
    active: (delay: number): CSSProperties => ({
      ...(resolvedFontSize && { fontSize: resolvedFontSize }),
      color: activeColor,
      willChange: 'transform',
      transform: triggered ? 'translateY(0%)' : `translateY(${enterY})`,
      position: 'absolute',
      inset: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      ...getTransitionStyle(delay),
    }),
  }

  const classes = `inline-flex flex-wrap select-none cursor-default ${className}`.trim()

  return (
    <span
      key={animKey}
      className={classes}
      style={{
        display: 'inline-flex',
        flexWrap: 'wrap',
        userSelect: 'none',
        cursor: 'default',
        ...rootCustomStyle,
      }}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      {text.split('').map((char, i) => {
        const isSpace = char === ' '
        const delay = i * staggerMs

        return (
          <span
            key={i}
            className="relative overflow-hidden leading-none"
            style={{
              position: 'relative',
              overflow: 'hidden',
              lineHeight: 1,
              display: 'inline-block',
              ...(isSpace ? { width: '0.3em' } : undefined),
            }}
          >
            <span
              className={`block ${fontClass} ${tracking} ${textClassName}`.trim()}
              style={style.base(delay)}
            >
              {isSpace ? '\u00A0' : char}
            </span>
            <span
              className={`absolute inset-0 flex items-center justify-center ${fontClass} ${tracking} ${resolvedActiveClass}`.trim()}
              style={style.active(delay)}
              aria-hidden="true"
            >
              {isSpace ? '\u00A0' : char}
            </span>
          </span>
        )
      })}
    </span>
  )
}

export default CurtainText
