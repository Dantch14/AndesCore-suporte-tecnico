import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from './supabase';
import type { NewTicket, Status, Ticket, Urgency } from './tickets';

interface Row {
  id: number;
  nome: string;
  setor: string;
  descricao: string;
  urgencia: Urgency | null;
  status: Status;
  tecnico: string;
  criado_em: string;
}

const COLS = 'id,nome,setor,descricao,urgencia,status,tecnico,criado_em';
const KEY = ['chamados'] as const;

const fromRow = (r: Row): Ticket => ({
  id: r.id, nome: r.nome, setor: r.setor, descricao: r.descricao,
  urgencia: r.urgencia, status: r.status, tecnico: r.tecnico, criadoEm: r.criado_em,
});

/* O banco decide o que cada um enxerga: cliente recebe só os seus, admin recebe todos. */
async function fetchTickets(): Promise<Ticket[]> {
  const { data, error } = await supabase.from('chamados').select(COLS).order('criado_em', { ascending: true });
  if (error) throw error;
  return (data as unknown as Row[]).map(fromRow);
}

async function createTicket(input: NewTicket): Promise<Ticket> {
  const { data, error } = await supabase
    .from('chamados')
    .insert({
      nome: input.nome.trim(), setor: input.setor.trim(),
      descricao: input.descricao.trim(),
    })
    .select(COLS)
    .single();
  if (error) throw error;
  return fromRow(data as unknown as Row);
}

interface Update {
  id: number;
  patch: Partial<Pick<Ticket, 'status' | 'tecnico' | 'urgencia'>>;
}

async function updateTicket({ id, patch }: Update): Promise<void> {
  const { data, error } = await supabase.from('chamados').update(patch).eq('id', id).select('id');
  if (error) throw error;
  if (!data || data.length === 0) throw new Error('Sem permissão para alterar este chamado.');
}

export const useTickets = () => useQuery({ queryKey: KEY, queryFn: fetchTickets });

export function useCreateTicket() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createTicket,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });
}

export function useUpdateTicket() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateTicket,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });
}

async function deleteTicket(id: number): Promise<void> {
  const { data, error } = await supabase.from('chamados').delete().eq('id', id).select('id');
  if (error) throw error;
  if (!data || data.length === 0) throw new Error('Sem permissão para apagar este chamado.');
}

async function renumberTickets(): Promise<void> {
  const { error } = await supabase.rpc('renumerar_chamados');
  if (error) throw error;
}

export function useDeleteTicket() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteTicket,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });
}

export function useRenumberTickets() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: renumberTickets,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });
}
