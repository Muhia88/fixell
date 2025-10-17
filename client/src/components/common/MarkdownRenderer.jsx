import React from 'react';

// Minimal markdown to HTML renderer used across the app for saved guides
export default function MarkdownRenderer({ content }) {
    if (!content) return null;
    const formattedContent = content
        .replace(/### (.*)/g, '<h3 class="text-xl font-semibold mt-4 mb-2">$1</h3>')
        .replace(/## (.*)/g, '<h2 class="text-2xl font-bold mt-6 mb-3">$1</h2>')
        .replace(/\*\*(.*)\*\*/g, '<strong>$1</strong>')
        .replace(/\* (.*)/g, '<li class="ml-5 list-disc">$1</li>')
        .replace(/(\d+)\. (.*)/g, '<li class="ml-5" style="list-style-type: decimal;">$2</li>')
        .replace(/\n/g, '<br />');

    return <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: formattedContent }} />;
}
