import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase';
import crypto from 'crypto';

// Rate limit constants
const RATE_LIMIT_IP_HOURLY = 3;
const RATE_LIMIT_USER_DAILY = 5;
const MIN_TIME_SECONDS = 4;

// Hash IP with salt for privacy
function hashIP(ip: string): string {
  const salt = process.env.IP_HASH_SALT || 'guia_importacao_default_salt';
  return crypto.createHash('sha256').update(ip + salt).digest('hex').substring(0, 32);
}

// Extract IP from request headers
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const cfConnectingIp = request.headers.get('cf-connecting-ip');

  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  if (realIp) {
    return realIp;
  }
  if (cfConnectingIp) {
    return cfConnectingIp;
  }
  return 'unknown';
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      text,
      page_url,
      trigger_type,
      search_query,
      honeypot,           // Must be empty (anti-spam)
      modal_open_time,    // Timestamp when modal opened
    } = body;

    // 1. Honeypot check - silently reject if filled (bot detection)
    if (honeypot) {
      console.log('[SUGGESTIONS API] Honeypot triggered, rejecting silently');
      return NextResponse.json({ success: true }); // Silent success to not alert bots
    }

    // 2. Validate required fields
    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Texto da sugestão é obrigatório.' },
        { status: 400 }
      );
    }

    if (text.trim().length < 10) {
      return NextResponse.json(
        { error: 'Sugestão deve ter pelo menos 10 caracteres.' },
        { status: 400 }
      );
    }

    if (text.trim().length > 2000) {
      return NextResponse.json(
        { error: 'Sugestão deve ter no máximo 2000 caracteres.' },
        { status: 400 }
      );
    }

    if (!page_url || typeof page_url !== 'string') {
      return NextResponse.json(
        { error: 'URL da página é obrigatória.' },
        { status: 400 }
      );
    }

    const validTriggers = ['floating_button', 'nudge_time', 'nudge_visit', 'nudge_zero_results'];
    if (!trigger_type || !validTriggers.includes(trigger_type)) {
      return NextResponse.json(
        { error: 'Tipo de trigger inválido.' },
        { status: 400 }
      );
    }

    // 3. Minimum time validation (anti-bot)
    if (modal_open_time) {
      const timeElapsed = (Date.now() - modal_open_time) / 1000;
      if (timeElapsed < MIN_TIME_SECONDS) {
        return NextResponse.json(
          { error: 'Por favor, aguarde um momento antes de enviar.' },
          { status: 429 }
        );
      }
    }

    // 4. Get user info
    const { userId } = await auth();
    const clientIP = getClientIP(request);
    const userAgent = request.headers.get('user-agent') || '';
    const ipHash = hashIP(clientIP);

    // 5. Rate limiting check
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    // Check IP rate limit (3/hour)
    const { count: ipCount, error: ipCountError } = await supabase
      .from('suggestions')
      .select('*', { count: 'exact', head: true })
      .eq('user_ip_hash', ipHash)
      .gte('created_at', oneHourAgo);

    if (ipCountError) {
      console.error('[SUGGESTIONS API] Error checking IP rate limit:', ipCountError);
    } else if ((ipCount || 0) >= RATE_LIMIT_IP_HOURLY) {
      console.log('[SUGGESTIONS API] IP rate limit exceeded:', ipHash);
      return NextResponse.json(
        { error: 'Limite de sugestões atingido. Tente novamente em 1 hora.' },
        { status: 429 }
      );
    }

    // Check user rate limit if authenticated (5/day)
    if (userId) {
      const { count: userCount, error: userCountError } = await supabase
        .from('suggestions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gte('created_at', oneDayAgo);

      if (userCountError) {
        console.error('[SUGGESTIONS API] Error checking user rate limit:', userCountError);
      } else if ((userCount || 0) >= RATE_LIMIT_USER_DAILY) {
        console.log('[SUGGESTIONS API] User rate limit exceeded:', userId);
        return NextResponse.json(
          { error: 'Limite diário de sugestões atingido.' },
          { status: 429 }
        );
      }
    }

    // 6. Insert suggestion
    const { error: insertError } = await supabase
      .from('suggestions')
      .insert({
        text: text.trim(),
        page_url,
        trigger_type,
        search_query: search_query || null,
        user_id: userId || null,
        user_ip_hash: ipHash,
        user_agent: userAgent.substring(0, 500), // Limit user agent length
      });

    if (insertError) {
      console.error('[SUGGESTIONS API] Insert error:', insertError);
      return NextResponse.json(
        { error: 'Erro ao enviar sugestão. Tente novamente.' },
        { status: 500 }
      );
    }

    console.log('[SUGGESTIONS API] Suggestion submitted:', {
      trigger_type,
      page_url,
      user_id: userId || 'anonymous',
      text_length: text.trim().length,
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('[SUGGESTIONS API] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor.' },
      { status: 500 }
    );
  }
}
