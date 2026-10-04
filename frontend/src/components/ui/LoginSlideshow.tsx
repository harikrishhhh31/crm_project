import { useCallback, useEffect, useState } from 'react'
import { Box, IconButton, Stack, Typography, alpha, useMediaQuery, useTheme } from '@mui/material'
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined'
import { loginSlides, type LoginSlide } from '@/components/ui/loginSlidesData'

interface LoginSlideshowProps {
  slides?: LoginSlide[]
  intervalMs?: number
}

export function LoginSlideshow({ slides = loginSlides, intervalMs = 6000 }: LoginSlideshowProps) {
  const theme = useTheme()
  const prefersReducedMotion = useMediaQuery('@media (prefers-reduced-motion: reduce)')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  const goToSlide = useCallback(
    (index: number) => {
      setCurrentIndex((index + slides.length) % slides.length)
    },
    [slides.length],
  )

  const nextSlide = useCallback(() => {
    goToSlide(currentIndex + 1)
  }, [currentIndex, goToSlide])

  const prevSlide = useCallback(() => {
    goToSlide(currentIndex - 1)
  }, [currentIndex, goToSlide])

  useEffect(() => {
    if (prefersReducedMotion || isPaused || slides.length <= 1) return undefined

    const timer = window.setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length)
    }, intervalMs)

    return () => {
      window.clearInterval(timer)
    }
  }, [intervalMs, isPaused, prefersReducedMotion, slides.length])

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault()
      prevSlide()
    } else if (event.key === 'ArrowRight') {
      event.preventDefault()
      nextSlide()
    } else if (event.key === 'Home') {
      event.preventDefault()
      goToSlide(0)
    } else if (event.key === 'End') {
      event.preventDefault()
      goToSlide(slides.length - 1)
    }
  }

  const activeSlide = slides[currentIndex]

  return (
    <Box
      component="section"
      role="region"
      aria-roledescription="carousel"
      aria-label="Product highlights"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
      sx={{
        position: 'relative',
        width: '100%',
        height: '100%',
        minHeight: '100vh',
        overflow: 'hidden',
        bgcolor: 'primary.dark',
        color: '#FFFFFF',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        p: { md: 6, lg: 8 },
        outline: 'none',
        '&:focus-visible': {
          boxShadow: `inset 0 0 0 3px ${theme.palette.primary.light}`,
        },
      }}
    >
      {/* Background slide images */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          zIndex: 0,
          overflow: 'hidden',
        }}
      >
        {slides.map((slide, index) => {
          const isActive = index === currentIndex
          return (
            <Box
              key={slide.id}
              component="img"
              src={slide.image}
              alt={slide.alt}
              loading={index === 0 ? 'eager' : 'lazy'}
              fetchPriority={index === 0 ? 'high' : 'auto'}
              sx={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                opacity: prefersReducedMotion ? (index === 0 ? 1 : 0) : isActive ? 1 : 0,
                transform: prefersReducedMotion || !isActive ? 'scale(1.0)' : 'scale(1.06)',
                transition: prefersReducedMotion
                  ? 'none'
                  : 'opacity 600ms ease-in-out, transform 6000ms ease-out',
                willChange: prefersReducedMotion ? 'auto' : 'transform, opacity',
              }}
            />
          )
        })}

        {/* High-contrast gradient overlay using theme tokens */}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background: `linear-gradient(180deg, ${alpha(theme.palette.primary.dark, 0.45)} 0%, ${alpha(theme.palette.primary.dark, 0.72)} 48%, ${alpha(theme.palette.primary.dark, 0.96)} 100%)`,
            zIndex: 1,
            pointerEvents: 'none',
          }}
        />
      </Box>

      {/* Top Brand Wordmark */}
      <Box
        sx={{
          position: 'relative',
          zIndex: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
        }}
      >
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: 1.5,
            bgcolor: 'primary.main',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: `0 4px 12px ${alpha(theme.palette.common.black, 0.25)}`,
          }}
        >
          <ShieldOutlinedIcon sx={{ color: '#FFFFFF', fontSize: 22 }} />
        </Box>
        <Typography
          variant="h1"
          sx={{
            color: '#FFFFFF',
            fontSize: '1.75rem',
            fontWeight: 700,
            letterSpacing: '-0.02em',
          }}
        >
          Harborline
        </Typography>
      </Box>

      {/* Bottom Content & Navigation */}
      <Stack
        spacing={3.5}
        sx={{
          position: 'relative',
          zIndex: 2,
          maxWidth: 540,
        }}
      >
        <Box
          role="group"
          aria-roledescription="slide"
          aria-label={`${currentIndex + 1} of ${slides.length}`}
          aria-live={isPaused ? 'polite' : 'off'}
          sx={{ minHeight: 110 }}
        >
          <Typography
            variant="h1"
            sx={{
              color: '#FFFFFF',
              fontSize: { md: '1.875rem', lg: '2.125rem' },
              fontWeight: 700,
              lineHeight: 1.25,
              mb: 1.25,
              textShadow: '0 2px 8px rgba(0,0,0,0.3)',
              transition: prefersReducedMotion ? 'none' : 'opacity 300ms ease',
            }}
          >
            {activeSlide.headline}
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: theme.palette.primary.light,
              fontSize: '1.05rem',
              lineHeight: 1.5,
              textShadow: '0 1px 4px rgba(0,0,0,0.3)',
              transition: prefersReducedMotion ? 'none' : 'opacity 300ms ease',
            }}
          >
            {activeSlide.subtext}
          </Typography>
        </Box>

        {/* Clickable Dot Indicators */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.25,
          }}
          role="tablist"
          aria-label="Slideshow controls"
        >
          {slides.map((slide, index) => {
            const isCurrent = index === currentIndex
            return (
              <IconButton
                key={slide.id}
                role="tab"
                aria-selected={isCurrent}
                aria-label={`Go to slide ${index + 1}: ${slide.headline}`}
                onClick={() => goToSlide(index)}
                size="small"
                sx={{
                  p: 0.5,
                  '&:focus-visible': {
                    outline: `2px solid ${theme.palette.primary.light}`,
                    outlineOffset: 2,
                  },
                }}
              >
                <Box
                  sx={{
                    width: isCurrent ? 28 : 8,
                    height: 8,
                    borderRadius: 4,
                    bgcolor: isCurrent ? '#FFFFFF' : alpha('#FFFFFF', 0.4),
                    transition: prefersReducedMotion
                      ? 'none'
                      : 'all 240ms cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      bgcolor: isCurrent ? '#FFFFFF' : alpha('#FFFFFF', 0.75),
                    },
                  }}
                />
              </IconButton>
            )
          })}
        </Box>

        {/* Small Trust Line */}
        <Box
          sx={{
            pt: 1,
            borderTop: `1px solid ${alpha(theme.palette.common.white, 0.15)}`,
          }}
        >
          <Typography
            variant="caption"
            sx={{
              color: alpha('#FFFFFF', 0.75),
              fontWeight: 500,
              letterSpacing: '0.01em',
            }}
          >
            Secure. Reliable. Built for insurance advisors.
          </Typography>
        </Box>
      </Stack>
    </Box>
  )
}
