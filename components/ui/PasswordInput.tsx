"use client"

import { Eye, EyeOff } from "lucide-react"
import { useState, forwardRef } from "react"

interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
}

const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
    ({ className = "", ...props }, ref) => {
        const [showPassword, setShowPassword] = useState(false)

        return (
            <div className="relative">
                <input
                ref={ref}
                type={showPassword ? "text" : "password"}
                className={`w-full bg-white border border-dzan-brown/20 rounded-sm p-3 pr-12 text-sm text-dzan-earth ${className}`}
                {...props}
                />
                <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-dzan-stone hover:text-dzan-amber transition-colors"
                tabIndex={-1}
                aria-label={showPassword ? "Hide Password" : "Show Password"}
                >
                    {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                    ) : (
                        <Eye className="w-4 h-4" />
                    )}
                </button>
            </div>
        )
    }
)

PasswordInput.displayName = "PasswordInput"

export default PasswordInput