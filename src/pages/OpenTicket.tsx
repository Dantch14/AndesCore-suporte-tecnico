import { useState, type FormEvent, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import {
  addTicket, formatId, validate, URGENCY_LABEL,
  type FieldErrors, type NewTicket, type Ticket, type Urgency,
} from '../tickets';

type View = { kind: 'editing'; errors: FieldErrors } | { kind: 'done'; ticket: Ticket };

const EMPTY: NewTicket = { nome: '', setor: '', descricao: '', urgencia: 'media' };
const HINT: Record<Urgency, string> = {
  baixa: 'Pode esperar até amanhã.',
  media: 'Atrapalha, mas dá para trabalhar.',
  alta: 'A empresa está parada.',
};

function Field({ id, label, error, children }: { id: string; label: string; error?: string; children: ReactNode }) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      {children}
      {error && <p id={`${id}-erro`} className="error" role="alert">{error}</p>}
    </div>
  );
}

export default function OpenTicket() {
  const [draft, setDraft] = useState<NewTicket>(EMPTY);
  const [view, setView] = useState<View>({ kind: 'editing', errors: {} });

  const set = <K extends keyof NewTicket>(key: K, value: NewTicket[K]) =>
    setDraft((d) => ({ ...d, [key]: value }));

  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const errors = validate(draft);
    if (Object.keys(errors).length > 0) {
      setView({ kind: 'editing', errors });
      return;
    }
    setView({ kind: 'done', ticket: addTicket(draft) });
    setDraft(EMPTY);
  }

  if (view.kind === 'done') {
    return (
      <section className="page" aria-live="polite">
        <h1>Chamado {formatId(view.ticket.id)} registrado.</h1>
        <p className="lede">Ele entrou na fila com urgência {URGENCY_LABEL[view.ticket.urgencia].toLowerCase()}. Um técnico vai assumi-lo e o status muda na página do chamado.</p>
        <p className="actions">
          <Link className="btn" to={`/chamados/${view.ticket.id}`}>Ver chamado</Link>
          <button type="button" className="btn ghost" onClick={() => setView({ kind: 'editing', errors: {} })}>Abrir outro</button>
        </p>
      </section>
    );
  }

  const { errors } = view;
  const aria = (k: keyof FieldErrors) => ({
    'aria-invalid': errors[k] ? true : undefined,
    'aria-describedby': errors[k] ? `${k}-erro` : undefined,
  });

  return (
    <section className="page split">
      <div>
        <h1>Descreva o problema.</h1>
        <p className="lede">Cada chamado ganha um número e entra na fila. Quanto mais exato o relato, menos perguntas de volta.</p>
      </div>
      <form onSubmit={submit} noValidate>
        <Field id="nome" label="Seu nome" error={errors.nome}>
          <input id="nome" autoComplete="name" value={draft.nome} onChange={(e) => set('nome', e.target.value)} {...aria('nome')} />
        </Field>
        <Field id="setor" label="Setor" error={errors.setor}>
          <input id="setor" value={draft.setor} onChange={(e) => set('setor', e.target.value)} {...aria('setor')} />
        </Field>
        <Field id="descricao" label="O que aconteceu" error={errors.descricao}>
          <textarea id="descricao" rows={5} value={draft.descricao} onChange={(e) => set('descricao', e.target.value)} {...aria('descricao')} />
        </Field>
        <fieldset>
          <legend>Urgência</legend>
          {(Object.keys(URGENCY_LABEL) as Urgency[]).map((u) => (
            <label key={u} className="choice">
              <input type="radio" name="urgencia" value={u} checked={draft.urgencia === u} onChange={() => set('urgencia', u)} />
              <span><strong>{URGENCY_LABEL[u]}</strong> {HINT[u]}</span>
            </label>
          ))}
        </fieldset>
        <button type="submit" className="btn">Abrir chamado</button>
      </form>
    </section>
  );
}
