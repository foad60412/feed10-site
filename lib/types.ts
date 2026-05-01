export type Campaign = {
  id: string;
  title: string;
  slug: string;
  description: string;
  goal_usd: number;
  families_target: number;
  basket_min_usd: number;
  basket_max_usd: number;
  status: 'active' | 'closed';
  created_at: string;
};

export type Donation = {
  id: string;
  campaign_id: string;
  donor_name: string | null;
  show_name: boolean;
  amount_usd: number;
  currency: string;
  status: string;
  paypal_order_id: string | null;
  created_at: string;
};
