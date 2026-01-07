import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { linkId } = await request.json()
    
    // Obter IP do usuário
    const forwarded = request.headers.get('x-forwarded-for')
    const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'unknown'
    
    // Obter user agent
    const userAgent = request.headers.get('user-agent') || 'unknown'
    
    // Verificar se já existe uma sessão ativa para este IP
    const { data: existingSession } = await supabase
      .from('user_sessions')
      .select('id')
      .eq('user_ip', ip)
      .eq('link_id', linkId)
      .single()
    
    if (existingSession) {
      // Atualizar última atividade
      await supabase
        .from('user_sessions')
        .update({ 
          last_activity: new Date().toISOString(),
          user_agent: userAgent
        })
        .eq('id', existingSession.id)
    } else {
      // Criar nova sessão
      await supabase
        .from('user_sessions')
        .insert({
          link_id: linkId,
          user_ip: ip,
          user_agent: userAgent,
          last_activity: new Date().toISOString()
        })
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.warn('Erro ao rastrear sessão:', error)
    return NextResponse.json({ success: false }, { status: 500 })
  }
}
