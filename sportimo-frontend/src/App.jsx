import { Routes, Route } from "react-router-dom";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Landing from "./pages/Landing";
import FacilityList from "./pages/FacilityList";
import ManageFacilities from "./pages/ManageFacilities";
import AthleteDashboard from "./pages/AthleteDashboard";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
    return (
        <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Landing />} />
            <Route path="*" element={<Landing />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/facilities" element={<FacilityList />} />
            <Route
                path="/dashboard"
                element={
                    <ProtectedRoute allowedRoles={["ATHLETE"]}>
                        <AthleteDashboard />
                    </ProtectedRoute>
                }
            />

            {/* Protected Route for Sports Centers */}
            <Route
                path="/manage"
                element={
                    <ProtectedRoute allowedRoles={["CENTER"]}>
                        <ManageFacilities />
                    </ProtectedRoute>
                }
            />
        </Routes>
    );
}

export default App;
