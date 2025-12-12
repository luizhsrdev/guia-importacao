import { MercadoPagoConfig, Payment, Preference } from 'mercadopago';

const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;

const client = new MercadoPagoConfig({
  accessToken: accessToken ?? '',
  options: {
    timeout: 10000,
  },
});

export const mercadoPagoPayment = new Payment(client);
export const mercadoPagoPreference = new Preference(client);

export function isMercadoPagoConfigured(): boolean {
  return Boolean(accessToken);
}
