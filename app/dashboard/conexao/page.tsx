'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { WAHAQRModal } from '@/components/whatsapp/WAHAQRModal'
import { useWAHASessionStore } from '@/stores/wahaSessionStore'
import { useCreateWAHASession } from '@/hooks/useCreateWAHASession'
import { useAuthStore } from '@/stores/authStore'
import { 
  Smartphone, 
  CheckCircle, 
  XCircle, 
  RefreshCw, 
  Link2, 
  Unlink,
  Send
} from 'lucide-react'

export default function ConexaoPage() {
  const { user } = useAuthStore()
  const { status, isModalOpen, openModal, closeModal } = useWAHASessionStore()
  const { mutate, isPending } = useCreateWAHASession()
  
  const [testPhone, setTestPhone] = useState('')
  const [testMessage, setTestMessage] = useState('')
  const [isSendingTest, setIsSendingTest] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const isConnected = status === 'WORKING'

  const handleConnect = () => {
    if (user?.id) {
      const sessionName = `user_${user.id.replace(/-/g, '_').substring(0, 40)}`
      mutate(sessionName)
    }
  }

  const handleDisconnect = async () => {
    try {
      const { api } = await import('@/lib/api')
      await api.waha.disconnect()
      setMessage({ type: 'success', text: 'WhatsApp desconectado!' })
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Erro ao desconectar' })
    }
  }

  const handleSendTest = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!testPhone) return
    
    setIsSendingTest(true)
    setMessage(null)
    try {
      const { messagesApi } = await import('@/lib/api')
      await messagesApi.sendTest(testPhone, testMessage || 'Teste ZapReminder!')
      setMessage({ type: 'success', text: 'Mensagem enviada!' })
      setTestPhone('')
      setTestMessage('')
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Erro ao enviar' })
    } finally {
      setIsSendingTest(false)
    }
  }

  const getStatusLabel = () => {
    switch (status) {
      case 'WORKING': return 'Conectado'
      case 'STARTING': return 'Iniciando...'
      case 'SCAN_QR_CODE': return 'Aguardando QR Code'
      case 'FAILED': return 'Falhou'
      default: return 'Desconectado'
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {message && (
        <div className={`border rounded-lg p-4 flex items-center gap-2 ${
          message.type === 'success' 
            ? 'bg-green-50 border-green-200 text-green-700' 
            : 'bg-red-50 border-red-200 text-red-700'
        }`}>
          <span>{message.text}</span>
        </div>
      )}

      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Conexão WhatsApp</h1>
        <p className="text-slate-500">Gerencie a conexão do seu WhatsApp.</p>
      </div>

      {/* Card de Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="w-5 h-5" />
            Status da Conexão
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isPending ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="w-6 h-6 animate-spin text-green-500" />
              <span className="ml-2">Iniciando...</span>
            </div>
          ) : isConnected ? (
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle className="w-10 h-10 text-green-600" />
                <div>
                  <h3 className="text-lg font-semibold text-green-800">WhatsApp Conectado</h3>
                  <p className="text-green-700">{getStatusLabel()}</p>
                </div>
              </div>
              <Button variant="outline" onClick={handleDisconnect} className="w-full">
                <Unlink className="w-4 h-4 mr-2" />
                Desconectar
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <XCircle className="w-10 h-10 text-red-600" />
                <div>
                  <h3 className="text-lg font-semibold text-red-800">WhatsApp Desconectado</h3>
                  <p className="text-red-700 text-sm">Conecte para enviar mensagens</p>
                </div>
              </div>
              <Button onClick={handleConnect} className="w-full bg-green-500 hover:bg-green-600">
                <Link2 className="w-4 h-4 mr-2" />
                Conectar WhatsApp
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Card de Teste */}
      {isConnected && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="w-5 h-5" />
              Enviar Mensagem de Teste
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSendTest} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Telefone</label>
                <Input
                  placeholder="11999999999"
                  value={testPhone}
                  onChange={(e) => setTestPhone(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Mensagem</label>
                <Input
                  placeholder="Mensagem de teste"
                  value={testMessage}
                  onChange={(e) => setTestMessage(e.target.value)}
                  className="mt-1"
                />
              </div>
              <Button 
                type="submit" 
                disabled={!testPhone || isSendingTest}
                className="w-full bg-green-500 hover:bg-green-600"
              >
                {isSendingTest ? 'Enviando...' : 'Enviar'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <WAHAQRModal />
    </div>
  )
}
