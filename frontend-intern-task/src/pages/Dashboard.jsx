import React, { useState, useEffect, useContext } from 'react';
import AuthContext from '../context/AuthContext';
import api from '../api/axios';
import Button from '../components/Button';
import { Plus, Trash2, Search, X, LayoutDashboard, Settings, LogOut, CheckCircle2, Clock, AlertCircle, BarChart3, Calendar, Menu } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Modal from '../components/Modal';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import ChatAssistant from '../components/ChatAssistant';

const Dashboard = () => {
    const { user, logout } = useContext(AuthContext);
    const [taskList, setTaskList] = useState([]);
    const [isTaskModalVisible, setTaskModalVisible] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();
    const [deletePrompt, setDeletePrompt] = useState({ visible: false, taskId: null });
    const [actionPrompt, setActionPrompt] = useState({ visible: false, type: null, item: null });
    const [currentFilter, setCurrentFilter] = useState("all");
    const [dateSelection, setDateSelection] = useState(null);
    const [isSidebarActive, setSidebarActive] = useState(false);
    const navigate = useNavigate();

    useEffect(() => { loadTaskData(); }, []);

    useEffect(() => {
        if (!user) return;

        // Use standard WebSocket
        // In production, use wss:// if https://
        const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        // Construct WS URL from VITE_API_URL or fallback to localhost:8000
        const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:8000';
        const wsUrl = apiBase.replace(/^http/, 'ws') + `/ws/${user.username || 'anon'}`;

        const socket = new WebSocket(wsUrl);

        socket.onopen = () => {
            console.log('Connected to realtime updates');
        };

        socket.onmessage = (event) => {
            if (event.data === 'task_update') {
                loadTaskData();
                // Optional: toast('Dashboard updated', { icon: '🔄' });
            }
        };

        socket.onclose = () => {
            console.log('Disconnected from realtime updates');
        };

        return () => {
            socket.close();
        };
    }, [user]);

    useEffect(() => {
        const finishedItems = taskList.filter(t => t.status === 'completed');
        if (finishedItems.length > 0) {
            const cleanupTimer = setTimeout(async () => {
                toast('Completed tasks removed from view', { icon: '✨' });
                await loadTaskData();
            }, 3000);
            return () => clearTimeout(cleanupTimer);
        }
    }, [taskList]);

    const loadTaskData = async () => {
        try {
            const result = await api.get('/tasks/');
            setTaskList(result.data);
        } catch (err) { console.error("Failed to fetch tasks", err); }
    };

    const handleTaskCreation = async (formData) => {
        try {
            const payload = {
                ...formData,
                due_date: formData.due_date ? new Date(formData.due_date).toISOString() : null
            };
            const result = await api.post('/tasks/', payload);
            setTaskList([...taskList, result.data]);
            setTaskModalVisible(false);
            reset();
            setDateSelection(null);
            toast.success("Task created successfully!");
        } catch (err) {
            toast.error("Failed to create task");
        }
    };

    const executeTaskDeletion = async () => {
        const { taskId } = deletePrompt;
        try {
            await api.delete(`/tasks/${taskId}`);
            setTaskList(taskList.filter(t => t.id !== taskId));
            toast.success("Task deleted");
        } catch (err) {
            toast.error("Failed to delete");
        } finally {
            setDeletePrompt({ visible: false, taskId: null });
        }
    };

    const updateTaskCompletion = async (targetTask) => {
        const updatedStatus = targetTask.status === 'completed' ? 'pending' : 'completed';
        try {
            const result = await api.put(`/tasks/${targetTask.id}`, { status: updatedStatus });
            setTaskList(taskList.map(t => t.id === targetTask.id ? result.data : t));
            toast.success(`Task marked as ${updatedStatus}`);
        } catch (err) {
            toast.error("Failed to update task");
        }
    };

    const displayTasks = taskList.filter(t => {
        const searchMatch = t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            t.description.toLowerCase().includes(searchTerm.toLowerCase());
        const statusMatch = currentFilter === 'all' || t.status === currentFilter;
        return searchMatch && statusMatch;
    });

    const retrieveStatusColor = (statusVal) => {
        switch (statusVal) {
            case 'completed': return 'text-neon-green';
            case 'in_progress': return 'text-primary';
            default: return 'text-gray-400';
        }
    };

    const retrievePriorityStyle = (priorityVal) => {
        switch (priorityVal) {
            case 'high': return 'bg-alert-red/20 text-alert-red border-alert-red/30';
            case 'medium': return 'bg-primary/20 text-primary border-primary/30';
            default: return 'bg-gray-700/20 text-gray-400 border-gray-700/30';
        }
    };

    return (
        <div className="flex h-screen bg-dark text-white font-sans overflow-hidden">

            <div className={`fixed inset-0 bg-black/50 z-40 transition-opacity md:hidden ${isSidebarActive ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setSidebarActive(false)} />

            <aside className={`fixed md:relative z-50 w-64 h-full bg-dark-card border-r border-white/5 flex flex-col transition-transform duration-300 ${isSidebarActive ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
                <div className="p-6 flex justify-between items-center">
                    <Link to="/" className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-neon-green">
                        Primetrade.ai
                    </Link>
                    <button onClick={() => setSidebarActive(false)} className="md:hidden text-gray-400">
                        <X size={24} />
                    </button>
                </div>

                <nav className="flex-1 px-4 space-y-2">
                    <div className="flex items-center space-x-3 px-4 py-3 bg-primary/10 text-primary rounded-lg">
                        <LayoutDashboard size={20} /> <span className="font-medium">Tasks</span>
                    </div>
                    <Link to="/analytics" className="flex items-center space-x-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors cursor-pointer">
                        <BarChart3 size={20} /> <span>Analytics</span>
                    </Link>
                    <Link to="/settings" className="flex items-center space-x-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors cursor-pointer">
                        <Settings size={20} /> <span>Settings</span>
                    </Link>
                </nav>

                <div className="p-6 border-t border-white/5">
                    <div className="flex items-center gap-3 mb-4">
                        {user?.avatar_url ? (
                            <img
                                src={`http://localhost:8000${user.avatar_url}`}
                                alt="Profile"
                                className="w-10 h-10 rounded-full object-cover border-2 border-primary/30"
                            />
                        ) : (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-secondary to-primary flex items-center justify-center font-bold text-dark">
                                {user?.username?.charAt(0).toUpperCase()}
                            </div>
                        )}
                        <div className="overflow-hidden">
                            <div className="text-sm font-bold truncate">{user?.username}</div>
                            <div className="text-xs text-gray-500">Free Plan</div>
                        </div>
                    </div>
                    <button onClick={() => { logout(); navigate('/login'); }} className="flex items-center space-x-2 text-gray-400 hover:text-alert-red transition-colors text-sm">
                        <LogOut size={16} /> <span>Log Out</span>
                    </button>
                </div>
            </aside>

            <main className="flex-1 overflow-y-auto bg-grid-pattern bg-[length:30px_30px] relative w-full">
                <header className="sticky top-0 z-30 bg-dark/80 backdrop-blur-md border-b border-white/5 px-4 md:px-8 py-4">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
                        <div className="flex items-center gap-3 w-full md:w-auto">
                            <button onClick={() => setSidebarActive(true)} className="md:hidden text-gray-400 hover:text-white">
                                <Menu size={24} />
                            </button>
                            <h1 className="text-xl font-bold">My Tasks</h1>
                        </div>
                        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 w-full md:w-auto">
                            <div className="relative flex-1 md:flex-initial">
                                <Search className="absolute left-3 top-2.5 text-gray-500 w-4 h-4" />
                                <input
                                    type="text"
                                    placeholder="Search tasks..."
                                    className="bg-black/50 border border-white/10 rounded-full pl-10 pr-4 py-2 text-sm focus:border-primary outline-none focus:ring-1 focus:ring-primary/50 w-full md:w-64 transition-all"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <Button onClick={() => setTaskModalVisible(true)} className="flex items-center justify-center gap-2 !py-2 !px-4 text-sm w-full md:w-auto">
                                <Plus size={16} /> New Task
                            </Button>
                        </div>
                    </div>

                    <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                        {['all', 'pending', 'in_progress', 'completed'].map(status => (
                            <button
                                key={status}
                                onClick={() => setCurrentFilter(status)}
                                className={currentFilter === status ? 'px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm font-medium transition-all whitespace-nowrap bg-primary/20 text-primary border border-primary/30 flex-shrink-0' : 'px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm font-medium transition-all whitespace-nowrap text-gray-400 hover:text-white hover:bg-white/5 flex-shrink-0'}
                            >
                                {status.replace('_', ' ').charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
                            </button>
                        ))}
                    </div>
                </header>

                <div className="p-4 md:p-8">
                    <div className="bg-gradient-to-br from-dark-card to-black border border-white/5 rounded-xl p-4 md:p-6 mb-8 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>
                        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-center gap-4 md:gap-6">
                            {user?.avatar_url ? (
                                <img
                                    src={`http://localhost:8000${user.avatar_url}`}
                                    alt="Profile"
                                    className="w-16 md:w-20 h-16 md:h-20 rounded-full object-cover border-2 border-primary/30 flex-shrink-0"
                                />
                            ) : (
                                <div className="w-16 md:w-20 h-16 md:h-20 rounded-full bg-gradient-to-tr from-secondary to-primary flex items-center justify-center text-2xl md:text-3xl font-bold text-dark flex-shrink-0">
                                    {user?.username?.charAt(0).toUpperCase()}
                                </div>
                            )}
                            <div className="flex-1 text-center md:text-left">
                                <h2 className="text-xl md:text-2xl font-bold mb-1">Welcome back, {user?.username}!</h2>
                                <p className="text-gray-400 text-sm md:text-base">{user?.email}</p>
                            </div>
                            <Link to="/settings" className="w-full md:w-auto">
                                <Button variant="outline" className="flex items-center justify-center gap-2 w-full md:w-auto">
                                    <Settings size={18} /> Edit Profile
                                </Button>
                            </Link>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 mb-8">
                        <div className="bg-dark-card border border-white/5 p-4 md:p-6 rounded-xl relative overflow-hidden">
                            <div className="relative z-10">
                                <div className="text-gray-400 text-xs md:text-sm">Total Tasks</div>
                                <div className="text-2xl md:text-3xl font-bold mt-1">{taskList.length}</div>
                            </div>
                            <div className="absolute right-0 bottom-0 opacity-10 text-primary transform translate-x-4 translate-y-4">
                                <LayoutDashboard size={80} />
                            </div>
                        </div>
                        <div className="bg-dark-card border border-white/5 p-4 md:p-6 rounded-xl relative overflow-hidden">
                            <div className="relative z-10">
                                <div className="text-gray-400 text-xs md:text-sm">Completed</div>
                                <div className="text-2xl md:text-3xl font-bold mt-1 text-neon-green">
                                    {taskList.filter(t => t.status === 'completed').length}
                                </div>
                            </div>
                            <div className="absolute right-0 bottom-0 opacity-10 text-neon-green transform translate-x-4 translate-y-4">
                                <CheckCircle2 size={80} />
                            </div>
                        </div>
                        <div className="bg-dark-card border border-white/5 p-4 md:p-6 rounded-xl relative overflow-hidden">
                            <div className="relative z-10">
                                <div className="text-gray-400 text-xs md:text-sm">Pending</div>
                                <div className="text-2xl md:text-3xl font-bold mt-1 text-primary">
                                    {taskList.filter(t => t.status === 'pending').length}
                                </div>
                            </div>
                            <div className="absolute right-0 bottom-0 opacity-10 text-primary transform translate-x-4 translate-y-4">
                                <Clock size={80} />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
                        {displayTasks.map(item => (
                            <div key={item.id} className="bg-dark-card/50 backdrop-blur-sm border border-white/5 rounded-xl p-4 md:p-6 hover:border-primary/30 transition-all duration-300 group">
                                <div className="flex justify-between items-start mb-4 gap-2">
                                    <div className="flex items-start gap-2 md:gap-3 flex-1">
                                        <button
                                            onClick={() => updateTaskCompletion(item)}
                                            className={`mt-1 flex-shrink-0 ${item.status === 'completed' ? 'text-neon-green' : 'text-gray-600 hover:text-primary'} transition-colors`}
                                        >
                                            <CheckCircle2 size={18} md:size={20} fill={item.status === 'completed' ? 'currentColor' : 'none'} />
                                        </button>
                                        <div className="flex-1 min-w-0">
                                            <h3 className={`font-bold text-white mb-1 text-sm md:text-base break-words ${item.status === 'completed' ? 'line-through opacity-60' : ''}`}>
                                                {item.title}
                                            </h3>
                                            <div className="flex gap-2 mb-2 flex-wrap">
                                                <span className={`text-xs px-2 py-1 rounded-full border ${retrievePriorityStyle(item.priority)}`}>
                                                    {item.priority}
                                                </span>
                                                <span className={`text-xs px-2 py-1 rounded-full ${retrieveStatusColor(item.status)}`}>
                                                    {item.status.replace('_', ' ')}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setDeletePrompt({ visible: true, taskId: item.id })}
                                        className="text-gray-600 hover:text-alert-red opacity-0 group-hover:opacity-100 transition-all flex-shrink-0"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>

                                <div className="bg-black/40 rounded-lg p-3 mb-4 min-h-[60px]">
                                    <p className="text-gray-300 text-xs md:text-sm line-clamp-3 leading-relaxed">{item.description}</p>
                                </div>

                                {item.due_date && (
                                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                                        <Clock size={14} />
                                        <span>Due: {new Date(item.due_date).toLocaleDateString()}</span>
                                    </div>
                                )}

                                <div className="flex gap-2 mb-3 flex-col sm:flex-row">
                                    {item.status !== 'in_progress' && (
                                        <button
                                            onClick={() => setActionPrompt({ visible: true, type: 'start', item })}
                                            className="flex-1 text-xs py-1.5 px-3 bg-primary/10 text-primary border border-primary/30 rounded-lg hover:bg-primary/20 transition-colors"
                                        >
                                            Start Task
                                        </button>
                                    )}
                                    {item.status === 'in_progress' && (
                                        <button
                                            onClick={() => setActionPrompt({ visible: true, type: 'complete', item })}
                                            className="flex-1 text-xs py-1.5 px-3 bg-neon-green/10 text-neon-green border border-neon-green/30 rounded-lg hover:bg-neon-green/20 transition-colors"
                                        >
                                            Complete
                                        </button>
                                    )}
                                </div>

                                <div className="pt-3 border-t border-white/5 flex justify-between text-xs text-gray-600">
                                    <span>Created {new Date(item.created_at).toLocaleDateString()}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {displayTasks.length === 0 && (
                        <div className="text-center py-16">
                            <AlertCircle size={48} className="mx-auto text-gray-600 mb-4" />
                            <p className="text-gray-400">No tasks found. Create your first task to get started!</p>
                        </div>
                    )}
                </div>
            </main >

            {isTaskModalVisible && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 px-4 py-6">
                    <div className="bg-[#121212] border border-white/10 w-full max-w-lg p-6 md:p-8 rounded-2xl relative shadow-2xl animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
                        <button onClick={() => setTaskModalVisible(false)} className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"><X size={24} /></button>
                        <h2 className="text-xl md:text-2xl font-bold text-white mb-6">Create New Task</h2>
                        <form onSubmit={handleSubmit(handleTaskCreation)} className="space-y-5">
                            <div>
                                <label className="block text-gray-400 text-sm mb-2">Task Title</label>
                                <input
                                    type="text"
                                    placeholder="Enter task title..."
                                    className="w-full bg-black/50 border border-white/10 focus:border-primary rounded-lg px-4 py-3 text-white outline-none transition-colors text-base"
                                    {...register("title", { required: true })}
                                />
                            </div>

                            <div>
                                <label className="block text-gray-400 text-sm mb-2">Description</label>
                                <textarea
                                    rows="4"
                                    className="w-full bg-black/50 border border-white/10 focus:border-primary rounded-lg px-4 py-3 text-white outline-none resize-none transition-colors text-base"
                                    placeholder="Describe your task..."
                                    {...register("description", { required: true })}
                                ></textarea>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-gray-400 text-sm mb-2">Priority</label>
                                    <select
                                        className="w-full bg-black/50 border border-white/10 focus:border-primary rounded-lg px-4 py-3 text-white outline-none transition-colors text-base"
                                        {...register("priority")}
                                    >
                                        <option value="low">Low</option>
                                        <option value="medium" selected>Medium</option>
                                        <option value="high">High</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-gray-400 text-sm mb-2">Status</label>
                                    <select
                                        className="w-full bg-black/50 border border-white/10 focus:border-primary rounded-lg px-4 py-3 text-white outline-none transition-colors text-base"
                                        {...register("status")}
                                    >
                                        <option value="pending" selected>Pending</option>
                                        <option value="in_progress">In Progress</option>
                                        <option value="completed">Completed</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-gray-400 text-sm mb-2">Due Date (Optional)</label>
                                <div className="relative">
                                    <DatePicker
                                        selected={dateSelection}
                                        onChange={(dt) => {
                                            setDateSelection(dt);
                                            setValue('due_date', dt ? dt.toISOString().split('T')[0] : '');
                                        }}
                                        dateFormat="MMM dd, yyyy"
                                        placeholderText="Select a date..."
                                        className="w-full bg-black/50 border border-white/10 focus:border-primary rounded-lg px-4 py-3 pr-12 text-white outline-none transition-colors text-base"
                                        minDate={new Date()}
                                        isClearable
                                        showPopperArrow={false}
                                    />
                                    <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={18} />
                                </div>
                            </div>

                            <Button type="submit" className="w-full py-3 text-base md:text-lg shadow-lg shadow-primary/20">Create Task</Button>
                        </form>
                    </div>
                </div>
            )}

            <Modal
                isOpen={deletePrompt.visible}
                onClose={() => setDeletePrompt({ visible: false, taskId: null })}
                onConfirm={executeTaskDeletion}
                title="Delete Task"
                confirmText="Delete"
                type="danger"
            >
                Are you sure you want to delete this task? This action cannot be undone.
            </Modal>

            <Modal
                isOpen={actionPrompt.visible}
                onClose={() => setActionPrompt({ visible: false, type: null, item: null })}
                onConfirm={async () => {
                    try {
                        const nextState = actionPrompt.type === 'start' ? 'in_progress' : 'completed';
                        const response = await api.put(`/tasks/${actionPrompt.item.id}`, { status: nextState });
                        setTaskList(taskList.map(t => t.id === actionPrompt.item.id ? response.data : t));
                        toast.success(actionPrompt.type === 'start' ? 'Task started! ⏱️' : 'Task completed! 🎉');
                        setActionPrompt({ visible: false, type: null, item: null });
                    } catch (err) {
                        toast.error('Failed to update task');
                    }
                }}
                title={actionPrompt.type === 'start' ? 'Start Task' : 'Complete Task'}
                confirmText={actionPrompt.type === 'start' ? 'Start Now' : 'Mark Complete'}
                type={actionPrompt.type === 'complete' ? 'success' : 'primary'}
            >
                {actionPrompt.type === 'start'
                    ? `Are you ready to start working on "${actionPrompt.item?.title}"? The timer will begin tracking your work.`
                    : `Have you finished "${actionPrompt.item?.title}"? This will mark the task as completed and stop the timer.`
                }

            </Modal>
            <ChatAssistant />
        </div >
    );
};

export default Dashboard;
