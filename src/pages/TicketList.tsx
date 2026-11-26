import { Link } from 'react-router-dom';
import TicketRow from '../components/TicketRow';
import { useAuth } from '../auth';
import { useTickets } from '../data';
import { byPriority, STATUSES, STATUS_LABEL } from '../tickets';

export default function TicketList() {
  const query = useTickets();
  const { auth } = useAuth();
  const isAdmin = auth.status === 'in' && auth.role === 'admin';

  if (query.isPending) return <section className="page"><p role="status">Carregando chamados…</p></section>;
  if (query.isError) {
    return (
      <section className="page">
        <h1>Não foi possível carregar os chamados.</h1>
        <p className="actions"><button type="button" className="btn" onClick={() => void query.refetch()}>Tentar de novo</button></p>
      </section>
    );
  }

  const tickets = query.data;
  if (tickets.length === 0) {
    return (
      <section className="page">
        <h1>{isAdmin ? 'A fila está vazia.' : 'Você ainda não abriu chamados.'}</h1>
        <p className="actions"><Link className="btn" to="/abrir-chamado">Abrir um chamado</Link></p>
      </section>
    );
  }

  const open = tickets.filter((t) => t.status !== 'resolvido').length;
  const noun = open === 1 ? 'chamado' : 'chamados';
  const heading = isAdmin
    ? open === 0 ? 'Tudo resolvido.' : `${open} ${noun} em aberto.`
    : open === 0 ? 'Nenhum chamado em aberto.' : `Você tem ${open} ${noun} em aberto.`;

  return (
    <section className="page">
      <h1>{heading}</h1>
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
