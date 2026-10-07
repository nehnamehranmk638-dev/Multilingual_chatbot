import React, { useState, useEffect } from 'react';

const API_BASE = 'http://127.0.0.1:8000/api/admin';

export default function AdminDashboard({ onLogout }) {
  const [activeTab, setActiveTab] = useState('analytics'); // Default to Analytics tab
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Analytics State
  const [analytics, setAnalytics] = useState(null);

  // KB State
  const [kbDocs, setKbDocs] = useState([]);
  const [kbModalOpen, setKbModalOpen] = useState(false);
  const [currentDoc, setCurrentDoc] = useState({ id: null, title: '', content: '', category: '', language: 'en', source: '', verified: false });

  // Escalations State
  const [escalations, setEscalations] = useState([]);
  const [escModalOpen, setEscModalOpen] = useState(false);
  const [selectedEscalation, setSelectedEscalation] = useState(null);
  const [resolutionNotes, setResolutionNotes] = useState('');

  // Feedback State
  const [feedbackList, setFeedbackList] = useState([]);

  const adminToken = localStorage.getItem('adminToken') || '';

  const authHeaders = {
    'Authorization': `Bearer ${adminToken}`,
    'Content-Type': 'application/json',
  };

  const handleApiError = (err) => {
    if (err.message === 'Unauthorized' || err.status === 401) {
      handleLogout();
    } else {
      setError(err.message || 'Action failed.');
    }
  };

  // ----------------------------------------------------
  // Load Tab Data
  // ----------------------------------------------------
  const loadAnalytics = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/analytics/`, { headers: authHeaders });
      if (res.status === 401) throw new Error('Unauthorized');
      if (!res.ok) throw new Error('Failed to fetch analytics');
      const data = await res.json();
      setAnalytics(data);
    } catch (err) {
      handleApiError(err);
    } finally {
      setLoading(false);
    }
  };

  const loadKb = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/kb/`, { headers: authHeaders });
      if (res.status === 401) throw new Error('Unauthorized');
      if (!res.ok) throw new Error('Failed to fetch knowledge base');
      const data = await res.json();
      setKbDocs(data);
    } catch (err) {
      handleApiError(err);
    } finally {
      setLoading(false);
    }
  };

  const loadEscalations = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/escalations/`, { headers: authHeaders });
      if (res.status === 401) throw new Error('Unauthorized');
      if (!res.ok) throw new Error('Failed to fetch escalations');
      const data = await res.json();
      setEscalations(data);
    } catch (err) {
      handleApiError(err);
    } finally {
      setLoading(false);
    }
  };

  const loadFeedback = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/feedback/`, { headers: authHeaders });
      if (res.status === 401) throw new Error('Unauthorized');
      if (!res.ok) throw new Error('Failed to fetch feedback');
      const data = await res.json();
      setFeedbackList(data);
    } catch (err) {
      handleApiError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'analytics') loadAnalytics();
    else if (activeTab === 'kb') loadKb();
    else if (activeTab === 'escalations') loadEscalations();
    else if (activeTab === 'feedback') loadFeedback();
  }, [activeTab]);

  // ----------------------------------------------------
  // KB Actions
  // ----------------------------------------------------
  const handleSaveKb = async (e) => {
    e.preventDefault();
    try {
      const url = currentDoc.id
        ? `${API_BASE}/kb/${currentDoc.id}/`
        : `${API_BASE}/kb/create/`;
      const method = currentDoc.id ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: authHeaders,
        body: JSON.stringify(currentDoc),
      });

      if (!res.ok) throw new Error('Failed to save document');
      setKbModalOpen(false);
      loadKb();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteKb = async (docId) => {
    if (!window.confirm('Delete this knowledge base document?')) return;
    try {
      const res = await fetch(`${API_BASE}/kb/${docId}/delete/`, {
        method: 'DELETE',
        headers: authHeaders,
      });
      if (!res.ok) throw new Error('Failed to delete document');
      loadKb();
    } catch (err) {
      alert(err.message);
    }
  };

  // ----------------------------------------------------
  // Escalation Actions
  // ----------------------------------------------------
  const handleResolveEscalation = async (e) => {
    e.preventDefault();
    if (!selectedEscalation) return;
    try {
      const res = await fetch(`${API_BASE}/escalations/${selectedEscalation._id}/resolve/`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({ resolution_notes: resolutionNotes }),
      });
      if (!res.ok) throw new Error('Failed to resolve escalation');
      setEscModalOpen(false);
      setResolutionNotes('');
      loadEscalations();
    } catch (err) {
      alert(err.message);
    }
  };

  // ----------------------------------------------------
  // Logout
  // ----------------------------------------------------
  const handleLogout = async () => {
    try {
      await fetch('http://127.0.0.1:8000/api/admin/logout/', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${adminToken}` },
      });
    } catch {}
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    if (onLogout) onLogout();
  };

  return (
    <div className="admin-container" style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto', color: '#1e293b' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', background: '#ffffff', padding: '16px 24px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '1.8rem' }}>🏛️</span>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.35rem', color: '#1a73e8', fontWeight: 700 }}>IIIT Kottayam • Chatbot Admin</h1>
            <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748b' }}>Authorized Administrator Dashboard</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <a href="/chat" style={{ color: '#2563eb', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 600, padding: '8px 14px', border: '1px solid #cbd5e1', borderRadius: '8px' }}>
            💬 Open Chatbot
          </a>
          <button onClick={handleLogout} style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem' }}>
            🚪 Logout
          </button>
        </div>
      </div>

      {error && (
        <div style={{ background: '#fee2e2', border: '1px solid #f87171', color: '#b91c1c', padding: '12px', borderRadius: '8px', marginBottom: '16px' }}>
          {error}
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        {[
          { id: 'analytics', label: '📊 Analytics' },
          { id: 'kb', label: '📚 Knowledge Base' },
          { id: 'escalations', label: '🚨 Escalations' },
          { id: 'feedback', label: '💬 User Feedback' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '10px 20px',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: '0.9rem',
              background: activeTab === tab.id ? '#1a73e8' : '#e2e8f0',
              color: activeTab === tab.id ? '#ffffff' : '#475569',
              transition: 'all 0.2s',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Analytics */}
      {activeTab === 'analytics' && (
        <div style={{ background: '#ffffff', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ margin: 0, fontSize: '1.2rem', color: '#1e293b' }}>Analytics Overview</h2>
            <button onClick={loadAnalytics} style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.82rem' }}>
              🔄 Refresh
            </button>
          </div>

          {loading && !analytics ? (
            <p style={{ color: '#64748b' }}>Loading analytics metrics...</p>
          ) : analytics ? (
            <div>
              {/* KPI Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', marginBottom: '24px' }}>
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '16px', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#1a73e8' }}>{analytics.total_queries}</div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px' }}>Total Queries</div>
                </div>
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '16px', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#1a73e8' }}>{analytics.unique_sessions}</div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px' }}>Unique Sessions</div>
                </div>
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderLeft: '4px solid #10b981', borderRadius: '10px', padding: '16px', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#10b981' }}>{analytics.feedback?.helpful || 0}</div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px' }}>Helpful Feedback</div>
                </div>
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderLeft: '4px solid #ef4444', borderRadius: '10px', padding: '16px', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#ef4444' }}>{analytics.feedback?.not_helpful || 0}</div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px' }}>Not Helpful</div>
                </div>
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderLeft: '4px solid #f59e0b', borderRadius: '10px', padding: '16px', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#f59e0b' }}>{analytics.escalations?.pending || 0}</div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px' }}>Pending Escalations</div>
                </div>
              </div>

              {/* Language breakdown */}
              <h3 style={{ fontSize: '1rem', color: '#334155', marginBottom: '12px' }}>Queries by Language</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px' }}>
                {analytics.queries_by_language?.map((item) => {
                  const maxCount = Math.max(...analytics.queries_by_language.map((q) => q.count), 1);
                  const pct = Math.round((item.count / maxCount) * 100);
                  return (
                    <div key={item.language} style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.88rem' }}>
                      <span style={{ width: '100px', textAlign: 'right', fontWeight: 500, color: '#475569' }}>{item.language}</span>
                      <div style={{ flex: 1, background: '#e2e8f0', height: '18px', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ width: `${pct}%`, background: '#2563eb', height: '100%', borderRadius: '4px' }} />
                      </div>
                      <span style={{ width: '50px', fontWeight: 600, color: '#1e293b' }}>{item.count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}
        </div>
      )}

      {/* Tab 2: Knowledge Base */}
      {activeTab === 'kb' && (
        <div style={{ background: '#ffffff', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ margin: 0, fontSize: '1.2rem', color: '#1e293b' }}>Knowledge Base Documents</h2>
            <button
              onClick={() => {
                setCurrentDoc({ id: null, title: '', content: '', category: '', language: 'en', source: '', verified: false });
                setKbModalOpen(true);
              }}
              style={{ background: '#1a73e8', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem' }}
            >
              + Add Document
            </button>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                <th style={{ padding: '10px 12px' }}>Title</th>
                <th style={{ padding: '10px 12px' }}>Category</th>
                <th style={{ padding: '10px 12px' }}>Language</th>
                <th style={{ padding: '10px 12px' }}>Status</th>
                <th style={{ padding: '10px 12px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {kbDocs.map((doc) => (
                <tr key={doc._id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '10px 12px', fontWeight: 600 }}>{doc.title}</td>
                  <td style={{ padding: '10px 12px', color: '#64748b' }}>{doc.category || '—'}</td>
                  <td style={{ padding: '10px 12px' }}>{doc.language || 'en'}</td>
                  <td style={{ padding: '10px 12px' }}>
                    <span style={{ padding: '3px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600, background: doc.verified ? '#dcfce7' : '#fef9c3', color: doc.verified ? '#166534' : '#854d0e' }}>
                      {doc.verified ? 'Verified' : 'Unverified'}
                    </span>
                  </td>
                  <td style={{ padding: '10px 12px', textAlign: 'right' }}>
                    <button
                      onClick={() => {
                        setCurrentDoc({ id: doc._id, ...doc });
                        setKbModalOpen(true);
                      }}
                      style={{ background: '#e2e8f0', border: 'none', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer', marginRight: '6px' }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteKb(doc._id)}
                      style={{ background: '#fee2e2', color: '#b91c1c', border: 'none', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer' }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 3: Escalations */}
      {activeTab === 'escalations' && (
        <div style={{ background: '#ffffff', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <h2 style={{ margin: '0 0 20px 0', fontSize: '1.2rem', color: '#1e293b' }}>Human Escalations</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                <th style={{ padding: '10px 12px' }}>Time</th>
                <th style={{ padding: '10px 12px' }}>Query</th>
                <th style={{ padding: '10px 12px' }}>Status</th>
                <th style={{ padding: '10px 12px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {escalations.length === 0 ? (
                <tr><td colSpan={4} style={{ padding: '16px', textAlign: 'center', color: '#64748b' }}>No escalations found.</td></tr>
              ) : (
                escalations.map((esc) => (
                  <tr key={esc._id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '10px 12px', color: '#64748b' }}>{new Date(esc.timestamp).toLocaleString()}</td>
                    <td style={{ padding: '10px 12px', fontWeight: 500 }}>{esc.query}</td>
                    <td style={{ padding: '10px 12px' }}>
                      <span style={{ padding: '3px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600, background: esc.status === 'resolved' ? '#dcfce7' : '#fef3c7', color: esc.status === 'resolved' ? '#166534' : '#92400e' }}>
                        {esc.status}
                      </span>
                    </td>
                    <td style={{ padding: '10px 12px', textAlign: 'right' }}>
                      {esc.status !== 'resolved' && (
                        <button
                          onClick={() => {
                            setSelectedEscalation(esc);
                            setEscModalOpen(true);
                          }}
                          style={{ background: '#10b981', color: '#fff', border: 'none', padding: '5px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}
                        >
                          Resolve
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 4: Feedback */}
      {activeTab === 'feedback' && (
        <div style={{ background: '#ffffff', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <h2 style={{ margin: '0 0 20px 0', fontSize: '1.2rem', color: '#1e293b' }}>User Feedback</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                <th style={{ padding: '10px 12px' }}>Time</th>
                <th style={{ padding: '10px 12px' }}>Type</th>
                <th style={{ padding: '10px 12px' }}>Rating</th>
                <th style={{ padding: '10px 12px' }}>Comment / Reason</th>
                <th style={{ padding: '10px 12px' }}>User</th>
              </tr>
            </thead>
            <tbody>
              {feedbackList.length === 0 ? (
                <tr><td colSpan={5} style={{ padding: '16px', textAlign: 'center', color: '#64748b' }}>No feedback submissions recorded yet.</td></tr>
              ) : (
                feedbackList.map((item) => (
                  <tr key={item._id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '10px 12px', color: '#64748b' }}>{new Date(item.timestamp).toLocaleString()}</td>
                    <td style={{ padding: '10px 12px' }}>{item.feedback_type}</td>
                    <td style={{ padding: '10px 12px', fontWeight: 600, color: item.rating === 'helpful' ? '#10b981' : item.rating === 'not_helpful' ? '#ef4444' : '#1e293b' }}>
                      {item.rating}
                    </td>
                    <td style={{ padding: '10px 12px' }}>{item.comment || item.reason || '—'}</td>
                    <td style={{ padding: '10px 12px', color: '#64748b' }}>{item.name || item.email || item.user_mode || 'Anonymous'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal: KB Edit / Add */}
      {kbModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', width: '90%', maxWidth: '500px' }}>
            <h3 style={{ margin: '0 0 16px 0' }}>{currentDoc.id ? 'Edit Document' : 'Add Document'}</h3>
            <form onSubmit={handleSaveKb} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <input
                type="text"
                placeholder="Title"
                value={currentDoc.title}
                onChange={(e) => setCurrentDoc({ ...currentDoc, title: e.target.value })}
                required
                style={{ padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
              />
              <input
                type="text"
                placeholder="Category (e.g. Admissions, Fees)"
                value={currentDoc.category}
                onChange={(e) => setCurrentDoc({ ...currentDoc, category: e.target.value })}
                style={{ padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
              />
              <textarea
                placeholder="Content"
                rows={5}
                value={currentDoc.content}
                onChange={(e) => setCurrentDoc({ ...currentDoc, content: e.target.value })}
                required
                style={{ padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
              />
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
                <input
                  type="checkbox"
                  checked={currentDoc.verified}
                  onChange={(e) => setCurrentDoc({ ...currentDoc, verified: e.target.checked })}
                />
                Verified Official Document
              </label>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button type="button" onClick={() => setKbModalOpen(false)} style={{ padding: '8px 16px', background: '#e2e8f0', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                  Cancel
                </button>
                <button type="submit" style={{ padding: '8px 16px', background: '#1a73e8', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>
                  Save Document
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Resolve Escalation */}
      {escModalOpen && selectedEscalation && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', width: '90%', maxWidth: '450px' }}>
            <h3 style={{ margin: '0 0 16px 0' }}>Resolve Escalation</h3>
            <p style={{ fontSize: '0.9rem', color: '#475569', marginBottom: '12px' }}>
              <strong>User Query:</strong> {selectedEscalation.query}
            </p>
            <form onSubmit={handleResolveEscalation} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <textarea
                placeholder="Resolution notes / action taken..."
                rows={3}
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                required
                style={{ padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
              />
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button type="button" onClick={() => setEscModalOpen(false)} style={{ padding: '8px 16px', background: '#e2e8f0', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                  Cancel
                </button>
                <button type="submit" style={{ padding: '8px 16px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>
                  Mark as Resolved
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
