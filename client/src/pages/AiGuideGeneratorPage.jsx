import React, { useState } from 'react';
import api from '../api/axiosConfig';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import MarkdownRenderer from '../components/common/MarkdownRenderer';
import Modal from '../components/common/modal';

const AiGuideGeneratorPage = () => {
    const [description, setDescription] = useState('');
    const [generatedGuide, setGeneratedGuide] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleGenerateGuide = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setGeneratedGuide(null);

        try {
            const response = await api.post('/guides/generate_dev', { description });
            const data = response.data;
            if (data.guide) {
                setGeneratedGuide({ description, guide_content: data.guide });
            } else {
                setGeneratedGuide({ description: data.description || description, guide_content: data.guide_content || data.guide });
            }
        } catch (err) {
            const errorMessage = err.response?.data?.msg || "An unexpected error occurred. Please try again.";
            setError(errorMessage);
            console.error("Guide generation failed:", err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopy = async (text) => {
        try {
            await navigator.clipboard.writeText(text);
            alert('Guide copied to clipboard');
        } catch (e) {
            console.error('Copy failed', e);
            alert('Copy failed');
        }
    };

    const handleDownload = (title, content) => {
        const blob = new Blob([content], { type: 'text/markdown;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
    a.download = (title || 'repair-guide').replace(/[^a-z0-9-]/gi, '_') + '.md';
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
    };

    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <div className="container mx-auto px-4 py-10">
            <Card className="max-w-4xl mx-auto">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-gray-800">AI Repair Guide Generator</h1>
                    <p className="mt-2 text-gray-600">
                        Describe your item and its problem, and our AI will create a custom repair guide for you.
                    </p>
                </div>

                <form onSubmit={handleGenerateGuide} className="mt-8">
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="e.g., My coffee machine is leaking from the bottom."
                        className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 transition"
                        required
                    />
                    <div className="mt-4 flex justify-center">
                        <Button type="submit" disabled={isLoading || !description}>
                            {isLoading ? 'Generating...' : 'Generate Guide'}
                        </Button>
                    </div>
                </form>
            </Card>

            {/* Loading State */}
            {isLoading && (
                <div className="text-center mt-8">
                    <p className="text-lg text-gray-700">Please wait, our AI is crafting your guide...</p>
                </div>
            )}

            {/* Error State */}
            {error && (
                <Card className="max-w-4xl mx-auto mt-8 bg-red-50 border-l-4 border-red-500">
                    <p className="text-red-700 font-semibold">Error</p>
                    <p className="text-red-600">{error}</p>
                </Card>
            )}

            {/* Success State */}
            {generatedGuide && (
                <>
                    <Card className="max-w-4xl mx-auto mt-8">
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                            <div className="flex-1">
                                <h2 className="text-2xl font-bold">Your Repair Guide</h2>
                                <p className="text-sm text-gray-500 mt-1">For: <span className="font-medium">{generatedGuide.description}</span></p>
                                <div className="mt-4">
                                    <div className="bg-white/80 rounded-lg p-4 shadow-sm max-h-60 overflow-y-auto">
                                        <div className="prose prose-sm lg:prose-lg max-w-none text-gray-800">
                                            <MarkdownRenderer content={generatedGuide.guide_content} />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="w-full md:w-64 flex-shrink-0">
                                <div className="sticky top-6 flex flex-col gap-3">
                                    <Button
                                        onClick={() => setIsModalOpen(true)}
                                        className="w-full"
                                        variant="primary"
                                    >
                                        View Full
                                    </Button>

                                    <Button
                                        onClick={async () => {
                                            try {
                                                await api.post('/guides/save', {
                                                    title: generatedGuide.description?.slice(0, 100) || 'Saved guide',
                                                    description: generatedGuide.description,
                                                    guide_content: generatedGuide.guide_content,
                                                });
                                                alert('Guide saved successfully');
                                            } catch (e) {
                                                console.error('Save failed', e);
                                                alert('Failed to save guide');
                                            }
                                        }}
                                        className="w-full"
                                        variant="secondary"
                                    >
                                        Save Guide
                                    </Button>

                                    <Button onClick={() => handleCopy(generatedGuide.guide_content)} className="w-full" variant="outline">
                                        Copy
                                    </Button>

                                    <Button onClick={() => handleDownload(generatedGuide.description, generatedGuide.guide_content)} className="w-full" variant="outline">
                                        Download
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </Card>

                    <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={generatedGuide.description}>
                        <div className="max-h-[60vh] overflow-y-auto">
                            <div className="bg-white rounded-lg p-6 shadow-sm">
                                <div className="prose prose-lg max-w-none text-gray-800">
                                    <MarkdownRenderer content={generatedGuide.guide_content} />
                                </div>
                            </div>
                        </div>
                    </Modal>
                </>
            )}
        </div>
    );
};

export default AiGuideGeneratorPage;