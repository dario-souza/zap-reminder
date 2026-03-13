const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

import { supabase } from './supabase';

export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const url = `${API_URL}${endpoint}`;
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (token) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`,
    };
  }

  const response = await fetch(url, config);
  let data: any;
  const contentType = response.headers.get('content-type') || '';
  
  if (contentType.includes('application/json')) {
    data = await response.json();
  } else {
    const text = await response.text();
    try {
      data = JSON.parse(text);
    } catch {
      if (!response.ok) {
        throw new Error(text || `Erro ${response.status}: ${response.statusText}`);
      }
      data = { message: text };
    }
  }

  if (!response.ok) {
    const errMsg = data?.error ?? data?.message ?? 'Erro na requisição';
    throw new Error(errMsg);
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

  logout: async () => {
    await supabase.auth.signOut();
  },

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

  deleteAll: () =>
    apiFetch('/contacts', {
      method: 'DELETE',
    }),

  exportCSV: async () => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/contacts/export`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Erro ao exportar contatos');
    }
    
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'contatos.csv';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  },

  importCSV: async (contacts: { name: string; phone: string; email?: string }[]) => {
    const csvContent = 'name,phone,email\n' + contacts.map(c => 
      `"${c.name}","${c.phone}","${c.email || ''}"`
    ).join('\n');
    return apiFetch('/contacts/import', {
      method: 'POST',
      body: JSON.stringify({ csvContent }),
    });
  },
};

export const messagesApi = {
  getAll: () =>
    apiFetch('/messages'),

  create: (data: { chatId: string; body: string; contactId?: string; templateId?: string; scheduledAt?: string }) =>
    apiFetch('/messages', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  send: (data: { chatId: string; body: string; contactId?: string; templateId?: string }) =>
    apiFetch('/messages/send', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  schedule: (data: { chatId: string; body: string; scheduledAt: string; contactId?: string; templateId?: string }) =>
    apiFetch('/messages/schedule', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  createBulk: (data: {
    content: string;
    recipients: { chatId: string; body: string; contactId?: string }[];
    name?: string;
  }) =>
    apiFetch('/messages/batch', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  sendNow: (id: string) =>
    apiFetch(`/messages/${id}/send`, {
      method: 'POST',
    }),

  cancel: (id: string) =>
    apiFetch(`/messages/${id}/cancel`, {
      method: 'POST',
    }),

  deleteAll: () =>
    apiFetch('/messages', {
      method: 'DELETE',
    }),

  checkWhatsAppStatus: () =>
    apiFetch('/session/status'),

  sendTestMessage: (phone: string, message: string) =>
    apiFetch('/messages/test', {
      method: 'POST',
      body: JSON.stringify({ 
        phone, 
        message 
      }),
    }),

  getQRCode: () =>
    apiFetch('/session/qr'),

  disconnectWhatsApp: () =>
    apiFetch('/session/stop', {
      method: 'POST',
    }),

  startWhatsAppSession: () =>
    apiFetch('/session/start', {
      method: 'POST',
    }),
};

export const templatesApi = {
  getAll: () =>
    apiFetch('/templates'),

  create: (data: { name: string; content: string }) =>
    apiFetch('/templates', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: { name?: string; content?: string }) =>
    apiFetch(`/templates/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    apiFetch(`/templates/${id}`, {
      method: 'DELETE',
    }),

  deleteAll: () =>
    apiFetch('/templates', {
      method: 'DELETE',
    }),
};

export const sessionApi = {
  get: () =>
    apiFetch('/session'),

  start: () =>
    apiFetch('/session/start', {
      method: 'POST',
    }),

  stop: () =>
    apiFetch('/session/stop', {
      method: 'POST',
    }),

  logout: () =>
    apiFetch('/session/logout', {
      method: 'POST',
    }),

  getQr: () =>
    apiFetch('/session/qr'),
};

export const confirmationsApi = {
  getAll: () =>
    apiFetch('/confirmations'),

  create: (data: { contactName: string; contactPhone: string; eventDate: string; messageContent?: string }) =>
    apiFetch('/confirmations', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: { status: 'CONFIRMED' | 'DENIED'; response?: string }) =>
    apiFetch(`/confirmations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    apiFetch(`/confirmations/${id}`, {
      method: 'DELETE',
    }),
};
