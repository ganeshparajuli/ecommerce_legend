import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../../../../redux/store";
import {
  getAllNewsletters,
  createNewsletter,
  clearNewsletterErrors,
  subscribeNewsletter,
} from "../../../../redux/actions/newsletterAction";
import type { Newsletter } from "../../../../redux/constants/newsletterConstant";

interface FormData {
  email: string;
  name: string;
}

interface FormErrors {
  email?: string;
  name?: string;
  general?: string;
}

export const NewsletterSection: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();

  // Form state
  const [formData, setFormData] = useState<FormData>({
    email: "",
    name: "",
  });

  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // CRITICAL FIX: Use memoized selector to prevent unnecessary re-renders
  const newsletterState = useSelector((state: RootState) => {
    const newsletter = state.newsletter;
    // Return a new object each time to ensure we don't get stale references
    return {
      newsletters: newsletter?.newsletters ? [...newsletter.newsletters] : [],
      loading: newsletter?.loading ?? false,
      error: newsletter?.error ?? null,
      success: newsletter?.success ?? false,
      createLoading: newsletter?.createLoading ?? false,
      createSuccess: newsletter?.createSuccess ?? false,
      createError: newsletter?.createError ?? null,
    };
  });

  // Destructure memoized state
  const {
    newsletters,
    loading,
    error,
    success,
    createLoading,
    createSuccess,
    createError,
  } = newsletterState;

  // FIXED: Memoized fetch function to prevent infinite loops
  const fetchNewsletters = useCallback(() => {
    dispatch(getAllNewsletters());
  }, [dispatch]);

  // Fetch newsletters on mount - ONLY once
  useEffect(() => {
    fetchNewsletters();
  }, [fetchNewsletters]);

  // ENHANCED: Handle create success state with better logic
  useEffect(() => {
    if (createSuccess && !createLoading && !createError) {
      setIsSubscribed(true);
      setFormData({ email: "", name: "" });
      setFormErrors({});
      setIsSubmitting(false);

      // Clear success state after 3 seconds
      const timer = setTimeout(() => {
        setIsSubscribed(false);
        dispatch(clearNewsletterErrors());
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [createSuccess, createLoading, createError, dispatch]);

  // ENHANCED: Handle error state with better error handling
  useEffect(() => {
    const activeError = error || createError;
    if (activeError) {
      setIsSubmitting(false);
      setFormErrors({
        general:
          typeof activeError === "string"
            ? activeError
            : "Something went wrong",
      });

      // Clear errors after 5 seconds
      const timer = setTimeout(() => {
        dispatch(clearNewsletterErrors());
        setFormErrors({});
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [error, createError, dispatch]);

  // Memoized form validation
  const validateForm = useCallback((): boolean => {
    const errors: FormErrors = {};

    // Name validation (optional since it's commented out in form)
    if (formData.name.trim() && formData.name.trim().length < 2) {
      errors.name = "Name must be at least 2 characters";
    }

    // Email validation
    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) {
        errors.email = "Please enter a valid email address";
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData]);

  // OPTIMIZED: Handle input changes without causing re-renders
  const handleInputChange = useCallback(
    (field: keyof FormData, value: string) => {
      setFormData((prev) => {
        // Only update if value actually changed
        if (prev[field] === value) return prev;
        return { ...prev, [field]: value };
      });

      // Clear field-specific error when user starts typing
      if (formErrors[field]) {
        setFormErrors((prev) => {
          if (!prev[field]) return prev;
          const newErrors = { ...prev };
          delete newErrors[field];
          return newErrors;
        });
      }
    },
    [formErrors]
  );

  // ENHANCED: Form submission with better error handling
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!validateForm() || isSubmitting) {
        return;
      }

      setIsSubmitting(true);
      setFormErrors({});

      try {
        const emailValue = formData.email.trim().toLowerCase();
        const nameValue = formData.name.trim() || "Newsletter Subscriber";

        // CRITICAL: Use the subscription action directly
        await dispatch(subscribeNewsletter(emailValue, nameValue));
      } catch (err) {
        console.error("Newsletter subscription error:", err);
        setIsSubmitting(false);
        setFormErrors({
          general:
            err instanceof Error
              ? err.message
              : "Failed to subscribe. Please try again.",
        });
      }
    },
    [formData, validateForm, isSubmitting, dispatch]
  );

  // OPTIMIZED: Memoized subscriber count calculation
  const subscriberCount = useMemo((): number => {
    if (!newsletters || !Array.isArray(newsletters)) {
      return 0;
    }
    return newsletters.filter((newsletter) => newsletter.status === true)
      .length;
  }, [newsletters]);

  // Memoized loading spinner component
  const LoadingSpinner = useMemo(
    () => (
      <svg
        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    ),
    []
  );

  // Determine if we're in any loading state
  const isAnyLoading = loading || createLoading;

  return (
    <>
      {/* CSS Styles */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>

      <section className="relative bg-white py-6 overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-[linear-gradient(40deg,transparent_25%,rgba(68,68,68,.2)_50%,transparent_75%)] opacity-20"></div>
        <div className="absolute top-10 left-10 w-72 h-72 bg-purple-600 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute top-10 right-10 w-72 h-72 bg-cyan-600 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-600 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-4000"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-2">
              <div className="inline-block mb-2">
                <span className="bg-gradient-to-r from-cyan-600 to-purple-600 bg-clip-text text-transparent text-sm font-semibold tracking-wider uppercase">
                  Stay Connected
                </span>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-gray-900 via-gray-700 to-gray-800 bg-clip-text text-transparent mb-3 leading-tight">
                Join Our Newsletter
              </h2>
              <p className="text-body text-gray-600 max-w-2xl mx-auto leading-relaxed">
                Get exclusive insights, cutting-edge updates, and premium
                content delivered straight to your inbox.
              </p>
              {!isAnyLoading && newsletters.length > 0 && (
                <div className="inline-flex items-center space-x-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full px-4 py-2 backdrop-blur-sm">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                  <p className="text-cyan-600 font-medium text-sm">
                    {subscriberCount} innovators already subscribed
                  </p>
                </div>
              )}
            </div>

            <div className="bg-gray-50/80 backdrop-blur-2xl rounded-2xl shadow-xl border border-gray-200 p-4 md:py-6 md:px-16 relative overflow-hidden">
              {/* Card decoration */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400"></div>

              {!isSubscribed ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Email Input */}
                  <div className="group">
                    <label
                      htmlFor="email"
                      className="block text-body font-semibold text-gray-700 mb-2 transition-colors group-focus-within:text-purple-600"
                    >
                      Email Address
                    </label>
                    <div className="relative">
                      <input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          handleInputChange("email", e.target.value)
                        }
                        placeholder="Enter your email address"
                        className={`w-full px-3 py-2 bg-white border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:border-purple-400 transition-all duration-300 text-gray-800 placeholder-gray-400 text-body placeholder:text-body backdrop-blur-sm ${
                          formErrors.email
                            ? "border-red-400/50 focus:ring-red-400/50 focus:border-red-400"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                        aria-describedby={
                          formErrors.email ? "email-error" : undefined
                        }
                        disabled={isSubmitting || isAnyLoading}
                      />
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-400/0 via-pink-400/0 to-cyan-400/0 group-focus-within:from-purple-400/5 group-focus-within:via-pink-400/5 group-focus-within:to-cyan-400/5 pointer-events-none transition-all duration-300"></div>
                    </div>
                    {formErrors.email && (
                      <p
                        id="email-error"
                        className="mt-3 text-sm text-red-500 flex items-center animate-fadeIn"
                      >
                        <svg
                          className="w-4 h-4 mr-2"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                        {formErrors.email}
                      </p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting || isAnyLoading}
                    className={`w-full relative group overflow-hidden rounded-xl p-0 transition-all duration-300 ${
                      isSubmitting || isAnyLoading
                        ? "opacity-50 cursor-not-allowed"
                        : "hover:scale-[1.02] active:scale-[0.98]"
                    }`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-xl"></div>
                    <div
                      className={`relative bg-gradient-to-r from-cyan-600 via-purple-600 to-pink-600 rounded-xl px-8 py-2 transition-all duration-300 ${
                        isSubmitting || isAnyLoading
                          ? "opacity-70"
                          : "group-hover:from-cyan-500 group-hover:via-purple-500 group-hover:to-pink-500"
                      }`}
                    >
                      <div className="flex items-center justify-center text-white font-bold text-body">
                        {isSubmitting || isAnyLoading ? (
                          <>
                            {LoadingSpinner}
                            <span className="bg-gradient-to-r from-white to-cyan-100 bg-clip-text text-transparent">
                              Subscribing...
                            </span>
                          </>
                        ) : (
                          <>
                            <svg
                              className="w-6 h-6 mr-3 transition-transform duration-300 group-hover:translate-x-1"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                              />
                            </svg>
                            <span className="bg-gradient-to-r from-white to-cyan-100 bg-clip-text text-transparent">
                              Subscribe Now
                            </span>
                            <svg
                              className="w-5 h-5 ml-2 transition-transform duration-300 group-hover:translate-x-1"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M13 7l5 5m0 0l-5 5m5-5H6"
                              />
                            </svg>
                          </>
                        )}
                      </div>
                    </div>
                  </button>

                  {/* General Error */}
                  {formErrors.general && (
                    <div className="mt-6 p-3 bg-red-50 border border-red-200 rounded-xl backdrop-blur-sm animate-fadeIn">
                      <div className="flex items-start">
                        <div className="flex-shrink-0">
                          <svg
                            className="h-6 w-6 text-red-500"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                        <div className="ml-4">
                          <p className="text-red-700 font-medium">
                            {formErrors.general}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </form>
              ) : (
                /* Success State */
                <div className="text-center py-6 animate-fadeIn">
                  <div className="mb-6">
                    <div className="relative w-24 h-24 mx-auto mb-6">
                      <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full animate-pulse"></div>
                      <div className="relative w-24 h-24 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                        <svg
                          className="w-12 h-12 text-white animate-bounce"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="3"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
                    Welcome Aboard! 🎉
                  </h3>
                  <p className="text-body text-gray-600 mb-8 leading-relaxed max-w-lg mx-auto">
                    You're now part of our exclusive community! Get ready for
                    amazing content, insider tips, and special offers.
                  </p>
                  <div className="bg-green-50 border border-green-200 rounded-xl p-6 backdrop-blur-sm">
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <svg
                          className="w-6 h-6 text-green-600 mt-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </div>
                      <div className="ml-4 text-left">
                        <p className="text-green-700 font-semibold mb-2">
                          What's Next?
                        </p>
                        <p className="text-gray-600 text-sm leading-relaxed">
                          Check your email for a confirmation message and add us
                          to your contacts to ensure you never miss our premium
                          content!
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Privacy Notice */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500 leading-relaxed max-w-md mx-auto">
                We respect your privacy and will never spam you.
                <br />
                <span className="text-gray-600">
                  Unsubscribe anytime with one click.
                </span>
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default NewsletterSection;
