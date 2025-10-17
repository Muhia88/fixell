import React, { useEffect, useState } from 'react';
import api from '../api/axiosConfig';
import Card from '../components/common/Card';
import MarkdownRenderer from '../components/common/MarkdownRenderer';

export default function SavedGuidesPage() {
    const [guides, setGuides] = useState([]);
    const [loading, setLoading] = useState(false);

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

    return (
        <div className="container mx-auto py-8">
            <h1 className="text-3xl font-bold mb-6">My Saved Guides</h1>
            {loading && <p>Loading...</p>}
            {!loading && guides.length === 0 && (
                <p className="text-gray-600">You have no saved guides yet.</p>
            )}
            <div className="space-y-4">
                {guides.map((g) => (
                    <Card key={g.id} className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-semibold">{g.title || g.description}</h2>
                                <p className="text-sm text-gray-500">{new Date(g.created_at).toLocaleString()}</p>
                            </div>
                        </div>
                        <div className="mt-3">
                            <MarkdownRenderer content={g.guide_content} />
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
}
