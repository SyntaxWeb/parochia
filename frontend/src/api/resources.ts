import { api } from './client';
import type { ApiEnvelope, Church, DashboardPayload, Paginated, Parish, Permission, Role, User } from '../types/api';

type ListResponse<T> = T[] | Paginated<T>;

function unwrapList<T>(payload: ListResponse<T>): T[] {
  return Array.isArray(payload) ? payload : payload.data;
}

export async function getDashboard() { return (await api.get<ApiEnvelope<DashboardPayload>>('/dashboard')).data.data; }
export async function getParish() { return (await api.get<ApiEnvelope<Parish>>('/parish')).data.data; }
export async function updateParish(payload: Partial<Parish>) { return (await api.put<ApiEnvelope<Parish>>('/parish', payload)).data.data; }
export async function getChurches() { return unwrapList((await api.get<ApiEnvelope<ListResponse<Church>>>('/churches?per_page=100')).data.data); }
export async function createChurch(payload: Partial<Church>) { return (await api.post<ApiEnvelope<Church>>('/churches', payload)).data.data; }
export async function updateChurch(id: number, payload: Partial<Church>) { return (await api.put<ApiEnvelope<Church>>(`/churches/${id}`, payload)).data.data; }
export async function getUsers() { return unwrapList((await api.get<ApiEnvelope<ListResponse<User>>>('/users?per_page=100')).data.data); }
export async function createUser(payload: { name: string; email: string; password: string; phone?: string; has_parish_access: boolean; church_ids: number[]; role_ids: number[] }) { return (await api.post<ApiEnvelope<User>>('/users', payload)).data.data; }
export async function updateUser(id: number, payload: { name?: string; phone?: string; status?: string; has_parish_access?: boolean; church_ids?: number[]; role_ids?: number[] }) { return (await api.put<ApiEnvelope<User>>(`/users/${id}`, payload)).data.data; }
export async function getRoles() { return (await api.get<ApiEnvelope<Role[]>>('/roles')).data.data; }
export async function getPermissions() { return (await api.get<ApiEnvelope<Permission[]>>('/permissions')).data.data; }
import type { CalendarEvent, EventCategory, ParishEvent } from '../types/api';
export async function getEventCategories() { return (await api.get<ApiEnvelope<EventCategory[]>>('/event-categories')).data.data; }
export async function getAllEventCategories() { return (await api.get<ApiEnvelope<EventCategory[]>>('/event-categories', { params: { include_inactive: true } })).data.data; }
export async function createEventCategory(payload: Partial<EventCategory>) { return (await api.post<ApiEnvelope<EventCategory>>('/event-categories', payload)).data.data; }
export async function updateEventCategory(id: number, payload: Partial<EventCategory>) { return (await api.put<ApiEnvelope<EventCategory>>(`/event-categories/${id}`, payload)).data.data; }
export async function getCalendarEvents(params: Record<string, string | number | boolean | undefined>) { return (await api.get<ApiEnvelope<CalendarEvent[]>>('/events', { params: { ...params, calendar: true } })).data.data; }
export async function createEvent(payload: Partial<ParishEvent> & Record<string, unknown>) { return (await api.post<ApiEnvelope<ParishEvent>>('/events', payload)).data.data; }
export async function updateEvent(id: number, payload: Partial<ParishEvent> & Record<string, unknown>) { return (await api.put<ApiEnvelope<ParishEvent>>(`/events/${id}`, payload)).data.data; }
export async function cancelEvent(id: number) { return (await api.delete<ApiEnvelope<null>>(`/events/${id}`)).data; }
import type { NotificationPayload, SystemNotification } from '../types/api';
export async function getNotifications() { return (await api.get<ApiEnvelope<NotificationPayload>>('/notifications')).data.data; }
export async function markNotificationRead(id: number) { return (await api.post<ApiEnvelope<SystemNotification>>(`/notifications/${id}/read`)).data.data; }
export async function markAllNotificationsRead() { return (await api.post<ApiEnvelope<null>>('/notifications/mark-all-read')).data; }
import type { SubscriptionSummary } from '../types/api';
export async function getSubscription() { return (await api.get<ApiEnvelope<SubscriptionSummary>>('/subscription')).data.data; }
export async function requestSubscriptionCheckout(plan: string) { return (await api.post<ApiEnvelope<{ checkout_url: string | null; order_id: number }>>('/subscription/checkout', { plan })).data.data; }

export async function createUserInvite(payload: { email?: string; name?: string; has_parish_access: boolean; church_ids: number[]; role_ids: number[] }) { return (await api.post<ApiEnvelope<{ id: number; url: string; token: string; expires_at: string }>>('/user-invites', payload)).data.data; }
export async function getUserInvite(token: string) { return (await api.get<ApiEnvelope<{ token: string; email: string | null; name: string | null; tenant: { id: number; name: string }; expires_at: string | null }>>(`/invites/${token}`)).data.data; }
