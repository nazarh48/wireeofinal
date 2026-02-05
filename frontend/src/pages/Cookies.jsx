import { useState, useEffect } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function Cookies() {
    const [content, setContent] = useState("");
    const [loading, setLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchCookiePolicy();
    }, []);

    const fetchCookiePolicy = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_URL}/cookie-policy`);
            if (response.data.success) {
                setContent(response.data.data.content);
                setLastUpdated(response.data.data.lastUpdated);
            }
        } catch (err) {
            console.error("Error fetching cookie policy:", err);
            setError("Failed to load cookie policy. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
                    <p className="mt-4 text-slate-600">Loading cookie policy...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="max-w-md mx-auto text-center p-6">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                        <svg
                            className="w-12 h-12 text-red-500 mx-auto mb-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                        <h2 className="text-xl font-semibold text-red-900 mb-2">
                            Error Loading Content
                        </h2>
                        <p className="text-red-700">{error}</p>
                        <button
                            onClick={fetchCookiePolicy}
                            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                {/* Breadcrumb */}
                <nav className="mb-6 text-sm">
                    <ol className="flex items-center space-x-2 text-slate-600">
                        <li>
                            <a href="/" className="hover:text-emerald-600 transition-colors">
                                Home
                            </a>
                        </li>
                        <li>
                            <svg
                                className="w-4 h-4"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        </li>
                        <li className="text-slate-900 font-medium">Cookie Policy</li>
                    </ol>
                </nav>

                {/* Main Content */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-8 sm:p-12">
                        <div className="mb-8">
                            <h1 className="text-4xl font-bold text-slate-900 mb-4">
                                Cookie Policy
                            </h1>
                            {lastUpdated && (
                                <p className="text-sm text-slate-500">
                                    Last updated:{" "}
                                    {new Date(lastUpdated).toLocaleDateString("en-US", {
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                    })}
                                </p>
                            )}
                        </div>

                        {/* Cookie Policy Content */}
                        <div
                            className="prose prose-slate max-w-none
                prose-headings:text-slate-900 prose-headings:font-semibold
                prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4
                prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-3
                prose-p:text-slate-700 prose-p:leading-relaxed prose-p:mb-4
                prose-ul:my-4 prose-ul:list-disc prose-ul:pl-6
                prose-li:text-slate-700 prose-li:mb-2
                prose-strong:text-slate-900 prose-strong:font-semibold
                prose-a:text-emerald-600 prose-a:no-underline hover:prose-a:underline"
                            dangerouslySetInnerHTML={{ __html: content }}
                        />
                    </div>

                    {/* Footer Section */}
                    <div className="bg-slate-50 border-t border-slate-200 p-6 sm:p-8">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div className="flex items-start gap-3">
                                <svg
                                    className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-0.5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                </svg>
                                <div>
                                    <h3 className="font-semibold text-slate-900 mb-1">
                                        Questions about our cookie policy?
                                    </h3>
                                    <p className="text-sm text-slate-600">
                                        If you have any questions or concerns, please{" "}
                                        <a
                                            href="/contact"
                                            className="text-emerald-600 hover:text-emerald-700 font-medium"
                                        >
                                            contact us
                                        </a>
                                        .
                                    </p>
                                </div>
                            </div>
                            <a
                                href="/legal/privacy"
                                className="text-sm text-emerald-600 hover:text-emerald-700 font-medium whitespace-nowrap"
                            >
                                View Privacy Policy →
                            </a>
                        </div>
                    </div>
                </div>

                {/* Related Links */}
                <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <a
                        href="/legal/privacy"
                        className="p-4 bg-white rounded-lg border border-slate-200 hover:border-emerald-300 hover:shadow-md transition-all group"
                    >
                        <h3 className="font-semibold text-slate-900 mb-1 group-hover:text-emerald-600">
                            Privacy Policy
                        </h3>
                        <p className="text-sm text-slate-600">
                            Learn how we protect your data
                        </p>
                    </a>
                    <a
                        href="/legal/terms"
                        className="p-4 bg-white rounded-lg border border-slate-200 hover:border-emerald-300 hover:shadow-md transition-all group"
                    >
                        <h3 className="font-semibold text-slate-900 mb-1 group-hover:text-emerald-600">
                            Terms of Service
                        </h3>
                        <p className="text-sm text-slate-600">
                            Read our terms and conditions
                        </p>
                    </a>
                    <a
                        href="/contact"
                        className="p-4 bg-white rounded-lg border border-slate-200 hover:border-emerald-300 hover:shadow-md transition-all group"
                    >
                        <h3 className="font-semibold text-slate-900 mb-1 group-hover:text-emerald-600">
                            Contact Us
                        </h3>
                        <p className="text-sm text-slate-600">Get in touch with our team</p>
                    </a>
                </div>
            </div>
        </div>
    );
}
