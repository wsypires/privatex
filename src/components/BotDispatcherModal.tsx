import React, { useState } from 'react';
import { BotConfig, MatrixRoom } from '../types';
import {
  Bot,
  Send,
  Code2,
  Copy,
  Check,
  RefreshCw,
  Plus,
  Shield,
  Layers,
  Terminal,
  AlertCircle,
  Radio,
  FileCode,
} from 'lucide-react';

interface BotDispatcherModalProps {
  isOpen: boolean;
  onClose: () => void;
  bots: BotConfig[];
  rooms: MatrixRoom[];
  onSendNotification: (payload: any) => Promise<any>;
  onCreateBot: (botData: any) => Promise<any>;
  onRegenerateToken: (botId: string) => Promise<string>;
}

export const BotDispatcherModal: React.FC<BotDispatcherModalProps> = ({
  isOpen,
  onClose,
  bots,
  rooms,
  onSendNotification,
  onCreateBot,
  onRegenerateToken,
}) => {
  const [activeTab, setActiveTab] = useState<'dispatcher' | 'bots' | 'code' | 'new_bot'>('dispatcher');
  const [selectedBotId, setSelectedBotId] = useState<string>(bots[0]?.id || 'bot_binance_sniper');
  const [selectedRoomId, setSelectedRoomId] = useState<string>(rooms[0]?.id || '');
  const [preset, setPreset] = useState<string>('btc_alert');
  const [copiedTokenId, setCopiedTokenId] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [sendResult, setSendResult] = useState<any | null>(null);

  // Form states for notification
  const [title, setTitle] = useState<string>('BTCUSDT ALERTA');
  const [alertType, setAlertType] = useState<'CRITICAL' | 'SUCCESS' | 'WARNING' | 'INFO'>('CRITICAL');
  const [pair, setPair] = useState<string>('BTC/USDT');
  const [price, setPrice] = useState<string>('$118,250.00');
  const [strategy, setStrategy] = useState<string>('EMA 9/21 Cross + RSI Bearish Div');
  const [message, setMessage] = useState<string>('Sinal de Venda confirmado pelo algoritmo institucional.');
  const [entryPrice, setEntryPrice] = useState<string>('$118,250');
  const [stopLoss, setStopLoss] = useState<string>('$119,400');
  const [takeProfit, setTakeProfit] = useState<string>('$116,100');

  // New bot form states
  const [newBotName, setNewBotName] = useState<string>('');
  const [newBotDesc, setNewBotDesc] = useState<string>('');

  if (!isOpen) return null;

  const handleApplyPreset = (key: string) => {
    setPreset(key);
    if (key === 'btc_alert') {
      setTitle('BTCUSDT ALERTA');
      setAlertType('CRITICAL');
      setPair('BTC/USDT');
      setPrice('$118,250.00');
      setStrategy('EMA 9/21 Cross + RSI Bearish Div');
      setMessage('🔴 VENDA CONFIRMADA\nPreço: $118.250\nEstratégia: EMA + RSI');
      setEntryPrice('$118,250');
      setStopLoss('$119,400');
      setTakeProfit('$116,100');
    } else if (key === 'eth_breakout') {
      setTitle('ETHUSDT BREAKOUT');
      setAlertType('SUCCESS');
      setPair('ETH/USDT');
      setPrice('$3,890.40');
      setStrategy('Volume Breakout + Fibonacci');
      setMessage('🟢 COMPRA CONFIRMADA\nPreço: $3.890,40\nAlvo 1: $4.120');
      setEntryPrice('$3,890');
      setStopLoss('$3,810');
      setTakeProfit('$4,120');
    } else if (key === 'server_crash') {
      setTitle('SERVER INFRA ALERT');
      setAlertType('WARNING');
      setPair('SYNAPSE-NODE-03');
      setPrice('Latency: 195ms');
      setStrategy('Prometheus Watchdog Alert');
      setMessage('⚠️ Latência elevada no cluster Matrix Synapse. Pool de conexões PostgreSQL em 85%.');
      setEntryPrice('195ms');
      setStopLoss('Alert');
      setTakeProfit('OK < 40ms');
    }
  };

  const handleSend = async () => {
    setIsSending(true);
    setSendResult(null);

    const payload = {
      room: selectedRoomId || rooms[0]?.id,
      botId: selectedBotId,
      type: 'alert',
      title: title,
      message: message,
      alertData: {
        severity: alertType,
        tag: 'API AUTOMATION',
        pair: pair,
        actionType: alertType === 'CRITICAL' ? 'SELL' : alertType === 'SUCCESS' ? 'BUY' : 'ALERT',
        price: price,
        strategy: strategy,
        status: 'CONFIRMADO VIA API',
        entry: entryPrice,
        stopLoss: stopLoss,
        takeProfit: takeProfit,
        indicators: [
          { name: 'Algoritmo Matrix', value: 'Trigger Ativado', signal: alertType === 'SUCCESS' ? 'bullish' : 'bearish' },
          { name: 'RSI(14)', value: alertType === 'CRITICAL' ? '74.2' : '42.1', signal: alertType === 'SUCCESS' ? 'bullish' : 'bearish' },
        ],
      },
      buttons: [
        { id: `btn_${Date.now()}_1`, label: '📊 Abrir Gráfico', action: 'open_chart', style: 'outline' },
        {
          id: `btn_${Date.now()}_2`,
          label: alertType === 'CRITICAL' ? '🔴 Vender (Short)' : '🟢 Comprar (Long)',
          action: alertType === 'CRITICAL' ? 'sell' : 'buy',
          style: alertType === 'CRITICAL' ? 'binance-sell' : 'binance-buy',
        },
      ],
    };

    try {
      const res = await onSendNotification(payload);
      setSendResult(res);
    } catch (err: any) {
      setSendResult({ error: err.message || 'Erro ao enviar notificação' });
    } finally {
      setIsSending(false);
    }
  };

  const handleCopyToken = (botId: string, token: string) => {
    navigator.clipboard.writeText(token);
    setCopiedTokenId(botId);
    setTimeout(() => setCopiedTokenId(null), 2000);
  };

  const handleCreateBotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBotName.trim()) return;
    await onCreateBot({
      name: newBotName,
      description: newBotDesc,
    });
    setNewBotName('');
    setNewBotDesc('');
    setActiveTab('bots');
  };

  const currentBot = bots.find((b) => b.id === selectedBotId) || bots[0];

  const curlSnippet = `curl -X POST https://privatx.io/api/v1/notifications/send \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer ${currentBot?.token || 'YOUR_BOT_TOKEN'}" \\
  -d '{
    "room": "${selectedRoomId || '!btc_whale_signals:privatx.io'}",
    "type": "alert",
    "title": "${title}",
    "message": "${message.replace(/\n/g, '\\n')}",
    "buttons": [
      { "id": "chart", "label": "📊 Abrir Gráfico", "action": "open_chart" },
      { "id": "sell", "label": "🔴 Vender", "action": "sell" }
    ]
  }'`;

  const tradingViewSnippet = `// Payload JSON para colar no Webhook do seu Sistema / TradingView:
// Webhook URL: https://privatx.io/api/v1/notifications/send
{
  "room": "${selectedRoomId || '!btc_whale_signals:privatx.io'}",
  "botId": "${currentBot?.id || 'bot_binance_sniper'}",
  "type": "alert",
  "title": "{{ticker}} SINAL {{strategy.order.action}}",
  "message": "Ordem acionada em {{timenow}}\\nPreço de Execução: {{close}}\\nContratos: {{strategy.order.contracts}}",
  "price": "{{close}}",
  "strategy": "{{strategy.name}}",
  "buttons": [
    { "id": "chart_view", "label": "📊 Abrir Gráfico Interativo", "action": "open_chart" },
    { "id": "exec_order", "label": "⚡ Executar Operação", "action": "buy" }
  ]
}`;

  const pythonSnippet = `import requests

url = "https://privatx.io/api/v1/notifications/send"
headers = {
    "Authorization": "Bearer ${currentBot?.token || 'YOUR_BOT_TOKEN'}",
    "Content-Type": "application/json"
}
payload = {
    "room": "${selectedRoomId || '!btc_whale_signals:privatx.io'}",
    "type": "alert",
    "title": "${title}",
    "message": "${message.replace(/\n/g, '\\n')}",
    "alertData": {
        "severity": "CRITICAL",
        "pair": "BTC/USDT",
        "actionType": "SELL",
        "price": "$118,250.00",
        "strategy": "Análise Gráfica + RSI Divergence"
    },
    "buttons": [
        {"id": "chart", "label": "📊 Abrir Gráfico", "action": "open_chart"},
        {"id": "sell", "label": "🔴 Vender", "action": "sell"}
    ]
}

response = requests.post(url, json=payload, headers=headers)
print("PrivatX Event ID:", response.json().get("event_id"))`;

  const nodeSnippet = `const axios = require('axios');

async function sendChartAlert() {
  const url = 'https://privatx.io/api/v1/notifications/send';
  const token = '${currentBot?.token || 'YOUR_BOT_TOKEN'}';
  
  const payload = {
    room: '${selectedRoomId || '!btc_whale_signals:privatx.io'}',
    type: 'alert',
    title: 'BTC/USDT Rompimento Gráfico',
    message: 'Análise gráfica detectou rompimento de Resistência com alto volume no tempo 15m.',
    alertData: {
      severity: 'SUCCESS',
      pair: 'BTC/USDT',
      actionType: 'BUY',
      price: '$118,250.00',
      strategy: 'Suporte & Resistência + Volume Profile'
    },
    buttons: [
      { id: 'btn_chart', label: '📊 Ver Gráfico Interativo', action: 'open_chart' }
    ]
  };

  const response = await axios.post(url, payload, {
    headers: {
      'Authorization': \`Bearer \${token}\`,
      'Content-Type': 'application/json'
    }
  });

  console.log('Notificação enviada! Event ID:', response.data.event_id);
}

sendChartAlert();`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#181A20] border border-[#2B2F36] rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-[#2B2F36] flex items-center justify-between bg-[#1E2329]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#F3BA2F] text-[#000000] flex items-center justify-center font-bold shadow-lg shadow-[#F3BA2F]/10">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-lg text-[#EAECEF]">Central de Bots & API de Automação</h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#0ECB81]/15 text-[#0ECB81] border border-[#0ECB81]/30">
                  Matrix Synapse Layer
                </span>
              </div>
              <p className="text-xs text-[#848E9C]">
                Despache notificações, alertas e botões interativos via API REST para grupos privados.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg bg-[#2B2F36] hover:bg-[#474D57] text-xs font-semibold text-[#EAECEF] transition-colors"
          >
            Fechar
          </button>
        </div>

        {/* Tab Bar */}
        <div className="flex items-center px-4 bg-[#14161A] border-b border-[#2B2F36] gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('dispatcher')}
            className={`py-3 px-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'dispatcher'
                ? 'border-[#F3BA2F] text-[#F3BA2F]'
                : 'border-transparent text-[#848E9C] hover:text-[#EAECEF]'
            }`}
          >
            <Send className="w-3.5 h-3.5" /> Despachador de Alertas (API Test)
          </button>
          <button
            onClick={() => setActiveTab('bots')}
            className={`py-3 px-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'bots'
                ? 'border-[#F3BA2F] text-[#F3BA2F]'
                : 'border-transparent text-[#848E9C] hover:text-[#EAECEF]'
            }`}
          >
            <Bot className="w-3.5 h-3.5" /> Bots Conectados ({bots.length})
          </button>
          <button
            onClick={() => setActiveTab('code')}
            className={`py-3 px-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'code'
                ? 'border-[#F3BA2F] text-[#F3BA2F]'
                : 'border-transparent text-[#848E9C] hover:text-[#EAECEF]'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" /> Código & SDKs (cURL / Python)
          </button>
          <button
            onClick={() => setActiveTab('new_bot')}
            className={`py-3 px-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'new_bot'
                ? 'border-[#F3BA2F] text-[#F3BA2F]'
                : 'border-transparent text-[#848E9C] hover:text-[#EAECEF]'
            }`}
          >
            <Plus className="w-3.5 h-3.5" /> Criar Novo Bot
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4">
          {/* TAB 1: DISPATCHER */}
          {activeTab === 'dispatcher' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              {/* Left Column: Form Settings */}
              <div className="lg:col-span-2 space-y-4">
                {/* Presets */}
                <div>
                  <label className="block text-xs font-mono text-[#848E9C] mb-2 uppercase">
                    Modelos Rápidos (Presets):
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => handleApplyPreset('btc_alert')}
                      className={`p-2.5 rounded-lg border text-left transition-all text-xs ${
                        preset === 'btc_alert'
                          ? 'bg-[#F6465D]/15 border-[#F6465D] text-[#F6465D]'
                          : 'bg-[#1E2329] border-[#2B2F36] text-[#B7BDC6] hover:border-[#474D57]'
                      }`}
                    >
                      <div className="font-bold">🚨 BTC Alerta Venda</div>
                      <div className="text-[10px] text-[#848E9C] mt-0.5">EMA 9/21 + RSI Div</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyPreset('eth_breakout')}
                      className={`p-2.5 rounded-lg border text-left transition-all text-xs ${
                        preset === 'eth_breakout'
                          ? 'bg-[#0ECB81]/15 border-[#0ECB81] text-[#0ECB81]'
                          : 'bg-[#1E2329] border-[#2B2F36] text-[#B7BDC6] hover:border-[#474D57]'
                      }`}
                    >
                      <div className="font-bold">🟢 ETH Breakout Compra</div>
                      <div className="text-[10px] text-[#848E9C] mt-0.5">Volume Surge Alvo</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyPreset('server_crash')}
                      className={`p-2.5 rounded-lg border text-left transition-all text-xs ${
                        preset === 'server_crash'
                          ? 'bg-[#F3BA2F]/15 border-[#F3BA2F] text-[#F3BA2F]'
                          : 'bg-[#1E2329] border-[#2B2F36] text-[#B7BDC6] hover:border-[#474D57]'
                      }`}
                    >
                      <div className="font-bold">⚠️ Infra Latency Alert</div>
                      <div className="text-[10px] text-[#848E9C] mt-0.5">Synapse Watchdog</div>
                    </button>
                  </div>
                </div>

                {/* Target Bot & Target Room */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-mono text-[#848E9C] mb-1">Bot Emissor:</label>
                    <select
                      value={selectedBotId}
                      onChange={(e) => setSelectedBotId(e.target.value)}
                      className="w-full bg-[#1E2329] border border-[#2B2F36] rounded-lg p-2.5 text-xs text-[#EAECEF] focus:outline-none focus:border-[#F3BA2F]"
                    >
                      {bots.map((b) => (
                        <option key={b.id} value={b.id}>
                          🤖 {b.name} ({b.status})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-[#848E9C] mb-1">Grupo de Destino:</label>
                    <select
                      value={selectedRoomId}
                      onChange={(e) => setSelectedRoomId(e.target.value)}
                      className="w-full bg-[#1E2329] border border-[#2B2F36] rounded-lg p-2.5 text-xs text-[#EAECEF] focus:outline-none focus:border-[#F3BA2F]"
                    >
                      {rooms.map((r) => (
                        <option key={r.id} value={r.id}>
                          🔒 {r.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Title & Pair & Price */}
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-mono text-[#848E9C] mb-1">Título do Alerta:</label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full bg-[#1E2329] border border-[#2B2F36] rounded-lg p-2 text-xs text-[#EAECEF] focus:outline-none focus:border-[#F3BA2F]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-[#848E9C] mb-1">Par / Ativo:</label>
                    <input
                      type="text"
                      value={pair}
                      onChange={(e) => setPair(e.target.value)}
                      className="w-full bg-[#1E2329] border border-[#2B2F36] rounded-lg p-2 text-xs text-[#EAECEF] font-mono focus:outline-none focus:border-[#F3BA2F]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-[#848E9C] mb-1">Preço Atual:</label>
                    <input
                      type="text"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="w-full bg-[#1E2329] border border-[#2B2F36] rounded-lg p-2 text-xs text-[#EAECEF] font-mono focus:outline-none focus:border-[#F3BA2F]"
                    />
                  </div>
                </div>

                {/* Strategy & Levels */}
                <div className="grid grid-cols-4 gap-2">
                  <div className="col-span-1">
                    <label className="block text-xs font-mono text-[#848E9C] mb-1">Severidade:</label>
                    <select
                      value={alertType}
                      onChange={(e) => setAlertType(e.target.value as any)}
                      className="w-full bg-[#1E2329] border border-[#2B2F36] rounded-lg p-2 text-xs text-[#EAECEF] focus:outline-none focus:border-[#F3BA2F]"
                    >
                      <option value="CRITICAL">🔴 CRITICAL / VENDA</option>
                      <option value="SUCCESS">🟢 SUCCESS / COMPRA</option>
                      <option value="WARNING">⚠️ WARNING</option>
                      <option value="INFO">ℹ️ INFO</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-[#848E9C] mb-1">Entrada:</label>
                    <input
                      type="text"
                      value={entryPrice}
                      onChange={(e) => setEntryPrice(e.target.value)}
                      className="w-full bg-[#1E2329] border border-[#2B2F36] rounded-lg p-2 text-xs text-[#EAECEF] font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-[#848E9C] mb-1">Stop Loss:</label>
                    <input
                      type="text"
                      value={stopLoss}
                      onChange={(e) => setStopLoss(e.target.value)}
                      className="w-full bg-[#1E2329] border border-[#2B2F36] rounded-lg p-2 text-xs text-[#EAECEF] font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-[#848E9C] mb-1">Alvo (TP):</label>
                    <input
                      type="text"
                      value={takeProfit}
                      onChange={(e) => setTakeProfit(e.target.value)}
                      className="w-full bg-[#1E2329] border border-[#2B2F36] rounded-lg p-2 text-xs text-[#EAECEF] font-mono"
                    />
                  </div>
                </div>

                {/* Message Body */}
                <div>
                  <label className="block text-xs font-mono text-[#848E9C] mb-1">Mensagem / Análise:</label>
                  <textarea
                    rows={3}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full bg-[#1E2329] border border-[#2B2F36] rounded-lg p-2.5 text-xs text-[#EAECEF] focus:outline-none focus:border-[#F3BA2F]"
                  />
                </div>

                {/* Dispatch Button */}
                <button
                  type="button"
                  onClick={handleSend}
                  disabled={isSending}
                  className="w-full py-3 rounded-xl bg-[#F3BA2F] hover:bg-[#E5AC25] text-[#000000] font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#F3BA2F]/20 transition-all active:scale-[0.99] cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  {isSending ? 'Enviando Notificação para o Matrix Synapse...' : 'Disparar Notificação via API Agora'}
                </button>
              </div>

              {/* Right Column: Live API Response & Architecture Preview */}
              <div className="space-y-4">
                <div className="bg-[#1E2329] border border-[#2B2F36] rounded-xl p-4">
                  <div className="flex items-center gap-2 text-xs font-bold font-mono text-[#F3BA2F] mb-2">
                    <Terminal className="w-4 h-4" />
                    Resposta do Servidor Matrix
                  </div>
                  {sendResult ? (
                    <pre className="text-[11px] font-mono bg-[#0B0E11] p-3 rounded-lg text-[#0ECB81] overflow-x-auto max-h-48 border border-[#2B2F36]">
                      {JSON.stringify(sendResult, null, 2)}
                    </pre>
                  ) : (
                    <div className="text-xs text-[#848E9C] bg-[#0B0E11] p-4 rounded-lg border border-[#2B2F36] text-center font-mono">
                      Aguardando disparo da API... Ao enviar, o evento Matrix será postado no grupo e acionará a notificação push Android!
                    </div>
                  )}
                </div>

                <div className="bg-[#14161A] border border-[#2B2F36] rounded-xl p-4 text-xs space-y-2">
                  <div className="font-bold text-[#EAECEF] flex items-center gap-1.5">
                    <Radio className="w-3.5 h-3.5 text-[#0ECB81]" />
                    Fluxo da Notificação (Spec #7):
                  </div>
                  <div className="font-mono text-[11px] text-[#848E9C] space-y-1">
                    <div>1. Sistema Externo / Bot</div>
                    <div className="text-[#F3BA2F]">↓ POST /api/v1/notifications/send</div>
                    <div>2. Servidor Matrix Synapse (Event Bus)</div>
                    <div>3. Grupo Privado (Criptografia Megolm)</div>
                    <div className="text-[#0ECB81]">4. App Android (Push & Botões Interativos)</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: BOTS MANAGEMENT */}
          {activeTab === 'bots' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-[#848E9C]">
                  Gerencie as credenciais dos bots autorizados a enviar mensagens para os grupos privados.
                </p>
                <button
                  onClick={() => setActiveTab('new_bot')}
                  className="px-3 py-1.5 rounded-lg bg-[#F3BA2F] text-[#000000] font-bold text-xs flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" /> Adicionar Bot
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {bots.map((bot) => (
                  <div
                    key={bot.id}
                    className="bg-[#1E2329] border border-[#2B2F36] rounded-xl p-4 space-y-3 hover:border-[#474D57] transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <img
                          src={bot.avatar}
                          alt={bot.name}
                          className="w-11 h-11 rounded-xl object-cover border border-[#2B2F36]"
                        />
                        <div>
                          <div className="font-bold text-sm text-[#EAECEF] flex items-center gap-2">
                            {bot.name}
                            <span
                              className={`px-1.5 py-0.2 rounded text-[10px] font-mono font-bold ${
                                bot.status === 'ONLINE'
                                  ? 'bg-[#0ECB81]/15 text-[#0ECB81]'
                                  : 'bg-[#848E9C]/15 text-[#848E9C]'
                              }`}
                            >
                              {bot.status}
                            </span>
                          </div>
                          <div className="text-[11px] font-mono text-[#848E9C]">{bot.id}</div>
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-[#B7BDC6] line-clamp-2">{bot.description}</p>

                    {/* Token container */}
                    <div className="bg-[#14161A] p-2.5 rounded-lg border border-[#2B2F36] flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-[9px] uppercase font-mono text-[#848E9C]">Token de Acesso:</span>
                        <span className="text-xs font-mono text-[#EAECEF] truncate max-w-[220px]">
                          {bot.token.slice(0, 18)}...
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleCopyToken(bot.id, bot.token)}
                          className="p-1.5 rounded bg-[#2B2F36] hover:bg-[#474D57] text-[#EAECEF] transition-colors"
                          title="Copiar Token"
                        >
                          {copiedTokenId === bot.id ? (
                            <Check className="w-3.5 h-3.5 text-[#0ECB81]" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <button
                          onClick={async () => {
                            await onRegenerateToken(bot.id);
                          }}
                          className="p-1.5 rounded bg-[#2B2F36] hover:bg-[#474D57] text-[#848E9C] hover:text-[#EAECEF] transition-colors"
                          title="Regenerar Token"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center justify-between text-[11px] font-mono text-[#848E9C] pt-1 border-t border-[#2B2F36]/50">
                      <span>Despachados: <strong className="text-[#EAECEF]">{bot.totalDispatched}</strong></span>
                      <span>Grupos: <strong className="text-[#EAECEF]">{bot.authorizedRooms.length}</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: CODE SNIPPETS */}
          {activeTab === 'code' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-[#EAECEF]">API de Webhook & Integração para Sistema Gráfico</h3>
                  <p className="text-xs text-[#848E9C]">
                    Conecte seu sistema de análise técnica, robô de trading ou TradingView diretamente para disparar notificações no app.
                  </p>
                </div>
              </div>

              {/* Endpoint banner */}
              <div className="bg-[#1E2329] border border-[#2B2F36] rounded-xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div>
                  <div className="text-[10px] uppercase font-mono text-[#848E9C]">Endpoint de Produção (POST):</div>
                  <div className="text-xs font-mono font-bold text-[#F3BA2F]">
                    https://privatx.io/api/v1/notifications/send
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono bg-[#0ECB81]/15 text-[#0ECB81] border border-[#0ECB81]/30 px-2 py-0.5 rounded">
                    HTTP REST
                  </span>
                  <span className="text-[10px] font-mono bg-[#2B2F36] text-[#EAECEF] px-2 py-0.5 rounded">
                    Bearer Auth
                  </span>
                </div>
              </div>

              {/* TradingView / Sistema Gráfico Webhook */}
              <div>
                <div className="text-xs font-mono text-[#0ECB81] mb-1.5 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold">
                    <Radio className="w-3.5 h-3.5" /> 1. Formato de Webhook (TradingView / Sistema Gráfico)
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(tradingViewSnippet);
                      setCopiedCode(true);
                      setTimeout(() => setCopiedCode(false), 2000);
                    }}
                    className="px-2.5 py-1 rounded bg-[#2B2F36] hover:bg-[#474D57] text-[11px] font-mono text-[#EAECEF] flex items-center gap-1 transition-colors"
                  >
                    <Copy className="w-3 h-3" /> Copiar JSON
                  </button>
                </div>
                <pre className="p-3.5 rounded-xl bg-[#0B0E11] border border-[#2B2F36] text-[11px] font-mono text-[#EAECEF] overflow-x-auto">
                  {tradingViewSnippet}
                </pre>
              </div>

              {/* Python Block */}
              <div>
                <div className="text-xs font-mono text-[#F3BA2F] mb-1.5 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold">
                    <FileCode className="w-3.5 h-3.5" /> 2. Script Python (Automação de Análise Técnica)
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(pythonSnippet);
                      setCopiedCode(true);
                      setTimeout(() => setCopiedCode(false), 2000);
                    }}
                    className="px-2.5 py-1 rounded bg-[#2B2F36] hover:bg-[#474D57] text-[11px] font-mono text-[#EAECEF] flex items-center gap-1 transition-colors"
                  >
                    <Copy className="w-3 h-3" /> Copiar Python
                  </button>
                </div>
                <pre className="p-3.5 rounded-xl bg-[#0B0E11] border border-[#2B2F36] text-[11px] font-mono text-[#EAECEF] overflow-x-auto">
                  {pythonSnippet}
                </pre>
              </div>

              {/* Node.js Block */}
              <div>
                <div className="text-xs font-mono text-[#3880FF] mb-1.5 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold">
                    <Code2 className="w-3.5 h-3.5 text-[#3880FF]" /> 3. Node.js / TypeScript (Backend Backend-to-Backend)
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(nodeSnippet);
                      setCopiedCode(true);
                      setTimeout(() => setCopiedCode(false), 2000);
                    }}
                    className="px-2.5 py-1 rounded bg-[#2B2F36] hover:bg-[#474D57] text-[11px] font-mono text-[#EAECEF] flex items-center gap-1 transition-colors"
                  >
                    <Copy className="w-3 h-3" /> Copiar Node.js
                  </button>
                </div>
                <pre className="p-3.5 rounded-xl bg-[#0B0E11] border border-[#2B2F36] text-[11px] font-mono text-[#EAECEF] overflow-x-auto">
                  {nodeSnippet}
                </pre>
              </div>

              {/* cURL Block */}
              <div>
                <div className="text-xs font-mono text-[#B7BDC6] mb-1.5 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold">
                    <Terminal className="w-3.5 h-3.5" /> 4. Comando cURL Direto
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(curlSnippet);
                      setCopiedCode(true);
                      setTimeout(() => setCopiedCode(false), 2000);
                    }}
                    className="px-2.5 py-1 rounded bg-[#2B2F36] hover:bg-[#474D57] text-[11px] font-mono text-[#EAECEF] flex items-center gap-1 transition-colors"
                  >
                    <Copy className="w-3 h-3" /> Copiar cURL
                  </button>
                </div>
                <pre className="p-3.5 rounded-xl bg-[#0B0E11] border border-[#2B2F36] text-[11px] font-mono text-[#EAECEF] overflow-x-auto">
                  {curlSnippet}
                </pre>
              </div>
            </div>
          )}

          {/* TAB 4: NEW BOT */}
          {activeTab === 'new_bot' && (
            <form onSubmit={handleCreateBotSubmit} className="max-w-xl mx-auto space-y-4 py-2">
              <div className="text-center space-y-1">
                <div className="w-12 h-12 rounded-2xl bg-[#F3BA2F]/10 border border-[#F3BA2F]/30 text-[#F3BA2F] mx-auto flex items-center justify-center">
                  <Bot className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-base text-[#EAECEF]">Registrar Novo Bot no Synapse</h3>
                <p className="text-xs text-[#848E9C]">
                  Gera automaticamente um Token Matrix seguro para envio de notificações automatizadas.
                </p>
              </div>

              <div>
                <label className="block text-xs font-mono text-[#848E9C] mb-1">Nome do Bot:</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Forex Scalper Bot"
                  value={newBotName}
                  onChange={(e) => setNewBotName(e.target.value)}
                  className="w-full bg-[#1E2329] border border-[#2B2F36] rounded-xl p-3 text-xs text-[#EAECEF] focus:outline-none focus:border-[#F3BA2F]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-[#848E9C] mb-1">Descrição & Estratégia:</label>
                <textarea
                  rows={3}
                  placeholder="Ex: Dispara alertas quando EMA 9 cruza EMA 21 no gráfico de 15m..."
                  value={newBotDesc}
                  onChange={(e) => setNewBotDesc(e.target.value)}
                  className="w-full bg-[#1E2329] border border-[#2B2F36] rounded-xl p-3 text-xs text-[#EAECEF] focus:outline-none focus:border-[#F3BA2F]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-[#F3BA2F] hover:bg-[#E5AC25] text-[#000000] font-bold text-xs uppercase tracking-wider transition-all"
              >
                Criar Bot & Gerar Token de Acesso
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
