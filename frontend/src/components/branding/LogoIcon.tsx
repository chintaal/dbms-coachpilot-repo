import Image from 'next/image'

interface LogoIconProps {
  width?: number
  height?: number
  className?: string
}

/**
 * Icon-only Coachpilot logo component for compact spaces and favicon.
 */
export function LogoIcon({ width = 32, height = 32, className = '' }: LogoIconProps) {
  return (
    <Image
      src="/logos/coachpilot-icon.png"
      alt="Coachpilot"
      width={width}
      height={height}
      className={className}
      priority
    />
  )
}
