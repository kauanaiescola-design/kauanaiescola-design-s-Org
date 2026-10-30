import React, { useState, useEffect } from 'react';
import { FormTheme, UserProfile } from '../types/form';
import { 
  Sliders, 
  ShieldCheck, 
  Eye, 
  Lock, 
  MessageSquare, 
  RotateCcw, 
  CheckCircle2,
  User,
  School,
  Briefcase,
  Mail,
  Save,
  Loader2,
  Database
} from 'lucide-react';
import { updateUserProfile } from '../supabase';
import { updateUserProfile as updateUserProfileFirestore } from '../firebase';

interface SettingsTabProps {
  theme: FormTheme;
  currentUser: UserProfile | null;
  allowAnonymous: boolean;
  setAllowAnonymous: (val: boolean) => void;
  showLegalHelp: boolean;
  setShowLegalHelp: (val: boolean) => void;
  confirmationMessage: string;
  setConfirmationMessage: (val: string) => void;
  onResetAllData: () => void;
  onProfileUpdated?: (updated: UserProfile) => void;
}

export const SettingsTab: React.FC<SettingsTabProps> = ({
  theme,
  currentUser,
  allowAnonymous,
  setAllowAnonymous,
  showLegalHelp,
  setShowLegalHelp,
  confirmationMessage,
  setConfirmationMessage,
  onResetAllData,
  onProfileUpdated
}) => {
  // Local profile edit state
  const [name, setName] = useState(currentUser?.displayName || '');
  const [role, setRole] = useState(currentUser?.role || 'Professor(a)');
  const [school, setSchool] = useState(currentUser?.schoolName || 'Escola Silvio Oliveira dos Santos');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  useEffect(() => {
    if (currentUser) {
      setName(currentUser.displayName || '');
      setRole(currentUser.role || 'Professor(a)');
      setSchool(currentUser.schoolName || 'Escola Silvio Oliveira dos Santos');
    }
  }, [currentUser]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser?.uid) return;

    setIsSavingProfile(true);
    setProfileSuccess(false);
    setProfileError(null);

    try {
      const updatedData = {
        displayName: name.trim(),
        role: role.trim(),
        schoolName: school.trim()
      };
      await updateUserProfile(currentUser.uid, updatedData);
      try {
        await updateUserProfileFirestore(currentUser.uid, updatedData);
      } catch {}

      setProfileSuccess(true);
      if (onProfileUpdated) {
        onProfileUpdated({
          ...currentUser,
          ...updatedData,
          updatedAt: new Date().toISOString()
        });
      }
      setTimeout(() => setProfileSuccess(false), 3000);
    } catch (err: any) {
      console.error('Erro ao atualizar perfil:', err);
      setProfileError('Não foi possível salvar as alterações no banco de dados.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      {/* 1. Card de Perfil do Usuário */}
      {currentUser && (
        <div className="bg-white rounded-lg border border-[#dadce0] p-6 shadow-xs space-y-5">
          <div className="border-b border-[#f1f3f4] pb-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center text-white shrink-0 shadow-xs"
                style={{ backgroundColor: theme.primaryColor }}
              >
                <Database className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-neutral-900">
                  Dados do Usuário (Supabase & Cloud: /users/{currentUser.uid.slice(0, 8)}...)
                </h3>
                <p className="text-xs text-neutral-500">
                  Armazenados e protegidos por políticas de segurança. Acesso restrito da coordenação.
                </p>
              </div>
            </div>
          </div>

          {profileSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Dados cadastrais atualizados com sucesso no Cloud Firestore!</span>
            </div>
          )}

          {profileError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center gap-2">
              <span>{profileError}</span>
            </div>
          )}

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  E-mail Autenticado (Firebase Auth)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    disabled
                    value={currentUser.email}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-neutral-100 border border-neutral-300 rounded-lg text-neutral-600 cursor-not-allowed font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Nome Completo no Perfil
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-neutral-300 rounded-lg outline-hidden focus:border-purple-600 focus:ring-2 focus:ring-purple-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Cargo / Função Pedagógica
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
                    <Briefcase className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-neutral-300 rounded-lg outline-hidden focus:border-purple-600 focus:ring-2 focus:ring-purple-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Unidade Escolar
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
                    <School className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={school}
                    onChange={(e) => setSchool(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-neutral-300 rounded-lg outline-hidden focus:border-purple-600 focus:ring-2 focus:ring-purple-100"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[#f1f3f4] text-xs text-neutral-500">
              <span>
                Cadastrado em: {currentUser.createdAt ? new Date(currentUser.createdAt).toLocaleDateString('pt-BR') : 'Hoje'}
              </span>
              <button
                type="submit"
                disabled={isSavingProfile}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white rounded-lg shadow-xs hover:opacity-95 transition-all cursor-pointer disabled:opacity-60"
                style={{ backgroundColor: theme.primaryColor }}
              >
                {isSavingProfile ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Salvando...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    <span>Salvar Alterações no Firestore</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 2. Configurações do Questionário */}
      <div className="bg-white rounded-lg border border-[#dadce0] p-6 shadow-xs space-y-6">
        <div className="border-b border-[#f1f3f4] pb-4">
          <div className="flex items-center gap-2 text-base font-medium text-neutral-900">
            <Sliders className="w-5 h-5 text-purple-700" />
            <span>Configurações do Questionário Escolar</span>
          </div>
          <p className="text-xs text-neutral-500 mt-1">
            Gerencie como os alunos interagem com a pesquisa e como as respostas são coletadas.
          </p>
        </div>

        {/* Setting 1: Anonymous submissions */}
        <div className="flex items-start justify-between gap-4 py-2 border-b border-[#f1f3f4]">
          <div className="space-y-0.5">
            <span className="text-sm font-medium text-neutral-900 block flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-emerald-600" />
              Permitir e incentivar respostas anônimas
            </span>
            <p className="text-xs text-neutral-500 max-w-lg">
              Recomendado para pesquisas sobre bullying e agressões, assegurando que as vítimas e testemunhas não temam represálias.
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={allowAnonymous}
              onChange={(e) => setAllowAnonymous(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
          </label>
        </div>

        {/* Setting 2: Legal base visible */}
        <div className="flex items-start justify-between gap-4 py-2 border-b border-[#f1f3f4]">
          <div className="space-y-0.5">
            <span className="text-sm font-medium text-neutral-900 block flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-purple-600" />
              Exibir base legal ao lado de cada questão no formulário
            </span>
            <p className="text-xs text-neutral-500 max-w-lg">
              Mostra discretamente referências à Lei 13.185/15 e 14.811/24 no rodapé de cada pergunta para fins pedagógicos.
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={showLegalHelp}
              onChange={(e) => setShowLegalHelp(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
          </label>
        </div>

        {/* Setting 3: Confirmation Message */}
        <div className="space-y-2 py-2 border-b border-[#f1f3f4]">
          <label className="text-sm font-medium text-neutral-900 block flex items-center gap-1.5">
            <MessageSquare className="w-4 h-4 text-blue-600" />
            Mensagem pós-envio aos alunos
          </label>
          <p className="text-xs text-neutral-500">
            Texto exibido ao aluno após clicar em &quot;Enviar&quot;:
          </p>
          <input
            type="text"
            value={confirmationMessage}
            onChange={(e) => setConfirmationMessage(e.target.value)}
            className="w-full bg-[#f8f9fa] border border-[#dadce0] rounded-md px-3 py-2 text-xs text-neutral-800 outline-hidden focus:border-purple-600 focus:bg-white"
          />
        </div>

        {/* Setting 4: Reset Database */}
        <div className="pt-2 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-neutral-800 block">
              Redefinir Dados Locais de Teste
            </span>
            <span className="text-xs text-neutral-500">
              Restaura o conjunto inicial com 12 respostas demonstrativas.
            </span>
          </div>

          <button
            onClick={onResetAllData}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-md transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restaurar Padrão</span>
          </button>
        </div>
      </div>
    </div>
  );
};
