import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import ConfirmAction from '../components/ConfirmAction';
import { useAuth } from '../auth';
import { useDeleteTicket, useTickets, useUpdateTicket } from '../data';
import { formatDate, formatId, STATUSES, STATUS_LABEL, URGENCIES, URGENCY_LABEL, type Ticket } from '../tickets';

function Detail({ ticket, isAdmin }: { ticket: Ticket; isAdmin: boolean }) {
  const [tecnico, setDraft] = useState(ticket.tecnico);
  const update = useUpdateTicket();
  const del = useDeleteTicket();
  const navigate = useNavigate();

  function save(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    update.mutate({ id: ticket.id, patch: { tecnico: tecnico.trim() } });
  }

  return (
    <section className="page detail" data-urgency={ticket.urgencia ?? 'indefinida'}>
      <p><Link to="/chamados">← {isAdmin ? 'Fila' : 'Meus chamados'}</Link></p>
      <h1><span className="num big">{formatId(ticket.id)}</span> {ticket.descricao}</h1>
      <dl>
        <div><dt>Aberto por</dt><dd>{ticket.nome}, {ticket.setor}</dd></div>
        <div><dt>Quando</dt><dd>{formatDate(ticket.criadoEm)}</dd></div>
        <div><dt>Urgência</dt><dd className="urg">{ticket.urgencia ? URGENCY_LABEL[ticket.urgencia] : 'A definir'}</dd></div>
        <div><dt>Técnico</dt><dd>{ticket.tecnico || (isAdmin ? 'Ninguém assumiu' : 'Aguardando um técnico')}</dd></div>
        <div><dt>Status</dt><dd className="status" data-status={ticket.status}><i className="dot" aria-hidden="true" />{STATUS_LABEL[ticket.status]}</dd></div>
      </dl>
      {isAdmin && (
        <>
          <p className="seglabel">Urgência</p>
          <div role="group" aria-label="Definir urgência do chamado" className="seg">
            {URGENCIES.map((u) => (
              <button key={u} type="button" aria-pressed={ticket.urgencia === u} disabled={update.isPending}
                onClick={() => update.mutate({ id: ticket.id, patch: { urgencia: u } })}>
                {URGENCY_LABEL[u]}
              </button>
            ))}
          </div>
          <p className="seglabel">Status</p>
          <div role="group" aria-label="Alterar status do chamado" className="seg">
            {STATUSES.map((s) => (
              <button key={s} type="button" aria-pressed={ticket.status === s} disabled={update.isPending}
                onClick={() => update.mutate({ id: ticket.id, patch: { status: s } })}>
                {STATUS_LABEL[s]}
              </button>
            ))}
          </div>
          <form onSubmit={save} className="inline">
            <div className="field">
              <label htmlFor="tecnico">Técnico responsável</label>
              <input id="tecnico" value={tecnico} onChange={(e) => setDraft(e.target.value)} />
            </div>
            <button type="submit" className="btn ghost" disabled={update.isPending}>Salvar</button>
          </form>
          {update.isError && <p className="error" role="alert">Não foi possível salvar a alteração.</p>}
          <div className="maintenance">
            <ConfirmAction label="Apagar chamado" question={`Apagar o chamado ${formatId(ticket.id)}? Isso não pode ser desfeito.`} confirmLabel="Apagar"
              pending={del.isPending} onConfirm={() => del.mutate(ticket.id, { onSuccess: () => navigate('/chamados') })} />
            {del.isError && <p className="error" role="alert">Não foi possível apagar o chamado.</p>}
          </div>
        </>
      )}
    </section>
  );
}

export default function TicketDetailPage() {
  const { id } = useParams();
  const query = useTickets();
  const { auth } = useAuth();

  if (query.isPending) return <section className="page"><p role="status">Carregando…</p></section>;
  if (query.isError) return <section className="page"><h1>Não foi possível carregar o chamado.</h1><p><Link to="/chamados">Voltar</Link></p></section>;

  const ticket = query.data.find((t) => String(t.id) === id);
  if (!ticket) return <section className="page"><h1>Chamado não encontrado.</h1><p><Link to="/chamados">Voltar</Link></p></section>;

  return <Detail key={ticket.id} ticket={ticket} isAdmin={auth.status === 'in' && auth.role === 'admin'} />;
}
