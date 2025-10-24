import React, { useState } from 'react';
import Button from '../common/Button';
import Input from '../common/input';

const MarkAsSoldModal = ({ listing, onClose, onMarkAsSold }) => {
    const [soldPrice, setSoldPrice] = useState(
        (typeof listing?.price !== 'undefined' && listing?.price !== null) ? listing.price : 0
    );
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        setError('');
        if (soldPrice === '' || isNaN(soldPrice) || parseFloat(soldPrice) < 0) {
            setError('Please enter a valid final sale price (KES).');
            return;
        }

        setLoading(true);
        await onMarkAsSold(listing.id, parseFloat(soldPrice));
        setLoading(false);
    };

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full">
                <h3 className="text-lg font-bold mb-3">Mark as Sold</h3>
                <p className="text-sm text-gray-600 mb-4">
                    Confirm the final sale price (KES) for: <strong>{listing?.title}</strong>
                </p>

                {error && <div className="p-2 bg-red-100 text-red-700 mb-3 rounded text-sm">{error}</div>}

                <Input
                    label="Final Sale Price (KES)"
                    type="number"
                    value={soldPrice}
                    onChange={(e) => setSoldPrice(e.target.value)}
                    placeholder={`e.g., ${listing?.price}`}
                    min="0"
                    step="0.01" 
                    required
                    className="w-full"
                />

                <div className="flex justify-end gap-2 mt-6">
                    <Button onClick={onClose} variant="secondary" disabled={loading}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} variant="primary" disabled={loading}>
                        {loading ? 'Saving...' : 'Confirm Sale'}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default MarkAsSoldModal;