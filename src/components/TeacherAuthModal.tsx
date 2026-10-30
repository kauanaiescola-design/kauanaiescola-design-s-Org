import React, { useState, useEffect } from 'react';
import { FormTheme, UserProfile } from '../types/form';
import { 
  KeyRound, 
  ShieldCheck, 
  X, 
  AlertCircle, 
  Check, 
  Lock, 
  ArrowRight, 
  ClipboardPaste,
  Eye,
  EyeOff,
  School,
  GraduationCap
} from 'lucide-react';

interface TeacherAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (profile?: UserProfile) => void;
  theme: FormTheme;
}

export const VALID_ACCESS_CODE = 'adm.silvio';

export const TeacherAuthModal: React.FC<TeacherAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  theme
}) => {
  const [accessCode, setAccessCode] = useState('');
  const [showCode, setShowCode] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [pastedNotification, setPastedNotification] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setAccessCode('');
      setShowCode(false);
      setErrorMessage(null);
      setIsSuccess(false);
      setPastedNotification(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handlePasteFromClipboard = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        if (text && text.trim()) {
          setAccessCode(text.trim());
          setErrorMessage(null);
          setPastedNotification('Código colado com sucesso!');
          setTimeout(() => setPastedNotification(null), 2500);
          return;
        }
      }
    } catch {
      // Clipboard blocked by browser permission
    }
    setPastedNotification('Cole o código com o atalho Ctrl+V');
    setTimeout(() => setPastedNotification(null), 3000);
  };

  const handleCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = accessCode.trim().toLowerCase();

    if (!cleanCode) {
      setErrorMessage('Por favor, digite ou cole o código institucional de acesso.');
      return;
    }

    if (cleanCode === VALID_ACCESS_CODE) {
      setErrorMessage(null);
      setIsSuccess(true);

      const staffProfile: UserProfile = {
        uid: 'staff-adm-silvio',
        email: 'gestao@silviooliveira.edu.br',
        displayName: 'Professor(a) / Diretor(a)',
        role: 'Professor(a) / Diretor(a)',
        schoolName: 'Escola Silvio Oliveira dos Santos',
        createdAt: new Date().toISOString()
      };

      try {
        localStorage.setItem('auth_teacher_session', JSON.stringify(staffProfile));
      } catch {
        // ignore
      }

      setTimeout(() => {
        onSuccess(staffProfile);
      }, 400);
    } else {
      setErrorMessage('Código de acesso incorreto. Apenas professores e diretores com o código institucional podem acessar.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-neutral-200 overflow-hidden transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Theme Color Accent */}
        <div 
          className="p-6 text-white relative"
          style={{ backgroundColor: theme.primaryColor }}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-black/20 text-white/90 hover:text-white transition-colors cursor-pointer"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center shadow-inner">
              <KeyRound className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-white/90 bg-white/15 px-2 py-0.5 rounded-full mb-1">
                <GraduationCap className="w-3 h-3" />
                <span>Escola Silvio Oliveira dos Santos</span>
              </div>
              <h2 className="text-xl font-bold tracking-tight text-white">
                Área de Professores &amp; Direção
              </h2>
              <p className="text-xs text-white/90 mt-0.5">
                Acesso institucional restrito mediante código de segurança
              </p>
            </div>
          </div>
        </div>

        {/* Body Content */}
        <div className="p-6">
          <form onSubmit={handleCodeSubmit} className="space-y-5">
            {/* Instruction Card */}
            <div className="bg-purple-50/70 border border-purple-200/80 rounded-xl p-3.5 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-purple-700 shrink-0 mt-0.5" />
              <div className="text-xs text-purple-950 leading-relaxed">
                <span className="font-semibold block text-purple-900 mb-0.5">
                  Área Unificada para Professores e Direção
                </span>
                O acesso ao painel de gestão, relatórios e controle do banco de dados é restrito à equipe escolar autorizada portadora do código de segurança institucional.
              </div>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-700 animate-in fade-in duration-150">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <div className="flex-1 font-medium">{errorMessage}</div>
              </div>
            )}

            {/* Success Notification */}
            {isSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2.5 text-xs text-emerald-800 font-semibold animate-in fade-in duration-150">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Código confirmado! Liberando acesso ao painel...</span>
              </div>
            )}

            {/* Code Input Field */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-neutral-700 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-neutral-500" />
                  Código de Acesso Institucional:
                </label>
                
                <button
                  type="button"
                  onClick={handlePasteFromClipboard}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-purple-700 hover:text-purple-900 hover:underline cursor-pointer"
                  title="Colar da área de transferência"
                >
                  <ClipboardPaste className="w-3.5 h-3.5" />
                  <span>Colar Código</span>
                </button>
              </div>

              <div className="relative">
                <input
                  type={showCode ? 'text' : 'password'}
                  value={accessCode}
                  onChange={(e) => {
                    setAccessCode(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  placeholder="Digite ou cole o código institucional..."
                  autoFocus
                  className="w-full px-4 py-3 pr-20 bg-neutral-50 border-2 border-neutral-300 focus:border-purple-600 focus:bg-white rounded-xl text-sm font-mono tracking-wide text-neutral-800 placeholder-neutral-400 outline-none transition-all shadow-inner"
                />

                <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  {accessCode && (
                    <button
                      type="button"
                      onClick={() => setAccessCode('')}
                      className="text-neutral-400 hover:text-neutral-600 p-1 cursor-pointer"
                      title="Limpar campo"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => setShowCode(!showCode)}
                    className="text-neutral-400 hover:text-neutral-700 p-1 cursor-pointer"
                    title={showCode ? 'Ocultar código' : 'Mostrar código'}
                  >
                    {showCode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {pastedNotification && (
                <p className="text-[11px] text-emerald-600 font-medium flex items-center gap-1 animate-in fade-in">
                  <Check className="w-3 h-3" /> {pastedNotification}
                </p>
              )}
            </div>

            {/* School info snippet */}
            <div className="flex items-center gap-2 text-[11px] text-neutral-500 pt-1 border-t border-neutral-100">
              <School className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
              <span>Colégio Estadual Modelo · Professores e Direção Escolar</span>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col gap-2">
              <button
                type="submit"
                disabled={isSuccess}
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold text-white rounded-xl shadow-md active:scale-[0.99] transition-all cursor-pointer disabled:opacity-70"
                style={{ backgroundColor: theme.primaryColor }}
              >
                <span>Confirmar Código e Entrar</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 text-xs font-medium text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors cursor-pointer"
              >
                Voltar ao Menu Principal
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
