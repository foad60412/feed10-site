import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../lib/supabase';

export async function GET() {
  const { data: campaign, error } = await supabaseAdmin
    .from('campaigns')
    .select('*')
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error || !campaign) return NextResponse.json({ error: 'No active campaign' }, { status: 404 });

  const { data: sums } = await supabaseAdmin
    .from('donations')
    .select('amount_usd')
    .eq('campaign_id', campaign.id)
    .eq('status', 'completed');

  const raised = (sums || []).reduce((n, d) => n + Number(d.amount_usd || 0), 0);
  return NextResponse.json({ campaign, raised });
}
