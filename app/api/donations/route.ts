import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../lib/supabase';

export async function GET() {
  const { data: campaign } = await supabaseAdmin
    .from('campaigns').select('id').eq('status','active').order('created_at',{ascending:false}).limit(1).single();
  if (!campaign) return NextResponse.json([]);

  const { data, error } = await supabaseAdmin
    .from('donations')
    .select('id, donor_name, show_name, amount_usd, currency, created_at')
    .eq('campaign_id', campaign.id)
    .eq('status', 'completed')
    .order('created_at', { ascending: false })
    .limit(10);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data || []);
}
