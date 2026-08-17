import React from 'react';
import { MatrixRoom } from '../types';
import {
  Lock,
  Users,
  Link2,
  Bell,
  BellOff,
  Bot,
  ShieldCheck,
  Smartphone,
  Monitor,
  MoreVertical,
  Activity,
  ArrowLeft,
} from 'lucide-react';

interface ChatHeaderProps {
  room: MatrixRoom;
  onOpenInviteModal: () => void;
  onOpenBotModal: () => void;
  onOpenActionLogsModal: () => void;
  isMobileFrame: boolean;
  onToggleFrame: () => void;
  onBack?: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  room,
  onOpenInviteModal,
  onOpenBotModal,
  onOpenActionLogsModal,
  isMobileFrame,
  onToggleFrame,
  onBack,
}) => {
  return (
    <div className="p-3 sm:p-3.5 border-b border-[#2B2F36] bg-[#181A20] flex items-center justify-between flex-shrink-0 select-none shadow-sm gap-2">
      {/* Room Details & Back Button */}
      <div className="flex items-center gap-2.5 min-w-0">
        {onBack && (
          <button
            onClick={onBack}
            className="md:hidden p-2 -ml-1 rounded-xl bg-[#2B2F36] hover:bg-[#474D57] text-[#EAECEF] transition-colors flex-shrink-0"
            title="Voltar para a lista de canais"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
        )}

        <img
          src={room.avatar}
          alt={room.name}
          className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl object-cover border border-[#2B2F36] flex-shrink-0"
        />
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <h3 className="font-bold text-xs sm:text-sm text-[#EAECEF] truncate">{room.name}</h3>
            {room.isPrivate && <Lock className="w-3 h-3 text-[#F3BA2F] flex-shrink-0" />}
            {room.encryption === 'm.megolm.v1.aes-sha2' && (
              <span className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[9px] font-mono bg-[#0ECB81]/15 text-[#0ECB81] border border-[#0ECB81]/30">
                <ShieldCheck className="w-2.5 h-2.5" /> E2EE
              </span>
            )}
          </div>
          <div className="text-[11px] sm:text-xs text-[#848E9C] truncate flex items-center gap-1.5 sm:gap-2">
            <span>{room.memberCount} membros</span>
            <span>•</span>
            <span className="truncate">{room.topic}</span>
          </div>
        </div>
      </div>

      {/* Top Controls */}
      <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
        <button
          onClick={onOpenInviteModal}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#2B2F36] hover:bg-[#474D57] text-xs font-semibold text-[#EAECEF] transition-colors cursor-pointer"
          title="Compartilhar Link de Convite"
        >
          <Link2 className="w-3.5 h-3.5 text-[#F3BA2F]" />
          <span>Convite</span>
        </button>

        <button
          onClick={onOpenBotModal}
          className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-[#F3BA2F] hover:bg-[#E5AC25] text-xs font-bold text-[#000000] transition-colors shadow-md shadow-[#F3BA2F]/10 cursor-pointer"
          title="Despachar Alerta via Bot"
        >
          <Bot className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Disparar Alerta API</span>
          <span className="md:hidden text-[10px]">API Bot</span>
        </button>

        <button
          onClick={onToggleFrame}
          className="p-1.5 sm:p-2 rounded-lg bg-[#2B2F36] hover:bg-[#474D57] text-[#848E9C] hover:text-[#EAECEF] transition-colors cursor-pointer flex items-center gap-1"
          title={isMobileFrame ? 'Alternar para Modo Web App Expandido' : 'Alternar para Modo Smartphone Android'}
        >
          {isMobileFrame ? (
            <>
              <Monitor className="w-4 h-4 text-[#F3BA2F]" />
              <span className="hidden xl:inline text-[10px] font-mono text-[#F3BA2F] font-bold">App Web</span>
            </>
          ) : (
            <>
              <Smartphone className="w-4 h-4 text-[#0ECB81]" />
              <span className="hidden xl:inline text-[10px] font-mono text-[#0ECB81] font-bold">Mobile</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
