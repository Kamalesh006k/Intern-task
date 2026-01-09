import React, { useState, useContext, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import api from '../api/axios';
import Button from '../components/Button';
import Navbar from '../components/Navbar';
import { User, Phone, FileText, Save, ArrowLeft, Camera } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

const Settings = () => {
    const { user, setUser } = useContext(AuthContext);
    const navigate = useNavigate();
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [imagePreview, setImagePreview] = useState(null);
    const uploadInputRef = useRef(null);
    const { register, handleSubmit, reset, formState: { errors } } = useForm();

    useEffect(() => {
        const loadProfileData = async () => {
            try {
                const result = await api.get('/profile/me');
                reset({
                    full_name: result.data.full_name || '',
                    bio: result.data.bio || '',
                    phone: result.data.phone || '',
                });
                if (result.data.avatar_url) {
                    setImagePreview(`http://localhost:8000${result.data.avatar_url}`);
                }
            } catch (err) {
                console.error('Failed to fetch profile', err);
            }
        };
        loadProfileData();
    }, [reset]);

    const updateProfileSettings = async (formData) => {
        setIsSaving(true);
        try {
            const result = await api.put('/profile/me', formData);
            setUser(result.data);
            toast.success('Profile updated successfully!');
        } catch (err) {
            toast.error(err.response?.data?.detail || 'Failed to update profile');
        } finally {
            setIsSaving(false);
        }
    };

    const processAvatarUpload = async (e) => {
        const selectedFile = e.target.files[0];
        if (!selectedFile) return;

        if (!selectedFile.type.startsWith('image/')) {
            toast.error('Please select an image file');
            return;
        }

        if (selectedFile.size > 5 * 1024 * 1024) {
            toast.error('Image size must be less than 5MB');
            return;
        }

        const fileReader = new FileReader();
        fileReader.onloadend = () => {
            setImagePreview(fileReader.result);
        };
        fileReader.readAsDataURL(selectedFile);

        setIsUploading(true);
        const uploadData = new FormData();
        uploadData.append('file', selectedFile);

        try {
            const result = await api.post('/profile/avatar', uploadData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            setUser(result.data);
            toast.success('Profile photo updated!');
        } catch (err) {
            toast.error(err.response?.data?.detail || 'Failed to upload photo');
            setImagePreview(null);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="min-h-screen bg-dark text-white font-sans">
            <Navbar />

            <div className="fixed inset-0 bg-grid-pattern bg-[length:40px_40px] opacity-[0.03] pointer-events-none"></div>
            <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] pointer-events-none animate-pulse-slow"></div>

            <div className="pt-24 pb-12 px-4 max-w-4xl mx-auto">
                <div className="mb-6 md:mb-8">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4"
                    >
                        <ArrowLeft size={20} /> Back to Dashboard
                    </button>
                    <h1 className="text-3xl md:text-4xl font-bold mb-2">Settings</h1>
                    <p className="text-gray-400 text-sm md:text-base">Manage your profile and account settings</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                    <div className="md:col-span-1">
                        <div className="bg-dark-card border border-white/5 rounded-xl p-6 md:sticky md:top-24">
                            <div className="flex flex-col items-center text-center">
                                <div className="relative mb-4 group">
                                    {imagePreview ? (
                                        <img
                                            src={imagePreview}
                                            alt="Profile"
                                            className="w-24 h-24 rounded-full object-cover border-2 border-primary/30"
                                        />
                                    ) : (
                                        <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-secondary to-primary flex items-center justify-center text-3xl font-bold text-dark">
                                            {user?.username?.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                    <button
                                        onClick={() => uploadInputRef.current?.click()}
                                        disabled={isUploading}
                                        className="absolute bottom-0 right-0 bg-primary hover:bg-primary/80 text-dark rounded-full p-2 transition-all shadow-lg disabled:opacity-50"
                                    >
                                        {isUploading ? (
                                            <div className="w-4 h-4 border-2 border-dark border-t-transparent rounded-full animate-spin"></div>
                                        ) : (
                                            <Camera size={16} />
                                        )}
                                    </button>
                                    <input
                                        ref={uploadInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={processAvatarUpload}
                                        className="hidden"
                                    />
                                </div>
                                <h2 className="text-2xl font-bold mb-1">{user?.username}</h2>
                                <p className="text-gray-500 text-sm">{user?.email}</p>
                            </div>
                        </div>
                    </div>

                    <div className="md:col-span-2">
                        <div className="bg-dark-card border border-white/5 rounded-xl p-6 md:p-8">
                            <h2 className="text-xl md:text-2xl font-bold mb-6">Profile Information</h2>

                            <form onSubmit={handleSubmit(updateProfileSettings)} className="space-y-6">
                                <div>
                                    <label className="block text-gray-400 text-sm mb-2 flex items-center gap-2">
                                        <User size={16} /> Full Name
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Enter your full name"
                                        className="w-full bg-black/50 border border-white/10 focus:border-primary rounded-lg px-4 py-3 text-white outline-none transition-colors text-base"
                                        {...register('full_name')}
                                    />
                                </div>

                                <div>
                                    <label className="block text-gray-400 text-sm mb-2 flex items-center gap-2">
                                        <Phone size={16} /> Phone Number
                                    </label>
                                    <input
                                        type="tel"
                                        placeholder="+1 (555) 123-4567"
                                        className="w-full bg-black/50 border border-white/10 focus:border-primary rounded-lg px-4 py-3 text-white outline-none transition-colors text-base"
                                        {...register('phone')}
                                    />
                                    {errors.phone && (
                                        <p className="text-alert-red text-xs mt-1">{errors.phone.message}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-gray-400 text-sm mb-2 flex items-center gap-2">
                                        <FileText size={16} /> Bio
                                    </label>
                                    <textarea
                                        rows="4"
                                        placeholder="Tell us about yourself..."
                                        className="w-full bg-black/50 border border-white/10 focus:border-primary rounded-lg px-4 py-3 text-white outline-none resize-none transition-colors text-base"
                                        {...register('bio')}
                                    ></textarea>
                                </div>

                                <div className="pt-6 border-t border-white/5">
                                    <h3 className="text-lg font-bold mb-4">Account Information</h3>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-gray-500 text-xs mb-1">Username</label>
                                            <div className="bg-black/30 border border-white/5 rounded-lg px-4 py-3 text-gray-400">
                                                {user?.username}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-gray-500 text-xs mb-1">Email</label>
                                            <div className="bg-black/30 border border-white/5 rounded-lg px-4 py-3 text-gray-400">
                                                {user?.email}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <Button
                                        type="submit"
                                        disabled={isSaving}
                                        className="flex-1 flex items-center justify-center gap-2"
                                    >
                                        <Save size={18} />
                                        {isSaving ? 'Saving...' : 'Save Changes'}
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => navigate('/dashboard')}
                                        className="px-8"
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
