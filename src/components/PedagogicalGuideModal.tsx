import React, { useState } from 'react';
import { Question } from '../types/form';
import { 
  X, 
  BookOpen, 
  Scale, 
  ShieldAlert, 
  GraduationCap, 
  CheckCircle2, 
  HelpCircle,
  FileText
} from 'lucide-react';

interface PedagogicalGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  questions: Question[];
}

export const PedagogicalGuideModal: React.FC<PedagogicalGuideModalProps> = ({
  isOpen,
  onClose,
  questions
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');

  if (!isOpen) return null;

  const categories = [
    { id: 'todos', label: 'Todas as 15 Questões' },
    { id: 'institucional', label: 'Dever da Escola' },
    { id: 'fisico', label: 'Violência Física' },
    { id: 'digital', label: 'Cyberbullying & WhatsApp' },
    { id: 'inclusao', label: 'Inclusão & Deficiência' },
    { id: 'psicologico', label: 'Saúde Mental' },
    { id: 'legal', label: 'Responsabilização Jurídica' }
  ];

  const filtered = selectedCategory === 'todos' 
    ? questions 
    : questions.filter(q => q.category === selectedCategory);

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-3 sm:p-5">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden border border-[#dadce0]">
        {/* Header */}
        <div className="bg-[#673ab7] text-white p-5 flex items-start justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
              <Scale className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold">
                Guia Pedagógico &amp; Marco Legal das 15 Questões
              </h3>
              <p className="text-xs text-purple-100">
                Fundamentação jurídica nas Leis nº 13.185/2015 e 14.811/2024 · Escola Silvio Oliveira dos Santos
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Legal Context Banner */}
        <div className="bg-purple-50 border-b border-purple-100 p-4 text-xs text-purple-900 shrink-0">
          <div className="flex items-center gap-2 font-semibold mb-1">
            <ShieldAlert className="w-4 h-4 text-purple-700" />
            <span>Legislação Brasileira Atualizada:</span>
          </div>
          <p className="leading-relaxed">
            Em 2024, a <strong>Lei nº 14.811/2024</strong> incluiu o bullying e o cyberbullying no <strong>Código Penal Brasileiro (Art. 146-A)</strong>, agravando as penas quando cometido em redes sociais, jogos virtuais ou mensageiros (como WhatsApp). Além disso, a <strong>Lei nº 13.185/2015</strong> impõe a todas as escolas a obrigação de manter medidas efetivas de conscientização, diagnóstico e combate à intimidação sistemática.
          </p>
        </div>

        {/* Category Filters */}
        <div className="p-3 bg-neutral-50 border-b border-neutral-200 flex flex-wrap gap-1.5 shrink-0">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-purple-700 text-white shadow-xs'
                  : 'bg-white text-neutral-600 border border-neutral-300 hover:bg-neutral-100'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {filtered.map((q) => (
            <div
              key={q.id}
              className="bg-white rounded-lg border border-neutral-200 p-4 hover:border-purple-300 transition-colors space-y-2.5 shadow-2xs"
            >
              <div className="flex items-start gap-2.5">
                <span className="w-6 h-6 rounded-full bg-purple-100 text-purple-800 text-xs font-bold flex items-center justify-center shrink-0">
                  {q.id}
                </span>
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-neutral-900 leading-snug">
                    {q.text.replace(/^\d+\.\s*/, '')}
                  </h4>
                </div>
              </div>

              <div className="pl-8 space-y-2 text-xs">
                <div className="bg-[#f9f9fb] p-3 rounded-md border border-neutral-100 text-neutral-700 leading-relaxed">
                  <span className="font-semibold text-purple-900 block mb-0.5">
                    Entendimento Pedagógico:
                  </span>
                  {q.explanation}
                </div>

                {q.legalBase && (
                  <div className="flex items-start gap-1.5 text-neutral-600 font-medium text-[11px] bg-amber-50/50 p-2 rounded border border-amber-100 text-amber-900">
                    <Scale className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
                    <span><strong>Base Legal:</strong> {q.legalBase}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="bg-neutral-50 border-t border-neutral-200 p-3.5 flex items-center justify-between text-xs text-neutral-600 shrink-0">
          <span>Material de apoio para conselhos de classe e reuniões de pais</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 font-medium bg-neutral-900 text-white rounded-md hover:bg-neutral-800 transition-colors"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
