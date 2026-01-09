import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import api from '../api/axios';
import { BarChart3, TrendingUp, Clock, Target, Brain, ArrowLeft, CheckCircle2, Zap } from 'lucide-react';
import toast from 'react-hot-toast';

const Analytics = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [analyticsData, setAnalyticsData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        retrieveAnalyticsData();
    }, []);

    const retrieveAnalyticsData = async () => {
        try {
            const result = await api.get('/analytics/');
            setAnalyticsData(result.data);
        } catch (err) {
            toast.error('Failed to load analytics');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-dark flex items-center justify-center">
                <div className="text-primary text-xl">Loading analytics...</div>
            </div>
        );
    }

    const determineScoreColor = (scoreVal) => {
        if (scoreVal >= 80) return 'text-neon-green';
        if (scoreVal >= 60) return 'text-primary';
        if (scoreVal >= 40) return 'text-secondary';
        return 'text-alert-red';
    };

    const determineScoreGradient = (scoreVal) => {
        if (scoreVal >= 80) return 'from-neon-green/20 to-neon-green/5';
        if (scoreVal >= 60) return 'from-primary/20 to-primary/5';
        if (scoreVal >= 40) return 'from-secondary/20 to-secondary/5';
        return 'from-alert-red/20 to-alert-red/5';
    };

    return (
        <div className="min-h-screen bg-dark text-white">
            <div className="fixed inset-0 bg-grid-pattern bg-[length:40px_40px] opacity-[0.03] pointer-events-none"></div>
            <div className="fixed top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] pointer-events-none"></div>

            <header className="sticky top-0 z-50 bg-dark/80 backdrop-blur-md border-b border-white/5">
                <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex justify-between items-center gap-4">
                    <div className="flex items-center gap-2 md:gap-4 min-w-0">
                        <Link to="/dashboard" className="text-gray-400 hover:text-white transition-colors flex-shrink-0">
                            <ArrowLeft size={24} />
                        </Link>
                        <h1 className="text-lg md:text-2xl font-bold flex items-center gap-2 flex-shrink-0">
                            <Brain className="text-primary hidden sm:block" size={28} />
                            <span className="truncate">AI Analytics</span>
                        </h1>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                        {user?.avatar_url ? (
                            <img
                                src={`http://localhost:8000${user.avatar_url}`}
                                alt="Profile"
                                className="w-8 md:w-10 h-8 md:h-10 rounded-full object-cover border-2 border-primary/30"
                            />
                        ) : (
                            <div className="w-8 md:w-10 h-8 md:h-10 rounded-full bg-gradient-to-tr from-secondary to-primary flex items-center justify-center font-bold text-dark text-sm md:text-base">
                                {user?.username?.charAt(0).toUpperCase()}
                            </div>
                        )}
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 md:px-6 py-8">
                <div className={`bg-gradient-to-br ${determineScoreGradient(analyticsData.productivity_score)} border border-white/10 rounded-2xl p-4 md:p-8 mb-8 relative overflow-hidden`}>
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
                    <div className="relative z-10">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6 mb-6">
                            <div>
                                <h2 className="text-xs md:text-sm text-gray-400 mb-2">Your Productivity Score</h2>
                                <div className={`text-4xl md:text-6xl font-bold ${determineScoreColor(analyticsData.productivity_score)}`}>
                                    {analyticsData.productivity_score}
                                    <span className="text-lg md:text-2xl text-gray-500">/100</span>
                                </div>
                            </div>
                            <div className="text-right hidden md:block">
                                <Target size={64} className={determineScoreColor(analyticsData.productivity_score)} opacity={0.3} />
                            </div>
                        </div>
                        <div className="w-full bg-black/40 rounded-full h-3 overflow-hidden">
                            <div
                                className={`h-full ${analyticsData.productivity_score >= 80 ? 'bg-neon-green' : analyticsData.productivity_score >= 60 ? 'bg-primary' : 'bg-secondary'} transition-all duration-1000`}
                                style={{ width: `${analyticsData.productivity_score}%` }}
                            ></div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
                    <div className="bg-dark-card/50 backdrop-blur-sm border border-white/5 rounded-xl p-4 md:p-6">
                        <div className="flex items-center justify-between mb-4">
                            <BarChart3 className="text-primary" size={20} />
                            <span className="text-2xl md:text-3xl font-bold">{analyticsData.total_tasks}</span>
                        </div>
                        <div className="text-xs md:text-sm text-gray-400">Total Tasks</div>
                    </div>

                    <div className="bg-dark-card/50 backdrop-blur-sm border border-white/5 rounded-xl p-4 md:p-6">
                        <div className="flex items-center justify-between mb-4">
                            <CheckCircle2 className="text-neon-green" size={20} />
                            <span className="text-2xl md:text-3xl font-bold text-neon-green">{analyticsData.completed_tasks}</span>
                        </div>
                        <div className="text-xs md:text-sm text-gray-400">Completed</div>
                    </div>

                    <div className="bg-dark-card/50 backdrop-blur-sm border border-white/5 rounded-xl p-4 md:p-6">
                        <div className="flex items-center justify-between mb-4">
                            <TrendingUp className="text-secondary" size={20} />
                            <span className="text-2xl md:text-3xl font-bold text-secondary">{analyticsData.completion_rate}%</span>
                        </div>
                        <div className="text-xs md:text-sm text-gray-400">Completion Rate</div>
                    </div>

                    <div className="bg-dark-card/50 backdrop-blur-sm border border-white/5 rounded-xl p-4 md:p-6">
                        <div className="flex items-center justify-between mb-4">
                            <Clock className="text-primary" size={20} />
                            <span className="text-2xl md:text-3xl font-bold">{analyticsData.average_completion_time_hours.toFixed(1)}h</span>
                        </div>
                        <div className="text-xs md:text-sm text-gray-400">Avg. Completion Time</div>
                    </div>
                </div>

                <div className="bg-dark-card/50 backdrop-blur-sm border border-white/5 rounded-xl p-4 md:p-6 mb-8">
                    <div className="flex items-center gap-3 mb-6">
                        <Brain className="text-primary hidden sm:block" size={28} />
                        <h2 className="text-xl md:text-2xl font-bold">AI-Powered Insights</h2>
                    </div>
                    <div className="space-y-3">
                        {analyticsData.ai_insights.map((insight, index) => (
                            <div key={index} className="bg-black/40 rounded-lg p-4 border-l-4 border-primary/50 hover:border-primary transition-colors">
                                <p className="text-gray-300 leading-relaxed">{insight}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-dark-card/50 backdrop-blur-sm border border-white/5 rounded-xl p-6">
                        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <Zap className="text-secondary" size={24} />
                            Tasks by Priority
                        </h3>
                        <div className="space-y-4">
                            {Object.entries(analyticsData.tasks_by_priority).map(([priority, count]) => (
                                <div key={priority}>
                                    <div className="flex justify-between mb-2">
                                        <span className="capitalize text-gray-300">{priority} Priority</span>
                                        <span className="font-bold">{count}</span>
                                    </div>
                                    <div className="w-full bg-black/40 rounded-full h-2 overflow-hidden">
                                        <div
                                            className={`h-full ${priority === 'high' ? 'bg-alert-red' :
                                                priority === 'medium' ? 'bg-primary' :
                                                    'bg-gray-600'
                                                }`}
                                            style={{ width: `${analyticsData.total_tasks > 0 ? (count / analyticsData.total_tasks * 100) : 0}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-dark-card/50 backdrop-blur-sm border border-white/5 rounded-xl p-6">
                        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <TrendingUp className="text-neon-green" size={24} />
                            7-Day Completion Trend
                        </h3>
                        <div className="flex items-end justify-between h-48 gap-2">
                            {analyticsData.completion_trend.map((day, index) => {
                                const maxCompleted = Math.max(...analyticsData.completion_trend.map(d => d.completed), 1);
                                const height = (day.completed / maxCompleted) * 100;
                                return (
                                    <div key={index} className="flex-1 flex flex-col items-center gap-2">
                                        <div className="relative w-full flex items-end justify-center" style={{ height: '160px' }}>
                                            <div
                                                className="w-full bg-gradient-to-t from-neon-green to-primary rounded-t-lg transition-all duration-500 hover:opacity-80 relative group"
                                                style={{ height: `${height}%`, minHeight: day.completed > 0 ? '8px' : '0' }}
                                            >
                                                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black/80 px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                                    {day.completed} tasks
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                <div className="mt-8 text-center">
                    <Link to="/dashboard">
                        <button className="px-8 py-3 bg-primary hover:bg-primary/80 text-dark font-bold rounded-lg transition-colors">
                            Back to Dashboard
                        </button>
                    </Link>
                </div>
            </main>
        </div>
    );
};

export default Analytics;
