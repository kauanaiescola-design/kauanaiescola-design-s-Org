import React from 'react';
import { FormTheme } from '../types/form';
import { THEMES } from '../data/questions';
import { X, Check, Palette } from 'lucide-react';

interface ThemeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme: FormTheme;
  onSelectTheme: (theme: FormTheme) => void;
}

export const ThemeModal: React.FC<ThemeModalProps> = ({
  isOpen,
  onClose,
  currentTheme,
  onSelectTheme
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 space-y-5 border border-[#dadce0]">
        <div className="flex items-center justify-between border-b border-[#f1f3f4] pb-3">
          <div className="flex items-center gap-2 text-base font-medium text-neutral-900">
            <Palette className="w-5 h-5 text-purple-700" />
            <span>Opções de Tema do Formulário</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-neutral-700 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div>
          <label className="block text-xs font-semibold text-neutral-700 mb-2">
            Cor do Tema
          </label>
          <div className="grid grid-cols-2 gap-2.5">
            {THEMES.map((th) => {
              const isSelected = th.primaryColor === currentTheme.primaryColor;

              return (
                <button
                  key={th.primaryColor}
                  type="button"
                  onClick={() => onSelectTheme(th)}
                  className={`flex items-center gap-2.5 p-2 rounded-lg border text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'border-neutral-900 bg-neutral-50 ring-1 ring-neutral-900'
                      : 'border-neutral-200 hover:border-neutral-400'
                  }`}
                >
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 shadow-xs"
                    style={{ backgroundColor: th.primaryColor }}
                  >
                    {isSelected && <Check className="w-3 h-3 text-white" />}
                  </div>
                  <span className="text-xs font-medium text-neutral-800 truncate">
                    {th.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="bg-[#f8f9fa] rounded-md p-3 text-xs text-neutral-600">
          <p>
            A cor selecionada será aplicada ao cabeçalho decorativo, botões de ação e barras de progresso do formulário.
          </p>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium bg-neutral-900 text-white rounded-md hover:bg-neutral-800 transition-colors"
          >
            Concluído
          </button>
        </div>
      </div>
    </div>
  );
};
