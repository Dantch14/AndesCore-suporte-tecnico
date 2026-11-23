import { useSyncExternalStore } from 'react';

export type Urgency = 'baixa' | 'media' | 'alta';
export type Status = 'aberto' | 'em-andamento' | 'resolvido';

export interface Ticket {
  id: number;
  nome: string;
  setor: string;
  descricao: string;
  urgencia: Urgency;
  status: Status;
  tecnico: string;
  criadoEm: string;
}
export type NewTicket = Pick<Ticket, 'nome' | 'setor' | 'descricao' | 'urgencia'>;
export type FieldErrors = Partial<Record<'nome' | 'setor' | 'descricao', string>>;

export const STATUSES: readonly Status[] = ['aberto', 'em-andamento', 'resolvido'];
export const STATUS_LABEL: Record<Status, string> = {
  aberto: 'Aberto',
  'em-andamento': 'Em andamento',
  resolvido: 'Resolvido',
};
export const URGENCY_LABEL: Record<Urgency, string> = { baixa: 'Baixa', media: 'Média', alta: 'Alta' };
const URGENCY_RANK: Record<Urgency, number> = { baixa: 0, media: 1, alta: 2 };

export const formatId = (id: number): string => String(id).padStart(4, '0');
export const formatDate = (iso: string): string =>
  new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(iso));

/** Mais urgente primeiro; em empate, o mais antigo primeiro. */
export const byPriority = (a: Ticket, b: Ticket): number =>
  URGENCY_RANK[b.urgencia] - URGENCY_RANK[a.urgencia] || a.criadoEm.localeCompare(b.criadoEm);

export function validate(t: NewTicket): FieldErrors {
  const errors: FieldErrors = {};
  if (t.nome.trim().length < 2) errors.nome = 'Informe seu nome.';
  if (t.setor.trim().length < 2) errors.setor = 'Informe o setor.';
  if (t.descricao.trim().length < 10) errors.descricao = 'Descreva o problema em pelo menos 10 caracteres.';
  return errors;
}

/* Armazenamento local. useSyncExternalStore evita Context e useEffect para um estado global simples. */
const KEY = 'andescore:chamados';
const listeners = new Set<() => void>();

function load(): Ticket[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Ticket[]) : [];
  } catch {
    return [];
  }
}
let tickets: Ticket[] = load();

function commit(next: Ticket[]): void {
  tickets = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* sem persistência: o estado em memória continua válido */
  }
  listeners.forEach((l) => l());
}
const subscribe = (l: () => void): (() => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

export const useTickets = (): readonly Ticket[] => useSyncExternalStore(subscribe, () => tickets);

export function addTicket(input: NewTicket): Ticket {
  const ticket: Ticket = {
    id: tickets.reduce((max, t) => Math.max(max, t.id), 0) + 1,
    nome: input.nome.trim(),
    setor: input.setor.trim(),
    descricao: input.descricao.trim(),
    urgencia: input.urgencia,
    status: 'aberto',
    tecnico: '',
    criadoEm: new Date().toISOString(),
  };
  commit([...tickets, ticket]);
  return ticket;
}
export const setStatus = (id: number, status: Status): void =>
  commit(tickets.map((t) => (t.id === id ? { ...t, status } : t)));
export const setTecnico = (id: number, tecnico: string): void =>
  commit(tickets.map((t) => (t.id === id ? { ...t, tecnico: tecnico.trim() } : t)));
