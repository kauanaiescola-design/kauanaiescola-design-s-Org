/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ActiveTab, FormTheme, FormSubmission, StudentInfo, OptionValue, UserProfile } from './types/form';
import { QUESTIONS_DATA, THEMES, INITIAL_SEED_RESPONSES, GRADE_OPTIONS } from './data/questions';
import { CheckCircle2, AlertTriangle } from 'lucide-react';
import { WelcomePortal } from './components/WelcomePortal';
import { FormHeader } from './components/FormHeader';
import { StudentQuestionnaire } from './components/StudentQuestionnaire';
import { ResponsesDashboard } from './components/ResponsesDashboard';
import { ConfirmationScreen } from './components/ConfirmationScreen';
import { SettingsTab } from './components/SettingsTab';
import { SheetsModal } from './components/SheetsModal';
import { ThemeModal } from './components/ThemeModal';
import { ShareModal } from './components/ShareModal';
import { PedagogicalGuideModal } from './components/PedagogicalGuideModal';
import { TeacherAuthModal } from './components/TeacherAuthModal';
import { DatabaseTablesView } from './components/DatabaseTablesView';
import { ClearConfirmModal } from './components/ClearConfirmModal';
import { 
  saveSubmissionToSupabase, 
  deleteSubmissionFromSupabase,
  clearAllSubmissionsFromSupabase,
  fetchSubmissionsFromSupabase,
  subscribeToSubmissions as subscribeToSupabaseSubmissions, 
  seedInitialSubmissionsIfEmpty,
  logoutUser
} from './supabase';
import { 
  saveSubmissionToFirestore, 
  deleteSubmissionFromFirestore,
  clearAllSubmissionsFromFirestore,
  subscribeToSubmissions as subscribeToFirestoreSubmissions,
  fetchSubmissionsFromFirestore
} from './firebase';

const STORAGE_KEY = 'escola_bullying_form_submissions_v4_prod';
const THEME_STORAGE_KEY = 'escola_bullying_form_theme_v3';

// Fixtures estáticas de demonstração legadas
const LEGACY_MOCK_IDS = new Set([
  'resp-001', 'resp-002', 'resp-003', 'resp-004', 'resp-005', 'resp-006',
  'resp-007', 'resp-008', 'resp-009', 'resp-010', 'resp-011', 'resp-012'
]);

// Identifica se uma resposta é estritamente fixture mock legada (NUNCA filtra respostas reais de alunos)
const isTestSubmission = (s: FormSubmission) => {
  if (!s || !s.id) return false;
  // Apenas as 12 fixtures estáticas iniciais exatas ou simulações antigas
  if (LEGACY_MOCK_IDS.has(s.id)) return true;
  if (s.id.startsWith('mock-seed-') || s.id.startsWith('simulated-legacy-')) return true;
  return false;
};

export default function App() {
  const [theme, setTheme] = useState<FormTheme>(() => {
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return THEMES[0];
  });

  // Current Role: 'portal' (Welcome Screen), 'aluno' (Pure Questionnaire), 'professor' (Full Dashboard)
  const [currentRole, setCurrentRole] = useState<'portal' | 'aluno' | 'professor'>('portal');

  const [activeTab, setActiveTab] = useState<ActiveTab>('professor');
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  // Authenticated User Profile (Firebase Auth & Cloud Firestore)
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem('auth_teacher_session');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return null;
  });
  const [isTeacherAuthModalOpen, setIsTeacherAuthModalOpen] = useState<boolean>(false);

  // Submissions state (Inicia limpo, sem respostas testes)
  const [submissions, setSubmissions] = useState<FormSubmission[]>(() => {
    try {
      // Remove chaves antigas de testes
      localStorage.removeItem('escola_bullying_form_submissions_v3');
      localStorage.removeItem('escola_bullying_form_submissions_v2');
      localStorage.removeItem('escola_bullying_form_submissions');

      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed: FormSubmission[] = JSON.parse(saved);
        // Filtra e descarta qualquer resposta de teste
        return parsed.filter(s => !isTestSubmission(s));
      }
    } catch {
      // ignore
    }
    return [];
  });

  // Settings
  const [allowAnonymous, setAllowAnonymous] = useState<boolean>(true);
  const [showLegalHelp, setShowLegalHelp] = useState<boolean>(false);
  const [confirmationMessage, setConfirmationMessage] = useState<string>(
    'Sua resposta foi registrada com sucesso.'
  );

  // Modals
  const [isSheetsModalOpen, setIsSheetsModalOpen] = useState<boolean>(false);
  const [isThemeModalOpen, setIsThemeModalOpen] = useState<boolean>(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);
  const [isGuideModalOpen, setIsGuideModalOpen] = useState<boolean>(false);
  const [isClearModalOpen, setIsClearModalOpen] = useState<boolean>(false);
  const [isClearingSubmissions, setIsClearingSubmissions] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Save submissions to localStorage
  useEffect(() => {
    try {
      const realOnly = submissions.filter(s => !isTestSubmission(s));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(realOnly));
    } catch (e) {
      console.warn('Could not save to localStorage', e);
    }
  }, [submissions]);

  // Sincronização em tempo real simultânea com Supabase e Firebase Firestore
  useEffect(() => {
    // Mescla dados de fontes remotas garantindo persistência sem perda nem duplicação
    const updateMergedSubmissions = (incoming: FormSubmission[]) => {
      if (!incoming || incoming.length === 0) return;
      const cleanIncoming = incoming.filter(s => !isTestSubmission(s));

      setSubmissions(prev => {
        const map = new Map<string, FormSubmission>();
        // Mantém respostas já no estado (incluindo as recém-submetidas localmente)
        prev.forEach(item => {
          if (item && item.id && !isTestSubmission(item)) {
            map.set(item.id, item);
          }
        });
        // Incorpora novas respostas remotas
        cleanIncoming.forEach(item => {
          if (item && item.id) {
            map.set(item.id, item);
          }
        });
        // Ordena mais recentes primeiro
        return Array.from(map.values()).sort((a, b) => b.id.localeCompare(a.id));
      });
    };

    // 1. Escuta Supabase Realtime
    const unsubscribeSupabase = subscribeToSupabaseSubmissions(
      (data) => {
        if (data) {
          updateMergedSubmissions(data);
        }
      },
      (err) => {
        console.warn('Aviso Supabase realtime:', err?.message || err);
      }
    );

    // 2. Escuta Firebase Firestore Realtime
    const unsubscribeFirestore = subscribeToFirestoreSubmissions(
      (data) => {
        if (data) {
          updateMergedSubmissions(data);
        }
      },
      (err) => {
        console.warn('Aviso Firestore realtime:', err?.message || err);
      }
    );

    return () => {
      unsubscribeSupabase();
      unsubscribeFirestore();
    };
  }, []);



  // Save theme
  const handleSelectTheme = (newTheme: FormTheme) => {
    setTheme(newTheme);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(newTheme));
    } catch {
      // ignore
    }
  };

  // Enter as Student from Portal
  const handleEnterAsStudent = () => {
    setCurrentRole('aluno');
    setIsSubmitted(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Enter as Teacher from Portal (opens login/register modal if not authenticated)
  const handleEnterAsTeacher = () => {
    if (currentUser) {
      setCurrentRole('professor');
      setActiveTab('professor');
      setIsSubmitted(false);
    } else {
      setIsTeacherAuthModalOpen(true);
    }
  };

  // Handle Teacher Authentication success (Firebase Auth & Firestore)
  const handleTeacherAuthSuccess = (profile?: UserProfile) => {
    if (profile) {
      setCurrentUser(profile);
    }
    setIsTeacherAuthModalOpen(false);
    setCurrentRole('professor');
    setActiveTab('professor');
    setIsSubmitted(false);
  };

  // Logout teacher / lock teacher area
  const handleLogoutTeacher = async () => {
    try {
      await logoutUser();
    } catch (err) {
      console.warn('Erro ao sair da conta:', err);
    }
    setCurrentUser(null);
    setCurrentRole('portal');
  };

  // Return to Portal
  const handleReturnToPortal = () => {
    setCurrentRole('portal');
    setIsSubmitted(false);
  };

  // Form submission handler (from student or preview)
  const handleFormSubmit = async (studentInfo: StudentInfo, answers: Record<number, OptionValue>) => {
    const now = new Date();
    const formattedDate = `${now.toLocaleDateString('pt-BR')}, ${now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;

    // Identificador único indelével para a resposta real do estudante
    const submissionId = `sub-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

    const newSub: FormSubmission = {
      id: submissionId,
      timestamp: formattedDate,
      studentInfo,
      answers
    };

    // 1. Atualiza estado imediatamente na memória para exibição instantânea
    setSubmissions(prev => {
      if (prev.some(s => s.id === newSub.id)) return prev;
      return [newSub, ...prev];
    });

    // 2. Salva no localStorage como cache seguro imediato
    try {
      const existing = localStorage.getItem(STORAGE_KEY);
      const parsed = existing ? JSON.parse(existing) : [];
      const updated = [newSub, ...parsed.filter((s: FormSubmission) => s.id !== newSub.id)];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('localStorage save notice:', e);
    }

    // 3. Persiste em paralelo no Supabase e no Firebase Firestore
    const results = await Promise.allSettled([
      saveSubmissionToSupabase(newSub),
      saveSubmissionToFirestore(newSub)
    ]);

    const supabaseOk = results[0].status === 'fulfilled';
    const firestoreOk = results[1].status === 'fulfilled';

    if (!supabaseOk) {
      console.warn('Supabase save notice:', results[0].status === 'rejected' ? results[0].reason : '');
    }
    if (!firestoreOk) {
      console.warn('Firestore save notice:', results[1].status === 'rejected' ? results[1].reason : '');
    }

    setIsSubmitted(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Add random test submission for teacher analysis demo
  const handleAddSimulatedResponse = () => {
    const grades = GRADE_OPTIONS.filter(g => g !== 'Outra Turma');
    const shifts = ["Matutino (Manhã)", "Vespertino (Tarde)", "Integral"];
    const randomGrade = grades[Math.floor(Math.random() * grades.length)];
    const randomShift = shifts[Math.floor(Math.random() * shifts.length)];

    const generatedAnswers: Record<number, OptionValue> = {};
    QUESTIONS_DATA.forEach(q => {
      const r = Math.random();
      if (r < 0.82) generatedAnswers[q.id] = 'Sim';
      else if (r < 0.94) generatedAnswers[q.id] = 'Talvez';
      else generatedAnswers[q.id] = 'Não';
    });

    const now = new Date();
    const formattedDate = `${now.toLocaleDateString('pt-BR')}, ${now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;

    const mockSub: FormSubmission = {
      id: `sim-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: formattedDate,
      studentInfo: {
        grade: randomGrade,
        shift: randomShift,
        isAnonymous: true
      },
      answers: generatedAnswers
    };

    setSubmissions(prev => [mockSub, ...prev]);
    saveSubmissionToSupabase(mockSub).catch(err => {
      console.warn('Supabase test submission save notice:', err?.message || err);
    });
    saveSubmissionToFirestore(mockSub).catch(() => {});
  };

  // Estado para exclusão individual ou total
  const [submissionToDelete, setSubmissionToDelete] = useState<string | null>(null);

  // Abre modal de confirmação para zerar todas as respostas
  const handleOpenClearModal = () => {
    setSubmissionToDelete(null);
    setIsClearModalOpen(true);
  };

  // Abre modal de confirmação para excluir uma resposta individual
  const handleOpenDeleteSingleModal = (id: string) => {
    setSubmissionToDelete(id);
    setIsClearModalOpen(true);
  };

  // Executa exclusão individual com confirmação prévia obrigatória do Supabase
  const handleConfirmDeleteSingle = async (id: string) => {
    setIsClearingSubmissions(true);
    try {
      // 1. Aguarda confirmação do Supabase antes de tocar no estado local
      await deleteSubmissionFromSupabase(id);

      // 2. Apenas após sucesso confirmado no Supabase, atualiza estado na UI
      setSubmissions(prev => prev.filter(s => s.id !== id));

      // 3. Atualiza LocalStorage
      try {
        const remaining = submissions.filter(s => s.id !== id);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(remaining));
      } catch (e) {
        console.warn('Erro ao atualizar storage local:', e);
      }

      // 4. Redundância Firestore
      try {
        await deleteSubmissionFromFirestore(id);
      } catch {}

      setIsClearModalOpen(false);
      setSubmissionToDelete(null);
      setToastMessage(`Resposta ${id} excluída com sucesso do Supabase!`);
    } catch (err: any) {
      console.error('Falha ao excluir resposta individual no Supabase:', err);
      // Não altera estado nem storage em caso de erro!
      setIsClearModalOpen(false);
      setToastMessage(err.message || `Erro ao excluir resposta ${id} no Supabase.`);
    } finally {
      setIsClearingSubmissions(false);
      setTimeout(() => setToastMessage(null), 5000);
    }
  };

  // Executa a exclusão de TODAS as respostas aguardando confirmação prévia do Supabase
  const handleConfirmClearAll = async () => {
    setIsClearingSubmissions(true);
    const ids = submissions.map(s => s.id);

    try {
      // 1. EXCLUI NO SUPABASE PRIMEIRO E AGUARDA CONFIRMAÇÃO DO BANCO
      await clearAllSubmissionsFromSupabase(ids);

      // 2. Somente após a confirmação do Supabase, limpa o estado na interface
      setSubmissions([]);

      // 3. Limpa o LocalStorage
      try {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem('escola_bullying_form_submissions_v4_clean');
        localStorage.removeItem('escola_bullying_form_submissions_v3');
        localStorage.removeItem('escola_bullying_form_submissions_v2');
        localStorage.removeItem('escola_bullying_form_submissions');
      } catch (e) {
        console.warn('Erro ao limpar storage local:', e);
      }

      // 4. Exclui do Firestore como redundância
      try {
        await clearAllSubmissionsFromFirestore();
      } catch (e) {
        console.warn('Firestore clear notice:', e);
      }

      setIsClearModalOpen(false);
      setToastMessage('Todas as respostas foram excluídas com sucesso do Supabase!');
    } catch (err: any) {
      console.error('Falha ao zerar respostas no Supabase:', err);
      // Em caso de erro, NÃO limpa o estado, NÃO remove do localStorage e NÃO reporta sucesso!
      setIsClearModalOpen(false);
      setToastMessage(err.message || 'Erro ao excluir respostas no Supabase. Os dados não foram alterados.');
    } finally {
      setIsClearingSubmissions(false);
      setTimeout(() => setToastMessage(null), 5000);
    }
  };

  // Estado e ação de sincronização manual com o Supabase e Firestore
  const [isRefreshingSupabase, setIsRefreshingSupabase] = useState<boolean>(false);

  const handleRefreshSupabase = async () => {
    setIsRefreshingSupabase(true);
    try {
      const [supabaseRes, firestoreRes] = await Promise.allSettled([
        fetchSubmissionsFromSupabase(),
        fetchSubmissionsFromFirestore()
      ]);

      const map = new Map<string, FormSubmission>();

      // Incorpora dados do Supabase
      if (supabaseRes.status === 'fulfilled' && supabaseRes.value) {
        supabaseRes.value.forEach(s => {
          if (s && s.id && !isTestSubmission(s)) {
            map.set(s.id, s);
          }
        });
      }

      // Incorpora dados do Firestore
      if (firestoreRes.status === 'fulfilled' && firestoreRes.value) {
        firestoreRes.value.forEach(s => {
          if (s && s.id && !isTestSubmission(s)) {
            map.set(s.id, s);
          }
        });
      }

      const merged = Array.from(map.values()).sort((a, b) => b.id.localeCompare(a.id));
      setSubmissions(merged);

      // Atualiza também o cache local
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
      } catch {}

      setToastMessage(`Dados sincronizados com sucesso! (${merged.length} resposta${merged.length === 1 ? '' : 's'})`);
    } catch (err: any) {
      console.warn('Erro ao atualizar dados:', err);
      setToastMessage('Aviso ao sincronizar dados remotos.');
    } finally {
      setIsRefreshingSupabase(false);
      setTimeout(() => setToastMessage(null), 3500);
    }
  };

  return (
    <div 
      className="min-h-screen transition-colors duration-200"
      style={{ backgroundColor: theme.bgColor }}
    >
      {/* Top Application Header */}
      <FormHeader
        currentRole={currentRole}
        activeTab={activeTab}
        setActiveTab={(tab) => {
          if (tab === 'professor' && !currentUser) {
            setIsTeacherAuthModalOpen(true);
            return;
          }
          setActiveTab(tab);
          setIsSubmitted(false);
        }}
        responseCount={submissions.length}
        theme={theme}
        currentUser={currentUser}
        onOpenThemeModal={() => setIsThemeModalOpen(true)}
        onOpenShareModal={() => setIsShareModalOpen(true)}
        onOpenSheetsModal={() => setIsSheetsModalOpen(true)}
        onOpenGuideModal={() => setIsGuideModalOpen(true)}
        onReturnToPortal={handleReturnToPortal}
        onRequestTeacherAuth={handleEnterAsTeacher}
        onLogoutTeacher={handleLogoutTeacher}
      />

      {/* Main Content Area */}
      <main className="pb-16">
        {/* 1. PORTAL DE BOAS-VINDAS (Menu Inicial com Botão Aluno e Botão Professor) */}
        {currentRole === 'portal' && (
          <WelcomePortal
            theme={theme}
            responseCount={submissions.length}
            currentUser={currentUser}
            onEnterAsStudent={handleEnterAsStudent}
            onEnterAsTeacher={handleEnterAsTeacher}
            onLogout={handleLogoutTeacher}
            onOpenGuide={() => setIsGuideModalOpen(true)}
          />
        )}

        {/* 2. MODO ALUNO (Acesso EXCLUSIVO às 15 Perguntas, sem gráficos nem relatórios) */}
        {currentRole === 'aluno' && (
          <>
            {isSubmitted ? (
              <ConfirmationScreen
                theme={theme}
                currentRole={currentRole}
                onNewResponse={() => {
                  setIsSubmitted(false);
                }}
                onViewSummary={() => {}}
                onOpenGuide={() => setIsGuideModalOpen(true)}
                onReturnToPortal={handleReturnToPortal}
              />
            ) : (
              <StudentQuestionnaire
                questions={QUESTIONS_DATA}
                theme={theme}
                onSubmit={handleFormSubmit}
                showLegalHelp={showLegalHelp}
              />
            )}
          </>
        )}

        {/* 3. MODO PROFESSOR (Protegido por Firebase Authentication e Cloud Firestore) */}
        {currentRole === 'professor' && (
          <>
            {isSubmitted ? (
              <ConfirmationScreen
                theme={theme}
                currentRole={currentRole}
                onNewResponse={() => {
                  setIsSubmitted(false);
                  setActiveTab('perguntas');
                }}
                onViewSummary={() => {
                  setIsSubmitted(false);
                  setActiveTab('professor');
                }}
                onOpenGuide={() => setIsGuideModalOpen(true)}
                onReturnToPortal={handleReturnToPortal}
              />
            ) : (
              <>
                {activeTab === 'perguntas' && (
                  <StudentQuestionnaire
                    questions={QUESTIONS_DATA}
                    theme={theme}
                    onSubmit={handleFormSubmit}
                    showLegalHelp={showLegalHelp}
                  />
                )}

                {activeTab === 'professor' && (
                  <ResponsesDashboard
                    questions={QUESTIONS_DATA}
                    submissions={submissions}
                    theme={theme}
                    onOpenSheets={() => setIsSheetsModalOpen(true)}
                    onClearSubmissions={handleOpenClearModal}
                    onDeleteSubmission={handleOpenDeleteSingleModal}
                    onNavigateToTables={() => setActiveTab('tabelas')}
                    onRefreshSupabase={handleRefreshSupabase}
                    isRefreshing={isRefreshingSupabase}
                  />
                )}

                {activeTab === 'tabelas' && (
                  <DatabaseTablesView
                    questions={QUESTIONS_DATA}
                    submissions={submissions}
                    currentUser={currentUser}
                    theme={theme}
                    onOpenSheets={() => setIsSheetsModalOpen(true)}
                    onClearSubmissions={handleOpenClearModal}
                    onDeleteSubmission={handleOpenDeleteSingleModal}
                    onRefreshSupabase={handleRefreshSupabase}
                    isRefreshing={isRefreshingSupabase}
                  />
                )}

                {activeTab === 'configuracoes' && (
                  <SettingsTab
                    theme={theme}
                    currentUser={currentUser}
                    allowAnonymous={allowAnonymous}
                    setAllowAnonymous={setAllowAnonymous}
                    showLegalHelp={showLegalHelp}
                    setShowLegalHelp={setShowLegalHelp}
                    confirmationMessage={confirmationMessage}
                    setConfirmationMessage={setConfirmationMessage}
                    onResetAllData={handleOpenClearModal}
                    onProfileUpdated={(updated) => setCurrentUser(updated)}
                  />
                )}
              </>
            )}
          </>
        )}
      </main>

      {/* Modal de Confirmação para Zerar Respostas ou Excluir Individual */}
      <ClearConfirmModal
        isOpen={isClearModalOpen}
        onClose={() => {
          setIsClearModalOpen(false);
          setSubmissionToDelete(null);
        }}
        onConfirm={() => {
          if (submissionToDelete) {
            handleConfirmDeleteSingle(submissionToDelete);
          } else {
            handleConfirmClearAll();
          }
        }}
        count={submissions.length}
        targetId={submissionToDelete}
        isDeleting={isClearingSubmissions}
      />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div 
          className={`fixed bottom-5 right-5 z-50 backdrop-blur-xs px-4 py-3 rounded-xl shadow-2xl border flex items-center gap-2.5 text-xs font-semibold animate-in fade-in slide-in-from-bottom-3 duration-200 max-w-md ${
            toastMessage.toLowerCase().includes('erro') ||
            toastMessage.toLowerCase().includes('falha') ||
            toastMessage.toLowerCase().includes('permissão') ||
            toastMessage.toLowerCase().includes('não autenticado') ||
            toastMessage.toLowerCase().includes('bloqueou')
              ? 'bg-red-950/95 border-red-700 text-red-100 shadow-red-950/50'
              : 'bg-neutral-900/95 border-neutral-700 text-white shadow-black/40'
          }`}
        >
          {toastMessage.toLowerCase().includes('erro') ||
          toastMessage.toLowerCase().includes('falha') ||
          toastMessage.toLowerCase().includes('permissão') ||
          toastMessage.toLowerCase().includes('não autenticado') ||
          toastMessage.toLowerCase().includes('bloqueou') ? (
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          )}
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Teacher Firebase Auth Modal (Cadastro e Login) */}
      <TeacherAuthModal
        isOpen={isTeacherAuthModalOpen}
        onClose={() => setIsTeacherAuthModalOpen(false)}
        onSuccess={handleTeacherAuthSuccess}
        theme={theme}
      />

      {/* Other Modals */}
      <SheetsModal
        isOpen={isSheetsModalOpen}
        onClose={() => setIsSheetsModalOpen(false)}
        questions={QUESTIONS_DATA}
        submissions={submissions}
      />

      <ThemeModal
        isOpen={isThemeModalOpen}
        onClose={() => setIsThemeModalOpen(false)}
        currentTheme={theme}
        onSelectTheme={handleSelectTheme}
      />

      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        theme={theme}
      />

      <PedagogicalGuideModal
        isOpen={isGuideModalOpen}
        onClose={() => setIsGuideModalOpen(false)}
        questions={QUESTIONS_DATA}
      />
    </div>
  );
}
