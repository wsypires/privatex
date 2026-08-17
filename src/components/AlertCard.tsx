import React, { useState } from 'react';
import { AlertData, ActionButton } from '../types';
import {
  TrendingUp,
  TrendingDown,
  Activity,
  BarChart2,
  ShieldAlert,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  Zap,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface AlertCardProps {
  alertData: AlertData;
  buttons?: ActionButton[];
  messageId: string;
  roomId: string;
  onExecuteAction: (action: string, buttonId: string, messageId: string, roomId: string, payload?: any) => Promise<void>;
  onOpenChart?: (pair: string) => void;
}

export const AlertCard: React.FC<AlertCardProps> = ({
  alertData,
  buttons = [],
  messageId,
  roomId,
  onExecuteAction,
  onOpenChart,
}) => {
  const [loadingBtnId, setLoadingBtnId] = useState<string | null>(null);
  const [executedBtns, setExecutedBtns] = useState<Record<string, boolean>>({});

  const isSell = alertData.actionType === 'SELL' || alertData.severity === 'CRITICAL';
  const isBuy = alertData.actionType === 'BUY' || alertData.severity === 'SUCCESS';

  const handleButtonClick = async (btn: ActionButton) => {
    if (btn.action === 'open_chart') {
      if (onOpenChart) {
        onOpenChart(alertData.pair || 'BTCUSDT');
      }
      return;
    }

    if (btn.action === 'open_url' && btn.url) {
      window.open(btn.url, '_blank');
      return;
    }

    try {
      setLoadingBtnId(btn.id);
      await onExecuteAction(btn.action, btn.id, messageId, roomId, {
        ...btn.payload,
        pair: alertData.pair,
        price: alertData.price,
      });

      if (btn.action === 'buy' || btn.action === 'sell') {
        confetti({
          particleCount: 40,
          spread: 60,
          origin: { y: 0.8 },
          colors: isBuy ? ['#0ECB81', '#F3BA2F', '#FFFFFF'] : ['#F6465D', '#F3BA2F', '#FFFFFF'],
        });
      }

      setExecutedBtns((prev) => ({ ...prev, [btn.id]: true }));
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingBtnId(null);
    }
  };

  return (
    <div
      className={`rounded-xl border overflow-hidden transition-all shadow-xl max-w-lg w-full ${
        isSell
          ? 'bg-gradient-to-b from-[#2B1B22]/90 via-[#1E2329]/95 to-[#181A20] border-[#F6465D]/40'
          : isBuy
          ? 'bg-gradient-to-b from-[#182B24]/90 via-[#1E2329]/95 to-[#181A20] border-[#0ECB81]/40'
          : 'bg-gradient-to-b from-[#25251C]/90 via-[#1E2329]/95 to-[#181A20] border-[#F3BA2F]/30'
      }`}
    >
      {/* Top Header Banner */}
      <div
        className={`px-4 py-2.5 flex items-center justify-between border-b ${
          isSell
            ? 'bg-[#F6465D]/15 border-[#F6465D]/30 text-[#F6465D]'
            : isBuy
            ? 'bg-[#0ECB81]/15 border-[#0ECB81]/30 text-[#0ECB81]'
            : 'bg-[#F3BA2F]/15 border-[#F3BA2F]/30 text-[#F3BA2F]'
        }`}
      >
        <div className="flex items-center gap-2 font-bold tracking-wide text-xs">
          <span className="flex h-2 w-2 relative">
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                isSell ? 'bg-[#F6465D]' : isBuy ? 'bg-[#0ECB81]' : 'bg-[#F3BA2F]'
              }`}
            ></span>
            <span
              className={`relative inline-flex rounded-full h-2 w-2 ${
                isSell ? 'bg-[#F6465D]' : isBuy ? 'bg-[#0ECB81]' : 'bg-[#F3BA2F]'
              }`}
            ></span>
          </span>
          <span className="font-mono text-sm">
            🚨 {alertData.pair || 'BTCUSDT'} ALERTA
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/40 border border-white/10 text-[#EAECEF]">
            {alertData.tag || 'FUTURES'}
          </span>
        </div>
      </div>

      {/* Main Signal Body */}
      <div className="p-4 space-y-3">
        {/* Action Type & Main Price */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-bold font-mono uppercase tracking-wider ${
                  isSell
                    ? 'bg-[#F6465D] text-white'
                    : isBuy
                    ? 'bg-[#0ECB81] text-[#000000]'
                    : 'bg-[#F3BA2F] text-[#000000]'
                }`}
              >
                {isSell ? <TrendingDown className="w-3.5 h-3.5" /> : <TrendingUp className="w-3.5 h-3.5" />}
                {alertData.actionType === 'SELL' ? '🔴 SINAL DE VENDA (SHORT)' : alertData.actionType === 'BUY' ? '🟢 SINAL DE COMPRA (LONG)' : '⚡ ALERTA DO SISTEMA'}
              </span>
            </div>
            <div className="text-2xl font-bold font-mono text-[#EAECEF] mt-1.5 tracking-tight flex items-baseline gap-2">
              {alertData.price || '$118,250.00'}
              {alertData.change24h && (
                <span className={`text-xs font-medium ${alertData.change24h.startsWith('+') ? 'text-[#0ECB81]' : 'text-[#F6465D]'}`}>
                  {alertData.change24h}
                </span>
              )}
            </div>
          </div>

          <div className="text-right">
            <div className="text-[10px] uppercase text-[#848E9C] font-mono">Status</div>
            <div className="inline-flex items-center gap-1 text-xs font-semibold text-[#0ECB81]">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {alertData.status || 'CONFIRMADO'}
            </div>
          </div>
        </div>

        {/* Strategy Description */}
        {alertData.strategy && (
          <div className="text-xs text-[#B7BDC6] bg-[#1E2329] p-2.5 rounded-lg border border-[#2B2F36] flex items-center justify-between">
            <span className="text-[#848E9C]">Estratégia:</span>
            <span className="font-mono text-[#EAECEF] font-medium">{alertData.strategy}</span>
          </div>
        )}

        {/* Target Levels Grid (Entry, Stop, Target) */}
        {(alertData.entry || alertData.stopLoss || alertData.takeProfit) && (
          <div className="grid grid-cols-3 gap-2 pt-1 font-mono text-center">
            {alertData.entry && (
              <div className="p-2 rounded-lg bg-[#1E2329]/90 border border-[#2B2F36]">
                <div className="text-[10px] text-[#848E9C]">ENTRADA</div>
                <div className="text-xs font-bold text-[#EAECEF] mt-0.5">{alertData.entry}</div>
              </div>
            )}
            {alertData.stopLoss && (
              <div className="p-2 rounded-lg bg-[#2B1B22]/80 border border-[#F6465D]/30">
                <div className="text-[10px] text-[#F6465D]">STOP LOSS</div>
                <div className="text-xs font-bold text-[#F6465D] mt-0.5">{alertData.stopLoss}</div>
              </div>
            )}
            {alertData.takeProfit && (
              <div className="p-2 rounded-lg bg-[#182B24]/80 border border-[#0ECB81]/30">
                <div className="text-[10px] text-[#0ECB81]">ALVO (TP)</div>
                <div className="text-xs font-bold text-[#0ECB81] mt-0.5">{alertData.takeProfit}</div>
              </div>
            )}
          </div>
        )}

        {/* Indicators checklist */}
        {alertData.indicators && alertData.indicators.length > 0 && (
          <div className="space-y-1.5 pt-1">
            <div className="text-[10px] uppercase tracking-wider text-[#848E9C] font-mono flex items-center gap-1">
              <Activity className="w-3 h-3 text-[#F3BA2F]" />
              Confluência Técnica (Matrix Bot Engine)
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {alertData.indicators.map((ind, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between px-2 py-1.5 rounded bg-[#181A20] border border-[#2B2F36] text-xs"
                >
                  <span className="text-[#848E9C] text-[11px] truncate">{ind.name}</span>
                  <span
                    className={`font-mono text-[11px] font-semibold ${
                      ind.signal === 'bullish'
                        ? 'text-[#0ECB81]'
                        : ind.signal === 'bearish'
                        ? 'text-[#F6465D]'
                        : 'text-[#EAECEF]'
                    }`}
                  >
                    {ind.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons Section (Spec #10 & #12) */}
        {buttons && buttons.length > 0 && (
          <div className="pt-2 grid grid-cols-2 sm:grid-cols-2 gap-2">
            {buttons.map((btn) => {
              const isLoading = loadingBtnId === btn.id;
              const isExecuted = executedBtns[btn.id];

              let buttonStyle = 'bg-[#2B2F36] hover:bg-[#474D57] text-[#FFFFFF] border border-[#474D57] font-bold';
              if (btn.style === 'binance-buy' || btn.action === 'buy') {
                buttonStyle = 'bg-[#0ECB81] hover:bg-[#0BA66B] text-[#000000] font-black shadow-md shadow-[#0ECB81]/20';
              } else if (btn.style === 'binance-sell' || btn.action === 'sell') {
                buttonStyle = 'bg-[#F6465D] hover:bg-[#D43D50] text-white font-black shadow-md shadow-[#F6465D]/20';
              } else if (btn.action === 'open_chart') {
                buttonStyle = 'bg-[#2B2F36] hover:bg-[#474D57] text-[#FFFFFF] font-bold border border-[#474D57]';
              } else if (btn.style === 'primary') {
                buttonStyle = 'bg-[#F3BA2F] hover:bg-[#E5AC25] text-[#000000] font-black';
              }

              return (
                <button
                  key={btn.id}
                  id={btn.id}
                  onClick={() => handleButtonClick(btn)}
                  disabled={isLoading}
                  className={`px-3 py-2.5 rounded-lg text-xs transition-all active:scale-[0.98] flex items-center justify-center gap-1.5 cursor-pointer select-none ${buttonStyle}`}
                >
                  {isLoading ? (
                    <Zap className="w-3.5 h-3.5 animate-spin" />
                  ) : isExecuted ? (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  ) : btn.action === 'open_chart' ? (
                    <BarChart2 className="w-3.5 h-3.5" />
                  ) : btn.action === 'buy' ? (
                    <TrendingUp className="w-3.5 h-3.5" />
                  ) : btn.action === 'sell' ? (
                    <TrendingDown className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5" />
                  )}
                  <span className="truncate">
                    {isExecuted ? 'Enviado!' : btn.label}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
