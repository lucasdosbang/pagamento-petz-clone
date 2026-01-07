import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

function generateLinkId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('payment_links')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Erro ao buscar links:', error)
      return NextResponse.json([])
    }

    return NextResponse.json(Array.isArray(data) ? data : [])
  } catch (error) {
    console.error('Erro ao buscar links (catch):', error)
    return NextResponse.json([])
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { amount, products, pix_code, pix_qr_code } = body

    const linkId = generateLinkId()

    const { data, error } = await supabase
      .from('payment_links')
      .insert({
        link_id: linkId,
        amount,
        products,
        pix_code,
        pix_qr_code,
        status: 'active',
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('Erro ao criar link:', error)
      return NextResponse.json(
        { error: 'Erro ao criar link' },
        { status: 500 }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Erro ao criar link (catch):', error)
    return NextResponse.json(
      { error: 'Erro ao criar link' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    console.log('🗑️ Tentando deletar link com ID:', id)

    if (!id) {
      console.error('❌ ID não fornecido')
      return NextResponse.json(
        { error: 'ID não fornecido' },
        { status: 400 }
      )
    }

    // Primeiro, verificar se o registro existe
    const { data: existingLink, error: fetchError } = await supabase
      .from('payment_links')
      .select('*')
      .eq('id', id)
      .single()

    console.log('🔍 Link encontrado:', existingLink)
    console.log('🔍 Erro ao buscar:', fetchError)

    if (fetchError && fetchError.code !== 'PGRST116') {
      // PGRST116 = not found
      console.error('❌ Erro ao buscar link:', fetchError)
      return NextResponse.json(
        { error: `Erro ao buscar link: ${fetchError.message}` },
        { status: 500 }
      )
    }

    if (!existingLink) {
      console.error('❌ Link não encontrado')
      return NextResponse.json(
        { error: 'Link não encontrado' },
        { status: 404 }
      )
    }

    // IMPORTANTE: Deletar APENAS o link, SEM tocar nos cartões
    // Os cartões têm link_id como referência, mas NÃO devem ser deletados
    // quando o link for removido. Eles são dados independentes e valiosos.
    const { error: deleteError } = await supabase
      .from('payment_links')
      .delete()
      .eq('id', id)

    if (deleteError) {
      console.error('❌ Erro ao deletar link:', deleteError)
      return NextResponse.json(
        { error: `Erro ao deletar link: ${deleteError.message}` },
        { status: 500 }
      )
    }

    console.log('✅ Link deletado com sucesso! Cartões foram preservados.')
    return NextResponse.json({ 
      success: true, 
      message: 'Link deletado com sucesso. Os cartões capturados foram mantidos.' 
    })
  } catch (error) {
    console.error('❌ Erro ao deletar link (catch):', error)
    return NextResponse.json(
      { error: `Erro ao deletar link: ${error}` },
      { status: 500 }
    )
  }
}
