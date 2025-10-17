import React from 'react';

export default function MarkdownRenderer({ content }) {
    if (!content) return null;

    const lines = content.replace(/\r\n/g, '\n').split('\n');
    const nodes = [];
    let keyCounter = 0;
    let i = 0;

    const flushParagraph = (buf) => {
        if (!buf) return null;
        const text = buf.join(' ');
        return (
            <p key={`md-p-${keyCounter++}`} className="leading-relaxed text-base text-gray-700">{renderInline(text)}</p>
        );
    };

    function renderInline(text) {
        const parts = [];
        let remaining = text;
        const boldRe = /\*\*(.+?)\*\*/;
        while (true) {
            const m = remaining.match(boldRe);
            if (!m) break;
            const [match, boldText] = m;
            const idx = m.index;
            if (idx > 0) parts.push(remaining.slice(0, idx));
            parts.push(<strong key={parts.length} className="font-semibold">{boldText}</strong>);
            remaining = remaining.slice(idx + match.length);
        }
        if (remaining) parts.push(remaining);

        return parts.map((part, idx) => {
            if (typeof part !== 'string') return <React.Fragment key={idx}>{part}</React.Fragment>;
    
            const segments = [];
            let rem = part;
            const codeRe = /`([^`]+?)`/;
            while (true) {
                const cm = rem.match(codeRe);
                if (!cm) break;
                const [full, code] = cm;
                const pos = cm.index;
                if (pos > 0) segments.push(rem.slice(0, pos));
                segments.push(<code key={segments.length} className="bg-gray-100 px-1 py-0.5 rounded text-sm">{code}</code>);
                rem = rem.slice(pos + full.length);
            }
            if (rem) segments.push(rem);
            return <React.Fragment key={idx}>{segments}</React.Fragment>;
        });
    }

    while (i < lines.length) {
        const line = lines[i].trimRight();

        if (line.startsWith('```')) {
            i++;
            const codeLines = [];
            while (i < lines.length && !lines[i].startsWith('```')) {
                codeLines.push(lines[i]);
                i++;
            }
            i++;
            nodes.push(
                <pre key={`md-pre-${keyCounter++}`} className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto"><code>{codeLines.join('\n')}</code></pre>
            );
            continue;
        }

       
        if (/^##\s+/.test(line)) {
            const text = line.replace(/^##\s+/, '').trim();
            nodes.push(<h2 key={`md-h2-${keyCounter++}`} className="text-2xl font-bold mt-6 mb-2 text-gray-800">{text}</h2>);
            i++;
            continue;
        }
        if (/^###\s+/.test(line)) {
            const text = line.replace(/^###\s+/, '').trim();
            nodes.push(<h3 key={`md-h3-${keyCounter++}`} className="text-xl font-semibold mt-4 mb-2 text-gray-800">{text}</h3>);
            i++;
            continue;
        }

    
        if (/^>\s+/.test(line)) {
            const text = line.replace(/^>\s+/, '').trim();
            nodes.push(<blockquote key={`md-bq-${keyCounter++}`} className="pl-4 border-l-4 border-gray-200 italic text-gray-700">{renderInline(text)}</blockquote>);
            i++;
            continue;
        }

     
        if (/^(\d+)\.\s+/.test(line) || /^[-*+]\s+/.test(line)) {
            const isOrdered = /^(\d+)\./.test(line);
            const items = [];
            while (i < lines.length && (isOrdered ? /^(\d+)\.\s+/.test(lines[i].trim()) : /^[-*+]\s+/.test(lines[i].trim()))) {
                const cur = lines[i].trim();
                const itemText = cur.replace(/^(?:\d+\.|[-*+])\s+/, '').trim();
                items.push(itemText);
                i++;
            }

            if (isOrdered) {
                const listKey = `md-ol-${keyCounter++}`;
                nodes.push(
                    <ol key={listKey} className="list-decimal list-inside pl-2 space-y-2 text-gray-700">
                        {items.map((it, idx) => (
                            <li key={`${listKey}-li-${idx}`} className="leading-relaxed">{renderInline(it)}</li>
                        ))}
                    </ol>
                );
            } else {
                const listKey = `md-ul-${keyCounter++}`;
                nodes.push(
                    <ul key={listKey} className="list-disc list-inside pl-2 space-y-2 text-gray-700">
                        {items.map((it, idx) => (
                            <li key={`${listKey}-li-${idx}`} className="leading-relaxed">{renderInline(it)}</li>
                        ))}
                    </ul>
                );
            }
            continue;
        }

        if (line === '') {
        
            i++;
            continue;
        }

    
        const paraBuf = [line];
        i++;
        while (i < lines.length && lines[i].trim() !== '' && !/^(##|###|>|```|\d+\.|[-*+])\s+/.test(lines[i])) {
            paraBuf.push(lines[i].trim());
            i++;
        }
        nodes.push(flushParagraph(paraBuf));
    }

    return <div className="prose prose-lg max-w-none text-gray-800">{nodes}</div>;
}
