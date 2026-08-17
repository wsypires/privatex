import React from 'react';
import { MatrixMessage } from '../types';
import { AlertCard } from './AlertCard';
import { AudioPlayer } from './AudioPlayer';
import { VideoPlayer } from './VideoPlayer';
import {
  FileText,
  Download,
  Check,
  CheckCheck,
  Pin,
  Bot,
  Shield,
  SmilePlus,
} from 'lucide-react';

interface MessageItemProps {
  message: MatrixMessage;
  roomId: string;
  onExecuteAction: (action: string, buttonId: string, messageId: string, roomId: string, payload?: any) => Promise<void>;
  onOpenMedia: (url: string, caption?: string) => void;
  onOpenChart: (pair: string) => void;
  onAddReaction?: (messageId: string, emoji: string) => void;
}

export const MessageItem: React.FC<MessageItemProps> = ({
  message,
  roomId,
  onExecuteAction,
  onOpenMedia,
  onOpenChart,
  onAddReaction,
}) => {
  const isBot = message.sender.isBot;
  const isAlert = message.msgtype === 'm.alert' && message.alertData;

  const quickReactions = ['🔥', '🚀', '👀', '👍'];

  return (
    <div
      className={`group flex items-start gap-3 px-3 py-2.5 rounded-xl hover:bg-[#1E2329]/40 transition-colors ${
        message.isPinned ? 'bg-[#1E2329]/60 border-l-2 border-[#F3BA2F]' : ''
      }`}
    >
      {/* Sender Avatar */}
      <img
        src={message.sender.avatarUrl}
        alt={message.sender.displayName}
        className="w-9 h-9 rounded-xl object-cover border border-[#2B2F36] flex-shrink-0 mt-0.5"
      />

      {/* Message Content Body */}
      <div className="flex-1 min-w-0 space-y-1.5">
        {/* Header (Sender Name, Badges, Timestamp) */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-bold text-xs text-[#EAECEF] hover:underline cursor-pointer">
            {message.sender.displayName}
          </span>

          {isBot && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-[#F3BA2F]/15 text-[#F3BA2F] border border-[#F3BA2F]/30">
              <Bot className="w-2.5 h-2.5" /> BOT
            </span>
          )}

          {message.sender.role === 'admin' && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-[#0ECB81]/15 text-[#0ECB81] border border-[#0ECB81]/30">
              <Shield className="w-2.5 h-2.5" /> ADM
            </span>
          )}

          <span className="text-[11px] font-mono text-[#848E9C]">
            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>

          {message.isPinned && (
            <span className="text-[10px] text-[#F3BA2F] font-mono flex items-center gap-1">
              <Pin className="w-2.5 h-2.5" /> Fixado
            </span>
          )}
        </div>

        {/* Reply To Reference Preview */}
        {message.replyTo && (
          <div className="border-l-2 border-[#F3BA2F] bg-[#14161A] px-2.5 py-1 rounded text-xs text-[#848E9C]">
            <span className="font-bold text-[#EAECEF]">{message.replyTo.sender}: </span>
            <span className="truncate">{message.replyTo.body}</span>
          </div>
        )}

        {/* Msgtype Renderers */}
        {/* 1. Alert Card (Spec #8 & #10) */}
        {isAlert && message.alertData && (
          <AlertCard
            alertData={message.alertData}
            buttons={message.buttons}
            messageId={message.id}
            roomId={roomId}
            onExecuteAction={onExecuteAction}
            onOpenChart={onOpenChart}
          />
        )}

        {/* 2. Image (Spec #9) */}
        {message.msgtype === 'm.image' && message.mediaUrl && (
          <div className="space-y-1.5 max-w-md">
            <div
              onClick={() => onOpenMedia(message.mediaUrl!, message.body)}
              className="rounded-xl overflow-hidden border border-[#2B2F36] cursor-pointer hover:opacity-95 transition-all shadow-md group/img relative"
            >
              <img
                src={message.mediaThumbnail || message.mediaUrl}
                alt="Mídia"
                className="w-full max-h-72 object-cover"
              />
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                <span className="px-3 py-1.5 rounded-lg bg-black/75 text-xs text-white backdrop-blur-sm">
                  Ampliar Imagem
                </span>
              </div>
            </div>
            {message.body && <p className="text-xs text-[#EAECEF] leading-relaxed">{message.body}</p>}
          </div>
        )}

        {/* 3. Video (Spec #9) */}
        {message.msgtype === 'm.video' && message.mediaUrl && (
          <VideoPlayer
            mediaUrl={message.mediaUrl}
            thumbnail={message.mediaThumbnail}
            caption={message.body}
            duration={message.duration}
          />
        )}

        {/* 4. Audio (Spec #9) */}
        {message.msgtype === 'm.audio' && message.mediaUrl && (
          <AudioPlayer
            mediaUrl={message.mediaUrl}
            duration={message.duration}
            title={message.body}
          />
        )}

        {/* 5. Document / File (Spec #9) */}
        {message.msgtype === 'm.file' && (
          <div className="bg-[#181A20] border border-[#2B2F36] rounded-xl p-3 max-w-sm flex items-center justify-between shadow-md">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-lg bg-[#F3BA2F]/15 text-[#F3BA2F] flex items-center justify-center flex-shrink-0 font-bold">
                <FileText className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="font-bold text-xs text-[#EAECEF] truncate">
                  {message.fileName || 'documento_matrix.pdf'}
                </div>
                <div className="text-[11px] font-mono text-[#848E9C]">
                  {message.fileSize || '2.4 MB'} • {message.mimeType || 'Documento'}
                </div>
              </div>
            </div>

            <button
              onClick={() => alert(`Download iniciado: ${message.fileName || 'arquivo'}`)}
              className="p-2 rounded-lg bg-[#2B2F36] hover:bg-[#474D57] text-[#EAECEF] transition-colors flex-shrink-0"
              title="Baixar Arquivo"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* 6. Standard Text / Notice */}
        {message.msgtype !== 'm.alert' && message.msgtype !== 'm.image' && message.msgtype !== 'm.video' && message.msgtype !== 'm.audio' && message.msgtype !== 'm.file' && (
          <div className="text-xs text-[#EAECEF] leading-relaxed whitespace-pre-wrap">
            {message.body}
          </div>
        )}

        {/* 7. Action Buttons (quando enviados em mensagens de texto ou imagem) */}
        {!isAlert && message.buttons && message.buttons.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1.5">
            {message.buttons.map((btn) => (
              <button
                key={btn.id}
                onClick={() => {
                  if (btn.action === 'open_chart') {
                    onOpenChart('BTC/USDT');
                  } else if (btn.url) {
                    window.open(btn.url, '_blank');
                  } else {
                    onExecuteAction(btn.action, btn.id, message.id, roomId, btn.payload);
                  }
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer ${
                  btn.style === 'binance-buy'
                    ? 'bg-[#0ECB81] hover:bg-[#0BA86B] text-white shadow-sm'
                    : btn.style === 'binance-sell'
                    ? 'bg-[#F6465D] hover:bg-[#D9384E] text-white shadow-sm'
                    : 'bg-[#2B2F36] hover:bg-[#474D57] text-[#EAECEF] border border-[#474D57]/60'
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>
        )}

        {/* Reactions & Actions Row */}
        <div className="flex items-center gap-1.5 pt-1">
          {message.reactions &&
            Object.entries(message.reactions).map(([emoji, count]) => (
              <button
                key={emoji}
                onClick={() => onAddReaction && onAddReaction(message.id, emoji)}
                className="px-2 py-0.5 rounded-full bg-[#181A20] hover:bg-[#2B2F36] border border-[#2B2F36] text-[11px] font-mono text-[#EAECEF] flex items-center gap-1 transition-all active:scale-95 cursor-pointer"
              >
                <span>{emoji}</span>
                <span className="text-[#848E9C] text-[10px]">{count}</span>
              </button>
            ))}

          {/* Quick Reaction trigger */}
          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 ml-2">
            {quickReactions.map((emoji) => (
              <button
                key={emoji}
                onClick={() => onAddReaction && onAddReaction(message.id, emoji)}
                className="hover:scale-125 transition-transform text-xs p-0.5"
                title={`Reagir com ${emoji}`}
              >
                {emoji}
              </button>
            ))}
          </div>

          <div className="flex-1" />

          {/* Delivery Checkmarks */}
          <div className="text-[#848E9C] flex items-center">
            {message.deliveryStatus === 'read' ? (
              <CheckCheck className="w-3.5 h-3.5 text-[#0ECB81]" />
            ) : (
              <Check className="w-3.5 h-3.5" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
