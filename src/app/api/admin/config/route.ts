import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('site_config')
      .select('*')
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Erro ao buscar configurações' },
        { status: 500 }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Erro ao buscar config:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar configurações' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { primary_color, secondary_color, logo_url, whatsapp_number } = body

    // Atualizar ou inserir configuração
    const { data, error } = await supabase
      .from('site_config')
      .upsert({
        id: '00000000-0000-0000-0000-000000000001', // ID fixo para config única
        primary_color,
        secondary_color,
        logo_url,
        whatsapp_number,
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('Erro ao salvar config:', error)
      return NextResponse.json(
        { error: 'Erro ao salvar configurações' },
        { status: 500 }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Erro ao salvar config:', error)
    return NextResponse.json(
      { error: 'Erro ao salvar configurações' },
      { status: 500 }
    )
  }
}
