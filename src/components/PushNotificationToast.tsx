import React, { useEffect, useState } from 'react';
import { PushNotificationPayload } from '../types';
import { Bell, X, ChevronRight, TrendingUp, TrendingDown, ExternalLink } from 'lucide-react';

interface PushNotificationToastProps {
  notification: PushNotificationPayload | null;
  onDismiss: () => void;
  onSelectRoom: (roomId: string) => void;
  onQuickAction?: (action: string, roomId: string) => void;
}

export const PushNotificationToast: React.FC<PushNotificationToastProps> = ({
  notification,
  onDismiss,
  onSelectRoom,
  onQuickAction,
}) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (notification) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(onDismiss, 300);
      }, 7000);
      return () => clearTimeout(timer);
    }
  }, [notification, onDismiss]);

  if (!notification) return null;

  const isSell = notification.severity === 'CRITICAL' || notification.title.includes('VENDA');
  const isBuy = notification.severity === 'SUCCESS' || notification.title.includes('COMPRA');

  return (
    <div
      className={`fixed top-4 inset-x-4 md:inset-x-auto md:right-6 md:w-96 z-50 transition-all duration-300 transform ${
        visible ? 'translate-y-0 opacity-100 scale-100' : '-translate-y-6 opacity-0 scale-95'
      }`}
    >
      <div className="bg-[#181A20]/95 backdrop-blur-xl border border-[#2B2F36] rounded-2xl p-3.5 shadow-2xl space-y-2.5">
        {/* Android App Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-[#F3BA2F] text-[#000000] flex items-center justify-center font-bold text-[10px]">
              <Bell className="w-3 h-3" />
            </div>
            <span className="text-[11px] font-bold tracking-wider text-[#848E9C] uppercase font-mono">
              MatrixPulse • {notification.roomName}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] text-[#848E9C] font-mono">Agora</span>
            <button
              onClick={() => {
                setVisible(false);
                setTimeout(onDismiss, 300);
              }}
              className="text-[#848E9C] hover:text-[#EAECEF]"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Content clickable */}
        <div
          onClick={() => {
            onSelectRoom(notification.roomId);
            setVisible(false);
            setTimeout(onDismiss, 300);
          }}
          className="cursor-pointer space-y-1 group"
        >
          <div className="font-bold text-xs text-[#EAECEF] flex items-center gap-1.5 group-hover:text-[#F3BA2F] transition-colors">
            <span
              className={`w-2 h-2 rounded-full ${
                isSell ? 'bg-[#F6465D]' : isBuy ? 'bg-[#0ECB81]' : 'bg-[#F3BA2F]'
              }`}
            />
            {notification.title}
          </div>
          <p className="text-xs text-[#B7BDC6] line-clamp-2 leading-relaxed">
            {notification.body}
          </p>
        </div>

        {/* Notification Action Buttons */}
        {notification.buttons && notification.buttons.length > 0 && (
          <div className="flex items-center gap-2 pt-1 border-t border-[#2B2F36]">
            {notification.buttons.slice(0, 2).map((btn) => (
              <button
                key={btn.id}
                onClick={() => {
                  if (onQuickAction) {
                    onQuickAction(btn.action, notification.roomId);
                  }
                  setVisible(false);
                  setTimeout(onDismiss, 300);
                }}
                className={`flex-1 py-1.5 px-2 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 transition-all ${
                  btn.action === 'buy'
                    ? 'bg-[#0ECB81] text-[#000000]'
                    : btn.action === 'sell'
                    ? 'bg-[#F6465D] text-white'
                    : 'bg-[#2B2F36] hover:bg-[#474D57] text-[#EAECEF]'
                }`}
              >
                {btn.action === 'buy' && <TrendingUp className="w-3 h-3" />}
                {btn.action === 'sell' && <TrendingDown className="w-3 h-3" />}
                <span className="truncate">{btn.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
