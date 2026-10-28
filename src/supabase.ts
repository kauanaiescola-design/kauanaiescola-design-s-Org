import { createClient as createSupabaseClient, SupabaseClient } from '@supabase/supabase-js';
import { FormSubmission, UserProfile } from './types/form';

export const SUPABASE_URL = 
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) ||
  (typeof import.meta !== 'undefined' && import.meta.env?.NEXT_PUBLIC_SUPABASE_URL) ||
  'https://tpembfkvoxgqdjbnennc.supabase.co';

export const SUPABASE_PUBLISHABLE_KEY = 
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_PUBLISHABLE_KEY) ||
  (typeof import.meta !== 'undefined' && import.meta.env?.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) ||
  'sb_publishable_xC2pJSJYn0RtvushiqB4jw_8bCepq_Z';

export const SUPABASE_PROJECT_ID = 'tpembfkvoxgqdjbnennc';

// Create Supabase Client instance
export const supabase: SupabaseClient = createSupabaseClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined
  }
});

/**
 * Traduz erros comuns de autenticação do Supabase para português amigável
 */
export function getSupabaseAuthErrorMessage(error: any): string {
  if (!error) return 'Erro desconhecido.';
  const msg = typeof error === 'string' ? error : error.message || '';

  if (msg.includes('Invalid login credentials') || msg.includes('invalid_grant')) {
    return 'E-mail ou senha incorretos. Verifique os dados digitados.';
  }
  if (msg.includes('User already registered') || msg.includes('already exists')) {
    return 'Este e-mail já está cadastrado no sistema. Faça login com sua senha.';
  }
  if (msg.includes('Password should be at least')) {
    return 'A senha deve conter no mínimo 6 caracteres.';
  }
  if (msg.includes('Email not confirmed')) {
    return 'E-mail ainda não confirmado. Verifique sua caixa de entrada no e-mail ou desative "Confirm email" nas configurações do Supabase.';
  }
  if (msg.includes('Signups not allowed')) {
    return 'Cadastros novos estão temporariamente desabilitados no painel do Supabase.';
  }
  if (msg.includes('rate limit') || msg.includes('Too many requests')) {
    return 'Muitas tentativas em pouco tempo. Aguarde alguns instantes.';
  }
  return msg || 'Ocorreu um erro na autenticação com o Supabase.';
}

/**
 * Cadastro de novo usuário no Supabase Auth + persistência na tabela public.users
 * Salva Nome Completo, Cargo/Função e Nome da Escola associados com segurança ao UUID do usuário.
 */
export async function registerWithEmail(
  email: string,
  pass: string,
  displayName: string,
  role = 'Professor(a) / Coordenação',
  schoolName = 'Colégio Estadual Modelo'
): Promise<UserProfile> {
  const cleanEmail = email.trim();
  const cleanName = displayName.trim() || 'Professor(a)';
  const cleanRole = role.trim() || 'Professor(a) / Coordenação';
  const cleanSchool = schoolName.trim() || 'Colégio Estadual Modelo';

  // 1. Cria a conta no Supabase Auth incluindo os metadados
  const { data, error } = await supabase.auth.signUp({
    email: cleanEmail,
    password: pass,
    options: {
      data: {
        display_name: cleanName,
        role: cleanRole,
        school_name: cleanSchool
      }
    }
  });

  if (error) {
    throw new Error(getSupabaseAuthErrorMessage(error));
  }

  const userId = data.user?.id || 'user-' + Date.now();

  const profile: UserProfile = {
    uid: userId,
    email: cleanEmail,
    displayName: cleanName,
    role: cleanRole,
    schoolName: cleanSchool,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  // 2. Grava ou atualiza o perfil diretamente na tabela public.users
  try {
    await supabase.from('users').upsert({
      id: userId,
      email: cleanEmail,
      display_name: cleanName,
      role: cleanRole,
      school_name: cleanSchool,
      created_at: profile.createdAt,
      updated_at: profile.updatedAt
    });
  } catch (err) {
    console.warn('Nota de gravação na tabela users (o trigger SQL também tenta automatizar isso):', err);
  }

  try {
    localStorage.setItem('auth_teacher_session', JSON.stringify(profile));
  } catch {}

  return profile;
}

/**
 * Login com E-mail e Senha no Supabase Auth e carregamento do perfil de usuário
 */
export async function loginWithEmail(email: string, pass: string): Promise<UserProfile> {
  const cleanEmail = email.trim();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: cleanEmail,
    password: pass
  });

  if (error) {
    throw new Error(getSupabaseAuthErrorMessage(error));
  }

  const user = data.user;
  const userId = user?.id || 'user-' + Date.now();
  const metadata = user?.user_metadata || {};

  // Tenta buscar da tabela 'users'
  let profile = await getUserProfile(userId);

  if (!profile) {
    profile = {
      uid: userId,
      email: cleanEmail,
      displayName: metadata.display_name || user?.email?.split('@')[0] || 'Professor(a)',
      role: metadata.role || 'Professor(a) / Coordenação',
      schoolName: metadata.school_name || 'Colégio Estadual Modelo',
      createdAt: user?.created_at || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Auto-cria na tabela se não existia
    try {
      await supabase.from('users').upsert({
        id: userId,
        email: cleanEmail,
        display_name: profile.displayName,
        role: profile.role,
        school_name: profile.schoolName,
        created_at: profile.createdAt,
        updated_at: profile.updatedAt
      });
    } catch {}
  }

  try {
    localStorage.setItem('auth_teacher_session', JSON.stringify(profile));
  } catch {}

  return profile;
}

/**
 * Logout do Supabase Auth
 */
export async function logoutUser(): Promise<void> {
  try {
    localStorage.removeItem('auth_teacher_session');
  } catch {}

  try {
    await supabase.auth.signOut();
  } catch (err) {
    console.warn('Erro ao deslogar do Supabase:', err);
  }
}

/**
 * Busca perfil persistente na tabela 'users' do Supabase
 */
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', uid)
      .maybeSingle();

    if (error) {
      return null;
    }

    if (data) {
      return {
        uid: data.id,
        email: data.email || '',
        displayName: data.display_name || 'Professor(a)',
        role: data.role || 'Professor(a)',
        schoolName: data.school_name || 'Escola',
        createdAt: data.created_at || new Date().toISOString(),
        updatedAt: data.updated_at || new Date().toISOString()
      };
    }
    return null;
  } catch (err) {
    console.warn('Consulta à tabela users falhou:', err);
    return null;
  }
}

/**
 * Atualiza perfil do usuário na tabela 'users' do Supabase
 */
export async function updateUserProfile(uid: string, data: Partial<UserProfile>): Promise<void> {
  try {
    const payload: any = {
      updated_at: new Date().toISOString()
    };
    if (data.displayName !== undefined) payload.display_name = data.displayName;
    if (data.role !== undefined) payload.role = data.role;
    if (data.schoolName !== undefined) payload.school_name = data.schoolName;
    if (data.email !== undefined) payload.email = data.email;

    await supabase
      .from('users')
      .upsert({
        id: uid,
        ...payload
      });
  } catch (err) {
    console.warn('Erro ao atualizar perfil na tabela users:', err);
  }
}

/**
 * Monitora o estado da sessão de autenticação do Supabase
 */
export function subscribeToAuthState(callback: (user: any | null) => void) {
  const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user || null);
  });
  return () => {
    subscription.unsubscribe();
  };
}

/**
 * Salva uma nova resposta de aluno na tabela 'submissions' do Supabase
 */
export async function saveSubmissionToSupabase(submission: FormSubmission): Promise<void> {
  const payload = {
    id: submission.id,
    timestamp: submission.timestamp,
    student_grade: submission.studentInfo.grade,
    student_shift: submission.studentInfo.shift,
    student_age_group: submission.studentInfo.age || '',
    is_anonymous: submission.studentInfo.isAnonymous,
    student_name: submission.studentInfo.studentName || null,
    student_info: submission.studentInfo,
    answers: submission.answers,
    created_at: new Date().toISOString()
  };

  const { error } = await supabase
    .from('submissions')
    .upsert([payload]);

  if (error) {
    console.warn('Aviso ao gravar no Supabase:', error.message);
    throw error;
  }
}

/**
 * Exclui uma única resposta da tabela 'submissions' no Supabase.
 * Aguarda a confirmação de sucesso do Supabase. Lança erro explicativo caso falhe.
 */
export async function deleteSubmissionFromSupabase(id: string): Promise<void> {
  if (!id) throw new Error('ID da resposta não fornecido.');

  // Executa a exclusão com .select('id') para confirmar os registros excluídos
  const { data, error } = await supabase
    .from('submissions')
    .delete()
    .eq('id', id)
    .select('id');

  if (error) {
    console.error('Erro na exclusão individual no Supabase:', error);
    throw new Error(`Falha no Supabase ao excluir resposta: ${error.message}`);
  }

  // Se o Supabase retornou 0 linhas afetadas, verifica se a linha ainda existe
  if (!data || data.length === 0) {
    const { data: existing } = await supabase
      .from('submissions')
      .select('id')
      .eq('id', id)
      .maybeSingle();

    if (existing) {
      throw new Error('A resposta não pôde ser excluída do Supabase por restrição de segurança (RLS). Execute o SQL de atualização no painel do Supabase.');
    }
  }
}

/**
 * Exclui todas as respostas da tabela 'submissions' no Supabase.
 * Aguarda a confirmação de sucesso do banco antes de concluir.
 */
export async function clearAllSubmissionsFromSupabase(knownIds?: string[]): Promise<string[]> {
  // Executa a exclusão com .select('id') para obter confirmação explícita
  let query = supabase.from('submissions').delete().select('id');
  if (knownIds && knownIds.length > 0) {
    query = query.in('id', knownIds);
  } else {
    query = query.neq('id', '');
  }

  const { data, error } = await query;

  if (error) {
    console.error('Erro ao zerar respostas no Supabase:', error);
    throw new Error(`Falha no Supabase ao zerar respostas: ${error.message}`);
  }

  // Validação: se havia IDs e nada foi retornado, verifica se as linhas ainda constam no banco
  if (knownIds && knownIds.length > 0 && (!data || data.length === 0)) {
    const { count } = await supabase
      .from('submissions')
      .select('id', { count: 'exact', head: true });

    if (count && count > 0) {
      throw new Error('O Supabase bloqueou a exclusão das respostas por permissão de segurança (RLS). Execute o SQL de atualização no painel do Supabase.');
    }
  }

  return (data || []).map((r: any) => r.id);
}

/**
 * Monitora e carrega respostas em tempo real da tabela 'submissions' do Supabase
 */
export function subscribeToSubmissions(
  onUpdate: (submissions: FormSubmission[]) => void,
  onError?: (error: Error) => void
) {
  let isMounted = true;

  // 1. Carregamento inicial via Supabase REST
  const fetchInitial = async () => {
    try {
      const { data, error } = await supabase
        .from('submissions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(500);

      if (error) {
        if (onError) onError(new Error(error.message));
        return;
      }

      if (data && isMounted) {
        const formatted: FormSubmission[] = data.map((row: any) => {
          const studentInfo = row.student_info || row.studentInfo || {
            grade: row.student_grade || '1º Ano A (1º A)',
            shift: row.student_shift || 'Matutino (Manhã)',
            age: row.student_age_group || '',
            isAnonymous: row.is_anonymous ?? true,
            studentName: row.student_name || ''
          };

          return {
            id: row.id,
            timestamp: row.timestamp || new Date(row.created_at).toLocaleString('pt-BR'),
            studentInfo,
            answers: row.answers || {}
          };
        });

        onUpdate(formatted);
      }
    } catch (err: any) {
      if (onError) onError(err);
    }
  };

  fetchInitial();

  // 2. Inscrição em tempo real (Supabase Realtime Postgres Changes)
  const channel = supabase
    .channel('public:submissions')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'submissions' },
      () => {
        fetchInitial();
      }
    )
    .subscribe();

  return () => {
    isMounted = false;
    supabase.removeChannel(channel);
  };
}

/**
 * Busca e atualiza manualmente todas as respostas diretamente do Supabase
 */
export async function fetchSubmissionsFromSupabase(): Promise<FormSubmission[]> {
  const { data, error } = await supabase
    .from('submissions')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(500);

  if (error) {
    throw error;
  }

  if (!data) return [];

  return data.map((row: any) => {
    const studentInfo = row.student_info || row.studentInfo || {
      grade: row.student_grade || '1º Ano A (1º A)',
      shift: row.student_shift || 'Matutino (Manhã)',
      age: row.student_age_group || '',
      isAnonymous: row.is_anonymous ?? true,
      studentName: row.student_name || ''
    };

    return {
      id: row.id,
      timestamp: row.timestamp || new Date(row.created_at).toLocaleString('pt-BR'),
      studentInfo,
      answers: row.answers || {}
    };
  });
}

/**
 * Insere os dados simulados iniciais caso a tabela 'submissions' esteja vazia
 */
export async function seedInitialSubmissionsIfEmpty(initialData: FormSubmission[]): Promise<void> {
  if (!initialData || initialData.length === 0) return;
  try {
    const { count, error } = await supabase
      .from('submissions')
      .select('*', { count: 'exact', head: true });

    if (error) return;

    if (count === 0) {
      const records = initialData.map((item) => ({
        id: item.id,
        timestamp: item.timestamp,
        student_grade: item.studentInfo.grade,
        student_shift: item.studentInfo.shift,
        student_age_group: item.studentInfo.age || '',
        is_anonymous: item.studentInfo.isAnonymous,
        student_name: item.studentInfo.studentName || null,
        student_info: item.studentInfo,
        answers: item.answers,
        created_at: new Date().toISOString()
      }));

      await supabase.from('submissions').insert(records);
    }
  } catch (e) {
    console.warn('Seed notice:', e);
  }
}

/**
 * Testa o ping e a latência de conexão diretamente com o banco de dados Supabase
 */
export async function testDatabasePing(): Promise<{ ok: boolean; latencyMs: number; error?: string }> {
  const start = performance.now();
  try {
    const { error } = await supabase.from('submissions').select('id', { head: true }).limit(1);
    const latencyMs = Math.round(performance.now() - start);

    if (error && !error.message.includes('relation "submissions" does not exist') && !error.message.includes('not found')) {
      return { ok: false, latencyMs, error: error.message };
    }
    return { ok: true, latencyMs };
  } catch (err: unknown) {
    const latencyMs = Math.round(performance.now() - start);
    const msg = err instanceof Error ? err.message : String(err);
    return { ok: false, latencyMs, error: msg };
  }
}

/**
 * Script SQL completo, defensivo e seguro para migração e políticas RLS no Supabase (SQL Editor)
 */
export const SUPABASE_SETUP_SQL = `-- ==============================================================================
-- MIGRAÇÃO DE SEGURANÇA E ESTRUTURA DO BANCO DE DADOS SUPABASE
-- Projeto: kd-studios (${SUPABASE_PROJECT_ID})
-- URL: ${SUPABASE_URL}
--
-- Execução:
-- 1. Abra o painel do Supabase: https://supabase.com/dashboard/project/${SUPABASE_PROJECT_ID}/sql/new
-- 2. Cole todo este código no editor SQL.
-- 3. Clique no botão "Run" (ou pressione Ctrl + Enter).
-- ==============================================================================

-- 1. ESTRUTURA DA TABELA DE RESPOSTAS (public.submissions)
CREATE TABLE IF NOT EXISTS public.submissions (
    id TEXT PRIMARY KEY,
    timestamp TEXT NOT NULL,
    student_grade TEXT NOT NULL,
    student_shift TEXT NOT NULL,
    student_age_group TEXT,
    is_anonymous BOOLEAN DEFAULT true,
    student_name TEXT,
    student_info JSONB NOT NULL,
    answers JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Garante todas as colunas necessárias em tabelas preexistentes
ALTER TABLE public.submissions ADD COLUMN IF NOT EXISTS timestamp TEXT;
ALTER TABLE public.submissions ADD COLUMN IF NOT EXISTS student_grade TEXT;
ALTER TABLE public.submissions ADD COLUMN IF NOT EXISTS student_shift TEXT;
ALTER TABLE public.submissions ADD COLUMN IF NOT EXISTS student_age_group TEXT;
ALTER TABLE public.submissions ADD COLUMN IF NOT EXISTS is_anonymous BOOLEAN DEFAULT true;
ALTER TABLE public.submissions ADD COLUMN IF NOT EXISTS student_name TEXT;
ALTER TABLE public.submissions ADD COLUMN IF NOT EXISTS student_info JSONB;
ALTER TABLE public.submissions ADD COLUMN IF NOT EXISTS answers JSONB;
ALTER TABLE public.submissions ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- 2. ATIVAÇÃO DO ROW LEVEL SECURITY (RLS)
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;

-- 3. REMOÇÃO DE TODAS AS POLÍTICAS ANTIGAS NA TABELA submissions
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN (
    SELECT policyname 
    FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'submissions'
  ) LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.submissions;', r.policyname);
  END LOOP;
END $$;

-- 4. POLÍTICAS RLS PARA ACESSO À TABELA SUBMISSIONS
-- Permite inserção de respostas pelos alunos
CREATE POLICY "submissions_insert_policy"
ON public.submissions FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Permite consulta das respostas no painel de gestão
CREATE POLICY "submissions_select_policy"
ON public.submissions FOR SELECT
TO anon, authenticated
USING (true);

-- Permite exclusão individual e zeramento de respostas pelo painel institucional
CREATE POLICY "submissions_delete_policy"
ON public.submissions FOR DELETE
TO anon, authenticated
USING (true);

-- 5. CONCESSÃO EXPLÍCITA DE PRIVILÉGIOS
GRANT ALL ON public.submissions TO anon, authenticated;

-- 6. HABILITAÇÃO DO SUPABASE REALTIME
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
      AND schemaname = 'public' 
      AND tablename = 'submissions'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.submissions;
  END IF;
END $$;
`;
