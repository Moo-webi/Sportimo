import React, { useState, useEffect } from 'react';
import api from '../api/axios';

const ManageFacilities = () => {
    const [sports, setSports] = useState([]);
    const [newSportName, setNewSportName] = useState('');
    const [facilityData, setFacilityData] = useState({
        name: '', description: '', pricePerHour: '', sportId: ''
    });

    useEffect(() => {
        loadSports();
    }, []);

    const loadSports = async () => {
        const res = await api.get('/sports'); //
        setSports(res.data);
    };

    const handleAddSport = async (e) => {
        e.preventDefault();
        await api.post('/sports', { name: newSportName }); //
        setNewSportName('');
        loadSports();
    };

    const handleAddFacility = async (e) => {
        e.preventDefault();
        //
        await api.post('/facilities', {
            ...facilityData,
            sport: { id: facilityData.sportId } // Linking to the Sport entity
        });
        alert("Facility Created!");
    };

    return (
        <div className="p-8 max-w-4xl mx-auto space-y-12">
            {/* Form to Add a Sport */}
            <section className="bg-white p-6 rounded-xl shadow">
                <h2 className="text-xl font-bold mb-4">1. Add New Sport Category</h2>
                <form onSubmit={handleAddSport} className="flex gap-4">
                    <input
                        value={newSportName}
                        onChange={(e) => setNewSportName(e.target.value)}
                        placeholder="e.g. Padel"
                        className="flex-1 border p-2 rounded"
                        required
                    />
                    <button className="bg-green-600 text-white px-6 py-2 rounded">Add Sport</button>
                </form>
            </section>

            {/* Form to Add a Facility */}
            <section className="bg-white p-6 rounded-xl shadow">
                <h2 className="text-xl font-bold mb-4">2. Create New Facility</h2>
                <form onSubmit={handleAddFacility} className="space-y-4">
                    <input name="name" placeholder="Facility Name (e.g. Court #1)"
                           onChange={(e) => setFacilityData({...facilityData, name: e.target.value})}
                           className="w-full border p-2 rounded" required />

                    <select
                        onChange={(e) => setFacilityData({...facilityData, sportId: e.target.value})}
                        className="w-full border p-2 rounded" required
                    >
                        <option value="">Select Sport</option>
                        {sports.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>

                    <input name="price" type="number" placeholder="Price Per Hour"
                           onChange={(e) => setFacilityData({...facilityData, pricePerHour: e.target.value})}
                           className="w-full border p-2 rounded" required />

                    <button className="w-full bg-blue-600 text-white py-2 rounded font-bold">
                        Create Facility
                    </button>
                </form>
            </section>
        </div>
    );
};

export default ManageFacilities;