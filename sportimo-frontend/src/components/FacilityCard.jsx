import React from 'react';

const FacilityCard = ({ facility }) => {
    return (
        <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow border border-gray-100">
            <div className="p-5">
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="text-xl font-bold text-gray-800">{facility.name}</h3>
                        <p className="text-sm text-gray-500 mt-1">{facility.description}</p>
                    </div>
                    <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded">
            Active
          </span>
                </div>

                <div className="mt-4 flex items-center justify-between">
                    <div>
                        <span className="text-2xl font-bold text-blue-600">${facility.pricePerHour}</span>
                        <span className="text-gray-400 text-sm"> / hour</span>
                    </div>
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition">
                        Book Now
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FacilityCard;