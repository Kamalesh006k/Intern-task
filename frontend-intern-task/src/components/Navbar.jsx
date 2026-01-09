import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import Button from './Button';
import { Menu, X } from 'lucide-react';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="fixed w-full z-50 bg-dark/80 backdrop-blur-md border-b border-white/10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <Link to="/" className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-neon-green">
                        Primetrade.ai
                    </Link>

                    <div className="hidden md:flex items-center space-x-4">
                        {user ? (
                            <>
                                <Link to="/dashboard" className="text-gray-300 hover:text-white transition-colors">Dashboard</Link>
                                <Link to="/settings" className="text-gray-300 hover:text-white transition-colors">Settings</Link>
                                <div className="flex items-center gap-3">
                                    {user?.avatar_url ? (
                                        <img
                                            src={`http://localhost:8000${user.avatar_url}`}
                                            alt="Profile"
                                            className="w-8 h-8 rounded-full object-cover border border-primary/30"
                                        />
                                    ) : (
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-secondary to-primary flex items-center justify-center text-sm font-bold text-dark">
                                            {user?.username?.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                    <span className="text-primary text-sm">@{user.username}</span>
                                </div>
                                <Button variant="outline" onClick={handleLogout} className="!py-1 !px-4 text-sm">Logout</Button>
                            </>
                        ) : (
                            <>
                                <Link to="/login"><Button variant="ghost">Login</Button></Link>
                                <Link to="/register"><Button variant="primary">Get Started</Button></Link>
                            </>
                        )}
                    </div>

                    <div className="md:hidden flex items-center">
                        <button onClick={() => setIsOpen(!isOpen)} className="text-white">
                            {isOpen ? <X /> : <Menu />}
                        </button>
                    </div>
                </div>
            </div>

            {}
            {isOpen && (
                <div className="md:hidden bg-dark-card border-t border-white/10 p-4">
                    <div className="flex flex-col space-y-4">
                        {user ? (
                            <>
                                <div className="flex items-center gap-3 pb-4 border-b border-white/10">
                                    {user?.avatar_url ? (
                                        <img
                                            src={`http://localhost:8000${user.avatar_url}`}
                                            alt="Profile"
                                            className="w-10 h-10 rounded-full object-cover border border-primary/30"
                                        />
                                    ) : (
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-secondary to-primary flex items-center justify-center font-bold text-dark">
                                            {user?.username?.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                    <div>
                                        <p className="text-primary font-bold">@{user.username}</p>
                                        <p className="text-gray-400 text-sm">{user?.email}</p>
                                    </div>
                                </div>
                                <Link to="/dashboard" className="text-gray-300" onClick={() => setIsOpen(false)}>Dashboard</Link>
                                <Link to="/settings" className="text-gray-300" onClick={() => setIsOpen(false)}>Settings</Link>
                                <button onClick={handleLogout} className="text-primary text-left">Logout</button>
                            </>
                        ) : (
                            <>
                                <Link to="/login" onClick={() => setIsOpen(false)} className="text-gray-300">Login</Link>
                                <Link to="/register" onClick={() => setIsOpen(false)} className="text-primary">Sign Up</Link>
                            </>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
