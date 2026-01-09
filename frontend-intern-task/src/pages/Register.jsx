import React, { useContext } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import AuthContext from '../context/AuthContext';
import Input from '../components/Input';
import Button from '../components/Button';
import Navbar from '../components/Navbar';
import GoogleLogin from '../components/GoogleLogin';

const Register = () => {
    const { register, handleSubmit, watch, formState: { errors } } = useForm();
    const { register: registerUser } = useContext(AuthContext);
    const navigate = useNavigate();

    const currentPassword = watch("password", "");

    const evaluatePassword = (pass) => {
        const criteria = [
            { label: "At least 8 characters", met: pass.length >= 8 },
            { label: "One uppercase letter", met: /[A-Z]/.test(pass) },
            { label: "One lowercase letter", met: /[a-z]/.test(pass) },
            { label: "One numerical digit", met: /\d/.test(pass) },
            { label: "One special character", met: /[@$!%*?&]/.test(pass) },
        ];

        const passedCount = criteria.filter(c => c.met).length;
        let scoreVal = (passedCount / criteria.length) * 100;

        let strengthLabel = "Weak";
        let colorClass = "bg-alert-red";
        if (passedCount === criteria.length) {
            strengthLabel = "Strong";
            colorClass = "bg-neon-green";
        } else if (passedCount >= 3) {
            strengthLabel = "Medium";
            colorClass = "bg-yellow-500";
        }

        return { scoreVal, strengthLabel, colorClass, criteria };
    };

    const passwordStatus = evaluatePassword(currentPassword);

    const processRegistration = async (formData) => {
        try {
            if (formData.password !== formData.confirmPassword) {
                toast.error("Passwords do not match");
                return;
            }
            await registerUser(formData.username, formData.email, formData.password);
            toast.success("Registration Successful!");
            navigate('/login');
        } catch (err) {
            toast.error(err.response?.data?.detail || "Registration Failed");
        }
    };

    return (
        <div className="min-h-screen bg-dark flex flex-col font-sans relative overflow-hidden">
            <Navbar />

            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-neon-green/10 rounded-full blur-[100px] animate-pulse-slow"></div>
                <div className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[100px] animate-pulse-slow delay-1000"></div>
                <div className="absolute inset-0 bg-grid-pattern bg-[length:40px_40px] opacity-[0.03]"></div>
            </div>

            <div className="flex-1 flex items-center justify-center px-4 py-12 relative z-10">
                <div className="w-full max-w-md bg-dark-card/50 backdrop-blur-xl border border-white/10 p-8 rounded-2xl shadow-2xl">
                    <h2 className="text-3xl font-bold text-center mb-2 text-white">Create Account</h2>
                    <p className="text-center text-gray-400 mb-8 text-sm">Join the elite trading community</p>

                    <form onSubmit={handleSubmit(processRegistration)} className="space-y-4">
                        <Input
                            label="Username"
                            placeholder="trader123"
                            {...register("username", { required: "Username is required" })}
                            error={errors.username}
                        />
                        <Input
                            label="Email"
                            type="email"
                            placeholder="you@example.com"
                            {...register("email", { required: "Email is required" })}
                            error={errors.email}
                        />
                        <div className="relative">
                            <Input
                                label="Password"
                                type="password"
                                placeholder="••••••••"
                                {...register("password", {
                                    required: "Password is required",
                                    minLength: { value: 8, message: "Min 8 characters required" },
                                    pattern: {
                                        value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
                                        message: "Must include uppercase, lowercase, number and special char"
                                    }
                                })}
                                error={errors.password}
                            />
                            {currentPassword && (
                                <div className="mt-[-10px] mb-4 p-3 bg-black/30 rounded-lg border border-white/5">
                                    <div className="flex justify-between text-[10px] mb-2 px-1">
                                        <span className="text-gray-500 uppercase tracking-tighter font-bold">Security Level</span>
                                        <span className={`${passwordStatus.colorClass.replace('bg-', 'text-')} font-bold uppercase`}>{passwordStatus.strengthLabel}</span>
                                    </div>
                                    <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden mb-3">
                                        <div
                                            className={`h-full ${passwordStatus.colorClass} transition-all duration-500`}
                                            style={{ width: `${passwordStatus.scoreVal}%` }}
                                        ></div>
                                    </div>
                                    <div className="grid grid-cols-1 gap-1">
                                        {passwordStatus.criteria.map((req, i) => (
                                            <div key={i} className="flex items-center gap-2 text-[10px]">
                                                <div className={`w-1.5 h-1.5 rounded-full ${req.met ? 'bg-neon-green shadow-[0_0_5px_rgba(57,255,20,0.5)]' : 'bg-gray-600'}`}></div>
                                                <span className={req.met ? 'text-gray-200' : 'text-gray-500'}>{req.label}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                        <Input
                            label="Confirm Password"
                            type="password"
                            placeholder="••••••••"
                            {...register("confirmPassword", {
                                required: "Please confirm your password",
                                validate: (val, { password }) => {
                                    if (val !== password) {
                                        return "Passwords do not match";
                                    }
                                }
                            })}
                            error={errors.confirmPassword}
                        />
                        <Button type="submit" className="w-full mt-4 py-3 shadow-[0_0_15px_rgba(0,229,255,0.3)]">Sign Up</Button>
                    </form>

                    <div className="relative my-8 text-center">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-white/10"></div>
                        </div>
                        <span className="relative px-4 bg-dark text-xs text-gray-500 uppercase tracking-widest">Or continue with</span>
                    </div>

                    <GoogleLogin />
                    <p className="text-center text-gray-400 mt-6 text-sm">
                        Already have an account? <Link to="/login" className="text-primary hover:text-neon-green transition-colors font-medium">Login</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;
