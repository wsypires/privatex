import React, { useState, useEffect, useRef } from 'react';
import {
  MatrixRoom,
  MatrixMessage,
  BotConfig,
  ActionExecutionLog,
  UserProfile,
  PushNotificationPayload,
} from './types';
import { AndroidFrame } from './components/AndroidFrame';
import { RoomList } from './components/RoomList';
import { ChatHeader } from './components/ChatHeader';
import { MessageItem } from './components/MessageItem';
import { BotDispatcherModal } from './components/BotDispatcherModal';
import { ChartModal } from './components/ChartModal';
import { InviteModal } from './components/InviteModal';
import { ActionLogsModal } from './components/ActionLogsModal';
import { MediaViewerModal } from './components/MediaViewerModal';
import { NewRoomModal } from './components/NewRoomModal';
import { PushNotificationToast } from './components/PushNotificationToast';
import {
  Send,
  Paperclip,
  Smile,
  Mic,
  Image,
  Video,
  FileText,
  Pin,
  ChevronDown,
  Sparkles,
  Zap,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function App() {
  const [rooms, setRooms] = useState<MatrixRoom[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState<string>('!btc_whale_signals:privatx.io');
  const [messages, setMessages] = useState<MatrixMessage[]>([]);
  const [bots, setBots] = useState<BotConfig[]>([]);
  const [actionLogs, setActionLogs] = useState<ActionExecutionLog[]>([]);
  const [currentUser, setCurrentUser] = useState<UserProfile>({
    userId: '@trader.alex:privatx.io',
    displayName: 'Alexandre Trader',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    role: 'admin',
    joinedRooms: [],
    notificationSettings: {
      sound: true,
      vibration: true,
      criticalAlerts: true,
      inAppBanner: true,
    },
  });

  // UI States
  const [inputText, setInputText] = useState('');
  const [isMobileFrame, setIsMobileFrame] = useState(false);
  const [mobileShowChat, setMobileShowChat] = useState(false);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [showEmojiQuick, setShowEmojiQuick] = useState(false);
  const [activePushNotification, setActivePushNotification] = useState<PushNotificationPayload | null>(null);

  // Modals
  const [isBotModalOpen, setIsBotModalOpen] = useState(false);
  const [isChartModalOpen, setIsChartModalOpen] = useState(false);
  const [chartPair, setChartPair] = useState('BTCUSDT');
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isActionLogsModalOpen, setIsActionLogsModalOpen] = useState(false);
  const [isNewRoomModalOpen, setIsNewRoomModalOpen] = useState(false);
  const [mediaViewerState, setMediaViewerState] = useState<{
    isOpen: boolean;
    url: string;
    caption?: string;
  }>({
    isOpen: false,
    url: '',
    caption: '',
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initial Fetch Data
  const fetchData = async () => {
    try {
      const [roomsRes, botsRes, userRes, logsRes] = await Promise.all([
        fetch('/api/v1/rooms').then((r) => r.json()),
        fetch('/api/v1/bots').then((r) => r.json()),
        fetch('/api/v1/user/me').then((r) => r.json()),
        fetch('/api/v1/actions/logs').then((r) => r.json()),
      ]);

      if (Array.isArray(roomsRes)) setRooms(roomsRes);
      if (Array.isArray(botsRes)) setBots(botsRes);
      if (userRes && userRes.userId) setCurrentUser(userRes);
      if (Array.isArray(logsRes)) setActionLogs(logsRes);
    } catch (err) {
      console.error('Failed to load initial data:', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Fetch Messages for Selected Room
  const fetchRoomMessages = async (roomId: string) => {
    try {
      const res = await fetch(`/api/v1/rooms/${encodeURIComponent(roomId)}/messages`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setMessages(data);
      }
    } catch (err) {
      console.error('Failed to load messages:', err);
    }
  };

  useEffect(() => {
    if (selectedRoomId) {
      fetchRoomMessages(selectedRoomId);
    }
  }, [selectedRoomId]);

  // Scroll to bottom on messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Execute Interactive Action Button (Spec #10 & #12)
  const handleExecuteAction = async (
    action: string,
    buttonId: string,
    messageId: string,
    roomId: string,
    payload?: any
  ) => {
    try {
      const res = await fetch('/api/v1/actions/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          buttonId,
          messageId,
          roomId,
          payload,
        }),
      });
      const data = await res.json();
      if (data.success) {
        if (data.log) {
          setActionLogs((prev) => [data.log, ...prev]);
        }
        if (data.downstreamMessage) {
          setMessages((prev) => [...prev, data.downstreamMessage]);
        }
      }
    } catch (err) {
      console.error('Action execution failed:', err);
    }
  };

  // Send Standard Message
  const handleSendMessage = async (customPayload?: Partial<MatrixMessage>) => {
    if (!inputText.trim() && !customPayload) return;

    const payload = {
      roomId: selectedRoomId,
      body: customPayload?.body || inputText.trim(),
      msgtype: customPayload?.msgtype || 'm.text',
      mediaUrl: customPayload?.mediaUrl,
      fileName: customPayload?.fileName,
      fileSize: customPayload?.fileSize,
      mimeType: customPayload?.mimeType,
      duration: customPayload?.duration,
      buttons: customPayload?.buttons,
    };

    try {
      const res = await fetch(`/api/v1/rooms/${encodeURIComponent(selectedRoomId)}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const newMsg = await res.json();
      setMessages((prev) => [...prev, newMsg]);
      setInputText('');
      setShowAttachmentMenu(false);
      setShowEmojiQuick(false);
      fetchData(); // refresh last messages in room list
    } catch (err) {
      console.error('Failed to post message:', err);
    }
  };

  // Send Bot Notification API (Spec #11)
  const handleSendBotNotification = async (payload: any) => {
    const res = await fetch('/api/v1/notifications/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${bots[0]?.token || 'TOKEN'}`,
      },
      body: JSON.stringify(payload),
    });
    const data = await res.json();

    if (data.success) {
      // Trigger Push Notification Toast
      const targetRoom = rooms.find((r) => r.id === data.room_id) || rooms[0];
      setActivePushNotification({
        id: data.event_id,
        roomId: data.room_id,
        roomName: targetRoom.name,
        title: payload.title || 'Novo Alerta de Trading',
        body: payload.message || 'Sinal confirmado pelo algoritmo Matrix.',
        severity: payload.alertData?.severity || 'CRITICAL',
        timestamp: Date.now(),
        buttons: payload.buttons,
      });

      // Refresh current messages if we are in this room
      if (selectedRoomId === data.room_id) {
        fetchRoomMessages(selectedRoomId);
      }
      fetchData();
    }
    return data;
  };

  // Create Bot (Spec #17)
  const handleCreateBot = async (botData: any) => {
    const res = await fetch('/api/v1/bots', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(botData),
    });
    const newBot = await res.json();
    setBots((prev) => [...prev, newBot]);
    return newBot;
  };

  // Regenerate Bot Token (Spec #17)
  const handleRegenerateToken = async (botId: string) => {
    const res = await fetch(`/api/v1/bots/${encodeURIComponent(botId)}/regenerate-token`, {
      method: 'POST',
    });
    const data = await res.json();
    setBots((prev) =>
      prev.map((b) => (b.id === botId ? { ...b, token: data.token } : b))
    );
    return data.token;
  };

  // Join Room by Invite Code (Spec #6)
  const handleJoinByCode = async (code: string) => {
    const res = await fetch('/api/v1/invites/join', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    });
    const data = await res.json();
    if (data.success && data.room) {
      setRooms((prev) => {
        const exists = prev.find((r) => r.id === data.room.id);
        if (!exists) return [data.room, ...prev];
        return prev;
      });
      setSelectedRoomId(data.room.id);
    }
    return data;
  };

  // Create New Room
  const handleCreateRoom = async (roomData: any) => {
    const res = await fetch('/api/v1/rooms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(roomData),
    });
    const newRoom = await res.json();
    setRooms((prev) => [newRoom, ...prev]);
    setSelectedRoomId(newRoom.id);
    return newRoom;
  };

  const currentRoom = rooms.find((r) => r.id === selectedRoomId) || rooms[0] || null;

  return (
    <AndroidFrame isMobileFrame={isMobileFrame}>
      {/* Android Toast Push Notification */}
      <PushNotificationToast
        notification={activePushNotification}
        onDismiss={() => setActivePushNotification(null)}
        onSelectRoom={(roomId) => setSelectedRoomId(roomId)}
        onQuickAction={(action, roomId) => {
          if (action === 'buy' || action === 'sell') {
            confetti({ particleCount: 35, spread: 60 });
          }
          setSelectedRoomId(roomId);
        }}
      />

      {/* Main Layout (Desktop Split vs Mobile View) */}
      <div className="flex-1 flex w-full h-full bg-[#0B0E11] text-[#EAECEF] overflow-hidden">
        {/* Left Sidebar / Room Navigation */}
        <div className={`w-full md:w-80 lg:w-96 flex-shrink-0 h-full ${mobileShowChat ? 'hidden md:flex' : 'flex'}`}>
          <RoomList
            rooms={rooms}
            selectedRoomId={selectedRoomId}
            onSelectRoom={(id) => {
              setSelectedRoomId(id);
              setMobileShowChat(true);
            }}
            currentUser={currentUser}
            onOpenNewRoomModal={() => setIsNewRoomModalOpen(true)}
            onOpenInviteModal={() => setIsInviteModalOpen(true)}
            onOpenBotModal={() => setIsBotModalOpen(true)}
            onOpenActionLogsModal={() => setIsActionLogsModalOpen(true)}
          />
        </div>

        {/* Right Active Room Conversation Area */}
        <div className={`flex-1 flex flex-col h-full bg-[#0B0E11] relative overflow-hidden ${!mobileShowChat ? 'hidden md:flex' : 'flex'}`}>
          {currentRoom ? (
            <>
              {/* Room Top Header */}
              <ChatHeader
                room={currentRoom}
                onOpenInviteModal={() => setIsInviteModalOpen(true)}
                onOpenBotModal={() => setIsBotModalOpen(true)}
                onOpenActionLogsModal={() => setIsActionLogsModalOpen(true)}
                isMobileFrame={isMobileFrame}
                onToggleFrame={() => setIsMobileFrame(!isMobileFrame)}
                onBack={() => setMobileShowChat(false)}
              />

              {/* Pinned Message Banner */}
              {currentRoom.pinnedMessageId && (
                <div className="bg-[#181A20] border-b border-[#2B2F36] px-4 py-2 flex items-center justify-between text-xs text-[#848E9C]">
                  <div className="flex items-center gap-2 truncate">
                    <Pin className="w-3.5 h-3.5 text-[#F3BA2F] flex-shrink-0" />
                    <span className="font-bold text-[#EAECEF]">Mensagem Fixada:</span>
                    <span className="truncate text-[#B7BDC6]">
                      {messages.find((m) => m.id === currentRoom.pinnedMessageId)?.body || 'Regras do grupo e sinais automatizados'}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-[#F3BA2F] bg-[#F3BA2F]/10 px-2 py-0.5 rounded">
                    ADMIN
                  </span>
                </div>
              )}

              {/* Messages Stream */}
              <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 bg-[radial-gradient(circle_at_center,_#181a20_0%,_#0b0e11_100%)]">
                {messages.length === 0 ? (
                  <div className="text-center py-16 text-xs text-[#848E9C]">
                    Nenhuma mensagem neste grupo ainda. Envie uma mensagem ou dispare um alerta via Bot API!
                  </div>
                ) : (
                  messages.map((msg) => (
                    <MessageItem
                      key={msg.id}
                      message={msg}
                      roomId={selectedRoomId}
                      onExecuteAction={handleExecuteAction}
                      onOpenMedia={(url, caption) =>
                        setMediaViewerState({ isOpen: true, url, caption })
                      }
                      onOpenChart={(pair) => {
                        setChartPair(pair);
                        setIsChartModalOpen(true);
                      }}
                      onAddReaction={(msgId, emoji) => {
                        setMessages((prev) =>
                          prev.map((m) => {
                            if (m.id !== msgId) return m;
                            const count = (m.reactions?.[emoji] || 0) + 1;
                            return {
                              ...m,
                              reactions: { ...m.reactions, [emoji]: count },
                            };
                          })
                        );
                      }}
                    />
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input & Media Bar */}
              <div className="p-3.5 bg-[#181A20] border-t border-[#2B2F36] relative">
                {/* Quick Emoji Bar */}
                {showEmojiQuick && (
                  <div className="absolute bottom-16 left-3 bg-[#1E2329] border border-[#2B2F36] rounded-xl p-2 flex items-center gap-2 shadow-2xl z-30">
                    {['🔥', '🚀', '👀', '🟢', '🔴', '📊', '⚡', '💰', '👍'].map((em) => (
                      <button
                        key={em}
                        onClick={() => {
                          setInputText((prev) => prev + em);
                          setShowEmojiQuick(false);
                        }}
                        className="text-lg hover:scale-125 transition-transform p-1 cursor-pointer"
                      >
                        {em}
                      </button>
                    ))}
                  </div>
                )}

                {/* Attachment Menu Popover */}
                {showAttachmentMenu && (
                  <div className="absolute bottom-16 left-3 bg-[#1E2329] border border-[#2B2F36] rounded-xl p-2 shadow-2xl z-30 space-y-1 w-56 text-xs font-semibold">
                    <button
                      onClick={() => {
                        handleSendMessage({
                          msgtype: 'm.image',
                          body: 'Gráfico BTC/USDT análise de rompimento de volume.',
                          mediaUrl:
                            'https://images.unsplash.com/photo-1642543492481-44e81e3914a7?w=1200&auto=format&fit=crop&q=80',
                        });
                      }}
                      className="w-full p-2 rounded-lg hover:bg-[#2B2F36] text-[#EAECEF] flex items-center gap-2.5 transition-colors cursor-pointer"
                    >
                      <Image className="w-4 h-4 text-[#F3BA2F]" /> Enviar Imagem / Gráfico
                    </button>
                    <button
                      onClick={() => {
                        handleSendMessage({
                          msgtype: 'm.video',
                          body: 'Vídeo análise: Setup de scalping 5 minutos.',
                          mediaUrl: 'https://images.unsplash.com/photo-1642543492481-44e81e3914a7?w=800',
                          duration: 45,
                        });
                      }}
                      className="w-full p-2 rounded-lg hover:bg-[#2B2F36] text-[#EAECEF] flex items-center gap-2.5 transition-colors cursor-pointer"
                    >
                      <Video className="w-4 h-4 text-[#0ECB81]" /> Enviar Vídeo com Player
                    </button>
                    <button
                      onClick={() => {
                        handleSendMessage({
                          msgtype: 'm.audio',
                          body: '🎙️ Briefing de Voz: Atualização do Livro de Ofertas',
                          mediaUrl: 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3',
                          duration: 32,
                        });
                      }}
                      className="w-full p-2 rounded-lg hover:bg-[#2B2F36] text-[#EAECEF] flex items-center gap-2.5 transition-colors cursor-pointer"
                    >
                      <Mic className="w-4 h-4 text-[#F3BA2F]" /> Enviar Áudio com Waveform
                    </button>
                    <button
                      onClick={() => {
                        handleSendMessage({
                          msgtype: 'm.file',
                          body: 'Relatório Institucional de Trading.pdf',
                          fileName: 'Setup_Scalping_Matrix_2026.pdf',
                          fileSize: '3.1 MB',
                          mimeType: 'application/pdf',
                        });
                      }}
                      className="w-full p-2 rounded-lg hover:bg-[#2B2F36] text-[#EAECEF] flex items-center gap-2.5 transition-colors cursor-pointer"
                    >
                      <FileText className="w-4 h-4 text-[#848E9C]" /> Enviar Documento PDF
                    </button>
                  </div>
                )}

                {/* Input Bar Form */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="flex items-center gap-2"
                >
                  <button
                    type="button"
                    onClick={() => setShowAttachmentMenu(!showAttachmentMenu)}
                    className="p-2 rounded-xl bg-[#2B2F36] hover:bg-[#474D57] text-[#848E9C] hover:text-[#EAECEF] transition-colors"
                    title="Anexar multimídia (Imagem, Vídeo, Áudio, Arquivo)"
                  >
                    <Paperclip className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowEmojiQuick(!showEmojiQuick)}
                    className="p-2 rounded-xl bg-[#2B2F36] hover:bg-[#474D57] text-[#848E9C] hover:text-[#EAECEF] transition-colors"
                    title="Emojis"
                  >
                    <Smile className="w-4 h-4" />
                  </button>

                  <input
                    type="text"
                    placeholder={`Conversar em ${currentRoom.name}...`}
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    className="flex-1 bg-[#0B0E11] border border-[#2B2F36] rounded-xl px-4 py-2.5 text-xs text-[#EAECEF] placeholder-[#848E9C] focus:outline-none focus:border-[#F3BA2F] font-mono"
                  />

                  <button
                    type="submit"
                    disabled={!inputText.trim()}
                    className="p-2.5 rounded-xl bg-[#F3BA2F] hover:bg-[#E5AC25] disabled:opacity-40 text-[#000000] transition-all font-bold cursor-pointer shadow-md shadow-[#F3BA2F]/10"
                    title="Enviar Mensagem"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-xs text-[#848E9C]">
              Selecione um canal ou grupo na barra lateral
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <BotDispatcherModal
        isOpen={isBotModalOpen}
        onClose={() => setIsBotModalOpen(false)}
        bots={bots}
        rooms={rooms}
        onSendNotification={handleSendBotNotification}
        onCreateBot={handleCreateBot}
        onRegenerateToken={handleRegenerateToken}
      />

      <ChartModal
        isOpen={isChartModalOpen}
        onClose={() => setIsChartModalOpen(false)}
        pair={chartPair}
        onQuickOrder={(side, price, amount) => {
          handleExecuteAction(
            side.toLowerCase(),
            `chart_${side.toLowerCase()}`,
            'chart_event',
            selectedRoomId,
            { pair: chartPair, side, price, amount }
          );
        }}
      />

      <InviteModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        currentRoom={currentRoom}
        onJoinByCode={handleJoinByCode}
      />

      <ActionLogsModal
        isOpen={isActionLogsModalOpen}
        onClose={() => setIsActionLogsModalOpen(false)}
        logs={actionLogs}
      />

      <MediaViewerModal
        isOpen={mediaViewerState.isOpen}
        onClose={() => setMediaViewerState({ isOpen: false, url: '' })}
        mediaUrl={mediaViewerState.url}
        caption={mediaViewerState.caption}
      />

      <NewRoomModal
        isOpen={isNewRoomModalOpen}
        onClose={() => setIsNewRoomModalOpen(false)}
        onCreateRoom={handleCreateRoom}
      />
    </AndroidFrame>
  );
}
