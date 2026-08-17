import React from 'react';
import { X, Download, ZoomIn, ZoomOut, Maximize2, Shield } from 'lucide-react';

interface MediaViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  mediaUrl: string;
  caption?: string;
  senderName?: string;
  timestamp?: number;
}

export const MediaViewerModal: React.FC<MediaViewerModalProps> = ({
  isOpen,
  onClose,
  mediaUrl,
  caption,
  senderName,
  timestamp,
}) => {
  const [zoom, setZoom] = React.useState(1);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl animate-in fade-in duration-200">
      {/* Top action bar */}
      <div className="absolute top-4 inset-x-4 flex items-center justify-between z-10">
        <div className="text-white">
          <div className="text-sm font-bold text-[#EAECEF]">{senderName || 'Mídia Matrix'}</div>
          {timestamp && (
            <div className="text-xs text-[#848E9C]">
              {new Date(timestamp).toLocaleDateString()} às {new Date(timestamp).toLocaleTimeString()}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setZoom((z) => Math.min(z + 0.25, 2.5))}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
            title="Aumentar zoom"
          >
            <ZoomIn className="w-5 h-5" />
          </button>
          <button
            onClick={() => setZoom((z) => Math.max(z - 0.25, 0.75))}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
            title="Diminuir zoom"
          >
            <ZoomOut className="w-5 h-5" />
          </button>
          <a
            href={mediaUrl}
            target="_blank"
            rel="noreferrer"
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
            title="Abrir imagem original"
          >
            <Download className="w-5 h-5" />
          </a>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Image container */}
      <div className="max-w-5xl max-h-[80vh] flex items-center justify-center overflow-hidden">
        <img
          src={mediaUrl}
          alt="Visualização Matrix"
          className="max-h-[75vh] max-w-full object-contain transition-transform duration-200 rounded-lg shadow-2xl"
          style={{ transform: `scale(${zoom})` }}
        />
      </div>

      {/* Bottom Caption */}
      {caption && (
        <div className="absolute bottom-6 inset-x-6 max-w-2xl mx-auto bg-black/75 backdrop-blur-md p-3.5 rounded-xl border border-white/10 text-center text-xs text-white">
          {caption}
        </div>
      )}
    </div>
  );
};
