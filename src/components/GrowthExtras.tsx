import { isUz } from '../context/LanguageContext';
import React, { useEffect, useState } from 'react';
import { Copy, FlaskConical, Loader2, RefreshCw, UserRound } from 'lucide-react';
import { api, Experiments, ProfileTips } from '../lib/api';
import { armLabel, DIM_LABEL, STATUS_LABEL } from '../lib/expLabels';

// Saytdagi cabinet/GrowthExtras.tsx bilan bir xil: GET /growth/{id}/profile-tips va /experiments.
type Lang = 'uz' | 'ru' | 'kk';

const MISS: Record<string, [string, string, string]> = { city: ['город', 'қала', 'shahar'], delivery: ['доставка', 'жеткізу', 'yetkazib berish'], payment: ['оплата', 'төлем', "to'lov"], returns: ['возврат/обмен', 'қайтару/айырбас', 'qaytarish/almashtirish'] };

const CopyBtn: React.FC<{ text: string; lang: Lang }> = ({ text, lang }) => {
  const [ok, setOk] = useState(false);
  return (
    <button onClick={() => { try { navigator.clipboard.writeText(text); setOk(true); window.setTimeout(() => setOk(false), 1500); } catch { /* ignore */ } }}
      className="shrink-0 inline-flex items-center gap-1 text-[10.5px] font-bold text-blue-700">
      <Copy className="w-3 h-3" />{ok ? '✓' : ((lang === 'uz' ? "Nusxalash" : lang === 'kk' ? 'Көшіру' : 'Копировать'))}
    </button>
  );
};

export const ProfileTipsCard: React.FC<{ businessId: string; lang: Lang }> = ({ businessId, lang }) => {
  const k = lang === 'kk';
  const [tips, setTips] = useState<ProfileTips | null>(null);
  const [busy, setBusy] = useState(true);
  const [err, setErr] = useState(false);
  const load = (refresh = false) => {
    setBusy(true);
    setErr(false);
    api.profileTips(businessId, lang, refresh).then(setTips).catch(() => setErr(true)).finally(() => setBusy(false));
  };
  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [businessId, lang]);

  return (
    <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 space-y-3">
      <div className="flex items-center gap-2">
        <UserRound className="w-4 h-4 text-pink-600" />
        <p className="text-[13px] font-black flex-1">{(isUz() ? "Instagram profili: nima yozish kerak" : k ? 'Instagram профилі: не жазу керек' : 'Профиль Instagram: что написать')}</p>
        <button onClick={() => load(true)} disabled={busy} className="text-slate-400 disabled:opacity-40" title={(isUz() ? "Yangilash" : k ? 'Жаңарту' : 'Обновить')}>
          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
        </button>
      </div>
      <p className="text-[11px] text-slate-500 -mt-2">{(isUz() ? "Instagram dasturlarga bu maydonlarni o'zgartirishga ruxsat bermaydi — nusxa oling va profilga 1 daqiqada qo'ying." : k
        ? 'Instagram бұл өрістерді бағдарламаға өзгертуге рұқсат бермейді — көшіріп, профильге 1 минутта қойыңыз.'
        : 'Instagram не даёт программам менять эти поля — скопируйте и вставьте в профиль за 1 минуту.')}</p>
      {err && <p className="text-[11.5px] text-rose-600">{(isUz() ? "Yuklab bo'lmadi. Qayta urinib ko'ring." : k ? 'Жүктелмеді. Қайталап көріңіз.' : 'Не удалось загрузить. Попробуйте ещё раз.')}</p>}
      {busy && !tips && <p className="text-[11.5px] text-slate-400">{(isUz() ? "AI profil yozmoqda…" : k ? 'AI профильді жазып жатыр…' : 'AI пишет профиль…')}</p>}
      {tips && (
        <>
          {tips.username_issue === 'uz_domain' && (
            <div className="rounded-xl bg-rose-50 border border-rose-200 p-2.5 space-y-1">
              <p className="text-[11.5px] font-bold text-rose-700">{(isUz() ? `@${tips.username} — «.uz» «O'zbekiston» deydi, xaridorlar esa Qozog'istonda. Username — qidiruvdagi eng kuchli signal.` : k
                ? `@${tips.username} — «.uz» Өзбекстанды білдіреді, ал аудитория Қазақстанда. Username іздеудегі ең күшті белгі.`
                : `@${tips.username} — «.uz» говорит «Узбекистан», а покупатели в Казахстане. Username — самый сильный сигнал в поиске.`)}</p>
              {(tips.username_ideas || []).length > 0 && (
                <p className="text-[11px] text-rose-700">{(isUz() ? "Variantlar" : k ? 'Ұсыныс' : 'Варианты')}: {(tips.username_ideas || []).map((u) => '@' + u).join(' · ')}</p>
              )}
            </div>
          )}
          {(tips.missing || []).length > 0 && (
            <p className="rounded-xl bg-amber-50 border border-amber-200 p-2.5 text-[11px] text-amber-800">{(isUz() ? `Bio ishonch uyg'otishi uchun quyidagilarni ko'rsating: ${(tips.missing || []).map((m) => (MISS[m] || [m, m, m])[2]).join(', ')} — «Biznes xotirasi» bo'limida. Shunda bio va AI-sotuvchi ulardan foydalanadi.` : k
              ? `Профильге сенім қосу үшін жазыңыз: ${(tips.missing || []).map((m) => (MISS[m] || [m, m, m])[1]).join(', ')} — «Бизнес жады» бөлімінде. Сонда био мен AI-сатушы оларды қолданады.`
              : `Чтобы bio вызывало доверие, укажите: ${(tips.missing || []).map((m) => (MISS[m] || [m, m, m])[0]).join(', ')} — в разделе «Память бизнеса». Тогда bio и AI-продавец будут их использовать.`)}</p>
          )}
          {tips.dm_keyword && (
            <p className="text-[11px] text-slate-600">💬 {(isUz() ? `Kim Directda «${tips.dm_keyword}» deb yozsa — AI-sotuvchi darhol katalog va narxlarni yuboradi.` : k
              ? `Direct-ке «${tips.dm_keyword}» деп жазған адамға AI-сатушы бірден каталог пен бағаны жібереді.`
              : `Кто напишет «${tips.dm_keyword}» в Direct — AI-продавец сразу пришлёт каталог и цены.`)}</p>
          )}
          {tips.current_bio != null && (
            <div className="rounded-xl border border-slate-200 p-2.5 space-y-1">
              <span className="text-[10.5px] font-bold text-slate-500">{(isUz() ? "Hozir profilda" : k ? 'Қазір профильде' : 'Сейчас в профиле')}{tips.username ? ` @${tips.username}` : ''}</span>
              {tips.current_name && <p className="text-[12px] font-semibold">{tips.current_name}</p>}
              <p className="text-[12px] whitespace-pre-line leading-snug text-slate-600">{tips.current_bio || ((isUz() ? "(bio bo'sh)" : k ? '(bio бос)' : '(bio пустое)'))}</p>
              {tips.current_link && <p className="text-[11px] text-slate-500">{(isUz() ? "Havola" : k ? 'Сілтеме' : 'Ссылка')}: {tips.current_link}</p>}
            </div>
          )}
          <div className="rounded-xl bg-slate-50 p-2.5 space-y-1">
            <div className="flex items-center justify-between"><span className="text-[10.5px] font-bold text-slate-500">{(isUz() ? "Ism (qidiruvda topilishi uchun)" : k ? 'Аты (іздеуде табылу үшін)' : 'Имя (чтобы находили в поиске)')}</span><CopyBtn text={tips.name} lang={lang} /></div>
            <p className="text-[12.5px] font-semibold">{tips.name}</p>
          </div>
          <div className="rounded-xl bg-slate-50 p-2.5 space-y-1">
            <div className="flex items-center justify-between"><span className="text-[10.5px] font-bold text-slate-500">{(isUz() ? "Bio" : k ? 'Био' : 'Био')} · {tips.bio_len}/150</span><CopyBtn text={tips.bio_text} lang={lang} /></div>
            <p className="text-[12.5px] whitespace-pre-line leading-snug">{tips.bio_text}</p>
            {tips.link && (
              <div className="flex items-center justify-between pt-1 border-t border-slate-200">
                <span className="text-[11px] text-slate-500">{(isUz() ? "Havola" : k ? 'Сілтеме' : 'Ссылка')}: <b className="text-blue-700">{tips.link}</b>{tips.link_label ? ` · «${tips.link_label}»` : ''}</span>
                <CopyBtn text={tips.link} lang={lang} />
              </div>
            )}
          </div>
          <div className="space-y-1.5">
            <p className="text-[11px] font-bold text-slate-500">{(isUz() ? "Aktual (profil ostidagi doiralar)" : k ? 'Актуальное (профиль астындағы дөңгелектер)' : 'Актуальное (кружки под профилем)')}</p>
            {tips.highlights.map((h) => (
              <div key={h.title} className="flex gap-2.5 rounded-xl border border-slate-200 p-2.5">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-100 to-amber-100 flex items-center justify-center text-[18px] shrink-0">{h.emoji || '•'}</div>
                <div className="min-w-0">
                  <p className="text-[12.5px] font-bold">{h.title}</p>
                  <p className="text-[11px] text-slate-500 whitespace-pre-line leading-snug">{h.stories}</p>
                </div>
              </div>
            ))}
          </div>
          {tips.pinned.length > 0 && (
            <div className="space-y-1">
              <p className="text-[11px] font-bold text-slate-500">{(isUz() ? "Yuqoriga qadalgan 3 ta post" : k ? 'Жоғарыға бекітілетін 3 пост' : '3 закреплённых поста сверху')}</p>
              {tips.pinned.map((p, i) => <p key={i} className="text-[11.5px] text-slate-700">📌 {p}</p>)}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export const ExperimentsCard: React.FC<{ businessId: string; lang: Lang }> = ({ businessId, lang }) => {
  const k = lang === 'kk';
  const [d, setD] = useState<Experiments | null>(null);
  useEffect(() => { api.experiments(businessId).then(setD).catch(() => {}); }, [businessId]);
  if (!d) return null;
  const dims = (['hour', 'format', 'hook', 'seconds', 'cta'] as const).filter((x) => (d.dims[x] || []).length);
  const tone: Record<string, string> = {
    winner: 'bg-emerald-100 text-emerald-700', ok: 'bg-slate-100 text-slate-600', weak: 'bg-amber-100 text-amber-800',
    retired: 'bg-rose-100 text-rose-700', testing: 'bg-blue-50 text-blue-700',
  };
  return (
    <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 space-y-2.5">
      <div className="flex items-center gap-2">
        <FlaskConical className="w-4 h-4 text-violet-600" />
        <p className="text-[13px] font-black">{(isUz() ? "FindLead eksperimentlari" : k ? 'FindLead эксперименттері' : 'Эксперименты FindLead')}</p>
      </div>
      <p className="text-[11px] text-slate-500 leading-snug">{(isUz() ? `Har 4-video — yangi variant (format, ilgak, davomiylik, vaqt). Ko'riladiganlar — tez-tez, ko'rilmaydiganlar — kamroq. Variant ${d.min_samples}+ videodan keyin baholanadi.` : k
        ? `Әр 4 бейненің біреуі — жаңа нұсқа (формат, ілмек, ұзындық, уақыт). Көп қаралғаны жиірек, көрмегені сирек қолданылады. Әр нұсқа ${d.min_samples}+ бейнеден кейін бағаланады.`
        : `Каждое 4-е видео — новый вариант (формат, крючок, длина, время). Что смотрят — чаще, что не смотрят — реже. Вариант оценивается после ${d.min_samples}+ видео.`)}</p>
      <div className="flex gap-2 text-[11px]">
        <span className="px-2 py-1 rounded-lg bg-slate-100 font-bold">{(isUz() ? "O'lchangan videolar" : k ? 'Өлшенген бейне' : 'Измерено видео')}: {d.samples}</span>
        {d.avg_views != null && <span className="px-2 py-1 rounded-lg bg-slate-100 font-bold">{(isUz() ? "O'rtacha ko'rishlar" : k ? 'Орташа қаралым' : 'Среднее просмотров')}: {Math.round(d.avg_views)}</span>}
      </div>
      {d.samples < 3 && <p className="text-[11px] text-amber-700 bg-amber-50 rounded-xl px-2.5 py-2">{(isUz() ? "Hozircha ma'lumotlar kam — FindLead turli variantlarni sinab ko'rmoqda. Statistika video chiqqanidan 24 soat keyin yig'iladi." : k
        ? 'Әзірге дерек аз — FindLead әр түрлі нұсқаны сынап жатыр. Статистика бейне шыққаннан 24 сағаттан кейін жиналады.'
        : 'Пока мало данных — FindLead пробует разные варианты. Статистика собирается через 24 часа после выхода видео.')}</p>}
      {dims.map((dim) => (
        <div key={dim} className="space-y-1">
          <p className="text-[11px] font-bold text-slate-500">{DIM_LABEL[dim][lang]}</p>
          {d.dims[dim].slice(0, 5).map((a) => (
            <div key={a.key} className="flex items-center gap-2 text-[11.5px]">
              <span className="flex-1 min-w-0 truncate">{armLabel(dim, a.key, lang)}</span>
              <span className="text-slate-400 shrink-0">{a.videos} {(isUz() ? "ko'rinish." : k ? 'бейне' : 'вид.')}</span>
              <span className="font-bold shrink-0 w-14 text-right">{a.avg_views != null ? Math.round(a.avg_views) : '—'} 👁</span>
              <span className={`px-1.5 py-[1px] rounded-md text-[9.5px] font-bold shrink-0 ${tone[a.status]}`}>{STATUS_LABEL[a.status][lang].split(' — ')[0]}</span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};
