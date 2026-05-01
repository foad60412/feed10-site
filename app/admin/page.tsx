'use client';

import { useEffect, useState } from 'react';
import {
  Activity,
  BarChart3,
  Eye,
  Heart,
  LogOut,
  Plus,
  RefreshCw,
  ShieldCheck,
  Users,
  Wallet,
  XCircle,
  CheckCircle2
} from 'lucide-react';

type Campaign = {
  id: string;
  title: string;
  goal_usd: number;
  status: string;
  created_at: string;
};

type Donation = {
  id: string;
  donor_name: string | null;
  show_name: boolean;
  amount_usd: number;
  currency: string;
  status: string;
  created_at: string;
  campaigns?: { title: string };
};

export default function AdminPage() {
  const [checkingSession, setCheckingSession] = useState(true);
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [liveLoading, setLiveLoading] = useState(false);

  const [tab, setTab] = useState<'overview' | 'campaigns' | 'donations' | 'settings'>('overview');

  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [visits, setVisits] = useState(0);
  const [todayVisitors, setTodayVisitors] = useState(0);
  const [onlineNow, setOnlineNow] = useState(0);
  const [raised, setRaised] = useState(0);

  const [form, setForm] = useState({
    title: 'Feed 10 Families in Palestine',
    description: 'Help us provide essential food baskets to 10 families in need inside Palestine.',
    goal_usd: '500',
    families_target: '10',
    basket_min_usd: '30',
    basket_max_usd: '40'
  });

  async function load(pass = password) {
    if (!pass) return false;

    setLoading(true);

    try {
      const headers = { Authorization: `Bearer ${pass}` };

      const cRes = await fetch('/api/admin/campaigns', { headers });

      if (!cRes.ok) {
        localStorage.removeItem('adminPassword');
        setAuthed(false);
        return false;
      }

      const c = await cRes.json();

      const dRes = await fetch('/api/admin/donations', { headers });
      const d = await dRes.json();

      setCampaigns(c.campaigns || []);
      setVisits(c.visits || 0);
      setTodayVisitors(c.todayVisitors || 0);
      setOnlineNow(c.onlineNow || 0);
      setRaised(Number(c.totalRaised || 0));
      setDonations(Array.isArray(d) ? d : []);

      setAuthed(true);
      localStorage.setItem('adminPassword', pass);

      return true;
    } finally {
      setLoading(false);
      setCheckingSession(false);
    }
  }

  useEffect(() => {
    const saved = localStorage.getItem('adminPassword');

    if (saved) {
      setPassword(saved);
      load(saved);
    } else {
      setCheckingSession(false);
    }
  }, []);

  useEffect(() => {
    if (!authed) return;

    const fetchLiveData = async () => {
      try {
        const savedPassword = localStorage.getItem('adminPassword');
        if (!savedPassword) return;

        setLiveLoading(true);

        const headers = {
          Authorization: `Bearer ${savedPassword}`
        };

        const campaignsRes = await fetch('/api/admin/campaigns', { headers });

        if (campaignsRes.ok) {
          const campaignsData = await campaignsRes.json();
          setCampaigns(campaignsData.campaigns || []);
          setVisits(campaignsData.visits || 0);
          setTodayVisitors(campaignsData.todayVisitors || 0);
          setOnlineNow(campaignsData.onlineNow || 0);
          setRaised(Number(campaignsData.totalRaised || 0));
        }

        const donationsRes = await fetch('/api/admin/donations', { headers });

        if (donationsRes.ok) {
          const donationsData = await donationsRes.json();
          setDonations(Array.isArray(donationsData) ? donationsData : []);
        }
      } catch {
      } finally {
        setLiveLoading(false);
      }
    };

    fetchLiveData();

    const interval = setInterval(fetchLiveData, 5000);

    return () => clearInterval(interval);
  }, [authed]);

  async function login() {
    await load(password);
  }

  function logout() {
    localStorage.removeItem('adminPassword');
    setAuthed(false);
    setPassword('');
    setCampaigns([]);
    setDonations([]);
    setVisits(0);
    setTodayVisitors(0);
    setOnlineNow(0);
    setRaised(0);
  }

  async function createCampaign() {
    await fetch('/api/admin/campaigns', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${password}`
      },
      body: JSON.stringify({ action: 'create', ...form })
    });

    await load();
    setTab('campaigns');
  }

  async function closeCampaign(id: string) {
    if (!confirm('إغلاق هذه الحملة؟')) return;

    await fetch('/api/admin/campaigns', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${password}`
      },
      body: JSON.stringify({ action: 'close', id })
    });

    await load();
  }

  async function activateCampaign(id: string) {
    if (!confirm('تفعيل هذه الحملة وإغلاق الحملات الأخرى؟')) return;

    await fetch('/api/admin/campaigns', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${password}`
      },
      body: JSON.stringify({ action: 'activate', id })
    });

    await load();
  }

  async function resetVisits() {
    if (!confirm('إعادة ضبط الزيارات؟')) return;

    await fetch('/api/admin/campaigns', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${password}`
      },
      body: JSON.stringify({ action: 'resetVisits' })
    });

    await load();
  }

  if (checkingSession) {
    return (
      <main className="grid min-h-screen place-items-center bg-emerald-950 px-5 text-white">
        <div className="text-center">
          <div className="mx-auto mb-5 h-12 w-12 animate-spin rounded-full border-4 border-white/20 border-t-white" />
          <p className="text-lg font-black">Checking admin session...</p>
        </div>
      </main>
    );
  }

  if (!authed) {
    return (
      <main className="grid min-h-screen place-items-center bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-800 px-5">
        <div className="w-full max-w-md rounded-[2rem] bg-white p-7 shadow-2xl sm:p-8">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-emerald-100 text-emerald-800">
            <ShieldCheck className="h-8 w-8" />
          </div>

          <h1 className="mt-6 text-center text-3xl font-black text-slate-950">
            Admin Dashboard
          </h1>

          <p className="mt-2 text-center leading-7 text-slate-500">
            أدخل كلمة المرور للوصول إلى لوحة التحكم.
          </p>

          <input
            className="mt-6 w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center text-lg outline-none transition focus:border-emerald-700 focus:bg-white"
            type="password"
            placeholder="Admin password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') login();
            }}
          />

          <button
            onClick={login}
            disabled={loading || !password}
            className="mt-4 w-full rounded-2xl bg-emerald-800 px-5 py-4 font-black text-white shadow-lg transition hover:bg-emerald-900 disabled:opacity-50"
          >
            {loading ? 'Checking...' : 'Login'}
          </button>
        </div>
      </main>
    );
  }

  const activeCampaign = campaigns.find(c => c.status === 'active');

  return (
    <main className="min-h-screen bg-slate-50 pb-10">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 sm:py-6">
        <header className="overflow-hidden rounded-[2rem] bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-700 p-5 text-white shadow-xl sm:p-7">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-bold sm:text-sm">
                <Activity className="h-4 w-4" />
                Live campaign control
                {liveLoading && <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-300" />}
              </div>

              <h1 className="mt-4 text-3xl font-black sm:text-5xl">
                Admin Dashboard
              </h1>

              <p className="mt-2 text-sm leading-7 text-emerald-50/80 sm:text-base">
                إدارة الحملات، التبرعات، زوار اليوم، والمتواجدين الآن.
              </p>

              {activeCampaign && (
                <div className="mt-4 rounded-2xl bg-white/10 p-4 backdrop-blur">
                  <p className="text-xs font-bold text-emerald-100">Active Campaign</p>
                  <p className="mt-1 line-clamp-1 font-black">{activeCampaign.title}</p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
              <button
                onClick={() => load()}
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white/10 px-4 py-3 text-sm font-bold text-white backdrop-blur transition hover:bg-white/20 disabled:opacity-50"
              >
                <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>

              <button
                onClick={logout}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-red-500 px-4 py-3 text-sm font-bold text-white transition hover:bg-red-600"
              >
                <LogOut className="h-5 w-5" />
                Logout
              </button>
            </div>
          </div>
        </header>

        <div className="sticky top-0 z-40 -mx-4 mt-4 overflow-x-auto bg-slate-50/95 px-4 py-3 backdrop-blur sm:static sm:mx-0 sm:bg-transparent sm:px-0">
          <div className="flex min-w-max gap-2">
            {[
              ['overview', 'Overview'],
              ['campaigns', 'Campaigns'],
              ['donations', 'Donations'],
              ['settings', 'Settings']
            ].map(([key, label]) => (
              <button
                key={key}
                onClick={() => setTab(key as any)}
                className={`rounded-2xl px-5 py-3 text-sm font-black transition sm:text-base ${
                  tab === key
                    ? 'bg-emerald-800 text-white shadow-lg'
                    : 'bg-white text-slate-700 shadow-sm hover:bg-slate-100'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {tab === 'overview' && (
          <>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              <Card icon={<Wallet />} label="Total raised" value={`$${raised.toFixed(2)}`} />
              <Card icon={<Eye />} label="Total visitors" value={String(visits)} />
              <Card icon={<Users />} label="Today visitors" value={String(todayVisitors)} />
              <Card icon={<Activity />} label="Online now" value={String(onlineNow)} live />
              <Card icon={<BarChart3 />} label="Donations" value={String(donations.length)} />
            </div>

            <section className="mt-6 rounded-[2rem] bg-white p-5 shadow-sm ring-1 ring-black/5 sm:p-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-2xl font-black text-slate-950">
                    Latest donations
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    يتم تحديث التبرعات تلقائيًا كل 5 ثوانٍ.
                  </p>
                </div>

                <span className="inline-flex w-fit items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-xs font-black text-emerald-800">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-600" />
                  Live updates
                </span>
              </div>

              <DonationCards donations={donations.slice(0, 6)} />
              <div className="hidden md:block">
                <DonationTable donations={donations.slice(0, 8)} />
              </div>
            </section>
          </>
        )}

        {tab === 'campaigns' && (
          <>
            <section className="mt-6 rounded-[2rem] bg-white p-5 shadow-sm ring-1 ring-black/5 sm:p-6">
              <div className="flex items-center gap-3">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-100 text-emerald-800">
                  <Plus className="h-6 w-6" />
                </div>

                <div>
                  <h2 className="text-2xl font-black text-slate-950">
                    Create new campaign
                  </h2>
                  <p className="text-sm text-slate-500">
                    إنشاء حملة جديدة سيغلق الحملة النشطة الحالية.
                  </p>
                </div>
              </div>

              <div className="mt-6 grid gap-3 md:grid-cols-2">
                {Object.entries(form).map(([k, v]) => (
                  <input
                    key={k}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-4 outline-none transition focus:border-emerald-700 focus:bg-white"
                    placeholder={k}
                    value={v}
                    onChange={e => setForm({ ...form, [k]: e.target.value })}
                  />
                ))}
              </div>

              <button
                onClick={createCampaign}
                className="mt-5 w-full rounded-2xl bg-emerald-800 px-6 py-4 font-black text-white shadow-lg transition hover:bg-emerald-900 sm:w-auto"
              >
                Create campaign
              </button>
            </section>

            <section className="mt-6 rounded-[2rem] bg-white p-5 shadow-sm ring-1 ring-black/5 sm:p-6">
              <h2 className="text-2xl font-black text-slate-950">Campaigns</h2>

              <div className="mt-4 space-y-3 md:hidden">
                {campaigns.map(c => (
                  <div key={c.id} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-black text-slate-950">{c.title}</p>
                        <p className="mt-1 text-sm text-slate-500">${c.goal_usd}</p>
                      </div>

                      <StatusBadge status={c.status} />
                    </div>

                    <p className="mt-3 text-xs text-slate-500">
                      {new Date(c.created_at).toLocaleString()}
                    </p>

                    <div className="mt-4 flex gap-2">
                      {c.status !== 'active' && (
                        <button
                          onClick={() => activateCampaign(c.id)}
                          className="flex-1 rounded-xl bg-emerald-700 px-3 py-3 text-sm font-bold text-white"
                        >
                          Activate
                        </button>
                      )}

                      {c.status === 'active' && (
                        <button
                          onClick={() => closeCampaign(c.id)}
                          className="flex-1 rounded-xl bg-red-600 px-3 py-3 text-sm font-bold text-white"
                        >
                          Close
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="hidden overflow-x-auto md:block">
                <table className="mt-4 w-full min-w-[760px] text-left text-sm">
                  <thead>
                    <tr className="text-slate-500">
                      <th className="py-3">Title</th>
                      <th>Goal</th>
                      <th>Status</th>
                      <th>Created</th>
                      <th>Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {campaigns.map(c => (
                      <tr key={c.id} className="border-t border-slate-100">
                        <td className="py-4 font-black text-slate-950">{c.title}</td>
                        <td>${c.goal_usd}</td>
                        <td><StatusBadge status={c.status} /></td>
                        <td>{new Date(c.created_at).toLocaleString()}</td>
                        <td className="flex gap-2 py-3">
                          {c.status !== 'active' && (
                            <button
                              onClick={() => activateCampaign(c.id)}
                              className="rounded-xl bg-emerald-700 px-3 py-2 font-bold text-white"
                            >
                              Activate
                            </button>
                          )}

                          {c.status === 'active' && (
                            <button
                              onClick={() => closeCampaign(c.id)}
                              className="rounded-xl bg-red-600 px-3 py-2 font-bold text-white"
                            >
                              Close
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}

        {tab === 'donations' && (
          <section className="mt-6 rounded-[2rem] bg-white p-5 shadow-sm ring-1 ring-black/5 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black text-slate-950">All donations</h2>
                <p className="mt-1 text-sm text-slate-500">
                  القائمة تتحدث تلقائيًا بدون إعادة تحميل الصفحة.
                </p>
              </div>

              <span className="hidden items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-xs font-black text-emerald-800 sm:inline-flex">
                <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-600" />
                Live
              </span>
            </div>

            <DonationCards donations={donations} />
            <div className="hidden md:block">
              <DonationTable donations={donations} />
            </div>
          </section>
        )}

        {tab === 'settings' && (
          <section className="mt-6 rounded-[2rem] bg-white p-5 shadow-sm ring-1 ring-black/5 sm:p-6">
            <h2 className="text-2xl font-black text-slate-950">Settings</h2>
            <p className="mt-2 text-slate-500">
              إعدادات إدارية للنظام.
            </p>

            <button
              onClick={resetVisits}
              className="mt-5 w-full rounded-2xl bg-red-600 px-6 py-4 font-black text-white shadow-lg transition hover:bg-red-700 sm:w-auto"
            >
              Reset visits
            </button>
          </section>
        )}
      </div>
    </main>
  );
}

function Card({
  icon,
  label,
  value,
  live = false
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  live?: boolean;
}) {
  return (
    <div className="rounded-[1.6rem] bg-white p-4 shadow-sm ring-1 ring-black/5 sm:rounded-[2rem] sm:p-5">
      <div className="flex items-center justify-between">
        <div className="grid h-11 w-11 place-items-center rounded-2xl bg-emerald-100 text-emerald-800 [&>svg]:h-5 [&>svg]:w-5">
          {icon}
        </div>

        {live && (
          <span className="flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-800">
            <span className="relative flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-green-500" />
            </span>
            LIVE
          </span>
        )}
      </div>

      <p className="mt-4 text-sm font-bold text-slate-500">{label}</p>

      <div className="mt-1 flex items-center gap-2">
        {live && <span className="h-2 w-2 animate-pulse rounded-full bg-green-500" />}
        <b className="text-2xl font-black text-slate-950 sm:text-3xl">{value}</b>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const active = status === 'active';

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-black ${
        active
          ? 'bg-emerald-100 text-emerald-800'
          : 'bg-slate-100 text-slate-700'
      }`}
    >
      {active ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
      {status}
    </span>
  );
}

function DonationCards({ donations }: { donations: Donation[] }) {
  return (
    <div className="mt-5 space-y-3 md:hidden">
      {donations.length === 0 && (
        <div className="rounded-2xl bg-slate-50 p-6 text-center text-slate-400">
          No donations yet.
        </div>
      )}

      {donations.map(d => (
        <div key={d.id} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-black text-slate-950">
                {d.show_name && d.donor_name ? d.donor_name : 'Anonymous'}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {new Date(d.created_at).toLocaleString()}
              </p>
            </div>

            <div className="text-right">
              <p className="text-xl font-black text-emerald-800">
                ${Number(d.amount_usd).toFixed(2)}
              </p>
              <p className="mt-1 text-xs font-bold text-slate-500">{d.currency}</p>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between gap-2">
            <span
              className={`rounded-full px-3 py-1 text-xs font-black ${
                d.status === 'completed'
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              {d.status}
            </span>

            <span className="line-clamp-1 text-xs text-slate-500">
              {d.campaigns?.title || '-'}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

function DonationTable({ donations }: { donations: Donation[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="mt-5 w-full min-w-[760px] text-left text-sm">
        <thead>
          <tr className="text-slate-500">
            <th className="py-3">Donor</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Campaign</th>
            <th>Date</th>
          </tr>
        </thead>

        <tbody>
          {donations.length === 0 && (
            <tr>
              <td colSpan={5} className="py-8 text-center text-slate-400">
                No donations yet.
              </td>
            </tr>
          )}

          {donations.map(d => (
            <tr key={d.id} className="border-t border-slate-100">
              <td className="py-4 font-black text-slate-950">
                {d.show_name && d.donor_name ? d.donor_name : 'Anonymous'}
              </td>
              <td className="font-bold text-emerald-800">
                ${Number(d.amount_usd).toFixed(2)}
              </td>
              <td>{d.status}</td>
              <td>{d.campaigns?.title || '-'}</td>
              <td>{new Date(d.created_at).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}