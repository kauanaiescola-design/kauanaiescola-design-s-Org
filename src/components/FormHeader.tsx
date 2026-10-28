import React from 'react';
import { ActiveTab, FormTheme, UserProfile } from '../types/form';
import { 
  Palette, 
  Send, 
  FileSpreadsheet, 
  CheckCircle2, 
  FolderCheck, 
  Star, 
  BookOpen,
  Lock,
  GraduationCap,
  LogOut,
  Home,
  UserCheck,
  User,
  Database
} from 'lucide-react';

interface FormHeaderProps {
  currentRole: 'portal' | 'aluno' | 'professor';
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  responseCount: number;
  theme: FormTheme;
  currentUser: UserProfile | null;
  onOpenThemeModal: () => void;
  onOpenShareModal: () => void;
  onOpenSheetsModal: () => void;
  onOpenGuideModal: () => void;
  onReturnToPortal: () => void;
  onRequestTeacherAuth: () => void;
  onLogoutTeacher: () => void;
}

export const FormHeader: React.FC<FormHeaderProps> = ({
  currentRole,
  activeTab,
  setActiveTab,
  responseCount,
  theme,
  currentUser,
  onOpenThemeModal,
  onOpenShareModal,
  onOpenSheetsModal,
  onOpenGuideModal,
  onReturnToPortal,
  onRequestTeacherAuth,
  onLogoutTeacher
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-[#dadce0] shadow-xs">
      {/* Top Bar */}
      <div className="px-4 py-2 flex items-center justify-between gap-3 max-w-7xl mx-auto">
        <div className="flex items-center gap-3 min-w-0">
          {/* Authentic Google Forms Purple Icon */}
          <div 
            onClick={onReturnToPortal}
            className="w-10 h-10 rounded-md flex items-center justify-center shrink-0 shadow-xs cursor-pointer hover:opacity-90 transition-opacity"
            style={{ backgroundColor: theme.primaryColor }}
            title="Voltar ao Menu Principal"
          >
            <svg viewBox="0 0 24 24" className="w-6 h-6 text-white fill-current">
              <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
            </svg>
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-[17px] font-medium text-[#202124] truncate tracking-tight">
                Questionário: Convivência Escolar e Bullying
              </h1>
              {currentRole === 'professor' && (
                <span className="hidden sm:inline-flex items-center text-xs text-neutral-500 gap-1 ml-1" title="Sincronizado com Firebase Cloud Firestore">
                  <FolderCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <Star className="w-3.5 h-3.5 text-neutral-400 hover:text-amber-400 cursor-pointer transition-colors" />
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-2 text-[12px] text-neutral-600">
              {currentRole === 'aluno' ? (
                <span className="flex items-center gap-1.5 text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.2 rounded-full border border-emerald-200">
                  <UserCheck className="w-3 h-3" /> Modo Aluno Ativo · Apenas Perguntas
                </span>
              ) : currentRole === 'professor' ? (
                <>
                  <span className="flex items-center gap-1 text-purple-700 font-semibold bg-purple-50 px-2 py-0.2 rounded-full border border-purple-200">
                    <GraduationCap className="w-3 h-3" /> Painel do Professor & Direção
                  </span>
                  {currentUser && (
                    <span className="hidden md:inline-flex items-center gap-1 text-neutral-600 text-[11px]">
                      · <User className="w-3 h-3 text-neutral-400" /> {currentUser.displayName || 'Professor(a) / Diretor(a)'}
                    </span>
                  )}
                </>
              ) : (
                <span className="text-neutral-500">Menu Principal · Escolha Aluno ou Professor/Direção</span>
              )}
            </div>
          </div>
        </div>

        {/* Right Action Tools */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Button to Return to Main Menu / Portal */}
          {currentRole !== 'portal' && (
            <button
              onClick={onReturnToPortal}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-100 rounded-md transition-colors border border-neutral-200 cursor-pointer"
              title="Voltar ao Menu Principal"
            >
              <Home className="w-3.5 h-3.5 text-neutral-600" />
              <span className="hidden sm:inline">Menu Inicial</span>
            </button>
          )}

          {/* ALUNO VIEW: Access teacher/director portal */}
          {currentRole === 'aluno' && (
            <button
              onClick={onRequestTeacherAuth}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-md transition-colors cursor-pointer"
              title={currentUser ? "Acessar Painel Professor & Direção" : "Área do Professor & Direção (Acesso com Código)"}
            >
              <Lock className="w-3.5 h-3.5 text-amber-600" />
              <span className="hidden sm:inline">
                {currentUser ? "Painel Professor/Direção" : "Professor & Direção"}
              </span>
            </button>
          )}

          {/* PROFESSOR VIEW: Complete toolset */}
          {currentRole === 'professor' && (
            <>
              {/* Pedagogical Guide button */}
              <button
                onClick={onOpenGuideModal}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-100 rounded-md transition-colors cursor-pointer"
                title="Guia Pedagógico & Legislação (Leis 13.185/15 e 14.811/24)"
              >
                <BookOpen className="w-4 h-4 text-purple-600" />
                <span className="hidden lg:inline">Guia Legal</span>
              </button>

              {/* Theme customizer */}
              <button
                onClick={onOpenThemeModal}
                className="p-2 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-full transition-colors cursor-pointer"
                title="Personalizar tema"
              >
                <Palette className="w-5 h-5" />
              </button>

              {/* Sheets Quick Shortcut */}
              <button
                onClick={onOpenSheetsModal}
                className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-md border border-emerald-200 transition-colors cursor-pointer"
                title="Abrir no Google Planilhas"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span className="hidden md:inline">Planilhas</span>
              </button>

              {/* Send / Share button */}
              <button
                onClick={onOpenShareModal}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white rounded-md shadow-xs hover:opacity-90 transition-opacity cursor-pointer"
                style={{ backgroundColor: theme.primaryColor }}
                title="Compartilhar questionário com alunos"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Enviar Link</span>
              </button>

              {/* Logout button */}
              <button
                onClick={onLogoutTeacher}
                className="flex items-center gap-1 px-2.5 py-1.5 bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 rounded-md text-xs font-medium transition-colors cursor-pointer"
                title="Sair da conta Firebase e bloquear acesso"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sair</span>
              </button>
            </>
          )}

          {/* PORTAL VIEW: quick buttons */}
          {currentRole === 'portal' && (
            <>
              {currentUser && (
                <div className="hidden sm:flex items-center gap-1.5 text-xs text-neutral-700 bg-neutral-100 px-2.5 py-1 rounded-md">
                  <User className="w-3.5 h-3.5 text-purple-700" />
                  <span className="truncate max-w-[150px] font-medium">{currentUser.displayName || currentUser.email}</span>
                  <button
                    onClick={onLogoutTeacher}
                    className="text-red-600 hover:underline ml-1 font-semibold cursor-pointer"
                    title="Sair da conta"
                  >
                    (Sair)
                  </button>
                </div>
              )}

              <button
                onClick={onOpenGuideModal}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-100 rounded-md transition-colors cursor-pointer"
              >
                <BookOpen className="w-4 h-4 text-purple-600" />
                <span className="hidden sm:inline">Guia Legal</span>
              </button>

              <button
                onClick={onOpenThemeModal}
                className="p-2 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-full transition-colors cursor-pointer"
                title="Personalizar tema"
              >
                <Palette className="w-5 h-5" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Tabs Row (ONLY visible in PROFESSOR mode so the student NEVER sees any tabs!) */}
      {currentRole === 'professor' && (
        <div className="flex justify-center border-t border-[#f1f3f4] bg-white">
          <nav className="flex space-x-2 sm:space-x-8 px-4" aria-label="Abas de Gestão Escolar">
            <button
              onClick={() => setActiveTab('perguntas')}
              className={`py-3 px-3 text-sm font-medium transition-colors relative cursor-pointer ${
                activeTab === 'perguntas'
                  ? 'text-[#202124] font-semibold'
                  : 'text-neutral-500 hover:text-neutral-800'
              }`}
            >
              Perguntas do Questionário
              {activeTab === 'perguntas' && (
                <span 
                  className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t-full"
                  style={{ backgroundColor: theme.primaryColor }}
                />
              )}
            </button>

            <button
              onClick={() => setActiveTab('professor')}
              className={`py-3 px-3 text-sm font-medium transition-colors relative flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'professor'
                  ? 'text-[#202124] font-semibold'
                  : 'text-neutral-500 hover:text-neutral-800'
              }`}
            >
              <div className="flex items-center gap-1">
                <GraduationCap className="w-4 h-4 text-purple-700" />
                <span>Respostas &amp; Gráficos por Turma</span>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                activeTab === 'professor' 
                  ? 'bg-purple-100 text-purple-800' 
                  : 'bg-neutral-100 text-neutral-600'
              }`}>
                {responseCount}
              </span>
              {activeTab === 'professor' && (
                <span 
                  className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t-full"
                  style={{ backgroundColor: theme.primaryColor }}
                />
              )}
            </button>

            <button
              onClick={() => setActiveTab('tabelas')}
              className={`py-3 px-3 text-sm font-medium transition-colors relative flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'tabelas'
                  ? 'text-[#202124] font-semibold'
                  : 'text-neutral-500 hover:text-neutral-800'
              }`}
            >
              <div className="flex items-center gap-1">
                <Database className="w-4 h-4 text-purple-700" />
                <span>Banco de Dados (Tabelas &amp; Linhas)</span>
              </div>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full font-bold bg-emerald-100 text-emerald-800">
                Supabase SQL
              </span>
              {activeTab === 'tabelas' && (
                <span 
                  className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t-full"
                  style={{ backgroundColor: theme.primaryColor }}
                />
              )}
            </button>

            <button
              onClick={() => setActiveTab('configuracoes')}
              className={`py-3 px-3 text-sm font-medium transition-colors relative cursor-pointer ${
                activeTab === 'configuracoes'
                  ? 'text-[#202124] font-semibold'
                  : 'text-neutral-500 hover:text-neutral-800'
              }`}
            >
              Configurações
              {activeTab === 'configuracoes' && (
                <span 
                  className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t-full"
                  style={{ backgroundColor: theme.primaryColor }}
                />
              )}
            </button>
          </nav>
        </div>
      )}
    </header>
  );
};
