/**
 * API client for communicating with FastAPI backend.
 * All methods handle JSON serialization/deserialization and auth headers.
 */

const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:8000') + '/api/v1';

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
    if (res.status === 401) {
      const isAuthRoute = path.startsWith('/auth/login') || path.startsWith('/auth/register');
      if (!isAuthRoute && accessToken) {
        setToken(null);
        window.location.href = '/login';
        throw new Error('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
      } else {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.detail || 'Xác thực thất bại');
      }
    }
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

export async function apiAdminHardDeleteUser(userId: string): Promise<void> {
  return request<void>(`/admin/users/${userId}/hard`, { method: 'DELETE' });
}

export async function apiAdminResetPassword(userId: string): Promise<{ detail: string; temp_password: string }> {
  return request<{ detail: string; temp_password: string }>(`/admin/users/${userId}/reset-password`, { method: 'POST' });
}

export async function apiAdminSuspendUser(userId: string): Promise<{ detail: string; status: string }> {
  return request<{ detail: string; status: string }>(`/admin/users/${userId}/suspend`, { method: 'POST' });
}

export async function apiAdminBanUser(userId: string): Promise<{ detail: string; status: string }> {
  return request<{ detail: string; status: string }>(`/admin/users/${userId}/ban`, { method: 'POST' });
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

/* ── Data Exchange (Export/Import) ── */

/**
 * Download a file from an export endpoint.
 * Triggers a browser download with the filename from Content-Disposition.
 */
async function downloadFile(path: string, fallbackFilename: string): Promise<void> {
  const headers: Record<string, string> = {};
  if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;

  const res = await fetch(`${API_BASE}${path}`, { headers });
  if (!res.ok) {
    if (res.status === 401) {
      if (accessToken) {
        setToken(null);
        window.location.href = '/login';
        throw new Error('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
      } else {
        throw new Error('Bạn cần đăng nhập để thao tác.');
      }
    }
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || `Export failed (${res.status})`);
  }

  const blob = await res.blob();
  const disposition = res.headers.get('Content-Disposition');
  let filename = fallbackFilename;
  if (disposition) {
    const match = disposition.match(/filename="?([^"]+)"?/);
    if (match) filename = match[1];
  }

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function apiExportUsersCSV() { return downloadFile('/admin/export/users/csv', 'users.csv'); }
export function apiExportUsersExcel() { return downloadFile('/admin/export/users/excel', 'users.xlsx'); }
export function apiExportAuditLogsJSON() { return downloadFile('/admin/export/audit-logs/json', 'audit_logs.json'); }
export function apiExportConversationsJSON() { return downloadFile('/admin/export/conversations/json', 'conversations.json'); }
export function apiExportBackupJSON() { return downloadFile('/admin/export/backup/json', 'nextstem_backup.json'); }
export function apiExportDumpXML() { return downloadFile('/admin/export/dump/xml', 'nextstem_dump.xml'); }
export function apiExportTemplate() { return downloadFile('/admin/export/template/csv', 'import_template.csv'); }

export interface ImportPreviewResult {
  total: number;
  valid: number;
  duplicates: number;
  errors: number;
  rows: Array<{
    row: number; name: string; email: string; role: string;
    grade: string; school: string; status: string; error?: string;
  }>;
  columns: string[];
}

export interface ImportResult {
  created: number;
  skipped: number;
  errors: Array<{ row: number; email: string; reason: string }>;
}

export async function apiImportUsersPreview(file: File): Promise<ImportPreviewResult> {
  const formData = new FormData();
  formData.append('file', file);
  const headers: Record<string, string> = {};
  if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;

  const res = await fetch(`${API_BASE}/admin/import/users/preview`, {
    method: 'POST', headers, body: formData,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || `Preview failed (${res.status})`);
  }
  return res.json();
}

export async function apiImportUsersCSV(file: File): Promise<ImportResult> {
  const formData = new FormData();
  formData.append('file', file);
  const headers: Record<string, string> = {};
  if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;

  const res = await fetch(`${API_BASE}/admin/import/users/csv`, {
    method: 'POST', headers, body: formData,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || `Import failed (${res.status})`);
  }
  return res.json();
}

/* ── Admin Resource Management (Scholarships & Universities) ── */

export interface ScholarshipItem {
  id: string;
  name: string;
  country: string;
  countryCode: string;
  countryFlag?: string;
  value: string;
  level: string;
  deadline: string;
  image?: string;
  description?: string;
  benefits?: string[];
  requirements?: string[];
  fields?: string[];
  applicationUrl?: string;
  hostInstitution?: string;
  duration?: string;
  openDate?: string;
  status?: string;
  lastUpdated?: string;
  updatedBy?: string;
}

export interface UniversityItem {
  id: string;
  name: string;
  shortName?: string;
  country: string;
  countryCode: string;
  countryFlag?: string;
  city?: string;
  rank?: string;
  acceptRate?: string;
  fields?: string[];
  image?: string;
  description?: string;
  founded?: number;
  type?: string;
  studentCount?: string;
  internationalRate?: string;
  tuitionFee?: string;
  financialAid?: string;
  topPrograms?: string[];
  campusLife?: string;
  admissionTips?: string[];
  website?: string;
  lastUpdated?: string;
  updatedBy?: string;
}

// Scholarships
export async function apiAdminListScholarships(): Promise<ScholarshipItem[]> {
  return request<ScholarshipItem[]>('/admin/resources/scholarships');
}

export async function apiAdminCreateScholarship(data: Omit<ScholarshipItem, 'id' | 'lastUpdated' | 'updatedBy'>): Promise<ScholarshipItem> {
  return request<ScholarshipItem>('/admin/resources/scholarships', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function apiAdminUpdateScholarship(id: string, data: Partial<ScholarshipItem>): Promise<ScholarshipItem> {
  return request<ScholarshipItem>(`/admin/resources/scholarships/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function apiAdminDeleteScholarship(id: string): Promise<void> {
  return request<void>(`/admin/resources/scholarships/${id}`, { method: 'DELETE' });
}

// Universities
export async function apiAdminListUniversities(): Promise<UniversityItem[]> {
  return request<UniversityItem[]>('/admin/resources/universities');
}

export async function apiAdminCreateUniversity(data: Omit<UniversityItem, 'id' | 'lastUpdated' | 'updatedBy'>): Promise<UniversityItem> {
  return request<UniversityItem>('/admin/resources/universities', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function apiAdminUpdateUniversity(id: string, data: Partial<UniversityItem>): Promise<UniversityItem> {
  return request<UniversityItem>(`/admin/resources/universities/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function apiAdminDeleteUniversity(id: string): Promise<void> {
  return request<void>(`/admin/resources/universities/${id}`, { method: 'DELETE' });
}

/* ── Chat / AI Advisor ── */

export interface ChatSession {
  id: string;
  mode: string;
  title: string | null;
  created_at: string;
  updated_at: string;
  last_message: string | null;
}

export async function apiCreateChatSession(mode: string, title?: string): Promise<ChatSession> {
  return request<ChatSession>('/chat/sessions', {
    method: 'POST',
    body: JSON.stringify({ mode, title }),
  });
}

export async function apiListChatSessions(): Promise<ChatSession[]> {
  return request<ChatSession[]>('/chat/sessions');
}

export interface ChatMessageData {
  id: string;
  role: 'user' | 'ai';
  content: string;
  created_at: string;
}

export interface ChatSessionDetail extends ChatSession {
  messages: ChatMessageData[];
}

export async function apiGetChatSession(sessionId: string): Promise<ChatSessionDetail> {
  return request<ChatSessionDetail>(`/chat/sessions/${sessionId}`);
}

export async function apiDeleteChatSession(sessionId: string): Promise<void> {
  return request<void>(`/chat/sessions/${sessionId}`, { method: 'DELETE' });
}

export async function apiRenameChatSession(sessionId: string, title: string): Promise<ChatSession> {
  return request<ChatSession>(`/chat/sessions/${sessionId}`, {
    method: 'PATCH',
    body: JSON.stringify({ title }),
  });
}

export async function apiDeleteChatMessage(sessionId: string, messageId: string): Promise<void> {
  return request<void>(`/chat/sessions/${sessionId}/messages/${messageId}`, { method: 'DELETE' });
}

/**
 * Stream AI response via SSE.
 * Returns an object with helpers to read events and abort.
 */
export function apiChatAIStream(
  sessionId: string,
  content: string,
  mode: string,
  onEvent: (event: string, data: any) => void,
  onDone: () => void,
  onError: (err: Error) => void,
): { abort: () => void } {
  const controller = new AbortController();

  const url = `${API_BASE}/chat/sessions/${sessionId}/ai/stream`;

  fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
    body: JSON.stringify({ content, mode }),
    signal: controller.signal,
  })
    .then(async (res) => {
      if (!res.ok) {
        if (res.status === 401) {
          if (accessToken) {
            setToken(null);
            window.location.href = '/login';
            throw new Error('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
          } else {
            throw new Error('Bạn cần đăng nhập để thao tác.');
          }
        }
        const body = await res.json().catch(() => ({}));
        throw new Error(body.detail || `AI request failed (${res.status})`);
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error('No response body');

      const decoder = new TextDecoder();
      let buffer = '';
      let currentEvent = '';  // track "event:" line for next "data:" line

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) {
            // Empty line resets event name per SSE spec
            currentEvent = '';
            continue;
          }

          if (trimmed.startsWith('event: ')) {
            currentEvent = trimmed.slice(7).trim();
          } else if (trimmed.startsWith('data: ')) {
            const jsonStr = trimmed.slice(6);
            if (jsonStr === '[DONE]') {
              onDone();
              return;
            }
            try {
              const parsed = JSON.parse(jsonStr);
              const eventType = currentEvent || parsed.event || parsed.type || 'unknown';
              onEvent(eventType, parsed);

              if (eventType === 'done') {
                onDone();
                return;
              }
            } catch {
              // Non-JSON SSE line — forward as text_delta
              onEvent(currentEvent || 'text_delta', { text: jsonStr });
            }
          }
        }
      }

      onDone();
    })
    .catch((err) => {
      if (err.name !== 'AbortError') {
        onError(err);
      }
    });

  return { abort: () => controller.abort() };
}

/**
 * Save the final AI message after streaming completes.
 */
export async function apiSaveChatAIMessage(sessionId: string, content: string): Promise<void> {
  return request<void>(`/chat/sessions/${sessionId}/ai/save`, {
    method: 'POST',
    body: JSON.stringify({ content }),
  });
}

/* ── STEM Competency API ── */

export interface STEMIndicator {
  id: string;
  code: string;
  name: string;
  description: string | null;
  level_descriptors: Record<string, string> | null;
  display_order: number;
}

export interface STEMCompetency {
  id: string;
  code: string;
  name: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  display_order: number;
  indicators: STEMIndicator[];
}

export interface CompetencyScore {
  id: string;
  user_id: string;
  indicator_id: string;
  score: number;
  level: number;
  source: string;
  evidence_note: string | null;
  assessed_at: string;
  created_at: string;
}

export interface RadarDataPoint {
  competency_code: string;
  competency_name: string;
  score: number;
  indicator_count: number;
  scored_count: number;
}

export interface CompetencyRadarResponse {
  data: RadarDataPoint[];
  overall_score: number;
  assessed_indicators: number;
  total_indicators: number;
}

export interface StrengthWeakness {
  indicator_code: string;
  indicator_name: string;
  competency_name: string;
  score: number;
  level: number;
  source: string;
}

export interface CompetencyAnalysis {
  strengths: StrengthWeakness[];
  weaknesses: StrengthWeakness[];
  overall_score: number;
  profile_status: 'not_started' | 'in_progress' | 'complete';
  recommendations: string[];
}

/** Get the full STEM competency framework (public). */
export async function apiGetCompetencyFramework(): Promise<STEMCompetency[]> {
  return request<STEMCompetency[]>('/competencies/framework');
}

/** Get current user's latest competency scores. */
export async function apiGetCompetencyScores(): Promise<CompetencyScore[]> {
  return request<CompetencyScore[]>('/competencies/scores');
}

/** Submit a score for a behavioral indicator. */
export async function apiUpdateCompetencyScore(data: {
  indicator_id: string;
  score: number;
  level?: number;
  source?: string;
  evidence_note?: string;
}): Promise<CompetencyScore> {
  return request<CompetencyScore>('/competencies/scores', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/** Batch update multiple competency scores. */
export async function apiBatchCompetencyScores(scores: Array<{
  indicator_id: string;
  score: number;
  level?: number;
  source?: string;
}>): Promise<{ created: number }> {
  return request<{ created: number }>('/competencies/scores/batch', {
    method: 'POST',
    body: JSON.stringify({ scores }),
  });
}

/** Get radar chart data (aggregated scores per competency). */
export async function apiGetCompetencyRadar(): Promise<CompetencyRadarResponse> {
  return request<CompetencyRadarResponse>('/competencies/radar');
}

/** Get strength/weakness analysis. */
export async function apiGetCompetencyAnalysis(): Promise<CompetencyAnalysis> {
  return request<CompetencyAnalysis>('/competencies/analysis');
}

/* ── Digital Twin Student (DTS) API ── */

export interface DTSProfile {
  user_id: string;
  name: string;
  email: string;
  grade: string | null;
  school: string | null;
  competency_summary: Array<{
    competency_code: string;
    competency_name: string;
    avg_score: number;
    level: number;
    indicators: any[];
  }>;
  overall_score: number;
  project_count: number;
  certificate_count: number;
  activity_count: number;
  personalization_vars: Record<string, any>;
  profile_completeness: number;
  recent_activities: Array<{
    id: string;
    action: string;
    entity_type: string | null;
    entity_id: string | null;
    metadata: Record<string, any> | null;
    created_at: string;
  }>;
  assessed_indicators: number;
  total_indicators: number;
}

export interface DTSSnapshot {
  id: string;
  competency_summary: Record<string, any> | null;
  profile_completeness: number;
  overall_score: number;
  created_at: string;
}

export interface DTSTimelinePoint {
  date: string;
  overall_score: number;
  competency_scores: Record<string, number>;
}

export interface DTSTimeline {
  points: DTSTimelinePoint[];
  current_score: number;
  score_change: number;
}

/** Get aggregated DTS profile. */
export async function apiGetDTSProfile(): Promise<DTSProfile> {
  return request<DTSProfile>('/dts/profile');
}

/** Create a DTS snapshot. */
export async function apiCreateDTSSnapshot(): Promise<{ id: string; profile_completeness: number; overall_score: number; created_at: string }> {
  return request('/dts/snapshot', { method: 'POST' });
}

/** Get historical DTS snapshots. */
export async function apiGetDTSSnapshots(limit?: number): Promise<DTSSnapshot[]> {
  const qs = limit ? `?limit=${limit}` : '';
  return request<DTSSnapshot[]>(`/dts/snapshots${qs}`);
}

/** Get competency timeline (changes over time). */
export async function apiGetDTSTimeline(): Promise<DTSTimeline> {
  return request<DTSTimeline>('/dts/timeline');
}

/** Get recent learner activity events. */
export async function apiGetDTSActivities(limit?: number): Promise<Array<{
  id: string;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  metadata: Record<string, any> | null;
  created_at: string;
}>> {
  const qs = limit ? `?limit=${limit}` : '';
  return request(`/dts/activities${qs}`);
}