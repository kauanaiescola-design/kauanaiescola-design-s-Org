import React, { useState } from 'react';
import { FormTheme } from '../types/form';
import { 
  X, 
  Copy, 
  Check, 
  QrCode, 
  Link as LinkIcon, 
  Share2, 
  Mail, 
  Printer, 
  GraduationCap 
} from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: FormTheme;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  theme
}) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'link' | 'qr'>('link');

  if (!isOpen) return null;

  const currentUrl = window.location.href;

  const handleCopy = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 space-y-5 border border-[#dadce0]">
        <div className="flex items-center justify-between border-b border-[#f1f3f4] pb-3">
          <div className="flex items-center gap-2 text-base font-medium text-neutral-900">
            <Share2 className="w-5 h-5 text-purple-700" />
            <span>Enviar Questionário aos Alunos</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-neutral-700 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Share Mode Switcher */}
        <div className="flex border-b border-neutral-200">
          <button
            onClick={() => setActiveTab('link')}
            className={`py-2 px-3 text-xs font-medium border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'link'
                ? 'border-purple-600 text-purple-700 font-semibold'
                : 'border-transparent text-neutral-500 hover:text-neutral-800'
            }`}
          >
            <LinkIcon className="w-3.5 h-3.5" />
            <span>Link de Acesso</span>
          </button>

          <button
            onClick={() => setActiveTab('qr')}
            className={`py-2 px-3 text-xs font-medium border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'qr'
                ? 'border-purple-600 text-purple-700 font-semibold'
                : 'border-transparent text-neutral-500 hover:text-neutral-800'
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>QR Code para Sala de Aula</span>
          </button>
        </div>

        {/* Tab Link */}
        {activeTab === 'link' && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                Link do Formulário
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={currentUrl}
                  className="flex-1 bg-[#f8f9fa] border border-[#dadce0] rounded-md px-3 py-2 text-xs text-neutral-700 select-all font-mono outline-hidden"
                />
                <button
                  onClick={handleCopy}
                  className="px-3 py-2 text-xs font-medium text-white rounded-md flex items-center gap-1 shrink-0 transition-opacity"
                  style={{ backgroundColor: theme.primaryColor }}
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copiado!' : 'Copiar'}</span>
                </button>
              </div>
            </div>

            <div className="bg-neutral-50 rounded-lg p-3 border border-neutral-200 text-xs text-neutral-600 space-y-1">
              <span className="font-semibold text-neutral-900 block flex items-center gap-1">
                <GraduationCap className="w-3.5 h-3.5 text-purple-600" />
                Como aplicar na escola:
              </span>
              <p>
                1. Compartilhe o link no Google Classroom, WhatsApp dos pais ou da turma.
              </p>
              <p>
                2. Os alunos podem preencher pelo celular, tablet ou no laboratório de informática.
              </p>
            </div>
          </div>
        )}

        {/* Tab QR Code */}
        {activeTab === 'qr' && (
          <div className="flex flex-col items-center justify-center space-y-3 py-2">
            <div className="p-4 bg-white rounded-xl border-2 border-purple-200 shadow-xs flex flex-col items-center">
              {/* SVG QR Code Simulation */}
              <svg className="w-44 h-44 text-neutral-900" viewBox="0 0 200 200" fill="currentColor">
                <rect width="200" height="200" fill="white" />
                {/* QR corner 1 */}
                <rect x="20" y="20" width="50" height="50" fill="#202124" />
                <rect x="30" y="30" width="30" height="30" fill="white" />
                <rect x="38" y="38" width="14" height="14" fill="#673ab7" />
                {/* QR corner 2 */}
                <rect x="130" y="20" width="50" height="50" fill="#202124" />
                <rect x="140" y="30" width="30" height="30" fill="white" />
                <rect x="148" y="38" width="14" height="14" fill="#673ab7" />
                {/* QR corner 3 */}
                <rect x="20" y="130" width="50" height="50" fill="#202124" />
                <rect x="30" y="140" width="30" height="30" fill="white" />
                <rect x="38" y="148" width="14" height="14" fill="#673ab7" />
                {/* Matrix dots */}
                <rect x="80" y="25" width="12" height="12" fill="#202124" />
                <rect x="100" y="35" width="12" height="12" fill="#202124" />
                <rect x="85" y="60" width="12" height="12" fill="#202124" />
                <rect x="105" y="80" width="12" height="12" fill="#202124" />
                <rect x="40" y="85" width="12" height="12" fill="#202124" />
                <rect x="60" y="95" width="12" height="12" fill="#202124" />
                <rect x="80" y="105" width="12" height="12" fill="#202124" />
                <rect x="135" y="85" width="12" height="12" fill="#202124" />
                <rect x="155" y="105" width="12" height="12" fill="#202124" />
                <rect x="90" y="130" width="12" height="12" fill="#202124" />
                <rect x="110" y="145" width="12" height="12" fill="#202124" />
                <rect x="140" y="135" width="12" height="12" fill="#202124" />
                <rect x="160" y="155" width="12" height="12" fill="#202124" />
                <rect x="85" y="165" width="12" height="12" fill="#202124" />
                <circle cx="100" cy="100" r="14" fill="#673ab7" />
              </svg>

              <span className="text-[11px] font-semibold text-neutral-700 mt-2">
                Aponte a câmera do celular para responder
              </span>
            </div>

            <p className="text-center text-xs text-neutral-500 max-w-xs">
              Projete este QR Code no projetor da sala de aula ou imprima para colar nos murais da escola.
            </p>
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-[#f1f3f4]">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 text-xs text-neutral-600 hover:text-neutral-900"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Imprimir para a turma</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium bg-neutral-900 text-white rounded-md hover:bg-neutral-800 transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
