import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Button from '../components/Button';
import { CheckSquare, Users, Shield, ArrowRight, Target, Zap } from 'lucide-react';

const Landing = () => {
    const mainSectionRef = useRef(null);
    const contentRef = useRef(null);
    const graphicRef = useRef(null);
    const gridRef = useRef(null);

    useEffect(() => {
        const animationTimeline = gsap.timeline();

        animationTimeline.fromTo(contentRef.current.children,
            { y: 20, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: "power2.out" }
        )
            .fromTo(graphicRef.current,
                { scale: 0.9, opacity: 0, y: 20 },
                { scale: 1, opacity: 1, y: 0, duration: 1, ease: "power2.out" },
                "-=0.6"
            );

        gsap.fromTo(gridRef.current.children,
            { y: 30, opacity: 0 },
            {
                y: 0,
                opacity: 1,
                duration: 0.4,
                stagger: 0.1,
                ease: "power1.out",
                scrollTrigger: {
                    trigger: gridRef.current,
                    start: "top 95%",
                    toggleActions: "play none none reverse"
                }
            }
        );

        const updatePerspective = (e) => {
            const { clientX, clientY } = e;
            const xPos = (clientX / window.innerWidth - 0.5) * 20;
            const yPos = (clientY / window.innerHeight - 0.5) * 20;
            gsap.to(graphicRef.current, {
                rotationY: xPos,
                rotationX: -yPos,
                duration: 1,
                ease: "power2.out"
            });
        };

        window.addEventListener('mousemove', updatePerspective);
        return () => window.removeEventListener('mousemove', updatePerspective);

    }, []);

    return (
        <div className="min-h-screen bg-dark text-white font-sans selection:bg-primary selection:text-black overflow-x-hidden">
            <Navbar />

            <div className="fixed inset-0 bg-grid-pattern bg-[length:40px_40px] opacity-[0.03] pointer-events-none"></div>
            <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] pointer-events-none animate-pulse-slow"></div>
            <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/10 rounded-full blur-[120px] pointer-events-none animate-pulse-slow delay-1000"></div>

            <section className="relative pt-24 md:pt-32 pb-20 px-4 min-h-screen flex flex-col justify-center items-center" ref={mainSectionRef}>
                <div className="container mx-auto grid md:grid-cols-2 gap-12 items-center">

                    <div ref={contentRef} className="space-y-6 md:space-y-8 z-10 text-center md:text-left">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                            </span>
                            Powered by AI Technology
                        </div>

                        <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold leading-tight tracking-tight">
                            Organize Your Work <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-white to-secondary">
                                Achieve More
                            </span>
                        </h1>

                        <p className="text-gray-400 text-base md:text-lg max-w-xl mx-auto md:mx-0 leading-relaxed">
                            Primetrade.ai helps teams and individuals manage tasks efficiently with intelligent
                            prioritization, real-time collaboration, and seamless workflow automation.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                            <Link to="/register">
                                <Button variant="primary" className="h-12 text-lg w-full sm:w-auto flex items-center justify-center gap-2">
                                    Get Started <ArrowRight size={18} />
                                </Button>
                            </Link>
                            <Link to="/login">
                                <Button variant="outline" className="h-12 text-lg w-full sm:w-auto">
                                    Sign In
                                </Button>
                            </Link>
                        </div>
                    </div>

                    <div className="perspective-1000 flex justify-center mt-10 md:mt-0">
                        <div ref={graphicRef} className="relative w-full max-w-md aspect-square transform-style-3d">
                            <div className="absolute inset-0 bg-gradient-to-br from-dark-card to-black border border-glass-border rounded-xl shadow-2xl p-6 flex flex-col gap-4 transform translate-z-10">
                                <div className="flex justify-between items-center mb-2">
                                    <h3 className="text-white font-bold">Today's Tasks</h3>
                                    <span className="text-xs text-gray-500">5 pending</span>
                                </div>

                                {[
                                    { title: "Design new landing page", status: "completed", priority: "high" },
                                    { title: "Review pull requests", status: "in_progress", priority: "medium" },
                                    { title: "Update documentation", status: "pending", priority: "low" },
                                    { title: "Team standup meeting", status: "completed", priority: "medium" },
                                ].map((item, idx) => (
                                    <div key={idx} className="flex items-center gap-3 p-3 bg-black/40 rounded-lg border border-white/5">
                                        <div className={`w-4 h-4 rounded-full border-2 ${item.status === 'completed' ? 'bg-neon-green border-neon-green' : 'border-gray-600'}`}></div>
                                        <div className="flex-1">
                                            <div className={`text-sm ${item.status === 'completed' ? 'line-through text-gray-500' : 'text-white'}`}>
                                                {item.title}
                                            </div>
                                        </div>
                                        <span className={`text-xs px-2 py-1 rounded ${item.priority === 'high' ? 'bg-alert-red/20 text-alert-red' :
                                            item.priority === 'medium' ? 'bg-primary/20 text-primary' :
                                                'bg-gray-700/20 text-gray-400'
                                            }`}>
                                            {item.priority}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <div className="absolute -bottom-10 -right-5 bg-black/80 backdrop-blur-xl border border-primary/30 p-4 rounded-lg shadow-[0_0_30px_rgba(0,229,255,0.2)] transform translate-z-30 animate-float hidden sm:block">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-primary/20 rounded-full text-primary">
                                        <Target size={20} />
                                    </div>
                                    <div>
                                        <div className="text-secondary text-xs uppercase font-bold tracking-wider">Productivity</div>
                                        <div className="text-white font-bold">+42% This Week</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="py-20 bg-dark-card/30 border-t border-white/5">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold mb-4">Why Choose Primetrade.ai?</h2>
                        <p className="text-gray-400">Everything you need to manage work efficiently and effectively.</p>
                    </div>

                    <div ref={gridRef} className="grid md:grid-cols-3 gap-8">
                        {[
                            { icon: <CheckSquare className="text-neon-green" />, title: "Smart Task Management", desc: "Organize tasks with priorities, due dates, and status tracking. Stay on top of your work effortlessly." },
                            { icon: <Zap className="text-primary" />, title: "Boost Productivity", desc: "Streamline your workflow with intelligent task organization and real-time progress tracking." },
                            { icon: <Shield className="text-secondary" />, title: "Secure & Private", desc: "Your data is protected with enterprise-grade security. We take privacy seriously." }
                        ].map((feature, idx) => (
                            <div key={idx} className="p-8 rounded-2xl bg-gradient-to-b from-white/5 to-white/[0.02] border border-white/5 hover:border-primary/30 transition-all duration-300 hover:transform hover:-translate-y-2 group">
                                <div className="w-12 h-12 rounded-lg bg-black border border-white/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                                <p className="text-gray-400 leading-relaxed">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="py-20 px-4">
                <div className="container mx-auto max-w-4xl">
                    <div className="bg-gradient-to-br from-dark-card to-black border border-white/5 rounded-2xl p-8 md:p-12 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>
                        <div className="relative z-10">
                            <h2 className="text-3xl font-bold mb-6 text-center">About Primetrade.ai</h2>
                            <div className="space-y-4 text-gray-300 leading-relaxed text-sm md:text-base">
                                <p>
                                    Primetrade.ai is an automated cryptocurrency trading platform that leverages AI and blockchain technology to offer a comprehensive trading ecosystem. Founded in 2015 by Sainath Gupta, the company empowers crypto traders with an AI and Blockchain-powered infrastructure designed for easy, safe, and consistent trading to maximize returns.
                                </p>
                                <p>
                                    Our platform enables users to trade on multiple exchanges from a single interface, facilitating copy trading from leading traders and providing advanced portfolio management tools. With a presence in Hyderabad, India, and Saint Julian, Malta, Primetrade.ai aims to democratize access to sophisticated trading tools and empower financial inclusion by simplifying entry into decentralized finance.
                                </p>
                                <p>
                                    Utilizing advanced AI and blockchain solutions, we overcome traditional trading barriers with swift execution, minimal costs, and scalable infrastructure. Our robust cryptographic protocols ensure security and user protection, while our platform supports various trading strategies including arbitrage, day trading, and scalping.
                                </p>
                                <div className="grid md:grid-cols-3 gap-6 mt-8 pt-8 border-t border-white/10">
                                    <div className="text-center">
                                        <div className="text-2xl md:text-3xl font-bold text-primary mb-2">2015</div>
                                        <div className="text-xs md:text-sm text-gray-400">Founded</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl md:text-3xl font-bold text-neon-green mb-2">Multi</div>
                                        <div className="text-xs md:text-sm text-gray-400">Exchange Support</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl md:text-3xl font-bold text-secondary mb-2">AI</div>
                                        <div className="text-xs md:text-sm text-gray-400">Powered Trading</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="py-20 px-4">
                <div className="container mx-auto max-w-3xl text-center">
                    <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Transform Your Workflow?</h2>
                    <p className="text-gray-400 text-base md:text-lg mb-8">
                        Join thousands of professionals who trust Primetrade.ai to manage their work efficiently.
                    </p>
                    <Link to="/register">
                        <Button variant="primary" className="h-14 text-lg px-8 w-full sm:w-auto">
                            Start Today 
                        </Button>
                    </Link>
                </div>
            </section>

            <footer className="py-8 text-center text-gray-600 text-sm border-t border-white/5 px-4">
                © 2024 Primetrade.ai • Work Management Platform • Built with ❤️ for productivity
            </footer>
        </div>
    );
};

export default Landing;
