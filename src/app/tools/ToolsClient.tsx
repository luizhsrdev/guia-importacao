'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { GlobalHeader } from '@/components/GlobalHeader';
import type { UserStatus } from '@/types';

interface ChineseId {
  identity_number: string;
}

type MessageTab = 'photos-inspection' | 'general-shipping' | 'favorites';
type TranslationMode = 'pt-en' | 'pt-zh';

interface Message {
  id: string;
  title: string;
  pt: string;
  en: string;
  zh: string;
}

// Messages data - Photos and Inspection category
const photosInspectionMessages: Message[] = [
  {
    id: 'scratches',
    title: 'Arranhões e Marcas de Uso',
    pt: 'Por favor, tire fotos claras e nítidas de quaisquer arranhões ou marcas de uso, se houver. Se o aparelho estiver em perfeito estado, confirme isso também.',
    zh: '请拍摄清晰的照片，显示任何划痕或使用痕迹（如果有的话）。如果设备状况完美，也请确认。',
    en: 'Please take clear and sharp photos of any scratches or signs of use, if any. If the device is in perfect condition, please confirm that as well.',
  },
  {
    id: 'serial-box',
    title: 'Número de Série na Caixa',
    pt: 'Tire uma foto do número de série impresso na lateral ou parte inferior da caixa do produto.',
    zh: '请拍摄产品包装盒侧面或底部印刷的序列号照片。',
    en: 'Take a photo of the serial number printed on the side or bottom of the product box.',
  },
  {
    id: 'serial-iphone',
    title: 'Número de Série - iPhone (Sistema)',
    pt: `iPhone - Tire uma foto da tela mostrando o número de série nas configurações.

Passo a passo:
1. Abra "Ajustes"
2. Toque em "Geral"
3. Toque em "Sobre"
4. Role até "Número de Série"
5. Tire uma foto da tela mostrando essa informação`,
    zh: `iPhone - 请拍摄屏幕上显示序列号的设置页面。

步骤：
1. 打开"设置"
2. 点击"通用"
3. 点击"关于本机"
4. 向下滚动找到"序列号"
5. 拍摄屏幕显示此信息的照片`,
    en: `iPhone - Take a photo of the screen showing the serial number in settings.

Steps:
1. Open "Settings"
2. Tap "General"
3. Tap "About"
4. Scroll down to "Serial Number"
5. Take a photo of the screen showing this information`,
  },
  {
    id: 'imei-iphone',
    title: 'IMEI e IMEI2 - iPhone',
    pt: `iPhone - Tire uma foto da tela mostrando IMEI e IMEI2.

Passo a passo:
1. Abra "Ajustes"
2. Toque em "Geral"
3. Toque em "Sobre"
4. Role até "IMEI" e "IMEI 2" (modelos dual SIM)
5. Tire uma foto da tela mostrando ambos os números`,
    zh: `iPhone - 请拍摄屏幕上显示IMEI和IMEI2的照片。

步骤：
1. 打开"设置"
2. 点击"通用"
3. 点击"关于本机"
4. 向下滚动找到"IMEI"和"IMEI 2"（双卡机型）
5. 拍摄屏幕显示两个号码的照片`,
    en: `iPhone - Take a photo of the screen showing IMEI and IMEI2.

Steps:
1. Open "Settings"
2. Tap "General"
3. Tap "About"
4. Scroll down to "IMEI" and "IMEI 2" (dual SIM models)
5. Take a photo of the screen showing both numbers`,
  },
  {
    id: 'repair-history',
    title: 'Histórico de Reparos - iPhone',
    pt: `iPhone - Tire uma foto da tela "Peças e Histórico de Serviço".

Passo a passo:
1. Abra "Ajustes"
2. Toque em "Geral"
3. Toque em "Sobre"
4. Role até o final e toque em "Peças e Histórico de Serviço"
5. Tire uma foto da tela completa

Se essa opção não aparecer, significa que não há reparos registrados. Confirme isso.`,
    zh: `iPhone - 请拍摄"部件和服务历史记录"页面的照片。

步骤：
1. 打开"设置"
2. 点击"通用"
3. 点击"关于本机"
4. 滚动到底部，点击"部件和服务历史记录"
5. 拍摄整个屏幕的照片

如果没有此选项，说明没有维修记录。请确认这一点。`,
    en: `iPhone - Take a photo of the "Parts and Service History" screen.

Steps:
1. Open "Settings"
2. Tap "General"
3. Tap "About"
4. Scroll to the bottom and tap "Parts and Service History"
5. Take a photo of the entire screen

If this option doesn't appear, it means there are no recorded repairs. Please confirm this.`,
  },
  {
    id: 'truetone-iphone',
    title: 'True Tone - iPhone',
    pt: `iPhone - Tire uma foto da tela mostrando a opção True Tone.

Passo a passo:
1. Abra "Ajustes"
2. Toque em "Tela e Brilho"
3. Localize a opção "True Tone"
4. Tire uma foto da tela mostrando essa opção`,
    zh: `iPhone - 请拍摄屏幕显示原彩显示选项的照片。

步骤：
1. 打开"设置"
2. 点击"显示与亮度"
3. 找到"原彩显示"选项
4. 拍摄屏幕显示该选项的照片`,
    en: `iPhone - Take a photo of the screen showing the True Tone option.

Steps:
1. Open "Settings"
2. Tap "Display & Brightness"
3. Locate the "True Tone" option
4. Take a photo of the screen showing this option`,
  },
  {
    id: 'truetone-macbook',
    title: 'True Tone - MacBook',
    pt: `MacBook - Tire uma foto da tela mostrando a opção True Tone.

Passo a passo:
1. Clique no menu Apple no canto superior esquerdo
2. Selecione "Ajustes do Sistema" (ou "Preferências do Sistema")
3. Clique em "Telas" (ou "Monitores")
4. Localize a opção "True Tone"
5. Tire uma foto da tela mostrando essa configuração`,
    zh: `MacBook - 请拍摄屏幕显示原彩显示选项的照片。

步骤：
1. 点击左上角的Apple菜单
2. 选择"系统设置"（或"系统偏好设置"）
3. 点击"显示器"
4. 找到"原彩显示"选项
5. 拍摄屏幕显示此设置的照片`,
    en: `MacBook - Take a photo of the screen showing the True Tone option.

Steps:
1. Click the Apple menu in the top-left corner
2. Select "System Settings" (or "System Preferences")
3. Click "Displays"
4. Locate the "True Tone" option
5. Take a photo of the screen showing this setting`,
  },
  {
    id: 'battery-health',
    title: 'Saúde da Bateria - iPhone',
    pt: `iPhone - Tire uma foto da tela mostrando a saúde da bateria.

Passo a passo:
1. Abra "Ajustes"
2. Toque em "Bateria"
3. Toque em "Saúde da Bateria e Carregamento"
4. Tire uma foto da tela mostrando:
   - Capacidade Máxima (%)
   - Ciclos de Carga
   - Estado de Desempenho Máximo`,
    zh: `iPhone - 请拍摄屏幕显示电池健康状况的照片。

步骤：
1. 打开"设置"
2. 点击"电池"
3. 点击"电池健康与充电"
4. 拍摄屏幕显示以下信息的照片：
   - 最大容量(%)
   - 充电周期
   - 峰值性能容量`,
    en: `iPhone - Take a photo of the screen showing battery health.

Steps:
1. Open "Settings"
2. Tap "Battery"
3. Tap "Battery Health & Charging"
4. Take a photo of the screen showing:
   - Maximum Capacity (%)
   - Cycle Count
   - Peak Performance Capability`,
  },
  {
    id: 'lockscreen-home',
    title: 'Tela de Bloqueio e Home - iPhone',
    pt: 'Tire uma foto do iPhone ligado mostrando a tela de bloqueio e depois uma foto da tela inicial (home), para verificar se a tela funciona perfeitamente e não há manchas ou pixels mortos.',
    zh: '请拍摄iPhone开机后的锁屏界面照片，然后拍摄主屏幕照片，以确认屏幕完美工作，没有污点或坏点。',
    en: 'Take a photo of the iPhone turned on showing the lock screen, then take a photo of the home screen, to verify the screen works perfectly and has no stains or dead pixels.',
  },
  {
    id: 'all-sides',
    title: 'Foto de Todos os Lados - Inspeção Completa',
    pt: 'Tire fotos de todos os lados do aparelho (frente, traseira, laterais esquerda e direita, topo e base) com boa iluminação para inspeção visual completa.',
    zh: '请在良好光线下拍摄设备所有侧面的照片（正面、背面、左右侧面、顶部和底部），以便全面检查。',
    en: 'Take photos of all sides of the device (front, back, left and right sides, top, and bottom) with good lighting for complete visual inspection.',
  },
  {
    id: 'sealed-box',
    title: 'Caixa Lacrada (Produto Novo)',
    pt: `Se o produto é novo, tire fotos da caixa completamente lacrada, mostrando:
1. Lacre da Apple intacto (filme plástico transparente)
2. Etiqueta com número de série na lateral da caixa
3. Caixa sem amassados, rasgos ou danos`,
    zh: `如果产品是全新的，请拍摄完全密封包装盒的照片，显示：
1. 苹果原装封条完好（透明塑料膜）
2. 侧面序列号标签
3. 包装盒无凹陷、撕裂或损坏`,
    en: `If the product is new, take photos of the completely sealed box, showing:
1. Apple seal intact (transparent plastic film)
2. Serial number label on the side of the box
3. Box without dents, tears, or damage`,
  },
];

// Messages data - General Communication and Shipping category
const generalShippingMessages: Message[] = [
  {
    id: 'discard-box',
    title: 'Descartar Caixa Externa (Frete)',
    pt: 'Por favor, descarte a caixa de papelão usada no frete do vendedor ao armazém. Ela tem volume grande e não é necessária. Mantenha apenas a caixa original do produto.',
    zh: '请丢弃卖家发货到仓库使用的纸箱。它体积很大且不需要。只保留产品的原装包装盒。',
    en: 'Please discard the cardboard box used for shipping from the seller to the warehouse. It has a large volume and is not necessary. Keep only the original product box.',
  },
  {
    id: 'protection-packing',
    title: 'Embalar com Proteção Adequada',
    pt: 'Por favor, embale o dispositivo de forma que os acessórios inclusos (cabo, carregador, fones) não fiquem em contato direto com superfícies que podem ser arranhadas ou desgastadas pelo atrito. Use plástico bolha ou papel de proteção entre os itens.',
    zh: '请包装设备时确保随附配件（数据线、充电器、耳机）不会直接接触可能被摩擦划伤或磨损的表面。请在物品之间使用气泡膜或保护纸。',
    en: 'Please pack the device so that included accessories (cable, charger, earphones) are not in direct contact with surfaces that can be scratched or worn by friction. Use bubble wrap or protective paper between items.',
  },
  {
    id: 'stock-availability',
    title: 'Disponibilidade em Estoque',
    pt: 'O produto ainda está disponível e em estoque? Posso comprar e enviar imediatamente?',
    zh: '产品还有货吗？可以立即购买并发货吗？',
    en: 'Is the product still available and in stock? Can I buy and ship immediately?',
  },
  {
    id: 'accepts-agents',
    title: 'Aceita Agentes de Compra',
    pt: 'Você aceita envio para agentes de compra e intermediação como CSSBuy, Superbuy, Pandabuy ou Wegobuy?',
    zh: '您接受发货到代购平台吗？例如CSSBuy、Superbuy、Pandabuy或Wegobuy？',
    en: 'Do you accept shipping to purchasing agents and intermediaries like CSSBuy, Superbuy, Pandabuy, or Wegobuy?',
  },
  {
    id: 'confirm-price',
    title: 'Confirmar Preço Real',
    pt: 'O valor anunciado é o preço real? Se não, qual o preço correto para cada modelo/configuração disponível?',
    zh: '广告价格是真实价格吗？如果不是，每个型号/配置的正确价格是多少？',
    en: 'Is the advertised price the real price? If not, what is the correct price for each available model/configuration?',
  },
  {
    id: 'invoice-fapiao',
    title: 'Nota Fiscal (Fapiao)',
    pt: 'Você pode fornecer nota fiscal (发票 - fapiao) para este produto?',
    zh: '您可以提供发票吗？',
    en: 'Can you provide an invoice (发票 - fapiao) for this product?',
  },
  {
    id: 'warranty-return',
    title: 'Garantia e Política de Devolução',
    pt: 'Qual é a política de garantia? Se o produto chegar com defeito ou não funcionar, posso devolver ou trocar?',
    zh: '保修政策是什么？如果产品到达时有缺陷或无法使用，我可以退货或换货吗？',
    en: 'What is the warranty policy? If the product arrives defective or doesn\'t work, can I return or exchange it?',
  },
  {
    id: 'product-condition',
    title: 'Condição do Produto (Novo/Usado)',
    pt: 'O produto é completamente novo e lacrado de fábrica, ou é usado/recondicionado? Se for usado, qual o tempo de uso aproximado?',
    zh: '产品是全新原厂密封的，还是二手/翻新的？如果是二手，大约使用了多长时间？',
    en: 'Is the product completely new and factory sealed, or is it used/refurbished? If used, approximately how long has it been used?',
  },
  {
    id: 'accessories-included',
    title: 'Acessórios Inclusos',
    pt: 'O produto vem com todos os acessórios originais (cabo, carregador, fones, manual, adesivos)? Está completo na caixa?',
    zh: '产品是否附带所有原装配件（数据线、充电器、耳机、说明书、贴纸）？包装盒内容完整吗？',
    en: 'Does the product come with all original accessories (cable, charger, earphones, manual, stickers)? Is everything complete in the box?',
  },
  {
    id: 'carrier-lock',
    title: 'Bloqueio de Operadora (Carrier Lock)',
    pt: 'O iPhone está desbloqueado de operadora (unlocked)? Funciona com qualquer chip/operadora?',
    zh: 'iPhone是否已解除运营商锁定（无锁版）？可以使用任何SIM卡/运营商吗？',
    en: 'Is the iPhone carrier unlocked? Does it work with any SIM card/carrier?',
  },
  {
    id: 'model-region',
    title: 'Versão do Modelo (Região)',
    pt: 'Qual é a região/versão deste modelo? É versão China (CN), Hong Kong (HK), Estados Unidos (US) ou outra? Isso afeta compatibilidade de redes 5G.',
    zh: '这款型号的地区/版本是什么？是国行(CN)、港版(HK)、美版(US)还是其他？这会影响5G网络兼容性。',
    en: 'What is the region/version of this model? Is it China (CN), Hong Kong (HK), United States (US), or other? This affects 5G network compatibility.',
  },
  {
    id: 'video-request',
    title: 'Pedido de Vídeo (Inspeção Dinâmica)',
    pt: 'Você pode gravar um vídeo curto (30-60 segundos) mostrando o aparelho ligado, navegando nos menus, e demonstrando que tudo funciona corretamente?',
    zh: '您可以录制一段短视频（30-60秒）展示设备开机、浏览菜单，并演示所有功能正常工作吗？',
    en: 'Can you record a short video (30-60 seconds) showing the device turned on, navigating the menus, and demonstrating that everything works correctly?',
  },
];

// SVG Icons
const Icons = {
  tools: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  search: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  ),
  id: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
    </svg>
  ),
  robot: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  ),
  chat: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  ),
  warning: (
    <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  ),
  copy: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  ),
  camera: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  package: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  ),
  star: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
    </svg>
  ),
};

interface ToolsClientProps {
  userStatus: UserStatus;
}

export function ToolsClient({ userStatus }: ToolsClientProps) {
  const router = useRouter();
  const [generatedId, setGeneratedId] = useState<ChineseId | null>(null);
  const [isLoadingId, setIsLoadingId] = useState(false);
  const [idError, setIdError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState(false);
  const [activeMessageTab, setActiveMessageTab] = useState<MessageTab>('photos-inspection');
  const [translationMode, setTranslationMode] = useState<TranslationMode>('pt-zh');
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [leftColumnHeight, setLeftColumnHeight] = useState<number>(0);
  const leftColumnRef = useRef<HTMLDivElement>(null);

  // Measure left column height
  useEffect(() => {
    const measureHeight = () => {
      if (leftColumnRef.current) {
        setLeftColumnHeight(leftColumnRef.current.offsetHeight);
      }
    };

    // Use requestAnimationFrame to measure after paint
    const rafId = requestAnimationFrame(() => {
      measureHeight();
      // Measure again after fonts/styles settle
      setTimeout(measureHeight, 100);
    });

    window.addEventListener('resize', measureHeight);
    return () => {
      window.removeEventListener('resize', measureHeight);
      cancelAnimationFrame(rafId);
    };
  }, []);

  // Load favorites from localStorage on mount
  useEffect(() => {
    const savedFavorites = localStorage.getItem('message_favorites');
    if (savedFavorites) {
      try {
        setFavoriteIds(JSON.parse(savedFavorites));
      } catch {
        // Invalid JSON, ignore
      }
    }
  }, []);

  // Save favorites to localStorage when changed
  useEffect(() => {
    localStorage.setItem('message_favorites', JSON.stringify(favoriteIds));
  }, [favoriteIds]);

  const toggleFavorite = (messageId: string) => {
    setFavoriteIds((prev) =>
      prev.includes(messageId)
        ? prev.filter((id) => id !== messageId)
        : [...prev, messageId]
    );
  };

  const isFavorite = (messageId: string) => favoriteIds.includes(messageId);

  // Get all messages combined for favorites lookup
  const allMessages = [...photosInspectionMessages, ...generalShippingMessages];

  const handleGenerateId = async () => {
    setIsLoadingId(true);
    setIdError(null);
    try {
      const response = await fetch('/api/chinese-ids/random');
      const data = await response.json();

      if (data.success && data.data) {
        setGeneratedId(data.data);
      } else {
        setIdError(data.error || 'Erro ao gerar ID');
      }
    } catch {
      setIdError('Erro de conexão');
    } finally {
      setIsLoadingId(false);
    }
  };

  const handleCopyId = async () => {
    if (!generatedId) return;

    try {
      await navigator.clipboard.writeText(generatedId.identity_number);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    } catch {
      const textArea = document.createElement('textarea');
      textArea.value = generatedId.identity_number;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  const handleCopyMessage = async (message: Message) => {
    const textToCopy = translationMode === 'pt-zh' ? message.zh : message.en;

    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopiedMessageId(message.id);
      setTimeout(() => setCopiedMessageId(null), 2000);
    } catch {
      const textArea = document.createElement('textarea');
      textArea.value = textToCopy;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopiedMessageId(message.id);
      setTimeout(() => setCopiedMessageId(null), 2000);
    }
  };

  const getCurrentMessages = (): Message[] => {
    switch (activeMessageTab) {
      case 'photos-inspection':
        return photosInspectionMessages;
      case 'general-shipping':
        return generalShippingMessages;
      case 'favorites':
        return allMessages.filter((msg) => favoriteIds.includes(msg.id));
      default:
        return [];
    }
  };

  const messageTabs: { id: MessageTab; label: string; icon: React.ReactNode }[] = [
    { id: 'photos-inspection', label: 'Fotos e Inspeção', icon: Icons.camera },
    { id: 'general-shipping', label: 'Comunicação Geral e Envio', icon: Icons.package },
    { id: 'favorites', label: 'Favoritos', icon: Icons.star },
  ];

  return (
    <main className="min-h-screen bg-background">
      <GlobalHeader userStatus={userStatus} />

      {/* Page Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Page Title */}
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-text-primary">
            Ferramentas de Importação
          </h1>
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* Left Column - Cards 1, 2, 3 */}
          <div ref={leftColumnRef} className="flex flex-col gap-6">
            {/* Card 1: Links Úteis */}
            <div className="bg-surface rounded-2xl border border-border p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  {Icons.search}
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-text-primary">
                    Links Úteis
                  </h2>
                  <p className="text-sm text-text-secondary">
                    Verificação de IMEI, garantia e remoção de bloqueios
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <a
                  href="https://ifreeicloud.co.uk/free-check"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 rounded-xl bg-surface-elevated border border-border hover:border-primary/30 hover:bg-primary/5 transition-all group"
                >
                  <p className="font-medium text-text-primary group-hover:text-primary transition-colors text-sm">
                    iFreeiCloud
                  </p>
                  <svg className="w-4 h-4 text-text-muted group-hover:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>

                <a
                  href="https://sickw.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 rounded-xl bg-surface-elevated border border-border hover:border-primary/30 hover:bg-primary/5 transition-all group"
                >
                  <p className="font-medium text-text-primary group-hover:text-primary transition-colors text-sm">
                    SickW
                  </p>
                  <svg className="w-4 h-4 text-text-muted group-hover:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>

                <a
                  href="https://checkcoverage.apple.com/?locale=pt_BR"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 rounded-xl bg-surface-elevated border border-border hover:border-primary/30 hover:bg-primary/5 transition-all group"
                >
                  <p className="font-medium text-text-primary group-hover:text-primary transition-colors text-sm">
                    Apple Check Coverage
                  </p>
                  <svg className="w-4 h-4 text-text-muted group-hover:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>

                <a
                  href="https://ipsw.me/product/iPhone"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 rounded-xl bg-surface-elevated border border-border hover:border-primary/30 hover:bg-primary/5 transition-all group"
                >
                  <p className="font-medium text-text-primary group-hover:text-primary transition-colors text-sm">
                    IPSW Downloads
                  </p>
                  <svg className="w-4 h-4 text-text-muted group-hover:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>

                <a
                  href="https://github.com/assafdori/bypass-mdm"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 rounded-xl bg-surface-elevated border border-border hover:border-primary/30 hover:bg-primary/5 transition-all group"
                >
                  <p className="font-medium text-text-primary group-hover:text-primary transition-colors text-sm">
                    Bypass MDM (MacBooks)
                  </p>
                  <svg className="w-4 h-4 text-text-muted group-hover:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>

                <a
                  href="https://github.com/fled-dev/MDMPatcher-Enhanced"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 rounded-xl bg-surface-elevated border border-border hover:border-primary/30 hover:bg-primary/5 transition-all group"
                >
                  <p className="font-medium text-text-primary group-hover:text-primary transition-colors text-sm">
                    MDMPatcher Enhanced (iPads/iPhones)
                  </p>
                  <svg className="w-4 h-4 text-text-muted group-hover:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Card 2: Chinese ID */}
            <div className="bg-surface rounded-2xl border border-border p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
                  {Icons.id}
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-text-primary">
                    ID para Verificação Xianyu
                  </h2>
                  <p className="text-sm text-text-secondary">
                    Obtenha ID chinês para ativar chat
                  </p>
                </div>
              </div>

              {/* Generate Button */}
              <button
                onClick={handleGenerateId}
                disabled={isLoadingId}
                className="w-full h-11 rounded-xl bg-primary text-black font-semibold text-sm hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                {isLoadingId ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Gerando...
                  </>
                ) : (
                  'Gerar ID'
                )}
              </button>

              {/* Error */}
              {idError && (
                <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                  <p className="text-sm text-red-400">{idError}</p>
                </div>
              )}

              {/* Result */}
              {generatedId && (
                <div className="mt-4">
                  <div className="h-px bg-border my-4" />

                  <div className="p-4 rounded-xl bg-surface-elevated border border-border">
                    <p className="text-xs text-text-muted mb-2">ID para verificação</p>
                    <p className="font-mono text-xl text-primary select-all">{generatedId.identity_number}</p>
                  </div>

                  <button
                    onClick={handleCopyId}
                    className="w-full mt-3 h-10 rounded-xl bg-surface-elevated border border-border text-text-secondary hover:text-primary hover:border-primary/30 font-medium text-sm transition-all flex items-center justify-center gap-2"
                  >
                    {copiedId ? (
                      <>
                        <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Copiado!
                      </>
                    ) : (
                      <>
                        {Icons.copy}
                        Copiar ID
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Card 3: AI Assistant */}
            <div className="bg-surface rounded-2xl border border-border p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
                    {Icons.robot}
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-text-primary">
                      Assistente para Declaracao
                    </h2>
                    <p className="text-sm text-text-secondary">
                      Orientacoes sobre declaracao alfandegaria
                    </p>
                  </div>
                </div>
                <span className="px-2 py-1 rounded-md bg-purple-500/10 text-purple-400 text-xs font-medium">
                  BETA
                </span>
              </div>

              {/* Disclaimer */}
              <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 mb-4">
                {Icons.warning}
                <p className="text-sm text-amber-300/90">
                  Ferramenta educacional. Nao substitui orientacao profissional.
                </p>
              </div>

              {/* Access Button */}
              <button
                onClick={() => router.push('/declaracao')}
                className="w-full h-11 rounded-xl bg-purple-500 hover:bg-purple-600 text-white font-medium text-sm transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                Acessar Assistente
              </button>
            </div>
          </div>

          {/* Right Column - Card 4 */}
          <div>
            {/* Card 4: Pre-made Messages */}
            <div
              className="bg-surface rounded-2xl border border-border p-6 flex flex-col"
              style={{ height: leftColumnHeight > 0 ? `${leftColumnHeight}px` : '850px' }}
            >
              <div className="flex items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                    {Icons.chat}
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-text-primary">
                      Mensagens Pré-Prontas
                    </h2>
                    <p className="text-sm text-text-secondary">
                      Templates para vendedores e agentes
                    </p>
                  </div>
                </div>

                {/* Language Toggle */}
                <div className="flex items-center bg-surface-elevated rounded-lg p-1 border border-border">
                  <button
                    onClick={() => setTranslationMode('pt-zh')}
                    className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-all ${
                      translationMode === 'pt-zh'
                        ? 'bg-primary text-black'
                        : 'text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    Chinês
                  </button>
                  <button
                    onClick={() => setTranslationMode('pt-en')}
                    className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-all ${
                      translationMode === 'pt-en'
                        ? 'bg-primary text-black'
                        : 'text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    Inglês
                  </button>
                </div>
              </div>

              {/* Category Cards */}
              <div className="space-y-2 mb-4">
                {messageTabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveMessageTab(tab.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
                      activeMessageTab === tab.id
                        ? 'bg-primary/10 border-primary text-primary'
                        : 'bg-surface-elevated border-border text-text-primary hover:border-primary/50 hover:bg-primary/5'
                    }`}
                  >
                    <span className={activeMessageTab === tab.id ? 'text-primary' : 'text-text-muted'}>
                      {tab.icon}
                    </span>
                    <span className="font-medium text-sm">{tab.label}</span>
                    {activeMessageTab === tab.id && (
                      <svg className="w-4 h-4 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>

              {/* Messages List */}
              <div className="flex-1 min-h-0 overflow-y-auto space-y-4 pr-1">
                {getCurrentMessages().length > 0 ? (
                  getCurrentMessages().map((message) => (
                    <div
                      key={message.id}
                      className="bg-surface-elevated rounded-xl border border-border p-4"
                    >
                      {/* Title with favorite button */}
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <h3 className="font-medium text-text-primary text-sm">
                          {message.title}
                        </h3>
                        <button
                          onClick={() => toggleFavorite(message.id)}
                          className={`flex-shrink-0 p-1.5 rounded-lg transition-all ${
                            isFavorite(message.id)
                              ? 'text-amber-400 hover:text-amber-500'
                              : 'text-text-muted hover:text-amber-400 hover:bg-amber-400/10'
                          }`}
                          title={isFavorite(message.id) ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
                        >
                          <svg
                            className="w-4 h-4"
                            fill={isFavorite(message.id) ? 'currentColor' : 'none'}
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1.5}
                              d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                            />
                          </svg>
                        </button>
                      </div>

                      {/* Portuguese text - styled as input field */}
                      <div className="mb-3">
                        <label className="text-[11px] font-medium text-text-muted uppercase tracking-wider mb-1.5 block">
                          Português
                        </label>
                        <div className="bg-background border border-border rounded-lg p-3">
                          <p className="text-sm text-text-primary whitespace-pre-line leading-relaxed select-all">
                            {message.pt}
                          </p>
                        </div>
                      </div>

                      {/* Translated text - styled as input field with copy button */}
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="text-[11px] font-medium text-primary uppercase tracking-wider">
                            {translationMode === 'pt-zh' ? 'Chinês' : 'Inglês'}
                          </label>
                          <button
                            onClick={() => handleCopyMessage(message)}
                            className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium transition-all ${
                              copiedMessageId === message.id
                                ? 'bg-primary/20 text-primary'
                                : 'text-text-muted hover:text-primary hover:bg-primary/10'
                            }`}
                          >
                            {copiedMessageId === message.id ? (
                              <>
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Copiado!
                              </>
                            ) : (
                              <>
                                {Icons.copy}
                                Copiar
                              </>
                            )}
                          </button>
                        </div>
                        <div className="bg-background border border-primary/30 rounded-lg p-3">
                          <p className="text-sm text-text-primary whitespace-pre-line leading-relaxed select-all">
                            {translationMode === 'pt-zh' ? message.zh : message.en}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center py-12 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-surface-elevated flex items-center justify-center mb-4 text-text-muted">
                      <svg className="w-8 h-8 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </div>
                    <p className="text-text-secondary font-medium mb-1">
                      {activeMessageTab === 'favorites' ? 'Nenhum favorito ainda' : 'Em breve'}
                    </p>
                    <p className="text-sm text-text-muted max-w-[200px]">
                      {activeMessageTab === 'favorites'
                        ? 'Adicione mensagens aos favoritos para acesso rápido'
                        : 'Novas mensagens serão adicionadas em breve'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
