import { createContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            
            
            
            const username = localStorage.getItem('username');
            setUser({ username });
        }
        setLoading(false);
    }, []);

    const login = async (username, password) => {
        const formData = new URLSearchParams();
        formData.append('username', username);
        formData.append('password', password);

        const response = await api.post('/auth/login', formData, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });
        localStorage.setItem('token', response.data.access_token);
        localStorage.setItem('username', username);
        setUser({ username });
        return response.data;
    };

    const googleLogin = async (idToken) => {
        const response = await api.post('/auth/google', { token: idToken });
        
        
        localStorage.setItem('token', response.data.access_token);
        localStorage.setItem('username', response.data.username);
        setUser({ username: response.data.username });
        return response.data;
    };

    const register = async (username, email, password) => {
        await api.post('/auth/register', { username, email, password });
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, setUser, login, register, logout, loading, googleLogin }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
