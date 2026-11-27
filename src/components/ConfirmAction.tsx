import { useState } from 'react';

interface Props {
  label: string;
  question: string;
  confirmLabel: string;
  pending: boolean;
  onConfirm: () => void;
}

/** Ação destrutiva em dois passos: o botão pergunta antes de executar. */
export default function ConfirmAction({ label, question, confirmLabel, pending, onConfirm }: Props) {
  const [asking, setAsking] = useState(false);

  if (!asking) {
    return (
      <button type="button" className="linkbtn danger" disabled={pending} onClick={() => setAsking(true)}>
        {pending ? 'Aguarde…' : label}
      </button>
    );
  }
  return (
    <div role="group" aria-label={question}>
      <p>{question}</p>
      <button type="button" className="btn" onClick={() => { onConfirm(); setAsking(false); }}>{confirmLabel}</button>
      <button type="button" className="btn ghost" onClick={() => setAsking(false)}>Cancelar</button>
    </div>
  );
}
