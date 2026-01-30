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
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    {products.map((product) => (
      <div key={product.id} className="flex items-center space-x-4 bg-gray-50 rounded-lg p-4 shadow">
        <img
          src={product.image}
          alt={product.name}
          className="w-20 h-20 object-cover rounded-md"
        />
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{product.name}</h3>
          <p className="text-gray-600 text-sm">{product.description}</p>
        </div>
      </div>
    ))}
  </div>
);

export default ProductList;
