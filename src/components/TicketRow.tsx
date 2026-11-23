import { Link } from 'react-router-dom';
import { formatDate, formatId, STATUS_LABEL, URGENCY_LABEL, type Ticket } from '../tickets';

interface Props {
  ticket: Ticket;
}

export default function TicketRow({ ticket }: Props) {
  return (
    <li>
      <Link to={`/chamados/${ticket.id}`} className="row" data-urgency={ticket.urgencia} data-status={ticket.status}>
        <span className="num">{formatId(ticket.id)}</span>
        <span className="body">
          <span className="desc">{ticket.descricao}</span>
          <span className="meta">
            {ticket.nome}, {ticket.setor} · {formatDate(ticket.criadoEm)} ·{' '}
            {ticket.tecnico ? `com ${ticket.tecnico}` : 'sem técnico'}
          </span>
        </span>
        <span className="urg">Urgência {URGENCY_LABEL[ticket.urgencia].toLowerCase()}</span>
        <span className="status">
          <i className="dot" aria-hidden="true" />
          {STATUS_LABEL[ticket.status]}
        </span>
      </Link>
    </li>
  );
}
