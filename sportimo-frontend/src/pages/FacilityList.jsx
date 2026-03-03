import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import FacilityCard from '../components/FacilityCard';

const FacilityList = () => {
    const [facilities, setFacilities] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFacilities = async () => {
            try {

                const response = await api.get('/facilities');
                setFacilities(response.data);
            } catch (err) {
                console.error("Failed to fetch facilities", err);
            } finally {
                setLoading(false);
            }
        };
        fetchFacilities();
    }, []);

    if (loading) return <div className="text-center mt-20">Loading amazing sports spots...</div>;

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Available Facilities</h1>

                {facilities.length === 0 ? (
                    <div className="bg-white p-10 rounded-xl text-center shadow">
                        <p className="text-gray-500">No facilities available right now. Check back soon!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {facilities.map(f => <FacilityCard key={f.id} facility={f} />)}
                    </div>
                )}
            </div>
        </div>
    );
};

export default FacilityList;