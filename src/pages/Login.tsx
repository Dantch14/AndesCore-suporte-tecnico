import { useState, type FormEvent } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../auth';
import { supabase } from '../supabase';

type Mode = 'entrar' | 'criar';
type State = { kind: 'idle' } | { kind: 'sending' } | { kind: 'error'; message: string } | { kind: 'confirm' };

export default function Login() {
  const { auth } = useAuth();
  const [mode, setMode] = useState<Mode>('entrar');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [state, setState] = useState<State>({ kind: 'idle' });

if (auth.status === 'in' || auth.status === 'error') return <Navigate to="/abrir-chamado" replace />;
   async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState({ kind: 'sending' });
    try {
      if (mode === 'entrar') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        setState(error ? { kind: 'error', message: `Não foi possível entrar: ${error.message}` } : { kind: 'idle' });
      } else {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) {
          setState({ kind: 'error', message: `Não foi possível criar a conta: ${error.message}` });
        } else {
          setState(data.session ? { kind: 'idle' } : { kind: 'confirm' });
        }
      }
    } catch {
      setState({ kind: 'error', message: 'Sem conexão com o servidor. Tente de novo.' });
    }
  }

  const switchMode = () => {
    setMode(mode === 'entrar' ? 'criar' : 'entrar');
    setState({ kind: 'idle' });
  };

  return (
    <section className="page split">
      <div>
        <h1>{mode === 'entrar' ? 'Entrar.' : 'Criar conta.'}</h1>
        <p className="lede">Abra chamados e acompanhe o andamento de cada um.</p>
      </div>
      <form onSubmit={(e) => { void submit(e); }}>
        <div className="field">
          <label htmlFor="email">E-mail</label>
          <input id="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="senha">Senha</label>
          <input id="senha" type="password" autoComplete={mode === 'entrar' ? 'current-password' : 'new-password'} minLength={6} required value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        {state.kind === 'error' && <p className="error" role="alert">{state.message}</p>}
        {state.kind === 'confirm' && <p className="note" role="status">Enviamos um link de confirmação para {email}. Abra-o e depois volte aqui para entrar.</p>}
        <p className="actions">
          <button type="submit" className="btn" disabled={state.kind === 'sending'}>
            {state.kind === 'sending' ? 'Aguarde…' : mode === 'entrar' ? 'Entrar' : 'Criar conta'}
          </button>
          <button type="button" className="linkbtn" onClick={switchMode}>
            {mode === 'entrar' ? 'Ainda não tenho conta' : 'Já tenho conta'}
          </button>
        </p>
      </form>
    </section>
  );
}
