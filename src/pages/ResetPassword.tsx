import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth';
import { supabase } from '../supabase';

type State = { kind: 'idle' } | { kind: 'sending' } | { kind: 'error'; message: string } | { kind: 'done' };

/** Abre pelo link do e-mail: o Supabase já cria a sessão de recuperação ao carregar a página. */
export default function ResetPassword() {
  const { auth } = useAuth();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [state, setState] = useState<State>({ kind: 'idle' });

  if (auth.status === 'loading') return <section className="page"><p role="status">Verificando o link…</p></section>;
  if (auth.status === 'out') {
    return (
      <section className="page">
        <h1>Link inválido ou expirado.</h1>
        <p className="lede">Peça um novo link na tela de entrada, em “Esqueci a senha”.</p>
        <p className="actions"><Link className="btn" to="/entrar">Ir para a entrada</Link></p>
      </section>
    );
  }
  if (state.kind === 'done') {
    return (
      <section className="page" aria-live="polite">
        <h1>Senha alterada.</h1>
        <p className="actions"><Link className="btn" to="/abrir-chamado">Continuar</Link></p>
      </section>
    );
  }

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (password !== confirm) {
      setState({ kind: 'error', message: 'As senhas não conferem.' });
      return;
    }
    setState({ kind: 'sending' });
    try {
      const { error } = await supabase.auth.updateUser({ password });
      setState(error
        ? { kind: 'error', message: 'Não foi possível alterar a senha. Use 6 ou mais caracteres, ou peça um novo link se este já foi usado.' }
        : { kind: 'done' });
    } catch {
      setState({ kind: 'error', message: 'Sem conexão com o servidor. Tente de novo.' });
    }
  }

  return (
    <section className="page split">
      <div>
        <h1>Nova senha.</h1>
        <p className="lede">Escolha uma senha com 6 ou mais caracteres.</p>
      </div>
      <form onSubmit={(e) => { void submit(e); }}>
        <div className="field">
          <label htmlFor="nova">Nova senha</label>
          <input id="nova" type="password" autoComplete="new-password" minLength={6} required value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="repetir">Repita a senha</label>
          <input id="repetir" type="password" autoComplete="new-password" minLength={6} required value={confirm} onChange={(e) => setConfirm(e.target.value)} />
        </div>
        {state.kind === 'error' && <p className="error" role="alert">{state.message}</p>}
        <button type="submit" className="btn" disabled={state.kind === 'sending'}>
          {state.kind === 'sending' ? 'Aguarde…' : 'Salvar senha'}
        </button>
      </form>
    </section>
  );
}
