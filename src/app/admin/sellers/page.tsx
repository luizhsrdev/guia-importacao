import { getSellers, getCategories } from './actions';
import SellersClient from './SellersClient';

export default async function SellersPage() {
  const [sellers, categories] = await Promise.all([
    getSellers(),
    getCategories(),
  ]);

  const goldSellers = sellers.filter((s) => s.status === 'gold');
  const blacklistSellers = sellers.filter((s) => s.status === 'blacklist');

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-primary mb-2">
            Gerenciar Vendedores
          </h2>
          <p className="text-textSecondary">
            Gold: {goldSellers.length} | Blacklist: {blacklistSellers.length}
          </p>
        </div>
      </div>

      <SellersClient sellers={sellers} categories={categories} />
    </div>
  );
}
