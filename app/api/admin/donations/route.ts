import { NextResponse } from 'next/server';
import { requireAdmin } from '../../../../lib/auth';
import { supabaseAdmin } from '../../../../lib/supabase';

export async function GET(req: Request) {
  try { requireAdmin(req); } catch (e) { return e as Response; }
  const { data, error } = await supabaseAdmin
    .from('donations')
    .select('*, campaigns(title)')
    .order('created_at', { ascending: false })
    .limit(100);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data || []);
}
