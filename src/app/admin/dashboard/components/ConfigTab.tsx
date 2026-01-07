'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Save, Upload } from 'lucide-react'
import { toast } from 'sonner'

export default function ConfigTab() {
  const [config, setConfig] = useState({
    primary_color: '#FF6B35',
    secondary_color: '#004E89',
    logo_url: '',
    whatsapp_number: '5511999999999'
  })
  const [loading, setLoading] = useState(false)
  const [logoFile, setLogoFile] = useState<File | null>(null)

  useEffect(() => {
    fetchConfig()
  }, [])

  const fetchConfig = async () => {
    try {
      const response = await fetch('/api/admin/config')
      const data = await response.json()
      if (data) {
        setConfig(data)
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error)
    }
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      let logoUrl = config.logo_url

      // Upload da logo se houver arquivo
      if (logoFile) {
        const formData = new FormData()
        formData.append('file', logoFile)
        
        const uploadResponse = await fetch('/api/admin/upload-logo', {
          method: 'POST',
          body: formData
        })
        
        const uploadData = await uploadResponse.json()
        if (uploadData.url) {
          logoUrl = uploadData.url
        }
      }

      const response = await fetch('/api/admin/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...config, logo_url: logoUrl })
      })

      if (response.ok) {
        toast.success('Configurações salvas com sucesso!')
        fetchConfig()
      } else {
        toast.error('Erro ao salvar configurações')
      }
    } catch (error) {
      toast.error('Erro ao salvar configurações')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="shadow-xl">
      <CardHeader>
        <CardTitle>Configurações do Site</CardTitle>
        <CardDescription>
          Personalize as cores, logo e informações de contato
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="primary_color">Cor Primária</Label>
            <div className="flex gap-2">
              <Input
                id="primary_color"
                type="color"
                value={config.primary_color}
                onChange={(e) => setConfig({ ...config, primary_color: e.target.value })}
                className="w-20 h-10"
              />
              <Input
                type="text"
                value={config.primary_color}
                onChange={(e) => setConfig({ ...config, primary_color: e.target.value })}
                placeholder="#FF6B35"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="secondary_color">Cor Secundária</Label>
            <div className="flex gap-2">
              <Input
                id="secondary_color"
                type="color"
                value={config.secondary_color}
                onChange={(e) => setConfig({ ...config, secondary_color: e.target.value })}
                className="w-20 h-10"
              />
              <Input
                type="text"
                value={config.secondary_color}
                onChange={(e) => setConfig({ ...config, secondary_color: e.target.value })}
                placeholder="#004E89"
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="logo">Logo do Site</Label>
          <div className="flex gap-2">
            <Input
              id="logo"
              type="file"
              accept="image/*"
              onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
            />
            <Button variant="outline" className="gap-2">
              <Upload className="h-4 w-4" />
              Upload
            </Button>
          </div>
          {config.logo_url && (
            <div className="mt-2">
              <img src={config.logo_url} alt="Logo atual" className="h-16 object-contain" />
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="whatsapp">Número do WhatsApp</Label>
          <Input
            id="whatsapp"
            type="text"
            value={config.whatsapp_number}
            onChange={(e) => setConfig({ ...config, whatsapp_number: e.target.value })}
            placeholder="5511999999999"
          />
          <p className="text-sm text-gray-500">
            Formato: código do país + DDD + número (ex: 5511999999999)
          </p>
        </div>

        <div className="flex gap-4 p-4 rounded-lg border-2 border-dashed">
          <div className="flex-1 space-y-2">
            <p className="text-sm font-medium">Preview das Cores</p>
            <div className="flex gap-2">
              <div
                className="w-20 h-20 rounded-lg shadow-md"
                style={{ backgroundColor: config.primary_color }}
              />
              <div
                className="w-20 h-20 rounded-lg shadow-md"
                style={{ backgroundColor: config.secondary_color }}
              />
            </div>
          </div>
        </div>

        <Button
          onClick={handleSave}
          disabled={loading}
          className="w-full bg-gradient-to-r from-orange-500 to-blue-600 hover:from-orange-600 hover:to-blue-700 gap-2"
        >
          <Save className="h-4 w-4" />
          {loading ? 'Salvando...' : 'Salvar Configurações'}
        </Button>
      </CardContent>
    </Card>
  )
}
