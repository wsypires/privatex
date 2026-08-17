export type AlertSeverity = 'CRITICAL' | 'WARNING' | 'INFO' | 'SUCCESS';
export type ActionType = 'BUY' | 'SELL' | 'ALERT' | 'STATUS';

export type ButtonAction =
  | 'open_url'
  | 'open_screen'
  | 'send_event'
  | 'bot_command'
  | 'custom_action'
  | 'buy'
  | 'sell'
  | 'subscribe'
  | 'unsubscribe'
  | 'confirm'
  | 'cancel'
  | 'execute_strategy'
  | 'open_chart'
  | 'open_order';

export interface ActionButton {
  id: string;
  label: string;
  action: ButtonAction;
  url?: string;
  style?: 'primary' | 'success' | 'danger' | 'warning' | 'secondary' | 'outline' | 'binance-buy' | 'binance-sell';
  payload?: Record<string, any>;
  executedBy?: string[];
}

export interface AlertData {
  severity: AlertSeverity;
  tag: string;
  pair?: string;
  actionType?: ActionType;
  price?: string;
  strategy?: string;
  status?: string;
  entry?: string;
  stopLoss?: string;
  takeProfit?: string;
  timeframe?: string;
  change24h?: string;
  volume?: string;
  indicators?: {
    name: string;
    value: string;
    signal: 'bullish' | 'bearish' | 'neutral';
  }[];
}

export interface MessageSender {
  userId: string;
  displayName: string;
  avatarUrl: string;
  isBot: boolean;
  role?: 'admin' | 'moderator' | 'member' | 'bot' | 'user';
  badge?: string;
}

export interface MatrixMessage {
  id: string;
  roomId: string;
  sender: MessageSender;
  timestamp: number;
  msgtype: 'm.text' | 'm.image' | 'm.video' | 'm.audio' | 'm.file' | 'm.alert' | 'm.notice';
  body: string;
  formattedBody?: string;
  alertData?: AlertData;
  mediaUrl?: string;
  mediaThumbnail?: string;
  fileName?: string;
  fileSize?: string;
  mimeType?: string;
  duration?: number; // for audio / video in seconds
  buttons?: ActionButton[];
  reactions?: Record<string, number>;
  isPinned?: boolean;
  replyTo?: {
    id: string;
    sender: string;
    body: string;
  };
  deliveryStatus?: 'sending' | 'sent' | 'delivered' | 'read';
}

export interface MatrixRoom {
  id: string;
  name: string;
  topic: string;
  avatar: string;
  isPrivate: boolean;
  unreadCount: number;
  isMuted: boolean;
  category: 'trading' | 'devops' | 'forex' | 'vip' | 'general';
  memberCount: number;
  inviteLink: string;
  inviteCode: string;
  lastMessage?: MatrixMessage;
  allowedBots: string[];
  pinnedMessageId?: string;
  createdAt: string;
  encryption: 'm.megolm.v1.aes-sha2' | 'none';
}

export interface BotConfig {
  id: string;
  name: string;
  avatar: string;
  token: string;
  status: 'ONLINE' | 'STANDBY' | 'OFFLINE';
  description: string;
  authorizedRooms: string[];
  permissions: ('send_text' | 'send_media' | 'send_alerts' | 'send_buttons' | 'receive_actions')[];
  totalDispatched: number;
  lastActive: number;
}

export interface ActionExecutionLog {
  id: string;
  timestamp: number;
  action: string;
  buttonId: string;
  messageId: string;
  roomId: string;
  userId: string;
  status: 'RECEIVED' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  responseSummary?: string;
  payload?: Record<string, any>;
}

export interface UserProfile {
  userId: string;
  displayName: string;
  avatar: string;
  role: 'admin' | 'moderator' | 'member';
  joinedRooms: string[];
  deviceToken?: string;
  notificationSettings: {
    sound: boolean;
    vibration: boolean;
    criticalAlerts: boolean;
    inAppBanner: boolean;
  };
}

export interface PushNotificationPayload {
  id: string;
  roomId: string;
  roomName: string;
  title: string;
  body: string;
  severity: AlertSeverity;
  image?: string;
  timestamp: number;
  buttons?: ActionButton[];
}
