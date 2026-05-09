import React, { useEffect, useState } from 'react';
const API_URL = import.meta.env.VITE_API_URL;

function DocumentPanel() {
  const [documents, setDocuments] = useState([]);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [file, setFile] = useState(null);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');

    return {
      Authorization: `Bearer ${token}`,
    };
  };

  const fetchDocuments = async () => {
    const res = await fetch(`${API_URL}/api/documents`, {
      headers: getAuthHeaders(),
    });

    const data = await res.json();
    setDocuments(data);
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const uploadDocument = async () => {
    if (!file) {
      alert('Please select a file');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    setLoading(true);

    const res = await fetch(`${API_URL}/api/documents/upload`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: formData,
    });

    const data = await res.json();

    setLoading(false);

    if (!res.ok) {
      alert(data.message || 'Upload failed');
      return;
    }

    setFile(null);
    setDocuments((prev) => [data.document, ...prev]);
    setSelectedDoc(data.document);
    alert('Document uploaded successfully');
  };

  const askDocument = async () => {
    if (!selectedDoc) {
      alert('Please select document');
      return;
    }

    if (!question.trim()) {
      alert('Please enter question');
      return;
    }

    setLoading(true);
    setAnswer('');

    const res = await fetch(
      `${API_URL}/api/documents/${selectedDoc._id}/ask`,
      {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question,
        }),
      }
    );

    const data = await res.json();

    setLoading(false);

    if (!res.ok) {
      alert(data.message || 'Something went wrong');
      return;
    }

    setAnswer(data.answer);
  };

  return (
    <div className="bg-slate-900 border-l border-slate-800 w-96 p-4 overflow-y-auto">
      <h2 className="text-xl font-bold mb-4">Document Chat</h2>

      <div className="mb-4">
        <input
          type="file"
          accept=".pdf,.txt"
          onChange={(e) => setFile(e.target.files[0])}
          className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-sm"
        />

        <button
          onClick={uploadDocument}
          disabled={loading}
          className="w-full mt-3 bg-green-600 hover:bg-green-700 rounded-lg py-2"
        >
          {loading ? 'Processing...' : 'Upload Document'}
        </button>
      </div>

      <div className="mb-4">
        <h3 className="font-semibold mb-2">Uploaded Documents</h3>

        <div className="space-y-2">
          {documents.map((doc) => (
            <div
              key={doc._id}
              onClick={() => {
                setSelectedDoc(doc);
                setAnswer('');
              }}
              className={`p-2 rounded-lg cursor-pointer text-sm ${
                selectedDoc?._id === doc._id
                  ? 'bg-blue-700'
                  : 'bg-slate-800 hover:bg-slate-700'
              }`}
            >
              {doc.originalName}
            </div>
          ))}
        </div>
      </div>

      {selectedDoc && (
        <div className="mb-4 text-sm text-slate-300">
          Selected: <span className="text-white">{selectedDoc.originalName}</span>
        </div>
      )}

      <textarea
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="Ask from selected document..."
        rows={4}
        className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 outline-none"
      />

      <button
        onClick={askDocument}
        disabled={loading}
        className="w-full mt-3 bg-blue-600 hover:bg-blue-700 rounded-lg py-2"
      >
        {loading ? 'Thinking...' : 'Ask Document'}
      </button>

      {answer && (
        <div className="mt-4 bg-slate-800 rounded-xl p-4 text-sm whitespace-pre-wrap">
          {answer}
        </div>
      )}
    </div>
  );
}

export default DocumentPanel;