import { useState, type FormEvent } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  formatDate, formatId, setStatus, setTecnico, STATUSES, STATUS_LABEL, URGENCY_LABEL, useTickets, type Ticket,
} from '../tickets';

function Detail({ ticket }: { ticket: Ticket }) {
  const [tecnico, setDraft] = useState(ticket.tecnico);

  function save(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setTecnico(ticket.id, tecnico);
  }

  return (
    <section className="page detail" data-urgency={ticket.urgencia}>
      <p><Link to="/chamados">← Fila</Link></p>
      <h1><span className="num big">{formatId(ticket.id)}</span> {ticket.descricao}</h1>
      <dl>
        <div><dt>Aberto por</dt><dd>{ticket.nome}, {ticket.setor}</dd></div>
        <div><dt>Quando</dt><dd>{formatDate(ticket.criadoEm)}</dd></div>
        <div><dt>Urgência</dt><dd className="urg">{URGENCY_LABEL[ticket.urgencia]}</dd></div>
        <div><dt>Técnico</dt><dd>{ticket.tecnico || 'Ninguém assumiu'}</dd></div>
      </dl>
      <div role="group" aria-label="Status do chamado" className="seg">
        {STATUSES.map((s) => (
          <button key={s} type="button" aria-pressed={ticket.status === s} onClick={() => setStatus(ticket.id, s)}>
            {STATUS_LABEL[s]}
          </button>
        ))}
      </div>
      <form onSubmit={save} className="inline">
        <div className="field">
          <label htmlFor="tecnico">Técnico responsável</label>
          <input id="tecnico" value={tecnico} onChange={(e) => setDraft(e.target.value)} />
        </div>
        <button type="submit" className="btn ghost">Salvar</button>
      </form>
    </section>
  );
}

export default function TicketDetailPage() {
  const { id } = useParams();
  const ticket = useTickets().find((t) => String(t.id) === id);
  if (!ticket) {
    return (
      <section className="page">
        <h1>Chamado não encontrado.</h1>
        <p><Link to="/chamados">Voltar para a fila</Link></p>
      </section>
    );
  }
  return <Detail key={ticket.id} ticket={ticket} />;
}
