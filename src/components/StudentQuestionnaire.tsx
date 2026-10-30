import React, { useState, useRef } from 'react';
import { Question, OptionValue, StudentInfo, FormTheme } from '../types/form';
import { GRADE_OPTIONS, SHIFT_OPTIONS } from '../data/questions';
import { 
  AlertCircle, 
  RotateCcw, 
  Send, 
  ShieldCheck, 
  Check, 
  HelpCircle,
  School,
  Lock,
  ChevronDown
} from 'lucide-react';

interface StudentQuestionnaireProps {
  questions: Question[];
  theme: FormTheme;
  onSubmit: (studentInfo: StudentInfo, answers: Record<number, OptionValue>) => Promise<void> | void;
  showLegalHelp: boolean;
}

export const StudentQuestionnaire: React.FC<StudentQuestionnaireProps> = ({
  questions,
  theme,
  onSubmit,
  showLegalHelp
}) => {
  // Student info state
  const [grade, setGrade] = useState<string>(GRADE_OPTIONS[0]);
  const [shift, setShift] = useState<string>('Matutino (Manhã)');
  const [studentName, setStudentName] = useState<string>('');
  const [isAnonymous, setIsAnonymous] = useState<boolean>(true);

  // Form answers state
  const [answers, setAnswers] = useState<Record<number, OptionValue>>({});
  
  // Focused question card
  const [focusedId, setFocusedId] = useState<number | 'header' | 'studentInfo' | null>(1);

  // Validation errors
  const [errors, setErrors] = useState<Record<number, boolean>>({});
  const [infoError, setInfoError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showClearConfirm, setShowClearConfirm] = useState<boolean>(false);

  // Question refs for auto-scroll on validation error
  const questionRefs = useRef<Record<number, HTMLDivElement | null>>({});

  const handleSelectOption = (questionId: number, val: OptionValue) => {
    setAnswers(prev => ({ ...prev, [questionId]: val }));
    if (errors[questionId]) {
      setErrors(prev => ({ ...prev, [questionId]: false }));
    }
    setFocusedId(questionId);
  };

  const handleClearOption = (questionId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setAnswers(prev => {
      const copy = { ...prev };
      delete copy[questionId];
      return copy;
    });
  };

  const handleClearAll = () => {
    setAnswers({});
    setStudentName('');
    setIsAnonymous(true);
    setErrors({});
    setInfoError(null);
    setShowClearConfirm(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const answeredCount = Object.keys(answers).length;
  const totalQuestions = questions.length;
  const progressPercent = Math.round((answeredCount / totalQuestions) * 100);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setInfoError(null);

    // Validate student info
    if (!grade) {
      setInfoError('Por favor, selecione sua turma/série.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // Validate mandatory questions
    const newErrors: Record<number, boolean> = {};
    let firstMissingId: number | null = null;

    questions.forEach(q => {
      if (q.required && !answers[q.id]) {
        newErrors[q.id] = true;
        if (!firstMissingId) {
          firstMissingId = q.id;
        }
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      if (firstMissingId && questionRefs.current[firstMissingId]) {
        questionRefs.current[firstMissingId]?.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
        setFocusedId(firstMissingId);
      }
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(
        {
          grade,
          shift,
          studentName: isAnonymous ? undefined : studentName.trim(),
          isAnonymous
        },
        answers
      );
    } catch (err: any) {
      console.error('Falha no envio do questionário:', err);
      setInfoError('Houve uma falha de comunicação ao registrar o questionário. Verifique sua conexão e tente clicar em Enviar novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const optionLabels: OptionValue[] = ['Sim', 'Não', 'Talvez'];

  return (
    <div className="max-w-3xl mx-auto px-3 sm:px-4 py-6 sm:py-8 space-y-4">
      {/* 1. Header Card (Title & Intro) */}
      <div 
        onClick={() => setFocusedId('header')}
        className={`bg-white rounded-lg border border-[#dadce0] overflow-hidden shadow-xs transition-shadow relative ${
          focusedId === 'header' ? 'ring-1 ring-neutral-300' : ''
        }`}
      >
        {/* Top colored strip (signature Google Forms banner) */}
        <div 
          className="h-2.5 sm:h-3 w-full"
          style={{ backgroundColor: theme.primaryColor }}
        />

        <div className="p-5 sm:p-7 space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-purple-700 mb-1">
                <School className="w-4 h-4 text-purple-700" />
                <span>Escola Silvio Oliveira dos Santos · Convivência &amp; Paz Escolar</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-medium text-[#202124] tracking-tight">
                Questionário: Convivência Escolar, Bullying e Segurança
              </h2>
            </div>
          </div>

          <div className="text-sm text-neutral-700 space-y-2.5 leading-relaxed border-t border-[#f1f3f4] pt-4">
            <p>
              Prezado(a) estudante da <strong>Escola Silvio Oliveira dos Santos</strong>, este questionário tem como objetivo avaliar o conhecimento e a percepção da nossa comunidade escolar acerca de situações de violência, intimidação sistemática (bullying), agressões verbais/físicas, trotes e cyberbullying.
            </p>
            <p className="text-neutral-600">
              Suas respostas são confidenciais e fundamentais para nortear ações de acolhimento, proteção e prevenção na escola. Todas as perguntas são embasadas no <strong>Programa de Combate ao Bullying (Lei nº 13.185/2015)</strong> e na <strong>Lei nº 14.811/2024</strong>.
            </p>
          </div>

          <div className="bg-[#f8f9fa] rounded-md p-3.5 border border-[#e8eaed] text-xs text-neutral-700 flex items-start gap-2.5">
            <Lock className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-neutral-900">Privacidade Garantida: </span>
              Você pode responder de forma totalmente anônima. Suas opiniões sinceras nos ajudam a manter um ambiente seguro e acolhedor para todos.
            </div>
          </div>

          <div className="border-t border-[#dadce0] pt-3 text-xs text-[#d93025] font-medium flex items-center gap-1">
            <span>* Indica que a pergunta é obrigatória</span>
          </div>
        </div>
      </div>

      {/* 2. Student Identification Card */}
      <div 
        onClick={() => setFocusedId('studentInfo')}
        className={`bg-white rounded-lg border border-[#dadce0] p-5 sm:p-6 shadow-xs transition-all relative ${
          focusedId === 'studentInfo' ? 'border-l-4' : ''
        }`}
        style={{
          borderLeftColor: focusedId === 'studentInfo' ? theme.primaryColor : undefined
        }}
      >
        <div className="flex items-center gap-2 text-base font-medium text-[#202124] mb-4">
          <ShieldCheck className="w-5 h-5 text-purple-700" />
          <span>Identificação do Participante</span>
        </div>

        {infoError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-md flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{infoError}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Turma / Série */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
              Sua Turma / Ano Escolar <span className="text-[#d93025]">*</span>
            </label>
            <div className="relative">
              <select
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className="w-full bg-[#f8f9fa] border border-[#dadce0] rounded-md px-3 py-2 text-sm text-[#202124] focus:outline-hidden focus:border-purple-600 focus:bg-white transition-colors appearance-none pr-9 cursor-pointer font-medium"
              >
                <optgroup label="Ensino Médio (1º, 2º e 3º Anos - Turmas A até H)">
                  {GRADE_OPTIONS.filter(o => o.includes('1º Ano') || o.includes('2º Ano') || o.includes('3º Ano')).map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </optgroup>
                <optgroup label="Ensino Fundamental (6º, 7º, 8º e 9º Anos - Turmas A até H)">
                  {GRADE_OPTIONS.filter(o => o.includes('6º Ano') || o.includes('7º Ano') || o.includes('8º Ano') || o.includes('9º Ano')).map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </optgroup>
                <optgroup label="Outras Modalidades">
                  {GRADE_OPTIONS.filter(o => !o.includes('º Ano')).map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </optgroup>
              </select>
              <ChevronDown className="w-4 h-4 text-neutral-500 absolute right-3 top-2.5 pointer-events-none" />
            </div>

            {/* Quick shortcuts including A through H */}
            <div className="mt-2.5 space-y-1.5">
              <div className="flex items-center justify-between text-[11px] text-neutral-500 font-medium">
                <span>Atalhos rápidos para turmas:</span>
                <span className="text-purple-700 font-semibold">{grade}</span>
              </div>
              
              {/* 1º Ano A-H */}
              <div className="flex flex-wrap items-center gap-1">
                <span className="text-[10px] font-bold text-neutral-400 w-12">1º Ano:</span>
                {[
                  "1º Ano A (1º A)", "1º Ano B (1º B)", "1º Ano C (1º C)", "1º Ano D (1º D)",
                  "1º Ano E (1º E)", "1º Ano F (1º F)", "1º Ano G (1º G)", "1º Ano H (1º H)"
                ].map(opt => {
                  const letter = opt.match(/\(1º (.*?)\)/)?.[1] || opt;
                  const isSelected = grade === opt;
                  return (
                    <button
                      type="button"
                      key={opt}
                      onClick={() => setGrade(opt)}
                      title={opt}
                      className={`px-2 py-0.5 text-[11px] font-semibold rounded transition-colors ${
                        isSelected
                          ? 'bg-purple-700 text-white shadow-xs'
                          : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                      }`}
                    >
                      1º {letter}
                    </button>
                  );
                })}
              </div>

              {/* 2º, 3º e 9º Anos G e H */}
              <div className="flex flex-wrap items-center gap-1">
                <span className="text-[10px] font-bold text-neutral-400 w-12">G e H:</span>
                {[
                  "2º Ano G (2º G)", "2º Ano H (2º H)",
                  "3º Ano G (3º G)", "3º Ano H (3º H)",
                  "9º Ano G (9º G)", "9º Ano H (9º H)"
                ].map(opt => {
                  const shortLabel = opt.match(/\((.*?)\)/)?.[1] || opt;
                  const isSelected = grade === opt;
                  return (
                    <button
                      type="button"
                      key={opt}
                      onClick={() => setGrade(opt)}
                      className={`px-2 py-0.5 text-[11px] font-medium rounded transition-colors ${
                        isSelected
                          ? 'bg-purple-700 text-white font-semibold shadow-xs'
                          : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                      }`}
                    >
                      {shortLabel}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Turno */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
              Turno de Estudo <span className="text-[#d93025]">*</span>
            </label>
            <div className="relative">
              <select
                value={shift}
                onChange={(e) => setShift(e.target.value)}
                className="w-full bg-[#f8f9fa] border border-[#dadce0] rounded-md px-3 py-2 text-sm text-[#202124] focus:outline-hidden focus:border-purple-600 focus:bg-white transition-colors appearance-none pr-9 cursor-pointer"
              >
                {SHIFT_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-neutral-500 absolute right-3 top-2.5 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Anonimato vs Nome */}
        <div className="mt-4 pt-4 border-t border-[#f1f3f4] space-y-3">
          <label className="flex items-center gap-2.5 cursor-pointer text-xs text-neutral-800 select-none">
            <input
              type="checkbox"
              checked={isAnonymous}
              onChange={(e) => {
                setIsAnonymous(e.target.checked);
                if (e.target.checked) setStudentName('');
              }}
              className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 border-neutral-300 cursor-pointer"
            />
            <span className="font-medium">
              Responder de forma anônima (recomendado para maior conforto)
            </span>
          </label>

          {!isAnonymous && (
            <div className="pt-1">
              <label className="block text-xs text-neutral-600 mb-1">
                Nome do Aluno (Opcional):
              </label>
              <input
                type="text"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="Digite seu nome (ou deixe em branco se preferir)"
                className="w-full sm:w-80 bg-[#f8f9fa] border-b-2 border-neutral-300 focus:border-purple-600 focus:bg-white px-2 py-1.5 text-sm outline-hidden transition-colors"
              />
            </div>
          )}
        </div>
      </div>

      {/* 3. The 15 Question Cards */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {questions.map((question) => {
          const isFocused = focusedId === question.id;
          const hasError = errors[question.id];
          const selectedValue = answers[question.id];

          return (
            <div
              key={question.id}
              ref={(el) => {
                questionRefs.current[question.id] = el;
              }}
              onClick={() => setFocusedId(question.id)}
              className={`bg-white rounded-lg border p-5 sm:p-6 shadow-xs transition-all relative ${
                hasError 
                  ? 'border-[#d93025] bg-red-50/20' 
                  : isFocused 
                    ? 'border-[#dadce0] shadow-md border-l-4' 
                    : 'border-[#dadce0] hover:border-neutral-300'
              }`}
              style={{
                borderLeftColor: isFocused && !hasError ? theme.primaryColor : hasError ? '#d93025' : undefined
              }}
            >
              {/* Question Header */}
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex items-start gap-2 text-base text-[#202124] leading-relaxed">
                  <span className="font-medium text-neutral-900 select-none">
                    {question.id}.
                  </span>
                  <span className="text-[#202124]">
                    {question.text.replace(/^\d+\.\s*/, '')}
                    {question.required && (
                      <span className="text-[#d93025] ml-1 select-none font-bold">*</span>
                    )}
                  </span>
                </div>
              </div>

              {/* Radio Options (Sim, Não, Talvez) */}
              <div className="space-y-2.5 my-3">
                {optionLabels.map((option) => {
                  const isChecked = selectedValue === option;

                  return (
                    <label
                      key={option}
                      className={`flex items-center gap-3.5 p-2.5 rounded-lg cursor-pointer transition-colors group select-none ${
                        isChecked 
                          ? 'bg-purple-50/60 font-medium text-neutral-900' 
                          : 'hover:bg-neutral-50 text-neutral-800'
                      }`}
                      onClick={() => handleSelectOption(question.id, option)}
                    >
                      {/* Google Forms Styled Radio Button */}
                      <div className="relative flex items-center justify-center w-5 h-5 shrink-0">
                        <div 
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                            isChecked
                              ? 'border-purple-700 bg-white'
                              : 'border-neutral-400 group-hover:border-neutral-600'
                          }`}
                          style={{
                            borderColor: isChecked ? theme.primaryColor : undefined
                          }}
                        >
                          {isChecked && (
                            <div 
                              className="w-2.5 h-2.5 rounded-full"
                              style={{ backgroundColor: theme.primaryColor }}
                            />
                          )}
                        </div>
                      </div>

                      <span className="text-sm tracking-tight">{option}</span>
                    </label>
                  );
                })}
              </div>

              {/* Error feedback if required and skipped */}
              {hasError && (
                <div className="flex items-center gap-1.5 text-xs text-[#d93025] font-medium mt-3 pt-2 border-t border-red-100">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>Esta pergunta é obrigatória</span>
                </div>
              )}

              {/* Clear selection on this question (authentic Google Forms feature) */}
              <div className="flex items-center justify-between text-xs text-neutral-500 pt-3 border-t border-[#f1f3f4] mt-3">
                {selectedValue ? (
                  <button
                    type="button"
                    onClick={(e) => handleClearOption(question.id, e)}
                    className="hover:text-neutral-800 hover:underline transition-colors font-medium text-neutral-600"
                  >
                    Limpar seleção
                  </button>
                ) : (
                  <span className="text-neutral-400 italic">Selecione uma opção</span>
                )}

                {showLegalHelp && question.legalBase && (
                  <span className="text-neutral-500 text-[11px] truncate max-w-xs" title={question.legalBase}>
                    {question.legalBase}
                  </span>
                )}
              </div>
            </div>
          );
        })}

        {/* Floating / Sticky Bottom Progress & Actions Bar */}
        <div className="bg-white rounded-lg border border-[#dadce0] p-4 sm:p-5 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-neutral-600">
            <div>
              <span className="font-semibold text-neutral-800">
                Progresso: {answeredCount} de {totalQuestions} perguntas respondidas
              </span>
              <span className="text-neutral-400 mx-2">·</span>
              <span>{progressPercent}% concluído</span>
            </div>
            
            {answeredCount === totalQuestions && (
              <span className="text-emerald-700 font-medium flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Pronto para enviar!
              </span>
            )}
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-neutral-100 h-2 rounded-full overflow-hidden">
            <div 
              className="h-full transition-all duration-300 rounded-full"
              style={{
                width: `${progressPercent}%`,
                backgroundColor: theme.primaryColor
              }}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-semibold text-white rounded-md shadow-xs hover:shadow-md transition-all active:scale-[0.99] disabled:opacity-70 cursor-pointer"
              style={{ backgroundColor: theme.primaryColor }}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Enviando resposta...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Enviar Questionário</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => setShowClearConfirm(true)}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-neutral-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Limpar formulário</span>
            </button>
          </div>
        </div>
      </form>

      {/* Confirmation Modal to Clear Form */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-5 space-y-4">
            <h4 className="text-base font-medium text-neutral-900">
              Limpar formulário?
            </h4>
            <p className="text-xs text-neutral-600 leading-relaxed">
              Esta ação removerá todas as respostas assinaladas e você terá que preencher novamente desde o início.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-100 rounded-md transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleClearAll}
                className="px-3.5 py-1.5 text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors shadow-xs"
              >
                Sim, limpar tudo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Authentic Google Forms Footer */}
      <footer className="text-center text-xs text-neutral-500 py-6 space-y-2">
        <p>Nunca envie senhas através do Formulários Google.</p>
        <div className="flex items-center justify-center gap-3 text-neutral-400">
          <span>Google Formulários</span>
          <span>·</span>
          <span>Pesquisa Institucional</span>
          <span>·</span>
          <span>Lei 13.185/2015</span>
        </div>
      </footer>
    </div>
  );
};
