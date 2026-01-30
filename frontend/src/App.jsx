import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import Solutions from './pages/Solutions';
import Products from './pages/Products';
import ProductsBrowse from './pages/ProductsBrowse';
import ProductsInRange from './pages/ProductsInRange';
import ProductDetail from './pages/products/ProductDetail';
import Projects from './pages/Projects';
import Resources from './pages/Resources';
import About from './pages/About';
import Contact from './pages/Contact';
import Legal from './pages/Legal';
import AdminLogin from './pages/admin/AdminLogin';
import AdminLayout from './pages/admin/AdminLayout';
import DashboardOverview from './pages/admin/DashboardOverview';
import RangesManagement from './pages/admin/RangesManagement';
import ProductsManagement from './pages/admin/ProductsManagement';
import UsersManagement from './pages/admin/UsersManagement';
import AdminProjects from './pages/admin/AdminProjects';
import AdminSettings from './pages/admin/AdminSettings';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import ProductPage from './pages/ProductPage';
import EditorPage from './pages/EditorPage';
import ProductExperience from './pages/ProductExperience';
import Ranges from './pages/Ranges';
import TabbedRanges from './pages/TabbedRanges';
import { generateProductPDF } from './utils/pdfGenerator';
import useStore from './store/useStore';
import { useAuthStore } from './store/authStore';
import RequireAuth from './components/auth/RequireAuth';

function App() {
  const { closeToast, clearPendingCollection, clearPendingPdfCollection, showToast } = useStore();
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    const handleGeneratePdf = async (event) => {
      const { products, projectName } = event.detail;
      try {
        if (!Array.isArray(products) || products.length === 0) {
          showToast("No products available to export.");
          return;
        }
        await generateProductPDF(products, { user, projectName });
        // Clear pending collection and close toast after successful PDF generation
        clearPendingCollection();
        clearPendingPdfCollection();
        closeToast();
      } catch (error) {
        console.error('Failed to generate PDF:', error);
        showToast(error?.message || "Failed to generate PDF.");
      }
    };

    window.addEventListener('generatePdf', handleGeneratePdf);
    return () => window.removeEventListener('generatePdf', handleGeneratePdf);
  }, [closeToast, clearPendingCollection]);

  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        <Route path="/" element={<Layout><Home /></Layout>} />
        <Route path="/products" element={<Layout><Products /></Layout>} />
        <Route path="/products/browse" element={<Layout><ProductsBrowse /></Layout>} />
        <Route path="/products/ranges" element={<Layout><RequireAuth><TabbedRanges /></RequireAuth></Layout>} />
        <Route path="/products/range/:rangeId" element={<Layout><ProductsInRange /></Layout>} />
        <Route path="/products/detail/:id" element={<Layout><ProductDetail /></Layout>} />
        <Route path="/editor/:productId" element={<Layout><RequireAuth><EditorPage /></RequireAuth></Layout>} />
        <Route path="/ranges" element={<Layout><RequireAuth><Ranges /></RequireAuth></Layout>} />
        <Route path="/product-experience" element={<Layout><ProductExperience /></Layout>} />
        <Route path="/tabbed-ranges" element={<Layout><RequireAuth><TabbedRanges /></RequireAuth></Layout>} />
        <Route path="/products/:rangeId" element={<Layout><ProductPage /></Layout>} />
        <Route path="/solutions" element={<Layout><Solutions /></Layout>} />
        <Route path="/projects" element={<Layout><RequireAuth><Projects /></RequireAuth></Layout>} />
        <Route path="/resources" element={<Layout><Resources /></Layout>} />
        <Route path="/about" element={<Layout><About /></Layout>} />
        <Route path="/contact" element={<Layout><Contact /></Layout>} />
        <Route path="/legal/:page" element={<Layout><Legal /></Layout>} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<DashboardOverview />} />
          <Route path="ranges" element={<RangesManagement />} />
          <Route path="products" element={<ProductsManagement />} />
          <Route path="users" element={<UsersManagement />} />
          <Route path="projects" element={<AdminProjects />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;