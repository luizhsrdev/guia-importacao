import { ToolsClient } from './ToolsClient';
import { getCurrentUserStatus } from '@/lib/user-server';

export const metadata = {
  title: 'Ferramentas | Guia Importação',
  description: 'Recursos para facilitar suas compras da China',
};

export default async function ToolsPage() {
  const userStatus = await getCurrentUserStatus();
  return <ToolsClient userStatus={userStatus} />;
}
