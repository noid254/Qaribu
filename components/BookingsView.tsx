import React from 'react';

// Bookings are not managed yet (architecture section 8 has them with offerings, phase 5). This page says so plainly
// instead of showing made-up bookings.
const BookingsView: React.FC<{ onBack: () => void }> = ({ onBack }) => (
  <div>
    <div className="bg-brand-navy text-white px-4 py-4 flex items-center">
      <button onClick={onBack} className="mr-3 text-xl" aria-label="Back">&larr;</button>
      <h1 className="text-xl font-bold">Bookings</h1>
    </div>
    <div className="p-4 max-w-md mx-auto">
      <div data-testid="no-bookings" className="bg-white rounded-xl shadow p-5 text-center">
        <p className="font-semibold text-brand-navy">No bookings yet</p>
        <p className="text-sm text-gray-500 mt-1">When people book your time or a place, their bookings will appear here for you to manage.</p>
      </div>
    </div>
  </div>
);

export default BookingsView;
