import { BrowserRouter, Navigate, NavLink, Route, Routes } from 'react-router-dom';
import OpenTicket from './pages/OpenTicket';
import TicketList from './pages/TicketList';
import TicketDetail from './pages/TicketDetail';

export default function App() {
  return (
    <BrowserRouter>
      <a className="skip" href="#conteudo">Ir para o conteúdo</a>
      <header className="top">
        <span className="brand">AndesCore <span>Suporte técnico</span></span>
        <nav aria-label="Principal">
          <NavLink to="/abrir-chamado">Abrir chamado</NavLink>
          <NavLink to="/chamados">Fila</NavLink>
        </nav>
      </header>
      <main id="conteudo">
        <Routes>
          <Route path="/" element={<Navigate to="/abrir-chamado" replace />} />
          <Route path="/abrir-chamado" element={<OpenTicket />} />
          <Route path="/chamados" element={<TicketList />} />
          <Route path="/chamados/:id" element={<TicketDetail />} />
          <Route path="*" element={<Navigate to="/abrir-chamado" replace />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}
