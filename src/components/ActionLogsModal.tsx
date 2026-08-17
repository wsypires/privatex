import React from 'react';
import { ActionExecutionLog } from '../types';
import { Activity, CheckCircle, Clock, Terminal, User, ShieldAlert, Zap } from 'lucide-react';

interface ActionLogsModalProps {
  isOpen: boolean;
  onClose: () => void;
  logs: ActionExecutionLog[];
}

export const ActionLogsModal: React.FC<ActionLogsModalProps> = ({ isOpen, onClose, logs }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#181A20] border border-[#2B2F36] rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-[#2B2F36] flex items-center justify-between bg-[#1E2329]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#0ECB81]/15 text-[#0ECB81] flex items-center justify-center font-bold">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#EAECEF]">Logs de Ações Interativas (Spec #10 & #12)</h3>
              <p className="text-[11px] text-[#848E9C]">Eventos de botões despachados para o Matrix Backend</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-xs text-[#848E9C] hover:text-[#EAECEF] px-2.5 py-1 rounded bg-[#2B2F36]"
          >
            Fechar
          </button>
        </div>

        {/* Logs List */}
        <div className="p-4 flex-1 overflow-y-auto space-y-3 font-mono text-xs">
          {logs.length === 0 ? (
            <div className="text-center py-10 text-[#848E9C]">
              Nenhum evento de ação registrado ainda. Clique nos botões interativos (ex: [🟢 Comprar] ou [🔴 Vender]) para disparar eventos!
            </div>
          ) : (
            logs.map((log) => (
              <div
                key={log.id}
                className="p-3 rounded-xl bg-[#14161A] border border-[#2B2F36] space-y-2 hover:border-[#474D57] transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        log.action === 'buy'
                          ? 'bg-[#0ECB81]/20 text-[#0ECB81] border border-[#0ECB81]/40'
                          : log.action === 'sell'
                          ? 'bg-[#F6465D]/20 text-[#F6465D] border border-[#F6465D]/40'
                          : 'bg-[#F3BA2F]/20 text-[#F3BA2F] border border-[#F3BA2F]/40'
                      }`}
                    >
                      ACTION: {log.action}
                    </span>
                    <span className="text-[#EAECEF] font-bold text-xs">{log.buttonId}</span>
                  </div>

                  <div className="flex items-center gap-1.5 text-[11px] text-[#848E9C]">
                    <Clock className="w-3 h-3" />
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </div>
                </div>

                <div className="text-[#B7BDC6] text-[11px] bg-[#1E2329] p-2 rounded-lg border border-[#2B2F36]/50">
                  {log.responseSummary || 'Ação executada com sucesso.'}
                </div>

                <div className="grid grid-cols-2 gap-2 text-[10px] text-[#848E9C] pt-1">
                  <div>
                    User: <span className="text-[#EAECEF]">{log.userId}</span>
                  </div>
                  <div>
                    Room: <span className="text-[#EAECEF] truncate block">{log.roomId}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
