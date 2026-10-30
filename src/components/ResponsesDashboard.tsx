import React, { useState, useMemo } from 'react';
import { Question, FormSubmission, FormTheme, OptionValue } from '../types/form';
import { GRADE_OPTIONS } from '../data/questions';
import { 
  FileSpreadsheet, 
  Download, 
  Printer, 
  Trash2, 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  PieChart, 
  ListOrdered, 
  User, 
  Plus, 
  Info,
  CheckCircle2,
  TrendingUp,
  School,
  BarChart2,
  Users,
  ShieldAlert,
  ArrowUpRight,
  Database,
  RefreshCw
} from 'lucide-react';

interface ResponsesDashboardProps {
  questions: Question[];
  submissions: FormSubmission[];
  theme: FormTheme;
  onOpenSheets: () => void;
  onClearSubmissions: () => void;
  onDeleteSubmission?: (id: string) => void;
  onNavigateToTables?: () => void;
  onRefreshSupabase?: () => void;
  isRefreshing?: boolean;
}

export const ResponsesDashboard: React.FC<ResponsesDashboardProps> = ({
  questions,
  submissions,
  theme,
  onOpenSheets,
  onClearSubmissions,
  onDeleteSubmission,
  onNavigateToTables,
  onRefreshSupabase,
  isRefreshing = false
}) => {
  const [subTab, setSubTab] = useState<'resumo' | 'turmas' | 'pergunta' | 'individual'>('turmas');
  const [selectedGradeFilter, setSelectedGradeFilter] = useState<string>('todos');
  const [activeQuestionId, setActiveQuestionId] = useState<number>(1);
  const [currentIndividualIndex, setCurrentIndividualIndex] = useState<number>(0);
  const [isAcceptingResponses, setIsAcceptingResponses] = useState<boolean>(true);
  const [selectedTurmaDetail, setSelectedTurmaDetail] = useState<string>(GRADE_OPTIONS[0]);

  // Filter submissions by Grade if chosen
  const filteredSubmissions = useMemo(() => {
    if (selectedGradeFilter === 'todos') return submissions;
    return submissions.filter(s => s.studentInfo.grade === selectedGradeFilter);
  }, [submissions, selectedGradeFilter]);

  // Statistics per Turma
  const turmaStats = useMemo(() => {
    const map: Record<string, { total: number; sim: number; nao: number; talvez: number }> = {};
    
    // Initialize all grade options
    GRADE_OPTIONS.forEach(g => {
      map[g] = { total: 0, sim: 0, nao: 0, talvez: 0 };
    });

    submissions.forEach(sub => {
      const g = sub.studentInfo.grade || 'Outra Turma';
      if (!map[g]) {
        map[g] = { total: 0, sim: 0, nao: 0, talvez: 0 };
      }
      map[g].total += 1;
      Object.values(sub.answers).forEach(ans => {
        if (ans === 'Sim') map[g].sim += 1;
        else if (ans === 'Não') map[g].nao += 1;
        else if (ans === 'Talvez') map[g].talvez += 1;
      });
    });

    return Object.entries(map).map(([grade, data]) => {
      const totalAnswers = data.sim + data.nao + data.talvez;
      const simRate = totalAnswers > 0 ? Math.round((data.sim / totalAnswers) * 100) : 0;
      const shortGrade = grade.match(/\((.*?)\)/)?.[1] || grade.replace(' - Ensino Fundamental', '').replace(' - Ensino Médio', '');

      return {
        grade,
        shortGrade,
        total: data.total,
        sim: data.sim,
        nao: data.nao,
        talvez: data.talvez,
        totalAnswers,
        simRate
      };
    }).sort((a, b) => b.total - a.total);
  }, [submissions]);

  const maxTurmaCount = useMemo(() => {
    const max = Math.max(...turmaStats.map(t => t.total), 1);
    return max;
  }, [turmaStats]);

  // Download CSV handler
  const handleDownloadCSV = () => {
    if (submissions.length === 0) return;

    const headers = [
      'Carimbo de data/hora',
      'Turma/Série',
      'Turno',
      'Identificação',
      ...questions.map(q => `P${q.id} - ${q.text.slice(0, 30)}...`)
    ];

    const rows = submissions.map(sub => [
      `"${sub.timestamp}"`,
      `"${sub.studentInfo.grade}"`,
      `"${sub.studentInfo.shift}"`,
      `"${sub.studentInfo.isAnonymous ? 'Anônimo' : sub.studentInfo.studentName || 'Não informado'}"`,
      ...questions.map(q => `"${sub.answers[q.id] || 'Sem resposta'}"`)
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + 
      [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `pesquisa_bullying_escola_silvio_oliveira_dos_santos_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  // Compute stats for all 15 questions
  const questionsStats = useMemo(() => {
    return questions.map(q => {
      let sim = 0;
      let nao = 0;
      let talvez = 0;

      filteredSubmissions.forEach(sub => {
        const val = sub.answers[q.id];
        if (val === 'Sim') sim++;
        else if (val === 'Não') nao++;
        else if (val === 'Talvez') talvez++;
      });

      const total = sim + nao + talvez;
      const simPct = total > 0 ? Math.round((sim / total) * 100) : 0;
      const naoPct = total > 0 ? Math.round((nao / total) * 100) : 0;
      const talvezPct = total > 0 ? Math.round((talvez / total) * 100) : 0;

      return {
        question: q,
        sim,
        nao,
        talvez,
        total,
        simPct,
        naoPct,
        talvezPct
      };
    });
  }, [questions, filteredSubmissions]);

  // Overall consensus indicator
  const highAwarenessCount = questionsStats.filter(s => s.simPct >= 70).length;

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 py-6 sm:py-8 space-y-5">
      {/* 1. Header Card (Stats, Toggle & Export Buttons) */}
      <div className="bg-white rounded-lg border border-[#dadce0] p-5 sm:p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#f1f3f4] pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-purple-100 text-purple-800 flex items-center gap-1">
                <School className="w-3.5 h-3.5 text-purple-700" />
                Escola Silvio Oliveira dos Santos
              </span>
              <span className="text-xs text-neutral-500">· Painel do Professor &amp; Direção</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-3xl sm:text-4xl font-normal text-[#202124]">
                {submissions.length}
              </span>
              <span className="text-xl sm:text-2xl font-light text-neutral-600">
                {submissions.length === 1 ? 'resposta recebida' : 'respostas recebidas'}
              </span>
            </div>
            <p className="text-xs text-neutral-500 mt-1">
              As respostas enviadas pelos estudantes caem automaticamente aqui nesta aba.
            </p>
          </div>

          {/* Accepting responses switch */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-neutral-700">
                {isAcceptingResponses ? 'Aceitando respostas' : 'Não aceitando respostas'}
              </span>
              <button
                type="button"
                onClick={() => setIsAcceptingResponses(!isAcceptingResponses)}
                className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                  isAcceptingResponses ? 'bg-purple-600' : 'bg-neutral-300'
                }`}
                title="Ativar/desativar novas respostas"
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    isAcceptingResponses ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1">
          <div className="flex flex-wrap items-center gap-2">
            {/* Open in Database Tables (Colunas e Linhas) */}
            {onNavigateToTables && (
              <button
                onClick={onNavigateToTables}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-purple-900 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-md transition-colors cursor-pointer"
                title="Acessar o Banco de Dados com tabelas, colunas e linhas"
              >
                <Database className="w-4 h-4 text-purple-700" />
                <span>Banco de Dados (Tabelas &amp; Linhas)</span>
              </button>
            )}

            {/* Sincronizar / Atualizar Supabase */}
            {onRefreshSupabase && (
              <button
                type="button"
                onClick={onRefreshSupabase}
                disabled={isRefreshing}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-md transition-colors cursor-pointer"
                title="Sincronizar e buscar respostas atualizadas no Supabase"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-emerald-700 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span>{isRefreshing ? 'Atualizando...' : 'Atualizar Supabase'}</span>
              </button>
            )}

            {/* Open in Sheets */}
            <button
              type="button"
              onClick={onOpenSheets}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-md transition-colors cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Ver no Planilhas Google</span>
            </button>

            {/* Download CSV */}
            <button
              onClick={handleDownloadCSV}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-md transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Baixar CSV</span>
            </button>

            {/* Print */}
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-100 rounded-md transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Imprimir Relatório</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {/* Clear all responses */}
            {submissions.length > 0 && (
              <button
                type="button"
                onClick={onClearSubmissions}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-md transition-colors cursor-pointer shadow-2xs"
                title="Zerar todas as respostas coletadas"
              >
                <Trash2 className="w-3.5 h-3.5 text-red-600" />
                <span>Zerar Respostas</span>
              </button>
            )}
          </div>
        </div>

        {/* Sub-Tabs: Gráfico por Turma, Resumo Geral, Pergunta, Individual */}
        <div className="flex border-b border-[#dadce0] -mx-5 sm:-mx-6 px-5 sm:px-6 pt-2 overflow-x-auto">
          <button
            onClick={() => setSubTab('turmas')}
            className={`py-2 px-4 text-xs font-medium border-b-2 transition-colors flex items-center gap-1.5 shrink-0 ${
              subTab === 'turmas'
                ? 'border-purple-600 text-purple-700 font-semibold'
                : 'border-transparent text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5" />
            <span>Gráfico por Turma</span>
          </button>

          <button
            onClick={() => setSubTab('resumo')}
            className={`py-2 px-4 text-xs font-medium border-b-2 transition-colors flex items-center gap-1.5 shrink-0 ${
              subTab === 'resumo'
                ? 'border-purple-600 text-purple-700 font-semibold'
                : 'border-transparent text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <PieChart className="w-3.5 h-3.5" />
            <span>Resumo Geral</span>
          </button>

          <button
            onClick={() => setSubTab('pergunta')}
            className={`py-2 px-4 text-xs font-medium border-b-2 transition-colors flex items-center gap-1.5 shrink-0 ${
              subTab === 'pergunta'
                ? 'border-purple-600 text-purple-700 font-semibold'
                : 'border-transparent text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <ListOrdered className="w-3.5 h-3.5" />
            <span>Por Pergunta</span>
          </button>

          <button
            onClick={() => setSubTab('individual')}
            className={`py-2 px-4 text-xs font-medium border-b-2 transition-colors flex items-center gap-1.5 shrink-0 ${
              subTab === 'individual'
                ? 'border-purple-600 text-purple-700 font-semibold'
                : 'border-transparent text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Individual</span>
          </button>
        </div>

        {/* Filter bar for Resumo & Pergunta */}
        {(subTab === 'resumo' || subTab === 'pergunta') && (
          <div className="flex flex-wrap items-center justify-between gap-3 bg-neutral-50 p-2.5 rounded-md border border-neutral-200 text-xs">
            <div className="flex items-center gap-2 text-neutral-700">
              <Filter className="w-3.5 h-3.5 text-neutral-500" />
              <span className="font-semibold">Filtrar por Turma:</span>
              <select
                value={selectedGradeFilter}
                onChange={(e) => setSelectedGradeFilter(e.target.value)}
                className="bg-white border border-neutral-300 rounded px-2 py-1 text-xs text-neutral-800 outline-hidden"
              >
                <option value="todos">Todas as Turmas ({submissions.length})</option>
                {GRADE_OPTIONS.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>

            <div className="text-neutral-600">
              Exibindo <strong>{filteredSubmissions.length}</strong> de {submissions.length} respostas
            </div>
          </div>
        )}
      </div>

      {/* ===================== SUBTAB: GRÁFICO POR TURMA ===================== */}
      {subTab === 'turmas' && (
        <div className="space-y-5">
          {/* Top Banner: Turma Overview */}
          <div className="bg-white rounded-lg border border-[#dadce0] p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#f1f3f4] pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-purple-100 flex items-center justify-center text-purple-700">
                  <BarChart2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-neutral-900">
                    Comparativo e Distribuição por Turma (1º, 2º, 3º Anos e Fundamental)
                  </h3>
                  <p className="text-xs text-neutral-500">
                    Volume de alunos participantes e taxa de concordância sobre temas de bullying
                  </p>
                </div>
              </div>

              <div className="text-xs text-neutral-500 bg-neutral-50 px-3 py-1.5 rounded border border-neutral-200">
                Total de turmas cadastradas: <strong>{GRADE_OPTIONS.length}</strong>
              </div>
            </div>

            {/* Main Bar Chart: Participation by Class */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between text-xs font-semibold text-neutral-700">
                <span>Respostas Recebidas por Turma</span>
                <span>Nº de Alunos</span>
              </div>

              <div className="space-y-2">
                {turmaStats
                  .filter(t => t.total > 0 || t.grade.includes('1º Ano') || t.grade.includes('2º Ano') || t.grade.includes('3º Ano'))
                  .map((t) => {
                    const widthPercent = Math.max(Math.round((t.total / maxTurmaCount) * 100), 2);

                    return (
                      <div key={t.grade} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-medium text-neutral-800 flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-purple-600" />
                            {t.grade}
                          </span>
                          <span className="font-bold text-neutral-900">
                            {t.total} {t.total === 1 ? 'aluno' : 'alunos'}
                          </span>
                        </div>
                        <div className="w-full bg-neutral-100 h-3.5 rounded-full overflow-hidden flex">
                          <div 
                            className="bg-purple-600 h-full rounded-full transition-all duration-500 flex items-center justify-end pr-1 text-[9px] text-white font-bold"
                            style={{ width: `${widthPercent}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>

          {/* Detailed Turma Inspection Card */}
          <div className="bg-white rounded-lg border border-[#dadce0] p-5 sm:p-6 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#f1f3f4] pb-4">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-700" />
                <h4 className="text-sm font-semibold text-neutral-900">
                  Análise Detalhada da Turma Selecionada:
                </h4>
              </div>

              <select
                value={selectedTurmaDetail}
                onChange={(e) => setSelectedTurmaDetail(e.target.value)}
                className="bg-neutral-50 border border-[#dadce0] rounded-md px-3 py-1.5 text-xs text-neutral-800 font-medium outline-hidden focus:border-purple-600"
              >
                {GRADE_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            {(() => {
              const detailSubmissions = submissions.filter(s => s.studentInfo.grade === selectedTurmaDetail);
              const count = detailSubmissions.length;

              if (count === 0) {
                return (
                  <div className="p-8 text-center text-xs text-neutral-500 bg-neutral-50 rounded-lg border border-dashed border-neutral-300">
                    <p className="font-medium text-neutral-700 mb-1">Nenhuma resposta registrada para esta turma ainda.</p>
                    <p>Compartilhe o formulário com os alunos do {selectedTurmaDetail} para iniciar a coleta.</p>
                  </div>
                );
              }

              // Compute stats for selected turma
              let simTotal = 0;
              let naoTotal = 0;
              let talvezTotal = 0;

              detailSubmissions.forEach(s => {
                Object.values(s.answers).forEach(val => {
                  if (val === 'Sim') simTotal++;
                  else if (val === 'Não') naoTotal++;
                  else if (val === 'Talvez') talvezTotal++;
                });
              });

              const allTotal = simTotal + naoTotal + talvezTotal;
              const simPct = allTotal > 0 ? Math.round((simTotal / allTotal) * 100) : 0;
              const naoPct = allTotal > 0 ? Math.round((naoTotal / allTotal) * 100) : 0;
              const talvezPct = allTotal > 0 ? Math.round((talvezTotal / allTotal) * 100) : 0;

              return (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                    <div className="p-3 bg-purple-50 rounded-lg border border-purple-100">
                      <span className="text-neutral-500 block">Total de Alunos</span>
                      <span className="text-2xl font-bold text-purple-950 mt-0.5 block">{count}</span>
                      <span className="text-purple-700 text-[11px]">Respostas coletadas</span>
                    </div>

                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                      <span className="text-neutral-500 block">Respostas &quot;Sim&quot;</span>
                      <span className="text-2xl font-bold text-blue-900 mt-0.5 block">{simPct}%</span>
                      <span className="text-blue-700 text-[11px]">{simTotal} marcações</span>
                    </div>

                    <div className="p-3 bg-amber-50 rounded-lg border border-amber-100">
                      <span className="text-neutral-500 block">Respostas &quot;Talvez&quot;</span>
                      <span className="text-2xl font-bold text-amber-900 mt-0.5 block">{talvezPct}%</span>
                      <span className="text-amber-700 text-[11px]">{talvezTotal} marcações</span>
                    </div>

                    <div className="p-3 bg-red-50 rounded-lg border border-red-100">
                      <span className="text-neutral-500 block">Respostas &quot;Não&quot;</span>
                      <span className="text-2xl font-bold text-red-900 mt-0.5 block">{naoPct}%</span>
                      <span className="text-red-700 text-[11px]">{naoTotal} marcações</span>
                    </div>
                  </div>

                  {/* Summary Bar */}
                  <div className="space-y-1.5 pt-2">
                    <div className="flex justify-between text-xs text-neutral-600">
                      <span>Distribuição Geral dos Votos nesta Turma</span>
                      <span>100% computado</span>
                    </div>
                    <div className="w-full h-4 rounded-full overflow-hidden flex bg-neutral-100">
                      <div style={{ width: `${simPct}%` }} className="bg-[#1a73e8] h-full" title={`Sim: ${simPct}%`} />
                      <div style={{ width: `${talvezPct}%` }} className="bg-[#f9ab00] h-full" title={`Talvez: ${talvezPct}%`} />
                      <div style={{ width: `${naoPct}%` }} className="bg-[#d93025] h-full" title={`Não: ${naoPct}%`} />
                    </div>
                    <div className="flex items-center gap-4 text-[11px] text-neutral-600 pt-1">
                      <span className="flex items-center gap-1">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#1a73e8]" /> Sim ({simPct}%)
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#f9ab00]" /> Talvez ({talvezPct}%)
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#d93025]" /> Não ({naoPct}%)
                      </span>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* ===================== SUBTAB: RESUMO GERAL ===================== */}
      {subTab === 'resumo' && (
        <div className="space-y-4">
          {/* Pedagogical Executive Summary Card */}
          <div className="bg-white rounded-lg border border-[#dadce0] p-5 shadow-xs">
            <div className="flex items-center gap-2 text-sm font-semibold text-neutral-900 mb-2">
              <TrendingUp className="w-4 h-4 text-purple-700" />
              <span>Diagnóstico Pedagógico Geral da Pesquisa</span>
            </div>
            <p className="text-xs text-neutral-600 leading-relaxed mb-4">
              Os dados coletados apontam o grau de percepção crítica dos estudantes frente à violência escolar, cyberbullying e dever institucional de proteção.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-purple-50 rounded-lg border border-purple-100">
                <span className="text-purple-800 font-medium block">Total de Participantes</span>
                <span className="text-2xl font-bold text-purple-950 mt-1 block">
                  {filteredSubmissions.length}
                </span>
                <span className="text-purple-700 text-[11px]">Estudantes ouvidos</span>
              </div>

              <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-100">
                <span className="text-emerald-800 font-medium block">Consciência Crítica Elevada</span>
                <span className="text-2xl font-bold text-emerald-950 mt-1 block">
                  {highAwarenessCount} de 15
                </span>
                <span className="text-emerald-700 text-[11px]">Questões com &gt;70% &quot;Sim&quot;</span>
              </div>

              <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                <span className="text-blue-800 font-medium block">Marco Legal Aplicável</span>
                <span className="text-base font-bold text-blue-950 mt-1 block">
                  Leis 13.185 &amp; 14.811
                </span>
                <span className="text-blue-700 text-[11px]">Combate Sistemático ao Bullying</span>
              </div>
            </div>
          </div>

          {/* Cards for each of the 15 questions */}
          {questionsStats.map((stat) => (
            <div
              key={stat.question.id}
              className="bg-white rounded-lg border border-[#dadce0] p-5 sm:p-6 shadow-xs space-y-4"
            >
              {/* Question title */}
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-sm sm:text-base font-medium text-[#202124] leading-snug">
                  <span className="font-semibold text-purple-700 mr-1.5">{stat.question.id}.</span>
                  {stat.question.text.replace(/^\d+\.\s*/, '')}
                </h3>
              </div>
              <div className="text-xs text-neutral-500">
                {stat.total} {stat.total === 1 ? 'resposta' : 'respostas'}
              </div>

              {/* Graphical representation (Google Forms style) */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center pt-2">
                {/* Visual Distribution Bars */}
                <div className="md:col-span-7 space-y-3">
                  {/* Option Sim */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-neutral-800 font-medium">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#1a73e8]" />
                        Sim
                      </span>
                      <span>{stat.sim} ({stat.simPct}%)</span>
                    </div>
                    <div className="w-full bg-neutral-100 h-4 rounded-full overflow-hidden">
                      <div 
                        className="bg-[#1a73e8] h-full rounded-full transition-all duration-500"
                        style={{ width: `${stat.simPct}%` }}
                      />
                    </div>
                  </div>

                  {/* Option Não */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-neutral-800 font-medium">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#d93025]" />
                        Não
                      </span>
                      <span>{stat.nao} ({stat.naoPct}%)</span>
                    </div>
                    <div className="w-full bg-neutral-100 h-4 rounded-full overflow-hidden">
                      <div 
                        className="bg-[#d93025] h-full rounded-full transition-all duration-500"
                        style={{ width: `${stat.naoPct}%` }}
                      />
                    </div>
                  </div>

                  {/* Option Talvez */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-neutral-800 font-medium">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#f9ab00]" />
                        Talvez
                      </span>
                      <span>{stat.talvez} ({stat.talvezPct}%)</span>
                    </div>
                    <div className="w-full bg-neutral-100 h-4 rounded-full overflow-hidden">
                      <div 
                        className="bg-[#f9ab00] h-full rounded-full transition-all duration-500"
                        style={{ width: `${stat.talvezPct}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Donut / Pie Summary representation */}
                <div className="md:col-span-5 flex flex-col items-center justify-center p-3 bg-neutral-50 rounded-lg border border-neutral-100">
                  <div className="relative w-28 h-28 flex items-center justify-center">
                    {/* SVG Pie / Donut Chart */}
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                      {/* Background Circle */}
                      <path
                        className="text-neutral-200"
                        strokeWidth="5"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      {/* Sim segment (Blue) */}
                      <path
                        strokeWidth="5"
                        strokeDasharray={`${stat.simPct}, 100`}
                        strokeDashoffset="0"
                        stroke="#1a73e8"
                        strokeLinecap="round"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      {/* Talvez segment (Yellow) */}
                      <path
                        strokeWidth="5"
                        strokeDasharray={`${stat.talvezPct}, 100`}
                        strokeDashoffset={`-${stat.simPct}`}
                        stroke="#f9ab00"
                        strokeLinecap="round"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>

                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                      <span className="text-sm font-bold text-neutral-900">
                        {stat.simPct}%
                      </span>
                      <span className="text-[10px] text-neutral-500 uppercase tracking-wider">
                        Sim
                      </span>
                    </div>
                  </div>

                  <div className="text-[11px] text-neutral-500 mt-2 text-center">
                    Maioria concorda com a proposição
                  </div>
                </div>
              </div>

              {/* Pedagogical Commentary & Legal Basis Box */}
              <div className="bg-[#f8f9fa] rounded-md p-3 border border-[#e8eaed] text-xs text-neutral-700 space-y-1">
                <div className="font-semibold text-neutral-900 flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-purple-600" />
                  <span>Análise Pedagógica &amp; Diretriz:</span>
                </div>
                <p className="text-neutral-600 leading-relaxed">
                  {stat.question.explanation}
                </p>
                {stat.question.legalBase && (
                  <div className="text-[11px] text-purple-700 font-medium pt-1">
                    Base Legal: {stat.question.legalBase}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ===================== SUBTAB: POR PERGUNTA ===================== */}
      {subTab === 'pergunta' && (
        <div className="space-y-4">
          <div className="bg-white rounded-lg border border-[#dadce0] p-4 flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-700">
              Selecionar Pergunta:
            </span>
            <div className="flex items-center gap-2">
              <select
                value={activeQuestionId}
                onChange={(e) => setActiveQuestionId(Number(e.target.value))}
                className="bg-[#f8f9fa] border border-[#dadce0] rounded px-3 py-1 text-xs text-neutral-800 outline-hidden font-medium"
              >
                {questions.map((q) => (
                  <option key={q.id} value={q.id}>
                    Pergunta {q.id} de {questions.length}
                  </option>
                ))}
              </select>

              <button
                disabled={activeQuestionId <= 1}
                onClick={() => setActiveQuestionId(prev => Math.max(1, prev - 1))}
                className="p-1 text-neutral-600 hover:bg-neutral-100 rounded disabled:opacity-30 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={activeQuestionId >= questions.length}
                onClick={() => setActiveQuestionId(prev => Math.min(questions.length, prev + 1))}
                className="p-1 text-neutral-600 hover:bg-neutral-100 rounded disabled:opacity-30 cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Active Question Detail */}
          {(() => {
            const currentStat = questionsStats.find(s => s.question.id === activeQuestionId);
            if (!currentStat) return null;

            return (
              <div className="bg-white rounded-lg border border-[#dadce0] p-6 shadow-xs space-y-5">
                <h3 className="text-base font-medium text-[#202124]">
                  {currentStat.question.id}. {currentStat.question.text.replace(/^\d+\.\s*/, '')}
                </h3>

                <div className="text-xs text-neutral-500">
                  {currentStat.total} respostas computadas para esta pergunta
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                    <span className="text-xs text-blue-700 font-semibold block">Sim</span>
                    <span className="text-2xl font-bold text-blue-900 mt-1 block">
                      {currentStat.sim}
                    </span>
                    <span className="text-xs text-blue-600">{currentStat.simPct}% dos votos</span>
                  </div>

                  <div className="p-4 rounded-lg bg-red-50 border border-red-200">
                    <span className="text-xs text-red-700 font-semibold block">Não</span>
                    <span className="text-2xl font-bold text-red-900 mt-1 block">
                      {currentStat.nao}
                    </span>
                    <span className="text-xs text-red-600">{currentStat.naoPct}% dos votos</span>
                  </div>

                  <div className="p-4 rounded-lg bg-amber-50 border border-amber-200">
                    <span className="text-xs text-amber-700 font-semibold block">Talvez</span>
                    <span className="text-2xl font-bold text-amber-900 mt-1 block">
                      {currentStat.talvez}
                    </span>
                    <span className="text-xs text-amber-600">{currentStat.talvezPct}% dos votos</span>
                  </div>
                </div>

                {/* Submissions list with this question's answers */}
                <div className="border-t border-[#f1f3f4] pt-4">
                  <h4 className="text-xs font-semibold text-neutral-800 mb-3">
                    Distribuição individual dos alunos nesta pergunta:
                  </h4>
                  <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                    {filteredSubmissions.map((sub, i) => (
                      <div key={sub.id || i} className="flex items-center justify-between text-xs p-2 bg-neutral-50 rounded border border-neutral-100">
                        <div className="flex items-center gap-2">
                          <span className="text-neutral-500">#{i + 1}</span>
                          <span className="font-medium text-neutral-800">
                            {sub.studentInfo.isAnonymous ? 'Aluno Anônimo' : sub.studentInfo.studentName}
                          </span>
                          <span className="text-neutral-400">({sub.studentInfo.grade})</span>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                          sub.answers[currentStat.question.id] === 'Sim' ? 'bg-blue-100 text-blue-800' :
                          sub.answers[currentStat.question.id] === 'Não' ? 'bg-red-100 text-red-800' :
                          'bg-amber-100 text-amber-800'
                        }`}>
                          {sub.answers[currentStat.question.id] || 'Não respondeu'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* ===================== SUBTAB: INDIVIDUAL ===================== */}
      {subTab === 'individual' && (
        <div className="space-y-4">
          {filteredSubmissions.length === 0 ? (
            <div className="bg-white rounded-lg border border-[#dadce0] p-8 text-center text-neutral-500 text-sm">
              Nenhuma resposta encontrada para exibir.
            </div>
          ) : (
            <>
              {/* Pagination control (1 of N) */}
              <div className="bg-white rounded-lg border border-[#dadce0] p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-neutral-600">Resposta</span>
                  <span className="text-xs font-bold text-neutral-900">
                    {currentIndividualIndex + 1} de {filteredSubmissions.length}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    disabled={currentIndividualIndex <= 0}
                    onClick={() => setCurrentIndividualIndex(prev => Math.max(0, prev - 1))}
                    className="p-1.5 text-neutral-700 hover:bg-neutral-100 rounded disabled:opacity-30 cursor-pointer"
                    title="Resposta anterior"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    disabled={currentIndividualIndex >= filteredSubmissions.length - 1}
                    onClick={() => setCurrentIndividualIndex(prev => Math.min(filteredSubmissions.length - 1, prev + 1))}
                    className="p-1.5 text-neutral-700 hover:bg-neutral-100 rounded disabled:opacity-30 cursor-pointer"
                    title="Próxima resposta"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Student Response Details */}
              {(() => {
                const sub = filteredSubmissions[currentIndividualIndex];
                if (!sub) return null;

                return (
                  <div className="space-y-4">
                    {/* Student Info Card */}
                    <div className="bg-white rounded-lg border border-[#dadce0] p-5 shadow-xs">
                      <div className="flex items-center justify-between text-xs text-neutral-500 border-b border-[#f1f3f4] pb-3 mb-3">
                        <span>Registrado em: {sub.timestamp}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[11px] bg-neutral-100 px-2 py-0.5 rounded text-neutral-700">{sub.id}</span>
                          {onDeleteSubmission && (
                            <button
                              onClick={() => onDeleteSubmission(sub.id)}
                              className="inline-flex items-center gap-1 text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 border border-red-200 px-2.5 py-0.5 rounded text-[11px] font-semibold transition-colors cursor-pointer"
                              title={`Excluir resposta ${sub.id} do Supabase`}
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>Excluir</span>
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                        <div>
                          <span className="text-neutral-500 block">Turma:</span>
                          <span className="font-semibold text-neutral-900">{sub.studentInfo.grade}</span>
                        </div>
                        <div>
                          <span className="text-neutral-500 block">Turno:</span>
                          <span className="font-semibold text-neutral-900">{sub.studentInfo.shift}</span>
                        </div>
                        <div>
                          <span className="text-neutral-500 block">Identificação:</span>
                          <span className="font-semibold text-neutral-900">
                            {sub.studentInfo.isAnonymous ? 'Anônimo (Protegido)' : sub.studentInfo.studentName || 'Não especificado'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Answers for each question */}
                    {questions.map((q) => {
                      const answer = sub.answers[q.id];

                      return (
                        <div key={q.id} className="bg-white rounded-lg border border-[#dadce0] p-4 text-xs space-y-2">
                          <div className="font-medium text-neutral-900 leading-snug">
                            {q.id}. {q.text.replace(/^\d+\.\s*/, '')}
                          </div>
                          <div className="flex items-center gap-2 pt-1">
                            <span className="text-neutral-500">Resposta:</span>
                            <span className={`px-2 py-0.5 rounded font-semibold ${
                              answer === 'Sim' ? 'bg-blue-100 text-blue-800' :
                              answer === 'Não' ? 'bg-red-100 text-red-800' :
                              'bg-amber-100 text-amber-800'
                            }`}>
                              {answer || 'Não respondida'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </>
          )}
        </div>
      )}
    </div>
  );
};
