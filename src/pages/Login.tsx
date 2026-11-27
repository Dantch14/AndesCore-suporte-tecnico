import { useState, type FormEvent } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../auth';
import { supabase } from '../supabase';

type Mode = 'entrar' | 'criar' | 'recuperar';
type State =
  | { kind: 'idle' }
  | { kind: 'sending' }
  | { kind: 'error'; message: string }
  | { kind: 'sent'; message: string };

const TITLE: Record<Mode, string> = { entrar: 'Entrar.', criar: 'Criar conta.', recuperar: 'Recuperar senha.' };
const SUBMIT: Record<Mode, string> = { entrar: 'Entrar', criar: 'Criar conta', recuperar: 'Enviar link' };

export default function Login() {
  const { auth } = useAuth();
  const [mode, setMode] = useState<Mode>('entrar');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [state, setState] = useState<State>({ kind: 'idle' });

  if (auth.status === 'in') return <Navigate to="/abrir-chamado" replace />;

  const go = (next: Mode) => {
    setMode(next);
    setState({ kind: 'idle' });
  };

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState({ kind: 'sending' });
    try {
      if (mode === 'entrar') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (!error) {
          setState({ kind: 'idle' });
          return;
        }
        const notConfirmed = /not confirmed/i.test(error.message);
        setState({
          kind: 'error',
          message: notConfirmed ? 'Confirme seu e-mail pelo link que enviamos antes de entrar.' : 'E-mail ou senha incorretos.',
        });
      } else if (mode === 'criar') {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) {
          setState({ kind: 'error', message: 'Não foi possível criar a conta. Use um e-mail válido e uma senha com 6 ou mais caracteres.' });
        } else {
          setState(data.session
            ? { kind: 'idle' }
            : { kind: 'sent', message: `Enviamos um link de confirmação para ${email}. Abra-o para ativar a conta e depois entre aqui.` });
        }
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/redefinir-senha`,
        });
        if (error) {
          setState({ kind: 'error', message: 'Não foi possível enviar o link agora. Tente de novo em alguns minutos.' });
        } else {
          setState({ kind: 'sent', message: `Se ${email} tiver uma conta, enviamos um link para criar uma nova senha.` });
        }
      }
    } catch {
      setState({ kind: 'error', message: 'Sem conexão com o servidor. Tente de novo.' });
    }
  }

  return (
    <section className="page split">
      <div>
        <h1>{TITLE[mode]}</h1>
        <p className="lede">Abra chamados e acompanhe o andamento de cada um.</p>
      </div>
      <form onSubmit={(e) => { void submit(e); }}>
        <div className="field">
          <label htmlFor="email">E-mail</label>
          <input id="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        {mode !== 'recuperar' && (
          <div className="field">
            <label htmlFor="senha">Senha</label>
            <input id="senha" type="password" autoComplete={mode === 'entrar' ? 'current-password' : 'new-password'}
              minLength={6} required value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
        )}
        {state.kind === 'error' && <p className="error" role="alert">{state.message}</p>}
        {state.kind === 'sent' && <p className="note" role="status">{state.message}</p>}
        <p className="actions">
          <button type="submit" className="btn" disabled={state.kind === 'sending'}>
            {state.kind === 'sending' ? 'Aguarde…' : SUBMIT[mode]}
          </button>
          {mode === 'entrar' && (
            <>
              <button type="button" className="linkbtn" onClick={() => go('criar')}>Ainda não tenho conta</button>
              <button type="button" className="linkbtn" onClick={() => go('recuperar')}>Esqueci a senha</button>
            </>
          )}
          {mode !== 'entrar' && <button type="button" className="linkbtn" onClick={() => go('entrar')}>Voltar para entrar</button>}
        </p>
      </form>
    </section>
  );
}
