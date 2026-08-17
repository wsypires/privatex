import React, { useState } from 'react';
import { Shield, Lock, Users, Plus, Hash } from 'lucide-react';

interface NewRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateRoom: (roomData: any) => Promise<any>;
}

export const NewRoomModal: React.FC<NewRoomModalProps> = ({ isOpen, onClose, onCreateRoom }) => {
  const [name, setName] = useState('');
  const [topic, setTopic] = useState('');
  const [category, setCategory] = useState<'trading' | 'devops' | 'forex' | 'vip' | 'general'>('trading');
  const [isPrivate, setIsPrivate] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setIsSubmitting(true);
    try {
      await onCreateRoom({
        name,
        topic,
        category,
        isPrivate,
      });
      setName('');
      setTopic('');
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#181A20] border border-[#2B2F36] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
        <div className="p-4 border-b border-[#2B2F36] flex items-center justify-between bg-[#1E2329]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#F3BA2F] text-[#000000] flex items-center justify-center font-bold">
              <Plus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#EAECEF]">Novo Grupo Privado</h3>
              <p className="text-[11px] text-[#848E9C]">Matrix Synapse Room Creation</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-xs text-[#848E9C] hover:text-[#EAECEF] px-2.5 py-1 rounded bg-[#2B2F36]"
          >
            Fechar
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-mono text-[#848E9C] mb-1">Nome do Grupo:</label>
            <input
              type="text"
              required
              placeholder="Ex: 🚨 Scalper VIP Binance"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#14161A] border border-[#2B2F36] rounded-xl p-3 text-xs text-[#EAECEF] focus:outline-none focus:border-[#F3BA2F]"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-[#848E9C] mb-1">Descrição / Tópico:</label>
            <textarea
              rows={2}
              placeholder="Ex: Canal privado para recebimento de alertas automatizados de trading..."
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full bg-[#14161A] border border-[#2B2F36] rounded-xl p-3 text-xs text-[#EAECEF] focus:outline-none focus:border-[#F3BA2F]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono text-[#848E9C] mb-1">Categoria:</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full bg-[#14161A] border border-[#2B2F36] rounded-xl p-2.5 text-xs text-[#EAECEF] focus:outline-none focus:border-[#F3BA2F]"
              >
                <option value="trading">📈 Trading / Cripto</option>
                <option value="forex">🏆 Forex / Macro</option>
                <option value="devops">⚡ DevOps / Servidores</option>
                <option value="vip">💎 Alertas VIP</option>
                <option value="general">💬 Geral</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono text-[#848E9C] mb-1">Privacidade:</label>
              <select
                value={isPrivate ? 'true' : 'false'}
                onChange={(e) => setIsPrivate(e.target.value === 'true')}
                className="w-full bg-[#14161A] border border-[#2B2F36] rounded-xl p-2.5 text-xs text-[#EAECEF] focus:outline-none focus:border-[#F3BA2F]"
              >
                <option value="true">🔒 Privado (Convite)</option>
                <option value="false">🌐 Público</option>
              </select>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#14161A] border border-[#2B2F36] text-xs text-[#848E9C] flex items-center gap-2">
            <Lock className="w-4 h-4 text-[#F3BA2F] flex-shrink-0" />
            <span>Gera automaticamente link de convite e autoriza envio via API de Bots.</span>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 rounded-xl bg-[#F3BA2F] hover:bg-[#E5AC25] text-[#000000] font-bold text-xs uppercase tracking-wider transition-all"
          >
            {isSubmitting ? 'Criando Grupo no Synapse...' : 'Criar Grupo Privado'}
          </button>
        </form>
      </div>
    </div>
  );
};
