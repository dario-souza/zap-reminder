const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const url = `${API_URL}${endpoint}`;
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  // Adiciona token se existir
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (token) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`,
    };
  }

  const response = await fetch(url, config);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Erro na requisição');
  }

  return data;
}

export const authApi = {
  login: (email: string, password: string) =>
    apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  register: (name: string, email: string, password: string) =>
    apiFetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    }),

  logout: () =>
    apiFetch('/auth/logout', {
      method: 'POST',
    }),

  me: () =>
    apiFetch('/auth/me'),
};

export const contactsApi = {
  getAll: () =>
    apiFetch('/contacts'),

  create: (data: { name: string; phone: string; email?: string }) =>
    apiFetch('/contacts', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: { name?: string; phone?: string; email?: string }) =>
    apiFetch(`/contacts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    apiFetch(`/contacts/${id}`, {
      method: 'DELETE',
    }),
};

export const messagesApi = {
  getAll: () =>
    apiFetch('/messages'),

  create: (data: { content: string; contactId: string; scheduledAt?: string }) =>
    apiFetch('/messages', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  sendNow: (id: string) =>
    apiFetch(`/messages/${id}/send`, {
      method: 'POST',
    }),

  delete: (id: string) =>
    apiFetch(`/messages/${id}`, {
      method: 'DELETE',
    }),

  checkWhatsAppStatus: () =>
    apiFetch('/messages/whatsapp/status'),

  sendTestMessage: (phone: string, message: string) =>
    apiFetch('/messages/test', {
      method: 'POST',
      body: JSON.stringify({ phone, message }),
    }),

  getQRCode: () =>
    apiFetch('/messages/whatsapp/qrcode'),

  disconnectWhatsApp: () =>
    apiFetch('/messages/whatsapp/disconnect', {
      method: 'POST',
    }),

  getCronStatus: () =>
    apiFetch('/messages/cron/status'),

  toggleCron: (action: 'start' | 'stop') =>
    apiFetch('/messages/cron/toggle', {
      method: 'POST',
      body: JSON.stringify({ action }),
    }),
};
