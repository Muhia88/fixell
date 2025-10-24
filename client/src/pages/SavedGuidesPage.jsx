import React, { useEffect, useState } from 'react';
import api from '../api/axiosConfig';
import Card from '../components/common/Card';
import MarkdownRenderer from '../components/common/MarkdownRenderer';
import Modal from '../components/common/modal';
import Button from '../components/common/Button';

export default function SavedGuidesPage() {
    const [guides, setGuides] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selected, setSelected] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        async function fetchGuides() {
            setLoading(true);
            try {
                const res = await api.get('/guides/');
                setGuides(res.data.saved_guides || res.data || []);
            } catch (e) {
                console.error('Failed to load saved guides', e);
            } finally {
                setLoading(false);
            }
        }
        fetchGuides();
    }, []);

    const handleView = (guide) => {
        setSelected(guide);
        setIsModalOpen(true);
    };

    const handleClose = () => {
        setIsModalOpen(false);
        setSelected(null);
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this guide?')) return;
        try {
            await api.delete(`/guides/${id}`);
            setGuides((prev) => prev.filter((g) => g.id !== id));
        } catch (e) {
            console.error('Delete failed', e);
            alert('Failed to delete guide');
        }
    };

    return (
        <div className="container mx-auto py-8">
            <h1 className="text-3xl font-bold mb-6">My Saved Guides</h1>
            {loading && <p>Loading...</p>}
            {!loading && guides.length === 0 && (
                <p className="text-gray-600">You have no saved guides yet.</p>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {guides.map((g) => (
                    <Card key={g.id} className="p-4 flex flex-col justify-between">
                        <div>
                            <h2 className="text-lg font-semibold">{g.title || g.description}</h2>
                            <p className="text-sm text-gray-500">{new Date(g.created_at).toLocaleString()}</p>
                        </div>

                        <div className="mt-4 flex items-center justify-between">
                            <div className="flex gap-2">
                                <Button onClick={() => handleView(g)} variant="primary">View</Button>
                                <Button onClick={() => handleDelete(g.id)} variant="danger">Delete</Button>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            <Modal isOpen={isModalOpen} onClose={handleClose} title={selected?.title || selected?.description}>
                <div className="max-h-[60vh] overflow-y-auto">
                    <div className="bg-white rounded-lg p-6 shadow-sm">
                        <div className="prose prose-lg max-w-none text-gray-800">
                            <MarkdownRenderer content={selected?.guide_content || ''} />
                        </div>
                    </div>
                </div>
                <div className="mt-4 flex justify-between">
                    <Button variant="secondary" onClick={handleClose}>Close</Button>
                    <Button variant="danger" onClick={() => { selected && handleDelete(selected.id); handleClose(); }}>Delete</Button>
                </div>
            </Modal>
        </div>
    );
}
