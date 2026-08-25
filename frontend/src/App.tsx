import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './stores/auth';
import { LoginPage } from './features/auth/LoginPage';
import { InviteAcceptPage } from './features/auth/InviteAcceptPage';
import { LandingPage } from './features/public/LandingPage';
import { OnboardingPage } from './features/public/OnboardingPage';
import { DashboardPage } from './features/dashboard/DashboardPage';
import { ChurchesPage } from './features/churches/ChurchesPage';
import { CalendarPage } from './features/calendar/CalendarPage';
import { UsersPage } from './features/users/UsersPage';
import { RolesPage } from './features/settings/RolesPage';
import { ParishSettingsPage } from './features/settings/ParishSettingsPage';
import { SubscriptionPage } from './features/subscription/SubscriptionPage';
import { AppLayout } from './layouts/AppLayout';
import { RequireAuth } from './routes/RequireAuth';

const queryClient = new QueryClient();
export function App() { return <QueryClientProvider client={queryClient}><AuthProvider><BrowserRouter><Routes><Route path="/" element={<LandingPage />} /><Route path="/login" element={<LoginPage />} /><Route path="/cadastro" element={<OnboardingPage />} /><Route path="/convite/:token" element={<InviteAcceptPage />} /><Route element={<RequireAuth><AppLayout /></RequireAuth>}><Route path="dashboard" element={<DashboardPage />} /><Route path="agenda" element={<CalendarPage />} /><Route path="igrejas" element={<ChurchesPage />} /><Route path="usuarios" element={<UsersPage />} /><Route path="perfis" element={<RolesPage />} /><Route path="configuracoes" element={<ParishSettingsPage />} /><Route path="assinatura" element={<SubscriptionPage />} /></Route></Routes></BrowserRouter></AuthProvider></QueryClientProvider>; }
