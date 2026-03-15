'use client'

import { useContacts, useMessages, useScheduledMessages, useConfirmations, useWhatsApp } from '@/hooks'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'
import { useEffect, useState } from 'react'
import { 
  Users, 
  MessageCircle, 
  Send, 
  Calendar, 
  CheckCircle, 
  XCircle,
  Smartphone,
  ArrowRight
} from 'lucide-react'
import Link from 'next/link'

export default function DashboardPage() {
  const { contacts, isLoading: contactsLoading } = useContacts()
  const { messages } = useMessages()
  const { totalScheduled, totalRecurring } = useScheduledMessages()
  const { confirmations } = useConfirmations()
  const { status: whatsappStatus, isConnected: whatsappConnected, loading: waLoading, refetch } = useWhatsApp()
  const [userName, setUserName] = useState<string>('')

  useEffect(() => {
    const getUserName = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user?.user_metadata?.name) {
        setUserName(user.user_metadata.name)
      } else if (user?.email) {
        setUserName(user.email.split('@')[0])
      }
    }
    getUserName()
  }, [])

  const sentMessages = messages.filter(m => m.status === 'sent' || m.status === 'SENT').length
  const pendingConfirmations = confirmations.filter(c => c.status === 'pending').length
  const confirmedConfirmations = confirmations.filter(c => c.status === 'confirmed').length

  const stats = [
    {
      title: 'Contatos',
      value: contacts.length,
      description: 'Total de contatos',
      icon: Users,
      color: 'blue',
      href: '/dashboard/enviar'
    },
    {
      title: 'Enviadas',
      value: sentMessages,
      description: 'Mensagens enviadas',
      icon: MessageCircle,
      color: 'green',
      href: '/dashboard/historico'
    },
    {
      title: 'Agendadas',
      value: totalScheduled,
      description: 'Mensagens agendadas',
      icon: Calendar,
      color: 'purple',
      href: '/dashboard/agendamentos'
    },
    {
      title: 'Recorrentes',
      value: totalRecurring,
      description: 'Mensagens recorrentes',
      icon: Send,
      color: 'orange',
      href: '/dashboard/recorrentes'
    },
    {
      title: 'Confirmações',
      value: confirmedConfirmations,
      description: 'Confirmações recebidas',
      icon: CheckCircle,
      color: 'yellow',
      href: '/dashboard/confirmacoes'
    }
  ]

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'blue':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-500'
      case 'green':
        return 'bg-green-100 dark:bg-green-900/30 text-green-500'
      case 'purple':
        return 'bg-purple-100 dark:bg-purple-900/30 text-purple-500'
      case 'yellow':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-500'
      case 'orange':
        return 'bg-orange-100 dark:bg-orange-900/30 text-orange-500'
      default:
        return 'bg-slate-100 dark:bg-slate-800 text-slate-500'
    }
  }

  if (contactsLoading || waLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
          <Send className="w-6 h-6 text-green-500" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Bem-vindo, {userName || 'usuário'}!
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            O que você gostaria de fazer hoje?
          </p>
        </div>
      </div>

      {/* Status WhatsApp */}
      <Card className={whatsappConnected ? 'border-green-200 dark:border-green-800' : 'border-red-200 dark:border-red-800'}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                whatsappConnected ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'
              }`}>
                {whatsappConnected ? (
                  <CheckCircle className="w-6 h-6 text-green-500" />
                ) : (
                  <XCircle className="w-6 h-6 text-red-500" />
                )}
              </div>
              <div>
                <p className="font-medium">
                  WhatsApp {whatsappConnected ? 'Conectado' : 'Desconectado'}
                </p>
                <p className="text-sm text-slate-500">
                  {whatsappConnected && whatsappStatus?.pushName 
                    ? whatsappStatus.pushName 
                    : whatsappConnected ? 'Pronto para usar' : 'Clique para conectar'}
                </p>
              </div>
            </div>
            <Link href="/dashboard/conexao">
              <Button variant={whatsappConnected ? "outline" : "default"} className={whatsappConnected ? "" : "bg-green-500 hover:bg-green-600"}>
                <Smartphone className="w-4 h-4 mr-2" />
                {whatsappConnected ? 'Gerenciar' : 'Conectar'}
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {stats.map((stat) => (
          <Link key={stat.title} href={stat.href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getColorClasses(stat.color)}`}>
                  <stat.icon className="w-4 h-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.description}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Ações Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Ações Rápidas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href="/dashboard/enviar" className="block">
              <Button variant="outline" className="w-full justify-between">
                <span className="flex items-center gap-2">
                  <Send className="w-4 h-4 text-green-500" />
                  Enviar Mensagem
                </span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/dashboard/agendamentos" className="block">
              <Button variant="outline" className="w-full justify-between">
                <span className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-500" />
                  Agendar Mensagem
                </span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/dashboard/modelos" className="block">
              <Button variant="outline" className="w-full justify-between">
                <span className="flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-purple-500" />
                  Gerenciar Modelos
                </span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Resumo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">Enviadas</span>
                <span className="font-medium">{sentMessages}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">Agendadas</span>
                <span className="font-medium">{totalScheduled}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">Confirmadas</span>
                <span className="font-medium">{pendingConfirmations}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
