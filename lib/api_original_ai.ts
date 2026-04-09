/**
 * API client for communicating with FastAPI backend.
 * All methods handle JSON serialization/deserialization and auth headers.
 */

const API_BASE = (import.meta.env.VITE_API_BASE as string | undefined) || 'http://localhost:8002/api/v1';
const AI_API_KEY = (import.meta.env.VITE_AI_API_KEY as string | undefined) || '';

/* ── Token management ── */
let accessToken: string | null = localStorage.getItem('access_token');

export function setToken(token: string | null) {
  accessToken = token;
  if (token) localStorage.setItem('access_token', token);
  else localStorage.removeItem('access_token');
}

export function getToken() {
  return accessToken;
}

/* ── Generic fetch wrapper ── */
async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const message = body.detail || `Request failed (${res.status})`;
    throw new Error(message);
  }

  // 204 No Content
  if (res.status === 204) return undefined as T;

  return res.json();
}

/* ── Auth API ── */

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface UserData {
  id: string;
  name: string;
  email: string;
  role?: string;
  grade: string | null;
  school: string | null;
  subjects: string | null;
  goals: string[] | null;
  interests: string[] | null;
  is_active: boolean;
  created_at: string;
}

export async function apiRegister(name: string, email: string, password: string): Promise<TokenResponse> {
  return request<TokenResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  });
}

export async function apiLogin(email: string, password: string): Promise<TokenResponse> {
  return request<TokenResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function apiLogout(): Promise<void> {
  return request<void>('/auth/logout', { method: 'POST' });
}

export async function apiGetMe(): Promise<UserData> {
  return request<UserData>('/auth/me');
}

/* ── User / Onboarding API ── */

export interface OnboardingPayload {
  name: string;
  goals: string[];
  grade: string;
  school: string;
  subjects: string;
  interests: string[];
}

export async function apiOnboarding(data: OnboardingPayload): Promise<UserData> {
  return request<UserData>('/users/me/onboarding', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function apiUpdateProfile(data: Partial<OnboardingPayload>): Promise<UserData> {
  return request<UserData>('/users/me', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

/* ── Preferences API ── */

export interface Preferences {
  language: string;
  notify_email: boolean;
  notify_push: boolean;
  notify_weekly: boolean;
}

export async function apiGetPreferences(): Promise<Preferences> {
  return request<Preferences>('/users/me/preferences');
}

export async function apiUpdatePreferences(data: Partial<Preferences>): Promise<Preferences> {
  return request<Preferences>('/users/me/preferences', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

/* ── Admin API ── */

export interface DashboardStats {
  total_users: number;
  active_users: number;
  inactive_users: number;
  new_users_today: number;
  new_users_week: number;
  users_by_role: Record<string, number>;
  users_by_grade: Record<string, number>;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  grade: string | null;
  school: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserListResponse {
  items: AdminUser[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface AuditLogEntry {
  id: string;
  actor_id: string | null;
  action: string;
  target_type: string | null;
  target_id: string | null;
  details: Record<string, unknown> | null;
  ip_address: string | null;
  created_at: string;
}

export interface AuditLogListResponse {
  items: AuditLogEntry[];
  total: number;
  page: number;
  page_size: number;
}

export async function apiAdminSetupFirstAdmin(): Promise<{ detail: string; email: string; role: string }> {
  return request('/admin/setup/promote-first-admin', { method: 'POST' });
}

export async function apiAdminStats(): Promise<DashboardStats> {
  return request<DashboardStats>('/admin/stats');
}

export async function apiAdminUsers(params: {
  page?: number;
  page_size?: number;
  search?: string;
  role?: string;
  status?: string;
  sort_by?: string;
  sort_dir?: string;
}): Promise<UserListResponse> {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== '') qs.set(k, String(v));
  });
  return request<UserListResponse>(`/admin/users?${qs.toString()}`);
}

export async function apiAdminGetUser(userId: string): Promise<AdminUser> {
  return request<AdminUser>(`/admin/users/${userId}`);
}

export async function apiAdminUpdateUser(
  userId: string,
  data: Partial<AdminUser>,
): Promise<AdminUser> {
  return request<AdminUser>(`/admin/users/${userId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function apiAdminDeleteUser(userId: string): Promise<void> {
  return request<void>(`/admin/users/${userId}`, { method: 'DELETE' });
}

export async function apiAdminLogs(params: {
  page?: number;
  page_size?: number;
  action?: string;
}): Promise<AuditLogListResponse> {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== '') qs.set(k, String(v));
  });
  return request<AuditLogListResponse>(`/admin/logs?${qs.toString()}`);
}

/* ── Admin Extended APIs ── */

export async function apiAdminAgents(): Promise<any[]> {
  return request<any[]>('/admin/agents');
}

export async function apiAdminUpdateAgent(id: string, data: any): Promise<any> {
  return request<any>(`/admin/agents/${id}`, { method: 'PUT', body: JSON.stringify(data) });
}

export async function apiAdminTokenUsage(period?: string): Promise<any> {
  const qs = period ? `?period=${period}` : '';
  return request<any>(`/admin/tokens/usage${qs}`);
}

export async function apiAdminChats(params?: Record<string, string>): Promise<any> {
  const qs = new URLSearchParams(params);
  return request<any>(`/admin/chats?${qs.toString()}`);
}

export async function apiAdminFlaggedContent(params?: Record<string, string>): Promise<any> {
  const qs = new URLSearchParams(params);
  return request<any>(`/admin/moderation?${qs.toString()}`);
}

export async function apiAdminAnalytics(type?: string): Promise<any> {
  const qs = type ? `?type=${type}` : '';
  return request<any>(`/admin/analytics${qs}`);
}

export async function apiAdminFeatureFlags(): Promise<any[]> {
  return request<any[]>('/admin/feature-flags');
}

export async function apiAdminUpdateFeatureFlag(id: string, data: any): Promise<any> {
  return request<any>(`/admin/feature-flags/${id}`, { method: 'PUT', body: JSON.stringify(data) });
}

export async function apiAdminIntegrations(): Promise<any[]> {
  return request<any[]>('/admin/integrations');
}

export async function apiAdminSystemSettings(): Promise<any> {
  return request<any>('/admin/settings');
}

export async function apiAdminUpdateSettings(data: any): Promise<any> {
  return request<any>('/admin/settings', { method: 'PUT', body: JSON.stringify(data) });
}

/* ── Agent AI Chat (SSE) ── */

export interface AgentSSECallbacks {
  onEvent?: (event: string, data: any) => void;
  onTextDelta?: (delta: string) => void;
  onDone?: (finalResult: any) => void;
  onError?: (error: string) => void;
}

export async function apiAgentChat(
  message: string,
  mode: string = 'general',
  callbacks: AgentSSECallbacks = {},
): Promise<void> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }
  if (AI_API_KEY) {
    headers['X-API-Key'] = AI_API_KEY;
  }

  const res = await fetch(`${API_BASE}/agent/chat`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      message,
      mode,
      session_id: `web-${mode}`,
    }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || `Agent request failed (${res.status})`);
  }

  const reader = res.body?.getReader();
  if (!reader) throw new Error('No response body');

  const decoder = new TextDecoder('utf-8');
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });

    // Parse SSE events from buffer
    const lines = buffer.split('\n');
    buffer = lines.pop() || ''; // Keep incomplete line in buffer

    let currentEvent = '';
    let currentData = '';

    for (const line of lines) {
      if (line.startsWith('event: ')) {
        currentEvent = line.slice(7).trim();
      } else if (line.startsWith('data: ')) {
        currentData = line.slice(6);
      } else if (line === '' && currentEvent) {
        // Empty line = end of event
        try {
          const parsed = JSON.parse(currentData);

          if (currentEvent === 'text_delta' && callbacks.onTextDelta) {
            callbacks.onTextDelta(parsed.delta || '');
          } else if (currentEvent === 'final_result' && callbacks.onDone) {
            callbacks.onDone(parsed);
          } else if (currentEvent === 'error' && callbacks.onError) {
            callbacks.onError(parsed.error || 'Unknown error');
          } else if (callbacks.onEvent) {
            callbacks.onEvent(currentEvent, parsed);
          }
        } catch {
          // Skip invalid JSON
        }
        currentEvent = '';
        currentData = '';
      }
    }
  }
}
