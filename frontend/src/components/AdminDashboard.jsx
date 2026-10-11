import React, { useState, useEffect, useMemo } from 'react';
import { Search, X, Check, BookOpen, AlertCircle, RefreshCw } from 'lucide-react';
import LogoutConfirmModal from './LogoutConfirmModal';
import PageContainer from '../app/components/ui/PageContainer';

const API_BASE = 'http://127.0.0.1:8000/api/admin';

export default function AdminDashboard({ onLogout }) {
  const [activeTab, setActiveTab] = useState('analytics'); // Default to Analytics tab
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Analytics State
  const [analytics, setAnalytics] = useState(null);

  // KB State
  const [kbDocs, setKbDocs] = useState([]);
  const [kbVerifiedFilter, setKbVerifiedFilter] = useState('all');
  const [kbCategoryFilter, setKbCategoryFilter] = useState('all');
  const [kbSearchInput, setKbSearchInput] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [kbModalOpen, setKbModalOpen] = useState(false);
  const [currentDoc, setCurrentDoc] = useState({ id: null, title: '', content: '', category: '', language: 'en', source: '', verified: false });

  // Debounce search input by 200ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(kbSearchInput);
    }, 200);
    return () => clearTimeout(timer);
  }, [kbSearchInput]);

  // Extract unique categories from loaded documents
  const categories = useMemo(() => {
    return Array.from(new Set(kbDocs.map((d) => d.category).filter(Boolean))).sort();
  }, [kbDocs]);

  // Client-side combined filter: text search + category filter
  const filteredKbDocs = useMemo(() => {
    let list = kbDocs;

    if (kbCategoryFilter !== 'all') {
      list = list.filter((doc) => (doc.category || '').toLowerCase() === kbCategoryFilter.toLowerCase());
    }

    if (debouncedSearchTerm.trim()) {
      const term = debouncedSearchTerm.toLowerCase().trim();
      list = list.filter((doc) => {
        const titleMatch = (doc.title || '').toLowerCase().includes(term);
        const contentMatch = (doc.content || '').toLowerCase().includes(term);
        const categoryMatch = (doc.category || '').toLowerCase().includes(term);
        return titleMatch || contentMatch || categoryMatch;
      });
    }

    return list;
  }, [kbDocs, debouncedSearchTerm, kbCategoryFilter]);

  // Escalations State
  const [escalations, setEscalations] = useState([]);
  const [escModalOpen, setEscModalOpen] = useState(false);
  const [selectedEscalation, setSelectedEscalation] = useState(null);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [addToKb, setAddToKb] = useState(true);
  const [kbCategory, setKbCategory] = useState('general');
  const [kbTitle, setKbTitle] = useState('');

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

  const loadKb = async (verifiedStatus = kbVerifiedFilter) => {
    setLoading(true);
    setError('');
    try {
      let url = `${API_BASE}/kb/`;
      if (verifiedStatus !== 'all') {
        url += `?verified=${verifiedStatus}`;
      }
      const res = await fetch(url, { headers: authHeaders });
      if (res.status === 401) throw new Error('Unauthorized');
      if (!res.ok) throw new Error('Failed to fetch KB docs');
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
        body: JSON.stringify({
          resolution_notes: resolutionNotes,
          add_to_kb: addToKb,
          category: kbCategory,
          title: kbTitle,
        }),
      });
      if (!res.ok) throw new Error('Failed to resolve escalation');
      const data = await res.json();
      if (data.kb_id) {
        alert('Escalation resolved and successfully indexed into Knowledge Base! Future chatbot queries can now answer this.');
      }
      setEscModalOpen(false);
      setResolutionNotes('');
      setKbTitle('');
      loadEscalations();
      loadKb();
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
    <div className="min-h-screen w-full bg-[#f5f1e8] text-[#1a1a1a] p-4 sm:p-8 font-['Inter',sans-serif]">
      <PageContainer size="xl" className="flex flex-col gap-6">
        {/* Top Header Card */}
        <header className="bg-white border border-[#e8e3d8] rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#2d2d2d] text-white text-xl flex items-center justify-center shadow-md">
              🏛️
            </div>
            <div>
              <h1 className="font-heading font-bold text-lg sm:text-xl text-[#1a1a1a] tracking-tight">
                IIIT Kottayam • Administration
              </h1>
              <p className="text-xs sm:text-sm text-[#6b6b6b] font-medium">
                Manage campus assistance, knowledge resources, and platform insights.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="/chat"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#e8e3d8] bg-[#faf8f3] text-xs sm:text-sm font-semibold text-[#1a1a1a] hover:bg-[#2d2d2d] hover:text-white transition-all shadow-2xs"
            >
              <span>💬</span>
              <span>Open Chatbot</span>
            </a>

            <button
              type="button"
              onClick={() => setShowLogoutModal(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#e85d4a] text-white text-xs sm:text-sm font-semibold hover:bg-[#d64a37] transition-all cursor-pointer shadow-2xs"
            >
              <span>Logout</span>
            </button>
          </div>
        </header>

        {/* Logout Modal */}
        <LogoutConfirmModal
          isOpen={showLogoutModal}
          onClose={() => setShowLogoutModal(false)}
          onConfirm={() => {
            setShowLogoutModal(false);
            handleLogout();
          }}
          title="Admin Logout"
          message="Are you sure you want to log out of the Administrator Portal?"
        />

        {/* Error Alert */}
        {error && (
          <div className="rounded-2xl bg-[#e85d4a]/10 border border-[#e85d4a]/30 p-4 text-xs sm:text-sm text-[#e85d4a] font-medium flex items-center gap-2">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Tab Navigation Segmented Control */}
        <div className="flex flex-wrap gap-2 p-1.5 bg-[#ffffff] border border-[#e8e3d8] rounded-2xl shadow-2xs">
          {[
            { id: 'analytics', label: '📊 Analytics' },
            { id: 'kb', label: '📚 Knowledge Base' },
            { id: 'escalations', label: '🚨 Escalations' },
            { id: 'feedback', label: '💬 User Feedback' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-[#f4a340] text-white shadow-sm'
                  : 'text-[#6b6b6b] hover:text-[#1a1a1a] hover:bg-[#faf8f3]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab 1: Analytics */}
        {activeTab === 'analytics' && (
          <div className="bg-white border border-[#e8e3d8] rounded-3xl p-8 sm:p-10 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-heading font-bold text-lg sm:text-xl text-[#1a1a1a]">
                Analytics Overview
              </h2>
              <button
                type="button"
                onClick={loadAnalytics}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-[#e8e3d8] bg-[#faf8f3] text-xs font-semibold text-[#6b6b6b] hover:text-[#1a1a1a] transition-all cursor-pointer"
              >
                <RefreshCw size={12} />
                <span>Refresh</span>
              </button>
            </div>

            {loading && !analytics ? (
              <p className="text-xs sm:text-sm text-[#6b6b6b]">Loading analytics metrics…</p>
            ) : analytics ? (
              <div>
                {/* KPI Cards Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 sm:gap-5 mb-8">
                  <div className="bg-[#faf8f3] border border-[#e8e3d8] rounded-2xl p-5 sm:p-6 text-center">
                    <div className="font-heading text-2xl sm:text-3xl font-bold text-[#1a1a1a]">
                      {analytics.total_queries}
                    </div>
                    <div className="text-xs text-[#6b6b6b] font-medium mt-1.5">Total Queries</div>
                  </div>

                  <div className="bg-[#faf8f3] border border-[#e8e3d8] rounded-2xl p-5 sm:p-6 text-center">
                    <div className="font-heading text-2xl sm:text-3xl font-bold text-[#1a1a1a]">
                      {analytics.unique_sessions}
                    </div>
                    <div className="text-xs text-[#6b6b6b] font-medium mt-1.5">Unique Sessions</div>
                  </div>

                  <div className="bg-[#faf8f3] border border-[#e8e3d8] rounded-2xl p-5 sm:p-6 text-center">
                    <div className="font-heading text-2xl sm:text-3xl font-bold text-[#f4a340]">
                      {analytics.feedback?.helpful || 0}
                    </div>
                    <div className="text-xs text-[#6b6b6b] font-medium mt-1.5">Helpful Feedback</div>
                  </div>

                  <div className="bg-[#faf8f3] border border-[#e8e3d8] rounded-2xl p-5 sm:p-6 text-center">
                    <div className="font-heading text-2xl sm:text-3xl font-bold text-[#e85d4a]">
                      {analytics.feedback?.not_helpful || 0}
                    </div>
                    <div className="text-xs text-[#6b6b6b] font-medium mt-1.5">Not Helpful</div>
                  </div>

                  <div className="bg-[#faf8f3] border border-[#e8e3d8] rounded-2xl p-5 sm:p-6 text-center col-span-2 sm:col-span-1">
                    <div className="font-heading text-2xl sm:text-3xl font-bold text-[#2d2d2d]">
                      {analytics.escalations?.pending || 0}
                    </div>
                    <div className="text-xs text-[#6b6b6b] font-medium mt-1.5">Pending Escalations</div>
                  </div>
                </div>

                {/* Queries by Language Breakdown */}
                <div className="bg-[#faf8f3] border border-[#e8e3d8] rounded-2xl p-5 sm:p-6">
                  <h3 className="font-heading font-bold text-sm sm:text-base text-[#1a1a1a] mb-4">
                    Queries by Language
                  </h3>
                  <div className="flex flex-col gap-3.5">
                    {analytics.queries_by_language?.map((item) => {
                      const maxCount = Math.max(...analytics.queries_by_language.map((q) => q.count), 1);
                      const pct = Math.round((item.count / maxCount) * 100);
                      return (
                        <div key={item.language} className="flex items-center gap-3 text-xs sm:text-sm">
                          <span className="w-24 text-right font-medium text-[#6b6b6b]">{item.language}</span>
                          <div className="flex-1 bg-white border border-[#e8e3d8] h-4 rounded-full overflow-hidden p-0.5">
                            <div style={{ width: `${pct}%` }} className="bg-[#f4a340] h-full rounded-full transition-all duration-300" />
                          </div>
                          <span className="w-12 font-bold text-[#1a1a1a]">{item.count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        )}

        {/* Tab 2: Knowledge Base */}
        {activeTab === 'kb' && (
          <div className="bg-white border border-[#e8e3d8] rounded-3xl p-8 sm:p-10 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div>
                <h2 className="font-heading font-bold text-lg sm:text-xl text-[#1a1a1a]">
                  Knowledge Base Articles
                </h2>
                <p className="text-xs text-[#6b6b6b] font-medium mt-0.5">
                  Showing {filteredKbDocs.length} of {kbDocs.length} indexed articles
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                {/* Search */}
                <div className="relative flex items-center">
                  <Search size={15} className="absolute left-3.5 text-[#9b9b9b] pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search articles…"
                    value={kbSearchInput}
                    onChange={(e) => setKbSearchInput(e.target.value)}
                    className="pl-10.5 pr-8 py-2.5 rounded-xl border border-[#e8e3d8] bg-[#faf8f3] text-xs sm:text-sm text-[#1a1a1a] placeholder:text-[#9b9b9b] outline-none focus:border-[#f4a340]"
                  />
                  {kbSearchInput && (
                    <button
                      type="button"
                      onClick={() => setKbSearchInput('')}
                      className="absolute right-2.5 text-[#9b9b9b] hover:text-[#1a1a1a] cursor-pointer"
                    >
                      <X size={13} />
                    </button>
                  )}
                </div>

                {/* Category select */}
                {categories.length > 0 && (
                  <select
                    value={kbCategoryFilter}
                    onChange={(e) => setKbCategoryFilter(e.target.value)}
                    className="px-3.5 py-2.5 rounded-xl border border-[#e8e3d8] bg-[#faf8f3] text-xs sm:text-sm text-[#1a1a1a] outline-none"
                  >
                    <option value="all">All Categories</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                )}

                {/* Status Filter */}
                <select
                  value={kbVerifiedFilter}
                  onChange={(e) => {
                    setKbVerifiedFilter(e.target.value);
                    loadKb(e.target.value);
                  }}
                  className="px-3.5 py-2.5 rounded-xl border border-[#e8e3d8] bg-[#faf8f3] text-xs sm:text-sm text-[#1a1a1a] outline-none"
                >
                  <option value="all">All Articles</option>
                  <option value="false">Unverified</option>
                  <option value="true">Verified</option>
                </select>

                <button
                  type="button"
                  onClick={() => {
                    setCurrentDoc({ id: null, title: '', content: '', category: '', language: 'en', source: '', verified: false });
                    setKbModalOpen(true);
                  }}
                  className="px-4.5 py-2.5 rounded-full bg-[#f4a340] text-white text-xs sm:text-sm font-semibold hover:bg-[#e8933a] transition-all cursor-pointer shadow-sm"
                >
                  + Add Article
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-[#e8e3d8] text-[#6b6b6b]">
                    <th className="py-4 px-4 font-semibold">Title</th>
                    <th className="py-4 px-4 font-semibold">Category</th>
                    <th className="py-4 px-4 font-semibold">Language</th>
                    <th className="py-4 px-4 font-semibold">Status</th>
                    <th className="py-4 px-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredKbDocs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-10 text-center text-[#9b9b9b]">
                        No matching documents found.
                      </td>
                    </tr>
                  ) : (
                    filteredKbDocs.map((doc) => (
                      <tr key={doc._id} className="border-b border-[#e8e3d8]/60 hover:bg-[#faf8f3]/60 transition-colors">
                        <td className="py-4 px-4 font-semibold text-[#1a1a1a]">{doc.title}</td>
                        <td className="py-4 px-4 text-[#6b6b6b]">{doc.category || '—'}</td>
                        <td className="py-4 px-4 font-mono text-xs">{doc.language || 'en'}</td>
                        <td className="py-4 px-4">
                          <span className={`inline-block px-2.5 py-1 rounded-full text-2xs font-semibold ${
                            doc.verified ? 'bg-[#2d2d2d] text-white' : 'bg-[#faf8f3] border border-[#e8e3d8] text-[#6b6b6b]'
                          }`}>
                            {doc.verified ? 'Verified' : 'Unverified'}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => {
                              setCurrentDoc({ id: doc._id, ...doc });
                              setKbModalOpen(true);
                            }}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-[#2d2d2d] hover:bg-[#2d2d2d]/10 mr-1.5 cursor-pointer transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteKb(doc._id)}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-[#e85d4a] hover:bg-[#e85d4a]/10 cursor-pointer transition-colors"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Escalations */}
        {activeTab === 'escalations' && (
          <div className="bg-white border border-[#e8e3d8] rounded-3xl p-8 sm:p-10 shadow-sm">
            <h2 className="font-heading font-bold text-lg sm:text-xl text-[#1a1a1a] mb-6">
              Human Escalation Inquiries
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-[#e8e3d8] text-[#6b6b6b]">
                    <th className="py-4 px-4 font-semibold">Timestamp</th>
                    <th className="py-4 px-4 font-semibold">Student / User Query</th>
                    <th className="py-4 px-4 font-semibold">Status</th>
                    <th className="py-4 px-4 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {escalations.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-10 text-center text-[#9b9b9b]">
                        No escalations logged.
                      </td>
                    </tr>
                  ) : (
                    escalations.map((esc) => (
                      <tr key={esc._id} className="border-b border-[#e8e3d8]/60 hover:bg-[#faf8f3]/60 transition-colors">
                        <td className="py-4 px-4 text-[#6b6b6b] whitespace-nowrap">
                          {new Date(esc.timestamp).toLocaleString()}
                        </td>
                        <td className="py-4 px-4 font-medium text-[#1a1a1a]">{esc.query}</td>
                        <td className="py-4 px-4">
                          <span className={`inline-block px-2.5 py-1 rounded-full text-2xs font-semibold ${
                            esc.status === 'resolved' ? 'bg-[#2d2d2d] text-white' : 'bg-[#f4a340]/20 text-[#d88325]'
                          }`}>
                            {esc.status}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-right">
                          {esc.status !== 'resolved' && (
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedEscalation(esc);
                                setEscModalOpen(true);
                              }}
                              className="px-3.5 py-1.5 rounded-full bg-[#f4a340] text-white text-xs font-semibold hover:bg-[#e8933a] cursor-pointer shadow-2xs transition-colors"
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
          </div>
        )}

        {/* Tab 4: Feedback */}
        {activeTab === 'feedback' && (
          <div className="bg-white border border-[#e8e3d8] rounded-3xl p-8 sm:p-10 shadow-sm">
            <h2 className="font-heading font-bold text-lg sm:text-xl text-[#1a1a1a] mb-6">
              User Satisfaction Feedback
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-[#e8e3d8] text-[#6b6b6b]">
                    <th className="py-4 px-4 font-semibold w-44">Timestamp</th>
                    <th className="py-4 px-4 font-semibold w-28">Type</th>
                    <th className="py-4 px-4 font-semibold w-24">Rating</th>
                    <th className="py-4 px-4 font-semibold">Comment / Reason</th>
                    <th className="py-4 px-4 font-semibold w-48">Submitted By</th>
                  </tr>
                </thead>
                <tbody>
                  {feedbackList.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-10 text-center text-[#9b9b9b]">
                        No user feedback recorded yet.
                      </td>
                    </tr>
                  ) : (
                    feedbackList.map((item) => (
                      <tr key={item._id} className="border-b border-[#e8e3d8]/60 hover:bg-[#faf8f3]/60 transition-colors">
                        <td className="py-4 px-4 text-[#6b6b6b] whitespace-nowrap">
                          {new Date(item.timestamp).toLocaleString()}
                        </td>
                        <td className="py-4 px-4 font-mono text-xs whitespace-nowrap">{item.feedback_type}</td>
                        <td className="py-4 px-4 font-semibold text-[#1a1a1a] whitespace-nowrap">
                          {item.rating}
                        </td>
                        <td className="py-4 px-4 text-[#2d2d2d] break-words max-w-md">{item.comment || item.reason || '—'}</td>
                        <td className="py-4 px-4 text-[#6b6b6b] break-words">{item.name || item.email || item.user_mode || 'Anonymous'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </PageContainer>

      {/* Modal: KB Edit / Add */}
      {kbModalOpen && (
        <div className="fixed inset-0 bg-[#2d2d2d]/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-[#e8e3d8] p-6 sm:p-7 max-w-lg w-full shadow-lg">
            <h3 className="font-heading font-bold text-lg text-[#1a1a1a] mb-4">
              {currentDoc.id ? 'Edit Knowledge Base Article' : 'Add Knowledge Base Article'}
            </h3>
            <form onSubmit={handleSaveKb} className="flex flex-col gap-3.5">
              <input
                type="text"
                placeholder="Title"
                value={currentDoc.title}
                onChange={(e) => setCurrentDoc({ ...currentDoc, title: e.target.value })}
                required
                className="w-full rounded-xl border border-[#e8e3d8] bg-[#faf8f3] px-3.5 py-2.5 text-xs sm:text-sm text-[#1a1a1a] outline-none focus:border-[#f4a340]"
              />
              <input
                type="text"
                placeholder="Category (e.g. fees, admissions, hostel)"
                value={currentDoc.category}
                onChange={(e) => setCurrentDoc({ ...currentDoc, category: e.target.value })}
                className="w-full rounded-xl border border-[#e8e3d8] bg-[#faf8f3] px-3.5 py-2.5 text-xs sm:text-sm text-[#1a1a1a] outline-none focus:border-[#f4a340]"
              />
              <textarea
                placeholder="Article content"
                rows={5}
                value={currentDoc.content}
                onChange={(e) => setCurrentDoc({ ...currentDoc, content: e.target.value })}
                required
                className="w-full rounded-xl border border-[#e8e3d8] bg-[#faf8f3] px-3.5 py-2.5 text-xs sm:text-sm text-[#1a1a1a] outline-none focus:border-[#f4a340]"
              />
              <label className="flex items-center gap-2 text-xs sm:text-sm font-medium text-[#1a1a1a] cursor-pointer">
                <input
                  type="checkbox"
                  checked={currentDoc.verified}
                  onChange={(e) => setCurrentDoc({ ...currentDoc, verified: e.target.checked })}
                  className="rounded border-[#e8e3d8] text-[#f4a340] focus:ring-[#f4a340]"
                />
                <span>Verified Official Article (eligible for chatbot retrieval)</span>
              </label>

              <div className="flex justify-end gap-2.5 mt-2">
                <button
                  type="button"
                  onClick={() => setKbModalOpen(false)}
                  className="px-4 py-2 rounded-full border border-[#2d2d2d] text-xs sm:text-sm font-semibold text-[#2d2d2d] hover:bg-[#2d2d2d] hover:text-white transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full bg-[#f4a340] text-xs sm:text-sm font-semibold text-white hover:bg-[#e8933a] transition-all cursor-pointer shadow-sm"
                >
                  Save Article
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Resolve Escalation with KB creation toggle */}
      {escModalOpen && selectedEscalation && (
        <div className="fixed inset-0 bg-[#2d2d2d]/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-[#e8e3d8] p-6 sm:p-7 max-w-lg w-full shadow-lg max-h-[90vh] overflow-y-auto">
            <h3 className="font-heading font-bold text-lg text-[#1a1a1a] mb-3">
              Resolve Escalation
            </h3>

            <div className="bg-[#faf8f3] border border-[#e8e3d8] rounded-2xl p-4 mb-4">
              <div className="text-2xs font-bold text-[#6b6b6b] uppercase tracking-wider mb-1">
                Student Query
              </div>
              <div className="text-xs sm:text-sm font-semibold text-[#1a1a1a]">
                "{selectedEscalation.query}"
              </div>
            </div>

            <form onSubmit={handleResolveEscalation} className="flex flex-col gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-[#1a1a1a] mb-1.5">
                  Official Answer / Resolution:
                </label>
                <textarea
                  placeholder="Provide authoritative response..."
                  rows={4}
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  required
                  className="w-full rounded-xl border border-[#e8e3d8] bg-[#faf8f3] px-3.5 py-2.5 text-xs sm:text-sm text-[#1a1a1a] outline-none focus:border-[#f4a340]"
                />
              </div>

              {/* Add to KB card */}
              <div className="bg-[#fef8ee] border border-[#f4a340]/30 rounded-2xl p-4">
                <label className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#d88325] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={addToKb}
                    onChange={(e) => setAddToKb(e.target.checked)}
                    className="w-4 h-4 rounded text-[#f4a340] focus:ring-[#f4a340]"
                  />
                  <span>📚 Also add this answer to Knowledge Base</span>
                </label>
                <p className="text-2xs text-[#888888] mt-1 pl-6">
                  Embeds with sentence-transformers all-MiniLM-L6-v2 so future chatbot queries can retrieve this.
                </p>

                {addToKb && (
                  <div className="mt-3 pl-6 flex flex-col gap-2.5">
                    <div>
                      <label className="block text-2xs font-bold text-[#6b6b6b] uppercase mb-1">
                        Category
                      </label>
                      <select
                        value={kbCategory}
                        onChange={(e) => setKbCategory(e.target.value)}
                        className="w-full rounded-xl border border-[#e8e3d8] bg-white px-3 py-2 text-xs text-[#1a1a1a] outline-none"
                      >
                        <option value="general">General / Campus Information</option>
                        <option value="faculty">Faculty &amp; Staff Directory</option>
                        <option value="fees">Fee Structure &amp; Payments</option>
                        <option value="hostel">Hostels &amp; Accommodation</option>
                        <option value="admission_process">Admissions &amp; Eligibility</option>
                        <option value="contact">Contact &amp; Helpline</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-2xs font-bold text-[#6b6b6b] uppercase mb-1">
                        Article Title (Optional)
                      </label>
                      <input
                        type="text"
                        placeholder={`e.g. ${selectedEscalation.query.slice(0, 30)}`}
                        value={kbTitle}
                        onChange={(e) => setKbTitle(e.target.value)}
                        className="w-full rounded-xl border border-[#e8e3d8] bg-white px-3 py-2 text-xs text-[#1a1a1a] outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2.5 mt-2">
                <button
                  type="button"
                  onClick={() => setEscModalOpen(false)}
                  className="px-4 py-2 rounded-full border border-[#2d2d2d] text-xs sm:text-sm font-semibold text-[#2d2d2d] hover:bg-[#2d2d2d] hover:text-white transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full bg-[#f4a340] text-xs sm:text-sm font-semibold text-white hover:bg-[#e8933a] transition-all cursor-pointer shadow-sm"
                >
                  {addToKb ? '✓ Resolve & Add to KB' : 'Mark as Resolved'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
