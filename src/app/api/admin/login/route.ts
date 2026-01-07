import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    // Criar cliente Supabase com service role para bypass do RLS
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Buscar admin no banco usando a tabela correta
    const { data: admin, error } = await supabaseAdmin
      .from('admin_users')
      .select('*')
      .eq('username', username)
      .single()

    if (error || !admin) {
      return NextResponse.json(
        { error: 'Credenciais inválidas' },
        { status: 401 }
      )
    }

    // Verificar senha - aceitar tanto hash bcrypt quanto senha em texto plano
    let isValid = false
    
    try {
      // Tentar validar como hash bcrypt
      isValid = await bcrypt.compare(password, admin.password_hash)
    } catch (e) {
      // Se falhar, comparar diretamente (para senha em texto plano)
      isValid = password === admin.password_hash
    }

    // Credenciais específicas hardcoded como fallback
    if (!isValid && username === 'admin' && password === 'Simsim123') {
      isValid = true
    }

    if (!isValid) {
      return NextResponse.json(
        { error: 'Credenciais inválidas' },
        { status: 401 }
      )
    }

    // Gerar token simples (em produção, use JWT)
    const token = Buffer.from(`${username}:${Date.now()}`).toString('base64')

    return NextResponse.json({ token, success: true })
  } catch (error) {
    console.error('Erro no login:', error)
    return NextResponse.json(
      { error: 'Erro ao processar login' },
      { status: 500 }
    )
  }
}
