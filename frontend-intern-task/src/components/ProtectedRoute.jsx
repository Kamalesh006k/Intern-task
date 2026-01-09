import { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const ProtectedRoute = () => {
    const { user, loading } = useContext(AuthContext);

    if (loading) return <div className="min-h-screen flex items-center justify-center text-primary">Loading...</div>;

    return user ? <Outlet /> : <Navigate to="/login" />;
};

export default ProtectedRoute;
