'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Globe2,
  Heart,
  ShieldCheck,
  Sparkles,
  Users,
  Utensils
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
  en: {
    language: 'العربية',
    badge: 'Transparent food campaign',
    brandSmall: 'Feed Families',
    brandMain: 'Palestine',
    title: 'Feed 10 Families in Palestine',
    subtitle:
      'A small donation can help place real food on a family’s table. Every dollar moves us closer to delivering essential food baskets.',
    emotional:
      'Today, some families are facing the day without enough food. Your support, even $5, can help turn worry into relief.',
    donateNow: 'Donate now',
    chooseAmount: 'Choose a donation amount',
    customAmount: 'Or enter a custom amount',
    customAmountPlaceholder: 'Enter custom amount',
    donorNameTitle: 'Donation display name',
    donorNamePlaceholder: 'Your name',
    showMyName: 'Show my name in recent donations',
    anonymousHint: 'Leave empty or uncheck to donate anonymously.',
    selectedAmount: 'Selected amount',
    raised: 'Raised so far',
    goal: 'Campaign goal',
    supporters: 'real supporters',
    families: 'Families',
    basket: 'Food basket',
    latest: 'Latest real donations',
    noDonations: 'No donations yet. Be the first supporter.',
    anonymous: 'Anonymous',
    secure: 'Secure',
    completed: 'completed',
    remaining: 'remaining',
    paypalCard: 'Pay securely with PayPal or card.',
    trust: 'All donations shown here are real confirmed donations.',
    howItWorks: 'How your donation helps',
    point1: 'We purchase essential food items from local suppliers.',
    point2: 'Each basket helps one family with basic food needs.',
    point3: 'We share respectful updates after the purchase and distribution.',
    transparency: 'Transparency promise',
    transparencyText:
      'No fake activity. No fake donation alerts. Only real donations and real campaign progress are shown.',
    loading: 'Loading campaign...',
    noActive: 'No active campaign',
    noActiveText: 'Please activate a campaign from the admin dashboard.'
  },
  ar: {
    language: 'English',
    badge: 'حملة غذائية شفافة',
    brandSmall: 'إطعام العائلات',
    brandMain: 'فلسطين',
    title: 'ساهم في إطعام 10 عائلات داخل فلسطين',
    subtitle:
      'تبرع بسيط قد يضع طعامًا حقيقيًا على مائدة عائلة محتاجة. كل دولار يقرّبنا من شراء وتوزيع السلال الغذائية.',
    emotional:
      'اليوم، هناك عائلات تبدأ يومها وهي لا تعرف إن كان لديها طعام كافٍ. مساهمتك، حتى لو كانت 5$، قد تصنع فرقًا حقيقيًا.',
    donateNow: 'تبرع الآن',
    chooseAmount: 'اختر مبلغ التبرع',
    customAmount: 'أو أدخل مبلغًا مخصصًا',
    customAmountPlaceholder: 'أدخل مبلغًا مخصصًا',
    donorNameTitle: 'اسم المتبرع في آخر التبرعات',
    donorNamePlaceholder: 'اسمك',
    showMyName: 'إظهار اسمي في آخر التبرعات',
    anonymousHint: 'اترك الحقل فارغًا أو ألغِ الخيار للتبرع كفاعل خير.',
    selectedAmount: 'المبلغ المختار',
    raised: 'تم جمعه حتى الآن',
    goal: 'هدف الحملة',
    supporters: 'داعمين حقيقيين',
    families: 'عائلات',
    basket: 'سلة غذائية',
    latest: 'آخر التبرعات الحقيقية',
    noDonations: 'لا توجد تبرعات بعد. كن أول داعم.',
    anonymous: 'فاعل خير',
    secure: 'آمن',
    completed: 'مكتمل',
    remaining: 'متبقي',
    paypalCard: 'ادفع بأمان عبر PayPal أو البطاقة.',
    trust: 'كل التبرعات المعروضة هنا تبرعات حقيقية مؤكدة.',
    howItWorks: 'كيف يساعد تبرعك؟',
    point1: 'نشتري مواد غذائية أساسية من موردين محليين.',
    point2: 'كل سلة تساعد عائلة واحدة باحتياجات غذائية أساسية.',
    point3: 'ننشر تحديثات محترمة بعد الشراء والتوزيع.',
    transparency: 'وعد الشفافية',
    transparencyText:
      'لا توجد إشعارات وهمية. لا توجد تبرعات مزيفة. فقط تبرعات حقيقية وتقدم حقيقي للحملة.',
    loading: 'جاري تحميل الحملة...',
    noActive: 'لا توجد حملة نشطة',
    noActiveText: 'يرجى تفعيل حملة من لوحة الإدارة.'
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

  const progress = useMemo(() => {
    if (!campaign?.goal_usd) return 0;
    return Math.min(100, Math.round((raised / campaign.goal_usd) * 100));
  }, [raised, campaign]);

  const remaining = useMemo(() => {
    if (!campaign) return 0;
    return Math.max(0, campaign.goal_usd - raised);
  }, [campaign, raised]);

  const cleanAmount = useMemo(() => {
    if (!Number.isFinite(selectedAmount)) return 1;
    return Math.min(500, Math.max(1, Number(selectedAmount)));
  }, [selectedAmount]);

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
    <main
      dir={isAr ? 'rtl' : 'ltr'}
      className="min-h-screen overflow-hidden bg-[#f6fbf7] pb-24 text-slate-950"
    >
      <section className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-700" />
        <div className="absolute left-0 top-0 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-lime-300/20 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 py-5 sm:px-5 sm:py-6">
          <nav className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 text-white">
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-white/15 backdrop-blur sm:h-12 sm:w-12">
                <Heart className="h-6 w-6" />
              </div>

              <div>
                <p className="text-xs text-white/70 sm:text-sm">{t.brandSmall}</p>
                <b className="text-base sm:text-lg">{t.brandMain}</b>
              </div>
            </div>

            <button
              onClick={() => setLang(isAr ? 'en' : 'ar')}
              className="flex items-center gap-2 rounded-full bg-white px-4 py-3 text-sm font-black text-emerald-950 shadow-xl sm:px-5"
            >
              <Globe2 className="h-5 w-5" />
              {t.language}
            </button>
          </nav>

          <div className="grid items-center gap-8 py-10 lg:grid-cols-[1.1fr_0.9fr] lg:py-24">
            <div className="text-white">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-bold backdrop-blur">
                <Sparkles className="h-4 w-4" />
                {t.badge}
              </div>

              <h1 className="mt-6 max-w-4xl text-4xl font-black leading-tight tracking-tight sm:text-5xl md:text-7xl">
                {isAr ? t.title : campaign.title || t.title}
              </h1>

              <p className="mt-5 max-w-2xl text-base leading-8 text-emerald-50/90 sm:text-lg md:text-xl">
                {isAr ? t.subtitle : campaign.description || t.subtitle}
              </p>

              <div className="mt-5 rounded-3xl border border-white/15 bg-white/10 p-5 text-white shadow-2xl backdrop-blur">
                <p className="text-base leading-8 sm:text-lg">{t.emotional}</p>
              </div>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
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

            <div className="rounded-[2rem] bg-white p-4 shadow-2xl sm:rounded-[2.5rem] sm:p-6">
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                <StatCard icon={<Users />} label={t.families} value={campaign.families_target} />
                <StatCard icon={<Utensils />} label={t.basket} value={`$${campaign.basket_min_usd}+`} />
                <StatCard icon={<ShieldCheck />} label="PayPal" value={t.secure} />
              </div>

              <div className="mt-5 rounded-[2rem] bg-emerald-50 p-5 sm:p-6">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-bold text-emerald-800">{t.raised}</p>
                    <h2 className="mt-1 text-3xl font-black text-emerald-950 sm:text-4xl">
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

                <div className="mt-4 grid grid-cols-2 gap-3 text-center">
                  <div className="rounded-2xl bg-white p-3">
                    <b className="block text-xl text-emerald-900">{progress}%</b>
                    <span className="text-xs font-bold text-slate-500">{t.completed}</span>
                  </div>

                  <div className="rounded-2xl bg-white p-3">
                    <b className="block text-xl text-emerald-900">${remaining.toFixed(2)}</b>
                    <span className="text-xs font-bold text-slate-500">{t.remaining}</span>
                  </div>
                </div>

                <div className="mt-4 rounded-2xl bg-white p-4 text-center text-sm font-black text-emerald-900">
                  🔥 {donations.length} {t.supporters}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Donation Section */}
      <section
        id="donate"
        className="mx-auto grid max-w-7xl gap-6 px-4 py-10 sm:px-5 sm:py-12 lg:grid-cols-[0.9fr_1.1fr]"
      >
        <div className="order-2 rounded-[2rem] bg-white p-5 shadow-sm ring-1 ring-black/5 sm:rounded-[2.5rem] sm:p-7 lg:order-1">
          <h2 className="text-2xl font-black sm:text-3xl">{t.howItWorks}</h2>

          <div className="mt-6 space-y-4">
            {[t.point1, t.point2, t.point3].map((point, i) => (
              <div key={point} className="flex gap-4 rounded-2xl bg-slate-50 p-4">
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-emerald-700 font-black text-white">
                  {i + 1}
                </div>
                <p className="leading-7 text-slate-700">{point}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-2xl bg-amber-50 p-5">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-6 w-6 text-amber-700" />
              <b className="text-amber-950">{t.transparency}</b>
            </div>
            <p className="mt-3 leading-7 text-amber-900">{t.transparencyText}</p>
          </div>

          <div className="mt-6 rounded-2xl bg-slate-950 p-5 text-white">
            <div className="flex items-center gap-3">
              <Clock className="h-6 w-6 text-emerald-300" />
              <b>{t.trust}</b>
            </div>
          </div>
        </div>

        <div className="order-1 rounded-[2rem] bg-white p-5 shadow-sm ring-1 ring-black/5 sm:rounded-[2.5rem] sm:p-7 lg:order-2">
          <h2 className="text-3xl font-black">❤️ {t.donateNow}</h2>
          <p className="mt-3 leading-7 text-slate-600">{t.paypalCard}</p>

          <div className="mt-6 rounded-[2rem] bg-emerald-50 p-4 sm:p-5">
            <p className="mb-3 font-black text-slate-800">{t.chooseAmount}</p>

            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {[5, 10, 25, 40].map(v => (
                <button
                  key={v}
                  onClick={() => setSelectedAmount(v)}
                  className={`rounded-2xl border px-5 py-4 text-lg font-black transition ${
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

          <div className="mt-7">
            <h3 className="text-xl font-black">{t.latest}</h3>

            <div className="mt-4 space-y-3">
              {donations.length === 0 && (
                <p className="rounded-2xl bg-slate-50 p-4 text-slate-500">{t.noDonations}</p>
              )}

              {donations.slice(0, 6).map(d => (
                <div
                  key={d.id}
                  className="flex items-center justify-between rounded-2xl bg-white p-4 shadow ring-1 ring-black/5"
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
      </section>

      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/20 bg-white/95 p-3 shadow-2xl backdrop-blur md:hidden">
        <a
          href="#donate"
          className="block w-full rounded-2xl bg-emerald-800 py-4 text-center text-lg font-black text-white shadow-xl"
        >
          ❤️ {t.donateNow} — ${cleanAmount}
        </a>
      </div>
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
      <div className="text-emerald-800 [&>svg]:h-5 [&>svg]:w-5 sm:[&>svg]:h-6 sm:[&>svg]:w-6">
        {icon}
      </div>
      <p className="mt-3 text-[10px] font-black uppercase tracking-wide text-slate-500 sm:text-xs">
        {label}
      </p>
      <b className="mt-1 block text-base font-black text-slate-950 sm:text-xl">{value}</b>
    </div>
  );
}