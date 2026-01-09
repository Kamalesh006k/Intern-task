import React from 'react';

const Button = ({ children, onClick, type = "button", variant = "primary", className = "", disabled = false }) => {
    const baseStyle = "px-6 py-2 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed";

    const variants = {
        primary: "bg-gradient-to-r from-secondary to-primary text-dark shadow-[0_0_15px_rgba(0,229,255,0.4)] hover:shadow-[0_0_25px_rgba(0,229,255,0.6)]",
        outline: "border-2 border-primary text-primary hover:bg-primary/10",
        danger: "bg-alert-red text-white hover:bg-red-600",
        ghost: "text-gray-400 hover:text-white"
    };

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`${baseStyle} ${variants[variant]} ${className}`}
        >
            {children}
        </button>
    );
};

export default Button;
