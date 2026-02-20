/**
 * @typedef {Object} Product
 * @property {string} id
 * @property {string} name
 * @property {string} description
 * @property {string} image
 */

/**
 * @param {{ products: Product[] }} props
 */
const ProductList = ({ products }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    {products.map((product) => (
      <div key={product.id} className="group flex items-center space-x-4 bg-gradient-to-br from-white to-gray-50 rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl hover:border-teal-200 transition-all duration-300 hover:-translate-y-1">
        <div className="flex-shrink-0 w-24 h-24 rounded-xl overflow-hidden bg-gradient-to-br from-teal-50 to-cyan-50 p-2">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover rounded-lg group-hover:scale-110 transition-transform duration-300"
          />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-teal-600 transition-colors">{product.name}</h3>
          <p className="text-gray-600 text-sm leading-relaxed">{product.description}</p>
        </div>
      </div>
    ))}
  </div>
);}

export default ProductList;
