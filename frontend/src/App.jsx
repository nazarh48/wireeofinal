import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, lazy, Suspense } from 'react';
import Layout from './components/layout/Layout';
import ScrollToTop from './components/ScrollToTop';
import { generateProductPDF } from './utils/pdfGenerator';
import useStore from './store/useStore';
import { useAuthStore } from './store/authStore';
import RequireAuth from './components/auth/RequireAuth';
import SessionActivityManager from './components/auth/SessionActivityManager';

const Home = lazy(() => import('./pages/Home'));
const Solutions = lazy(() => import('./pages/Solutions'));
const Products = lazy(() => import('./pages/Products'));
const ProductsBrowse = lazy(() => import('./pages/ProductsBrowse'));
const ProductsInRange = lazy(() => import('./pages/ProductsInRange'));
const ProductDetail = lazy(() => import('./pages/products/ProductDetail'));
const Projects = lazy(() => import('./pages/Projects'));
const Resources = lazy(() => import('./pages/Resources'));
const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));
const Legal = lazy(() => import('./pages/Legal'));
const Cookies = lazy(() => import('./pages/Cookies'));
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'));
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'));
const DashboardOverview = lazy(() => import('./pages/admin/DashboardOverview'));
const RangesManagement = lazy(() => import('./pages/admin/RangesManagement'));
const ProductsManagement = lazy(() => import('./pages/admin/ProductsManagement'));
const UsersManagement = lazy(() => import('./pages/admin/UsersManagement'));
const AdminProjects = lazy(() => import('./pages/admin/AdminProjects'));
const AdminSettings = lazy(() => import('./pages/admin/AdminSettings'));
const CategoriesManagement = lazy(() => import('./pages/admin/CategoriesManagement'));
const SolutionsManagement = lazy(() => import('./pages/admin/SolutionsManagement'));
const PdfMaterialsManagement = lazy(() => import('./pages/admin/PdfMaterialsManagement'));
const SolutionDetailsManagement = lazy(() => import('./pages/admin/SolutionDetailsManagement'));
const SolutionWhyChooseManagement = lazy(() => import('./pages/admin/SolutionWhyChooseManagement'));
const AdminCookies = lazy(() => import('./pages/admin/AdminCookies'));
const AdminPrivacy = lazy(() => import('./pages/admin/AdminPrivacy'));
const AdminTerms = lazy(() => import('./pages/admin/AdminTerms'));
const NewsletterManagement = lazy(() => import('./pages/admin/NewsletterManagement'));
const IconLibraryManagement = lazy(() => import('./pages/admin/IconLibraryManagement'));
const SolutionDetail = lazy(() => import('./pages/SolutionDetail'));
const Login = lazy(() => import('./pages/Login'));
const SignUp = lazy(() => import('./pages/SignUp'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const VerifyEmail = lazy(() => import('./pages/VerifyEmail'));
const ProductPage = lazy(() => import('./pages/ProductPage'));
const EditorPage = lazy(() => import('./pages/EditorPage'));
const ConfiguratorPage = lazy(() => import('./pages/ConfiguratorPage'));
const ProductExperience = lazy(() => import('./pages/ProductExperience'));
const Ranges = lazy(() => import('./pages/Ranges'));
const TabbedRanges = lazy(() => import('./pages/TabbedRanges'));

function App() {
  const { closeToast, clearPendingCollection, clearPendingPdfCollection, showToast } = useStore();
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    const handleGeneratePdf = async (event) => {
      const { products, projectName } = event.detail || {};
      const list = Array.isArray(products) ? products.filter(Boolean) : [];
      console.info("[PDF] Export requested: product count =", list.length, "ids =", list.map((p) => p.id || p._id).join(", "));
      try {
        if (list.length === 0) {
          showToast("No products available to export.");
          return;
        }
        await generateProductPDF(list, { user, projectName });
        clearPendingCollection();
        clearPendingPdfCollection();
        closeToast();
      } catch (error) {
        console.error("[PDF] Export failed:", error);
        showToast(error?.message || "Failed to generate PDF.");
      }
    };

    window.addEventListener('generatePdf', handleGeneratePdf);
    return () => window.removeEventListener('generatePdf', handleGeneratePdf);
  }, [closeToast, clearPendingCollection]);

  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <SessionActivityManager />
      <ScrollToTop />
      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600 mx-auto mb-3" />
              <p className="text-slate-600 text-sm">Loading…</p>
            </div>
          </div>
        }
      >
        <Routes>
          <Route path="/" element={<Layout><Home /></Layout>} />
          <Route path="/products" element={<Layout><Products /></Layout>} />
          <Route path="/products/browse" element={<Layout><ProductsBrowse /></Layout>} />
          <Route path="/products/ranges" element={<Layout><RequireAuth><TabbedRanges /></RequireAuth></Layout>} />
          <Route path="/products/range/:rangeId" element={<Layout><ProductsInRange /></Layout>} />
          <Route path="/products/detail/:id" element={<Layout><ProductDetail /></Layout>} />
          <Route path="/editor/:productId" element={<Layout><RequireAuth><EditorPage /></RequireAuth></Layout>} />
          <Route path="/configurator/:productId" element={<Layout><RequireAuth><ConfiguratorPage /></RequireAuth></Layout>} />
          <Route path="/ranges" element={<Layout><RequireAuth><Ranges /></RequireAuth></Layout>} />
          <Route path="/product-experience" element={<Layout><ProductExperience /></Layout>} />
          <Route path="/tabbed-ranges" element={<Layout><RequireAuth><TabbedRanges /></RequireAuth></Layout>} />
          <Route path="/products/:rangeId" element={<Layout><ProductPage /></Layout>} />
          <Route path="/solutions" element={<Layout><Solutions /></Layout>} />
          <Route path="/solutions/:id" element={<Layout><SolutionDetail /></Layout>} />
          <Route path="/projects" element={<Layout><RequireAuth><Projects /></RequireAuth></Layout>} />
          <Route path="/resources" element={<Layout><Resources /></Layout>} />
          <Route path="/about" element={<Layout><About /></Layout>} />
          <Route path="/contact" element={<Layout><Contact /></Layout>} />
          <Route path="/cookies" element={<Layout><Cookies /></Layout>} />
          <Route path="/legal/:page" element={<Layout><Legal /></Layout>} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<DashboardOverview />} />
            <Route path="ranges" element={<RangesManagement />} />
            <Route path="products" element={<ProductsManagement />} />
            <Route path="users" element={<UsersManagement />} />
            <Route path="categories" element={<CategoriesManagement />} />
            <Route path="solutions" element={<SolutionsManagement />} />
            <Route path="solution-details" element={<SolutionDetailsManagement />} />
            <Route path="solution-why-choose" element={<SolutionWhyChooseManagement />} />
            <Route path="pdf-materials" element={<PdfMaterialsManagement />} />
            <Route path="newsletter" element={<NewsletterManagement />} />
            <Route path="projects" element={<AdminProjects />} />
            <Route path="cookies" element={<AdminCookies />} />
            <Route path="privacy" element={<AdminPrivacy />} />
            <Route path="terms" element={<AdminTerms />} />
            <Route path="icon-library" element={<IconLibraryManagement />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;