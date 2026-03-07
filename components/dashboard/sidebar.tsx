'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Send,
  Clock,
  Repeat,
  CheckCircle,
  History,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Settings,
  Smartphone,
  FileText,
  Home,
} from 'lucide-react'

interface SidebarProps {
  user?: {
    name?: string | null
    email?: string | null
  }
  onLogout?: () => void
}

const navItems = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: Home,
  },
  {
    title: 'Enviar',
    href: '/dashboard/enviar',
    icon: Send,
  },
  {
    title: 'Agendamentos',
    href: '/dashboard/agendamentos',
    icon: Clock,
  },
  {
    title: 'Recorrentes',
    href: '/dashboard/recorrentes',
    icon: Repeat,
  },
  {
    title: 'Confirmações',
    href: '/dashboard/confirmacoes',
    icon: CheckCircle,
  },
  {
    title: 'Histórico',
    href: '/dashboard/historico',
    icon: History,
  },
  {
    title: 'Modelos',
    href: '/dashboard/modelos',
    icon: FileText,
  },
  {
    title: 'Conexão',
    href: '/dashboard/conexao',
    icon: Smartphone,
  },
]

export function Sidebar({ user, onLogout }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const pathname = usePathname()

  const isActive = (href: string) => pathname === href

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 md:hidden"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        {isMobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Overlay for mobile */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex flex-col bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 transition-all duration-300',
          isCollapsed ? 'w-20' : 'w-64',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
          <div className={cn('flex items-center gap-3', isCollapsed && 'justify-center w-full')}>
            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center shrink-0">
              <Send className="w-5 h-5 text-white" />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col min-w-0">
                <span className="font-medium text-slate-900 dark:text-slate-100 truncate">
                  {user?.name || 'Usuário'}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  WhatsApp
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 flex flex-col gap-1 p-3 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.href)

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors',
                  active
                    ? 'bg-green-500/10 text-green-600 dark:text-green-400'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700',
                  isCollapsed && 'justify-center px-2'
                )}
                title={isCollapsed ? item.title : undefined}
              >
                <Icon className={cn('w-5 h-5 shrink-0', active && 'text-green-500')} />
                {!isCollapsed && (
                  <span className={cn('text-sm font-medium', active && 'text-green-600 dark:text-green-400')}>
                    {item.title}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-700 space-y-1">
          <Link
            href="/dashboard/configuracoes"
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors',
              isCollapsed && 'justify-center px-2'
            )}
            title={isCollapsed ? 'Configurações' : undefined}
          >
            <Settings className="w-5 h-5 shrink-0" />
            {!isCollapsed && <span className="text-sm font-medium">Configurações</span>}
          </Link>

          <button
            onClick={onLogout}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors w-full',
              isCollapsed && 'justify-center px-2'
            )}
            title={isCollapsed ? 'Sair' : undefined}
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {!isCollapsed && <span className="text-sm font-medium">Sair</span>}
          </button>

          {/* Collapse Toggle */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors w-full',
              isCollapsed && 'justify-center px-2'
            )}
            title={isCollapsed ? 'Expandir' : 'Recolher'}
          >
            {isCollapsed ? (
              <ChevronRight className="w-5 h-5" />
            ) : (
              <>
                <ChevronLeft className="w-5 h-5" />
                <span className="text-sm">Recolher</span>
              </>
            )}
          </button>
        </div>
      </aside>
    </>
  )
}
