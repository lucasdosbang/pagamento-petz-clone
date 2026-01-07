'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { 
  LayoutDashboard, 
  Link as LinkIcon, 
  CreditCard, 
  Settings, 
  LogOut,
  Menu,
  X,
  Users,
  Activity
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface SidebarProps {
  activeTab: string
  onTabChange: (tab: string) => void
  onLogout: () => void
  onlineUsers: number
  totalClicks: number
}

export default function Sidebar({ activeTab, onTabChange, onLogout, onlineUsers, totalClicks }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'links', label: 'Links', icon: LinkIcon },
    { id: 'cards', label: 'Cartões', icon: CreditCard },
    { id: 'config', label: 'Configurações', icon: Settings },
  ]

  return (
    <>
      {/* Mobile Toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 lg:hidden"
        onClick={() => setCollapsed(!collapsed)}
      >
        {collapsed ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </Button>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white transition-all duration-300 z-40 flex flex-col",
          collapsed ? "w-64" : "w-0 lg:w-64",
          "lg:w-64"
        )}
      >
        <div className={cn(
          "flex-1 overflow-hidden",
          collapsed ? "block" : "hidden lg:block"
        )}>
          {/* Logo */}
          <div className="p-6 border-b border-slate-700">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Admin Panel
            </h1>
            <p className="text-xs text-slate-400 mt-1">Sistema de Gestão</p>
          </div>

          {/* Stats Cards */}
          <div className="p-4 space-y-3">
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg p-4 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-green-100">Usuários Online</p>
                  <p className="text-2xl font-bold">{onlineUsers}</p>
                </div>
                <Users className="h-8 w-8 text-green-100 opacity-80" />
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-500 to-cyan-600 rounded-lg p-4 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-blue-100">Total de Cliques</p>
                  <p className="text-2xl font-bold">{totalClicks}</p>
                </div>
                <Activity className="h-8 w-8 text-blue-100 opacity-80" />
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <nav className="p-4 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon
              const isActive = activeTab === item.id
              
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
                    isActive
                      ? "bg-gradient-to-r from-blue-500 to-purple-500 shadow-lg"
                      : "hover:bg-slate-700/50"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              )
            })}
          </nav>
        </div>

        {/* Logout Button */}
        <div className={cn(
          "p-4 border-t border-slate-700",
          collapsed ? "block" : "hidden lg:block"
        )}>
          <Button
            onClick={onLogout}
            variant="ghost"
            className="w-full justify-start gap-3 text-red-400 hover:text-red-300 hover:bg-red-500/10"
          >
            <LogOut className="h-5 w-5" />
            <span>Sair</span>
          </Button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {collapsed && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setCollapsed(false)}
        />
      )}
    </>
  )
}
