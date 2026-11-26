import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { Session } from '@supabase/supabase-js';
import { supabase } from './supabase';

export type Role = 'cliente' | 'admin';
export type Auth =
  | { status: 'loading' }
  | { status: 'out' }
  | { status: 'error' }
  | { status: 'in'; userId: string; email: string; role: Role };

interface AuthContext {
  auth: Auth;
  signOut: () => void;
}
const Ctx = createContext<AuthContext | null>(null);

export function useAuth(): AuthContext {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useAuth precisa estar dentro de AuthProvider');
  return ctx;
}

async function fetchRole(): Promise<Role> {
  const { data, error } = await supabase.from('profiles').select('role').single();
  if (error) throw error;
  return (data as unknown as { role: Role }).role;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [session, setSession] = useState<Session | null | undefined>(undefined);

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((_event, next) => setSession(next));
    return () => data.subscription.unsubscribe();
  }, []);

  const roleQuery = useQuery({
    queryKey: ['role', session?.user.id],
    queryFn: fetchRole,
    enabled: !!session,
  });

  let auth: Auth;
  if (session === undefined) auth = { status: 'loading' };
  else if (session === null) auth = { status: 'out' };
  else if (roleQuery.isError) auth = { status: 'error' };
  else if (roleQuery.data) auth = { status: 'in', userId: session.user.id, email: session.user.email ?? '', role: roleQuery.data };
  else auth = { status: 'loading' };

  const signOut = () => {
    supabase.auth.signOut().catch(() => undefined).finally(() => queryClient.clear());
  };

  return <Ctx.Provider value={{ auth, signOut }}>{children}</Ctx.Provider>;
}

export function RequireAuth() {
  const { auth, signOut } = useAuth();
  if (auth.status === 'loading') return <section className="page"><p role="status">Carregando…</p></section>;
  if (auth.status === 'out') return <Navigate to="/entrar" replace />;
  if (auth.status === 'error') {
    return (
      <section className="page">
        <h1>Não foi possível confirmar seu acesso.</h1>
        <p className="actions"><button type="button" className="btn" onClick={signOut}>Sair e entrar de novo</button></p>
      </section>
    );
  }
  return <Outlet />;
}
