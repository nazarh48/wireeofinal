import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { API_BASE_URL, apiService } from "../services/api";

const VALID_PAGES = {
  privacy: {
    title: "Privacy Policy",
    description: "Learn how we collect, use, and protect your personal data.",
  },
  terms: {
    title: "Terms of Service",
    description: "Understand the terms and conditions for using our services.",
  },
};

const Legal = () => {
  const { page } = useParams();
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);
  const [updatedBy, setUpdatedBy] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const loadPage = async () => {
      if (!page || !VALID_PAGES[page]) {
        setError("Requested legal page was not found.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response = await apiService.legal.getPage(page);

        if (response?.success !== false) {
          // apiService.legal.getPage returns the unwrapped data, so handle both shapes
          const data = response?.data || response;
          if (isMounted) {
            setContent(data?.content || "");
            setLastUpdated(data?.lastUpdated || null);
            setUpdatedBy(data?.updatedBy || null);
          }
        } else if (isMounted) {
          setError(response?.message || "Failed to load legal page.");
        }
      } catch (err) {
        console.error("Error loading legal page:", err);
        if (isMounted) {
          setError("Failed to load content. Please try again later.");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadPage();

    return () => {
      isMounted = false;
    };
  }, [page]);

  if (!page || !VALID_PAGES[page]) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="max-w-md mx-auto text-center p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-red-900 mb-2">
              Page Not Found
            </h2>
            <p className="text-red-700">
              The requested legal page could not be found.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const meta = VALID_PAGES[page];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading {meta.title.toLowerCase()}...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="max-w-md mx-auto text-center p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-red-900 mb-2">
              Error Loading Content
            </h2>
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
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
            <li className="text-slate-900 font-medium">{meta.title}</li>
          </ol>
        </nav>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-8 sm:p-12">
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-slate-900 mb-3">
                {meta.title}
              </h1>
              {meta.description && (
                <p className="text-slate-600">{meta.description}</p>
              )}
              {lastUpdated && (
                <p className="text-sm text-slate-500 mt-2">
                  Last updated:{" "}
                  {new Date(lastUpdated).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                  {updatedBy ? ` · by ${updatedBy}` : ""}
                </p>
              )}
            </div>

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
              dangerouslySetInnerHTML={{ __html: content || "<p>No content configured yet.</p>" }}
            />
          </div>

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
                    Questions about our {meta.title.toLowerCase()}?
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
                href="/cookies"
                className="text-sm text-emerald-600 hover:text-emerald-700 font-medium whitespace-nowrap"
              >
                View Cookie Policy →
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Legal;