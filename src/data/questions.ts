import { Question, FormSubmission, FormTheme } from '../types/form';

export const QUESTIONS_DATA: Question[] = [
  {
    id: 1,
    text: "Quando a escola é avisada várias vezes sobre ameaças e agressões contra um aluno e não toma medidas efetivas, ela contribui para que o bullying continue.",
    category: "institucional",
    explanation: "A omissão da escola transmite ao agressor a sensação de impunidade e desprotege a vítima. Instituições de ensino têm dever legal de vigilância e prevenção ativa contra a intimidação sistemática.",
    legalBase: "Lei Federal nº 13.185/2015, Art. 5º (Dever de capacitação e elaboração de medidas de prevenção).",
    required: true
  },
  {
    id: 2,
    text: "Agressões físicas repetidas dentro da escola (empurrões, socos, chutes) podem causar lesões graves, como fratura de maxilar ou perda de visão.",
    category: "fisico",
    explanation: "O bullying não se limita a ofensas verbais. Episódios físicos frequentes resultam em sequelas corporais permanentes e traumas craniofaciais com risco de vida.",
    legalBase: "Código Penal (Art. 129 - Lesão Corporal Grave e Gravíssima) e ECA (Lei 8.069/90).",
    required: true
  },
  {
    id: 3,
    text: "Grupos de WhatsApp da turma usados por alunos mais velhos para humilhar, ameaçar e forçar “trotes” em novatos configuram bullying e cyberbullying.",
    category: "digital",
    explanation: "O uso de redes sociais e mensageiros instantâneos para hostilizar, constranger e aplicar trotes coercitivos em novatos é cyberbullying direto, tipificado penalmente.",
    legalBase: "Lei Federal nº 14.811/2024 (Art. 146-A do Código Penal: Intimidação sistemática virtual).",
    required: true
  },
  {
    id: 4,
    text: "Zombar publicamente de um colega por causa de sequelas de doença (como uso de prótese) ou diferença física é uma forma grave de bullying.",
    category: "inclusao",
    explanation: "A discriminação motivada por deficiência, uso de prótese ou condição de saúde fere a dignidade humana e constitui discriminação passível de punição civil e penal.",
    legalBase: "Lei Brasileira de Inclusão da Pessoa com Deficiência (Lei nº 13.146/2015, Art. 88).",
    required: true
  },
  {
    id: 5,
    text: "Quando um aluno leva objeto cortante para a escola por medo de ser agredido, isso geralmente indica que o bullying já está em estágio avançado.",
    category: "institucional",
    explanation: "A busca desesperada por meios de autodefesa física revela que o estudante se sente totalmente abandonado pela rede de proteção da escola e da família.",
    legalBase: "Protocolo de Segurança Escolar do MEC e Lei nº 13.185/2015.",
    required: true
  },
  {
    id: 6,
    text: "Agressões que acontecem na porta da escola ou no transporte escolar (van/ônibus) também são responsabilidade da escola quando envolvem alunos.",
    category: "institucional",
    explanation: "O ambiente escolar abrange o trajeto, transporte oficial/fretado e imediações no horário de entrada e saída. A escola deve intervir e acionar órgãos competentes.",
    legalBase: "Código de Defesa do Consumidor e Código Civil (Responsabilidade civil objetiva de custódia).",
    required: true
  },
  {
    id: 7,
    text: "Bullying prolongado baseado em peso, aparência ou orientação sexual pode levar a depressão profunda e tentativas de autolesão.",
    category: "psicologico",
    explanation: "O sofrimento continuado afeta a autoestima, destrói o rendimento escolar e é um dos principais fatores de risco para automutilação e ideação suicida em jovens.",
    legalBase: "Organização Mundial da Saúde (OMS) e Diretrizes de Saúde Mental na Infância e Juventude.",
    required: true
  },
  {
    id: 8,
    text: "Filmar a agressão de um colega e compartilhar o vídeo nas redes sociais aumenta o dano psicológico da vítima.",
    category: "digital",
    explanation: "A gravação e compartilhamento ampliam o alcance da humilhação para milhares de pessoas, impedindo que a vítima consiga superar o episódio traumático.",
    legalBase: "Marco Civil da Internet (Lei 12.965/2014) e Lei 14.811/2024.",
    required: true
  },
  {
    id: 9,
    text: "Quando a escola suspende vários alunos de uma vez por mensagens racistas, homofóbicas e ameaças em grupo de WhatsApp, ela está cumprindo seu dever de proteção.",
    category: "institucional",
    explanation: "A intervenção firme e disciplinar é indispensável para demonstrar tolerância zero à violência discriminatória e restaurar a segurança dos demais alunos.",
    legalBase: "Lei nº 13.185/2015 e Lei nº 7.716/1989 (Crimes de Preconceito e Discriminação).",
    required: true
  },
  {
    id: 10,
    text: "Alunos que sofrem bullying por deficiência física ou condição de saúde costumam ter mais dificuldade de denunciar por medo de piorar a situação.",
    category: "inclusao",
    explanation: "O receio de represálias e a sensação de fragilidade física ampliam a barreira para a denúncia, exigindo canais anônimos e escuta acolhedora pela orientação pedagógica.",
    legalBase: "Estatuto da Criança e do Adolescente (ECA) - Art. 18 (Direito a ser protegido da violência).",
    required: true
  },
  {
    id: 11,
    text: "A omissão da direção da escola, mesmo após denúncias repetidas dos pais, pode agravar o sofrimento da vítima.",
    category: "institucional",
    explanation: "Quando os pais buscam a direção e nada é feito, a vítima se sente duplamente desamparada, levando frequentemente ao abandono escolar involuntário.",
    legalBase: "Jurisprudência do STJ: Danos morais e materiais por inação escolar frente ao bullying.",
    required: true
  },
  {
    id: 12,
    text: "Forçar novatos a beber álcool, gravar vídeos humilhantes ou cumprir “tarefas” sob ameaça em grupos de alunos é bullying, não “brincadeira de trote”.",
    category: "fisico",
    explanation: "Qualquer prática que imponha constrangimento físico, moral ou consumo forçado de substâncias com ameaça de exclusão é violência sistemática e crime.",
    legalBase: "Lei Federal nº 14.811/2024 (Art. 146-A do CP) e Lei das Contravenções Penais.",
    required: true
  },
  {
    id: 13,
    text: "Casos em que a vítima precisa ser hospitalizada após agressões na escola mostram que o bullying físico pode ter consequências permanentes.",
    category: "fisico",
    explanation: "A violência física não controlada escala de empurrões para hospitalizações, cirurgias e traumas irreparáveis na saúde do estudante.",
    legalBase: "Artigo 129 do Código Penal e Estatuto da Criança e do Adolescente.",
    required: true
  },
  {
    id: 14,
    text: "Quando o bullying acontece de forma repetida e a escola não protege a vítima, a família tem direito de registrar boletim de ocorrência e buscar responsabilização.",
    category: "legal",
    explanation: "A família tem o direito legítimo de acionar a Polícia Civil, Conselho Tutelar e Ministério Público para salvaguardar a integridade física e psicológica do menor.",
    legalBase: "ECA (Lei 8.069/90) e Código de Processo Penal.",
    required: true
  },
  {
    id: 15,
    text: "Criar e espalhar vídeos ou imagens falsas (com inteligência artificial) humilhando um colega de escola é uma forma grave de cyberbullying.",
    category: "digital",
    explanation: "Deepfakes difamatórias, montagens sexuais ou humilhantes produzidas por IA configuram cyberbullying agravado com punição severa no Código Penal.",
    legalBase: "Lei 14.811/2024 e Código Penal (Crimes contra a honra qualificados por meio cibernético).",
    required: true
  }
];

export const THEMES: FormTheme[] = [
  {
    name: 'Roxo Clássico (Google Forms)',
    primaryColor: '#673ab7',
    bgColor: '#f0ebf8',
    accentColor: '#7248b9'
  },
  {
    name: 'Azul Institucional',
    primaryColor: '#1a73e8',
    bgColor: '#e8f0fe',
    accentColor: '#1967d2'
  },
  {
    name: 'Verde Convivência',
    primaryColor: '#0f9d58',
    bgColor: '#e6f4ea',
    accentColor: '#0b8043'
  },
  {
    name: 'Turquesa Proteção',
    primaryColor: '#00897b',
    bgColor: '#e0f2f1',
    accentColor: '#00695c'
  },
  {
    name: 'Laranja Cidadania',
    primaryColor: '#e65100',
    bgColor: '#fbe9e7',
    accentColor: '#bf360c'
  },
  {
    name: 'Rubi Alerta',
    primaryColor: '#b71c1c',
    bgColor: '#fce4ec',
    accentColor: '#880e4f'
  }
];

// Empty initial responses list - real student submissions are collected in production
export const INITIAL_SEED_RESPONSES: FormSubmission[] = [];

export const GRADE_OPTIONS = [
  // Ensino Médio - 1º Ano (A até H)
  "1º Ano A (1º A)",
  "1º Ano B (1º B)",
  "1º Ano C (1º C)",
  "1º Ano D (1º D)",
  "1º Ano E (1º E)",
  "1º Ano F (1º F)",
  "1º Ano G (1º G)",
  "1º Ano H (1º H)",
  // Ensino Médio - 2º Ano (A até H)
  "2º Ano A (2º A)",
  "2º Ano B (2º B)",
  "2º Ano C (2º C)",
  "2º Ano D (2º D)",
  "2º Ano E (2º E)",
  "2º Ano F (2º F)",
  "2º Ano G (2º G)",
  "2º Ano H (2º H)",
  // Ensino Médio - 3º Ano (A até H)
  "3º Ano A (3º A)",
  "3º Ano B (3º B)",
  "3º Ano C (3º C)",
  "3º Ano D (3º D)",
  "3º Ano E (3º E)",
  "3º Ano F (3º F)",
  "3º Ano G (3º G)",
  "3º Ano H (3º H)",
  // Ensino Fundamental - 6º Ano (A até H)
  "6º Ano A (6º A)",
  "6º Ano B (6º B)",
  "6º Ano C (6º C)",
  "6º Ano D (6º D)",
  "6º Ano E (6º E)",
  "6º Ano F (6º F)",
  "6º Ano G (6º G)",
  "6º Ano H (6º H)",
  // Ensino Fundamental - 7º Ano (A até H)
  "7º Ano A (7º A)",
  "7º Ano B (7º B)",
  "7º Ano C (7º C)",
  "7º Ano D (7º D)",
  "7º Ano E (7º E)",
  "7º Ano F (7º F)",
  "7º Ano G (7º G)",
  "7º Ano H (7º H)",
  // Ensino Fundamental - 8º Ano (A até H)
  "8º Ano A (8º A)",
  "8º Ano B (8º B)",
  "8º Ano C (8º C)",
  "8º Ano D (8º D)",
  "8º Ano E (8º E)",
  "8º Ano F (8º F)",
  "8º Ano G (8º G)",
  "8º Ano H (8º H)",
  // Ensino Fundamental - 9º Ano (A até H)
  "9º Ano A (9º A)",
  "9º Ano B (9º B)",
  "9º Ano C (9º C)",
  "9º Ano D (9º D)",
  "9º Ano E (9º E)",
  "9º Ano F (9º F)",
  "9º Ano G (9º G)",
  "9º Ano H (9º H)",
  // Outros
  "EJA (Educação de Jovens e Adultos)",
  "Outra Turma"
];

export const SHIFT_OPTIONS = [
  "Matutino (Manhã)",
  "Vespertino (Tarde)",
  "Integral",
  "Noturno"
];
