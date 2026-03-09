import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "./auth-context";

const ProtectedRoute = ({ children, role }) => {
    const { user } = useContext(AuthContext);

    if (!user) return <Navigate to="/login" />;

    if (role && user.role !== role) return <Navigate to="/" />;

    return children;
};

export default ProtectedRoute;
