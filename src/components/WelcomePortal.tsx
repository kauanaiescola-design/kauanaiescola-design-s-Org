import React from 'react';
import { FormTheme, UserProfile } from '../types/form';
import { 
  School, 
  GraduationCap, 
  UserCheck, 
  Lock, 
  ShieldCheck, 
  ArrowRight, 
  BookOpen, 
  CheckCircle2,
  User,
  LogOut,
  Database
} from 'lucide-react';
import { FIRESTORE_DATABASE_ID } from '../firebase';

interface WelcomePortalProps {
  theme: FormTheme;
  responseCount: number;
  currentUser: UserProfile | null;
  onEnterAsStudent: () => void;
  onEnterAsTeacher: () => void;
  onLogout: () => void;
  onOpenGuide: () => void;
}

export const WelcomePortal: React.FC<WelcomePortalProps> = ({
  theme,
  responseCount,
  currentUser,
  onEnterAsStudent,
  onEnterAsTeacher,
  onLogout,
  onOpenGuide
}) => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12 space-y-8 animate-in fade-in duration-300">
      {/* Top Welcome Hero Card */}
      <div className="bg-white rounded-2xl border border-[#dadce0] overflow-hidden shadow-sm">
        {/* Top colored decorative Google Forms bar */}
        <div 
          className="h-3 w-full"
          style={{ backgroundColor: theme.primaryColor }}
        />

        <div className="p-6 sm:p-10 space-y-4 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
            <div 
              className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-xs"
              style={{ backgroundColor: `${theme.primaryColor}15` }}
            >
              <School className="w-8 h-8" style={{ color: theme.primaryColor }} />
            </div>

            <div className="space-y-1.5 flex-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800">
                <span>Escola Silvio Oliveira dos Santos · Formulário Oficial 2026</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-semibold text-[#202124] tracking-tight">
                Escola Silvio Oliveira dos Santos
              </h1>
              <p className="text-sm text-neutral-600 leading-relaxed max-w-2xl">
                Pesquisa Diagnóstica de Convivência, Combate ao Bullying e Segurança no Ambiente Escolar (Leis nº 13.185/2015 e 14.811/2024).
              </p>
            </div>
          </div>

          <div className="border-t border-[#f1f3f4] pt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-neutral-500">
            <div className="flex flex-wrap items-center gap-3">
              <span className="flex items-center gap-1 text-emerald-600 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" /> 15 Questões Interativas
              </span>
              <span>·</span>
              <span className="flex items-center gap-1 text-neutral-600 font-mono text-[11px] bg-neutral-100 px-2 py-0.5 rounded border border-neutral-200">
                <Database className="w-3 h-3 text-purple-600" />
                <span>DB: {FIRESTORE_DATABASE_ID}</span>
              </span>
            </div>

            <button
              onClick={onOpenGuide}
              className="text-purple-700 hover:text-purple-900 font-medium flex items-center gap-1 hover:underline cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Ver Guia Pedagógico &amp; Legal</span>
            </button>
          </div>
        </div>
      </div>

      {/* Profile Selection Grid (Aluno vs Professor) */}
      <div className="space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-500 text-center sm:text-left px-1">
          Selecione seu perfil para continuar:
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* 1. MODO ALUNO (Acesso Direto e Exclusivo às Perguntas) */}
          <div className="bg-white rounded-xl border-2 border-purple-200/80 hover:border-purple-600 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shadow-xs">
                  <UserCheck className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full">
                  Livre para Alunos
                </span>
              </div>

              <div>
                <h3 className="text-lg font-bold text-neutral-900 group-hover:text-purple-700 transition-colors">
                  Sou Aluno / Estudante
                </h3>
                <p className="text-xs text-neutral-600 mt-1.5 leading-relaxed">
                  Acesse diretamente o questionário de 15 perguntas para registrar suas respostas com total confidencialidade e segurança.
                </p>
              </div>

              <div className="space-y-1.5 text-xs text-neutral-600 bg-neutral-50 p-3 rounded-lg border border-neutral-100">
                <div className="flex items-center gap-2 text-neutral-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>Acesso apenas às perguntas (sem dados ou relatórios)</span>
                </div>
                <div className="flex items-center gap-2 text-neutral-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>Opção de envio 100% anônimo</span>
                </div>
                <div className="flex items-center gap-2 text-neutral-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>Selecione sua turma: 1º A, B, C; 2º A, B, C; 3º A, B, C...</span>
                </div>
              </div>
            </div>

            <div className="pt-6">
              <button
                onClick={onEnterAsStudent}
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold text-white rounded-lg shadow-xs hover:opacity-95 active:scale-[0.99] transition-all cursor-pointer"
                style={{ backgroundColor: theme.primaryColor }}
              >
                <span>Entrar como Aluno (Responder)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 2. MODO PROFESSOR & DIREÇÃO (Acesso Unificado via Código Institucional) */}
          <div className="bg-white rounded-xl border-2 border-neutral-200 hover:border-neutral-900 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shadow-xs">
                  <GraduationCap className="w-6 h-6" />
                </div>
                {currentUser ? (
                  <span className="text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Acesso Liberado
                  </span>
                ) : (
                  <span className="text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Lock className="w-3 h-3" /> Exclusivo com Código
                  </span>
                )}
              </div>

              <div>
                <h3 className="text-lg font-bold text-neutral-900 group-hover:text-neutral-950 transition-colors">
                  Sou Professor(a) / Diretor(a)
                </h3>
                <p className="text-xs text-neutral-600 mt-1.5 leading-relaxed">
                  Área única e restrita para professores e equipe diretiva acompanharem em tempo real o recebimento das respostas e o banco de dados.
                </p>
              </div>

              {currentUser ? (
                <div className="space-y-2 text-xs text-neutral-700 bg-emerald-50/60 p-3 rounded-lg border border-emerald-200/60">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-emerald-900 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-emerald-700" />
                      {currentUser.displayName || 'Professor(a) / Diretor(a)'}
                    </span>
                    <button
                      onClick={onLogout}
                      className="text-[11px] text-red-600 hover:text-red-800 font-medium underline flex items-center gap-0.5 cursor-pointer"
                    >
                      <LogOut className="w-3 h-3" /> Sair
                    </button>
                  </div>
                  <div className="text-[11px] text-neutral-600">
                    Cargo: <strong>{currentUser.role || 'Professor(a) / Diretor(a)'}</strong> · {currentUser.schoolName || 'Escola'}
                  </div>
                  <div className="text-[11px] text-emerald-800">
                    {responseCount} respostas computadas no sistema.
                  </div>
                </div>
              ) : (
                <div className="space-y-1.5 text-xs text-neutral-600 bg-neutral-50 p-3 rounded-lg border border-neutral-100">
                  <div className="flex items-center gap-2 text-neutral-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-600" />
                    <span>Entrada liberada apenas com o código institucional</span>
                  </div>
                  <div className="flex items-center gap-2 text-neutral-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-600" />
                    <span>Gráficos por turma (1º, 2º, 3º e Fundamental)</span>
                  </div>
                  <div className="flex items-center gap-2 text-neutral-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-600" />
                    <span>Tabelas de respostas, exclusão e sincronização Supabase</span>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-6">
              <button
                onClick={onEnterAsTeacher}
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg shadow-xs active:scale-[0.99] transition-all cursor-pointer"
              >
                {currentUser ? (
                  <>
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Acessar Painel Professor & Direção</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4 text-amber-400" />
                    <span>Entrar com Código Institucional</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Safety Notice Footer */}
      <div className="bg-white/80 rounded-xl p-4 border border-[#dadce0] text-center text-xs text-neutral-500 space-y-1">
        <p className="font-medium text-neutral-700">
          Garantia de Sigilo e Proteção ao Estudante
        </p>
        <p>
          Os alunos têm acesso exclusivo e restrito ao questionário de respostas. Nenhum aluno tem acesso ao painel de respostas ou configurações da escola.
        </p>
      </div>
    </div>
  );
};
