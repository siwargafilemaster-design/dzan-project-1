type SectionLabelProps = {
  children: React.ReactNode
  className?: string
}

const SectionLabel = ({ children, className = "" }: SectionLabelProps) => {
  return (
    <p
      className={`text-[10px] tracking-[4px] font-medium uppercase text-dzan-amber ${className}`}
    >
      {children}
    </p>
  )
}

export default SectionLabel