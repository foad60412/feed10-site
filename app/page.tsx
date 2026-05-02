'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Globe2,
  Heart,
  Lock,
  ShieldCheck,
  Sparkles,
  Users,
  Utensils,
  Wallet,
  Gift,
  Eye
} from 'lucide-react';
import PayPalDonate from '../components/PayPalDonate';

type Campaign = {
  id: string;
  title: string;
  description: string;
  goal_usd: number;
  families_target: number;
  basket_min_usd: number;
  basket_max_usd: number;
};

type Donation = {
  id: string;
  donor_name: string | null;
  show_name: boolean;
  amount_usd: number;
  currency: string;
  created_at: string;
};

const content = {
  ar: {
    language: 'English',
    brandSmall: 'مبادرة إنسانية مستقلة',
    brandMain: 'Feed 10',
    badge: 'تبرع صغير… أثر حقيقي',
    title: 'هذه ليست حملة فقط… هذه وجبة اليوم لعائلة محتاجة',
    subtitle:
      'تبرع بسيط قد يتحول إلى طعام حقيقي على مائدة عائلة. خلال ثوانٍ يمكنك أن تكون سببًا في فرق واضح.',
    heroLine: '5$ فقط قد تعني وجبة اليوم.',
    donateNow: 'تبرع الآن',
    quickDonate: 'تبرع سريع',
    chooseAmount: 'اختر مبلغ التبرع',
    customAmount: 'أو أدخل مبلغًا مخصصًا',
    customAmountPlaceholder: 'أدخل المبلغ',
    donorNameTitle: 'اسمك في آخر التبرعات',
    donorNamePlaceholder: 'اسمك اختياري',
    showMyName: 'إظهار اسمي في آخر التبرعات',
    anonymousHint: 'يمكنك تركه فارغًا للتبرع كفاعل خير.',
    selectedAmount: 'المبلغ المختار',
    raised: 'تم جمعه',
    goal: 'هدف الحملة',
    families: 'عائلات',
    basket: 'سلة غذائية',
    latest: 'آخر التبرعات',
    noDonations: 'كن أول داعم لهذه الحملة.',
    anonymous: 'فاعل خير',
    secure: 'آمن',
    completed: 'مكتمل',
    remaining: 'متبقي',
    paypalCard: 'ادفع بأمان عبر PayPal أو البطاقة.',
    trust: 'كل تبرع يظهر هنا بعد تأكيد الدفع فقط.',
    proofTitle: 'ماذا يحدث بعد تبرعك؟',
    proofText: 'تبرعك لا يبقى رقمًا على الشاشة. يتحول إلى مواد غذائية يتم تجهيزها وتوزيعها.',
    step1: 'نشتري مواد غذائية أساسية',
    step2: 'نجهز السلال الغذائية',
    step3: 'نوزعها على عائلات محتاجة',
    trustTitle: 'لماذا يمكنك الوثوق؟',
    trust1: 'الدفع آمن عبر PayPal',
    trust2: 'لا نحفظ بيانات بطاقتك',
    trust3: 'لا نعرض تبرعات وهمية',
    trust4: 'آخر التبرعات تظهر من قاعدة البيانات فقط',
    urgencyTitle: 'اليوم نحاول إطعام 10 عائلات',
    urgencyText: 'ربما المبلغ بسيط لك… لكنه قد يكون وجبة حقيقية لهم.',
    loading: 'جاري تحميل الحملة...',
    noActive: 'لا توجد حملة نشطة',
    noActiveText: 'يرجى تفعيل حملة من لوحة الإدارة.',
    supporters: 'داعمين حقيقيين'
  },
  en: {
    language: 'العربية',
    brandSmall: 'Independent humanitarian initiative',
    brandMain: 'Feed 10',
    badge: 'Small donation. Real impact.',
    title: 'This is not just a campaign… this is today’s meal for a family',
    subtitle:
      'A small donation can become real food on a family’s table. In seconds, you can create a visible difference.',
    heroLine: 'Just $5 can mean today’s meal.',
    donateNow: 'Donate now',
    quickDonate: 'Quick donation',
    chooseAmount: 'Choose amount',
    customAmount: 'Or enter custom amount',
    customAmountPlaceholder: 'Enter amount',
    donorNameTitle: 'Display name',
    donorNamePlaceholder: 'Your name optional',
    showMyName: 'Show my name in recent donations',
    anonymousHint: 'Leave empty to donate anonymously.',
    selectedAmount: 'Selected amount',
    raised: 'Raised',
    goal: 'Goal',
    families: 'Families',
    basket: 'Food basket',
    latest: 'Recent donations',
    noDonations: 'Be the first supporter.',
    anonymous: 'Anonymous',
    secure: 'Secure',
    completed: 'Completed',
    remaining: 'Remaining',
    paypalCard: 'Pay securely with PayPal or card.',
    trust: 'Donations appear here only after payment confirmation.',
    proofTitle: 'What happens after you donate?',
    proofText: 'Your donation does not stay as a number. It becomes food items prepared and delivered.',
    step1: 'We buy essential food items',
    step2: 'We prepare food baskets',
    step3: 'We deliver them to families in need',
    trustTitle: 'Why trust this?',
    trust1: 'Secure PayPal payment',
    trust2: 'We do not store card details',
    trust3: 'No fake donations are shown',
    trust4: 'Recent donations come from the database only',
    urgencyTitle: 'Today we are trying to feed 10 families',
    urgencyText: 'This amount may be small for you… but it can be a real meal for them.',
    loading: 'Loading campaign...',
    noActive: 'No active campaign',
    noActiveText: 'Please activate a campaign from the admin dashboard.',
    supporters: 'real supporters'
  }
};

export default function HomePage() {
  const [lang, setLang] = useState<'ar' | 'en'>('ar');
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [raised, setRaised] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedAmount, setSelectedAmount] = useState<number>(5);
  const [donorName, setDonorName] = useState('');
  const [showName, setShowName] = useState(false);

  const isAr = lang === 'ar';
  const t = content[lang];

  const cleanAmount = useMemo(() => {
    if (!Number.isFinite(selectedAmount)) return 1;
    return Math.min(500, Math.max(1, Number(selectedAmount)));
  }, [selectedAmount]);

  const progress = useMemo(() => {
    if (!campaign?.goal_usd) return 0;
    return Math.min(100, Math.round((raised / campaign.goal_usd) * 100));
  }, [raised, campaign]);

  const remaining = useMemo(() => {
    if (!campaign) return 0;
    return Math.max(0, campaign.goal_usd - raised);
  }, [campaign, raised]);

  const refresh = useCallback(async () => {
    try {
      const c = await fetch('/api/campaign')
        .then(r => r.json())
        .catch(() => ({ error: true }));

      if (!c.error) {
        setCampaign(c.campaign);
        setRaised(Number(c.raised || 0));
      }

      const d = await fetch('/api/donations')
        .then(r => r.json())
        .catch(() => []);

      setDonations(Array.isArray(d) ? d : []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();

    let visitorId = localStorage.getItem('visitorId');

    if (!visitorId) {
      visitorId = crypto.randomUUID();
      localStorage.setItem('visitorId', visitorId);
    }

    const trackVisit = () => {
      fetch('/api/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: '/', visitorId })
      }).catch(() => {});
    };

    trackVisit();
    const interval = setInterval(trackVisit, 30000);
    return () => clearInterval(interval);
  }, [refresh]);

  useEffect(() => {
    localStorage.setItem('donorName', donorName.trim());
    localStorage.setItem('showName', String(showName && donorName.trim().length > 0));
  }, [donorName, showName]);

  if (loading) {
    return (
      <main className="grid min-h-screen place-items-center bg-emerald-950 text-white">
        <div className="text-center">
          <div className="mx-auto mb-5 h-12 w-12 animate-spin rounded-full border-4 border-white/20 border-t-white" />
          <p className="text-lg font-bold">{t.loading}</p>
        </div>
      </main>
    );
  }

  if (!campaign) {
    return (
      <main className="grid min-h-screen place-items-center bg-slate-950 px-5 text-white">
        <div className="max-w-lg rounded-[2rem] bg-white/10 p-8 text-center backdrop-blur">
          <h1 className="text-3xl font-black">{t.noActive}</h1>
          <p className="mt-3 text-white/70">{t.noActiveText}</p>
        </div>
      </main>
    );
  }

  return (
    <main dir={isAr ? 'rtl' : 'ltr'} className="min-h-screen bg-[#f7fbf7] text-slate-950">
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-700">
        <div className="absolute -left-20 top-10 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -right-20 bottom-0 h-96 w-96 rounded-full bg-lime-300/20 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:py-8">
          <nav className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 text-white">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white/15 backdrop-blur">
                <Heart className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs text-white/70">{t.brandSmall}</p>
                <b className="text-lg">{t.brandMain}</b>
              </div>
            </div>

            <button
              onClick={() => setLang(isAr ? 'en' : 'ar')}
              className="flex items-center gap-2 rounded-full bg-white px-4 py-3 text-sm font-black text-emerald-950 shadow-xl"
            >
              <Globe2 className="h-5 w-5" />
              {t.language}
            </button>
          </nav>

          <div className="grid gap-8 py-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:py-20">
            <div className="text-white">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-bold backdrop-blur">
                <Sparkles className="h-4 w-4" />
                {t.badge}
              </div>

              <h1 className="mt-6 max-w-4xl text-4xl font-black leading-tight tracking-tight sm:text-5xl md:text-6xl">
                {t.title}
              </h1>

              <p className="mt-5 max-w-2xl text-lg leading-9 text-emerald-50/90">
                {t.subtitle}
              </p>

              <div className="mt-5 rounded-[1.7rem] border border-white/15 bg-white/10 p-5 shadow-2xl backdrop-blur">
                <p className="text-xl font-black">{t.heroLine}</p>
                <p className="mt-2 leading-7 text-white/80">{t.urgencyText}</p>
              </div>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <a
                  href="#donate"
                  className="inline-flex items-center justify-center gap-3 rounded-2xl bg-white px-7 py-4 text-lg font-black text-emerald-950 shadow-2xl transition hover:-translate-y-1"
                >
                  ❤️ {t.donateNow}
                  <ArrowRight className={`h-5 w-5 ${isAr ? 'rotate-180' : ''}`} />
                </a>

                <div className="rounded-2xl border border-white/20 bg-white/10 px-6 py-4 text-center font-bold backdrop-blur">
                  ${campaign.basket_min_usd}–${campaign.basket_max_usd} / {t.basket}
                </div>
              </div>
            </div>

            <div className="rounded-[2rem] bg-white p-4 shadow-2xl sm:p-6">
              <div className="grid grid-cols-3 gap-2">
                <StatCard icon={<Users />} label={t.families} value={campaign.families_target} />
                <StatCard icon={<Utensils />} label={t.basket} value={`$${campaign.basket_min_usd}+`} />
                <StatCard icon={<ShieldCheck />} label="PayPal" value={t.secure} />
              </div>

              <div className="mt-5 rounded-[2rem] bg-emerald-50 p-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-bold text-emerald-800">{t.raised}</p>
                    <h2 className="mt-1 text-4xl font-black text-emerald-950">
                      ${raised.toFixed(2)}
                    </h2>
                  </div>

                  <div className="text-end">
                    <p className="text-sm font-bold text-emerald-800">{t.goal}</p>
                    <h3 className="mt-1 text-2xl font-black text-emerald-950">
                      ${campaign.goal_usd}
                    </h3>
                  </div>
                </div>

                <div className="mt-5 h-4 overflow-hidden rounded-full bg-white">
                  <div
                    className="h-full rounded-full bg-emerald-700 transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>

                <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                  <MiniStat label={t.completed} value={`${progress}%`} />
                  <MiniStat label={t.remaining} value={`$${remaining.toFixed(0)}`} />
                  <MiniStat label={t.supporters} value={donations.length} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Proof */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="rounded-[2rem] bg-white p-5 shadow-sm ring-1 ring-black/5 sm:p-7">
          <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
            <div>
              <h2 className="text-3xl font-black">{t.proofTitle}</h2>
              <p className="mt-3 leading-8 text-slate-600">{t.proofText}</p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <ProofCard number="1" text={t.step1} />
              <ProofCard number="2" text={t.step2} />
              <ProofCard number="3" text={t.step3} />
            </div>
          </div>
        </div>
      </section>

      {/* Donation */}
      <section id="donate" className="mx-auto grid max-w-7xl gap-6 px-4 pb-10 sm:px-6 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="order-2 rounded-[2rem] bg-white p-5 shadow-sm ring-1 ring-black/5 sm:p-7 lg:order-1">
          <h2 className="text-2xl font-black">{t.trustTitle}</h2>

          <div className="mt-5 space-y-3">
            <TrustRow icon={<Lock />} text={t.trust1} />
            <TrustRow icon={<Wallet />} text={t.trust2} />
            <TrustRow icon={<Eye />} text={t.trust3} />
            <TrustRow icon={<CheckCircle2 />} text={t.trust4} />
          </div>

          <div className="mt-6 rounded-2xl bg-slate-950 p-5 text-white">
            <div className="flex items-center gap-3">
              <Clock className="h-6 w-6 text-emerald-300" />
              <b>{t.trust}</b>
            </div>
          </div>

          <div className="mt-7">
            <h3 className="text-xl font-black">{t.latest}</h3>

            <div className="mt-4 space-y-3">
              {donations.length === 0 && (
                <p className="rounded-2xl bg-slate-50 p-4 text-slate-500">{t.noDonations}</p>
              )}

              {donations.slice(0, 6).map(d => (
                <div
                  key={d.id}
                  className="flex items-center justify-between rounded-2xl bg-slate-50 p-4 ring-1 ring-black/5"
                >
                  <div>
                    <b className="text-emerald-900">
                      {d.show_name && d.donor_name ? d.donor_name : t.anonymous}
                    </b>
                    <p className="text-xs text-slate-500">
                      {new Date(d.created_at).toLocaleString(isAr ? 'ar' : 'en')}
                    </p>
                  </div>

                  <b className="text-lg text-emerald-700">
                    ${Number(d.amount_usd).toFixed(2)}
                  </b>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="order-1 rounded-[2rem] bg-white p-5 shadow-sm ring-1 ring-black/5 sm:p-7 lg:order-2">
          <div className="rounded-[1.7rem] bg-gradient-to-br from-emerald-800 to-emerald-950 p-5 text-white">
            <div className="flex items-center gap-3">
              <Gift className="h-7 w-7" />
              <h2 className="text-3xl font-black">❤️ {t.quickDonate}</h2>
            </div>
            <p className="mt-3 leading-8 text-white/80">{t.paypalCard}</p>
          </div>

          <div className="mt-6 rounded-[2rem] bg-emerald-50 p-4 sm:p-5">
            <p className="mb-3 font-black text-slate-800">{t.chooseAmount}</p>

            <div className="grid grid-cols-3 gap-3">
              {[5, 10, 25].map(v => (
                <button
                  key={v}
                  onClick={() => setSelectedAmount(v)}
                  className={`rounded-2xl border px-3 py-4 text-lg font-black transition ${
                    cleanAmount === v
                      ? 'border-emerald-800 bg-emerald-800 text-white shadow-lg'
                      : 'border-emerald-100 bg-white text-emerald-900 hover:bg-emerald-100'
                  }`}
                >
                  ${v}
                </button>
              ))}
            </div>

            <div className="mt-4">
              <label className="mb-2 block text-sm font-black text-slate-800">
                {t.customAmount}
              </label>

              <div className="flex items-center rounded-2xl border border-emerald-200 bg-white px-4 focus-within:border-emerald-700">
                <span className="font-black text-emerald-900">$</span>
                <input
                  type="number"
                  min="1"
                  max="500"
                  value={Number.isFinite(selectedAmount) ? selectedAmount : ''}
                  onChange={e => setSelectedAmount(Number(e.target.value))}
                  className="w-full bg-transparent p-4 text-center text-lg font-black text-emerald-900 outline-none"
                  placeholder={t.customAmountPlaceholder}
                />
              </div>
            </div>

            <div className="mt-5 rounded-2xl bg-white p-4">
              <label className="mb-2 block text-sm font-black text-slate-800">
                {t.donorNameTitle}
              </label>

              <input
                type="text"
                value={donorName}
                onChange={e => setDonorName(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center font-bold outline-none focus:border-emerald-700 focus:bg-white"
                placeholder={t.donorNamePlaceholder}
              />

              <label className="mt-3 flex cursor-pointer items-center gap-3 rounded-2xl bg-slate-50 p-3 text-sm font-bold text-slate-700">
                <input
                  type="checkbox"
                  checked={showName}
                  onChange={e => setShowName(e.target.checked)}
                  className="h-5 w-5 accent-emerald-800"
                />
                {t.showMyName}
              </label>

              <p className="mt-2 text-xs leading-6 text-slate-500">{t.anonymousHint}</p>
            </div>
          </div>

          <div className="mt-6 rounded-[2rem] border border-emerald-100 bg-emerald-50 p-4 sm:p-5">
            <p className="mb-3 text-center text-sm font-black text-emerald-900">
              {t.selectedAmount}: ${cleanAmount}
            </p>

            <PayPalDonate amount={cleanAmount} />
          </div>
        </div>
      </section>
    </main>
  );
}

function StatCard({
  icon,
  label,
  value
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-2xl bg-slate-50 p-3 sm:p-4">
      <div className="text-emerald-800 [&>svg]:h-5 [&>svg]:w-5">
        {icon}
      </div>
      <p className="mt-3 text-[10px] font-black uppercase tracking-wide text-slate-500 sm:text-xs">
        {label}
      </p>
      <b className="mt-1 block text-base font-black text-slate-950 sm:text-xl">{value}</b>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl bg-white p-3">
      <b className="block text-lg font-black text-emerald-900">{value}</b>
      <span className="text-[11px] font-bold text-slate-500">{label}</span>
    </div>
  );
}

function ProofCard({ number, text }: { number: string; text: string }) {
  return (
    <div className="rounded-2xl bg-emerald-50 p-4">
      <div className="grid h-10 w-10 place-items-center rounded-full bg-emerald-800 font-black text-white">
        {number}
      </div>
      <p className="mt-4 font-bold leading-7 text-slate-700">{text}</p>
    </div>
  );
}

function TrustRow({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4">
      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-emerald-100 text-emerald-800 [&>svg]:h-5 [&>svg]:w-5">
        {icon}
      </div>
      <p className="font-bold text-slate-700">{text}</p>
    </div>
  );
}