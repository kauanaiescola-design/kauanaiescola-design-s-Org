import React from 'react';
import { Trash2, AlertTriangle, X, Loader2 } from 'lucide-react';

interface ClearConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  count: number;
  isDeleting?: boolean;
  targetId?: string | null;
}

export const ClearConfirmModal: React.FC<ClearConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  count,
  isDeleting = false,
  targetId = null
}) => {
  if (!isOpen) return null;

  const isSingle = Boolean(targetId);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div 
        className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-neutral-200 overflow-hidden transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-red-50 p-6 border-b border-red-100 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
              <Trash2 className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-neutral-900">
                {isSingle ? 'Excluir Resposta?' : 'Zerar Todas as Respostas?'}
              </h3>
              <p className="text-xs text-red-700 mt-0.5">
                {isSingle 
                  ? 'Esta resposta será removida permanentemente do Supabase'
                  : 'Esta ação é irreversível e limpará a base de dados'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={isDeleting}
            className="text-neutral-400 hover:text-neutral-700 p-1 rounded-md transition-colors cursor-pointer"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <div className="flex items-start gap-3 p-3.5 bg-neutral-50 rounded-xl border border-neutral-200 text-xs text-neutral-700 leading-relaxed">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              {isSingle ? (
                <>
                  Você está prestes a excluir a resposta de ID{' '}
                  <code className="bg-neutral-200 px-1.5 py-0.5 rounded font-mono font-bold text-neutral-900">
                    {targetId}
                  </code>
                  . O registro correspondente será excluído do Supabase e as métricas do painel serão atualizadas.
                </>
              ) : (
                <>
                  Você está prestes a excluir{' '}
                  <strong className="text-neutral-900 font-bold">
                    {count} {count === 1 ? 'resposta recebida' : 'respostas recebidas'}
                  </strong>
                  . Todos os gráficos comparativos por turmas, tabelas e dados no Supabase e Firestore serão reiniciados para 0.
                </>
              )}
            </div>
          </div>

          <p className="text-xs text-neutral-500">
            {isSingle
              ? 'Deseja confirmar a exclusão desta resposta no banco de dados?'
              : 'Deseja continuar e zerar todo o histórico de respostas coletadas?'}
          </p>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row-reverse gap-2.5">
            <button
              type="button"
              onClick={onConfirm}
              disabled={isDeleting}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-60"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>{isSingle ? 'Excluindo resposta...' : 'Zerando respostas...'}</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{isSingle ? 'Sim, Excluir Resposta' : 'Sim, Zerar Todas'}</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onClose}
              disabled={isDeleting}
              className="flex-1 px-4 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
