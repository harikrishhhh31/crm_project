import slide1 from '@/assets/login/slide-1.jpg'
import slide2 from '@/assets/login/slide-2.jpg'
import slide3 from '@/assets/login/slide-3.jpg'
import slide4 from '@/assets/login/slide-4.jpg'

export interface LoginSlide {
  id: number
  image: string
  alt: string
  headline: string
  subtext: string
}

export const loginSlides: LoginSlide[] = [
  {
    id: 1,
    image: slide1,
    alt: 'Family at home',
    headline: 'Protect what matters most',
    subtext: 'Smart policy management for every family you serve.',
  },
  {
    id: 2,
    image: slide2,
    alt: 'Health and wellbeing',
    headline: 'Never miss a renewal',
    subtext: 'Track every policy and client, no matter the claim history.',
  },
  {
    id: 3,
    image: slide3,
    alt: 'Home and property protection',
    headline: 'Faster claims, happier clients',
    subtext: 'Keep customers updated at every stage.',
  },
  {
    id: 4,
    image: slide4,
    alt: 'Travel and vehicle coverage',
    headline: 'Everything in one place',
    subtext: 'Policies, claims, contests and documents together.',
  },
]
