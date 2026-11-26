export type Urgency = 'baixa' | 'media' | 'alta';
export type Status = 'aberto' | 'em-andamento' | 'resolvido';

export interface Ticket {
  id: number;
  nome: string;
  setor: string;
  descricao: string;
  urgencia: Urgency | null;
  status: Status;
  tecnico: string;
  criadoEm: string;
}
export type NewTicket = Pick<Ticket, 'nome' | 'setor' | 'descricao'>;
export type FieldErrors = Partial<Record<'nome' | 'setor' | 'descricao', string>>;

export const STATUSES: readonly Status[] = ['aberto', 'em-andamento', 'resolvido'];
export const STATUS_LABEL: Record<Status, string> = {
  aberto: 'Aberto',
  'em-andamento': 'Em andamento',
  resolvido: 'Resolvido',
};
export const URGENCY_LABEL: Record<Urgency, string> = { baixa: 'Baixa', media: 'Média', alta: 'Alta' };
export const URGENCIES: readonly Urgency[] = ['baixa', 'media', 'alta'];
const URGENCY_RANK: Record<Urgency, number> = { baixa: 0, media: 1, alta: 2 };

export const formatId = (id: number): string => String(id).padStart(4, '0');
export const formatDate = (iso: string): string =>
  new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(iso));

/** Sem urgência definida vem primeiro (falta triagem); depois do mais ao menos urgente, e o mais antigo primeiro. */
const rank = (u: Urgency | null): number => (u === null ? 3 : URGENCY_RANK[u]);
export const byPriority = (a: Ticket, b: Ticket): number =>
  rank(b.urgencia) - rank(a.urgencia) || a.criadoEm.localeCompare(b.criadoEm);

export const urgencyText = (u: Urgency | null): string =>
  u ? `Urgência ${URGENCY_LABEL[u].toLowerCase()}` : 'Urgência a definir';

export function validate(t: NewTicket): FieldErrors {
  const errors: FieldErrors = {};
  if (t.nome.trim().length < 2) errors.nome = 'Informe seu nome.';
  if (t.setor.trim().length < 2) errors.setor = 'Informe o setor.';
  if (t.descricao.trim().length < 10) errors.descricao = 'Descreva o problema em pelo menos 10 caracteres.';
  return errors;
}
