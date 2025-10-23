import React, { useState, useEffect, useContext, useCallback } from 'react';
import api from '../api/axiosConfig';
import Button from '../components/common/Button';
import MarkdownRenderer from '../components/common/MarkdownRenderer';
import { AuthContext } from '../components/context/ui/authContextValue.jsx';
import { useNavigate } from 'react-router-dom';
import { Send, Cpu, Plus, MessageSquare, AlertTriangle, Edit2, Trash2 } from 'lucide-react';
import Modal from '../components/common/modal';
import { useToast } from '../components/common/useToast';

const TypingIndicator = () => (
    <div className="flex items-start gap-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-200 text-green-600 flex-shrink-0">
            <Cpu size={24} />
        </div>
        <div className="px-4 py-4 bg-white rounded-xl rounded-bl-none shadow-sm border border-gray-100">
            <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
            </div>
        </div>
    </div>
);

const ChatSidebar = ({ conversations, activeId, setActiveId, createNewChat, onRename, onDelete }) => (
    <div className="w-64 bg-gray-50 border-r border-gray-200 flex flex-col h-full">
        <div className="p-4 border-b border-gray-200">
            <Button onClick={createNewChat} className="w-full flex items-center justify-center gap-2">
                <Plus size={18} />
                New Chat
            </Button>
        </div>
        <nav className="flex-grow overflow-y-auto p-2 space-y-1">
            {conversations.map(convo => (
                <div key={convo.id} className={`group flex items-center justify-between gap-3 px-3 py-2 rounded-lg transition-colors text-sm ${
                        activeId === convo.id ? 'bg-green-100 text-green-800' : 'text-gray-600 hover:bg-gray-100'
                    }`}>
                    <a
                        href="#"
                        onClick={(e) => { e.preventDefault(); setActiveId(convo.id); }}
                        className="flex items-center gap-3 flex-grow min-w-0" 
                    >
                        <MessageSquare size={16} className="flex-shrink-0" />
                        <span className="truncate">{convo.title}</span>
                    </a>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity flex-shrink-0">
                        <button title="Rename" onClick={() => onRename(convo)} className="p-1 rounded hover:bg-gray-100" aria-label={`Rename ${convo.title}`}>
                            <Edit2 size={14} className="text-gray-500 hover:text-gray-800" />
                        </button>
                        <button title="Delete" onClick={() => onDelete(convo)} className="p-1 rounded hover:bg-red-50" aria-label={`Delete ${convo.title}`}>
                            <Trash2 size={14} className="text-red-500 hover:text-red-700" />
                        </button>
                    </div>
                </div>
            ))}
        </nav>
    </div>
);

const AiGuideChatPage = () => {
    const [conversations, setConversations] = useState([]);
    const [activeConversationId, setActiveConversationId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isFetchingConvos, setIsFetchingConvos] = useState(true);
    const [fetchError, setFetchError] = useState(null);
    
    const auth = useContext(AuthContext);
    const navigate = useNavigate();

    const createNewChat = useCallback(() => {
        setActiveConversationId(null);
        setMessages([
            { role: 'model', content: "Hi! I'm Fixie. What can I help you repair today?" }
        ]);
    }, []);

    useEffect(() => {
        if (auth.loading) return;
        if (!auth.isLoggedIn) {
            navigate(`/login?next=${encodeURIComponent('/generate-guide')}`);
            return;
        }

        const fetchConversations = async () => {
            setIsFetchingConvos(true);
            setFetchError(null);
            try {
                const res = await api.get('/guides/conversations');
                const convs = res.data || [];
                setConversations(convs);
                if (convs.length > 0) {
                    setActiveConversationId(convs[0].id);
                } else {
                    createNewChat();
                }
            } catch (err) {
                console.error('Failed to fetch conversations:', err);
                setFetchError('Could not load your conversations. Please try refreshing the page.');
            } finally {
                setIsFetchingConvos(false);
            }
        };
        fetchConversations();
    }, [auth.loading, auth.isLoggedIn, navigate, createNewChat]);

    useEffect(() => {
        if (!activeConversationId) return;
        const fetchMessages = async () => {
            try {
                const res = await api.get(`/guides/conversations/${activeConversationId}/messages`);
                setMessages(res.data || []);
            } catch (err) {
                console.error('Failed to load conversation messages', err);
                setMessages([]);
            }
        };
        fetchMessages();
    }, [activeConversationId]);

    

    const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
    const [saveTitle, setSaveTitle] = useState('');
    const [saveCategory, setSaveCategory] = useState('Other');
    const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
    const [renameTarget, setRenameTarget] = useState(null);
    const [renameTitle, setRenameTitle] = useState('');

    const toast = useToast();

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);

    const openSaveModal = () => {
        if (!messages || messages.length === 0) {
            alert('There are no messages to save. Start a conversation before saving.');
            return;
        }
        setSaveTitle('');
        setSaveCategory('Other'); 
        setIsSaveModalOpen(true);
    };

    const closeSaveModal = () => {
        setIsSaveModalOpen(false);
        setSaveTitle('');
        setSaveCategory('Other'); 
    };

    const openRenameModal = (convo) => {
        setRenameTarget(convo);
        setRenameTitle(convo?.title || '');
        setIsRenameModalOpen(true);
    };

    const closeRenameModal = () => {
        setIsRenameModalOpen(false);
        setRenameTarget(null);
        setRenameTitle('');
    };

    const submitRename = async () => {
        if (!renameTarget) return;
        const id = renameTarget.id;
        const title = renameTitle?.trim();
        if (!title) return;
        try {
            closeRenameModal();
            const res = await api.put(`/guides/conversations/${id}`, { title });
            const updated = res.data;
            setConversations(prev => prev.map(c => c.id === id ? updated : c));
            toast.success({ title: 'Renamed', message: `Conversation renamed to "${title}".` });
        } catch (err) {
            console.error('Failed to rename conversation', err);
            toast.error({ title: 'Rename failed', message: 'Failed to rename conversation.' });
        }
    };

    const openDeleteModal = (convo) => {
        setDeleteTarget(convo);
        setIsDeleteModalOpen(true);
    };

    const closeDeleteModal = () => {
        setDeleteTarget(null);
        setIsDeleteModalOpen(false);
    };

    const confirmDelete = async () => {
        const convo = deleteTarget;
        if (!convo) return closeDeleteModal();
        try {
            closeDeleteModal();
            setIsRenameModalOpen(false);
            setIsSaveModalOpen(false);
            await api.delete(`/guides/conversations/${convo.id}`);
            setConversations(prev => prev.filter(c => c.id !== convo.id));
            if (activeConversationId === convo.id) {
                createNewChat();
            }
            toast.success({ title: 'Deleted', message: `Conversation "${convo.title}" deleted.` });
        } catch (err) {
            console.error('Failed to delete conversation', err);
            toast.error({ title: 'Delete failed', message: 'Could not delete conversation.' });
        }
    };

    const [saveError, setSaveError] = useState('');
    const MAX_TITLE_LENGTH = 100;

    const saveConversation = async (titleFromModal) => {
        const title = (titleFromModal || saveTitle || '').trim();
        
        const category = saveCategory;

        if (!messages || messages.length === 0) {
            setSaveError('Cannot save an empty conversation.');
            return;
        }
        if (!title) {
            setSaveError('Please enter a conversation name.');
            return;
        }
        if (!category || category === '') {
            setSaveError('Please select a category.');
            return;
        }
        if (title.length > MAX_TITLE_LENGTH) {
            setSaveError(`Title must be at most ${MAX_TITLE_LENGTH} characters.`);
            return;
        }
        setSaveError('');
        try {
            closeSaveModal();
            const res = await api.post('/guides/conversations', { 
                title: title.trim(),
                category: category
            });
            
            const conv = res.data;
            await api.post(`/guides/conversations/${conv.id}/messages`, { messages });
            setConversations(prev => [conv, ...prev]);
            setActiveConversationId(conv.id);
            toast.success({ title: 'Saved', message: `Conversation "${title}" saved.` });
        } catch (err) {
            console.error('Failed to save conversation', err);
            toast.error({ title: 'Save failed', message: 'Failed to save conversation. Please try again.' });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;
        const userMessage = { role: 'user', content: input };
        const newMessages = [...messages, userMessage];
        setMessages(newMessages);
        setInput('');
        setIsLoading(true);

        try {
            const response = await api.post('/guides/chat', { 
                messages: newMessages,
                conversation_id: activeConversationId
            });
            const data = response.data;
            const newAiMessage = data.message;
            setMessages(prev => [...prev, newAiMessage]);
            setConversations(prev => prev.map(c => c.id === activeConversationId ? { ...c } : c));
        } catch (err) {
            console.error('Chat error:', err);
            const errorMessage = err.response?.data?.msg || err.message || 'An unexpected error occurred.';
            setMessages(prev => [...prev, { role: 'model', content: `**Error:** ${errorMessage}` }]);
        } finally {
            setIsLoading(false);
        }
    };

    if (isFetchingConvos) {
        return <div className="flex items-center justify-center h-full">Loading conversations...</div>;
    }

    if (fetchError) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-red-600">
                <AlertTriangle size={48} className="mb-4" />
                <h2 className="text-xl font-semibold">Something went wrong</h2>
                <p>{fetchError}</p>
            </div>
        );
    }

    return (
        <>
        <div className="flex w-full h-[calc(100vh-150px)]">
            <ChatSidebar 
                conversations={conversations}
                activeId={activeConversationId}
                setActiveId={setActiveConversationId}
                createNewChat={createNewChat}
                onRename={openRenameModal}
                onDelete={openDeleteModal}
            />
            <div className="flex flex-col flex-grow bg-white">
                <div className="chat-header flex items-center justify-between p-4 border-b border-gray-100">
                    <div className="chat-title text-lg font-semibold">AI Repair Assistant</div>
                    <div className="chat-actions flex items-center gap-2">
                        <Button onClick={createNewChat} className="!py-2">New Chat</Button>
                        {messages && messages.length > 0 && auth?.isLoggedIn && (
                            <Button onClick={openSaveModal} className="!py-2 !bg-green-600">Save Conversation</Button>
                        )}
                    </div>
                </div>
                <main className="flex-grow overflow-y-auto p-6 space-y-6">
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex items-start gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            {msg.role === 'model' && (
                                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-200 text-green-600 flex-shrink-0">
                                    <Cpu size={24} />
                                </div>
                            )}
                            <div className={`max-w-prose p-4 rounded-xl shadow-sm ${
                                msg.role === 'user' 
                                ? 'bg-green-600 text-white rounded-br-none' 
                                : 'bg-white text-gray-800 rounded-bl-none border border-gray-100'
                            }`}>
                                <MarkdownRenderer content={msg.content} textColor={msg.role === 'user' ? 'text-white' : 'text-gray-800'} />
                            </div>
                        </div>
                    ))}
                    {isLoading && <TypingIndicator />}
                </main>
                <footer className="p-4 bg-white border-t border-gray-200">
                    <form onSubmit={handleSubmit} className="max-w-3xl mx-auto flex gap-3">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder={isLoading ? 'Fixie is typing...' : 'Ask for repair help...'}
                            className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:outline-none transition-shadow bg-white shadow-sm"
                            disabled={isLoading}
                            autoFocus
                        />
                        <Button type="submit" disabled={isLoading || !input.trim()} size="lg" className="!py-3 flex items-center gap-2">
                            <span>Send</span>
                            <Send size={18} />
                        </Button>
                    </form>
                </footer>
            </div>
    </div>
        <Modal isOpen={isSaveModalOpen} onClose={closeSaveModal} title="Save Conversation">
            <div className="space-y-3">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Conversation name</label>
                    <input
                        className="w-full px-3 py-2 border border-gray-300 rounded-md mt-1"
                        value={saveTitle}
                        onChange={(e) => setSaveTitle(e.target.value)}
                        placeholder="Give this conversation a name"
                        autoFocus
                    />
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-gray-700">Item Category</label>
                    <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-md mt-1"
                        value={saveCategory}
                        onChange={(e) => setSaveCategory(e.target.value)}
                    >
                        <option value="Other">Other</option>
                        <option value="Electronics">Electronics</option>
                        <option value="Furniture">Furniture</option>
                        <option value="Clothing">Clothing</option>
                    </select>
                    <p className="text-xs text-gray-500 mt-1">Select a category for AI estimation.</p>
                </div>

                {saveError && <div className="text-sm text-red-600">{saveError}</div>}
                <div className="flex justify-between items-center gap-2 pt-2">
                    <div className="text-xs text-gray-500">Max {MAX_TITLE_LENGTH} chars</div>
                    <div className="flex justify-end gap-2">
                        <Button onClick={closeSaveModal}>Cancel</Button>
                        <Button 
                            onClick={() => saveConversation(saveTitle)} 
                            className="!bg-green-600" 
                            disabled={!!saveError || !(saveTitle && saveTitle.trim()) || !saveCategory}
                        >
                            Save
                        </Button>
                    </div>
                </div>
            </div>
        </Modal>
        <Modal isOpen={isRenameModalOpen} onClose={closeRenameModal} title="Rename Conversation">
            <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">New name</label>
                <input
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={renameTitle}
                    onChange={(e) => setRenameTitle(e.target.value)}
                    placeholder="Conversation name"
                    autoFocus
                />
                <div className="flex justify-end gap-2">
                    <Button onClick={closeRenameModal}>Cancel</Button>
                    <Button onClick={submitRename} className="!bg-green-600">Rename</Button>
                </div>
            </div>
        </Modal>
        <Modal isOpen={isDeleteModalOpen} onClose={closeDeleteModal} title="Delete Conversation">
            <div className="space-y-4">
                <p className="text-sm text-gray-700">Are you sure you want to delete the conversation <strong>{deleteTarget?.title}</strong>? This action cannot be undone.</p>
                <div className="flex justify-end gap-2">
                    <Button onClick={closeDeleteModal}>Cancel</Button>
                    <Button onClick={confirmDelete} className="!bg-red-600">Delete</Button>
                </div>
            </div>
        </Modal>
        </>
    );
};

export default AiGuideChatPage;