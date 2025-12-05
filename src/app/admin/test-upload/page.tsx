import cloudinary from '@/lib/cloudinary';

export default async function TestUploadPage() {
  // Verificar configuração
  const config = cloudinary.config();

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-primary mb-6">
        Teste de Configuração do Cloudinary
      </h1>

      <div className="bg-surface rounded-xl p-6 space-y-4">
        <h2 className="text-xl font-bold text-textMain mb-4">
          Configurações:
        </h2>

        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-textMain">Cloud Name:</span>
            {config.cloud_name ? (
              <span className="text-primary">OK - {config.cloud_name}</span>
            ) : (
              <span className="text-danger">Não configurado</span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <span className="font-semibold text-textMain">API Key:</span>
            {config.api_key ? (
              <span className="text-primary">
                OK - {config.api_key.substring(0, 6)}...
              </span>
            ) : (
              <span className="text-danger">Não configurado</span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <span className="font-semibold text-textMain">API Secret:</span>
            {config.api_secret ? (
              <span className="text-primary">
                OK - {config.api_secret.substring(0, 6)}...
              </span>
            ) : (
              <span className="text-danger">Não configurado</span>
            )}
          </div>
        </div>

        <div className="mt-6 p-4 bg-background rounded-lg">
          <h3 className="font-bold text-textMain mb-2">
            Checklist de Troubleshooting:
          </h3>
          <ul className="space-y-2 text-textSecondary text-sm">
            <li>
              1. Verifique se as variáveis estão no arquivo{' '}
              <code className="text-primary">.env.local</code>
            </li>
            <li>
              2. Certifique-se que não tem espaços extras nas variáveis
            </li>
            <li>
              3. Se alterou o .env.local, reinicie o servidor (npm run dev)
            </li>
            <li>4. Verifique o console do terminal para logs de configuração</li>
            <li>5. Teste com uma imagem pequena (&lt; 500KB) primeiro</li>
          </ul>
        </div>

        <div className="mt-6 p-4 bg-danger/10 border border-danger/30 rounded-lg">
          <h3 className="font-bold text-danger mb-2">
            Se todas as variáveis aparecem como OK mas o upload falha:
          </h3>
          <ul className="space-y-2 text-textMain text-sm">
            <li>
              • Verifique se o Cloud Name está correto (case-sensitive)
            </li>
            <li>• Teste fazer upload manual no Cloudinary Dashboard</li>
            <li>
              • Verifique se sua conta Cloudinary tem espaço disponível
            </li>
            <li>• Confira os logs detalhados no console do navegador</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
