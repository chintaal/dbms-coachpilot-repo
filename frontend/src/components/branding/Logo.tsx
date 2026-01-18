import Image from 'next/image'

interface LogoProps {
  width?: number
  height?: number
  className?: string
}

/**
 * Full Coachpilot logo component that automatically switches
 * between light and dark mode variants based on CSS dark mode.
 */
export function Logo({ width = 200, height = 50, className = '' }: LogoProps) {
  return (
    <>
      <Image
        src="/logos/coachpilot-full-lightmode.png"
        alt="Coachpilot"
        width={width}
        height={height}
        className={`dark:hidden ${className}`}
        priority
      />
      <Image
        src="/logos/coachpilot-full-darkmode.png"
        alt="Coachpilot"
        width={width}
        height={height}
        className={`hidden dark:block ${className}`}
        priority
      />
    </>
  )
}
