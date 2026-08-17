import React, { useState } from 'react';
import { MatrixRoom, UserProfile } from '../types';
import {
  Search,
  Lock,
  Bell,
  BellOff,
  Plus,
  Link2,
  Bot,
  Shield,
  Activity,
  ChevronRight,
  TrendingUp,
  Server,
  Zap,
} from 'lucide-react';

interface RoomListProps {
  rooms: MatrixRoom[];
  selectedRoomId: string;
  onSelectRoom: (roomId: string) => void;
  currentUser: UserProfile;
  onOpenNewRoomModal: () => void;
  onOpenInviteModal: () => void;
  onOpenBotModal: () => void;
  onOpenActionLogsModal: () => void;
}

export const RoomList: React.FC<RoomListProps> = ({
  rooms,
  selectedRoomId,
  onSelectRoom,
  currentUser,
  onOpenNewRoomModal,
  onOpenInviteModal,
  onOpenBotModal,
  onOpenActionLogsModal,
}) => {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const filteredRooms = rooms.filter((room) => {
    const matchesSearch =
      room.name.toLowerCase().includes(search.toLowerCase()) ||
      room.topic.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || room.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="w-full md:w-80 lg:w-96 flex flex-col bg-[#14161A] border-r border-[#2B2F36] h-full flex-shrink-0 select-none">
      {/* Top App Title & Quick Tools */}
      <div className="p-3.5 border-b border-[#2B2F36] bg-[#181A20] space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#F3BA2F] text-[#000000] flex items-center justify-center font-black text-sm shadow-md shadow-[#F3BA2F]/20">
              <Zap className="w-5 h-5 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-sm text-[#EAECEF] tracking-tight">Privat<span className="text-[#F3BA2F]">X</span></span>
                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-[#0ECB81]/15 text-[#0ECB81] font-bold border border-[#0ECB81]/30">
                  SYNAPSE
                </span>
              </div>
              <p className="text-[10px] text-[#848E9C] font-mono">Mensageria & Alertas Privados</p>
            </div>
          </div>

          {/* Quick Hub Buttons */}
          <div className="flex items-center gap-1">
            <button
              onClick={onOpenBotModal}
              className="p-1.5 rounded-lg bg-[#2B2F36] hover:bg-[#474D57] text-[#F3BA2F] transition-colors"
              title="Central de Bots & API"
            >
              <Bot className="w-4 h-4" />
            </button>
            <button
              onClick={onOpenActionLogsModal}
              className="p-1.5 rounded-lg bg-[#2B2F36] hover:bg-[#474D57] text-[#0ECB81] transition-colors"
              title="Logs de Ações de Botões"
            >
              <Activity className="w-4 h-4" />
            </button>
            <button
              onClick={onOpenNewRoomModal}
              className="p-1.5 rounded-lg bg-[#F3BA2F] hover:bg-[#E5AC25] text-[#000000] transition-colors font-bold"
              title="Criar Grupo Privado"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-[#848E9C]" />
          <input
            type="text"
            placeholder="Buscar grupos ou sinais..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#0B0E11] border border-[#2B2F36] rounded-xl pl-9 pr-3 py-2 text-xs text-[#EAECEF] placeholder-[#848E9C] focus:outline-none focus:border-[#F3BA2F] font-mono"
          />
        </div>

        {/* Categories Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 no-scrollbar text-xs font-semibold">
          {[
            { id: 'all', label: 'Todos' },
            { id: 'trading', label: '📈 Trading' },
            { id: 'devops', label: '⚡ DevOps' },
            { id: 'forex', label: '🏆 Forex' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setCategoryFilter(tab.id)}
              className={`px-2.5 py-1 rounded-lg text-[11px] whitespace-nowrap transition-all ${
                categoryFilter === tab.id
                  ? 'bg-[#F3BA2F] text-[#000000] font-bold'
                  : 'bg-[#1E2329] text-[#848E9C] hover:text-[#EAECEF] hover:bg-[#2B2F36]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Room List Content */}
      <div className="flex-1 overflow-y-auto divide-y divide-[#1E2329]">
        {filteredRooms.length === 0 ? (
          <div className="text-center py-10 px-4 text-xs text-[#848E9C]">
            Nenhum grupo encontrado nesta categoria.
          </div>
        ) : (
          filteredRooms.map((room) => {
            const isSelected = room.id === selectedRoomId;
            const lastMsg = room.lastMessage;
            const isAlert = lastMsg?.msgtype === 'm.alert';

            return (
              <div
                key={room.id}
                onClick={() => onSelectRoom(room.id)}
                className={`p-3 flex items-start gap-3 cursor-pointer transition-colors relative group ${
                  isSelected ? 'bg-[#2B2F36] border-l-2 border-[#F3BA2F]' : 'hover:bg-[#181A20]'
                }`}
              >
                {/* Room Avatar */}
                <div className="relative flex-shrink-0">
                  <img
                    src={room.avatar}
                    alt={room.name}
                    className="w-12 h-12 rounded-xl object-cover border border-[#2B2F36]"
                  />
                  {room.isPrivate && (
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[#181A20] border border-[#2B2F36] flex items-center justify-center text-[#F3BA2F]">
                      <Lock className="w-2.5 h-2.5" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <h4 className="font-bold text-xs text-[#EAECEF] truncate group-hover:text-[#F3BA2F] transition-colors">
                      {room.name}
                    </h4>
                    {lastMsg && (
                      <span className="text-[10px] font-mono text-[#848E9C] flex-shrink-0 ml-1">
                        {new Date(lastMsg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                  </div>

                  {/* Last Message Snippet */}
                  <div className="flex items-center justify-between text-xs text-[#848E9C] mt-0.5">
                    <p className="truncate text-[11px] pr-1 leading-snug">
                      {lastMsg ? (
                        <>
                          {lastMsg.sender.isBot && (
                            <span className="text-[#F3BA2F] font-bold mr-1">[BOT]</span>
                          )}
                          {isAlert ? (
                            <span className="text-[#0ECB81] font-semibold">
                              🚨 {lastMsg.alertData?.pair || 'Alerta'}: {lastMsg.alertData?.actionType || 'Sinal'}
                            </span>
                          ) : (
                            lastMsg.body || 'Mídia anexa'
                          )}
                        </>
                      ) : (
                        'Nenhuma mensagem ainda'
                      )}
                    </p>

                    {/* Unread badge & Mute indicator */}
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {room.isMuted && <BellOff className="w-3 h-3 text-[#848E9C]" />}
                      {room.unreadCount > 0 && (
                        <span className="px-1.5 py-0.2 rounded-full bg-[#F3BA2F] text-[#000000] font-bold text-[10px] font-mono shadow-sm">
                          {room.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Bottom User Bar (Matrix Identity, No Phone Required) */}
      <div className="p-3 bg-[#181A20] border-t border-[#2B2F36] flex items-center justify-between">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="relative flex-shrink-0">
            <img
              src={currentUser.avatar}
              alt={currentUser.displayName}
              className="w-9 h-9 rounded-xl object-cover border border-[#2B2F36]"
            />
            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#0ECB81] border-2 border-[#181A20]" />
          </div>
          <div className="min-w-0">
            <div className="font-bold text-xs text-[#EAECEF] truncate">{currentUser.displayName}</div>
            <div className="text-[10px] font-mono text-[#848E9C] truncate">{currentUser.userId}</div>
          </div>
        </div>

        <button
          onClick={onOpenInviteModal}
          className="p-2 rounded-lg bg-[#2B2F36] hover:bg-[#474D57] text-[#EAECEF] transition-colors flex items-center gap-1 text-xs font-semibold"
          title="Entrar ou gerar convite"
        >
          <Link2 className="w-3.5 h-3.5 text-[#F3BA2F]" />
        </button>
      </div>
    </div>
  );
};
