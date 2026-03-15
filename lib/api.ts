import { supabase } from './supabase'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

async function getAuthHeaders(): Promise<HeadersInit> {
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

export const api = {
  messages: {
    list: async () => {
      const res = await fetch(`${BASE_URL}/messages`, {
        headers: await getAuthHeaders(),
      })
      if (!res.ok) throw new Error(await res.text())
      return res.json()
    },

    create: async (data: any) => {
      const res = await fetch(`${BASE_URL}/messages`, {
        method: 'POST',
        headers: await getAuthHeaders(),
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error(await res.text())
      return res.json()
    },

    cancel: async (id: string) => {
      const res = await fetch(`${BASE_URL}/messages/${id}/cancel`, {
        method: 'POST',
        headers: await getAuthHeaders(),
      })
      if (!res.ok) throw new Error(await res.text())
    },

    sendNow: async (id: string) => {
      const res = await fetch(`${BASE_URL}/messages/${id}/send`, {
        method: 'POST',
        headers: await getAuthHeaders(),
      })
      if (!res.ok) throw new Error(await res.text())
    },

    createBulk: async (data: any) => {
      const res = await fetch(`${BASE_URL}/messages/bulk`, {
        method: 'POST',
        headers: await getAuthHeaders(),
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error(await res.text())
      return res.json()
    },

    sendTest: async (phone: string, message: string) => {
      const res = await fetch(`${BASE_URL}/messages/test`, {
        method: 'POST',
        headers: await getAuthHeaders(),
        body: JSON.stringify({ phone, message }),
      })
      if (!res.ok) throw new Error(await res.text())
      return res.json()
    },
  },

  contacts: {
    list: async () => {
      const res = await fetch(`${BASE_URL}/contacts`, {
        headers: await getAuthHeaders(),
      })
      if (!res.ok) throw new Error(await res.text())
      return res.json()
    },

    create: async (data: any) => {
      const res = await fetch(`${BASE_URL}/contacts`, {
        method: 'POST',
        headers: await getAuthHeaders(),
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error(await res.text())
      return res.json()
    },

    update: async (id: string, data: any) => {
      const res = await fetch(`${BASE_URL}/contacts/${id}`, {
        method: 'PUT',
        headers: await getAuthHeaders(),
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error(await res.text())
      return res.json()
    },

    remove: async (id: string) => {
      const res = await fetch(`${BASE_URL}/contacts/${id}`, {
        method: 'DELETE',
        headers: await getAuthHeaders(),
      })
      if (!res.ok) throw new Error(await res.text())
    },

    importCSV: async (csvContent: string) => {
      const res = await fetch(`${BASE_URL}/contacts/import`, {
        method: 'POST',
        headers: await getAuthHeaders(),
        body: JSON.stringify({ csvContent }),
      })
      if (!res.ok) throw new Error(await res.text())
      return res.json()
    },

    exportCSV: async () => {
      const { data } = await supabase.auth.getSession()
      const token = data.session?.access_token
      const res = await fetch(`${BASE_URL}/contacts/export`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (!res.ok) throw new Error('Erro ao exportar contatos')
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'contatos.csv'
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    },
  },

  templates: {
    list: async () => {
      const res = await fetch(`${BASE_URL}/templates`, {
        headers: await getAuthHeaders(),
      })
      if (!res.ok) throw new Error(await res.text())
      return res.json()
    },

    create: async (data: any) => {
      const res = await fetch(`${BASE_URL}/templates`, {
        method: 'POST',
        headers: await getAuthHeaders(),
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error(await res.text())
      return res.json()
    },

    update: async (id: string, data: any) => {
      const res = await fetch(`${BASE_URL}/templates/${id}`, {
        method: 'PUT',
        headers: await getAuthHeaders(),
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error(await res.text())
      return res.json()
    },

    remove: async (id: string) => {
      const res = await fetch(`${BASE_URL}/templates/${id}`, {
        method: 'DELETE',
        headers: await getAuthHeaders(),
      })
      if (!res.ok) throw new Error(await res.text())
    },
  },

  session: {
    status: async () => {
      const res = await fetch(`${BASE_URL}/sessions/status`, {
        headers: await getAuthHeaders(),
      })
      if (!res.ok) throw new Error(await res.text())
      return res.json()
    },

    start: async () => {
      const res = await fetch(`${BASE_URL}/sessions/start`, {
        method: 'POST',
        headers: await getAuthHeaders(),
      })
      if (!res.ok) throw new Error(await res.text())
      return res.json()
    },

    qrCode: async () => {
      const res = await fetch(`${BASE_URL}/sessions/qr`, {
        headers: await getAuthHeaders(),
      })
      if (!res.ok) throw new Error(await res.text())
      return res.json()
    },

    stop: async () => {
      const res = await fetch(`${BASE_URL}/sessions/stop`, {
        method: 'POST',
        headers: await getAuthHeaders(),
      })
      if (!res.ok) throw new Error(await res.text())
      return res.json()
    },

    logout: async () => {
      const res = await fetch(`${BASE_URL}/sessions/logout`, {
        method: 'POST',
        headers: await getAuthHeaders(),
      })
      if (!res.ok) throw new Error(await res.text())
      return res.json()
    },
  },

  confirmations: {
    list: async () => {
      const res = await fetch(`${BASE_URL}/confirmations`, {
        headers: await getAuthHeaders(),
      })
      if (!res.ok) throw new Error(await res.text())
      return res.json()
    },

    create: async (data: any) => {
      const res = await fetch(`${BASE_URL}/confirmations`, {
        method: 'POST',
        headers: await getAuthHeaders(),
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error(await res.text())
      return res.json()
    },

    update: async (id: string, data: any) => {
      const res = await fetch(`${BASE_URL}/confirmations/${id}`, {
        method: 'PUT',
        headers: await getAuthHeaders(),
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error(await res.text())
      return res.json()
    },

    remove: async (id: string) => {
      const res = await fetch(`${BASE_URL}/confirmations/${id}`, {
        method: 'DELETE',
        headers: await getAuthHeaders(),
      })
      if (!res.ok) throw new Error(await res.text())
    },
  },
}

export const contactsApi = api.contacts
export const messagesApi = api.messages
export const templatesApi = api.templates
export const sessionApi = api.session
export const confirmationsApi = api.confirmations
