import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  deleteNewsletter,
  getAllNewsletters,
} from "../../../../redux/actions/newsletterAction";
import type { Newsletter } from "../../../../redux/constants/newsletterConstant";
import toast from "react-hot-toast";
import {
  Mail,
  Plus,
  Save,
  Send,
  Eye,
  Edit,
  Trash2,
  Users,
  CheckSquare,
  Square,
  X,
  FileText,
  Loader2,
  Download,
  RotateCcw,
  Filter,
  Search,
  Calendar,
  Clock,
  UserCheck
} from "lucide-react";

// Email Template Interface
interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

const Newsletters = () => {
  const dispatch = useDispatch();

  // CRITICAL: Safe state access with comprehensive fallbacks
  const newsletterState = useSelector((state: any) => state?.newsletter);

  const {
    newsletters = [], // Always default to empty array
    loading = false,
    error: newsletterError = null,
    success = false,
  } = newsletterState || {}; // Fallback if entire newsletter state is undefined

  // Existing state variables - enhanced filtering
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // Changed default to "all"
  const [sortBy, setSortBy] = useState("latest"); // New sort state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [newsletterToDelete, setNewsletterToDelete] =
    useState<Newsletter | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // NEW: Email Template and Bulk Email States
  const [activeTab, setActiveTab] = useState<'subscribers' | 'templates' | 'bulk-email'>('subscribers');
  const [emailTemplates, setEmailTemplates] = useState<EmailTemplate[]>([]);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [templateForm, setTemplateForm] = useState({
    name: '',
    subject: '',
    content: ''
  });

  // Bulk Email States
  const [selectedSubscribers, setSelectedSubscribers] = useState<string[]>([]);
  const [showBulkEmailModal, setShowBulkEmailModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [bulkEmailForm, setBulkEmailForm] = useState({
    subject: '',
    content: '',
    useTemplate: false
  });
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  // Initialize newsletters when component mounts
  useEffect(() => {
    try {
      console.log("📧 Newsletter Component: Initializing...");
      dispatch(getAllNewsletters());
      setIsInitialized(true);
      loadTemplatesFromStorage();
    } catch (err) {
      console.error("📧 Newsletter Component: Failed to initialize:", err);
      setError("Failed to initialize newsletter data");
    }
  }, [dispatch]);

  // Handle newsletter state changes
  useEffect(() => {
    if (newsletterError) {
      setError(newsletterError);
      console.error("📧 Newsletter Error:", newsletterError);
    }
  }, [newsletterError]);

  // Log state for debugging
  useEffect(() => {
    console.log("📧 Newsletter State:", {
      newsletters: newsletters?.length || 0,
      loading,
      error: newsletterError,
      isInitialized,
      hasNewsletterState: !!newsletterState,
    });
  }, [newsletters, loading, newsletterError, isInitialized, newsletterState]);

  // NEW: Template Management Functions
  const loadTemplatesFromStorage = () => {
    try {
      const savedTemplates = localStorage.getItem('emailTemplates');
      if (savedTemplates) {
        setEmailTemplates(JSON.parse(savedTemplates));
      }
    } catch (err) {
      console.error('Failed to load templates:', err);
    }
  };

  const saveTemplatesToStorage = (templates: EmailTemplate[]) => {
    try {
      localStorage.setItem('emailTemplates', JSON.stringify(templates));
    } catch (err) {
      console.error('Failed to save templates:', err);
    }
  };

  const handleCreateTemplate = () => {
    setEditingTemplate(null);
    setTemplateForm({ name: '', subject: '', content: '' });
    setShowTemplateModal(true);
  };

  const handleEditTemplate = (template: EmailTemplate) => {
    setEditingTemplate(template);
    setTemplateForm({
      name: template.name,
      subject: template.subject,
      content: template.content
    });
    setShowTemplateModal(true);
  };

  const handleSaveTemplate = () => {
    if (!templateForm.name.trim() || !templateForm.subject.trim() || !templateForm.content.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    const now = new Date();
    let updatedTemplates: EmailTemplate[];

    if (editingTemplate) {
      // Update existing template
      updatedTemplates = emailTemplates.map(template =>
        template.id === editingTemplate.id
          ? { ...template, ...templateForm, updatedAt: now }
          : template
      );
      toast.success('Template updated successfully');
    } else {
      // Create new template
      const newTemplate: EmailTemplate = {
        id: Date.now().toString(),
        ...templateForm,
        createdAt: now,
        updatedAt: now
      };
      updatedTemplates = [...emailTemplates, newTemplate];
      toast.success('Template created successfully');
    }

    setEmailTemplates(updatedTemplates);
    saveTemplatesToStorage(updatedTemplates);
    setShowTemplateModal(false);
    setTemplateForm({ name: '', subject: '', content: '' });
    setEditingTemplate(null);
  };

  const handleDeleteTemplate = (templateId: string) => {
    const updatedTemplates = emailTemplates.filter(t => t.id !== templateId);
    setEmailTemplates(updatedTemplates);
    saveTemplatesToStorage(updatedTemplates);
    toast.success('Template deleted successfully');
  };

  // NEW: Bulk Email Functions
  const handleSelectSubscriber = (subscriberId: string) => {
    setSelectedSubscribers(prev =>
      prev.includes(subscriberId)
        ? prev.filter(id => id !== subscriberId)
        : [...prev, subscriberId]
    );
  };

  const handleSelectAllSubscribers = () => {
    if (selectedSubscribers.length === filteredAndSortedNewsletters.length) {
      setSelectedSubscribers([]);
    } else {
      setSelectedSubscribers(filteredAndSortedNewsletters.map(n => n._id || n.id));
    }
  };

  const handleOpenBulkEmail = () => {
    if (selectedSubscribers.length === 0) {
      toast.error('Please select at least one subscriber');
      return;
    }
    setShowBulkEmailModal(true);
  };

  const handleUseTemplate = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setBulkEmailForm({
      subject: template.subject,
      content: template.content,
      useTemplate: true
    });
  };

  const handleSendBulkEmail = async () => {
    if (!bulkEmailForm.subject.trim() || !bulkEmailForm.content.trim()) {
      toast.error('Please fill in subject and content');
      return;
    }

    setIsSendingEmail(true);
    
    try {
      const selectedEmails = newsletters
        .filter(n => selectedSubscribers.includes(n._id || n.id))
        .map(n => n.email)
        .join(',');

      const subject = encodeURIComponent(bulkEmailForm.subject);
      const body = encodeURIComponent(bulkEmailForm.content);
      const mailtoLink = `mailto:?bcc=${selectedEmails}&subject=${subject}&body=${body}`;
      
      // Open email client
      window.open(mailtoLink);
      
      toast.success(`Email composed for ${selectedSubscribers.length} subscribers`);
      setShowBulkEmailModal(false);
      setSelectedSubscribers([]);
      setBulkEmailForm({ subject: '', content: '', useTemplate: false });
      setSelectedTemplate(null);
    } catch (err) {
      console.error('Bulk email error:', err);
      toast.error('Failed to compose bulk email');
    } finally {
      setIsSendingEmail(false);
    }
  };

  // Enhanced filter and sort function with null checks (UNCHANGED)
  const filteredAndSortedNewsletters = React.useMemo(() => {
    if (!Array.isArray(newsletters)) {
      console.warn(
        "📧 Newsletter Component: newsletters is not an array:",
        newsletters
      );
      return [];
    }

    let filtered = newsletters.filter((newsletter: Newsletter) => {
      if (!newsletter) return false;

      try {
        const email = (newsletter.email || "").toLowerCase();
        const name = (newsletter.name || "").toLowerCase();
        const searchTerm = searchQuery.toLowerCase().trim();

        // Search filter - matches email or name
        const matchesSearch =
          searchTerm === "" ||
          email.includes(searchTerm) ||
          name.includes(searchTerm);

        // Status filter - fixed logic
        let matchesStatus = true;
        if (statusFilter === "active") {
          matchesStatus = newsletter.status === true;
        } else if (statusFilter === "inactive") {
          matchesStatus = newsletter.status === false;
        }
        // If statusFilter is "all", matchesStatus remains true

        return matchesSearch && matchesStatus;
      } catch (err) {
        console.error("📧 Newsletter Filter Error:", err, newsletter);
        return false;
      }
    });

    // Sort the filtered results
    const sorted = [...filtered].sort((a: Newsletter, b: Newsletter) => {
      try {
        const dateA = new Date(a.subscribed_at || a.createdAt || 0).getTime();
        const dateB = new Date(b.subscribed_at || b.createdAt || 0).getTime();

        switch (sortBy) {
          case "latest":
            return dateB - dateA; // Newest first
          case "oldest":
            return dateA - dateB; // Oldest first
          case "name":
            const nameA = (a.name || "").toLowerCase();
            const nameB = (b.name || "").toLowerCase();
            return nameA.localeCompare(nameB);
          case "email":
            const emailA = (a.email || "").toLowerCase();
            const emailB = (b.email || "").toLowerCase();
            return emailA.localeCompare(emailB);
          default:
            return dateB - dateA; // Default to latest
        }
      } catch (err) {
        console.error("📧 Newsletter Sort Error:", err);
        return 0;
      }
    });

    return sorted;
  }, [newsletters, searchQuery, statusFilter, sortBy]);

  // Safe date formatting (UNCHANGED)
  const formatDate = (date: Date | string) => {
    try {
      if (!date) return "N/A";
      return new Date(date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (err) {
      console.error("📧 Date Format Error:", err, date);
      return "Invalid Date";
    }
  };

  // UNCHANGED functions
  const handleDeleteClick = (newsletter: Newsletter) => {
    if (!newsletter) {
      toast.error("Invalid newsletter data");
      return;
    }
    setNewsletterToDelete(newsletter);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!newsletterToDelete) return;

    try {
      const newsletterId = newsletterToDelete._id || newsletterToDelete.id;
      if (!newsletterId) {
        toast.error("Invalid newsletter ID");
        return;
      }

      console.log("📧 Deleting newsletter:", newsletterId);

      await dispatch(deleteNewsletter(newsletterId));

      toast.success("Newsletter subscriber deleted successfully");
      setShowDeleteModal(false);
      setNewsletterToDelete(null);

      // Refresh the list
      dispatch(getAllNewsletters());
    } catch (error: any) {
      console.error("📧 Delete Newsletter Error:", error);
      toast.error(error.message || "Failed to delete newsletter subscriber");
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setNewsletterToDelete(null);
  };

  // Send email to subscriber (UNCHANGED)
  const handleSendEmail = (newsletter: Newsletter) => {
    try {
      if (!newsletter?.email) {
        toast.error("Invalid email address");
        return;
      }

      const subject = "Newsletter Update";
      const body = `Hello ${
        newsletter.name || "Subscriber"
      },\n\nThank you for subscribing to our newsletter!\n\nBest regards,\nYour Team`;
      const mailtoLink = `mailto:${
        newsletter.email
      }?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(
        body
      )}`;
      window.open(mailtoLink);
    } catch (err) {
      console.error("📧 Email Error:", err);
      toast.error("Failed to open email client");
    }
  };

  // Refresh newsletters (UNCHANGED)
  const handleRefresh = () => {
    try {
      console.log("📧 Refreshing newsletter data...");
      dispatch(getAllNewsletters());
      toast.success("Newsletter data refreshed");
    } catch (err) {
      console.error("📧 Refresh Error:", err);
      toast.error("Failed to refresh data");
    }
  };

  // Export newsletter data (UNCHANGED)
  const handleExport = () => {
    try {
      if (!newsletters || newsletters.length === 0) {
        toast.error("No data to export");
        return;
      }

      const csvContent = [
        // Header
        "Email,Name,Status,Subscribed At",
        // Data rows
        ...newsletters.map(
          (newsletter: Newsletter) =>
            `"${newsletter.email || "N/A"}","${newsletter.name || "N/A"}","${
              newsletter.status ? "Active" : "Inactive"
            }","${formatDate(newsletter.subscribed_at)}"`
        ),
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `newsletter-subscribers-${new Date().toISOString().split("T")[0]}.csv`
      );
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("Newsletter data exported successfully");
    } catch (err) {
      console.error("📧 Export Error:", err);
      toast.error("Failed to export data");
    }
  };

  // Clear all filters (UNCHANGED)
  const handleClearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setSortBy("latest");
  };

  // Show loading state (UNCHANGED)
  if (loading && !isInitialized) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <p className="ml-4 text-gray-600">Loading newsletter data...</p>
        </div>
      </div>
    );
  }

  // Show error state if newsletter reducer is not connected (UNCHANGED)
  if (!newsletterState && isInitialized) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <h2 className="text-lg font-semibold mb-2">
            Newsletter Module Not Connected
          </h2>
          <p className="mb-2">
            The newsletter reducer is not properly connected to the Redux store.
          </p>
          <p className="text-sm">
            Please ensure that <code>newsletterReducer</code> is added to your
            store configuration.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen my-10 bg-slate-50">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 mb-2">
              Newsletter Management
            </h1>
            <p className="text-slate-600">
              Manage subscribers, create email templates, and send bulk emails
            </p>
          </div>

          {/* Stats */}
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 px-6 py-4 min-w-[320px]">
            <div className="grid grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-2xl font-bold text-indigo-600">
                  {newsletters?.length || 0}
                </div>
                <div className="text-xs text-slate-500 font-medium">Total Subscribers</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-emerald-600">
                  {newsletters?.filter((n: Newsletter) => n?.status).length || 0}
                </div>
                <div className="text-xs text-slate-500 font-medium">Active</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-amber-600">
                  {emailTemplates.length}
                </div>
                <div className="text-xs text-slate-500 font-medium">Templates</div>
              </div>
            </div>
          </div>
        </div>

        {/* NEW: Navigation Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 mb-6 overflow-hidden">
          <div className="flex">
            <button
              onClick={() => setActiveTab('subscribers')}
              className={`flex-1 px-6 py-4 text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
                activeTab === 'subscribers'
                  ? 'bg-indigo-50 text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Users className="w-4 h-4" />
              Subscribers ({newsletters?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab('templates')}
              className={`flex-1 px-6 py-4 text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
                activeTab === 'templates'
                  ? 'bg-indigo-50 text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <FileText className="w-4 h-4" />
              Email Templates ({emailTemplates.length})
            </button>
            <button
              onClick={() => setActiveTab('bulk-email')}
              className={`flex-1 px-6 py-4 text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
                activeTab === 'bulk-email'
                  ? 'bg-indigo-50 text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Send className="w-4 h-4" />
              Bulk Email
            </button>
          </div>
        </div>

        {/* Error Alert (UNCHANGED) */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <div className="flex justify-between items-center">
              <span className="text-red-700">{error}</span>
              <button
                onClick={() => setError(null)}
                className="text-red-400 hover:text-red-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Success Alert (UNCHANGED) */}
        {success && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-6">
            <span className="text-emerald-700">Operation completed successfully!</span>
          </div>
        )}

        {/* Tab Content */}
        {activeTab === 'subscribers' && (
          <>
            {/* Enhanced Controls (UNCHANGED but styled better) */}
            <div className="mb-6 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
                {/* Search */}
                <div className="lg:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    <Search className="w-4 h-4 inline mr-2" />
                    Search Subscribers
                  </label>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by email or name..."
                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                {/* Status Filter */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    <Filter className="w-4 h-4 inline mr-2" />
                    Filter by Status
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="all">All Subscribers</option>
                    <option value="active">Active Only</option>
                    <option value="inactive">Inactive Only</option>
                  </select>
                </div>

                {/* Sort Options */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Sort By
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="latest">Latest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="name">Name (A-Z)</option>
                    <option value="email">Email (A-Z)</option>
                  </select>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Actions
                  </label>
                  <button
                    onClick={handleRefresh}
                    disabled={loading}
                    className="p-3 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 disabled:bg-slate-400 transition-colors flex items-center gap-2 justify-center"
                  >
                    <RotateCcw className="w-4 h-4" />
                    {loading ? "Refreshing..." : "Refresh"}
                  </button>
                  <button
                    onClick={handleExport}
                    disabled={newsletters.length === 0}
                    className="p-3 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 disabled:bg-slate-400 transition-colors flex items-center gap-2 justify-center"
                  >
                    <Download className="w-4 h-4" />
                    Export CSV
                  </button>
                </div>
              </div>

              {/* Clear Filters */}
              {(searchQuery || statusFilter !== "all" || sortBy !== "latest") && (
                <div className="mt-4 pt-4 border-t border-slate-200">
                  <button
                    onClick={handleClearFilters}
                    className="px-4 py-2 text-sm bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
                  >
                    Clear All Filters
                  </button>
                </div>
              )}
            </div>

            {/* NEW: Bulk Email Actions */}
            {selectedSubscribers.length > 0 && (
              <div className="mb-6 bg-indigo-50 border border-indigo-200 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <UserCheck className="w-5 h-5 text-indigo-600" />
                    <span className="text-indigo-800 font-semibold">
                      {selectedSubscribers.length} subscriber(s) selected
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedSubscribers([])}
                      className="px-4 py-2 text-sm text-indigo-600 hover:text-indigo-800"
                    >
                      Clear Selection
                    </button>
                    <button
                      onClick={handleOpenBulkEmail}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
                    >
                      <Send className="w-4 h-4" />
                      Send Bulk Email
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Newsletters List (Enhanced with selection) */}
            {filteredAndSortedNewsletters.length === 0 ? (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-12 text-center">
                <div className="text-6xl mb-4">📧</div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  No newsletter subscribers found
                </h3>
                {newsletters.length === 0 ? (
                  <p className="text-slate-500">
                    No subscribers have been added yet.
                  </p>
                ) : (
                  <p className="text-slate-500">
                    Try adjusting your search or filter criteria.
                  </p>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-6 py-4 text-left">
                          <button
                            onClick={handleSelectAllSubscribers}
                            className="text-slate-500 hover:text-slate-700"
                          >
                            {selectedSubscribers.length === filteredAndSortedNewsletters.length ? (
                              <CheckSquare className="w-5 h-5" />
                            ) : (
                              <Square className="w-5 h-5" />
                            )}
                          </button>
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                          Subscribed At
                        </th>
                        <th className="px-6 py-4 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-100">
                      {filteredAndSortedNewsletters.map(
                        (newsletter: Newsletter, index: number) => (
                          <tr
                            key={newsletter._id || newsletter.id || index}
                            className="hover:bg-slate-50 transition-colors"
                          >
                            <td className="px-6 py-4">
                              <button
                                onClick={() => handleSelectSubscriber(newsletter._id || newsletter.id)}
                                className="text-slate-500 hover:text-slate-700"
                              >
                                {selectedSubscribers.includes(newsletter._id || newsletter.id) ? (
                                  <CheckSquare className="w-5 h-5 text-indigo-600" />
                                ) : (
                                  <Square className="w-5 h-5" />
                                )}
                              </button>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-slate-900">
                                {newsletter.email || "N/A"}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                                  newsletter.status
                                    ? "bg-emerald-100 text-emerald-800"
                                    : "bg-red-100 text-red-800"
                                }`}
                              >
                                {newsletter.status ? "Active" : "Inactive"}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                {formatDate(newsletter.subscribed_at)}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right">
                              <div className="flex justify-end space-x-2">
                                <button
                                  onClick={() => handleSendEmail(newsletter)}
                                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs leading-4 font-medium rounded-lg text-emerald-700 bg-emerald-100 hover:bg-emerald-200 transition-colors"
                                  title="Send Email"
                                >
                                  <Mail className="w-3 h-3 mr-1" />
                                  Email
                                </button>
                                <button
                                  onClick={() => handleDeleteClick(newsletter)}
                                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs leading-4 font-medium rounded-lg text-red-700 bg-red-100 hover:bg-red-200 transition-colors"
                                  title="Delete Subscriber"
                                >
                                  <Trash2 className="w-3 h-3 mr-1" />
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Results summary */}
                <div className="bg-slate-50 px-6 py-3 border-t border-slate-200">
                  <div className="text-sm text-slate-600">
                    Showing {filteredAndSortedNewsletters.length} of{" "}
                    {newsletters?.length || 0} subscribers
                    {(searchQuery ||
                      statusFilter !== "all" ||
                      sortBy !== "latest") && (
                      <span className="ml-2 text-indigo-600">(filtered)</span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* NEW: Email Templates Tab */}
        {activeTab === 'templates' && (
          <div className="space-y-6">
            {/* Templates Header */}
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Email Templates</h2>
                <p className="text-slate-600">Create and manage reusable email templates</p>
              </div>
              <button
                onClick={handleCreateTemplate}
                className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Create Template
              </button>
            </div>

            {/* Templates Grid */}
            {emailTemplates.length === 0 ? (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-12 text-center">
                <FileText className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  No email templates yet
                </h3>
                <p className="text-slate-500 mb-4">
                  Create your first email template to get started
                </p>
                <button
                  onClick={handleCreateTemplate}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Create Your First Template
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {emailTemplates.map((template) => (
                  <div key={template.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-slate-900 mb-1">
                          {template.name}
                        </h3>
                        <p className="text-sm text-slate-600 mb-2">
                          Subject: {template.subject}
                        </p>
                        <div className="flex items-center text-xs text-slate-500 gap-4">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Created {formatDate(template.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-slate-50 rounded-lg p-3 mb-4">
                      <p className="text-sm text-slate-700 line-clamp-3">
                        {template.content.substring(0, 120)}
                        {template.content.length > 120 && '...'}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditTemplate(template)}
                        className="flex-1 px-3 py-2 text-sm text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors flex items-center justify-center gap-1"
                      >
                        <Edit className="w-3 h-3" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteTemplate(template.id)}
                        className="px-3 py-2 text-sm text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* NEW: Bulk Email Tab */}
        {activeTab === 'bulk-email' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Bulk Email</h2>
              <p className="text-slate-600">Send emails to multiple subscribers at once</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Select Recipients</h3>
              <p className="text-slate-600 mb-4">
                You have {selectedSubscribers.length} subscriber(s) selected from the Subscribers tab.
              </p>
              
              {selectedSubscribers.length === 0 ? (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <p className="text-amber-800">
                    Please go to the <strong>Subscribers</strong> tab and select the recipients you want to email.
                  </p>
                </div>
              ) : (
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <UserCheck className="w-5 h-5 text-emerald-600" />
                    <span className="font-semibold text-emerald-800">
                      {selectedSubscribers.length} recipient(s) selected
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setActiveTab('subscribers')}
                      className="px-4 py-2 text-sm text-emerald-700 bg-emerald-100 rounded-lg hover:bg-emerald-200 transition-colors"
                    >
                      Modify Selection
                    </button>
                    <button
                      onClick={handleOpenBulkEmail}
                      className="px-4 py-2 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-2"
                    >
                      <Send className="w-4 h-4" />
                      Compose Email
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Available Templates */}
            {emailTemplates.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Available Templates</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {emailTemplates.map((template) => (
                    <div key={template.id} className="border border-slate-200 rounded-lg p-4">
                      <h4 className="font-semibold text-slate-900 mb-1">{template.name}</h4>
                      <p className="text-sm text-slate-600 mb-3">Subject: {template.subject}</p>
                      <button
                        onClick={() => {
                          if (selectedSubscribers.length === 0) {
                            toast.error('Please select recipients first');
                            return;
                          }
                          handleUseTemplate(template);
                          setShowBulkEmailModal(true);
                        }}
                        className="w-full px-3 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                        disabled={selectedSubscribers.length === 0}
                      >
                        Use This Template
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* NEW: Template Modal */}
        {showTemplateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-slate-200">
                <h3 className="text-xl font-semibold text-slate-900">
                  {editingTemplate ? 'Edit Template' : 'Create New Template'}
                </h3>
              </div>
              
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Template Name
                  </label>
                  <input
                    type="text"
                    value={templateForm.name}
                    onChange={(e) => setTemplateForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter template name..."
                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Email Subject
                  </label>
                  <input
                    type="text"
                    value={templateForm.subject}
                    onChange={(e) => setTemplateForm(prev => ({ ...prev, subject: e.target.value }))}
                    placeholder="Enter email subject..."
                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Email Content
                  </label>
                  <textarea
                    value={templateForm.content}
                    onChange={(e) => setTemplateForm(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="Enter email content..."
                    rows={8}
                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="p-6 border-t border-slate-200 flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowTemplateModal(false);
                    setTemplateForm({ name: '', subject: '', content: '' });
                    setEditingTemplate(null);
                  }}
                  className="px-4 py-2 text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveTemplate}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {editingTemplate ? 'Update Template' : 'Save Template'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* NEW: Bulk Email Modal */}
        {showBulkEmailModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-slate-200">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-semibold text-slate-900">
                    Compose Bulk Email
                  </h3>
                  <div className="text-sm text-slate-600">
                    To: {selectedSubscribers.length} recipient(s)
                  </div>
                </div>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Template Selection */}
                {emailTemplates.length > 0 && (
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-3">
                      Use Template (Optional)
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {emailTemplates.map((template) => (
                        <button
                          key={template.id}
                          onClick={() => handleUseTemplate(template)}
                          className={`p-3 border rounded-lg text-left transition-colors ${
                            selectedTemplate?.id === template.id
                              ? 'border-indigo-500 bg-indigo-50'
                              : 'border-slate-300 hover:border-slate-400'
                          }`}
                        >
                          <div className="font-medium text-slate-900">{template.name}</div>
                          <div className="text-sm text-slate-600">{template.subject}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Email Subject
                  </label>
                  <input
                    type="text"
                    value={bulkEmailForm.subject}
                    onChange={(e) => setBulkEmailForm(prev => ({ ...prev, subject: e.target.value }))}
                    placeholder="Enter email subject..."
                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Email Content
                  </label>
                  <textarea
                    value={bulkEmailForm.content}
                    onChange={(e) => setBulkEmailForm(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="Enter your email content here..."
                    rows={10}
                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div className="bg-slate-50 rounded-lg p-4">
                  <h4 className="font-semibold text-slate-900 mb-2">Preview Recipients</h4>
                  <div className="text-sm text-slate-600">
                    This email will be sent to {selectedSubscribers.length} subscriber(s).
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-slate-200 flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowBulkEmailModal(false);
                    setBulkEmailForm({ subject: '', content: '', useTemplate: false });
                    setSelectedTemplate(null);
                  }}
                  className="px-4 py-2 text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendBulkEmail}
                  disabled={isSendingEmail || !bulkEmailForm.subject.trim() || !bulkEmailForm.content.trim()}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2 disabled:bg-slate-400"
                >
                  {isSendingEmail ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Composing...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Open in Email Client
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal (UNCHANGED) */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
              <div className="flex items-center mb-4">
                <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                  <svg
                    className="h-6 w-6 text-red-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                </div>
              </div>

              <h3 className="text-lg font-medium text-gray-900 text-center mb-2">
                Confirm Delete
              </h3>

              <p className="text-sm text-gray-500 text-center mb-6">
                Are you sure you want to delete the subscriber{" "}
                <span className="font-medium text-gray-900">
                  "{newsletterToDelete?.name || "Unknown"}"
                </span>{" "}
                ({newsletterToDelete?.email || "Unknown"})? This action cannot
                be undone.
              </p>

              <div className="flex justify-center space-x-3">
                <button
                  onClick={handleCancelDelete}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  disabled={loading}
                  className="px-4 py-2 bg-red-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Newsletters;