import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold">Admin Panel</h1>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h2 className="text-2xl font-bold mb-6">Dashboard</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Link to="/admin/products" className="bg-white p-6 rounded-lg shadow hover:shadow-md">
              <h3 className="text-lg font-semibold mb-2">Products Management</h3>
              <p>Manage products and configurations</p>
            </Link>
            <Link to="/admin/categories" className="bg-white p-6 rounded-lg shadow hover:shadow-md">
              <h3 className="text-lg font-semibold mb-2">Categories</h3>
              <p>Manage product categories</p>
            </Link>
            <Link to="/admin/ranges" className="bg-white p-6 rounded-lg shadow hover:shadow-md">
              <h3 className="text-lg font-semibold mb-2">Product Ranges</h3>
              <p>Manage product ranges</p>
            </Link>
            <Link to="/admin/configurator" className="bg-white p-6 rounded-lg shadow hover:shadow-md">
              <h3 className="text-lg font-semibold mb-2">Configurator Models</h3>
              <p>Manage configurator settings</p>
            </Link>
            <Link to="/admin/layers" className="bg-white p-6 rounded-lg shadow hover:shadow-md">
              <h3 className="text-lg font-semibold mb-2">Graphic Layers</h3>
              <p>Manage graphic layers</p>
            </Link>
            <Link to="/admin/rules" className="bg-white p-6 rounded-lg shadow hover:shadow-md">
              <h3 className="text-lg font-semibold mb-2">Compatibility Rules</h3>
              <p>Manage compatibility rules</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;