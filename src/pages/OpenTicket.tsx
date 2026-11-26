import { useState, type FormEvent, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import {
  formatId, validate,
  type FieldErrors, type NewTicket, type Ticket,
} from '../tickets';
import { useCreateTicket } from '../data';

type View = { kind: 'editing'; errors: FieldErrors } | { kind: 'done'; ticket: Ticket };

const EMPTY: NewTicket = { nome: '', setor: '', descricao: '' };
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
  const create = useCreateTicket();
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
    create.mutate(draft, {
      onSuccess: (ticket) => {
        setView({ kind: 'done', ticket });
        setDraft(EMPTY);
      },
    });
  }

  if (view.kind === 'done') {
    return (
      <section className="page" aria-live="polite">
        <h1>Chamado {formatId(view.ticket.id)} registrado.</h1>
        <p className="lede">Ele entrou na fila. A equipe vai definir a urgência e assumir o chamado, e você acompanha o andamento na página dele.</p>
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
        <p className="lede">Cada chamado ganha um número e entra na fila. Quanto mais exato o relato, menos perguntas de volta. A urgência é definida pela equipe.</p>
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
        {create.isError && <p className="error" role="alert">Não foi possível abrir o chamado. Tente de novo.</p>}
        <button type="submit" className="btn" disabled={create.isPending}>{create.isPending ? 'Enviando…' : 'Abrir chamado'}</button>
      </form>
    </section>
  );
}
