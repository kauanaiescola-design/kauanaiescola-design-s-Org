import React from 'react';
import { FormTheme } from '../types/form';
import { 
  CheckCircle2, 
  RotateCcw, 
  BarChart3, 
  BookOpen, 
  PhoneCall, 
  ShieldCheck, 
  Home
} from 'lucide-react';

interface ConfirmationScreenProps {
  theme: FormTheme;
  currentRole: 'portal' | 'aluno' | 'professor';
  onNewResponse: () => void;
  onViewSummary: () => void;
  onOpenGuide: () => void;
  onReturnToPortal: () => void;
}

export const ConfirmationScreen: React.FC<ConfirmationScreenProps> = ({
  theme,
  currentRole,
  onNewResponse,
  onViewSummary,
  onOpenGuide,
  onReturnToPortal
}) => {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-6">
      {/* Google Forms Confirmation Card */}
      <div className="bg-white rounded-lg border border-[#dadce0] overflow-hidden shadow-xs">
        <div 
          className="h-2.5 sm:h-3 w-full"
          style={{ backgroundColor: theme.primaryColor }}
        />

        <div className="p-6 sm:p-8 space-y-5">
          <div className="flex items-center gap-3 text-emerald-600">
            <CheckCircle2 className="w-8 h-8 shrink-0 text-emerald-600" />
            <h2 className="text-2xl font-medium text-[#202124]">
              Questionário: Convivência Escolar, Bullying e Segurança
            </h2>
          </div>

          <div className="text-sm text-neutral-800 space-y-2 border-t border-[#f1f3f4] pt-4">
            <p className="font-medium text-base text-neutral-900">
              Sua resposta foi registrada com sucesso!
            </p>
            <p className="text-neutral-600 text-xs sm:text-sm">
              Obrigado por contribuir com a nossa pesquisa diagnóstica. Sua voz é fundamental para construirmos uma escola mais empática, justa e livre de agressões físicas e virtuais.
            </p>
          </div>

          {/* Quick Actions Links */}
          <div className="pt-4 border-t border-[#f1f3f4] flex flex-wrap items-center gap-4">
            <button
              onClick={onNewResponse}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-purple-700 hover:text-purple-900 hover:underline py-1 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Enviar outra resposta</span>
            </button>

            <button
              onClick={onReturnToPortal}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-700 hover:text-neutral-900 hover:underline py-1 cursor-pointer"
            >
              <Home className="w-3.5 h-3.5 text-neutral-500" />
              <span>Voltar ao Menu Principal</span>
            </button>

            {currentRole === 'professor' && (
              <button
                onClick={onViewSummary}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-purple-700 hover:text-purple-900 hover:underline py-1 cursor-pointer"
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>Voltar ao Painel do Professor</span>
              </button>
            )}

            <button
              onClick={onOpenGuide}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-purple-700 hover:text-purple-900 hover:underline py-1 cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Guia pedagógico das 15 questões</span>
            </button>
          </div>
        </div>
      </div>

      {/* Welcoming & Help / Support Card (Pedagogical Responsibility) */}
      <div className="bg-white rounded-lg border border-[#dadce0] p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-neutral-900">
          <ShieldCheck className="w-5 h-5 text-purple-700" />
          <span>Você ou alguém que você conhece precisa de apoio?</span>
        </div>

        <p className="text-xs text-neutral-600 leading-relaxed">
          O bullying não deve ser tolerado em silêncio. A escola e o poder público dispõem de canais gratuitos, anônimos e protegidos para acolhimento e denúncia:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <div className="bg-neutral-50 rounded-lg p-3 border border-neutral-200 text-xs">
            <div className="font-semibold text-neutral-900 flex items-center gap-1.5 mb-1">
              <PhoneCall className="w-3.5 h-3.5 text-purple-600" />
              <span>Disque 100</span>
            </div>
            <p className="text-neutral-500 text-[11px] leading-tight">
              Disque Direitos Humanos. Gratuito, sigiloso e disponível 24 horas por dia.
            </p>
          </div>

          <div className="bg-neutral-50 rounded-lg p-3 border border-neutral-200 text-xs">
            <div className="font-semibold text-neutral-900 flex items-center gap-1.5 mb-1">
              <PhoneCall className="w-3.5 h-3.5 text-emerald-600" />
              <span>CVV 188</span>
            </div>
            <p className="text-neutral-500 text-[11px] leading-tight">
              Centro de Valorização da Vida. Apoio emocional gratuito e acolhedor 24h.
            </p>
          </div>

          <div className="bg-neutral-50 rounded-lg p-3 border border-neutral-200 text-xs">
            <div className="font-semibold text-neutral-900 flex items-center gap-1.5 mb-1">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              <span>Coordenação Escolar</span>
            </div>
            <p className="text-neutral-500 text-[11px] leading-tight">
              Procure o Orientador Pedagógico ou um professor de sua confiança.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
