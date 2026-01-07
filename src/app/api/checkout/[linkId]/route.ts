import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(
  request: NextRequest,
  { params }: { params: { linkId: string } }
) {
  try {
    const { linkId } = params

    if (!linkId) {
      return NextResponse.json(
        { error: 'Link ID não fornecido' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('payment_links')
      .select('*')
      .eq('link_id', linkId)
      .single()

    if (error || !data) {
      console.error('Erro ao buscar link:', error)
      return NextResponse.json(
        { error: 'Link não encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Erro ao buscar link:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar link' },
      { status: 500 }
    )
  }
}
