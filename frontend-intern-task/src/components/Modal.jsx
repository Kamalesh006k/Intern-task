import React from 'react';
import { X, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from './Button';

const Modal = ({ isOpen, onClose, title, children, type = "info", confirmText = "Confirm", onConfirm, loading = false }) => {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    className="bg-[#121212] border border-white/10 w-full max-w-md p-6 rounded-2xl relative shadow-2xl"
                >
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
                    >
                        <X size={20} />
                    </button>

                    <div className="flex items-center gap-3 mb-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${type === "danger" ? "bg-alert-red/10 text-alert-red" : "bg-primary/10 text-primary"
                            }`}>
                            <AlertCircle size={20} />
                        </div>
                        <h2 className="text-xl font-bold text-white">{title}</h2>
                    </div>

                    <div className="text-gray-400 mb-8 leading-relaxed">
                        {children}
                    </div>

                    <div className="flex gap-3">
                        <Button
                            variant="outline"
                            className="flex-1 py-2 border-white/10"
                            onClick={onClose}
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                        <Button
                            className={`flex-1 py-2 ${type === "danger" ? "bg-alert-red hover:bg-red-600 shadow-red-900/20" : ""
                                }`}
                            onClick={onConfirm}
                            loading={loading}
                        >
                            {confirmText}
                        </Button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default Modal;
