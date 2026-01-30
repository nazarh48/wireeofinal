// src/pages/RangePage.jsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCatalog } from '../hooks/useCatalog';

const RangePage = () => {
  const navigate = useNavigate();
  const { ranges, loadPublicCatalog, loading, loaded } = useCatalog();

  useEffect(() => {
    if (!loaded && !loading) loadPublicCatalog();
  }, [loadPublicCatalog, loaded, loading]);

  const handleRangeSelect = (rangeId) => {
    navigate(`/products/${rangeId}`);
  };

  if (loading && !loaded) {
    return <div className="min-h-screen flex items-center justify-center">Loading…</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Product Ranges</h1>
          <p className="text-xl text-gray-600">Choose a product range to explore our electrical solutions</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {ranges.map((range, idx) => (
            <div
              key={range.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => handleRangeSelect(range.id)}
            >
              <div className={`w-full h-48 bg-gradient-to-br ${idx % 3 === 0 ? 'from-blue-100 to-blue-200' : idx % 3 === 1 ? 'from-emerald-100 to-emerald-200' : 'from-violet-100 to-violet-200'} flex items-center justify-center`}>
                <span className="text-3xl font-bold text-gray-700">{range.name?.slice(0, 1) || 'R'}</span>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{range.name}</h3>
                <p className="text-gray-600">{range.description}</p>
                <div className="mt-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    View Products →
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RangePage;