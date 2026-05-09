import React, { useEffect, useRef, useState } from 'react';
import socket from './socket/socket';
import Auth from './pages/Auth';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const AI_GROUPS = [
  {
    title: 'Engineering',
    items: [
      { label: 'Backend Expert', value: 'coding-backend', icon: '⚙️' },
      { label: 'Frontend Expert', value: 'coding-frontend', icon: '🎨' },
      { label: 'DevOps Expert', value: 'coding-devops', icon: '☁️' },
      { label: 'AI Engineer', value: 'coding-ai', icon: '🤖' },
      { label: 'Fullstack Expert', value: 'coding-fullstack', icon: '🧩' },
      { label: 'Mobile Expert', value: 'coding-mobile', icon: '📱' },
    ],
  },
  {
    title: 'Career',
    items: [
      { label: 'Resume Builder', value: 'resume', icon: '📄' },
      { label: 'System Design', value: 'system-design', icon: '🏗️' },
    ],
  },
  {
    title: 'Knowledge',
    items: [
      { label: 'General AI', value: 'general', icon: '🧠' },
      { label: 'Tech Intelligence', value: 'tech', icon: '🚀' },
      { label: 'Market Learning', value: 'market', icon: '📈' },
      { label: 'AI Product Expert', value: 'ai-engineer', icon: '🧬' },
    ],
  },
];

const FLAT_WORKSPACES = AI_GROUPS.flatMap((group) => group.items);

function App() {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [showAuth, setShowAuth] = useState(false);

  const [guestId] = useState(() => {
    let id = localStorage.getItem('guestId');

    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem('guestId', id);
    }

    return id;
  });

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'dark';
  });

  const [aiMode, setAiMode] = useState(() => {
    return localStorage.getItem('aiMode') || 'general';
  });

  const isDark = theme === 'dark';

  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [typing, setTyping] = useState(false);

  const [conversations, setConversations] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);

  const [showUpload, setShowUpload] = useState(false);
  const [file, setFile] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [documentMode, setDocumentMode] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [showShareModal, setShowShareModal] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [sharing, setSharing] = useState(false);

  const chatEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const selectedWorkspace =
    FLAT_WORKSPACES.find((item) => item.value === aiMode) || FLAT_WORKSPACES[0];

  const getAuthHeaders = () => ({
    Authorization: `Bearer ${localStorage.getItem('token')}`,
  });

  const rootClass = isDark
    ? 'bg-[#212121] text-[#ececec]'
    : 'bg-[#f7f7f8] text-[#171717]';

  const sidebarClass = isDark
    ? 'bg-[#171717] border-[#2f2f2f]'
    : 'bg-white border-[#e5e5e5]';

  const headerClass = isDark
    ? 'bg-[#212121]/95 border-[#2f2f2f]'
    : 'bg-white/95 border-[#e5e5e5]';

  const inputClass = isDark
    ? 'bg-[#2f2f2f] border-[#3f3f3f] text-white placeholder:text-slate-400'
    : 'bg-white border-[#dcdcdc] text-slate-950 placeholder:text-slate-500';

  useEffect(() => {
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('aiMode', aiMode);
  }, [aiMode]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  useEffect(() => {
    socket.off('guest_messages_loaded');
    socket.off('receive_message');
    socket.off('messages_updated');
    socket.off('conversation_updated');
    socket.off('ai_typing');
    socket.off('ai_stream_start');
    socket.off('ai_stream_chunk');
    socket.off('ai_stream_end');

    if (user) {
      fetchConversations();
      fetchDocuments();
    } else {
      setCurrentConversation({
        _id: 'guest-chat',
        title: 'Guest Chat',
      });

      socket.emit('guest_load_messages', { guestId });
    }

    socket.on('guest_messages_loaded', (data) => {
      setMessages(data.messages || []);
    });

    socket.on('receive_message', (data) => {
      setMessages((prev) => [...prev, data]);
    });

    socket.on('messages_updated', (data) => {
      setMessages(data.messages || []);
    });

    socket.on('conversation_updated', (updatedConversation) => {
      setConversations((prev) =>
        prev.map((conv) =>
          conv._id === updatedConversation._id ? updatedConversation : conv
        )
      );

      setCurrentConversation((prev) =>
        prev?._id === updatedConversation._id ? updatedConversation : prev
      );
    });

    socket.on('ai_typing', (status) => {
      setTyping(status);
    });

    socket.on('ai_stream_start', () => {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          content: '',
          isStreaming: true,
        },
      ]);
    });

    socket.on('ai_stream_chunk', (data) => {
      setMessages((prev) => {
        const updated = [...prev];
        const lastIndex = updated.length - 1;

        if (lastIndex >= 0 && updated[lastIndex].isStreaming) {
          updated[lastIndex] = {
            ...updated[lastIndex],
            content: updated[lastIndex].content + data.token,
          };
        }

        return updated;
      });
    });

    socket.on('ai_stream_end', (data) => {
      setMessages((prev) => {
        const updated = [...prev];
        const lastIndex = updated.length - 1;

        if (lastIndex >= 0 && updated[lastIndex].isStreaming) {
          updated[lastIndex] = {
            ...data.message,
            isStreaming: false,
          };
        }

        return updated;
      });
    });

    return () => {
      socket.off('guest_messages_loaded');
      socket.off('receive_message');
      socket.off('messages_updated');
      socket.off('conversation_updated');
      socket.off('ai_typing');
      socket.off('ai_stream_start');
      socket.off('ai_stream_chunk');
      socket.off('ai_stream_end');
    };
  }, [user]);

  const fetchConversations = async () => {
    const res = await fetch(`${API_URL}/api/conversations`, {
      headers: getAuthHeaders(),
    });

    const data = await res.json();
    setConversations(Array.isArray(data) ? data : []);
  };

  const fetchDocuments = async () => {
    const res = await fetch(`${API_URL}/api/documents`, {
      headers: getAuthHeaders(),
    });

    const data = await res.json();
    setDocuments(Array.isArray(data) ? data : []);
  };

  const createConversation = async () => {
    if (!user) {
      setShowAuth(true);
      return null;
    }

    const res = await fetch(`${API_URL}/api/conversations/create`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || 'Failed to create chat');
      return null;
    }

    setConversations((prev) => [data, ...prev]);
    setCurrentConversation(data);
    setMessages([]);

    return data;
  };

  const getOrCreateConversation = async () => {
    if (currentConversation?._id && currentConversation._id !== 'guest-chat') {
      return currentConversation;
    }

    if (!user) {
      return {
        _id: 'guest-chat',
        title: 'Guest Chat',
      };
    }

    const conversation = await createConversation();
    return conversation;
  };

  const loadMessages = async (conversation) => {
    setCurrentConversation(conversation);

    const res = await fetch(
      `${API_URL}/api/conversations/${conversation._id}/messages`,
      {
        headers: getAuthHeaders(),
      }
    );

    const data = await res.json();
    setMessages(Array.isArray(data) ? data : []);
  };

  const deleteConversation = async (conversationId) => {
    const ok = window.confirm('Delete this chat?');
    if (!ok) return;

    await fetch(`${API_URL}/api/conversations/${conversationId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    setConversations((prev) =>
      prev.filter((conv) => conv._id !== conversationId)
    );

    if (currentConversation?._id === conversationId) {
      setCurrentConversation(null);
      setMessages([]);
    }
  };

  const shareConversation = async () => {
    if (!user) {
      setShowAuth(true);
      return;
    }

    if (!currentConversation?._id || currentConversation._id === 'guest-chat') {
      alert('Please send a message first');
      return;
    }

    setSharing(true);

    const res = await fetch(
      `${API_URL}/api/conversations/${currentConversation._id}/share`,
      {
        method: 'POST',
        headers: getAuthHeaders(),
      }
    );

    const data = await res.json();

    setSharing(false);

    if (!res.ok) {
      alert(data.message || 'Share failed');
      return;
    }

    setShareUrl(data.shareUrl);
  };

  const deleteDocument = async (documentId) => {
    const ok = window.confirm('Delete this document?');
    if (!ok) return;

    const res = await fetch(`${API_URL}/api/documents/${documentId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || 'Delete failed');
      return;
    }

    setDocuments((prev) => prev.filter((doc) => doc._id !== documentId));

    if (selectedDoc?._id === documentId) {
      setSelectedDoc(null);
      setDocumentMode(false);
    }
  };

  const uploadDocument = async () => {
    if (!user) {
      setShowAuth(true);
      return;
    }

    if (!file) {
      alert('Please select a file');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);

    const res = await fetch(`${API_URL}/api/documents/upload`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: formData,
    });

    const data = await res.json();
    setUploading(false);

    if (!res.ok) {
      alert(data.message || 'Upload failed');
      return;
    }

    setDocuments((prev) => [data.document, ...prev]);
    setSelectedDoc(data.document);
    setDocumentMode(true);
    setShowUpload(false);
    setFile(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const askDocument = async (question) => {
    const res = await fetch(`${API_URL}/api/documents/${selectedDoc._id}/ask`, {
      method: 'POST',
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ question }),
    });

    const data = await res.json();

    if (!res.ok) {
      return data.message || 'Something went wrong';
    }

    return data.answer;
  };

  const sendMessage = async () => {
    if (!message.trim()) return;

    const userMessage = message;
    setMessage('');

    if (documentMode && selectedDoc) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'user',
          content: userMessage,
        },
        {
          sender: 'ai',
          content: 'Reading document and generating answer...',
          isStreaming: true,
        },
      ]);

      setTyping(true);

      const answer = await askDocument(userMessage);

      setMessages((prev) => {
        const updated = [...prev];
        const lastIndex = updated.length - 1;

        updated[lastIndex] = {
          sender: 'ai',
          content: answer,
          isStreaming: false,
        };

        return updated;
      });

      setTyping(false);
      return;
    }

    const conversation = await getOrCreateConversation();

    if (!conversation?._id) {
      return;
    }

    socket.emit('send_message', {
      conversationId: conversation._id,
      message: userMessage,
      guestId: user ? null : guestId,
      mode: aiMode,
    });
  };

  const copyMessage = async (content) => {
    await navigator.clipboard.writeText(content);
  };

  const cancelDocumentMode = () => {
    setSelectedDoc(null);
    setDocumentMode(false);
    setShowUpload(false);
    setFile(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    setUser(null);
    setMessages([]);
    setConversations([]);
    setCurrentConversation({
      _id: 'guest-chat',
      title: 'Guest Chat',
    });

    socket.emit('guest_load_messages', { guestId });
  };

  const handleLogin = async (loggedInUser) => {
    setUser(loggedInUser);
    setShowAuth(false);

    const token = localStorage.getItem('token');
    const savedGuestId = localStorage.getItem('guestId');

    if (savedGuestId && token) {
      await fetch(`${API_URL}/api/guest/migrate`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          guestId: savedGuestId,
        }),
      });

      localStorage.removeItem('guestId');
    }

    setMessages([]);
    setCurrentConversation(null);
    fetchConversations();
  };

  if (showAuth) {
    return (
      <div className={`w-full h-screen ${rootClass}`}>
        <button
          onClick={() => setShowAuth(false)}
          className="fixed top-5 left-5 z-50 rounded-lg bg-[#2f2f2f] px-4 py-2 text-white hover:bg-[#3f3f3f]"
        >
          ← Continue as Guest
        </button>

        <Auth onLogin={handleLogin} />
      </div>
    );
  }

  return (
    <div className={`flex h-screen w-full overflow-hidden ${rootClass}`}>
      <aside
        className={`hidden w-[300px] shrink-0 flex-col border-r md:flex ${sidebarClass}`}
      >
        <div className="flex h-14 items-center gap-3 px-4">
          <img src="/trinetra.svg" className="h-9 w-9 rounded-xl" />

          <div>
            <div className="font-semibold">Nexora AI</div>
            <div className="text-xs opacity-50">AI workspace</div>
          </div>
        </div>

        <div className="px-3 py-2">
          <button
            onClick={createConversation}
            className="w-full rounded-xl border border-white/10 bg-[#2f2f2f] px-4 py-3 text-left text-sm text-white hover:bg-[#3f3f3f]"
          >
            + New chat
          </button>
        </div>

        <div className="px-3 py-2">
          <div className="mb-2 px-2 text-xs font-medium uppercase tracking-wide opacity-50">
            AI Workspaces
          </div>

          <div className="max-h-[330px] overflow-y-auto pr-1">
            {AI_GROUPS.map((group) => (
              <div key={group.title} className="mb-3">
                <div className="mb-1 px-2 text-[11px] font-medium uppercase tracking-wide opacity-40">
                  {group.title}
                </div>

                <div className="space-y-1">
                  {group.items.map((workspace) => (
                    <button
                      key={workspace.value}
                      onClick={() => setAiMode(workspace.value)}
                      className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm transition ${
                        aiMode === workspace.value
                          ? 'bg-blue-600 text-white'
                          : isDark
                          ? 'hover:bg-[#2f2f2f]'
                          : 'hover:bg-slate-100'
                      }`}
                    >
                      <span>{workspace.icon}</span>
                      <span className="truncate">{workspace.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="px-3 pt-3">
          <div className="mb-2 px-2 text-xs font-medium uppercase tracking-wide opacity-50">
            Chats
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-1">
          {user ? (
            conversations.map((conv) => (
              <div
                key={conv._id}
                className={`group mb-1 flex cursor-pointer items-center justify-between rounded-xl px-3 py-2 text-sm ${
                  currentConversation?._id === conv._id
                    ? 'bg-[#2f2f2f]'
                    : 'hover:bg-[#2f2f2f]'
                }`}
              >
                <span
                  onClick={() => loadMessages(conv)}
                  className="flex-1 truncate"
                >
                  {conv.title}
                </span>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteConversation(conv._id);
                  }}
                  className="ml-2 opacity-0 hover:text-red-400 group-hover:opacity-100"
                >
                  🗑️
                </button>
              </div>
            ))
          ) : (
            <div className="rounded-xl bg-[#2f2f2f] px-3 py-2 text-sm">
              Guest chat
            </div>
          )}
        </div>

        <div className="border-t border-white/10 p-3 text-xs opacity-60">
          <div>
            Mode: {selectedWorkspace.icon} {selectedWorkspace.label}
          </div>

          <div className="mt-1">
            {user
              ? 'Chats are saved permanently.'
              : 'Guest chats expire in 24 hours.'}
          </div>
        </div>
      </aside>

      <main className="flex h-screen min-w-0 flex-1 flex-col">
        <header
          className={`flex h-14 shrink-0 items-center justify-between border-b px-4 ${headerClass}`}
        >
          <div className="flex items-center gap-3">
            <img src="/trinetra.svg" className="h-8 w-8 rounded-lg md:hidden" />

            <div>
              <div className="font-semibold">
                {documentMode && selectedDoc
                  ? `Chat with ${selectedDoc.originalName}`
                  : user
                  ? currentConversation?.title || 'New Chat'
                  : 'Guest Chat'}
              </div>

              <div className="text-xs opacity-60">
                {selectedWorkspace.icon} {selectedWorkspace.label}
                {!user && (
                  <span className="ml-2 text-yellow-400">Guest Mode</span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setTheme(isDark ? 'light' : 'dark')}
              className="rounded-lg bg-[#2f2f2f] px-3 py-2 text-sm text-white hover:bg-[#3f3f3f]"
            >
              {isDark ? 'Light' : 'Dark'}
            </button>

            {user && currentConversation?._id && currentConversation._id !== 'guest-chat' && (
              <button
                onClick={() => {
                  setShareUrl('');
                  setShowShareModal(true);
                }}
                className="rounded-lg bg-[#2f2f2f] px-3 py-2 text-sm text-white hover:bg-[#3f3f3f]"
              >
                Share
              </button>
            )}

            {user ? (
              <button
                onClick={logout}
                className="rounded-lg bg-red-600 px-3 py-2 text-sm text-white hover:bg-red-700"
              >
                Logout
              </button>
            ) : (
              <button
                onClick={() => setShowAuth(true)}
                className="rounded-lg bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700"
              >
                Login
              </button>
            )}
          </div>
        </header>

        <section className="min-h-0 flex-1 overflow-y-auto">
          <div className="mx-auto max-w-3xl px-4 py-8">
            {messages.length === 0 && (
              <div className="flex min-h-[65vh] flex-col items-center justify-center text-center">
                <img
                  src="/trinetra.svg"
                  className="mb-5 h-20 w-20 rounded-3xl"
                />

                <h1 className="mb-3 text-3xl font-semibold">
                  {selectedWorkspace.icon} {selectedWorkspace.label}
                </h1>

                <p className="max-w-md text-sm opacity-60">
                  Start typing directly. Nexora will automatically create a new
                  chat when you send your first message.
                </p>
              </div>
            )}

            {messages.map((msg, index) => (
              <div
                key={msg._id || index}
                className={`mb-6 flex ${
                  msg.sender === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-7 ${
                    msg.sender === 'user'
                      ? 'bg-[#2f2f2f] text-white'
                      : isDark
                      ? 'text-[#ececec]'
                      : 'text-slate-950'
                  }`}
                >
                  {msg.sender === 'ai' ? (
                    <div
                      className={
                        isDark
                          ? 'prose prose-invert max-w-none'
                          : 'prose max-w-none'
                      }
                    >
                      <ReactMarkdown
                        components={{
                          code({ inline, className, children, ...props }) {
                            const match = /language-(\w+)/.exec(
                              className || ''
                            );

                            return !inline && match ? (
                              <SyntaxHighlighter
                                language={match[1]}
                                PreTag="div"
                                {...props}
                              >
                                {String(children).replace(/\n$/, '')}
                              </SyntaxHighlighter>
                            ) : (
                              <code className="rounded bg-black px-1 text-white">
                                {children}
                              </code>
                            );
                          },
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <div className="whitespace-pre-wrap">{msg.content}</div>
                  )}

                  <div className="mt-3 flex justify-end">
                    <button
                      onClick={() => copyMessage(msg.content)}
                      className={`rounded-lg px-3 py-1.5 text-xs transition ${
                        isDark
                          ? 'bg-[#343434] text-slate-300 hover:bg-[#3f3f3f]'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      Copy
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {typing && (
              <div className="mb-6 text-sm opacity-60">
                Nexora is thinking...
              </div>
            )}

            <div ref={chatEndRef} />
          </div>
        </section>

        {showUpload && (
          <div className="mx-auto mb-3 w-full max-w-3xl px-4">
            <div
              className={`rounded-2xl border backdrop-blur-xl ${
                isDark
                  ? 'border-[#3a3a3a] bg-[#2a2a2a]/90'
                  : 'border-[#e5e5e5] bg-white'
              }`}
            >
              <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
                <div>
                  <div className="text-sm font-medium">Upload document</div>
                  <div className="mt-1 text-xs opacity-60">
                    PDF and TXT files supported
                  </div>
                </div>

                <button
                  onClick={cancelDocumentMode}
                  className={`rounded-lg px-3 py-1.5 text-sm transition ${
                    isDark ? 'hover:bg-[#3a3a3a]' : 'hover:bg-slate-100'
                  }`}
                >
                  ✕
                </button>
              </div>

              <div className="p-4">
                <label
                  className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed px-6 py-10 transition ${
                    isDark
                      ? 'border-[#4a4a4a] hover:bg-[#343434]'
                      : 'border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="mb-3 text-4xl">📄</div>

                  <div className="text-sm font-medium">
                    Click to upload document
                  </div>

                  <div className="mt-1 text-xs opacity-60">
                    PDF/TXT supported
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.txt"
                    onChange={(e) => setFile(e.target.files[0])}
                    className="hidden"
                  />
                </label>

                {file && (
                  <div
                    className={`mt-4 flex items-center justify-between rounded-xl px-4 py-3 ${
                      isDark ? 'bg-[#343434]' : 'bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-xl">📎</div>

                      <div>
                        <div className="text-sm font-medium">{file.name}</div>
                        <div className="text-xs opacity-60">
                          {(file.size / 1024).toFixed(1)} KB
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setFile(null);

                        if (fileInputRef.current) {
                          fileInputRef.current.value = '';
                        }
                      }}
                      className="text-sm text-red-400 hover:text-red-300"
                    >
                      Remove
                    </button>
                  </div>
                )}

                <div className="mt-4 flex items-center gap-3">
                  <button
                    onClick={uploadDocument}
                    disabled={uploading || !file}
                    className="rounded-xl bg-white px-5 py-2 text-sm font-medium text-black transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {uploading ? 'Uploading...' : 'Upload & Use'}
                  </button>

                  <button
                    onClick={cancelDocumentMode}
                    className={`rounded-xl px-5 py-2 text-sm transition ${
                      isDark
                        ? 'bg-[#343434] hover:bg-[#3f3f3f]'
                        : 'bg-slate-100 hover:bg-slate-200'
                    }`}
                  >
                    Cancel
                  </button>
                </div>

                {documents.length > 0 && (
                  <div className="mt-6">
                    <div className="mb-3 text-xs uppercase tracking-wide opacity-50">
                      Previous documents
                    </div>

                    <div className="space-y-2">
                      {documents.map((doc) => (
                        <div
                          key={doc._id}
                          onClick={() => {
                            setSelectedDoc(doc);
                            setDocumentMode(true);
                            setShowUpload(false);
                          }}
                          className={`flex w-full cursor-pointer items-center justify-between rounded-xl px-4 py-3 text-left transition ${
                            selectedDoc?._id === doc._id
                              ? 'bg-green-600 text-white'
                              : isDark
                              ? 'bg-[#343434] hover:bg-[#3d3d3d]'
                              : 'bg-slate-100 hover:bg-slate-200'
                          }`}
                        >
                          <div className="flex min-w-0 items-center gap-3">
                            <div className="text-lg">📄</div>

                            <div className="min-w-0">
                              <div className="truncate text-sm font-medium">
                                {doc.originalName}
                              </div>

                              <div className="text-xs opacity-60">
                                Click to use
                              </div>
                            </div>
                          </div>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteDocument(doc._id);
                            }}
                            className="ml-3 rounded-lg px-2 py-1 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300"
                            title="Delete document"
                          >
                            🗑️
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {documentMode && selectedDoc && (
          <div className="mx-auto mb-3 w-full max-w-3xl px-4">
            <div
              className={`flex items-center justify-between rounded-2xl border px-4 py-3 ${
                isDark
                  ? 'border-green-500/20 bg-green-500/10'
                  : 'border-green-300 bg-green-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="text-xl">📄</div>

                <div>
                  <div className="text-sm font-medium">
                    Chatting with document
                  </div>

                  <div className="text-xs opacity-60">
                    {selectedDoc.originalName}
                  </div>
                </div>
              </div>

              <button
                onClick={cancelDocumentMode}
                className={`rounded-lg px-3 py-2 text-sm transition ${
                  isDark
                    ? 'bg-[#343434] hover:bg-[#3d3d3d]'
                    : 'bg-white hover:bg-slate-100'
                }`}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <footer className={`shrink-0 border-t px-4 py-3 ${headerClass}`}>
          <div className="mx-auto flex max-w-3xl items-center gap-2">
            <button
              onClick={() => {
                if (!user) {
                  setShowAuth(true);
                  return;
                }

                setShowUpload(true);
              }}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#2f2f2f] text-xl text-white hover:bg-[#3f3f3f]"
            >
              +
            </button>

            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') sendMessage();
              }}
              placeholder={`Message ${selectedWorkspace.label}...`}
              className={`h-11 flex-1 rounded-xl border px-4 text-sm outline-none ${inputClass}`}
            />

            <button
              onClick={sendMessage}
              className="h-11 rounded-xl bg-white px-5 text-sm font-medium text-black hover:bg-slate-200"
            >
              Send
            </button>
          </div>
        </footer>
      </main>

      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div
            className={`w-full max-w-md rounded-2xl border p-5 shadow-2xl ${
              isDark
                ? 'border-[#3a3a3a] bg-[#2a2a2a] text-white'
                : 'border-slate-200 bg-white text-slate-950'
            }`}
          >
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">Share chat</h2>

                <p className="mt-1 text-sm opacity-60">
                  Anyone with this link can view this chat.
                </p>
              </div>

              <button
                onClick={() => {
                  setShowShareModal(false);
                  setShareUrl('');
                }}
                className={`rounded-lg px-3 py-1 text-lg ${
                  isDark ? 'hover:bg-[#3a3a3a]' : 'hover:bg-slate-100'
                }`}
              >
                ×
              </button>
            </div>

            {!shareUrl ? (
              <button
                onClick={shareConversation}
                disabled={sharing}
                className="w-full rounded-xl bg-white px-4 py-3 text-sm font-medium text-black hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {sharing ? 'Creating link...' : 'Create public link'}
              </button>
            ) : (
              <>
                <div
                  className={`mb-3 rounded-xl border px-3 py-3 text-sm break-all ${
                    isDark
                      ? 'border-[#3a3a3a] bg-[#171717]'
                      : 'border-slate-200 bg-slate-50'
                  }`}
                >
                  {shareUrl}
                </div>

                <button
                  onClick={async () => {
                    await navigator.clipboard.writeText(shareUrl);
                    alert('Link copied');
                  }}
                  className="w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-medium text-white hover:bg-blue-700"
                >
                  Copy link
                </button>

                <div className="mt-3 grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      const text = encodeURIComponent(
                        `Check this AI chat: ${shareUrl}`
                      );

                      window.open(`https://wa.me/?text=${text}`, '_blank');
                    }}
                    className="rounded-xl bg-green-600 px-4 py-3 text-sm font-medium text-white hover:bg-green-700"
                  >
                    WhatsApp
                  </button>

                  <button
                    onClick={() => {
                      const url = encodeURIComponent(shareUrl);

                      window.open(
                        `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
                        '_blank'
                      );
                    }}
                    className="rounded-xl bg-[#0077B5] px-4 py-3 text-sm font-medium text-white hover:bg-[#006399]"
                  >
                    LinkedIn
                  </button>
                </div>
              </>
            )}

            <button
              onClick={() => {
                setShowShareModal(false);
                setShareUrl('');
              }}
              className={`mt-3 w-full rounded-xl px-4 py-3 text-sm ${
                isDark
                  ? 'bg-[#343434] hover:bg-[#3f3f3f]'
                  : 'bg-slate-100 hover:bg-slate-200'
              }`}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;