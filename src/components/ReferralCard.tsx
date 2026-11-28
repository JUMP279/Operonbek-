import { isUz } from '../context/LanguageContext';
import React, { useEffect, useState } from 'react';
import { Check, Copy, Gift, Loader2 } from 'lucide-react';
import { api, ApiError, ReferralInfo } from '../lib/api';
import { isAndroidApp } from '../lib/platform';
import { normalizeRef } from '../lib/referral';

// Referal dasturi (2026-11-17) — saytdagi «Пригласить друзей» bo'limi bilan bir xil (operon/src/components/cabinet/Referral.tsx).
// Google Play qoidasi: Android ilovada balansdan TARIF TO'LASH ko'rsatilmaydi (raqamli xizmat to'lovi — faqat saytda).
const SITE = 'https://findlead.bond';   // 2026-11-26: qz4mnp.shop — blogerlar portali
const money = (v: number) => `$${(v || 0).toFixed(2)}`;

export const ReferralCard: React.FC<{ lang: 'uz' | 'ru' | 'kk' }> = ({ lang }) => {
  const kk = lang === 'kk';
  const tx = (ru: string, k: string) => (kk ? k : ru);
  const [d, setD] = useState<ReferralInfo | null>(null);
  const [failed, setFailed] = useState(false);
  const [copied, setCopied] = useState('');
  const [msg, setMsg] = useState<{ ok: boolean; text: string; at: string } | null>(null);
  const [busy, setBusy] = useState('');
  const [code, setCode] = useState('');
  const [showPayout, setShowPayout] = useState(false);
  const [pay, setPay] = useState({ amount: '', method: 'card', account: '', holder: '' });

  const load = () => api.referral().then((x) => { setD(x); setFailed(false); }).catch(() => setFailed(true));
  useEffect(() => { load(); }, []);

  const copy = async (text: string, what: string) => {
    try { await navigator.clipboard.writeText(text); setCopied(what); window.setTimeout(() => setCopied(''), 1800); } catch { /* */ }
  };
  const errText = (e: unknown) => {
    const m = e instanceof ApiError ? e.message : '';
    const map: Record<string, [string, string, string]> = {
      invalid: ['Такого промокода нет.', 'Мұндай промокод жоқ.', "Bunday promokod yo'q."],
      own: ['Нельзя ввести свой собственный промокод.', 'Өз промокодыңызды енгізуге болмайды.', "O'z promokodingizni kiritib bo'lmaydi."],
      already: ['Промокод уже привязан.', 'Промокод бұрын байланған.', "Promokod allaqachon bog'langan."],
      paid: ['Промокод можно ввести только до первой оплаты.', 'Промокодты тек алғашқы төлемге дейін енгізуге болады.', "Promokodni faqat birinchi to'lovgacha kiritish mumkin."],
      min: [`Минимум для вывода — ${money(d?.min_payout ?? 10)}.`, `Ең аз шығару — ${money(d?.min_payout ?? 10)}.`, `Yechib olish uchun minimum — ${money(d?.min_payout ?? 10)}.`],
      balance: ['Недостаточно доступного баланса.', 'Қолжетімді баланс жеткіліксіз.', "Mavjud balans yetarli emas."],
      pending: ['Заявка на вывод уже в обработке.', 'Шығаруға өтінім өңделуде.', "Yechib olish arizasi allaqachon ko'rib chiqilmoqda."],
    };
    const v = map[m];
    return v ? (isUz() ? v[2] : tx(v[0], v[1])) : (isUz() ? "Bo'lmadi. Qaytadan urinib ko'ring." : tx('Не получилось. Попробуйте ещё раз.', 'Болмады. Қайталап көріңіз.'));
  };
  const run = async (key: string, fn: () => Promise<unknown>, ok: string) => {
    setBusy(key); setMsg(null);
    try { await fn(); setMsg({ ok: true, text: ok, at: key === 'apply' ? 'apply' : 'balance' }); await load(); return true; }
    catch (e) { setMsg({ ok: false, text: errText(e), at: key === 'apply' ? 'apply' : 'balance' }); return false; }
    finally { setBusy(''); }
  };

  if (failed) return null;   // jadval hali yo'q yoki tarmoq — tarif sahifasini buzmaymiz
  if (!d) return <div className="flex justify-center py-6"><Loader2 className="w-5 h-5 text-purple-600 animate-spin" /></div>;

  const link = `${SITE}/?ref=${d.code}`;
  const pct = Math.round(d.rate * 100);
  const share = (isUz() ? `FindLeadni sinab ko'ring — AI biznes uchun Reels va postlar tayyorlaydi. 14 kun bepul. Mening promokodim: ${d.code} ${link}` : tx(`Попробуйте FindLead — AI делает Reels и посты для бизнеса. 14 дней бесплатно. Мой промокод: ${d.code} ${link}`,
    `FindLead-ты байқап көріңіз — AI бизнеске Reels пен пост жасайды. 14 күн тегін. Менің промокодым: ${d.code} ${link}`));
  const plans: { id: 'starter' | 'growth' | 'business'; name: string; price: number }[] = [
    { id: 'starter', name: 'Starter', price: 20 }, { id: 'growth', name: 'Growth', price: 49.9 }, { id: 'business', name: 'Business', price: 79.99 }];

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 space-y-3">
      <div className="flex items-center gap-2 text-[14px] font-black"><Gift className="w-4 h-4 text-purple-600" />{(isUz() ? "Do'stlarni taklif qiling" : tx('Пригласить друзей', 'Достарды шақыру'))}</div>
      <p className="text-[12px] text-slate-600">{(isUz() ? `${pct}% taklif qilingan odamning har bir to'lovidan — uning birinchi to'lovidan boshlab ${d.months} oy. Bonus ${d.hold_days} kundan keyin mavjud.` : tx(`${pct}% с каждой оплаты приглашённого — ${d.months} месяцев с его первой оплаты. Бонус доступен через ${d.hold_days} дней.`,
        `Шақырылған адамның әр төлемінен ${pct}% — алғашқы төлемінен бастап ${d.months} ай. Бонус ${d.hold_days} күннен кейін қолжетімді.`))}</p>

      <div className="flex items-center gap-2">
        <span className="text-[24px] font-black tracking-wider">{d.code}</span>
        <button onClick={() => copy(d.code, 'code')} className="h-8 px-3 rounded-full bg-slate-100 text-[12px] font-bold flex items-center gap-1">
          {copied === 'code' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}{(isUz() ? "Kod" : tx('Код', 'Код'))}
        </button>
        <button onClick={() => copy(share, 'link')} className="h-8 px-3 rounded-full bg-purple-600 text-white text-[12px] font-bold flex items-center gap-1">
          {copied === 'link' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}{(isUz() ? "Matn + havola" : tx('Текст + ссылка', 'Мәтін + сілтеме'))}
        </button>
      </div>
      <div className="flex gap-2 text-[12px] font-bold">
        <a className="h-8 px-3 rounded-full border border-slate-200 flex items-center" target="_blank" rel="noreferrer" href={`https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent(share)}`}>Telegram</a>
        <a className="h-8 px-3 rounded-full border border-slate-200 flex items-center" target="_blank" rel="noreferrer" href={`https://wa.me/?text=${encodeURIComponent(share)}`}>WhatsApp</a>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-xl bg-slate-50 p-2.5"><p className="text-[10.5px] font-bold text-slate-500 uppercase">{(isUz() ? "Mavjud" : tx('Доступно', 'Қолжетімді'))}</p><p className="text-[18px] font-black">{money(d.available)}</p></div>
        <div className="rounded-xl bg-slate-50 p-2.5"><p className="text-[10.5px] font-bold text-slate-500 uppercase">{(isUz() ? "Kutilmoqda" : tx('Ожидает', 'Күтуде'))}</p><p className="text-[18px] font-black text-slate-500">{money(d.pending)}</p></div>
        <div className="rounded-xl bg-slate-50 p-2.5"><p className="text-[10.5px] font-bold text-slate-500 uppercase">{(isUz() ? "Ishlab topilgan" : tx('Заработано', 'Табылды'))}</p><p className="text-[18px] font-black">{money(d.earned)}</p></div>
        <div className="rounded-xl bg-slate-50 p-2.5"><p className="text-[10.5px] font-bold text-slate-500 uppercase">{(isUz() ? "Taklif qilingan / to'laydiganlar" : tx('Приглашено / платят', 'Шақырылды / төлейді'))}</p><p className="text-[18px] font-black">{d.invited} / {d.paying}</p></div>
      </div>

      {msg?.at === 'balance' && <p className={`text-[12px] font-semibold rounded-xl px-3 py-2 ${msg.ok ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>{msg.text}</p>}

      <div className="flex flex-wrap gap-2">
        {!isAndroidApp() && plans.map((p) => (
          <button key={p.id} disabled={d.available < p.price || !!busy}
            onClick={() => run('plan', () => api.referralPayPlan(p.id), (isUz() ? `Tarif ${p.name} balansdan to'landi.` : tx(`Тариф ${p.name} оплачен с баланса.`, `${p.name} тарифі баланстан төленді.`)))}
            className="h-9 px-3 rounded-xl border border-slate-200 text-[12px] font-bold disabled:opacity-40">{(isUz() ? "To'lash" : tx('Оплатить', 'Төлеу'))} {p.name}</button>
        ))}
        <button disabled={d.available < d.min_payout || d.payout_pending || !!busy}
          onClick={() => { setShowPayout(!showPayout); setPay({ ...pay, amount: d.available.toFixed(2) }); }}
          className="h-9 px-3 rounded-xl bg-slate-900 text-white text-[12px] font-bold disabled:opacity-40">{(isUz() ? "Kartaga yechib olish" : tx('Вывести на карту', 'Картаға шығару'))}</button>
      </div>
      {d.payout_pending && <p className="text-[11.5px] font-semibold text-amber-700">{(isUz() ? "Ariza qabul qilindi — pul 24 soat ichida hisobingizga tushadi." : tx('Заявка принята — деньги поступят на ваш счёт в течение 24 часов.', 'Өтінім қабылданды — ақша 24 сағат ішінде шотыңызға түседі.'))}</p>}
      {d.available < d.min_payout && !d.payout_pending && <p className="text-[11px] text-slate-500">{(isUz() ? `Yechib olish ${money(d.min_payout)} dan.` : tx(`Вывод от ${money(d.min_payout)}.`, `Шығару ${money(d.min_payout)} бастап.`))}</p>}

      {showPayout && !d.payout_pending && (
        <form className="space-y-2" onSubmit={async (e) => {
          e.preventDefault();
          if (await run('payout', () => api.referralPayout(Number(pay.amount), pay.method, pay.account, pay.holder),
            (isUz() ? "So'rov yuborildi. Pul hisobingizga 24 soat ichida tushadi." : tx('Заявка отправлена. Деньги поступят на ваш счёт в течение 24 часов.', 'Өтінім жіберілді. Ақша 24 сағат ішінде шотыңызға түседі.')))) setShowPayout(false);
        }}>
          <input required type="number" step="0.01" min={d.min_payout} max={d.available} value={pay.amount} onChange={(e) => setPay({ ...pay, amount: e.target.value })} className="w-full h-10 rounded-xl border border-slate-200 px-3 text-[13px]" placeholder="$" />
          <select value={pay.method} onChange={(e) => setPay({ ...pay, method: e.target.value })} className="w-full h-10 rounded-xl border border-slate-200 px-3 text-[13px] bg-white">
            <option value="card">{(isUz() ? "Bank kartasi" : tx('Банковская карта', 'Банк картасы'))}</option><option value="kaspi">Kaspi</option><option value="click">Click</option><option value="payme">Payme</option>
          </select>
          <input required minLength={4} maxLength={64} value={pay.account} onChange={(e) => setPay({ ...pay, account: e.target.value })} className="w-full h-10 rounded-xl border border-slate-200 px-3 text-[13px]" placeholder={(isUz() ? "Karta yoki telefon raqami" : tx('Номер карты или телефона', 'Карта немесе телефон нөмірі'))} autoComplete="off" />
          <input required minLength={2} maxLength={80} value={pay.holder} onChange={(e) => setPay({ ...pay, holder: e.target.value })} className="w-full h-10 rounded-xl border border-slate-200 px-3 text-[13px]" placeholder={(isUz() ? "Qabul qiluvchining ismi" : tx('Имя получателя', 'Алушының аты-жөні'))} />
          <button disabled={busy === 'payout'} className="w-full h-10 rounded-xl bg-purple-600 text-white text-[13px] font-bold disabled:opacity-50">{(isUz() ? "So'rov yuborish" : tx('Отправить заявку', 'Өтінім жіберу'))}</button>
        </form>
      )}

      {d.can_apply_code && !d.my_referrer_code && (
        <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); run('apply', () => api.referralApply(code), (isUz() ? "Promokod bog'landi." : tx('Промокод привязан.', 'Промокод байланды.'))); }}>
          <input value={code} onChange={(e) => setCode(normalizeRef(e.target.value))} placeholder={(isUz() ? "Sizni taklif qilishdimi? Promokod" : tx('Вас пригласили? Промокод', 'Сізді шақырды ма? Промокод'))} className="flex-1 min-w-0 h-10 rounded-xl border border-slate-200 px-3 text-[13px] font-semibold" />
          <button disabled={code.length < 3 || busy === 'apply'} className="h-10 px-3 rounded-xl bg-slate-900 text-white text-[12px] font-bold disabled:opacity-40">{(isUz() ? "Qo'llash" : tx('Применить', 'Қолдану'))}</button>
        </form>
      )}
      {msg?.at === 'apply' && <p className={`text-[12px] font-semibold rounded-xl px-3 py-2 ${msg.ok ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>{msg.text}</p>}
      {d.my_referrer_code && <p className="text-[11.5px] text-slate-500">{(isUz() ? "Sizni promokod orqali taklif qilishdi" : tx('Вас пригласил промокод', 'Сізді шақырған промокод'))}: <b>{d.my_referrer_code}</b></p>}

      {d.people.length > 0 && (
        <div className="divide-y divide-slate-100">
          {d.people.map((p, i) => (
            <div key={i} className="py-2 flex items-center gap-2 text-[12px]">
              <span className="flex-1 min-w-0 truncate font-semibold">{p.name}</span>
              <span className={`text-[10.5px] font-bold px-2 py-0.5 rounded-full ${p.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                {p.status === 'invited' ? (isUz() ? "to'lamadi" : tx('не оплатил', 'төлемеген')) : p.status === 'active' ? (isUz() ? "bonus kelyapti" : tx('бонус идёт', 'бонус жүріп жатыр')) : (isUz() ? "muddat tugadi" : tx('срок истёк', 'мерзім бітті'))}
              </span>
              <span className="font-black w-[64px] text-right">{money(p.earned)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
