import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Register from './pages/Register';
import Login from './pages/Login';
import FacilityList from './pages/FacilityList';
import ManageFacilities from './pages/ManageFacilities'; // Added import
import ProtectedRoute from './components/ProtectedRoute'; // Added import

function App() {
    return (
        <Router>
            <Routes>
                {/* Public Routes */}
                <Route path="/" element={<h1>Welcome to Sportimo</h1>} />
                <Route path="/register" element={<Register />} />
                <Route path="/login" element={<Login />} />
                <Route path="/facilities" element={<FacilityList />} />

                {/* Protected Route for Sports Centers */}
                <Route
                    path="/manage"
                    element={
                        <ProtectedRoute>
                            <ManageFacilities />
                        </ProtectedRoute>
                    }
                />
            </Routes>
        </Router>
    );
}

export default App;