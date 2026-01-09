import React, { useContext } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import AuthContext from '../context/AuthContext';
import Input from '../components/Input';
import Button from '../components/Button';
import Navbar from '../components/Navbar';
import GoogleLogin from '../components/GoogleLogin';

const Login = () => {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLoginSubmit = async (formData) => {
        try {
            await login(formData.username, formData.password);
            toast.success("Signed in successfully");
            navigate('/dashboard');
        } catch (err) {
            toast.error(err.response?.data?.detail || "Login Failed");
        }
    };

    return (
        <div className="min-h-screen bg-dark flex flex-col font-sans relative overflow-hidden">
            <Navbar />

            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[100px] animate-pulse-slow"></div>
                <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-secondary/10 rounded-full blur-[100px] animate-pulse-slow delay-1000"></div>
                <div className="absolute inset-0 bg-grid-pattern bg-[length:40px_40px] opacity-[0.03]"></div>
            </div>

            <div className="flex-1 flex items-center justify-center px-4 relative z-10">
                <div className="w-full max-w-md bg-dark-card/50 backdrop-blur-xl border border-white/10 p-8 rounded-2xl shadow-2xl transform transition-all hover:scale-[1.01]">
                    <h2 className="text-3xl font-bold text-center mb-2 text-white">Welcome Back</h2>
                    <p className="text-center text-gray-400 mb-8 text-sm">Access your trading terminal</p>

                    <form onSubmit={handleSubmit(handleLoginSubmit)} className="space-y-5">
                        <Input
                            label="Username"
                            placeholder="trader123"
                            {...register("username", { required: "Username is required" })}
                            error={errors.username}
                        />
                        <Input
                            label="Password"
                            type="password"
                            placeholder="••••••••"
                            {...register("password", { required: "Password is required" })}
                            error={errors.password}
                        />
                        <Button type="submit" className="w-full mt-2 py-3 shadow-[0_0_15px_rgba(0,229,255,0.3)]">Login to Dashboard</Button>
                    </form>

                    <div className="relative my-8 text-center">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-white/10"></div>
                        </div>
                        <span className="relative px-4 bg-dark text-xs text-gray-500 uppercase tracking-widest">Or continue with</span>
                    </div>

                    <GoogleLogin />

                    <p className="text-center text-gray-400 mt-6 text-sm">
                        Don't have an account? <Link to="/register" className="text-primary hover:text-neon-green transition-colors font-medium">Sign up</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
