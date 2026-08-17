import React, { useState, useEffect } from 'react';
import { X, TrendingUp, TrendingDown, Clock, BarChart3, ShieldCheck, Zap } from 'lucide-react';
import confetti from 'canvas-confetti';

interface ChartModalProps {
  isOpen: boolean;
  onClose: () => void;
  pair: string;
  onQuickOrder?: (side: 'BUY' | 'SELL', price: string, amount: string) => void;
}

export const ChartModal: React.FC<ChartModalProps> = ({
  isOpen,
  onClose,
  pair = 'BTCUSDT',
  onQuickOrder,
}) => {
  const [timeframe, setTimeframe] = useState<'1m' | '5m' | '15m' | '1h' | '4h' | '1D'>('15m');
  const [orderSide, setOrderSide] = useState<'BUY' | 'SELL'>('BUY');
  const [leverage, setLeverage] = useState<number>(10);
  const [amount, setAmount] = useState<string>('500');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [orderExecuted, setOrderExecuted] = useState<boolean>(false);

  // Simulated live price tick
  const basePrice = pair.includes('ETH') ? 3890.4 : pair.includes('XAU') ? 2740.5 : 118250.0;
  const [currentPrice, setCurrentPrice] = useState<number>(basePrice);

  useEffect(() => {
    setCurrentPrice(basePrice);
  }, [basePrice, pair]);

  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      const delta = (Math.random() - 0.48) * (basePrice * 0.001);
      setCurrentPrice((prev) => +(prev + delta).toFixed(2));
    }, 1500);
    return () => clearInterval(interval);
  }, [isOpen, basePrice]);

  if (!isOpen) return null;

  const handleOrder = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setOrderExecuted(true);
      confetti({
        particleCount: 50,
        spread: 70,
        colors: orderSide === 'BUY' ? ['#0ECB81', '#F3BA2F', '#FFF'] : ['#F6465D', '#F3BA2F', '#FFF'],
      });
      if (onQuickOrder) {
        onQuickOrder(orderSide, currentPrice.toString(), amount);
      }
      setTimeout(() => {
        setOrderExecuted(false);
        onClose();
      }, 1500);
    }, 600);
  };

  // SVG Candlestick Mock Generation
  const candles = [
    { o: 117600, h: 117950, l: 117400, c: 117820 },
    { o: 117820, h: 118100, l: 117700, c: 118050 },
    { o: 118050, h: 118200, l: 117900, c: 117980 },
    { o: 117980, h: 118400, l: 117950, c: 118350 },
    { o: 118350, h: 118500, l: 118150, c: 118200 },
    { o: 118200, h: 118600, l: 118100, c: 118550 },
    { o: 118550, h: 118700, l: 118300, c: 118400 },
    { o: 118400, h: 118800, l: 118250, c: 118650 },
    { o: 118650, h: 118900, l: 118450, c: 118300 },
    { o: 118300, h: 118500, l: 118000, c: 118250 },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#181A20] border border-[#2B2F36] rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-[#2B2F36] flex items-center justify-between bg-[#1E2329]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#F3BA2F]/10 border border-[#F3BA2F]/30 flex items-center justify-center text-[#F3BA2F] font-bold">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base text-[#EAECEF] font-mono">{pair}</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#0ECB81]/15 text-[#0ECB81] border border-[#0ECB81]/30">
                  PERPETUAL 10x
                </span>
              </div>
              <div className="text-xs text-[#848E9C] flex items-center gap-1 font-mono">
                <span>Spot/Futures Feed</span> • <span className="text-[#0ECB81]">● Live Sync</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right font-mono">
              <div className="text-lg font-bold text-[#EAECEF]">${currentPrice.toLocaleString()}</div>
              <div className="text-[11px] text-[#0ECB81] font-semibold">+3.42% 24h</div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-[#2B2F36] hover:bg-[#474D57] text-[#848E9C] hover:text-[#EAECEF] flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Timeframes & Indicators Bar */}
        <div className="px-4 py-2 bg-[#14161A] border-b border-[#2B2F36] flex items-center justify-between text-xs overflow-x-auto">
          <div className="flex items-center gap-1">
            <span className="text-[#848E9C] mr-2 flex items-center gap-1 text-[11px]">
              <Clock className="w-3 h-3" /> Intervalo:
            </span>
            {(['1m', '5m', '15m', '1h', '4h', '1D'] as const).map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-2.5 py-1 rounded font-mono text-xs transition-colors ${
                  timeframe === tf
                    ? 'bg-[#F3BA2F] text-[#000000] font-bold'
                    : 'text-[#848E9C] hover:text-[#EAECEF] hover:bg-[#1E2329]'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 text-[11px] font-mono text-[#848E9C]">
            <span className="text-[#0ECB81]">EMA(9): 118,120</span>
            <span className="text-[#F3BA2F]">EMA(21): 117,940</span>
            <span className="text-[#F6465D]">RSI: 74.2</span>
          </div>
        </div>

        {/* Interactive Chart Canvas Simulation */}
        <div className="p-4 flex-1 bg-[#0B0E11] min-h-[220px] flex flex-col justify-between relative overflow-hidden">
          {/* Grid lines */}
          <div className="absolute inset-0 grid grid-rows-4 grid-cols-6 pointer-events-none opacity-10">
            {Array.from({ length: 24 }).map((_, i) => (
              <div key={i} className="border-r border-b border-white" />
            ))}
          </div>

          {/* Candle Graph SVG */}
          <div className="relative h-48 w-full flex items-end justify-between px-6 z-10">
            {candles.map((c, i) => {
              const isGreen = c.c >= c.o;
              const minP = 117200;
              const maxP = 119000;
              const range = maxP - minP;

              const bottomWick = ((c.l - minP) / range) * 100;
              const topWick = ((c.h - minP) / range) * 100;
              const bodyBottom = ((Math.min(c.o, c.c) - minP) / range) * 100;
              const bodyHeight = (Math.abs(c.c - c.o) / range) * 100;

              return (
                <div key={i} className="flex-1 flex flex-col items-center justify-end h-full relative group">
                  {/* Wick */}
                  <div
                    className={`w-[1.5px] absolute ${isGreen ? 'bg-[#0ECB81]' : 'bg-[#F6465D]'}`}
                    style={{
                      bottom: `${bottomWick}%`,
                      height: `${topWick - bottomWick}%`,
                    }}
                  />
                  {/* Body */}
                  <div
                    className={`w-5 rounded-xs absolute transition-all duration-300 group-hover:brightness-125 ${
                      isGreen ? 'bg-[#0ECB81]' : 'bg-[#F6465D]'
                    }`}
                    style={{
                      bottom: `${bodyBottom}%`,
                      height: `${Math.max(bodyHeight, 2)}%`,
                    }}
                  />
                </div>
              );
            })}
          </div>

          {/* Signal Tag overlay on chart */}
          <div className="absolute top-4 left-4 z-20 px-3 py-1.5 rounded-lg bg-[#181A20]/90 border border-[#F3BA2F]/40 text-xs font-mono text-[#EAECEF] backdrop-blur-md shadow-lg flex items-center gap-2">
            <Zap className="w-3.5 h-3.5 text-[#F3BA2F]" />
            <span>Alerta Matrix Ativo: EMA Crossover + Bearish RSI</span>
          </div>
        </div>

        {/* Fast Order Execution Deck (Binance Style) */}
        <div className="p-4 bg-[#1E2329] border-t border-[#2B2F36]">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            {/* Side selector */}
            <div className="flex rounded-lg bg-[#14161A] p-1 border border-[#2B2F36]">
              <button
                onClick={() => setOrderSide('BUY')}
                className={`flex-1 py-2 rounded-md font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                  orderSide === 'BUY'
                    ? 'bg-[#0ECB81] text-[#000000] shadow-md'
                    : 'text-[#848E9C] hover:text-[#EAECEF]'
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5" /> Long (Comprar)
              </button>
              <button
                onClick={() => setOrderSide('SELL')}
                className={`flex-1 py-2 rounded-md font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                  orderSide === 'SELL'
                    ? 'bg-[#F6465D] text-white shadow-md'
                    : 'text-[#848E9C] hover:text-[#EAECEF]'
                }`}
              >
                <TrendingDown className="w-3.5 h-3.5" /> Short (Vender)
              </button>
            </div>

            {/* Amount & Leverage input */}
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-[#14161A] rounded-lg border border-[#2B2F36] px-3 py-1.5 flex items-center justify-between">
                <span className="text-[10px] text-[#848E9C] font-mono">VALOR:</span>
                <input
                  type="text"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-20 bg-transparent text-right font-mono font-bold text-sm text-[#EAECEF] focus:outline-none"
                />
                <span className="text-[11px] text-[#848E9C] font-mono ml-1">USDT</span>
              </div>

              {/* Leverage Selector */}
              <div className="bg-[#14161A] rounded-lg border border-[#2B2F36] px-2.5 py-1.5 text-xs font-mono text-[#F3BA2F] font-bold">
                <select
                  value={leverage}
                  onChange={(e) => setLeverage(Number(e.target.value))}
                  aria-label="Selecionar alavancagem"
                  className="bg-transparent text-[#F3BA2F] focus:outline-none cursor-pointer"
                >
                  <option value={5} className="bg-[#181A20] text-[#EAECEF]">5x</option>
                  <option value={10} className="bg-[#181A20] text-[#EAECEF]">10x</option>
                  <option value={20} className="bg-[#181A20] text-[#EAECEF]">20x</option>
                  <option value={50} className="bg-[#181A20] text-[#EAECEF]">50x</option>
                </select>
              </div>
            </div>

            {/* Execute Button */}
            <button
              onClick={handleOrder}
              disabled={isSubmitting || orderExecuted}
              className={`w-full py-2.5 px-4 rounded-lg font-bold text-sm transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-lg cursor-pointer ${
                orderSide === 'BUY'
                  ? 'bg-[#0ECB81] hover:bg-[#0BA66B] text-[#000000]'
                  : 'bg-[#F6465D] hover:bg-[#D43D50] text-white'
              }`}
            >
              {isSubmitting ? (
                <span>Executando no Broker...</span>
              ) : orderExecuted ? (
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4" /> Ordem Enviada!
                </span>
              ) : (
                <span>
                  {orderSide === 'BUY' ? '🟢 Executar Ordem Compra' : '🔴 Executar Ordem Venda'}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
