/**
 * Gera link de afiliado CSSBuy a partir do link Xianyu
 * @param xianyuUrl - Link do Xianyu (https://www.goofish.com/item?id=123456)
 * @returns Link de afiliado CSSBuy
 */
export function generateAffiliateLink(xianyuUrl: string): string | null {
  if (!xianyuUrl) {
    return null;
  }

  // Extrair ID do produto Xianyu
  const match = xianyuUrl.match(/[?&]id=(\d+)/);

  if (!match) {
    console.error('Link Xianyu inválido:', xianyuUrl);
    return null;
  }

  const xianyuId = match[1];
  const affiliateCode = process.env.NEXT_PUBLIC_CSSBUY_AFFILIATE_CODE || 'e2c2e0ee47a4eec9';

  return `https://www.cssbuy.com/item-xianyu-${xianyuId}.html?promotionCode=${affiliateCode}`;
}

/**
 * Extrai apenas o ID do produto Xianyu
 */
export function extractXianyuId(xianyuUrl: string): string | null {
  if (!xianyuUrl) {
    return null;
  }

  const match = xianyuUrl.match(/[?&]id=(\d+)/);
  return match ? match[1] : null;
}
