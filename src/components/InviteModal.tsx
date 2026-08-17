import React, { useState } from 'react';
import { MatrixRoom } from '../types';
import {
  Link2,
  Copy,
  Check,
  QrCode,
  ShieldCheck,
  Users,
  Lock,
  RefreshCw,
  Sparkles,
} from 'lucide-react';

interface InviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentRoom: MatrixRoom | null;
  onJoinByCode: (code: string) => Promise<any>;
}

export const InviteModal: React.FC<InviteModalProps> = ({
  isOpen,
  onClose,
  currentRoom,
  onJoinByCode,
}) => {
  const [tab, setTab] = useState<'share' | 'join'>('share');
  const [copied, setCopied] = useState<boolean>(false);
  const [inputCode, setInputCode] = useState<string>('');
  const [isJoining, setIsJoining] = useState<boolean>(false);
  const [joinStatus, setJoinStatus] = useState<{ success?: boolean; message?: string } | null>(null);

  if (!isOpen) return null;

  const inviteLink = currentRoom?.inviteLink || `https://privatx.io/invite/${currentRoom?.inviteCode || 'VIP888'}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleJoinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCode.trim()) return;
    setIsJoining(true);
    setJoinStatus(null);
    try {
      // Extract code if user pasted a full URL
      const cleanCode = inputCode.includes('/invite/')
        ? inputCode.split('/invite/')[1].trim()
        : inputCode.trim();

      const res = await onJoinByCode(cleanCode);
      setJoinStatus({ success: true, message: res.message || 'Entrada confirmada no grupo privado!' });
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err: any) {
      setJoinStatus({ success: false, message: err.message || 'Código de convite inválido ou expirado.' });
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#181A20] border border-[#2B2F36] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-4 border-b border-[#2B2F36] flex items-center justify-between bg-[#1E2329]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#F3BA2F]/15 text-[#F3BA2F] flex items-center justify-center font-bold">
              <Link2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#EAECEF]">Links de Convite (Spec #6)</h3>
              <p className="text-[11px] text-[#848E9C]">Grupos privados & entrada criptografada</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-xs text-[#848E9C] hover:text-[#EAECEF] px-2 py-1 rounded bg-[#2B2F36]"
          >
            Fechar
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-[#2B2F36] bg-[#14161A]">
          <button
            onClick={() => setTab('share')}
            className={`flex-1 py-2.5 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 border-b-2 ${
              tab === 'share' ? 'border-[#F3BA2F] text-[#F3BA2F]' : 'border-transparent text-[#848E9C]'
            }`}
          >
            <Copy className="w-3.5 h-3.5" /> Compartilhar Convite
          </button>
          <button
            onClick={() => setTab('join')}
            className={`flex-1 py-2.5 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 border-b-2 ${
              tab === 'join' ? 'border-[#F3BA2F] text-[#F3BA2F]' : 'border-transparent text-[#848E9C]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" /> Entrar por Código
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {tab === 'share' && currentRoom ? (
            <div className="space-y-4">
              {/* Room Card Preview */}
              <div className="p-3.5 rounded-xl bg-[#1E2329] border border-[#2B2F36] flex items-center gap-3">
                <img
                  src={currentRoom.avatar}
                  alt={currentRoom.name}
                  className="w-12 h-12 rounded-xl object-cover border border-[#2B2F36]"
                />
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-sm text-[#EAECEF] truncate">{currentRoom.name}</div>
                  <div className="text-xs text-[#848E9C] flex items-center gap-2 mt-0.5">
                    <span className="flex items-center gap-1">
                      <Lock className="w-3 h-3 text-[#F3BA2F]" /> Grupo Privado
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" /> {currentRoom.memberCount} membros
                    </span>
                  </div>
                </div>
              </div>

              {/* Link Box */}
              <div>
                <label className="block text-xs font-mono text-[#848E9C] mb-1.5">
                  LINK DE CONVITE OFICIAL:
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={inviteLink}
                    className="flex-1 bg-[#14161A] border border-[#2B2F36] rounded-xl px-3 py-2.5 text-xs font-mono text-[#F3BA2F] focus:outline-none select-all"
                  />
                  <button
                    onClick={handleCopy}
                    className="px-4 py-2.5 rounded-xl bg-[#F3BA2F] hover:bg-[#E5AC25] text-[#000000] font-bold text-xs flex items-center gap-1.5 transition-all shadow-md"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copied ? 'Copiado' : 'Copiar'}
                  </button>
                </div>
              </div>

              {/* Details banner */}
              <div className="p-3 rounded-xl bg-[#0ECB81]/10 border border-[#0ECB81]/30 text-xs text-[#0ECB81] flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 flex-shrink-0" />
                <span>Entrada sem necessidade de número de telefone celular. Identidade Matrix.</span>
              </div>
            </div>
          ) : tab === 'share' ? (
            <div className="text-center py-6 text-xs text-[#848E9C]">
              Selecione um grupo para gerar ou visualizar o link de convite.
            </div>
          ) : (
            /* Join Tab */
            <form onSubmit={handleJoinSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-[#848E9C] mb-1.5">
                  Cole o Link ou Código do Grupo Privado:
                </label>
                <input
                  type="text"
                  placeholder="Ex: BTC889 ou https://privatx.io/invite/ALPHA77"
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value)}
                  className="w-full bg-[#14161A] border border-[#2B2F36] rounded-xl p-3 text-xs font-mono text-[#EAECEF] focus:outline-none focus:border-[#F3BA2F]"
                />
              </div>

              {joinStatus && (
                <div
                  className={`p-3 rounded-xl text-xs font-medium ${
                    joinStatus.success
                      ? 'bg-[#0ECB81]/15 text-[#0ECB81] border border-[#0ECB81]/30'
                      : 'bg-[#F6465D]/15 text-[#F6465D] border border-[#F6465D]/30'
                  }`}
                >
                  {joinStatus.message}
                </div>
              )}

              <button
                type="submit"
                disabled={isJoining}
                className="w-full py-3 rounded-xl bg-[#F3BA2F] hover:bg-[#E5AC25] text-[#000000] font-bold text-xs uppercase tracking-wider transition-all"
              >
                {isJoining ? 'Validando Convite no Synapse...' : 'Entrar no Grupo Privado'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
