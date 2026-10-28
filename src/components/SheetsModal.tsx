import React, { useState } from 'react';
import { Question, FormSubmission } from '../types/form';
import { 
  X, 
  Download, 
  Search, 
  FileSpreadsheet, 
  Share2, 
  Filter, 
  Check 
} from 'lucide-react';

interface SheetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  questions: Question[];
  submissions: FormSubmission[];
}

export const SheetsModal: React.FC<SheetsModalProps> = ({
  isOpen,
  onClose,
  questions,
  submissions
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const filteredSubmissions = submissions.filter((sub) => {
    const text = `${sub.studentInfo.grade} ${sub.studentInfo.shift} ${sub.studentInfo.studentName || ''}`.toLowerCase();
    return text.includes(searchTerm.toLowerCase());
  });

  const handleExportCSV = () => {
    const headers = [
      'Carimbo de data/hora',
      'Turma/Série',
      'Turno',
      'Nome do Aluno',
      ...questions.map(q => `P${q.id} - ${q.text.slice(0, 25)}...`)
    ];

    const rows = submissions.map(sub => [
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
    link.download = `planilha_pesquisa_bullying_escola_${Date.now()}.csv`;
    link.click();
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden border border-[#dadce0]">
        {/* Google Sheets Green Header */}
        <div className="bg-[#0f9d58] text-white px-4 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-white/20 flex items-center justify-center text-white">
              <FileSpreadsheet className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold tracking-tight">
                  Questionário de Bullying e Convivência Escolar (Respostas)
                </h3>
                <span className="text-[11px] bg-emerald-800/60 px-1.5 py-0.5 rounded text-emerald-100 font-mono" title="Banco de dados Firestore vinculado">
                  db: ai-studio-checkbullyingesc-46e361e7-dcf6-42de-8f31-dfa5efebf04d
                </span>
              </div>
              <div className="hidden sm:flex items-center gap-4 text-[11px] text-emerald-100 pt-0.5">
                <span>Tabela: submissions</span>
                <span>·</span>
                <span>Linhas: {submissions.length}</span>
                <span>·</span>
                <span>Colunas: {questions.length + 4}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white text-emerald-800 hover:bg-emerald-50 rounded shadow-xs transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Baixar CSV</span>
            </button>

            <button
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-emerald-700 hover:bg-emerald-600 rounded text-white transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-200" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copiado!' : 'Compartilhar'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Sheets Toolbar & Search */}
        <div className="bg-[#f8f9fa] border-b border-[#dadce0] px-4 py-2 flex flex-wrap items-center justify-between gap-3 shrink-0 text-xs text-neutral-600">
          <div className="flex items-center gap-2 flex-1 max-w-sm">
            <div className="relative w-full">
              <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Pesquisar por turma, turno ou aluno..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-white border border-[#dadce0] rounded text-xs outline-hidden focus:border-emerald-600"
              />
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs text-neutral-500">
            <span><strong>{filteredSubmissions.length}</strong> linhas</span>
            <span>·</span>
            <span><strong>{questions.length + 4}</strong> colunas</span>
          </div>
        </div>

        {/* Spreadsheet Data Grid */}
        <div className="flex-1 overflow-auto bg-white font-sans text-xs">
          <table className="w-full border-collapse border border-[#e0e0e0] text-left">
            <thead className="bg-[#f3f3f3] sticky top-0 z-10 text-neutral-700 select-none shadow-xs">
              <tr>
                <th className="border border-[#d0d0d0] px-2 py-2 w-10 text-center font-normal text-neutral-400 bg-[#e8e8e8]">
                  #
                </th>
                <th className="border border-[#d0d0d0] px-3 py-2 min-w-[140px] font-semibold text-neutral-800">
                  Carimbo de data/hora
                </th>
                <th className="border border-[#d0d0d0] px-3 py-2 min-w-[150px] font-semibold text-neutral-800">
                  Turma / Série
                </th>
                <th className="border border-[#d0d0d0] px-3 py-2 min-w-[110px] font-semibold text-neutral-800">
                  Turno
                </th>
                <th className="border border-[#d0d0d0] px-3 py-2 min-w-[130px] font-semibold text-neutral-800">
                  Aluno (Identificação)
                </th>
                {questions.map((q) => (
                  <th 
                    key={q.id} 
                    className="border border-[#d0d0d0] px-3 py-2 min-w-[200px] font-semibold text-neutral-800"
                    title={q.text}
                  >
                    <span className="font-bold text-emerald-700">P{q.id}:</span> {q.text.slice(0, 32)}...
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredSubmissions.length === 0 ? (
                <tr>
                  <td colSpan={questions.length + 5} className="text-center py-12 text-neutral-400">
                    Nenhum registro encontrado.
                  </td>
                </tr>
              ) : (
                filteredSubmissions.map((sub, index) => (
                  <tr key={sub.id || index} className="hover:bg-blue-50/40 transition-colors">
                    <td className="border border-[#e0e0e0] px-2 py-1.5 text-center text-neutral-400 bg-[#f9f9f9] select-none">
                      {index + 1}
                    </td>
                    <td className="border border-[#e0e0e0] px-3 py-1.5 font-mono text-[11px] text-neutral-600 whitespace-nowrap">
                      {sub.timestamp}
                    </td>
                    <td className="border border-[#e0e0e0] px-3 py-1.5 font-medium text-neutral-800 whitespace-nowrap">
                      {sub.studentInfo.grade}
                    </td>
                    <td className="border border-[#e0e0e0] px-3 py-1.5 text-neutral-700 whitespace-nowrap">
                      {sub.studentInfo.shift}
                    </td>
                    <td className="border border-[#e0e0e0] px-3 py-1.5 text-neutral-700 whitespace-nowrap">
                      {sub.studentInfo.isAnonymous ? (
                        <span className="text-neutral-400 italic">Anônimo</span>
                      ) : (
                        sub.studentInfo.studentName || 'Não informado'
                      )}
                    </td>
                    {questions.map((q) => {
                      const ans = sub.answers[q.id];
                      return (
                        <td key={q.id} className="border border-[#e0e0e0] px-3 py-1.5 text-center whitespace-nowrap">
                          <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-medium ${
                            ans === 'Sim' ? 'bg-blue-100 text-blue-800' :
                            ans === 'Não' ? 'bg-red-100 text-red-800' :
                            ans === 'Talvez' ? 'bg-amber-100 text-amber-800' :
                            'text-neutral-400'
                          }`}>
                            {ans || '-'}
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Sheets Status Footer */}
        <div className="bg-[#f1f3f4] border-t border-[#dadce0] px-4 py-2 flex items-center justify-between text-xs text-neutral-600 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Planilha sincronizada e atualizada em tempo real</span>
          </div>
          <button
            onClick={onClose}
            className="px-3 py-1 bg-white border border-[#dadce0] rounded hover:bg-neutral-50 text-neutral-700 font-medium"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
