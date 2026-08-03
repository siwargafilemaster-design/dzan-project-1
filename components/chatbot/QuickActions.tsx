"use client"

interface Props {
  onAction: (message: string) => void
}

const QUICK_ACTIONS = [
  { icon: "📦", label: "Show products", message: "What products do you offer?" },
  { icon: "🎨", label: "About artisans", message: "Tell me about your artisans" },
  { icon: "📋", label: "MOQ & pricing", message: "What are your MOQ and pricing?" },
  { icon: "🚚", label: "Shipping info", message: "Do you ship internationally?" },
]

const QuickActions = ({ onAction }: Props) => {
  return (
    <div className="grid grid-cols-2 gap-2 mt-2">
      {QUICK_ACTIONS.map(action => (
        <button
          key={action.label}
          onClick={() => onAction(action.message)}
          className="bg-white border border-dzan-amber/30 hover:border-dzan-amber hover:bg-dzan-warm/30 text-dzan-earth text-xs px-3 py-2.5 rounded-sm transition-colors text-left"
        >
          <span className="text-base mr-1.5">{action.icon}</span>
          <span className="tracking-wide">{action.label}</span>
        </button>
      ))}
    </div>
  )
}

export default QuickActions