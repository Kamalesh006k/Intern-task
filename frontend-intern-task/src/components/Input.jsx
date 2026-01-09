import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const Input = React.forwardRef(({ label, type = "text", error, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === "password";
    const inputType = isPassword ? (showPassword ? "text" : "password") : type;

    return (
        <div className="mb-4">
            {label && <label className="block text-gray-400 text-sm mb-2">{label}</label>}
            <div className="relative">
                <input
                    ref={ref}
                    type={inputType}
                    className={`w-full bg-dark-card border ${error ? 'border-alert-red' : 'border-gray-700 focus:border-primary'} rounded-lg px-4 py-3 text-white outline-none transition-colors duration-300 placeholder-gray-600 ${isPassword ? 'pr-12' : ''}`}
                    {...props}
                />
                {isPassword && (
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                    >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                )}
            </div>
            {error && <span className="text-alert-red text-xs mt-1">{error.message}</span>}
        </div>
    );
});

export default Input;
