import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const bin = searchParams.get('bin')

    if (!bin || bin.length !== 6) {
      return NextResponse.json(
        { error: 'BIN inválido. Deve conter 6 dígitos.' },
        { status: 400 }
      )
    }

    const apiKey = process.env.HANDYAPI_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: 'API Key não configurada' },
        { status: 500 }
      )
    }

    const response = await fetch(`https://data.handyapi.com/bin/${bin}`, {
      headers: {
        'x-api-key': apiKey
      }
    })

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Erro ao buscar informações da BIN' },
        { status: response.status }
      )
    }

    const data = await response.json()
    
    return NextResponse.json({
      bin: bin,
      brand: data.Scheme || null,
      type: data.Type || null,
      level: data.CardTier || null,
      bank: data.Issuer || null,
      country: data.Country?.A2 || null,
      countryName: data.Country?.Name || null
    })
  } catch (error) {
    console.error('Erro ao buscar informações da BIN:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
