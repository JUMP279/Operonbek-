import React, { useEffect, useState } from 'react';
import { ArrowLeft, Brain, RefreshCw, Trash2, Send, MessageSquare, Clock, Lightbulb, BookOpen, Store } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { api, MemoryContext, MemoryCoreRow } from '../lib/api';
import { formatDay } from '../lib/format';

interface BusinessMemoryViewProps {
  onBack?: () => void;
  storeContext?: { businessId?: string };
}

// Texnik/sozlama kalitlari — tadbirkorga ko'rsatilmaydi (AI promptiga ham tushmaydi)
const HIDDEN = new Set([
  'onboarding_status', 'onboarding_pending', 'onboarding_mode', 'onboarding_profile', 'language',
  'content_mode', 'business_stats', 'plan_features', 'video_trend_last', 'ideas_last', 'ai_advice',
  'ai_memory', 'content_ideas', 'competitor_analysis', 'channels', 'video_profile', 'video_plan',
]);

type Tab = 'profile' | 'interview' | 'rules' | 'temporary' | 'insights';

export const BusinessMemoryView: React.FC<BusinessMemoryViewProps> = ({ onBack, storeContext }) => {
  const { language } = useLanguage();
  const ru = language !== 'kk';
  const businessId = storeContext?.businessId;

  const [data, setData] = useState<MemoryContext | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [tab, setTab] = useState<Tab>('profile');
  const [text, setText] = useState('');
  const [kind, setKind] = useState<'rule' | 'temporary'>('rule');
  const [saving, setSaving] = useState(false);

  const load = async () => {
    if (!businessId) return;
    setLoading(true);
    setError('');
    try {
      setData(await api.memoryContext(businessId));
    } catch {
      setError(ru ? 'Не удалось загрузить память.' : 'Жадты жүктеу мүмкін болмады.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [businessId]);

  const core = (data?.raw.core_memory || []).filter((r) => !HIDDEN.has((r.key || '').toLowerCase()));
  const interview = core
    .filter((r) => r.key.startsWith('savol_'))
    .sort((a, b) => a.key.localeCompare(b.key));
  const rules = core.filter((r) => r.key.startsWith('qoida_'));
  const otherFacts = core.filter((r) => !r.key.startsWith('savol_') && !r.key.startsWith('qoida_'));
  const dynamic = data?.raw.dynamic_memory || [];
  const insights = data?.raw.experience_memory || [];
  const biz = data?.raw.business || {};

  const save = async () => {
    const v = text.trim();
    if (!v || !businessId || saving) return;
    setSaving(true);
    setError('');
    try {
      if (kind === 'rule') await api.saveCoreMemory(businessId, 'umumiy', `qoida_${Date.now()}`, v);
      else await api.addDynamicMemory(businessId, v);
      setText('');
      await load();
    } catch {
      setError(ru ? 'Не удалось сохранить.' : 'Сақтау мүмкін болмады.');
    } finally {
      setSaving(false);
    }
  };

  const removeCore = async (row: MemoryCoreRow) => {
    if (!businessId) return;
    try {
      await api.deleteCoreMemory(businessId, row.key);
      await load();
    } catch {
      setError(ru ? 'Не удалось удалить.' : 'Жою мүмкін болмады.');
    }
  };

  const removeDynamic = async (id: string) => {
    if (!businessId) return;
    try {
      await api.deleteDynamicMemory(businessId, id);
      await load();
    } catch {
      setError(ru ? 'Не удалось удалить.' : 'Жою мүмкін болмады.');
    }
  };

  const TABS: { id: Tab; label: string; count?: number }[] = [
    { id: 'profile', label: ru ? 'Профиль' : 'Профиль' },
    { id: 'interview', label: ru ? 'Анкета' : 'Сауалнама', count: interview.length },
    { id: 'rules', label: ru ? 'Правила' : 'Ережелер', count: rules.length + otherFacts.length },
    { id: 'temporary', label: ru ? 'Акции' : 'Акциялар', count: dynamic.length },
    { id: 'insights', label: ru ? 'Выводы AI' : 'AI қорытынды', count: insights.length },
  ];

  const Empty = ({ msg }: { msg: string }) => <p className="text-xs text-slate-400 text-center py-8">{msg}</p>;

  const Row = ({ title, value, onDelete }: { title?: string; value: string; onDelete?: () => void }) => (
    <div className="p-3 bg-white rounded-2xl border border-slate-100 shadow-2xs flex items-start gap-2">
      <div className="flex-1 min-w-0">
        {title && <div className="text-[10.5px] font-bold uppercase tracking-wide text-slate-400 mb-0.5">{title}</div>}
        <p className="text-xs text-slate-800 whitespace-pre-wrap break-words leading-relaxed">{value}</p>
      </div>
      {onDelete && (
        <button onClick={onDelete} className="w-7 h-7 shrink-0 rounded-lg text-slate-300 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-2">
        <button onClick={onBack} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-100">
          <ArrowLeft className="w-5 h-5 text-slate-800" />
        </button>
        <div className="flex items-center gap-1.5">
          <Brain className="w-4 h-4 text-blue-600" />
          <h2 className="text-[16px] font-bold text-slate-900">{ru ? 'Память бизнеса' : 'Бизнес жады'}</h2>
        </div>
        <button onClick={load} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-100">
          <RefreshCw className={`w-4 h-4 text-slate-600 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <p className="px-4 text-[11px] text-slate-500 leading-relaxed">
        {ru
          ? 'Всё, что здесь хранится, Operon AI читает из базы перед каждым ответом, постом и анализом.'
          : 'Мұндағы барлық деректі Operon AI әр жауап, пост және талдау алдында базадан оқиды.'}
      </p>

      <div className="flex gap-1.5 overflow-x-auto no-scrollbar px-4 py-3 shrink-0">
        {TABS.map((tb) => (
          <button
            key={tb.id}
            onClick={() => setTab(tb.id)}
            className={`px-3 py-1.5 rounded-full text-[11.5px] font-semibold whitespace-nowrap border ${
              tab === tb.id ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-200'
            }`}
          >
            {tb.label}
            {tb.count ? <span className="ml-1 opacity-70">{tb.count}</span> : null}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2 no-scrollbar">
        {error && <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">{error}</div>}
        {!data && loading && (
          <div className="py-12 flex justify-center">
            <div className="w-7 h-7 border-[3px] border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {data && tab === 'profile' && (
          <>
            <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-100">
              <div className="flex items-center gap-2 mb-2">
                <Store className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-bold text-slate-900">{biz.brand_name || '—'}</span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
                {biz.ai_summary ||
                  (ru
                    ? 'AI-сводка готовится после анкеты — обычно это занимает до минуты.'
                    : 'AI қорытындысы сауалнамадан кейін дайындалады — әдетте бір минутқа дейін.')}
              </p>
            </div>
            {[
              [ru ? 'Город' : 'Қала', biz.city],
              [ru ? 'Аудитория' : 'Аудитория', biz.target_audience],
              [ru ? 'Цены' : 'Бағалар', biz.price_range],
              [ru ? 'Стиль общения' : 'Сөйлесу стилі', biz.communication_style],
            ]
              .filter(([, v]) => v)
              .map(([k, v]) => (
                <Row key={k as string} title={k as string} value={v as string} />
              ))}
          </>
        )}

        {data && tab === 'interview' &&
          (interview.length === 0 ? (
            <Empty msg={ru ? 'Ответов анкеты пока нет.' : 'Сауалнама жауаптары әзірге жоқ.'} />
          ) : (
            interview.map((r) => {
              const [q, ...a] = (r.value || '').split('\n');
              return (
                <div key={r.key} className="p-3 bg-white rounded-2xl border border-slate-100 shadow-2xs space-y-1.5">
                  <div className="flex items-start gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-blue-600 mt-0.5 shrink-0" />
                    <p className="text-[11.5px] font-semibold text-slate-500">{q}</p>
                  </div>
                  <p className="text-xs text-slate-900 pl-5 whitespace-pre-wrap">{a.join('\n') || '—'}</p>
                </div>
              );
            })
          ))}

        {data && tab === 'rules' && (
          <>
            {rules.length + otherFacts.length === 0 && (
              <Empty msg={ru ? 'Добавьте правило ниже — AI будет его соблюдать.' : 'Төменде ереже қосыңыз — AI оны сақтайды.'} />
            )}
            {rules.map((r) => (
              <Row key={r.key} title={ru ? 'Ваше правило' : 'Сіздің ережеңіз'} value={r.value} onDelete={() => removeCore(r)} />
            ))}
            {otherFacts.map((r) => (
              <Row
                key={r.key}
                title={r.key.replace(/_/g, ' ')}
                value={r.value}
                onDelete={r.read_only ? undefined : () => removeCore(r)}
              />
            ))}
          </>
        )}

        {data && tab === 'temporary' &&
          (dynamic.length === 0 ? (
            <Empty msg={ru ? 'Временных записей (акции, скидки) нет.' : 'Уақытша жазбалар (акция, жеңілдік) жоқ.'} />
          ) : (
            dynamic.map((d) => (
              <div key={d.id} className="p-3 bg-white rounded-2xl border border-slate-100 shadow-2xs flex items-start gap-2">
                <Clock className="w-3.5 h-3.5 text-amber-500 mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-slate-800 whitespace-pre-wrap break-words">{d.content}</p>
                  {d.expires_at && (
                    <p className="text-[10.5px] text-slate-400 mt-0.5">
                      {ru ? 'до' : 'дейін'} {formatDay(d.expires_at, language)}
                    </p>
                  )}
                </div>
                <button onClick={() => removeDynamic(d.id)} className="w-7 h-7 shrink-0 rounded-lg text-slate-300 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          ))}

        {data && tab === 'insights' &&
          (insights.length === 0 ? (
            <Empty msg={ru ? 'AI ещё не сделал выводов — они появятся по мере работы.' : 'AI әлі қорытынды жасаған жоқ — жұмыс барысында пайда болады.'} />
          ) : (
            insights.map((x) => (
              <div key={x.id} className="p-3 bg-white rounded-2xl border border-slate-100 shadow-2xs flex items-start gap-2">
                <Lightbulb className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                <p className="text-xs text-slate-800 flex-1">{x.insight}</p>
              </div>
            ))
          ))}
      </div>

      {/* AI'ni o'rgatish — yozuv darhol Supabase'ga tushadi */}
      <div className="border-t border-slate-100 bg-white px-4 pt-3 pb-3 space-y-2 shrink-0">
        <div className="flex items-center gap-1.5">
          <BookOpen className="w-3.5 h-3.5 text-blue-600" />
          <span className="text-[11.5px] font-bold text-slate-800">{ru ? 'Научить Operon' : 'Operon-ды үйрету'}</span>
          <div className="ml-auto flex bg-slate-100 rounded-lg p-0.5">
            {(['rule', 'temporary'] as const).map((k) => (
              <button
                key={k}
                onClick={() => setKind(k)}
                className={`px-2 py-0.5 rounded-md text-[10.5px] font-semibold ${kind === k ? 'bg-white text-blue-600 shadow-2xs' : 'text-slate-500'}`}
              >
                {k === 'rule' ? (ru ? 'Правило' : 'Ереже') : ru ? 'Акция' : 'Акция'}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && save()}
            maxLength={2000}
            placeholder={
              kind === 'rule'
                ? ru ? 'Напр.: доставка по Алматы бесплатно от 20 000 ₸' : 'Мыс.: Алматы бойынша 20 000 ₸-ден жеткізу тегін'
                : ru ? 'Напр.: до пятницы скидка 15% на платья' : 'Мыс.: жұмаға дейін көйлектерге 15% жеңілдік'
            }
            className="flex-1 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 text-xs"
          />
          <button
            onClick={save}
            disabled={!text.trim() || saving}
            className="w-10 h-10 shrink-0 rounded-xl bg-blue-600 text-white flex items-center justify-center disabled:opacity-40"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
