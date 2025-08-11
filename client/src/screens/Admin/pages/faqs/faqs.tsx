import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  getAllFaqs,
  addFaq,
  updateFaq,
  deleteFaq,
  clearFaqErrors,
} from "../../../../redux/actions/faqAction";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../../../redux/store";
import type { FAQ } from "../../../../redux/constants/faqConstants";
import {
  HelpCircle,
  Search,
  Eye,
  Edit,
  Trash2,
  Plus,
  Calendar,
  AlertCircle,
  CheckCircle,
  X,
  Download,
  FileText,
  Loader2,
  Save,
  Hash,
  MessageCircle,
  Star,
  Clock,
} from "lucide-react";

interface FaqFormData {
  question: string;
  answer: string;
  order: number;
}

const FaqAdmin: React.FC = () => {
  const dispatch = useDispatch();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFaq, setSelectedFaq] = useState<FAQ | null>(null);
  const [showFaqDetails, setShowFaqDetails] = useState(false);
  const [showFaqForm, setShowFaqForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [formData, setFormData] = useState<FaqFormData>({
    question: "",
    answer: "",
    order: 0,
  });

  // Get FAQs from Redux store
  const {
    faqs,
    loading,
    error: reduxError,
    success,
  } = useSelector((state: RootState) => state.faqs);

  // Debug logging
  useEffect(() => {
    console.log("FAQ state updated:", {
      faqsCount: faqs?.length || 0,
      loading,
      error: reduxError,
      success,
      sampleFaq: faqs?.[0]
        ? {
            id: faqs[0].id,
            question: faqs[0].question?.substring(0, 50) + "...",
            hasId: !!faqs[0].id,
          }
        : null,
    });
  }, [faqs, loading, reduxError, success]);

  // Fetch FAQs on component mount
  useEffect(() => {
    dispatch(getAllFaqs() as any);
  }, [dispatch]);

  // Clear success message after 3 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        dispatch(clearFaqErrors());
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success, dispatch]);

  // Filter FAQs based on search term only
  const filteredFaqs =
    faqs?.filter((faq: FAQ) => {
      // Check if faq exists and has required properties
      if (!faq || typeof faq !== "object") {
        return false;
      }

      // Check if question and answer exist and are strings
      const question = faq.question || "";
      const answer = faq.answer || "";

      // Ensure they are strings before calling toLowerCase()
      const questionStr =
        typeof question === "string" ? question : String(question);
      const answerStr = typeof answer === "string" ? answer : String(answer);

      return (
        questionStr.toLowerCase().includes(searchTerm.toLowerCase()) ||
        answerStr.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }) || []; // Fallback to empty array if faqs is null/undefined

  // View FAQ details
  const viewFaqDetails = (faq: FAQ) => {
    setSelectedFaq(faq);
    setShowFaqDetails(true);
  };

  // Open FAQ form for creating or editing
  const openFaqForm = (faq?: FAQ) => {
    console.log(
      "Opening FAQ form for:",
      faq ? `editing FAQ ${faq.id}` : "creating new FAQ"
    );

    if (faq) {
      // Ensure FAQ has required properties
      if (!faq.id) {
        console.error("FAQ missing ID:", faq);
        setLocalError(
          "Selected FAQ is missing required information. Please refresh and try again."
        );
        return;
      }

      setIsEditing(true);
      setSelectedFaq(faq);
      setFormData({
        question: faq.question || "",
        answer: faq.answer || "",
        order: faq.order || 0,
      });
      console.log("Set form data for editing:", {
        question: faq.question,
        answer: faq.answer,
        order: faq.order,
      });
    } else {
      setIsEditing(false);
      setSelectedFaq(null);
      setFormData({
        question: "",
        answer: "",
        order: faqs.length + 1,
      });
      console.log("Set form data for creating new FAQ");
    }

    // Clear any previous errors
    setLocalError(null);
    setShowFaqForm(true);
  };

  // Handle form submit
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Clear any previous errors
    setLocalError(null);

    try {
      let result;
      if (isEditing && selectedFaq) {
        // Check if selectedFaq has an id
        if (!selectedFaq.id) {
          console.error("Selected FAQ missing ID:", selectedFaq);
          setLocalError(
            "Selected FAQ is missing ID. Please try selecting the FAQ again."
          );
          return;
        }

        console.log("Updating FAQ with ID:", selectedFaq.id, "Data:", formData);
        result = await dispatch(updateFaq(selectedFaq.id, formData) as any);
        console.log("Update result:", result);
      } else {
        console.log("Creating new FAQ with data:", formData);
        result = await dispatch(addFaq(formData) as any);
        console.log("Create result:", result);
      }

      // Check for different possible success responses
      const isSuccess =
        result === "success" ||
        result?.type?.includes("SUCCESS") ||
        result?.payload?.message?.includes("success") ||
        result?.message?.includes("success") ||
        (typeof result === "object" && result !== null && !result.error);

      console.log("Is success:", isSuccess, "Result:", result);

      if (isSuccess) {
        setShowFaqForm(false);
        setFormData({
          question: "",
          answer: "",
          order: 0,
        });
        setSelectedFaq(null);
        setIsEditing(false);

        // Refresh FAQs list
        console.log("Refreshing FAQ list...");
        await dispatch(getAllFaqs() as any);
      } else {
        console.error("Update failed:", result);
        setLocalError(
          result?.message ||
            result?.error ||
            "Failed to save FAQ. Please try again."
        );
      }
    } catch (error) {
      console.error("Error submitting FAQ:", error);
      setLocalError(
        error instanceof Error
          ? error.message
          : "An unexpected error occurred. Please try again."
      );
    }
  };

  // Delete FAQ
  const handleDeleteFaq = async (faqId: string) => {
    if (!faqId) {
      console.error("No FAQ ID provided for deletion");
      setLocalError("Cannot delete FAQ: Missing ID");
      return;
    }

    if (
      !window.confirm(
        "Are you sure you want to delete this FAQ? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      console.log("Deleting FAQ with ID:", faqId);
      const result = await dispatch(deleteFaq(faqId) as any);
      console.log("Delete result:", result);

      // Check for different possible success responses
      const isSuccess =
        result === "success" ||
        result?.type?.includes("SUCCESS") ||
        result?.payload?.message?.includes("success") ||
        result?.message?.includes("success") ||
        (typeof result === "object" && result !== null && !result.error);

      if (isSuccess) {
        // Close dialogs if deleting the currently viewed FAQ
        if (selectedFaq && selectedFaq.id === faqId) {
          setShowFaqDetails(false);
          setShowFaqForm(false);
          setSelectedFaq(null);
        }

        // Clear any errors
        setLocalError(null);

        // Refresh FAQs list
        console.log("Refreshing FAQ list after deletion...");
        await dispatch(getAllFaqs() as any);
      } else {
        console.error("Delete failed:", result);
        setLocalError(
          result?.message ||
            result?.error ||
            "Failed to delete FAQ. Please try again."
        );
      }
    } catch (error) {
      console.error("Error deleting FAQ:", error);
      setLocalError(
        error instanceof Error
          ? error.message
          : "An unexpected error occurred while deleting the FAQ."
      );
    }
  };

  // CSV Export Function
  const exportToCSV = () => {
    setIsExporting(true);

    try {
      const headers = [
        "ID",
        "Question",
        "Answer",
        "Order",
        "Date Created",
        "Last Updated",
      ];

      const csvData = filteredFaqs.map((faq) => [
        faq.id,
        faq.question.replace(/"/g, '""'),
        faq.answer.replace(/"/g, '""'),
        faq.order || 0,
        new Date(faq.created_at || faq.createdAt).toLocaleDateString("en-US"),
        new Date(faq.updated_at || faq.updatedAt).toLocaleDateString("en-US"),
      ]);

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

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);

      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `faqs_export_${new Date().toISOString().split("T")[0]}.csv`
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
  const totalFaqs = faqs.length;

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
            <p className="text-lg font-medium text-gray-700">Loading FAQs...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen my-10 bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50">
      <div className="container mx-auto p-6 space-y-8">
        {/* Modern Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl blur-sm opacity-75"></div>
              <div className="relative p-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl">
                <HelpCircle className="w-8 h-8 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                FAQ Management
              </h1>
              <p className="text-gray-600 mt-1">
                Manage frequently asked questions for your customers
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => dispatch(getAllFaqs() as any)}
              disabled={loading}
              className="inline-flex items-center px-4 py-2.5 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Refreshing...
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4 mr-2" />
                  Refresh
                </>
              )}
            </button>

            <button
              onClick={exportToCSV}
              disabled={isExporting || filteredFaqs.length === 0}
              className="inline-flex items-center px-4 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
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

            <button
              onClick={() => openFaqForm()}
              className="inline-flex items-center px-4 py-2.5 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add New FAQ
            </button>
          </div>
        </motion.div>

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
            <div className="max-w-lg">
              <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                <Search className="w-4 h-4 mr-2" />
                Search FAQs
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Search by question or answer..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-12 border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-purple-600 mb-1">
                    Total FAQs
                  </p>
                  <p className="text-3xl font-bold text-purple-900">
                    {totalFaqs}
                  </p>
                </div>
                <div className="p-3 bg-purple-500 rounded-xl">
                  <HelpCircle className="w-6 h-6 text-white" />
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
                    {filteredFaqs.length}
                  </p>
                </div>
                <div className="p-3 bg-green-500 rounded-xl">
                  <Search className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* FAQs Table */}
        <Card className="shadow-sm border-0 bg-white">
          <CardHeader className="border-b border-gray-200 p-6">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center text-xl font-bold text-gray-900">
                <HelpCircle className="w-5 h-5 mr-2" />
                FAQs ({filteredFaqs.length})
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <FileText className="w-4 h-4" />
                <span>Knowledge base content</span>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Question
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Order
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Updated
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredFaqs.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center py-12">
                        <HelpCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-lg font-medium text-gray-500">
                          {searchTerm
                            ? "No FAQs match your search"
                            : "No FAQs found"}
                        </p>
                        {!searchTerm && (
                          <button
                            onClick={() => openFaqForm()}
                            className="mt-4 inline-flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors"
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Your First FAQ
                          </button>
                        )}
                      </td>
                    </tr>
                  ) : (
                    filteredFaqs.map((faq: FAQ) => (
                      <tr
                        key={faq.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-start">
                            <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold mr-3 mt-1 flex-shrink-0">
                              ?
                            </div>
                            <div className="flex-1">
                              <div className="text-sm font-semibold text-gray-900 max-w-lg">
                                {faq.question}
                              </div>
                              <div className="text-xs text-gray-500 mt-1 max-w-lg">
                                {faq.answer.length > 100
                                  ? `${faq.answer.substring(0, 100)}...`
                                  : faq.answer}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center text-sm text-gray-700">
                            <Hash className="w-4 h-4 mr-1 text-gray-400" />
                            {faq.order || 0}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center text-sm text-gray-700">
                            <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                            {formatDate(faq.updated_at || faq.updatedAt)}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end space-x-2">
                            <button
                              className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                              onClick={() => viewFaqDetails(faq)}
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              View
                            </button>
                            <button
                              className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-purple-600 hover:text-purple-800 hover:bg-purple-50 rounded-lg transition-colors"
                              onClick={() => openFaqForm(faq)}
                            >
                              <Edit className="w-4 h-4 mr-1" />
                              Edit
                            </button>
                            <button
                              className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                              onClick={() => handleDeleteFaq(faq.id)}
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

        {/* FAQ Details Dialog */}
        {selectedFaq && showFaqDetails && (
          <Dialog open={showFaqDetails} onOpenChange={setShowFaqDetails}>
            <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto bg-white/95 backdrop-blur-md shadow-2xl border border-white/20 z-50 rounded-2xl">
              <DialogHeader className="bg-gradient-to-r from-purple-50/80 to-blue-50/80 -m-6 mb-6 p-6 rounded-t-2xl border-b border-gray-200/50">
                <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center">
                  <div className="relative mr-3">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl blur-sm opacity-75"></div>
                    <div className="relative p-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl">
                      <Eye className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  FAQ Details
                </DialogTitle>
                <p className="text-gray-600 mt-2">
                  Review the complete FAQ information and customer interaction
                  details.
                </p>
              </DialogHeader>

              <div className="space-y-8">
                {/* Question Section */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <div className="border-b border-gray-200 pb-4">
                    <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-3">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <HelpCircle className="w-5 h-5 text-purple-600" />
                      </div>
                      Customer Question
                    </h3>
                    <p className="text-sm text-gray-600 mt-2">
                      The question that customers are asking
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200/50">
                    <div className="flex items-start">
                      <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center text-white font-bold mr-4 mt-1 flex-shrink-0">
                        ?
                      </div>
                      <div className="flex-1">
                        <p className="text-gray-900 font-semibold text-lg leading-relaxed">
                          {selectedFaq.question}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Answer Section */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="space-y-6"
                >
                  <div className="border-b border-gray-200 pb-4">
                    <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <MessageCircle className="w-5 h-5 text-blue-600" />
                      </div>
                      Answer Content
                    </h3>
                    <p className="text-sm text-gray-600 mt-2">
                      The detailed response provided to customers
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200/50">
                    <div className="bg-white rounded-lg p-6 border border-blue-200 shadow-sm">
                      <div className="flex items-start">
                        <div className="p-2 bg-blue-100 rounded-lg mr-4 flex-shrink-0">
                          <MessageCircle className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-gray-800 whitespace-pre-wrap leading-relaxed text-base">
                            {selectedFaq.answer}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Meta Information Section */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="space-y-6"
                >
                  <div className="border-b border-gray-200 pb-4">
                    <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-3">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <Calendar className="w-5 h-5 text-green-600" />
                      </div>
                      FAQ Information
                    </h3>
                    <p className="text-sm text-gray-600 mt-2">
                      Display settings and tracking information
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200/50">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-semibold text-purple-600 mb-1 flex items-center">
                            <Hash className="w-4 h-4 mr-1" />
                            Display Order
                          </h4>
                          <p className="text-2xl font-bold text-purple-900">
                            #{selectedFaq.order || 0}
                          </p>
                        </div>
                        <div className="p-3 bg-purple-500 rounded-xl">
                          <Hash className="w-5 h-5 text-white" />
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200/50">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-semibold text-green-600 mb-1 flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            Created
                          </h4>
                          <p className="text-sm font-medium text-green-900">
                            {formatDate(
                              selectedFaq.created_at || selectedFaq.createdAt
                            )}
                          </p>
                        </div>
                        <div className="p-3 bg-green-500 rounded-xl">
                          <Plus className="w-5 h-5 text-white" />
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200/50">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-semibold text-blue-600 mb-1 flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            Last Updated
                          </h4>
                          <p className="text-sm font-medium text-blue-900">
                            {formatDate(
                              selectedFaq.updated_at || selectedFaq.updatedAt
                            )}
                          </p>
                        </div>
                        <div className="p-3 bg-blue-500 rounded-xl">
                          <Clock className="w-5 h-5 text-white" />
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Preview Section */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="space-y-6"
                >
                  <div className="border-b border-gray-200 pb-4">
                    <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-3">
                      <div className="p-2 bg-amber-100 rounded-lg">
                        <Eye className="w-5 h-5 text-amber-600" />
                      </div>
                      Customer View Preview
                    </h3>
                    <p className="text-sm text-gray-600 mt-2">
                      How this FAQ appears to customers on your website
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
                    <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-lg">
                      <div className="mb-4">
                        <div className="flex items-start">
                          <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold mr-3 mt-1 flex-shrink-0">
                            ?
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 text-lg">
                              {selectedFaq.question}
                            </h4>
                          </div>
                        </div>
                      </div>

                      <div className="pl-11">
                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                          <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                            {selectedFaq.answer}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Action Buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="flex flex-col sm:flex-row justify-end gap-4 pt-8 border-t border-gray-200"
                >
                  <button
                    type="button"
                    onClick={() => setShowFaqDetails(false)}
                    className="w-full sm:w-auto order-2 sm:order-1 h-12 px-6 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-semibold"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => openFaqForm(selectedFaq)}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 w-full sm:w-auto order-1 sm:order-2 shadow-lg hover:shadow-xl h-12 rounded-xl px-8 text-white font-semibold transform hover:scale-105 transition-all duration-200"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit FAQ
                  </button>
                </motion.div>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Modern FAQ Form Dialog */}
        <Dialog open={showFaqForm} onOpenChange={setShowFaqForm}>
          <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto bg-white/95 backdrop-blur-md shadow-2xl border border-white/20 z-50 rounded-2xl">
            <DialogHeader className="bg-gradient-to-r from-purple-50/80 to-blue-50/80 -m-6 mb-6 p-6 rounded-t-2xl border-b border-gray-200/50">
              <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center">
                <div className="relative mr-3">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl blur-sm opacity-75"></div>
                  <div className="relative p-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl">
                    <HelpCircle className="w-6 h-6 text-white" />
                  </div>
                </div>
                {isEditing ? "Edit FAQ" : "Add New FAQ"}
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleFormSubmit} className="space-y-8">
              {/* Question Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="border-b border-gray-200 pb-4">
                  <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <HelpCircle className="w-5 h-5 text-purple-600" />
                    </div>
                    Question Information
                  </h3>
                  <p className="text-sm text-gray-600 mt-2">
                    Start with the question your customers are asking
                  </p>
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-3 block">
                    Customer Question <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="What is your frequently asked question?"
                      value={formData.question}
                      onChange={(e) =>
                        setFormData({ ...formData, question: e.target.value })
                      }
                      className="w-full px-4 py-4 text-base border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-200 bg-white"
                      required
                    />
                  </div>
                  <p className="text-sm text-gray-500 mt-2 flex items-center">
                    <MessageCircle className="w-4 h-4 mr-1" />
                    Write a clear, concise question that customers frequently
                    ask
                  </p>
                </div>
              </motion.div>

              {/* Answer Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="space-y-6"
              >
                <div className="border-b border-gray-200 pb-4">
                  <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <MessageCircle className="w-5 h-5 text-blue-600" />
                    </div>
                    Answer Content
                  </h3>
                  <p className="text-sm text-gray-600 mt-2">
                    Provide a helpful and comprehensive answer
                  </p>
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-3 block">
                    Detailed Answer <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <textarea
                      placeholder="Provide a detailed and helpful answer that fully addresses the customer's question..."
                      value={formData.answer}
                      onChange={(e) =>
                        setFormData({ ...formData, answer: e.target.value })
                      }
                      rows={10}
                      className="w-full px-4 py-4 text-base border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-200 bg-white resize-vertical min-h-[250px]"
                      required
                    />
                  </div>
                  <p className="text-sm text-gray-500 mt-2 flex items-center">
                    <Star className="w-4 h-4 mr-1" />
                    Provide a comprehensive, helpful answer that solves the
                    customer's problem
                  </p>
                </div>
              </motion.div>

              {/* Settings Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="space-y-6"
              >
                <div className="border-b border-gray-200 pb-4">
                  <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Hash className="w-5 h-5 text-green-600" />
                    </div>
                    Display Settings
                  </h3>
                  <p className="text-sm text-gray-600 mt-2">
                    Control how this FAQ appears in your knowledge base
                  </p>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-xl p-6 border border-green-200/50">
                  <label className="text-sm font-semibold text-gray-700 mb-3 block">
                    Display Order
                  </label>
                  <div className="relative max-w-xs">
                    <Hash className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="number"
                      placeholder="1"
                      value={formData.order}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          order: parseInt(e.target.value) || 0,
                        })
                      }
                      className="w-full pl-12 pr-4 py-4 text-base border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-200 bg-white"
                      min="0"
                    />
                  </div>
                  <p className="text-sm text-gray-500 mt-2 flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    Lower numbers appear first in the FAQ list (optional)
                  </p>
                </div>
              </motion.div>

              {/* Preview Section */}
              {(formData.question || formData.answer) && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="space-y-6"
                >
                  <div className="border-b border-gray-200 pb-4">
                    <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-3">
                      <div className="p-2 bg-amber-100 rounded-lg">
                        <Eye className="w-5 h-5 text-amber-600" />
                      </div>
                      Preview
                    </h3>
                    <p className="text-sm text-gray-600 mt-2">
                      See how your FAQ will appear to customers
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
                    {formData.question && (
                      <div className="mb-4">
                        <div className="flex items-start">
                          <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold mr-3 mt-1 flex-shrink-0">
                            ?
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 text-lg">
                              {formData.question}
                            </h4>
                          </div>
                        </div>
                      </div>
                    )}

                    {formData.answer && (
                      <div className="pl-11">
                        <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                          <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                            {formData.answer}
                          </p>
                        </div>
                      </div>
                    )}

                    {!formData.question && !formData.answer && (
                      <div className="text-center py-8 text-gray-500">
                        <Eye className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p>Start typing to see a preview of your FAQ</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex flex-col sm:flex-row justify-end gap-4 pt-8 border-t border-gray-200"
              >
                <button
                  type="button"
                  onClick={() => setShowFaqForm(false)}
                  className="w-full sm:w-auto order-2 sm:order-1 h-12 px-6 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 w-full sm:w-auto order-1 sm:order-2 shadow-lg hover:shadow-xl h-12 rounded-xl px-8 text-white font-semibold transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      {isEditing ? "Update FAQ" : "Create FAQ"}
                    </>
                  )}
                </button>
              </motion.div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default FaqAdmin;
