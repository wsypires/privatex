import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { MatrixRoom, MatrixMessage, BotConfig, ActionExecutionLog, UserProfile, ActionButton } from './src/types';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Initial State Database (Matrix Synapse Simulation & Real API Layer)
let currentUser: UserProfile = {
  userId: '@trader.alex:privatx.io',
  displayName: 'Alexandre Trader',
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
  role: 'admin',
  joinedRooms: [
    '!btc_whale_signals:privatx.io',
    '!trading_alpha:privatx.io',
    '!devops_monitor:privatx.io',
    '!forex_scalper:privatx.io',
  ],
  notificationSettings: {
    sound: true,
    vibration: true,
    criticalAlerts: true,
    inAppBanner: true,
  },
};

let bots: BotConfig[] = [
  {
    id: 'bot_binance_sniper',
    name: 'Binance Signal Sniper',
    avatar: 'https://images.unsplash.com/photo-1622979135225-d2ba269bc1df?w=150&auto=format&fit=crop&q=80',
    token: 'syt_YmluYW5jZV9zbmlwZXJfOTk4MmFhMDFi_PrivatX',
    status: 'ONLINE',
    description: 'Algoritmo de EMA 9/21, RSI Divergence e detecção de rompimento de volume Binance Spot & Futures.',
    authorizedRooms: ['!btc_whale_signals:privatx.io', '!trading_alpha:privatx.io'],
    permissions: ['send_text', 'send_media', 'send_alerts', 'send_buttons', 'receive_actions'],
    totalDispatched: 1420,
    lastActive: Date.now() - 1000 * 30,
  },
  {
    id: 'bot_market_monitor',
    name: 'Whale Flow & Liquidations',
    avatar: 'https://images.unsplash.com/photo-1642543492481-44e81e3914a7?w=150&auto=format&fit=crop&q=80',
    token: 'syt_bWFya2V0X21vbml0b3JfNGg4OGFhMTJj_PrivatX',
    status: 'ONLINE',
    description: 'Monitora posições institucionais, liquidações massivas acima de $5M e variações de Open Interest.',
    authorizedRooms: ['!btc_whale_signals:privatx.io', '!trading_alpha:privatx.io'],
    permissions: ['send_text', 'send_media', 'send_alerts', 'send_buttons'],
    totalDispatched: 890,
    lastActive: Date.now() - 1000 * 120,
  },
  {
    id: 'bot_devops_watchdog',
    name: 'Infra Sentinel Watchdog',
    avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
    token: 'syt_ZGV2b3BzX3dhdGNoZG9nXzM5OGJjMTFk_PrivatX',
    status: 'ONLINE',
    description: 'Monitoramento de instâncias Kubernetes, latência de API Matrix Synapse e consumo de CPU/Memória.',
    authorizedRooms: ['!devops_monitor:privatx.io'],
    permissions: ['send_text', 'send_alerts', 'send_buttons', 'receive_actions'],
    totalDispatched: 320,
    lastActive: Date.now() - 1000 * 60,
  },
  {
    id: 'bot_forex_pulse',
    name: 'Forex Gold & DXY Hunter',
    avatar: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=150&auto=format&fit=crop&q=80',
    token: 'syt_Zm9yZXhfcHVsc2VfMWJhYjkwMDllYQ_PrivatX',
    status: 'STANDBY',
    description: 'Sinais em tempo real para XAUUSD (Ouro), EURUSD e índices Macro.',
    authorizedRooms: ['!forex_scalper:privatx.io'],
    permissions: ['send_text', 'send_media', 'send_alerts', 'send_buttons'],
    totalDispatched: 410,
    lastActive: Date.now() - 1000 * 600,
  },
];

let rooms: MatrixRoom[] = [
  {
    id: '!btc_whale_signals:privatx.io',
    name: '🚨 BTC & Crypto Whale Alerts',
    topic: 'Canal VIP de sinais automatizados de alta liquidez com execução rápida via bot',
    avatar: 'https://images.unsplash.com/photo-1621416894569-0f39ed31d247?w=150&auto=format&fit=crop&q=80',
    isPrivate: true,
    unreadCount: 2,
    isMuted: false,
    category: 'trading',
    memberCount: 842,
    inviteLink: 'https://privatx.io/invite/BTC889',
    inviteCode: 'BTC889',
    allowedBots: ['bot_binance_sniper', 'bot_market_monitor'],
    pinnedMessageId: 'msg_btc_pin_01',
    createdAt: '2026-01-10T10:00:00Z',
    encryption: 'm.megolm.v1.aes-sha2',
  },
  {
    id: '!trading_alpha:privatx.io',
    name: '📈 Binance Futures Alpha VIP',
    topic: 'Setup institucional de scalping em Altcoins e futuros perpétuos',
    avatar: 'https://images.unsplash.com/photo-1642543492481-44e81e3914a7?w=150&auto=format&fit=crop&q=80',
    isPrivate: true,
    unreadCount: 0,
    isMuted: false,
    category: 'trading',
    memberCount: 318,
    inviteLink: 'https://privatx.io/invite/ALPHA77',
    inviteCode: 'ALPHA77',
    allowedBots: ['bot_binance_sniper'],
    createdAt: '2026-02-01T12:00:00Z',
    encryption: 'm.megolm.v1.aes-sha2',
  },
  {
    id: '!devops_monitor:privatx.io',
    name: '⚡ Matrix & Server Sentinel',
    topic: 'Alertas de infraestrutura em tempo real: Synapse, PostgreSQL, Nginx e Latência',
    avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
    isPrivate: true,
    unreadCount: 1,
    isMuted: false,
    category: 'devops',
    memberCount: 14,
    inviteLink: 'https://privatx.io/invite/OPS500',
    inviteCode: 'OPS500',
    allowedBots: ['bot_devops_watchdog'],
    createdAt: '2026-01-15T08:00:00Z',
    encryption: 'none',
  },
  {
    id: '!forex_scalper:privatx.io',
    name: '🏆 Gold & Forex VIP Matrix',
    topic: 'Sinais XAUUSD, DXY e Notificações de Payroll com botões interativos',
    avatar: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=150&auto=format&fit=crop&q=80',
    isPrivate: true,
    unreadCount: 0,
    isMuted: true,
    category: 'forex',
    memberCount: 512,
    inviteLink: 'https://privatx.io/invite/GOLD99',
    inviteCode: 'GOLD99',
    allowedBots: ['bot_forex_pulse'],
    createdAt: '2026-02-10T14:30:00Z',
    encryption: 'm.megolm.v1.aes-sha2',
  },
];

let messagesByRoom: Record<string, MatrixMessage[]> = {
  '!btc_whale_signals:privatx.io': [
    {
      id: 'msg_btc_pin_01',
      roomId: '!btc_whale_signals:privatx.io',
      sender: {
        userId: '@matrix_admin:privatx.io',
        displayName: 'Matrix Admin',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        isBot: false,
        role: 'admin',
        badge: 'ADM',
      },
      timestamp: Date.now() - 1000 * 60 * 180,
      msgtype: 'm.text',
      body: '📌 **Regras do Grupo**: Este grupo privado recebe sinais automáticos via API Matrix Synapse. Utilize os botões interativos abaixo dos alertas para executar ordens na Binance ou abrir gráficos em tempo real.',
      isPinned: true,
      deliveryStatus: 'read',
    },
    {
      id: 'msg_btc_02',
      roomId: '!btc_whale_signals:privatx.io',
      sender: {
        userId: '@bot_binance_sniper:privatx.io',
        displayName: 'Binance Signal Sniper',
        avatarUrl: 'https://images.unsplash.com/photo-1622979135225-d2ba269bc1df?w=150&auto=format&fit=crop&q=80',
        isBot: true,
        role: 'bot',
        badge: 'BOT',
      },
      timestamp: Date.now() - 1000 * 60 * 45,
      msgtype: 'm.image',
      body: 'Gráfico diário BTC/USDT com zonas de acumulação e suporte em $117.800.',
      mediaUrl: 'https://images.unsplash.com/photo-1642543492481-44e81e3914a7?w=1200&auto=format&fit=crop&q=80',
      mediaThumbnail: 'https://images.unsplash.com/photo-1642543492481-44e81e3914a7?w=400&auto=format&fit=crop&q=80',
      deliveryStatus: 'read',
    },
    {
      id: 'msg_btc_03',
      roomId: '!btc_whale_signals:privatx.io',
      sender: {
        userId: '@bot_binance_sniper:privatx.io',
        displayName: 'Binance Signal Sniper',
        avatarUrl: 'https://images.unsplash.com/photo-1622979135225-d2ba269bc1df?w=150&auto=format&fit=crop&q=80',
        isBot: true,
        role: 'bot',
        badge: 'BOT',
      },
      timestamp: Date.now() - 1000 * 60 * 8,
      msgtype: 'm.alert',
      body: '🚨 BTCUSDT ALERTA\n\n🔴 VENDA CONFIRMADA\nPreço: $118.250\nEstratégia: EMA 9/21 + RSI Bearish Divergence\nStatus: CONFIRMADO',
      alertData: {
        severity: 'CRITICAL',
        tag: 'FUTURES SPOT',
        pair: 'BTC/USDT',
        actionType: 'SELL',
        price: '$118,250.00',
        strategy: 'EMA 9/21 Cross + RSI Bearish Div',
        status: 'SINAL CONFIRMADO',
        entry: '$118,250',
        stopLoss: '$119,400',
        takeProfit: '$116,100',
        timeframe: '15m / 1h',
        change24h: '+3.42%',
        volume: '$4.2B 24h',
        indicators: [
          { name: 'RSI (14)', value: '74.2 (Overbought)', signal: 'bearish' },
          { name: 'EMA 9/21', value: 'Cruzamento Baixista', signal: 'bearish' },
          { name: 'Orderbook Delta', value: '-$84.5M Venda', signal: 'bearish' },
        ],
      },
      buttons: [
        {
          id: 'btn_chart_btc',
          label: '📊 Abrir Gráfico',
          action: 'open_chart',
          style: 'outline',
          payload: { pair: 'BTCUSDT', interval: '15m' },
        },
        {
          id: 'btn_sell_btc',
          label: '🔴 Vender (Short)',
          action: 'sell',
          style: 'binance-sell',
          payload: { pair: 'BTCUSDT', side: 'SELL', price: '118250', leverage: 10 },
        },
        {
          id: 'btn_buy_btc',
          label: '🟢 Comprar (Long)',
          action: 'buy',
          style: 'binance-buy',
          payload: { pair: 'BTCUSDT', side: 'BUY', price: '118250', leverage: 10 },
        },
        {
          id: 'btn_details_btc',
          label: '📋 Detalhes do Alerta',
          action: 'open_screen',
          style: 'secondary',
          payload: { screen: 'order_details', pair: 'BTCUSDT' },
        },
      ],
      reactions: { '🔥': 24, '🚀': 18, '👀': 12 },
      deliveryStatus: 'read',
    },
    {
      id: 'msg_btc_04',
      roomId: '!btc_whale_signals:privatx.io',
      sender: {
        userId: '@bot_market_monitor:privatx.io',
        displayName: 'Whale Flow & Liquidations',
        avatarUrl: 'https://images.unsplash.com/photo-1642543492481-44e81e3914a7?w=150&auto=format&fit=crop&q=80',
        isBot: true,
        role: 'bot',
        badge: 'BOT',
      },
      timestamp: Date.now() - 1000 * 60 * 2,
      msgtype: 'm.audio',
      body: '🎙️ Briefing de Áudio: Resumo do fechamento 4h e volume institucional.',
      mediaUrl: 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3',
      duration: 38,
      deliveryStatus: 'delivered',
    },
  ],
  '!trading_alpha:privatx.io': [
    {
      id: 'msg_alpha_01',
      roomId: '!trading_alpha:privatx.io',
      sender: {
        userId: '@bot_binance_sniper:privatx.io',
        displayName: 'Binance Signal Sniper',
        avatarUrl: 'https://images.unsplash.com/photo-1622979135225-d2ba269bc1df?w=150&auto=format&fit=crop&q=80',
        isBot: true,
        role: 'bot',
        badge: 'BOT',
      },
      timestamp: Date.now() - 1000 * 60 * 12,
      msgtype: 'm.alert',
      body: '🟢 ETHUSDT ALERTA BREAKOUT\n\nCOMPRA CONFIRMADA\nPreço: $3.890,40\nAlvo 1: $4.050,00',
      alertData: {
        severity: 'SUCCESS',
        tag: 'ALTCOIN SCALP',
        pair: 'ETH/USDT',
        actionType: 'BUY',
        price: '$3,890.40',
        strategy: 'Volume Breakout + Fibonacci 0.618',
        status: 'ATIVO',
        entry: '$3,890.40',
        stopLoss: '$3,810.00',
        takeProfit: '$4,120.00',
        timeframe: '5m / 15m',
        change24h: '+6.18%',
        indicators: [
          { name: 'MACD', value: 'Bullish Crossover', signal: 'bullish' },
          { name: 'Volume Surge', value: '+340% acima da média', signal: 'bullish' },
        ],
      },
      buttons: [
        {
          id: 'btn_buy_eth',
          label: '🟢 Executar Ordem de Compra',
          action: 'buy',
          style: 'binance-buy',
          payload: { pair: 'ETHUSDT', side: 'BUY', price: '3890.40' },
        },
        {
          id: 'btn_chart_eth',
          label: '📊 TradingView Gráfico',
          action: 'open_chart',
          style: 'outline',
          payload: { pair: 'ETHUSDT' },
        },
      ],
      deliveryStatus: 'read',
    },
  ],
  '!devops_monitor:privatx.io': [
    {
      id: 'msg_devops_01',
      roomId: '!devops_monitor:privatx.io',
      sender: {
        userId: '@bot_devops_watchdog:privatx.io',
        displayName: 'Infra Sentinel Watchdog',
        avatarUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
        isBot: true,
        role: 'bot',
        badge: 'BOT',
      },
      timestamp: Date.now() - 1000 * 60 * 5,
      msgtype: 'm.alert',
      body: '⚠️ Alerta de Infraestrutura: Synapse Matrix Cluster Latency Spike > 180ms',
      alertData: {
        severity: 'WARNING',
        tag: 'DEV-OPS INFRA',
        pair: 'SYNAPSE-PROD-01',
        actionType: 'STATUS',
        price: '185ms (Normal < 40ms)',
        strategy: 'Prometheus AlertManager',
        status: 'AVISO ATIVO',
        indicators: [
          { name: 'CPU Cluster', value: '82% Load', signal: 'bearish' },
          { name: 'PostgreSQL Pool', value: '148/200 conn', signal: 'neutral' },
          { name: 'Redis Cache', value: 'Hit Rate 98.4%', signal: 'bullish' },
        ],
      },
      buttons: [
        {
          id: 'btn_scale_cluster',
          label: '⚡ Auto-Scale +2 Pods',
          action: 'custom_action',
          style: 'primary',
          payload: { command: 'kubectl scale deployment synapse --replicas=6' },
        },
        {
          id: 'btn_ack_alert',
          label: '✅ Reconhecer (ACK)',
          action: 'send_event',
          style: 'secondary',
          payload: { ack: true, target: 'SYNAPSE-PROD-01' },
        },
      ],
      deliveryStatus: 'delivered',
    },
  ],
  '!forex_scalper:privatx.io': [
    {
      id: 'msg_forex_01',
      roomId: '!forex_scalper:privatx.io',
      sender: {
        userId: '@bot_forex_pulse:privatx.io',
        displayName: 'Forex Gold & DXY Hunter',
        avatarUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=150&auto=format&fit=crop&q=80',
        isBot: true,
        role: 'bot',
        badge: 'BOT',
      },
      timestamp: Date.now() - 1000 * 60 * 30,
      msgtype: 'm.file',
      body: 'Relatório diário de Correlação XAUUSD & Taxas do Fed em PDF anexo.',
      fileName: 'Market_Macro_Analysis_2026.pdf',
      fileSize: '2.4 MB',
      mimeType: 'application/pdf',
      deliveryStatus: 'read',
    },
  ],
};

let actionLogs: ActionExecutionLog[] = [
  {
    id: 'act_001',
    timestamp: Date.now() - 1000 * 60 * 7,
    action: 'sell',
    buttonId: 'btn_sell_btc',
    messageId: 'msg_btc_03',
    roomId: '!btc_whale_signals:privatx.io',
    userId: '@trader.alex:privatx.io',
    status: 'COMPLETED',
    responseSummary: 'Ordem de Venda SHORT enviada para API Binance: 0.25 BTC @ $118,250',
    payload: { pair: 'BTCUSDT', side: 'SELL', orderId: 'BIN_9874125' },
  },
];

// Helper to update last messages
function syncLastMessages() {
  rooms.forEach((r) => {
    const list = messagesByRoom[r.id] || [];
    if (list.length > 0) {
      r.lastMessage = list[list.length - 1];
    }
  });
}
syncLastMessages();

// ================= API ENDPOINTS =================

// 1. Health check
app.get('/api/v1/health', (req, res) => {
  res.json({
    status: 'ok',
    matrixHomeserver: 'https://synapse.privatx.io:8448',
    synapseVersion: 'v1.115.0-element-hq',
    totalRooms: rooms.length,
    activeBots: bots.filter((b) => b.status === 'ONLINE').length,
    timestamp: new Date().toISOString(),
  });
});

// 2. Current user
app.get('/api/v1/user/me', (req, res) => {
  res.json(currentUser);
});

app.post('/api/v1/user/update', (req, res) => {
  currentUser = { ...currentUser, ...req.body };
  res.json({ success: true, user: currentUser });
});

// 3. Rooms
app.get('/api/v1/rooms', (req, res) => {
  syncLastMessages();
  res.json(rooms);
});

app.post('/api/v1/rooms', (req, res) => {
  const { name, topic, category, isPrivate, avatar } = req.body;
  const roomId = `!${name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${Date.now().toString().slice(-4)}:privatx.io`;
  const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();

  const newRoom: MatrixRoom = {
    id: roomId,
    name: name || 'Novo Grupo Privado',
    topic: topic || 'Grupo criado no PrivatX',
    avatar:
      avatar ||
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
    isPrivate: isPrivate ?? true,
    unreadCount: 0,
    isMuted: false,
    category: category || 'general',
    memberCount: 1,
    inviteLink: `https://privatx.io/invite/${inviteCode}`,
    inviteCode: inviteCode,
    allowedBots: bots.map((b) => b.id),
    createdAt: new Date().toISOString(),
    encryption: isPrivate ? 'm.megolm.v1.aes-sha2' : 'none',
  };

  rooms.unshift(newRoom);
  messagesByRoom[roomId] = [
    {
      id: `msg_welcome_${Date.now()}`,
      roomId: roomId,
      sender: {
        userId: currentUser.userId,
        displayName: currentUser.displayName,
        avatarUrl: currentUser.avatar,
        isBot: false,
        role: 'admin',
        badge: 'OWNER',
      },
      timestamp: Date.now(),
      msgtype: 'm.text',
      body: `🎉 Grupo criado com sucesso! Compartilhe o link de convite: ${newRoom.inviteLink}`,
      deliveryStatus: 'sent',
    },
  ];

  if (!currentUser.joinedRooms.includes(roomId)) {
    currentUser.joinedRooms.push(roomId);
  }

  syncLastMessages();
  res.status(201).json(newRoom);
});

// 4. Messages in Room
app.get('/api/v1/rooms/:roomId/messages', (req, res) => {
  const { roomId } = req.params;
  const list = messagesByRoom[roomId] || [];
  res.json(list);
});

app.post('/api/v1/rooms/:roomId/messages', (req, res) => {
  const { roomId } = req.params;
  const { body, msgtype, mediaUrl, fileName, fileSize, mimeType, duration, buttons, replyTo } = req.body;

  if (!messagesByRoom[roomId]) {
    messagesByRoom[roomId] = [];
  }

  const newMsg: MatrixMessage = {
    id: `$event_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    roomId: roomId,
    sender: {
      userId: currentUser.userId,
      displayName: currentUser.displayName,
      avatarUrl: currentUser.avatar,
      isBot: false,
      role: currentUser.role,
    },
    timestamp: Date.now(),
    msgtype: msgtype || 'm.text',
    body: body || '',
    mediaUrl,
    fileName,
    fileSize,
    mimeType,
    duration,
    buttons,
    replyTo,
    deliveryStatus: 'delivered',
  };

  messagesByRoom[roomId].push(newMsg);
  syncLastMessages();
  res.status(201).json(newMsg);
});

// 5. Spec #11: External Notification API Endpoint (100% Flexível e sem regras rígidas)
// POST /api/v1/notifications/send
app.post('/api/v1/notifications/send', (req, res) => {
  const {
    room,
    roomId: explicitRoomId,
    botId,
    type,
    title,
    message,
    text, // suporte para campo 'text'
    body, // suporte para campo 'body'
    content, // suporte para campo 'content'
    alertData,
    image,
    imageUrl,
    img,
    video,
    audio,
    file,
    buttons,
    replyTo,
  } = req.body;

  // Resolve room by explicit ID, name match, or first room
  let targetRoom = rooms.find(
    (r) =>
      r.id === explicitRoomId ||
      r.id === room ||
      r.name.toLowerCase().includes((room || '').toLowerCase()) ||
      r.inviteCode.toLowerCase() === (room || '').toLowerCase()
  );

  if (!targetRoom) {
    targetRoom = rooms[0];
  }

  // Resolve bot
  let senderBot = bots.find((b) => b.id === botId || b.token === req.headers['authorization']?.replace('Bearer ', ''));
  if (!senderBot) {
    senderBot = bots[0];
  }

  const rawText = message || text || body || content || '';
  const mediaLink = image || imageUrl || img || video || audio || (file && typeof file === 'string' ? file : file?.url);

  // Determine msgtype flexibly: só ativa card de alerta se o usuário explicitamente pediu ou enviou alertData
  let msgtype: MatrixMessage['msgtype'] = 'm.text';
  if (type === 'alert' && alertData) {
    msgtype = 'm.alert';
  } else if (image || imageUrl || img || type === 'image') {
    msgtype = 'm.image';
  } else if (video || type === 'video') {
    msgtype = 'm.video';
  } else if (audio || type === 'audio') {
    msgtype = 'm.audio';
  } else if (file || type === 'file') {
    msgtype = 'm.file';
  } else if (type === 'alert') {
    msgtype = 'm.alert';
  }

  const formattedButtons: ActionButton[] = (buttons || []).map((btn: any, idx: number) => ({
    id: btn.id || `btn_${Date.now()}_${idx}`,
    label: btn.label || btn.text || btn.title || 'Ação',
    action: btn.action || (btn.url ? 'open_url' : 'custom_action'),
    url: btn.url || btn.link,
    style: btn.style || (btn.action === 'buy' ? 'binance-buy' : btn.action === 'sell' ? 'binance-sell' : 'outline'),
    payload: btn.payload || { action: btn.action, raw: btn },
  }));

  // Monta o corpo da mensagem sem forçar templates ou ícones extras se o usuário só enviou texto puro
  let finalBody = rawText;
  if (title && rawText) {
    finalBody = `${title}\n\n${rawText}`;
  } else if (title && !rawText) {
    finalBody = title;
  }

  const newEvent: MatrixMessage = {
    id: `$event_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    roomId: targetRoom.id,
    sender: {
      userId: `@${senderBot.id}:privatx.io`,
      displayName: senderBot.name,
      avatarUrl: senderBot.avatar,
      isBot: true,
      role: 'bot',
      badge: 'BOT',
    },
    timestamp: Date.now(),
    msgtype: msgtype,
    body: finalBody,
    alertData: alertData || undefined,
    mediaUrl: mediaLink,
    mediaThumbnail: mediaLink,
    fileName: file?.name || (typeof file === 'string' ? file.split('/').pop() : undefined),
    fileSize: file?.size,
    mimeType: file?.mimeType,
    duration: req.body.duration,
    buttons: formattedButtons.length > 0 ? formattedButtons : undefined,
    replyTo,
    deliveryStatus: 'delivered',
  };

  if (!messagesByRoom[targetRoom.id]) {
    messagesByRoom[targetRoom.id] = [];
  }
  messagesByRoom[targetRoom.id].push(newEvent);

  // Update target room unread & bot dispatched stats
  targetRoom.unreadCount += 1;
  senderBot.totalDispatched += 1;
  senderBot.lastActive = Date.now();

  syncLastMessages();

  res.status(200).json({
    success: true,
    event_id: newEvent.id,
    room_id: targetRoom.id,
    room_name: targetRoom.name,
    timestamp: newEvent.timestamp,
    message: 'Notificação recebida e entregue com sucesso.',
  });
});

// 6. Bot Management Endpoints
app.get('/api/v1/bots', (req, res) => {
  res.json(bots);
});

app.post('/api/v1/bots', (req, res) => {
  const { name, description, avatar, authorizedRooms, permissions } = req.body;
  const botId = `bot_${name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${Math.random().toString(36).substring(2, 6)}`;
  const token = `syt_${Buffer.from(botId + '_' + Date.now()).toString('base64').replace(/=/g, '')}_PrivatX`;

  const newBot: BotConfig = {
    id: botId,
    name: name || 'Novo Bot de Notificações',
    avatar:
      avatar ||
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
    token: token,
    status: 'ONLINE',
    description: description || 'Bot para despacho de mensagens e alertas no Matrix.',
    authorizedRooms: authorizedRooms || rooms.map((r) => r.id),
    permissions: permissions || ['send_text', 'send_media', 'send_alerts', 'send_buttons'],
    totalDispatched: 0,
    lastActive: Date.now(),
  };

  bots.push(newBot);
  res.status(201).json(newBot);
});

app.post('/api/v1/bots/:id/regenerate-token', (req, res) => {
  const { id } = req.params;
  const bot = bots.find((b) => b.id === id);
  if (!bot) {
    return res.status(404).json({ error: 'Bot não encontrado' });
  }
  bot.token = `syt_${Buffer.from(bot.id + '_' + Date.now()).toString('base64').replace(/=/g, '')}_PrivatX`;
  res.json({ success: true, token: bot.token });
});

// 7. Interactive Action Execution (Spec #10 & #12)
app.post('/api/v1/actions/execute', (req, res) => {
  const { action, buttonId, messageId, roomId, payload } = req.body;

  const targetRoom = rooms.find((r) => r.id === roomId) || rooms[0];
  const messageList = messagesByRoom[roomId] || [];
  const message = messageList.find((m) => m.id === messageId);

  const logId = `act_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

  let responseSummary = `Ação '${action}' processada com sucesso no backend Matrix.`;
  let downstreamMessage: MatrixMessage | null = null;

  if (action === 'buy') {
    responseSummary = `🟢 [Ordem Executada] Compra ${payload?.pair || 'BTCUSDT'} enviada com sucesso ao Broker! Preço: ${payload?.price || 'Mercado'}.`;
    downstreamMessage = {
      id: `$event_${Date.now()}_ack`,
      roomId: roomId,
      sender: {
        userId: '@bot_binance_sniper:privatx.io',
        displayName: 'Binance Signal Sniper',
        avatarUrl: 'https://images.unsplash.com/photo-1622979135225-d2ba269bc1df?w=150&auto=format&fit=crop&q=80',
        isBot: true,
        role: 'bot',
        badge: 'BOT',
      },
      timestamp: Date.now(),
      msgtype: 'm.notice',
      body: `✅ Ordem de Compra confirmada para ${currentUser.displayName}: 1x ${payload?.pair || 'BTCUSDT'} @ ${payload?.price || '$118,250'}.`,
      deliveryStatus: 'delivered',
    };
  } else if (action === 'sell') {
    responseSummary = `🔴 [Ordem Executada] Venda SHORT ${payload?.pair || 'BTCUSDT'} executada com sucesso! Stop Loss e Take Profit armados.`;
    downstreamMessage = {
      id: `$event_${Date.now()}_ack`,
      roomId: roomId,
      sender: {
        userId: '@bot_binance_sniper:privatx.io',
        displayName: 'Binance Signal Sniper',
        avatarUrl: 'https://images.unsplash.com/photo-1622979135225-d2ba269bc1df?w=150&auto=format&fit=crop&q=80',
        isBot: true,
        role: 'bot',
        badge: 'BOT',
      },
      timestamp: Date.now(),
      msgtype: 'm.notice',
      body: `✅ Ordem de Venda Short registrada para ${currentUser.displayName}: ${payload?.pair || 'BTCUSDT'} @ ${payload?.price || '$118,250'}.`,
      deliveryStatus: 'delivered',
    };
  } else if (action === 'custom_action') {
    responseSummary = `⚡ [Automação Disparada] Comando executado: ${payload?.command || 'Trigger'}`;
  }

  const logEntry: ActionExecutionLog = {
    id: logId,
    timestamp: Date.now(),
    action,
    buttonId,
    messageId,
    roomId,
    userId: currentUser.userId,
    status: 'COMPLETED',
    responseSummary,
    payload,
  };

  actionLogs.unshift(logEntry);

  if (downstreamMessage && messagesByRoom[roomId]) {
    messagesByRoom[roomId].push(downstreamMessage);
    syncLastMessages();
  }

  res.json({
    success: true,
    log: logEntry,
    downstreamMessage,
    actionEvent: {
      action,
      message_id: messageId,
      room_id: roomId,
      user_id: currentUser.userId,
      processed_at: new Date().toISOString(),
    },
  });
});

app.get('/api/v1/actions/logs', (req, res) => {
  res.json(actionLogs);
});

// 8. Invite Link Handlers (Spec #6)
app.get('/api/v1/invites/:code', (req, res) => {
  const { code } = req.params;
  const room = rooms.find((r) => r.inviteCode.toUpperCase() === code.toUpperCase());
  if (!room) {
    return res.status(404).json({ error: 'Convite inválido ou expirado' });
  }
  res.json({
    valid: true,
    room: {
      id: room.id,
      name: room.name,
      topic: room.topic,
      avatar: room.avatar,
      memberCount: room.memberCount,
      isPrivate: room.isPrivate,
      category: room.category,
    },
  });
});

app.post('/api/v1/invites/join', (req, res) => {
  const { code } = req.body;
  const room = rooms.find((r) => r.inviteCode.toUpperCase() === (code || '').toUpperCase());
  if (!room) {
    return res.status(404).json({ error: 'Link de convite inválido ou não encontrado.' });
  }

  if (!currentUser.joinedRooms.includes(room.id)) {
    currentUser.joinedRooms.push(room.id);
    room.memberCount += 1;
  }

  res.json({
    success: true,
    message: `Você entrou com sucesso no grupo ${room.name}!`,
    room,
  });
});

// Start Server with Vite Middleware
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`PrivatX Server running on http://localhost:${PORT}`);
  });
}

startServer();
