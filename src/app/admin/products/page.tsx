import { getProducts, getCategories } from './actions';
import ProductsClient from './ProductsClient';

export default async function ProductsPage() {
  const [products, categories] = await Promise.all([
    getProducts(),
    getCategories(),
  ]);

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-primary mb-2">
            Gerenciar Produtos
          </h2>
          <p className="text-textSecondary">
            Total: {products.length} produto(s)
          </p>
        </div>
      </div>

      <ProductsClient products={products} categories={categories} />
    </div>
  );
}
