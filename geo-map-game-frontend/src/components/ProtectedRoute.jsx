import { Navigate, Outlet, useLocation } from 'react-router-dom';

const ProtectedRoute = () => {
 const isAuthenticated = !!localStorage.getItem('token');
 const location = useLocation();

 const loginPath = location.search ? `/login${location.search}` : '/login'
 return isAuthenticated ? <Outlet /> : <Navigate to={loginPath} replace />;
};

export default ProtectedRoute;