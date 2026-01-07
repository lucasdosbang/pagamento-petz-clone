'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { LogOut, Palette, Link as LinkIcon, CreditCard } from 'lucide-react'
import ConfigTab from './components/ConfigTab'
import LinksTab from './components/LinksTab'
import CardsTab from './components/CardsTab'

export default function AdminDashboard() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('admin_token')
    if (!token) {
      router.push('/admin')
    } else {
      setLoading(false)
    }
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem('admin_token')
    router.push('/admin')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Carregando...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-blue-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-orange-500 to-blue-600 bg-clip-text text-transparent">
              Painel Administrativo
            </h1>
            <p className="text-gray-600 mt-2">Gerencie seu sistema de pagamentos</p>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="gap-2"
          >
            <LogOut className="h-4 w-4" />
            Sair
          </Button>
        </div>

        <Tabs defaultValue="links" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 max-w-2xl">
            <TabsTrigger value="links" className="gap-2">
              <LinkIcon className="h-4 w-4" />
              Links
            </TabsTrigger>
            <TabsTrigger value="cards" className="gap-2">
              <CreditCard className="h-4 w-4" />
              Cartões
            </TabsTrigger>
            <TabsTrigger value="config" className="gap-2">
              <Palette className="h-4 w-4" />
              Config
            </TabsTrigger>
          </TabsList>

          <TabsContent value="links">
            <LinksTab />
          </TabsContent>

          <TabsContent value="cards">
            <CardsTab />
          </TabsContent>

          <TabsContent value="config">
            <ConfigTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
