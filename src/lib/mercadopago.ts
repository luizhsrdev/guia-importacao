import { MercadoPagoConfig, Preference } from 'mercadopago';

// Cliente do Mercado Pago
const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
});

export const preference = new Preference(client);
