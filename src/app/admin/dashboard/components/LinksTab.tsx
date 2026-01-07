'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Plus, Copy, Trash2, ExternalLink, DollarSign, Package, Calendar, Link as LinkIcon } from 'lucide-react'
import { toast } from 'sonner'

interface PaymentLink {
  id: string
  link_id: string
  amount: number
  products: string[]
  pix_qr_code: string | null
  pix_code: string | null
  status: string
  created_at: string
}

export default function LinksTab() {
  const [links, setLinks] = useState<PaymentLink[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    amount: '',
    products: '',
    pix_code: '',
    pix_qr_code: null as File | null
  })

  useEffect(() => {
    fetchLinks()
  }, [])

  const fetchLinks = async () => {
    try {
      const response = await fetch('/api/admin/links', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store'
      })
      
      if (!response.ok) {
        console.error('Erro na resposta:', response.status, response.statusText)
        setLinks([])
        return
      }
      
      const data = await response.json()
      console.log('📋 Links carregados:', data)
      setLinks(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Erro ao carregar links:', error)
      setLinks([])
      toast.error('Erro ao carregar links. Verifique sua conexão.')
    }
  }

  const handleCreate = async () => {
    if (!formData.amount || !formData.products) {
      toast.error('Preencha todos os campos obrigatórios')
      return
    }

    setLoading(true)
    try {
      let qrCodeUrl = null

      // Upload do QR Code se houver
      if (formData.pix_qr_code) {
        const uploadFormData = new FormData()
        uploadFormData.append('file', formData.pix_qr_code)
        
        const uploadResponse = await fetch('/api/admin/upload-qr', {
          method: 'POST',
          body: uploadFormData
        })
        
        const uploadData = await uploadResponse.json()
        if (uploadData.url) {
          qrCodeUrl = uploadData.url
        }
      }

      const response = await fetch('/api/admin/links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseFloat(formData.amount),
          products: formData.products.split(',').map(p => p.trim()),
          pix_code: formData.pix_code,
          pix_qr_code: qrCodeUrl
        })
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Link criado com sucesso!')
        setIsOpen(false)
        setFormData({ amount: '', products: '', pix_code: '', pix_qr_code: null })
        fetchLinks()
      } else {
        toast.error(data.error || 'Erro ao criar link')
      }
    } catch (error) {
      console.error('Erro ao criar link:', error)
      toast.error('Erro ao criar link')
    } finally {
      setLoading(false)
    }
  }

  const handleCopyLink = async (linkId: string) => {
    const url = `${window.location.origin}/checkout/${linkId}`
    try {
      await navigator.clipboard.writeText(url)
      toast.success('Link copiado!')
    } catch (error) {
      // Fallback para navegadores que bloqueiam clipboard API
      const textArea = document.createElement('textarea')
      textArea.value = url
      textArea.style.position = 'fixed'
      textArea.style.left = '-999999px'
      document.body.appendChild(textArea)
      textArea.select()
      try {
        document.execCommand('copy')
        toast.success('Link copiado!')
      } catch (err) {
        toast.error('Não foi possível copiar o link')
      }
      document.body.removeChild(textArea)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja realmente excluir este link? Os cartões capturados serão mantidos.')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/links?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Link excluído com sucesso! Os cartões foram mantidos.')
        setLinks(prevLinks => prevLinks.filter(link => link.id !== id))
      } else {
        toast.error(data.error || 'Erro ao excluir link')
      }
    } catch (error) {
      console.error('Erro ao excluir link:', error)
      toast.error('Erro ao excluir link')
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="space-y-6">
      {/* Header com botão de criar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Links de Pagamento</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Crie e gerencie links únicos para seus clientes
          </p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 gap-2">
              <Plus className="h-4 w-4" />
              Novo Link
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">Criar Novo Link de Pagamento</DialogTitle>
              <DialogDescription>
                Preencha os dados para gerar um link único de pagamento
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-5 py-4">
              <div className="space-y-2">
                <Label htmlFor="amount" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Valor (R$) *
                </Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  placeholder="100.00"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="products" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Produtos (separados por vírgula) *
                </Label>
                <Input
                  id="products"
                  type="text"
                  placeholder="Produto 1, Produto 2, Produto 3"
                  value={formData.products}
                  onChange={(e) => setFormData({ ...formData, products: e.target.value })}
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pix_code" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Código PIX (Copia e Cola)
                </Label>
                <Input
                  id="pix_code"
                  type="text"
                  placeholder="00020126580014br.gov.bcb.pix..."
                  value={formData.pix_code}
                  onChange={(e) => setFormData({ ...formData, pix_code: e.target.value })}
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="qr_code" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  QR Code PIX (Imagem)
                </Label>
                <Input
                  id="qr_code"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFormData({ ...formData, pix_qr_code: e.target.files?.[0] || null })}
                  className="h-11"
                />
              </div>

              <Button
                onClick={handleCreate}
                disabled={loading}
                className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
              >
                {loading ? 'Criando...' : 'Criar Link de Pagamento'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Lista de links */}
      <div className="grid gap-4">
        {links.length === 0 ? (
          <Card className="border-2 border-dashed border-gray-300 dark:border-gray-700">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="rounded-full bg-gray-100 dark:bg-gray-800 p-4 mb-4">
                <LinkIcon className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Nenhum link criado ainda
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 text-center max-w-md">
                Clique em "Novo Link" para criar seu primeiro link de pagamento
              </p>
            </CardContent>
          </Card>
        ) : (
          links.map((link) => (
            <Card key={link.id} className="border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow duration-200">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                  {/* Informações principais */}
                  <div className="flex-1 space-y-4">
                    {/* Valor */}
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 p-2.5">
                        <DollarSign className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                          Valor
                        </p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                          R$ {link.amount.toFixed(2)}
                        </p>
                      </div>
                    </div>

                    {/* Produtos */}
                    <div className="flex items-start gap-3">
                      <div className="rounded-lg bg-green-50 dark:bg-green-900/20 p-2.5">
                        <Package className="h-5 w-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1">
                          Produtos
                        </p>
                        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                          {link.products.join(', ')}
                        </p>
                      </div>
                    </div>

                    {/* Data e ID */}
                    <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-gray-100 dark:border-gray-800">
                      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>{formatDate(link.created_at)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                        <LinkIcon className="h-3.5 w-3.5" />
                        <span className="font-mono">{link.link_id}</span>
                      </div>
                    </div>
                  </div>

                  {/* Ações */}
                  <div className="flex lg:flex-col gap-2 lg:min-w-[140px]">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        handleCopyLink(link.link_id)
                      }}
                      className="flex-1 lg:w-full gap-2 border-blue-200 text-blue-700 hover:bg-blue-50 hover:text-blue-800 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-900/20"
                    >
                      <Copy className="h-4 w-4" />
                      Copiar Link
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        window.open(`/checkout/${link.link_id}`, '_blank')
                      }}
                      className="flex-1 lg:w-full gap-2 border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-gray-900 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Visualizar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        handleDelete(link.id)
                      }}
                      className="flex-1 lg:w-full gap-2 border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
                    >
                      <Trash2 className="h-4 w-4" />
                      Excluir
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
