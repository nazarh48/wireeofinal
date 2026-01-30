import { useNavigate } from 'react-router-dom';

const ProductExperience = () => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate('/ranges');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-gray-900 mb-12">Product Experience</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div
            onClick={handleCardClick}
            className="bg-white rounded-lg shadow-md p-8 hover:shadow-lg transition-shadow cursor-pointer transform hover:scale-105 transition-transform"
          >
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Products</h2>
            <p className="text-gray-600">Explore our standard product range.</p>
          </div>
          <div
            onClick={handleCardClick}
            className="bg-white rounded-lg shadow-md p-8 hover:shadow-lg transition-shadow cursor-pointer transform hover:scale-105 transition-transform"
          >
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Products Pro</h2>
            <p className="text-gray-600">Discover our premium product offerings.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductExperience;