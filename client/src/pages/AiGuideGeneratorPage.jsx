import React, { useState } from 'react';
import api from '../api/axiosConfig';
import Card from '../components/common/Card';
import Button from '../components/common/Button';

// A simple component to render Markdown content safely
const MarkdownRenderer = ({ content }) => {
    // Basic conversion of Markdown elements to HTML for display
    const formattedContent = content
        .replace(/### (.*)/g, '<h3 class="text-xl font-semibold mt-4 mb-2">$1</h3>')
        .replace(/## (.*)/g, '<h2 class="text-2xl font-bold mt-6 mb-3">$1</h2>')
        .replace(/\*\*(.*)\*\*/g, '<strong>$1</strong>')
        .replace(/\* (.*)/g, '<li class="ml-5 list-disc">$1</li>')
        .replace(/(\d+)\. (.*)/g, '<li class="ml-5" style="list-style-type: decimal;">$2</li>')
        .replace(/\n/g, '<br />');

    return <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: formattedContent }} />;
};

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
            // For local UI testing we call the dev endpoint which does not require auth
            // This endpoint returns { guide: '...' } while the protected endpoint
            // returns { id, description, guide_content }.
            const response = await api.post('/guides/generate_dev', { description });
            // Normalize both response shapes into a single object for UI
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
                    {/* You can add a spinner here */}
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
                <Card className="max-w-4xl mx-auto mt-8">
                    <h2 className="text-2xl font-bold mb-4">Your Repair Guide for: "{generatedGuide.description}"</h2>
                    <hr className="mb-4"/>
                    <MarkdownRenderer content={generatedGuide.guide_content} />
                </Card>
            )}
        </div>
    );
};

export default AiGuideGeneratorPage;