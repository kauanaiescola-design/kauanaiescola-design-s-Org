import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup,
  GoogleAuthProvider,
  signOut, 
  onAuthStateChanged,
  updateProfile,
  User as FirebaseUser
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc,
  getDocs, 
  deleteDoc,
  onSnapshot, 
  getDocFromServer,
  query,
  limit
} from 'firebase/firestore';
import { FormSubmission, UserProfile } from './types/form';
import firebaseConfig from '../firebase-applet-config.json';

// Initialize Firebase App
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firebase Auth
export const auth = getAuth(app);

// Database ID & Project ID Constants
export const FIRESTORE_DATABASE_ID = firebaseConfig.firestoreDatabaseId || "ai-studio-checkbullyingesc-46e361e7-dcf6-42de-8f31-dfa5efebf04d";
export const FIREBASE_PROJECT_ID = firebaseConfig.projectId || "gen-lang-client-0173687043";
export const FIREBASE_CONSOLE_AUTH_URL = `https://console.firebase.google.com/project/${FIREBASE_PROJECT_ID}/authentication/providers`;

// Initialize Firestore (with firestoreDatabaseId if configured)
export const db = firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)'
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

// Test connection as required by Firebase skill
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.info('Connected to Firebase Firestore successfully.');
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration: client is offline.');
    }
  }
}
testConnection();

// Collection references
const submissionsCollection = collection(db, 'submissions');
const usersCollection = collection(db, 'users');

/**
 * Traduz erros do Firebase Authentication para mensagens amigáveis em português
 */
export function getAuthErrorMessage(errorCode: string): string {
  switch (errorCode) {
    case 'auth/invalid-email':
      return 'O formato do e-mail é inválido. Por favor, confira o endereço digitado.';
    case 'auth/user-disabled':
      return 'Este usuário foi desativado pela administração.';
    case 'auth/user-not-found':
      return 'Nenhum usuário cadastrado com este e-mail.';
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'E-mail ou senha incorretos. Verifique suas credenciais.';
    case 'auth/email-already-in-use':
      return 'Este e-mail já está em uso por outra conta. Faça login ou use outro e-mail.';
    case 'auth/weak-password':
      return 'A senha deve conter no mínimo 6 caracteres.';
    case 'auth/operation-not-allowed':
      return 'O provedor de autenticação por E-mail/Senha precisa estar habilitado no Firebase Console (Authentication > Sign-in method > E-mail/senha).';
    case 'auth/too-many-requests':
      return 'Muitas tentativas com erro. Aguarde alguns instantes antes de tentar novamente.';
    case 'auth/network-request-failed':
      return 'Falha na conexão de rede. Verifique sua internet.';
    case 'auth/popup-closed-by-user':
      return 'A janela de autenticação foi fechada antes da conclusão.';
    default:
      return 'Ocorreu um erro na autenticação. Verifique os dados e tente novamente.';
  }
}

/**
 * Cria nova conta de usuário (Cadastro) e salva perfil no Firestore
 */
export async function registerWithEmail(
  email: string, 
  pass: string, 
  displayName: string,
  role = 'professor',
  schoolName = 'Escola Padrão'
): Promise<UserProfile> {
  const credential = await createUserWithEmailAndPassword(auth, email.trim(), pass);
  const user = credential.user;

  if (displayName.trim()) {
    try {
      await updateProfile(user, { displayName: displayName.trim() });
    } catch {
      // ignore
    }
  }

  const profile: UserProfile = {
    uid: user.uid,
    email: user.email || email.trim(),
    displayName: displayName.trim() || user.displayName || 'Professor(a)',
    role: role.trim() || 'professor',
    schoolName: schoolName.trim() || 'Escola',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  // Grava o perfil do usuário no Firestore na coleção /users/{uid}
  await setDoc(doc(db, 'users', user.uid), profile);

  return profile;
}

/**
 * Realiza login com E-mail e Senha no Firebase Authentication e garante carregamento do perfil
 */
export async function loginWithEmail(email: string, pass: string): Promise<UserProfile> {
  const credential = await signInWithEmailAndPassword(auth, email.trim(), pass);
  const user = credential.user;
  let profile = await getUserProfile(user.uid);
  if (!profile) {
    profile = {
      uid: user.uid,
      email: user.email || email.trim(),
      displayName: user.displayName || 'Professor(a)',
      role: 'Professor(a)',
      schoolName: 'Escola Modelo',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    try {
      await setDoc(doc(db, 'users', user.uid), profile);
    } catch (e) {
      console.warn('Could not auto-create profile in Firestore:', e);
    }
  }
  return profile;
}

/**
 * Realiza autenticação oficial com Google (Provedor padrão ativado pelo Firebase)
 */
export async function loginWithGoogle(): Promise<UserProfile> {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  const credential = await signInWithPopup(auth, provider);
  const user = credential.user;

  let profile = await getUserProfile(user.uid);
  if (!profile) {
    profile = {
      uid: user.uid,
      email: user.email || '',
      displayName: user.displayName || 'Professor(a) de Gestão Escolar',
      role: 'Professor(a) / Coordenação',
      schoolName: 'Colégio Estadual Modelo',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    try {
      await setDoc(doc(db, 'users', user.uid), profile);
    } catch (e) {
      console.warn('Could not auto-create profile in Firestore:', e);
    }
  }

  try {
    localStorage.setItem('auth_teacher_session', JSON.stringify(profile));
  } catch {}

  return profile;
}

/**
 * Força a liberação imediata do Modo Professor (Bypass emergencial para testes locais)
 * Permite que a coordenação/professor utilize a plataforma mesmo enquanto o provedor de e-mail é ativado no console.
 */
export async function forceEmergencyTeacherLogin(customEmail?: string, customName?: string): Promise<UserProfile> {
  const emailVal = customEmail?.trim() || 'professor.gestao@escola.gov.br';
  const nameVal = customName?.trim() || 'Prof. Gestor(a) Escolar';
  const demoUid = 'prof-' + (Math.random().toString(36).substring(2, 10));

  const profile: UserProfile = {
    uid: demoUid,
    email: emailVal,
    displayName: nameVal,
    role: 'Professor(a) / Gestão Pedagógica',
    schoolName: 'Colégio Estadual Modelo',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  try {
    localStorage.setItem('auth_teacher_session', JSON.stringify(profile));
  } catch {}

  return profile;
}

/**
 * Encerra a sessão atual (Logout)
 */
export async function logoutUser(): Promise<void> {
  try {
    localStorage.removeItem('auth_teacher_session');
  } catch {}
  await signOut(auth);
}

/**
 * Busca perfil persistente do usuário no Firestore (/users/{userId})
 */
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      return userDoc.data() as UserProfile;
    }
    return null;
  } catch (err) {
    console.warn('Erro ao carregar perfil do usuário no Firestore:', err);
    return null;
  }
}

/**
 * Atualiza perfil persistente do usuário no Firestore
 */
export async function updateUserProfile(uid: string, data: Partial<UserProfile>): Promise<void> {
  const userRef = doc(db, 'users', uid);
  await setDoc(userRef, {
    ...data,
    updatedAt: new Date().toISOString()
  }, { merge: true });
}

/**
 * Monitora o estado de autenticação em tempo real
 */
export function subscribeToAuthState(callback: (user: FirebaseUser | null) => void) {
  return onAuthStateChanged(auth, callback);
}

/**
 * Saves a new student submission to Firestore
 */
export async function saveSubmissionToFirestore(submission: FormSubmission): Promise<void> {
  const docRef = doc(db, 'submissions', submission.id);
  await setDoc(docRef, {
    ...submission,
    createdAt: new Date().toISOString()
  });
}

/**
 * Subscribes to real-time changes in submissions
 */
export function subscribeToSubmissions(
  onUpdate: (submissions: FormSubmission[]) => void,
  onError?: (error: Error) => void
) {
  const q = query(submissionsCollection, limit(500));
  return onSnapshot(
    q,
    (snapshot) => {
      const results: FormSubmission[] = [];
      snapshot.forEach((d) => {
        const data = d.data() as FormSubmission;
        results.push(data);
      });
      // Sort in memory by timestamp / ID descending
      onUpdate(results);
    },
    (err) => {
      console.warn('Real-time listener notice:', err);
      if (onError) onError(err);
    }
  );
}

/**
 * Busca todas as respostas persistidas no Firestore
 */
export async function fetchSubmissionsFromFirestore(): Promise<FormSubmission[]> {
  try {
    const q = query(submissionsCollection, limit(500));
    const snapshot = await getDocs(q);
    const results: FormSubmission[] = [];
    snapshot.forEach((d) => {
      const data = d.data() as FormSubmission;
      results.push(data);
    });
    return results;
  } catch (err) {
    console.warn('Erro ao carregar do Firestore:', err);
    return [];
  }
}

/**
 * Deletes a submission from Firestore
 */
export async function deleteSubmissionFromFirestore(id: string): Promise<void> {
  try {
    const docRef = doc(db, 'submissions', id);
    await deleteDoc(docRef);
  } catch (err) {
    console.warn('Erro ao deletar submissão:', err);
    throw err;
  }
}

/**
 * Limpa todas as respostas do Firestore (iniciar novo ciclo de pesquisa)
 */
export async function deleteAllSubmissionsFromFirestore(): Promise<void> {
  try {
    const snapshot = await getDocs(submissionsCollection);
    const deletePromises = snapshot.docs.map((d) => deleteDoc(d.ref));
    await Promise.all(deletePromises);
  } catch (err) {
    console.warn('Erro ao limpar submissões do Firestore:', err);
    throw err;
  }
}

/**
 * Remove qualquer dado demonstrativo ou residual antigo (resp-001..resp-012)
 */
export async function cleanDemoSubmissionsFromFirestore(): Promise<void> {
  try {
    const snapshot = await getDocs(submissionsCollection);
    const demoIds = new Set([
      'resp-001', 'resp-002', 'resp-003', 'resp-004', 'resp-005', 'resp-006',
      'resp-007', 'resp-008', 'resp-009', 'resp-010', 'resp-011', 'resp-012'
    ]);
    const deletePromises = snapshot.docs
      .filter((d) => demoIds.has(d.id) || d.id.startsWith('mock-'))
      .map((d) => deleteDoc(d.ref));
    if (deletePromises.length > 0) {
      await Promise.all(deletePromises);
    }
  } catch (e) {
    console.warn('Erro ao limpar dados de teste no Firestore:', e);
  }
}

/**
 * Exclui todas as respostas de alunos do Firestore
 */
export async function clearAllSubmissionsFromFirestore(): Promise<void> {
  try {
    const q = query(submissionsCollection, limit(500));
    const snapshot = await getDocs(q);
    const deletePromises = snapshot.docs.map((d) => deleteDoc(d.ref));
    if (deletePromises.length > 0) {
      await Promise.all(deletePromises);
    }
  } catch (e) {
    console.warn('Erro ao limpar respostas no Firestore:', e);
  }
}


/**
 * Realiza teste de conexão e mede a latência em ms com o banco de dados
 */
export async function testDatabasePing(): Promise<{ ok: boolean; latencyMs: number; error?: string }> {
  const start = performance.now();
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    const latencyMs = Math.round(performance.now() - start);
    return { ok: true, latencyMs };
  } catch (err: unknown) {
    const latencyMs = Math.round(performance.now() - start);
    const msg = err instanceof Error ? err.message : String(err);
    // Even if permission or not found, if server responded it is online
    return { ok: !msg.includes('offline'), latencyMs, error: msg };
  }
}

