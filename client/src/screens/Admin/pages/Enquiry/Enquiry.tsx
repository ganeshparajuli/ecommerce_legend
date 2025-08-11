import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../../components/ui/card";
import { Input } from "../../../../components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../../../components/ui/dialog";
import {
  getAllContacts,
  deleteContact,
  clearContactErrors,
} from "../../../../redux/actions/contactAction";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../../../redux/store";
import {
  MessageSquare,
  Search,
  Eye,
  Trash2,
  Mail,
  Calendar,
  AlertCircle,
  CheckCircle,
  X,
  Download,
  FileText,
  Loader2,
  MessageCircle,
  Phone,
  User,
  Clock,
  Reply,
  Archive,
  Star
} from "lucide-react";

// API Contact type based on actual API response
interface ApiContact {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  created_at: string;
  updated_at: string;
}

// Normalized contact type
interface ProcessedContact extends ApiContact {
  createdAt: string;
  updatedAt: string;
}

const ContactAdmin: React.FC = () => {
  const dispatch = useDispatch();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedContact, setSelectedContact] =
    useState<ProcessedContact | null>(null);
  const [showContactDetails, setShowContactDetails] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  // Get contacts from Redux store
  const {
    contacts: rawContacts,
    loading,
    error: reduxError,
    success,
  } = useSelector((state: RootState) => state.contact);

  // Process and normalize contacts from API
  const processContacts = (apiContacts: any[]): ProcessedContact[] => {
    if (!Array.isArray(apiContacts)) return [];

    return apiContacts
      .filter(
        (contact) => contact && contact.id && contact.name && contact.email
      )
      .map((contact: ApiContact) => ({
        ...contact,
        // Normalize date field names for consistency
        createdAt: contact.created_at || new Date().toISOString(),
        updatedAt:
          contact.updated_at || contact.created_at || new Date().toISOString(),
      }));
  };

  const contacts = processContacts(rawContacts);

  // Debug log
  useEffect(() => {
    console.log("ContactAdmin - Raw contacts from Redux:", rawContacts);
    console.log("ContactAdmin - Processed contacts:", contacts);
    if (contacts.length > 0) {
      console.log("ContactAdmin - First contact sample:", contacts[0]);
    }
  }, [rawContacts, contacts]);

  // Fetch contacts on component mount
  useEffect(() => {
    console.log("ContactAdmin - Dispatching getAllContacts...");
    dispatch(getAllContacts() as any);
  }, [dispatch]);

  // Clear success message after 3 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        dispatch(clearContactErrors());
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success, dispatch]);

  // Filter contacts based on search term only
  const filteredContacts = contacts.filter((contact: ProcessedContact) => {
    const name = String(contact.name || "").trim();
    const email = String(contact.email || "").trim();
    const subject = String(contact.subject || "").trim();
    const message = String(contact.message || "").trim();
    const phone = String(contact.phone || "").trim();

    const matchesSearch =
      name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      phone.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  // View contact details
  const viewContactDetails = (contact: ProcessedContact) => {
    setSelectedContact(contact);
    setShowContactDetails(true);
  };

  // Delete contact
  const handleDeleteContact = async (contactId: string) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this enquiry? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      const result = await dispatch(deleteContact(contactId) as any);
      if (result === "success") {
        // Close dialog if deleting the currently viewed contact
        if (selectedContact && selectedContact.id === contactId) {
          setShowContactDetails(false);
          setSelectedContact(null);
        }
        // Refresh contacts list
        dispatch(getAllContacts() as any);
      }
    } catch (error) {
      console.error("Error deleting contact:", error);
      setLocalError("Failed to delete contact");
    }
  };

  // CSV Export Function
  const exportToCSV = () => {
    setIsExporting(true);

    try {
      // Prepare CSV headers
      const headers = [
        "ID",
        "Name",
        "Email",
        "Phone",
        "Subject",
        "Message",
        "Date Submitted",
        "Last Updated",
      ];

      // Prepare CSV data
      const csvData = filteredContacts.map((contact) => [
        contact.id || "",
        contact.name || "Unknown",
        contact.email || "No email",
        contact.phone || "No phone",
        contact.subject || "No subject",
        (contact.message || "No message").replace(/"/g, '""'), // Escape quotes in message
        formatDate(contact.createdAt),
        formatDate(contact.updatedAt),
      ]);

      // Create CSV content
      const csvContent = [
        headers.join(","),
        ...csvData.map((row) =>
          row
            .map((field) =>
              typeof field === "string" &&
              (field.includes(",") ||
                field.includes('"') ||
                field.includes("\n"))
                ? `"${field}"`
                : field
            )
            .join(",")
        ),
      ].join("\n");

      // Create and download file
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);

      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `enquiries_export_${new Date().toISOString().split("T")[0]}.csv`
      );
      link.style.visibility = "hidden";

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setLocalError(null);
    } catch (error) {
      console.error("Error exporting CSV:", error);
      setLocalError("Failed to export CSV file");
    } finally {
      setIsExporting(false);
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      return "Invalid date";
    }
  };

  // Calculate metrics
  const totalContacts = contacts.length;

  // Display error message
  const errorMessage =
    localError || (typeof reduxError === "string" ? reduxError : null);

  // Loading state
  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-700">
              Loading Enquiries...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container my-10 mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <MessageSquare className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Enquiry Management
            </h1>
            <p className="text-gray-600">
              Manage customer enquiries and contact submissions
            </p>
          </div>
        </div>

        {/* Export Button */}
        <div className="flex items-center space-x-3">
          <button
            onClick={exportToCSV}
            disabled={isExporting || filteredContacts.length === 0}
            className="inline-flex items-center px-4 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isExporting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </>
            )}
          </button>

          <div className="text-right">
            <p className="text-sm text-gray-500">
              {filteredContacts.length} enquiries ready to export
            </p>
          </div>
        </div>
      </div>

      {/* Success Message */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-start space-x-3">
          <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="font-semibold text-green-800">Success</h3>
            <p className="text-green-700">Operation completed successfully</p>
          </div>
        </div>
      )}

      {/* Error Display */}
      {errorMessage && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="font-semibold text-red-800">Error</h3>
            <p className="text-red-700">{errorMessage}</p>
          </div>
          <button
            onClick={() => setLocalError(null)}
            className="text-red-400 hover:text-red-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Search */}
      <Card className="shadow-sm border-0 bg-white">
        <CardContent className="p-6">
          <div className="flex items-center space-x-3">
            <Search className="w-4 h-4 text-gray-400" />
            <label className="text-sm font-semibold text-gray-700">
              Search Enquiries
            </label>
          </div>
          <div className="relative mt-3">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Search by name, email, phone, subject or message..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-12 border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-blue-600 mb-1">
                  Total Enquiries
                </p>
                <p className="text-3xl font-bold text-blue-900">
                  {totalContacts}
                </p>
              </div>
              <div className="p-3 bg-blue-500 rounded-xl">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-green-600 mb-1">
                  Filtered Results
                </p>
                <p className="text-3xl font-bold text-green-900">
                  {filteredContacts.length}
                </p>
              </div>
              <div className="p-3 bg-green-500 rounded-xl">
                <Search className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Contacts Table */}
      <Card className="shadow-sm border-0 bg-white">
        <CardHeader className="border-b border-gray-200 p-6">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center text-xl font-bold text-gray-900">
              <MessageSquare className="w-5 h-5 mr-2" />
              Enquiries ({filteredContacts.length})
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <FileText className="w-4 h-4" />
              <span>Customer enquiries</span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Contact Info
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Subject & Message
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredContacts.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-12">
                      <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-lg font-medium text-gray-500">
                        {searchTerm
                          ? "No enquiries match your search"
                          : "No enquiries found"}
                      </p>
                      {!searchTerm && (
                        <div className="mt-4 space-y-2">
                          <p className="text-sm text-gray-400">
                            {loading
                              ? "Loading data..."
                              : "Data might not be loaded yet"}
                          </p>
                          <button
                            onClick={() => {
                              console.log("Retry button clicked");
                              dispatch(getAllContacts() as any);
                            }}
                            className="inline-flex items-center px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                          >
                            <Loader2 className="w-4 h-4 mr-2" />
                            Retry Loading
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ) : (
                  filteredContacts.map((contact: ProcessedContact) => (
                    <tr
                      key={contact.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold mr-4">
                            {contact.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-gray-900">
                              {contact.name}
                            </div>
                            <div className="flex items-center text-sm text-gray-500 mt-1">
                              <Mail className="w-4 h-4 mr-1" />
                              {contact.email}
                            </div>
                            {contact.phone && (
                              <div className="flex items-center text-sm text-gray-500 mt-1">
                                <Phone className="w-4 h-4 mr-1" />
                                {contact.phone}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900 truncate max-w-xs">
                          {contact.subject}
                        </div>
                        <div className="text-xs text-gray-500 mt-1 truncate max-w-xs">
                          {contact.message.substring(0, 60)}...
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center text-sm text-gray-700">
                          <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                          {formatDate(contact.createdAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end space-x-2">
                          <button
                            className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                            onClick={() => viewContactDetails(contact)}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </button>
                          <button
                            className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                            onClick={() => handleDeleteContact(contact.id)}
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Contact Details Dialog */}
      {selectedContact && (
        <Dialog open={showContactDetails} onOpenChange={setShowContactDetails}>
          <DialogContent className="sm:max-w-[800px] max-h-[95vh] overflow-hidden bg-gradient-to-br from-gray-50 to-white">
            <DialogHeader className="border-b border-gray-200 pb-6 bg-white -mx-6 -mt-6 px-6 pt-6 rounded-t-lg">
              <DialogTitle className="flex items-center justify-between">
                <div className="flex items-center text-xl font-bold text-gray-900">
                  <div className="p-2 bg-blue-100 rounded-lg mr-3">
                    <MessageSquare className="w-5 h-5 text-blue-600" />
                  </div>
                  Enquiry Details
                </div>
                <button
                  onClick={() => setShowContactDetails(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-8 pt-6 overflow-y-auto max-h-[calc(95vh-120px)]">
              {/* Enhanced Contact Header */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-start space-x-6">
                  <div className="relative">
                    <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                      {selectedContact.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-4 border-white flex items-center justify-center">
                      <MessageCircle className="w-3 h-3 text-white" />
                    </div>
                  </div>
                  
                  <div className="flex-1 space-y-3">
                    <div>
                      <h2 className="text-3xl font-bold text-gray-900 mb-1">
                        {selectedContact.name}
                      </h2>
                      <p className="text-gray-500 text-sm bg-gray-100 px-3 py-1.5 rounded-lg inline-block">
                        ID: {selectedContact.id}
                      </p>
                    </div>
                    
                    <div className="flex flex-wrap gap-3">
                      <div className="flex items-center space-x-2 bg-blue-50 px-3 py-2 rounded-lg border border-blue-200">
                        <Mail className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-800">
                          {selectedContact.email}
                        </span>
                      </div>
                      
                      {selectedContact.phone && (
                        <div className="flex items-center space-x-2 bg-green-50 px-3 py-2 rounded-lg border border-green-200">
                          <Phone className="w-4 h-4 text-green-600" />
                          <span className="text-sm font-medium text-green-800">
                            {selectedContact.phone}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Enhanced Subject */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-start space-x-4">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <FileText className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Subject</h3>
                    <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-4 rounded-lg border border-yellow-200">
                      <p className="text-gray-900 font-medium text-lg">
                        {selectedContact.subject}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Enhanced Message */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-start space-x-4">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <MessageCircle className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Message</h3>
                    <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-6 rounded-lg border border-purple-200">
                      <p className="text-gray-900 whitespace-pre-wrap leading-relaxed">
                        {selectedContact.message}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Enhanced Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-green-500 rounded-full">
                      <Calendar className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-green-600 mb-1">Date Submitted</h3>
                      <p className="text-lg font-bold text-green-900">
                        {formatDate(selectedContact.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-blue-500 rounded-full">
                      <Clock className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-blue-600 mb-1">Last Updated</h3>
                      <p className="text-lg font-bold text-blue-900">
                        {formatDate(selectedContact.updatedAt)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Enhanced Actions */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                  <div className="p-2 bg-gray-100 rounded-lg mr-3">
                    <Star className="w-5 h-5 text-gray-600" />
                  </div>
                  Available Actions
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button
                    onClick={() => window.location.href = `mailto:${selectedContact.email}?subject=Re: ${selectedContact.subject}`}
                    className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                  >
                    <Reply className="w-5 h-5 mr-2" />
                    Reply via Email
                  </button>
                  
                  <button
                    onClick={() => {
                      // Add archive functionality here
                      console.log("Archive enquiry:", selectedContact.id);
                    }}
                    className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                  >
                    <Archive className="w-5 h-5 mr-2" />
                    Archive
                  </button>
                  
                  <button
                    onClick={() => handleDeleteContact(selectedContact.id)}
                    className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                  >
                    <Trash2 className="w-5 h-5 mr-2" />
                    Delete Enquiry
                  </button>
                </div>
                
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <button
                    onClick={() => setShowContactDetails(false)}
                    className="inline-flex items-center px-6 py-3 border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold rounded-lg transition-all duration-200 w-full justify-center"
                  >
                    <X className="w-5 h-5 mr-2" />
                    Close
                  </button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default ContactAdmin;