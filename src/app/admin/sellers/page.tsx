import { getSellers, getNiches } from './actions';
import SellersClient from './SellersClient';

export default async function SellersPage() {
  const [sellers, niches] = await Promise.all([getSellers(), getNiches()]);

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
            🥇 {goldSellers.length} Gold | ❌ {blacklistSellers.length}{' '}
            Blacklist
          </p>
        </div>
      </div>

      <SellersClient sellers={sellers} niches={niches} />
    </div>
  );
}
