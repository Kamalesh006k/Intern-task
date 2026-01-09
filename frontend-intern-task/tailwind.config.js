/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: "#00E5FF", // Neon Cyan
                secondary: "#2979FF", // Bright Blue
                dark: "#050505", // Deeper Dark
                "dark-card": "#0A0A0A",
                "neon-green": "#00E676",
                "alert-red": "#FF1744",
                "glass-white": "rgba(255, 255, 255, 0.03)",
                "glass-border": "rgba(255, 255, 255, 0.08)",
            },
            fontFamily: {
                sans: ['Outfit', 'sans-serif'],
            },
            backgroundImage: {
                'grid-pattern': "linear-gradient(to right, #ffffff05 1px, transparent 1px), linear-gradient(to bottom, #ffffff05 1px, transparent 1px)",
            },
            animation: {
                'glow': 'glow 3s ease-in-out infinite alternate',
                'float': 'float 6s ease-in-out infinite',
                'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            },
            keyframes: {
                glow: {
                    '0%': { boxShadow: '0 0 5px rgba(0, 229, 255, 0.2)' },
                    '100%': { boxShadow: '0 0 20px rgba(0, 229, 255, 0.4), 0 0 10px rgba(41, 121, 255, 0.4)' },
                },
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-20px)' },
                }
            }
        },
    },
    plugins: [],
}
