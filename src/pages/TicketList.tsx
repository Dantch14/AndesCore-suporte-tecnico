import { Link } from 'react-router-dom';
import TicketRow from '../components/TicketRow';
import { byPriority, STATUSES, STATUS_LABEL, useTickets } from '../tickets';

export default function TicketList() {
  const tickets = useTickets();

  if (tickets.length === 0) {
    return (
      <section className="page">
        <h1>A fila está vazia.</h1>
        <p className="lede">Nenhum chamado foi aberto ainda.</p>
        <p className="actions"><Link className="btn" to="/abrir-chamado">Abrir o primeiro</Link></p>
      </section>
    );
  }

  const open = tickets.filter((t) => t.status !== 'resolvido').length;
  return (
    <section className="page">
      <h1>{open === 0 ? 'Tudo resolvido.' : `${open} ${open === 1 ? 'chamado' : 'chamados'} em aberto.`}</h1>
      {STATUSES.map((status) => {
        const group = tickets.filter((t) => t.status === status).sort(byPriority);
        if (group.length === 0) return null;
        return (
          <section key={status} aria-labelledby={`g-${status}`} className="group">
            <h2 id={`g-${status}`}>{STATUS_LABEL[status]} <span>{group.length}</span></h2>
            <ul>{group.map((t) => <TicketRow key={t.id} ticket={t} />)}</ul>
          </section>
        );
      })}
    </section>
  );
}
