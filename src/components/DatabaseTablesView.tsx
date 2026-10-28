import React, { useState, useMemo } from 'react';
import { Question, FormSubmission, FormTheme, UserProfile } from '../types/form';
import { GRADE_OPTIONS } from '../data/questions';
import { 
  Database, 
  Table, 
  Columns, 
  Rows, 
  Search, 
  Download, 
  Plus, 
  RefreshCw, 
  CheckCircle2, 
  ExternalLink, 
  FileSpreadsheet, 
  ShieldCheck, 
  Copy, 
  Check, 
  FileCode, 
  ChevronRight, 
  Eye, 
  Server, 
  Activity, 
  Filter,
  ArrowUpDown,
  Lock,
  User,
  SlidersHorizontal,
  X,
  Trash2
} from 'lucide-react';
import { 
  SUPABASE_PROJECT_ID, 
  SUPABASE_URL, 
  SUPABASE_SETUP_SQL, 
  testDatabasePing 
} from '../supabase';
import { FIRESTORE_DATABASE_ID, FIREBASE_PROJECT_ID } from '../firebase';

interface DatabaseTablesViewProps {
  questions: Question[];
  submissions: FormSubmission[];
  currentUser: UserProfile | null;
  theme: FormTheme;
  onOpenSheets: () => void;
  onClearSubmissions?: () => void;
  onDeleteSubmission?: (id: string) => void;
  onRefreshSupabase?: () => void;
  isRefreshing?: boolean;
  onAddSimulatedResponse?: () => void;
}

export const DatabaseTablesView: React.FC<DatabaseTablesViewProps> = ({
  questions,
  submissions,
  currentUser,
  theme,
  onOpenSheets,
  onClearSubmissions,
  onDeleteSubmission,
  onRefreshSupabase,
  isRefreshing = false,
  onAddSimulatedResponse
}) => {
  const [selectedTable, setSelectedTable] = useState<'submissions' | 'users' | 'schema'>('submissions');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGrade, setSelectedGrade] = useState<string>('todos');
  const [selectedRowDetail, setSelectedRowDetail] = useState<FormSubmission | null>(null);
  const [sortField, setSortField] = useState<'timestamp' | 'grade' | 'id'>('timestamp');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [pingStatus, setPingStatus] = useState<{ testing: boolean; latencyMs?: number; ok?: boolean }>({ testing: false });
  const [copiedSql, setCopiedSql] = useState(false);

  // Measure database ping
  const handleCheckPing = async () => {
    setPingStatus({ testing: true });
    try {
      const res = await testDatabasePing();
      setPingStatus({ testing: false, latencyMs: res.latencyMs, ok: res.ok });
    } catch {
      setPingStatus({ testing: false, ok: false });
    }
  };

  // Filtered and sorted rows for submissions
  const filteredSubmissions = useMemo(() => {
    let result = submissions;
    if (selectedGrade !== 'todos') {
      result = result.filter(s => s.studentInfo.grade === selectedGrade);
    }
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(s => 
        s.id.toLowerCase().includes(term) ||
        s.studentInfo.grade.toLowerCase().includes(term) ||
        s.studentInfo.shift.toLowerCase().includes(term) ||
        (s.studentInfo.studentName && s.studentInfo.studentName.toLowerCase().includes(term))
      );
    }

    return [...result].sort((a, b) => {
      let valA = '';
      let valB = '';
      if (sortField === 'grade') {
        valA = a.studentInfo.grade;
        valB = b.studentInfo.grade;
      } else if (sortField === 'id') {
        valA = a.id;
        valB = b.id;
      } else {
        valA = a.timestamp;
        valB = b.timestamp;
      }
      return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
    });
  }, [submissions, selectedGrade, searchTerm, sortField, sortOrder]);

  // SQL DDL Schema string for Supabase PostgreSQL
  const sqlDdlScript = useMemo(() => {
    return SUPABASE_SETUP_SQL;
  }, []);

  // Export CSV
  const handleExportCSV = () => {
    const headers = [
      'id',
      'carimbo_data_hora',
      'turma_serie',
      'turno',
      'aluno_identificacao',
      ...questions.map(q => `p${q.id}`)
    ];

    const rows = filteredSubmissions.map(sub => [
      `"${sub.id}"`,
      `"${sub.timestamp}"`,
      `"${sub.studentInfo.grade}"`,
      `"${sub.studentInfo.shift}"`,
      `"${sub.studentInfo.isAnonymous ? 'Anônimo' : sub.studentInfo.studentName || 'Não informado'}"`,
      ...questions.map(q => `"${sub.answers[q.id] || ''}"`)
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + 
      [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

    const link = document.createElement('a');
    link.href = encodeURI(csvContent);
    link.download = `tabela_submissions_${FIRESTORE_DATABASE_ID.slice(0, 18)}_${Date.now()}.csv`;
    link.click();
  };

  // Copy SQL script
  const handleCopySql = () => {
    navigator.clipboard.writeText(sqlDdlScript);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8 space-y-6 animate-in fade-in duration-200">
      {/* 1. HERO BANNER: DATABASE LINK AND STATUS */}
      <div className="bg-white rounded-2xl border border-[#dadce0] shadow-sm overflow-hidden">
        {/* Top colored accent line */}
        <div 
          className="h-2.5 w-full"
          style={{ backgroundColor: theme.primaryColor }}
        />

        <div className="p-5 sm:p-6 space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-xs"
                style={{ backgroundColor: `${theme.primaryColor}15` }}
              >
                <Database className="w-6 h-6" style={{ color: theme.primaryColor }} />
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-xl font-bold text-[#202124] tracking-tight">
                    Vínculo do Sistema com o Banco de Dados
                  </h2>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Conectado em Tempo Real
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <span className="text-xs text-neutral-600">Supabase ID:</span>
                  <code className="bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded font-mono font-bold text-[11px] border border-emerald-200 select-all">
                    {SUPABASE_PROJECT_ID}
                  </code>
                  <span className="text-neutral-300">·</span>
                  <span className="text-xs text-neutral-500">PostgreSQL Cloud</span>
                </div>
              </div>
            </div>

            {/* Quick Actions & Ping Test */}
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <a
                href={`https://supabase.com/dashboard/project/${SUPABASE_PROJECT_ID}/sql/new`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200 transition-colors"
                title="Abrir o painel do Supabase SQL Editor para colar o script de tabelas"
              >
                <ExternalLink className="w-3.5 h-3.5 text-emerald-700" />
                <span>Supabase SQL Editor</span>
              </a>

              {onRefreshSupabase && (
                <button
                  type="button"
                  onClick={onRefreshSupabase}
                  disabled={isRefreshing}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200 transition-colors cursor-pointer"
                  title="Atualizar e buscar respostas diretamente do banco Supabase"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-emerald-700 ${isRefreshing ? 'animate-spin' : ''}`} />
                  <span>{isRefreshing ? 'Atualizando...' : 'Atualizar Supabase'}</span>
                </button>
              )}

              <button
                onClick={handleCheckPing}
                disabled={pingStatus.testing}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-700 bg-neutral-50 hover:bg-neutral-100 rounded-lg border border-neutral-200 transition-colors cursor-pointer"
                title="Testar latência e conectividade com o banco de dados Supabase"
              >
                <Activity className={`w-3.5 h-3.5 ${pingStatus.testing ? 'animate-spin text-purple-600' : 'text-emerald-600'}`} />
                <span>
                  {pingStatus.testing 
                    ? 'Testando conexão...' 
                    : pingStatus.latencyMs !== undefined 
                      ? `Ping: ${pingStatus.latencyMs} ms (Online)` 
                      : 'Testar Conexão'}
                </span>
              </button>

              <button
                onClick={onOpenSheets}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200 transition-colors cursor-pointer"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                <span>Planilha Google</span>
              </button>

              {onAddSimulatedResponse && (
                <button
                  onClick={onAddSimulatedResponse}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg shadow-xs transition-colors cursor-pointer"
                  title="Gera e grava uma linha de teste no banco de dados"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Inserir Linha de Teste</span>
                </button>
              )}
            </div>
          </div>

          {/* Metadata Cards Grid: Tables, Columns, Rows, Connection Details */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-[#f1f3f4]">
            <div className="bg-neutral-50/80 rounded-xl p-3 border border-neutral-100">
              <div className="text-[11px] text-neutral-500 flex items-center gap-1">
                <Table className="w-3.5 h-3.5 text-purple-600" />
                <span>Tabelas / Coleções</span>
              </div>
              <div className="text-lg font-bold text-neutral-900 mt-0.5">
                2 Tabelas
              </div>
              <div className="text-[10px] text-neutral-500 font-mono truncate">
                submissions · users
              </div>
            </div>

            <div className="bg-neutral-50/80 rounded-xl p-3 border border-neutral-100">
              <div className="text-[11px] text-neutral-500 flex items-center gap-1">
                <Columns className="w-3.5 h-3.5 text-blue-600" />
                <span>Colunas Estruturadas</span>
              </div>
              <div className="text-lg font-bold text-neutral-900 mt-0.5">
                {questions.length + 5} Colunas
              </div>
              <div className="text-[10px] text-neutral-500">
                15 questões + dados da turma
              </div>
            </div>

            <div className="bg-neutral-50/80 rounded-xl p-3 border border-neutral-100">
              <div className="text-[11px] text-neutral-500 flex items-center gap-1">
                <Rows className="w-3.5 h-3.5 text-emerald-600" />
                <span>Total de Linhas</span>
              </div>
              <div className="text-lg font-bold text-neutral-900 mt-0.5">
                {submissions.length} Registros
              </div>
              <div className="text-[10px] text-emerald-700 font-medium">
                Sincronizadas com Firestore
              </div>
            </div>

            <div className="bg-neutral-50/80 rounded-xl p-3 border border-neutral-100">
              <div className="text-[11px] text-neutral-500 flex items-center gap-1">
                <Server className="w-3.5 h-3.5 text-amber-600" />
                <span>Projeto Cloud</span>
              </div>
              <div className="text-sm font-bold text-neutral-900 mt-1 truncate" title={FIREBASE_PROJECT_ID}>
                {FIREBASE_PROJECT_ID}
              </div>
              <div className="text-[10px] text-neutral-500">
                Região: us-east1 (Ativo)
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. TABLE SELECTION TABS */}
      <div className="bg-white rounded-xl border border-[#dadce0] p-1.5 flex flex-wrap items-center justify-between gap-2 shadow-xs">
        <div className="flex items-center space-x-1">
          <button
            onClick={() => setSelectedTable('submissions')}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              selectedTable === 'submissions'
                ? 'bg-purple-50 text-purple-900 border border-purple-200 shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
            }`}
          >
            <Table className="w-4 h-4 text-purple-700" />
            <span>Tabela: submissions (Respostas dos Alunos)</span>
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-purple-200/60 text-purple-800 font-bold">
              {submissions.length} linhas
            </span>
          </button>

          <button
            onClick={() => setSelectedTable('users')}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              selectedTable === 'users'
                ? 'bg-purple-50 text-purple-900 border border-purple-200 shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
            }`}
          >
            <User className="w-4 h-4 text-purple-700" />
            <span>Tabela: users (Professores/Contas)</span>
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-neutral-200 text-neutral-700 font-bold">
              {currentUser ? '1 ativo' : '0 ativo'}
            </span>
          </button>

          <button
            onClick={() => setSelectedTable('schema')}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              selectedTable === 'schema'
                ? 'bg-purple-50 text-purple-900 border border-purple-200 shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
            }`}
          >
            <FileCode className="w-4 h-4 text-purple-700" />
            <span>Esquema SQL DDL &amp; Estrutura</span>
          </button>
        </div>

        {selectedTable === 'submissions' && (
          <div className="flex items-center gap-2 px-2">
            <button
              type="button"
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-700 hover:text-neutral-900 bg-neutral-50 hover:bg-neutral-100 rounded-md border border-neutral-200 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Exportar Linhas (CSV)</span>
            </button>

            {submissions.length > 0 && onClearSubmissions && (
              <button
                type="button"
                onClick={onClearSubmissions}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 rounded-md border border-red-200 transition-colors cursor-pointer"
                title="Zerar todas as respostas coletadas"
              >
                <Trash2 className="w-3.5 h-3.5 text-red-600" />
                <span>Zerar Respostas</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* 3. TAB CONTENT */}

      {/* TAB 1: SUBMISSIONS TABLE (COLUMNS AND ROWS) */}
      {selectedTable === 'submissions' && (
        <div className="bg-white rounded-xl border border-[#dadce0] shadow-sm overflow-hidden space-y-0">
          {/* Table Controls Header: Search & Turma Filter */}
          <div className="p-4 bg-neutral-50/70 border-b border-[#dadce0] flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
              {/* Search input */}
              <div className="relative flex-1 max-w-sm">
                <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder="Filtrar por ID, turma, turno ou aluno..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-white border border-[#dadce0] rounded-lg text-xs outline-hidden focus:border-purple-600 focus:ring-1 focus:ring-purple-600"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-2 top-2 text-neutral-400 hover:text-neutral-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Filter by Grade */}
              <div className="flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-neutral-500" />
                <select
                  value={selectedGrade}
                  onChange={(e) => setSelectedGrade(e.target.value)}
                  className="bg-white border border-[#dadce0] rounded-lg px-2.5 py-1.5 text-xs text-neutral-700 font-medium outline-hidden focus:border-purple-600 cursor-pointer"
                >
                  <option value="todos">Todas as Turmas ({submissions.length})</option>
                  {GRADE_OPTIONS.map(g => {
                    const count = submissions.filter(s => s.studentInfo.grade === g).length;
                    return (
                      <option key={g} value={g}>
                        {g} ({count})
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Sort Order */}
              <button
                onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-white border border-[#dadce0] rounded-lg text-neutral-700 hover:bg-neutral-50 transition-colors cursor-pointer"
                title="Inverter ordem de ordenação"
              >
                <ArrowUpDown className="w-3.5 h-3.5 text-neutral-500" />
                <span>{sortOrder === 'desc' ? 'Mais recentes primeiro' : 'Mais antigas primeiro'}</span>
              </button>
            </div>

            <div className="flex items-center gap-3 text-neutral-600 text-xs">
              <span>
                Mostrando <strong>{filteredSubmissions.length}</strong> de <strong>{submissions.length}</strong> linhas
              </span>
              <span>·</span>
              <span><strong>{questions.length + 5}</strong> colunas mapeadas</span>
            </div>
          </div>

          {/* Interactive Columns & Rows Table */}
          <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead className="bg-[#f8f9fa] sticky top-0 z-10 border-b border-[#dadce0] text-neutral-700 select-none shadow-xs">
                <tr>
                  <th className="px-3 py-2.5 border-r border-[#dadce0] bg-[#f1f3f4] text-center w-12 font-mono text-[11px] text-neutral-500">
                    #
                  </th>
                  <th className="px-3 py-2.5 border-r border-[#dadce0] min-w-[130px] font-semibold text-neutral-800">
                    <div className="flex items-center justify-between">
                      <span>id (PK)</span>
                      <span className="text-[10px] text-neutral-400 font-mono font-normal">VARCHAR</span>
                    </div>
                  </th>
                  <th className="px-3 py-2.5 border-r border-[#dadce0] min-w-[140px] font-semibold text-neutral-800">
                    <div className="flex items-center justify-between">
                      <span>timestamp</span>
                      <span className="text-[10px] text-neutral-400 font-mono font-normal">VARCHAR</span>
                    </div>
                  </th>
                  <th className="px-3 py-2.5 border-r border-[#dadce0] min-w-[160px] font-semibold text-neutral-800">
                    <div className="flex items-center justify-between">
                      <span>turma (grade)</span>
                      <span className="text-[10px] text-neutral-400 font-mono font-normal">VARCHAR</span>
                    </div>
                  </th>
                  <th className="px-3 py-2.5 border-r border-[#dadce0] min-w-[120px] font-semibold text-neutral-800">
                    <div className="flex items-center justify-between">
                      <span>turno (shift)</span>
                      <span className="text-[10px] text-neutral-400 font-mono font-normal">VARCHAR</span>
                    </div>
                  </th>
                  <th className="px-3 py-2.5 border-r border-[#dadce0] min-w-[130px] font-semibold text-neutral-800">
                    <div className="flex items-center justify-between">
                      <span>identificacao</span>
                      <span className="text-[10px] text-neutral-400 font-mono font-normal">VARCHAR</span>
                    </div>
                  </th>
                  {questions.map((q) => (
                    <th 
                      key={q.id} 
                      className="px-3 py-2.5 border-r border-[#dadce0] min-w-[140px] font-semibold text-neutral-800"
                      title={q.text}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-purple-700 font-bold">P{q.id}</span>
                        <span className="text-[10px] text-neutral-400 font-mono font-normal">ENUM</span>
                      </div>
                    </th>
                  ))}
                  <th className="px-3 py-2.5 min-w-[100px] text-center font-semibold text-neutral-800">
                    Ação
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {filteredSubmissions.length === 0 ? (
                  <tr>
                    <td colSpan={questions.length + 7} className="text-center py-16 px-4">
                      <div className="max-w-md mx-auto space-y-2">
                        <Table className="w-8 h-8 text-neutral-300 mx-auto" />
                        <p className="text-sm font-semibold text-neutral-700">
                          Nenhuma resposta registrada ainda
                        </p>
                        <p className="text-xs text-neutral-400 leading-relaxed">
                          As respostas de teste foram removidas com sucesso. Assim que os alunos responderem ao questionário, cada envio aparecerá nesta tabela em tempo real sincronizado com o banco de dados.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredSubmissions.map((sub, idx) => (
                    <tr 
                      key={sub.id || idx} 
                      className="hover:bg-purple-50/40 transition-colors group cursor-pointer"
                      onClick={() => setSelectedRowDetail(sub)}
                    >
                      <td className="px-3 py-2 text-center text-neutral-400 font-mono text-[11px] bg-neutral-50/50 border-r border-neutral-200 select-none">
                        {idx + 1}
                      </td>
                      <td className="px-3 py-2 font-mono text-[11px] text-neutral-700 border-r border-neutral-200 whitespace-nowrap">
                        <span className="bg-neutral-100 text-neutral-800 px-1.5 py-0.5 rounded border border-neutral-200">
                          {sub.id}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-neutral-600 border-r border-neutral-200 whitespace-nowrap">
                        {sub.timestamp}
                      </td>
                      <td className="px-3 py-2 font-medium text-neutral-900 border-r border-neutral-200 whitespace-nowrap">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-50 text-blue-800 border border-blue-200">
                          {sub.studentInfo.grade}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-neutral-700 border-r border-neutral-200 whitespace-nowrap">
                        {sub.studentInfo.shift}
                      </td>
                      <td className="px-3 py-2 text-neutral-600 border-r border-neutral-200 whitespace-nowrap">
                        {sub.studentInfo.isAnonymous ? (
                          <span className="text-neutral-400 italic">Anônimo</span>
                        ) : (
                          <span className="font-medium text-neutral-800">{sub.studentInfo.studentName || 'Não informado'}</span>
                        )}
                      </td>
                      {questions.map((q) => {
                        const ans = sub.answers[q.id];
                        return (
                          <td 
                            key={q.id} 
                            className="px-3 py-2 text-center border-r border-neutral-200 whitespace-nowrap"
                          >
                            <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold ${
                              ans === 'Sim' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                              ans === 'Não' ? 'bg-red-100 text-red-800 border border-red-200' :
                              ans === 'Talvez' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                              'text-neutral-400'
                            }`}>
                              {ans || '-'}
                            </span>
                          </td>
                        );
                      })}
                      <td className="px-3 py-2 text-center whitespace-nowrap space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedRowDetail(sub);
                          }}
                          className="inline-flex items-center gap-1 text-purple-700 hover:text-purple-900 hover:underline font-semibold cursor-pointer"
                          title="Inspecionar linha detalhadamente"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Ver</span>
                        </button>

                        {onDeleteSubmission && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteSubmission(sub.id);
                            }}
                            className="inline-flex items-center gap-1 text-red-600 hover:text-red-800 hover:underline font-semibold cursor-pointer"
                            title={`Excluir resposta ${sub.id} do Supabase`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Excluir</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          <div className="p-3 bg-neutral-50 border-t border-[#dadce0] flex flex-wrap items-center justify-between text-xs text-neutral-600">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>
                Banco de Dados: <code className="font-mono text-purple-900 font-bold">{FIRESTORE_DATABASE_ID}</code> · Tabela: <code className="font-mono text-neutral-800 font-semibold">submissions</code>
              </span>
            </div>
            <div className="text-neutral-500">
              Clique em qualquer linha da tabela para abrir a inspeção completa do registro
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: USERS TABLE (PROFILES/ACCOUNTS) */}
      {selectedTable === 'users' && (
        <div className="bg-white rounded-xl border border-[#dadce0] shadow-sm overflow-hidden space-y-0">
          <div className="p-4 bg-neutral-50/70 border-b border-[#dadce0] flex items-center justify-between text-xs">
            <div>
              <h3 className="font-bold text-neutral-800 text-sm">
                Tabela: users (Professores e Coordenadores Autenticados)
              </h3>
              <p className="text-neutral-500 mt-0.5">
                Coleção do Firestore <code className="font-mono text-purple-700">/users/{'{userId}'}</code> integrada ao Firebase Authentication.
              </p>
            </div>
            <span className="px-2.5 py-1 bg-purple-100 text-purple-800 rounded-full font-bold text-xs">
              {currentUser ? '1 registro autenticado' : 'Nenhum usuário logado'}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead className="bg-[#f8f9fa] border-b border-[#dadce0] text-neutral-700 select-none">
                <tr>
                  <th className="px-3 py-2.5 border-r border-[#dadce0] font-semibold text-neutral-800">
                    uid (PK)
                  </th>
                  <th className="px-3 py-2.5 border-r border-[#dadce0] font-semibold text-neutral-800">
                    email
                  </th>
                  <th className="px-3 py-2.5 border-r border-[#dadce0] font-semibold text-neutral-800">
                    displayName
                  </th>
                  <th className="px-3 py-2.5 border-r border-[#dadce0] font-semibold text-neutral-800">
                    role
                  </th>
                  <th className="px-3 py-2.5 border-r border-[#dadce0] font-semibold text-neutral-800">
                    schoolName
                  </th>
                  <th className="px-3 py-2.5 font-semibold text-neutral-800">
                    updatedAt
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {currentUser ? (
                  <tr className="hover:bg-purple-50/40">
                    <td className="px-3 py-2.5 font-mono text-[11px] text-neutral-700 border-r border-neutral-200">
                      <span className="bg-neutral-100 text-neutral-800 px-1.5 py-0.5 rounded border border-neutral-200">
                        {currentUser.uid}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 font-medium text-neutral-900 border-r border-neutral-200">
                      {currentUser.email}
                    </td>
                    <td className="px-3 py-2.5 text-neutral-800 border-r border-neutral-200">
                      {currentUser.displayName || 'Professor(a)'}
                    </td>
                    <td className="px-3 py-2.5 border-r border-neutral-200">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-purple-100 text-purple-800">
                        {currentUser.role || 'professor'}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-neutral-700 border-r border-neutral-200">
                      {currentUser.schoolName || 'Escola Padrão'}
                    </td>
                    <td className="px-3 py-2.5 font-mono text-[11px] text-neutral-500">
                      {currentUser.updatedAt || new Date().toISOString()}
                    </td>
                  </tr>
                ) : (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-neutral-400">
                      Nenhum usuário logado no momento. Faça login na Área do Professor para carregar a sessão.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="p-4 bg-neutral-50 border-t border-[#dadce0] text-xs text-neutral-600 flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-neutral-500">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Regras do Firestore protegem a tabela <code className="font-mono">users</code> para que cada usuário acesse apenas seus dados.
            </span>
          </div>
        </div>
      )}

      {/* TAB 3: RELATIONAL SCHEMA (SQL DDL SCRIPT & DEFINITIONS) */}
      {selectedTable === 'schema' && (
        <div className="bg-white rounded-xl border border-[#dadce0] shadow-sm overflow-hidden space-y-4 p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                <FileCode className="w-4 h-4 text-purple-700" />
                <span>Estrutura SQL e Políticas RLS do Supabase (kd-studios)</span>
              </h3>
              <p className="text-xs text-neutral-500 mt-0.5">
                Script SQL pronto para criar as tabelas <code className="font-mono text-purple-700 font-semibold">users</code> e <code className="font-mono text-purple-700 font-semibold">submissions</code> com políticas RLS no painel do Supabase.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <a
                href={`https://supabase.com/dashboard/project/${SUPABASE_PROJECT_ID}/sql/new`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200 transition-colors"
                title="Abrir o SQL Editor diretamente no painel do Supabase"
              >
                <ExternalLink className="w-3.5 h-3.5 text-emerald-700" />
                <span>Abrir SQL Editor</span>
              </a>

              <button
                onClick={handleCopySql}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-lg border border-neutral-300 transition-colors cursor-pointer shrink-0"
              >
                {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSql ? 'Copiado!' : 'Copiar Script SQL'}</span>
              </button>
            </div>
          </div>

          <div className="relative">
            <pre className="bg-neutral-950 text-neutral-100 p-4 rounded-xl text-xs font-mono overflow-x-auto leading-relaxed border border-neutral-800 shadow-inner">
              {sqlDdlScript}
            </pre>
          </div>
        </div>
      )}

      {/* MODAL: ROW DETAIL INSPECTOR */}
      {selectedRowDetail && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-neutral-300">
            {/* Modal Header */}
            <div className="bg-neutral-900 text-white px-5 py-3.5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <Rows className="w-4 h-4 text-purple-400" />
                <div>
                  <h3 className="text-sm font-bold">
                    Inspeção de Linha: {selectedRowDetail.id}
                  </h3>
                  <div className="text-[11px] text-neutral-400">
                    Tabela: submissions · {selectedRowDetail.studentInfo.grade}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedRowDetail(null)}
                className="text-neutral-400 hover:text-white p-1 rounded-md transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body: Column by Column Breakdown */}
            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              <div className="bg-neutral-50 rounded-lg p-3.5 border border-neutral-200 space-y-2">
                <h4 className="font-bold text-neutral-800 uppercase tracking-wider text-[10px]">
                  Metadados da Linha no Firestore
                </h4>
                <div className="grid grid-cols-2 gap-2 text-neutral-700">
                  <div>
                    <span className="text-neutral-500">ID da Linha:</span>{' '}
                    <code className="font-mono font-semibold">{selectedRowDetail.id}</code>
                  </div>
                  <div>
                    <span className="text-neutral-500">Carimbo de Data:</span>{' '}
                    <span className="font-semibold">{selectedRowDetail.timestamp}</span>
                  </div>
                  <div>
                    <span className="text-neutral-500">Turma / Série:</span>{' '}
                    <span className="font-semibold text-purple-800">{selectedRowDetail.studentInfo.grade}</span>
                  </div>
                  <div>
                    <span className="text-neutral-500">Turno:</span>{' '}
                    <span className="font-semibold">{selectedRowDetail.studentInfo.shift}</span>
                  </div>
                  <div>
                    <span className="text-neutral-500">Identificação:</span>{' '}
                    <span>{selectedRowDetail.studentInfo.isAnonymous ? 'Anônimo (Sigiloso)' : selectedRowDetail.studentInfo.studentName || 'Não informado'}</span>
                  </div>
                  <div>
                    <span className="text-neutral-500">Banco de Dados:</span>{' '}
                    <code className="text-[10px] text-purple-700 font-mono">{FIRESTORE_DATABASE_ID.slice(0, 20)}...</code>
                  </div>
                </div>
              </div>

              {/* Answers Grid */}
              <div className="space-y-2">
                <h4 className="font-bold text-neutral-800 uppercase tracking-wider text-[10px]">
                  Respostas Registradas nas 15 Colunas (P1 a P15)
                </h4>
                <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
                  {questions.map((q) => {
                    const ans = selectedRowDetail.answers[q.id];
                    return (
                      <div 
                        key={q.id}
                        className="flex items-center justify-between p-2 rounded-md bg-neutral-50 border border-neutral-200 hover:bg-neutral-100 transition-colors"
                      >
                        <div className="flex-1 pr-2 truncate">
                          <span className="font-bold text-purple-700">P{q.id}:</span>{' '}
                          <span className="text-neutral-700">{q.text}</span>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[11px] font-bold shrink-0 ${
                          ans === 'Sim' ? 'bg-emerald-100 text-emerald-800' :
                          ans === 'Não' ? 'bg-red-100 text-red-800' :
                          ans === 'Talvez' ? 'bg-amber-100 text-amber-800' :
                          'text-neutral-400'
                        }`}>
                          {ans || '-'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Raw JSON Payload */}
              <div className="space-y-1.5">
                <h4 className="font-bold text-neutral-800 uppercase tracking-wider text-[10px]">
                  Objeto JSON Bruto (Firestore Document)
                </h4>
                <pre className="bg-neutral-900 text-emerald-400 p-3 rounded-lg font-mono text-[11px] overflow-x-auto border border-neutral-800">
                  {JSON.stringify(selectedRowDetail, null, 2)}
                </pre>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-3 bg-neutral-100 border-t border-neutral-200 flex items-center justify-between">
              {onDeleteSubmission ? (
                <button
                  onClick={() => {
                    const id = selectedRowDetail.id;
                    setSelectedRowDetail(null);
                    onDeleteSubmission(id);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
                  title="Excluir esta resposta permanentemente do Supabase"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Excluir esta Resposta</span>
                </button>
              ) : <div />}

              <button
                onClick={() => setSelectedRowDetail(null)}
                className="px-4 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg text-xs font-semibold cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
