'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  CreditCard, 
  Link as LinkIcon, 
  TrendingUp,
  Activity,
  DollarSign,
  Eye,
  MousePointerClick
} from 'lucide-react'

interface DashboardTabProps {
  totalCards: number
  totalLinks: number
  totalClicks: number
}

export default function DashboardTab({ totalCards, totalLinks, totalClicks }: DashboardTabProps) {
  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total de Cliques */}
        <Card className="border-l-4 border-l-blue-500 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total de Cliques
            </CardTitle>
            <MousePointerClick className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{totalClicks}</div>
            <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
              <Eye className="h-3 w-3" />
              Visualizações totais
            </p>
          </CardContent>
        </Card>

        {/* Cartões Capturados */}
        <Card className="border-l-4 border-l-purple-500 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Cartões Capturados
            </CardTitle>
            <CreditCard className="h-5 w-5 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">{totalCards}</div>
            <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              Total registrado
            </p>
          </CardContent>
        </Card>

        {/* Links Ativos */}
        <Card className="border-l-4 border-l-orange-500 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Links Ativos
            </CardTitle>
            <LinkIcon className="h-5 w-5 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">{totalLinks}</div>
            <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
              <Activity className="h-3 w-3" />
              Disponíveis
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-500" />
              Atividade Recente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-3 bg-blue-50 rounded-lg">
                <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
                  <MousePointerClick className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">Cliques nos Links</p>
                  <p className="text-xs text-gray-500">{totalClicks} cliques registrados</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-3 bg-purple-50 rounded-lg">
                <div className="h-10 w-10 rounded-full bg-purple-500 flex items-center justify-center">
                  <CreditCard className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">Cartões Capturados</p>
                  <p className="text-xs text-gray-500">{totalCards} cartões no sistema</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-3 bg-orange-50 rounded-lg">
                <div className="h-10 w-10 rounded-full bg-orange-500 flex items-center justify-center">
                  <LinkIcon className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">Links Ativos</p>
                  <p className="text-xs text-gray-500">{totalLinks} links disponíveis</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              Estatísticas Gerais
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Taxa de Conversão</span>
                  <span className="font-bold text-green-600">
                    {totalClicks > 0 ? ((totalCards / totalClicks) * 100).toFixed(1) : 0}%
                  </span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-green-500 to-emerald-600 transition-all duration-500"
                    style={{ width: `${totalClicks > 0 ? Math.min((totalCards / totalClicks) * 100, 100) : 0}%` }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Links Ativos</span>
                  <span className="font-bold text-blue-600">{totalLinks}</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-cyan-600 transition-all duration-500"
                    style={{ width: `${Math.min((totalLinks / 10) * 100, 100)}%` }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Cartões Capturados</span>
                  <span className="font-bold text-purple-600">{totalCards}</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-600 transition-all duration-500"
                    style={{ width: `${Math.min((totalCards / 20) * 100, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-orange-500" />
            Ações Rápidas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all">
              <LinkIcon className="h-6 w-6 mb-2" />
              <p className="font-medium">Criar Novo Link</p>
            </button>
            <button className="p-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all">
              <CreditCard className="h-6 w-6 mb-2" />
              <p className="font-medium">Ver Cartões</p>
            </button>
            <button className="p-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:shadow-lg transition-all">
              <Activity className="h-6 w-6 mb-2" />
              <p className="font-medium">Relatórios</p>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
