import { BrowserRouter, Navigate, NavLink, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, RequireAuth, useAuth } from './auth';
import Login from './pages/Login';
import ResetPassword from './pages/ResetPassword';
import OpenTicket from './pages/OpenTicket';
import TicketList from './pages/TicketList';
import TicketDetail from './pages/TicketDetail';

const queryClient = new QueryClient();

function Header() {
  const { auth, signOut } = useAuth();
  const isAdmin = auth.status === 'in' && auth.role === 'admin';
  return (
    <header className="top">
      <span className="brand">AndesCore <span>Suporte técnico</span></span>
      {auth.status === 'in' && (
        <nav aria-label="Principal">
          <NavLink to="/abrir-chamado">Abrir chamado</NavLink>
          <NavLink to="/chamados">{isAdmin ? 'Fila' : 'Meus chamados'}</NavLink>
          <NavLink to="/alterar-senha">Alterar senha</NavLink>
          <span className="who">{auth.email}{isAdmin && ' · administrador'}</span>
          <button type="button" className="linkbtn" onClick={signOut}>Sair</button>
        </nav>
      )}
    </header>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Header />
          <main id="conteudo">
            <Routes>
              <Route path="/entrar" element={<Login />} />
              <Route path="/redefinir-senha" element={<ResetPassword />} />
              <Route element={<RequireAuth />}>
                <Route path="/abrir-chamado" element={<OpenTicket />} />
                <Route path="/chamados" element={<TicketList />} />
                <Route path="/chamados/:id" element={<TicketDetail />} />
                <Route path="/alterar-senha" element={<ResetPassword />} />
              </Route>
              <Route path="*" element={<Navigate to="/abrir-chamado" replace />} />
            </Routes>
          </main>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}
