import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  Film,
  Library,
  RefreshCw,
  Loader2,
  AlertCircle,
  CalendarClock,
  Wand2,
  Check,
  ChevronDown,
  ChevronUp,
  Upload,
  Pencil,
  X,
  Clock,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { api, ApiError, CharacterCandidate, VideoItem, VideoPlan, VideoPlanItem, VideoProfile } from '../lib/api';
import { formatDay } from '../lib/format';
import { NicheGate } from './NicheGate';

export interface AIVideoGeneratorViewProps {
  onBack: () => void;
  storeContext?: { businessId?: string };
}

type Tab = 'plan' | 'library';

const DIRECTIONS = {
  ru: ['Показ товаров', 'Акции и скидки', 'Как мы работаем (закулисье)', 'Отзывы и доверие', 'Полезные советы'],
  kk: ['Тауарларды көрсету', 'Акциялар мен жеңілдіктер', 'Қалай жұмыс істейміз', 'Пікірлер мен сенім', 'Пайдалы кеңестер'],
};
const GENRES = {
  ru: ['Реклама (динамично)', 'Эстетика / уютно', 'Юмор', 'Новости / факты', 'Эмоциональная история'],
  kk: ['Жарнама (серпінді)', 'Эстетика / жайлы', 'Әзіл', 'Жаңалық / факт', 'Эмоциялық әңгіме'],
};

const T = {
  ru: {
    title: 'AI видео', back: 'Назад', plan: 'План', library: 'Мои видео',
    wizTitle: 'Настроим ваши видео (один раз)',
    wizHint: 'Operon будет делать каждое видео по этим правилам.',
    q1: 'О чём должны быть видео?', q2: 'В каком жанре?', q3: 'Кто будет героем видео? Видео снимаются в стиле UGC — как будто настоящий покупатель снял на телефон.',
    q4: 'Максимальная длина видео', sec: (n: number) => `${n} сек`,
    secHint: 'Длину Operon подбирает сам под тип видео: без слов с музыкой — 5 сек, показ товара — 10, совет — 15, три шага — до 20. Здесь вы задаёте только максимум.',
    styleSilent: 'Без слов · музыка', styleCloseup: 'Крупный план', styleWide: 'В полный рост',
    own: 'Свой вариант…', yes: 'Выберу сам', no: 'Пусть AI подберёт',
    photo: 'Фото героя', photoHint: 'Загрузите фото — AI опишет героя и будет показывать его в видео.',
    note: 'Какой герой нужен?', notePh: 'Например: пожилой добрый бариста / весёлая девушка / смешной кот',
    oneHero: 'Во всех видео будет ОДИН и тот же герой.',
    findPin: 'Найти в Pinterest', pinLink: 'Ссылка Pinterest', upload: 'Своё фото', noPhoto: 'Создать по описанию (AI)',
    aiHint: 'Operon сам подберёт героя под ваш магазин и покажет его. Не нравится — нажмите «Ещё вариант».',
    aiAnother: 'Ещё вариант', aiMaking: 'AI создаёт героя (до 1 минуты)…',
    pinLinkPh: 'https://pin.it/… или pinterest.com/pin/…', usePin: 'Взять',
    searching: 'Ищем героев в Pinterest…', pickOne: 'Выберите героя:', nothing: 'Ничего не нашлось — уточните описание.',
    more: 'Ещё варианты',
    analyzing: 'AI изучает героя (до 2 минут)…', heroReady: 'Герой сохранён — он будет в каждом видео',
    heroText: 'Герой создан по описанию', heroFail: 'Не удалось изучить фото — опишите героя словами и нажмите «Создать по описанию».',
    change: 'Сменить героя',
    pinErr: { not_pinterest: 'Нужна ссылка именно с Pinterest. Другое фото — загрузите через «Своё фото».', no_image: 'По ссылке нет картинки.', generic: 'Не удалось взять фото — попробуйте ещё раз.' },
    extra: 'Ещё правила (необязательно)', extraPh: 'Например: всегда показывать вывеску магазина',
    save: 'Сохранить', saving: 'Сохраняем…',
    timesTitle: 'Когда публиковать?',
    cadence: (c: VideoPlan['cadence']) =>
      `Ваш тариф: ${c.monthly} видео в месяц — ${c.per_day === 2 ? '2 в день' : c.every_days === 2 ? 'каждые 2 дня' : 'каждый день'}.`,
    timesHint: 'Видео создаётся заранее и выходит в Instagram (Reels + Stories) в выбранное время.',
    time: 'Время', start: 'Запустить план', starting: 'Создаём план…',
    upcoming: 'Ближайшие видео', editStyle: 'Изменить стиль', stop: 'Остановить план',
    stopConfirm: 'Точно остановить? Будущие видео удалятся.',
    pendingScript: 'Сценарий появится после выхода предыдущего видео',
    preparing: 'AI пишет сценарий…',
    ready: 'Видео готово — выйдет по расписанию', published: 'Опубликовано', failed: 'Не получилось',
    scenario: 'Сценарий', other: 'Другой вариант',
    askTitle: 'Как мне сделать это видео?',
    askPh: 'Напишите своё пожелание… (можно оставить пустым)',
    byWish: 'Сделать по-моему', byAi: 'Придумай сам', cancel: 'Отмена', writing: 'Пишем новый сценарий…',
    empty: 'Пока нет видео.',
    errors: { network: 'Нет связи с сервером.', generic: 'Ошибка — попробуйте ещё раз.', busy: 'Это видео уже готовится — изменить нельзя.' },
  },
  kk: {
    title: 'AI бейне', back: 'Артқа', plan: 'Жоспар', library: 'Бейнелерім',
    wizTitle: 'Бейнелеріңізді баптайық (бір рет)',
    wizHint: 'Operon әр бейнені осы ережелер бойынша жасайды.',
    q1: 'Бейнелер не туралы болсын?', q2: 'Қандай жанрда?', q3: 'Бейне кейіпкері кім болады? Бейнелер UGC стилінде — нағыз сатып алушы телефонға түсіргендей.',
    q4: 'Бейненің ең ұзақ уақыты', sec: (n: number) => `${n} сек`,
    secHint: 'Ұзақтықты Operon бейне түріне қарай өзі таңдайды: сөзсіз, музыкамен — 5 сек, тауарды көрсету — 10, кеңес — 15, үш қадам — 20-ға дейін. Мұнда тек ең ұзақ шекті белгілейсіз.',
    styleSilent: 'Сөзсіз · музыка', styleCloseup: 'Жақын план', styleWide: 'Толық бойымен',
    own: 'Өз нұсқаңыз…', yes: 'Өзім таңдаймын', no: 'AI таңдасын',
    photo: 'Кейіпкер суреті', photoHint: 'Сурет жүктеңіз — AI кейіпкерді сипаттап, бейнеде көрсетеді.',
    note: 'Қандай кейіпкер керек?', notePh: 'Мысалы: қарт мейірімді бариста / көңілді қыз / күлкілі мысық',
    oneHero: 'Барлық бейнеде БІР ғана кейіпкер болады.',
    findPin: 'Pinterest-тен табу', pinLink: 'Pinterest сілтемесі', upload: 'Өз суретім', noPhoto: 'Сипаттама бойынша жасау (AI)',
    aiHint: 'Operon дүкеніңізге сай кейіпкерді өзі таңдап, көрсетеді. Ұнамаса — «Басқа нұсқа» басыңыз.',
    aiAnother: 'Басқа нұсқа', aiMaking: 'AI кейіпкер жасап жатыр (1 минутқа дейін)…',
    pinLinkPh: 'https://pin.it/… немесе pinterest.com/pin/…', usePin: 'Алу',
    searching: 'Pinterest-тен кейіпкер іздеп жатырмыз…', pickOne: 'Кейіпкерді таңдаңыз:', nothing: 'Ештеңе табылмады — сипаттаманы нақтылаңыз.',
    more: 'Басқа нұсқалар',
    analyzing: 'AI кейіпкерді зерттеп жатыр (2 минутқа дейін)…', heroReady: 'Кейіпкер сақталды — ол әр бейнеде болады',
    heroText: 'Кейіпкер сипаттама бойынша жасалды', heroFail: 'Суретті зерттеу мүмкін болмады — кейіпкерді сөзбен сипаттап, «Сипаттама бойынша жасау» басыңыз.',
    change: 'Кейіпкерді ауыстыру',
    pinErr: { not_pinterest: 'Тек Pinterest сілтемесі керек. Басқа суретті «Өз суретім» арқылы жүктеңіз.', no_image: 'Сілтемеде сурет жоқ.', generic: 'Суретті алу мүмкін болмады — қайталаңыз.' },
    extra: 'Қосымша ереже (міндетті емес)', extraPh: 'Мысалы: дүкен маңдайшасын әрдайым көрсету',
    save: 'Сақтау', saving: 'Сақталуда…',
    timesTitle: 'Қашан жариялау керек?',
    cadence: (c: VideoPlan['cadence']) =>
      `Тарифіңіз: айына ${c.monthly} бейне — ${c.per_day === 2 ? 'күніне 2' : c.every_days === 2 ? '2 күнде 1' : 'күн сайын'}.`,
    timesHint: 'Бейне алдын ала жасалып, таңдалған уақытта Instagram-ға (Reels + Stories) шығады.',
    time: 'Уақыт', start: 'Жоспарды бастау', starting: 'Жоспар жасалуда…',
    upcoming: 'Жақын бейнелер', editStyle: 'Стильді өзгерту', stop: 'Жоспарды тоқтату',
    stopConfirm: 'Шынымен тоқтатасыз ба? Болашақ бейнелер өшеді.',
    pendingScript: 'Сценарий алдыңғы бейне шыққаннан кейін дайын болады',
    preparing: 'AI сценарий жазуда…',
    ready: 'Бейне дайын — кесте бойынша шығады', published: 'Жарияланды', failed: 'Шықпады',
    scenario: 'Сценарий', other: 'Басқа нұсқа',
    askTitle: 'Бұл бейнені қалай жасайын?',
    askPh: 'Тілегіңізді жазыңыз… (бос қалдыруға болады)',
    byWish: 'Менің айтқанымдай', byAi: 'Өзің ойлап тап', cancel: 'Бас тарту', writing: 'Жаңа сценарий жазылуда…',
    empty: 'Әзірге бейне жоқ.',
    errors: { network: 'Серверге қосылу жоқ.', generic: 'Қате — қайталап көріңіз.', busy: 'Бұл бейне дайындалуда — өзгерту мүмкін емес.' },
  },
};

const pad = (n: number) => String(n).padStart(2, '0');
function localWhen(iso: string, lang: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return `${formatDay(iso, lang)}, ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function fileToBase64(f: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result || ''));
    r.onerror = reject;
    r.readAsDataURL(f);
  });
}

export const AIVideoGeneratorView: React.FC<AIVideoGeneratorViewProps> = ({ onBack, storeContext }) => {
  const { language } = useLanguage();
  const lang: 'ru' | 'kk' = language === 'ru' ? 'ru' : 'kk';
  const L = T[lang];
  const businessId = storeContext?.businessId;

  const [tab, setTab] = useState<Tab>('plan');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [profile, setProfile] = useState<VideoProfile | null>(null);
  const [profileDone, setProfileDone] = useState(false);
  const [editing, setEditing] = useState(false);
  const [plan, setPlan] = useState<VideoPlan | null>(null);
  const [videos, setVideos] = useState<VideoItem[]>([]);

  // so'rovnoma
  const [direction, setDirection] = useState('');
  const [genre, setGenre] = useState('');
  const [hasChar, setHasChar] = useState<boolean | null>(null);
  const [charNote, setCharNote] = useState('');
  const [extra, setExtra] = useState('');
  const [seconds, setSeconds] = useState<10 | 15 | 20>(10);
  const [saving, setSaving] = useState(false);

  // qahramon (bitta, doimiy): Pinterest qidiruv / havola / o'z rasmi / matn
  const [charMode, setCharMode] = useState<'search' | 'link' | null>(null);
  const [candidates, setCandidates] = useState<CharacterCandidate[] | null>(null);
  const [charBusy, setCharBusy] = useState<'search' | 'pick' | 'text' | null>(null);
  const [pinLink, setPinLink] = useState('');
  const [charErr, setCharErr] = useState('');

  // vaqtlar
  const [times, setTimes] = useState<string[]>(['18:00', '11:00']);
  const [starting, setStarting] = useState(false);

  // "boshqa tuz"
  const [open, setOpen] = useState<string | null>(null);
  const [askFor, setAskFor] = useState<VideoPlanItem | null>(null);
  const [wish, setWish] = useState('');
  const [regenerating, setRegenerating] = useState(false);
  const refreshUntil = useRef(0);
  const waitingScript = useRef(false);
  const [needsNiche, setNeedsNiche] = useState(false);
  const [langBusy, setLangBusy] = useState<string | null>(null);  // eng yaqin video ssenariysi hali yozilmagan

  const errText = (e: unknown) => {
    if (e instanceof ApiError) {
      if (e.status === 0) return L.errors.network;
      if (e.status === 409) return L.errors.busy;
    }
    return L.errors.generic;
  };

  const load = async () => {
    if (!businessId) { setLoading(false); return; }
    setLoading(true);
    setError('');
    api.brand(businessId).then((b) => setNeedsNiche(b.needs_niche)).catch(() => {});
    try {
      const [pr, pl] = await Promise.all([api.videoProfile(businessId), api.videoPlan(businessId)]);
      setProfile(pr.profile);
      setProfileDone(pr.done);
      setPlan(pl);
      if (pr.profile) {
        setDirection(pr.profile.direction || '');
        setGenre(pr.profile.genre || '');
        setHasChar(pr.profile.has_character);
        setCharNote(pr.profile.character_note || '');
        setExtra(pr.profile.extra || '');
        setSeconds(([10, 15, 20] as const).includes(pr.profile.seconds as 10) ? (pr.profile.seconds as 10 | 15 | 20) : 10);
      }
      if (pl.settings?.times?.length) setTimes((t) => pl.settings!.times!.concat(t).slice(0, 2));
    } catch (e) {
      setError(errText(e));
    } finally {
      setLoading(false);
    }
  };

  const loadVideos = async () => {
    if (!businessId) return;
    try {
      setVideos((await api.videos(businessId)).videos);
    } catch {
      /* keyin */
    }
  };

  useEffect(() => {
    load();
    loadVideos();
    // Reja yaratilgandan keyin dastlabki ssenariylar fonda yoziladi — bir muddat yangilab turamiz
    const t = window.setInterval(() => {
      if ((Date.now() < refreshUntil.current || waitingScript.current) && businessId) {
        api.videoPlan(businessId).then(setPlan).catch(() => {});
      }
    }, 10000);
    return () => window.clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [businessId]);

  // Qahramon JSON fonda tayyorlanayotganda profilni yangilab turamiz
  const analyzing = profile?.character_status === 'analyzing';
  useEffect(() => {
    if (!analyzing || !businessId) return;
    const t = window.setInterval(() => {
      api.videoProfile(businessId).then((pr) => setProfile(pr.profile)).catch(() => {});
    }, 5000);
    return () => window.clearInterval(t);
  }, [analyzing, businessId]);

  const pinErrText = (e: unknown) => {
    if (e instanceof ApiError) {
      if (e.status === 0) return L.errors.network;
      if (e.message === 'not_pinterest') return L.pinErr.not_pinterest;
      if (e.message === 'no_image') return L.pinErr.no_image;
    }
    return L.pinErr.generic;
  };

  const searchHeroes = async () => {
    if (!businessId || charBusy) return;
    setCharMode('search');
    setCharBusy('search');
    setCharErr('');
    setCandidates(null);
    try {
      setCandidates((await api.characterSearch(businessId, charNote.trim())).items);
    } catch (e) {
      setCharErr(errText(e));
    } finally {
      setCharBusy(null);
    }
  };

  const pickHero = async (src: { image_url?: string; link?: string }) => {
    if (!businessId || charBusy) return;
    setCharBusy('pick');
    setCharErr('');
    try {
      await api.characterPick(businessId, src, charNote.trim());
      setCandidates(null);
      setCharMode(null);
      setPinLink('');
      setProfile((await api.videoProfile(businessId)).profile);
    } catch (e) {
      setCharErr(pinErrText(e));
    } finally {
      setCharBusy(null);
    }
  };

  const uploadHero = async (f: File) => {
    if (!businessId || charBusy || f.size > 5_000_000) return;
    setCharBusy('pick');
    setCharErr('');
    try {
      await api.uploadCharacter(businessId, await fileToBase64(f), f.type || 'image/jpeg');
      setCandidates(null);
      setCharMode(null);
      setProfile((await api.videoProfile(businessId)).profile);
    } catch (e) {
      setCharErr(errText(e));
    } finally {
      setCharBusy(null);
    }
  };

  const textHero = async () => {
    if (!businessId || charBusy) return;
    setCharBusy('text');
    setCharErr('');
    try {
      await api.characterGenerate(businessId, charNote.trim());
      setCandidates(null);
      setCharMode(null);
      setProfile((await api.videoProfile(businessId)).profile);
    } catch (e) {
      setCharErr(errText(e));
    } finally {
      setCharBusy(null);
    }
  };

  // "Пусть AI подберёт" — Operon qahramonni o'zi tanlab, rasmini chizib ko'rsatadi
  const autoHero = async () => {
    if (!businessId || charBusy) return;
    setCharBusy('text');
    setCharErr('');
    try {
      await api.characterGenerate(businessId, '');
      setProfile((await api.videoProfile(businessId)).profile);
    } catch (e) {
      setCharErr(errText(e));
    } finally {
      setCharBusy(null);
    }
  };

  const heroChosen = !!(profile?.character_json || profile?.character_image_url);
  const heroCard = (
                    <div className="flex items-start gap-2.5 bg-white rounded-xl border border-slate-200 p-2">
                      {profile?.character_image_url ? (
                        <img src={profile.character_image_url} alt="" className="w-20 h-24 rounded-lg object-cover border border-slate-100 shrink-0" />
                      ) : (
                        <div className="w-16 h-16 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                          <Wand2 className="w-6 h-6" />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        {analyzing ? (
                          <p className="text-[11px] font-semibold text-slate-600 flex items-center gap-1.5">
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-600" />{L.analyzing}
                          </p>
                        ) : profile?.character_status === 'failed' ? (
                          <p className="text-[11px] font-semibold text-rose-600">{L.heroFail}</p>
                        ) : (
                          <p className="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" />
                            {profile?.character_status === 'ready_text' && !profile?.character_image_url ? L.heroText : L.heroReady}
                          </p>
                        )}
                        {profile?.character_json && (
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {(['style', 'age', 'outfit', 'distinctive'] as const)
                              .map((k) => profile.character_json?.[k])
                              .filter((v): v is string => typeof v === 'string' && !!v)
                              .map((v) => (
                                <span key={v} className="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600 line-clamp-1 max-w-full">
                                  {v}
                                </span>
                              ))}
                          </div>
                        )}
                      </div>
                    </div>
  );
  const canSave =
    !!direction.trim() && !!genre.trim() && hasChar !== null && (hasChar === false || heroChosen || !!charNote.trim());

  const saveProfile = async () => {
    if (!businessId || !canSave || saving) return;
    setSaving(true);
    setError('');
    try {
      await api.saveVideoProfile(businessId, {
        direction: direction.trim(), genre: genre.trim(), has_character: !!hasChar,
        character_note: charNote.trim() || null, extra: extra.trim() || null, seconds,
      });
      // Qahramon tanlanmagan, faqat so'z bilan aytilgan — matndan JSON tuzamiz
      if (hasChar && !heroChosen && charNote.trim()) {
        try {
          await api.characterGenerate(businessId, charNote.trim());
        } catch {
          /* profil saqlandi; qahramon matni keyin ham ishlaydi */
        }
      }
      setEditing(false);
      await load();
    } catch (e) {
      setError(errText(e));
    } finally {
      setSaving(false);
    }
  };

  const startPlan = async () => {
    if (!businessId || !plan || starting) return;
    setStarting(true);
    setError('');
    try {
      await api.createVideoPlan(businessId, times.slice(0, plan.cadence.per_day));
      refreshUntil.current = Date.now() + 3 * 60 * 1000;
      setPlan(await api.videoPlan(businessId));
    } catch (e) {
      setError(errText(e));
    } finally {
      setStarting(false);
    }
  };

  const stopPlan = async () => {
    if (!businessId || !window.confirm(L.stopConfirm)) return;
    try {
      await api.stopVideoPlan(businessId);
      setPlan(await api.videoPlan(businessId));
    } catch (e) {
      setError(errText(e));
    }
  };

  // Ssenariy tili: QAZ/RUS — bosilganda ssenariy o'sha tilga o'giriladi, video ham shu tilda bo'ladi
  const switchLang = async (it: VideoPlanItem, to: 'kk' | 'ru') => {
    if ((it.lang || 'kk') === to || langBusy) return;
    setLangBusy(it.id);
    setError('');
    try {
      const r = await api.switchVideoItemLang(it.id, to);
      setPlan((p) =>
        p ? { ...p, items: p.items.map((x) => (x.id === r.id ? { ...x, topic: r.topic, scenario: r.scenario, caption: r.caption, lang: r.lang, seconds: r.seconds ?? x.seconds, style: r.style ?? x.style } : x)) } : p,
      );
    } catch (e) {
      setError(errText(e));
    } finally {
      setLangBusy(null);
    }
  };

  const regenerate = async (useWish: boolean) => {
    if (!askFor || regenerating) return;
    setRegenerating(true);
    setError('');
    try {
      const r = await api.regenerateVideoItem(askFor.id, useWish ? wish.trim() : undefined);
      setPlan((p) =>
        p ? { ...p, items: p.items.map((it) => (it.id === r.id ? { ...it, topic: r.topic, scenario: r.scenario, caption: r.caption, lang: r.lang ?? it.lang, seconds: r.seconds ?? null, style: r.style ?? null } : it)) } : p,
      );
      setOpen(r.id);
      setAskFor(null);
      setWish('');
    } catch (e) {
      setError(errText(e));
    } finally {
      setRegenerating(false);
    }
  };

  const upcoming = (plan?.items || []).filter((i) => !i.past || i.status === 'draft' || i.status === 'scheduled');
  // Ekranda faqat bugungi va kelgusi rejalar; eski kunlar ko'rinmaydi, eng yaqini doim tepada (2026-11-13)
  const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
  const visiblePlan = upcoming
    .filter((i) => !i.past || new Date(i.scheduled_at).getTime() >= todayStart.getTime())
    .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime());
  // Ssenariy faqat eng yaqin draft uchun yoziladi — spinner ham faqat unda
  const nextDraft = upcoming.find((i) => i.status === 'draft');
  const nextDraftId = nextDraft?.id;
  waitingScript.current = !!nextDraft && !nextDraft.topic;
  const planActive = upcoming.length > 0;
  const showWizard = !profileDone || editing;

  const chip = (active: boolean) =>
    `px-2.5 py-1.5 rounded-xl text-[11.5px] font-semibold border transition-all ${
      active ? 'bg-purple-600 text-white border-purple-600' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
    }`;

  return (
    <div className="flex-1 flex flex-col h-full bg-[#FAFBFD] overflow-x-hidden font-sans text-slate-900 w-full max-w-full">
      <div className="bg-white border-b border-slate-200/80 px-3 py-2.5 shrink-0 w-full">
        <div className="flex items-center gap-2">
          <button onClick={onBack} title={L.back}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 active:scale-95">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h1 className="text-sm sm:text-base font-black tracking-tight flex items-center gap-1.5 truncate">
            <Film className="w-4 h-4 text-purple-600 shrink-0" />
            <span>{L.title}</span>
          </h1>
        </div>
        <div className="flex items-center gap-1.5 mt-2.5">
          {([
            { id: 'plan' as const, label: L.plan, icon: <CalendarClock className="w-3.5 h-3.5" /> },
            { id: 'library' as const, label: L.library, icon: <Library className="w-3.5 h-3.5" /> },
          ]).map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 active:scale-95 ${
                tab === t.id ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
              {t.icon}<span>{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 sm:p-4 w-full space-y-3.5 pb-16">
        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl px-3.5 py-2.5 text-xs font-semibold flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" /><span className="flex-1">{error}</span>
            {!plan && !loading && (
              <button onClick={load} className="shrink-0 px-2.5 py-1 rounded-lg bg-rose-600 text-white text-[11px] font-bold active:scale-95">
                {lang === 'kk' ? 'Қайталау' : 'Повторить'}
              </button>
            )}
          </div>
        )}

        {tab === 'plan' && !loading && needsNiche && businessId && (
          <NicheGate businessId={businessId} lang={lang} onDone={() => setNeedsNiche(false)} />
        )}

        {tab === 'plan' && loading && (
          <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 text-purple-600 animate-spin" /></div>
        )}

        {/* ── 1. Bir martalik so'rovnoma ── */}
        {tab === 'plan' && !loading && !needsNiche && showWizard && (
          <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 space-y-4">
            <div>
              <h2 className="text-sm font-black flex items-center gap-1.5"><Wand2 className="w-4 h-4 text-purple-600" />{L.wizTitle}</h2>
              <p className="text-[11px] text-slate-500 mt-0.5">{L.wizHint}</p>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-bold">1. {L.q1}</p>
              <div className="flex flex-wrap gap-1.5">
                {DIRECTIONS[lang].map((d) => (
                  <button key={d} onClick={() => setDirection(d)} className={chip(direction === d)}>{d}</button>
                ))}
              </div>
              <input value={DIRECTIONS[lang].includes(direction) ? '' : direction} onChange={(e) => setDirection(e.target.value)}
                maxLength={500} placeholder={L.own}
                className="w-full text-sm rounded-xl border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-200" />
            </div>

            <div className="space-y-2">
              <p className="text-xs font-bold">2. {L.q2}</p>
              <div className="flex flex-wrap gap-1.5">
                {GENRES[lang].map((g) => (
                  <button key={g} onClick={() => setGenre(g)} className={chip(genre === g)}>{g}</button>
                ))}
              </div>
              <input value={GENRES[lang].includes(genre) ? '' : genre} onChange={(e) => setGenre(e.target.value)}
                maxLength={200} placeholder={L.own}
                className="w-full text-sm rounded-xl border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-200" />
            </div>

            <div className="space-y-2">
              <p className="text-xs font-bold">3. {L.q3}</p>
              <div className="flex gap-1.5">
                <button onClick={() => setHasChar(true)} className={chip(hasChar === true)}>{L.yes}</button>
                <button onClick={() => { setHasChar(false); if (!heroChosen) autoHero(); }} className={chip(hasChar === false)}>{L.no}</button>
              </div>
              {hasChar === false && (
                <div className="space-y-2 rounded-xl bg-slate-50 border border-slate-100 p-2.5">
                  <p className="text-[10.5px] text-slate-600">{L.aiHint}</p>
                  {charBusy === 'text' ? (
                    <p className="text-[11px] text-slate-500 flex items-center gap-1.5"><Loader2 className="w-3.5 h-3.5 animate-spin text-purple-600" />{L.aiMaking}</p>
                  ) : heroChosen && heroCard}
                  <button onClick={autoHero} disabled={!!charBusy}
                    className="text-[11px] font-bold text-purple-700 flex items-center gap-1 disabled:opacity-50">
                    <RefreshCw className="w-3 h-3" />{L.aiAnother}
                  </button>
                  {charErr && <p className="text-[11px] font-semibold text-rose-600">{charErr}</p>}
                </div>
              )}
              {hasChar && (
                <div className="space-y-2.5 rounded-xl bg-slate-50 border border-slate-100 p-2.5">
                  <p className="text-[10.5px] text-purple-700 font-semibold">{L.oneHero}</p>

                  {/* Tanlangan qahramon */}
                  {heroChosen && heroCard}

                  <div>
                    <p className="text-[11px] font-bold mb-1">{L.note}</p>
                    <input value={charNote} onChange={(e) => setCharNote(e.target.value)} maxLength={300}
                      placeholder={L.notePh}
                      className="w-full text-sm rounded-xl border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-200" />
                  </div>

                  {heroChosen && !charMode && <p className="text-[10.5px] font-bold text-slate-500">{L.change}:</p>}
                  <div className="grid grid-cols-2 gap-1.5">
                    <button onClick={searchHeroes} disabled={!!charBusy}
                      className={`py-2 rounded-xl text-[11px] font-bold border flex items-center justify-center gap-1.5 disabled:opacity-50 ${
                        charMode === 'search' ? 'bg-purple-600 text-white border-purple-600' : 'bg-white border-slate-200'}`}>
                      {charBusy === 'search' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Library className="w-3.5 h-3.5" />}
                      {L.findPin}
                    </button>
                    <button onClick={() => { setCharMode(charMode === 'link' ? null : 'link'); setCandidates(null); setCharErr(''); }}
                      disabled={!!charBusy}
                      className={`py-2 rounded-xl text-[11px] font-bold border flex items-center justify-center gap-1.5 disabled:opacity-50 ${
                        charMode === 'link' ? 'bg-purple-600 text-white border-purple-600' : 'bg-white border-slate-200'}`}>
                      <Pencil className="w-3.5 h-3.5" />{L.pinLink}
                    </button>
                    <label className={`py-2 rounded-xl text-[11px] font-bold bg-white border border-slate-200 flex items-center justify-center gap-1.5 cursor-pointer ${
                      charBusy ? 'opacity-50 pointer-events-none' : ''}`}>
                      <Upload className="w-3.5 h-3.5" />{L.upload}
                      <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden"
                        onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadHero(f); e.target.value = ''; }} />
                    </label>
                    <button onClick={textHero} disabled={!!charBusy || !charNote.trim()}
                      className="py-2 rounded-xl text-[11px] font-bold bg-white border border-slate-200 flex items-center justify-center gap-1.5 disabled:opacity-40">
                      {charBusy === 'text' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Wand2 className="w-3.5 h-3.5" />}
                      {L.noPhoto}
                    </button>
                  </div>

                  {charMode === 'link' && (
                    <div className="flex gap-1.5">
                      <input value={pinLink} onChange={(e) => setPinLink(e.target.value)} maxLength={600} placeholder={L.pinLinkPh}
                        className="flex-1 min-w-0 text-sm rounded-xl border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-200" />
                      <button onClick={() => pickHero({ link: pinLink.trim() })} disabled={!pinLink.trim() || !!charBusy}
                        className="px-3 rounded-xl text-[11px] font-black bg-purple-600 text-white disabled:opacity-40 flex items-center gap-1">
                        {charBusy === 'pick' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}{L.usePin}
                      </button>
                    </div>
                  )}

                  {charMode === 'search' && charBusy === 'search' && (
                    <p className="text-[11px] text-slate-500 flex items-center gap-1.5"><Loader2 className="w-3.5 h-3.5 animate-spin" />{L.searching}</p>
                  )}
                  {charMode === 'search' && candidates && (
                    candidates.length === 0 ? (
                      <p className="text-[11px] text-slate-500">{L.nothing}</p>
                    ) : (
                      <div className="space-y-1.5">
                        <p className="text-[11px] font-bold">{L.pickOne}</p>
                        <div className="grid grid-cols-4 gap-1.5">
                          {candidates.map((c) => (
                            <button key={c.image_url} onClick={() => pickHero({ image_url: c.image_url })} disabled={!!charBusy}
                              title={c.title}
                              className="aspect-[3/4] rounded-lg overflow-hidden border-2 border-transparent hover:border-purple-500 bg-slate-100 disabled:opacity-50 active:scale-95">
                              <img src={c.image_url} alt={c.title} loading="lazy" referrerPolicy="no-referrer"
                                className="w-full h-full object-cover" />
                            </button>
                          ))}
                        </div>
                        <button onClick={searchHeroes} disabled={!!charBusy}
                          className="text-[11px] font-bold text-purple-700 flex items-center gap-1 disabled:opacity-50">
                          <RefreshCw className="w-3 h-3" />{L.more}
                        </button>
                      </div>
                    )
                  )}
                  {charBusy === 'pick' && (
                    <p className="text-[11px] text-slate-500 flex items-center gap-1.5"><Loader2 className="w-3.5 h-3.5 animate-spin" />{L.saving}</p>
                  )}
                  {charErr && <p className="text-[11px] font-semibold text-rose-600">{charErr}</p>}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <p className="text-xs font-bold">4. {L.q4}</p>
              <div className="flex gap-1.5">
                {([10, 15, 20] as const).map((n) => (
                  <button key={n} onClick={() => setSeconds(n)} className={chip(seconds === n)}>{L.sec(n)}</button>
                ))}
              </div>
              <p className="text-[10.5px] text-slate-500">{L.secHint}</p>
            </div>

            <div className="space-y-1">
              <p className="text-[11px] font-bold text-slate-500">{L.extra}</p>
              <input value={extra} onChange={(e) => setExtra(e.target.value)} maxLength={500} placeholder={L.extraPh}
                className="w-full text-sm rounded-xl border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-200" />
            </div>

            <div className="flex gap-2">
              {editing && (
                <button onClick={() => setEditing(false)} className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-slate-100">{L.cancel}</button>
              )}
              <button onClick={saveProfile} disabled={!canSave || saving}
                className="flex-1 py-2.5 rounded-xl text-xs font-black bg-purple-600 text-white flex items-center justify-center gap-1.5 disabled:opacity-40">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                {saving ? L.saving : L.save}
              </button>
            </div>
          </div>
        )}

        {/* ── 2. Vaqt tanlash (reja yo'q) ── */}
        {tab === 'plan' && !loading && !needsNiche && !showWizard && plan && !planActive && (
          <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 space-y-3">
            <h2 className="text-sm font-black flex items-center gap-1.5"><Clock className="w-4 h-4 text-purple-600" />{L.timesTitle}</h2>
            <p className="text-[11.5px] text-slate-700 font-semibold">{L.cadence(plan.cadence)}</p>
            <div className="flex gap-2">
              {Array.from({ length: plan.cadence.per_day }).map((_, i) => (
                <label key={i} className="flex-1">
                  <span className="text-[10.5px] font-bold text-slate-500">{L.time}{plan.cadence.per_day > 1 ? ` ${i + 1}` : ''}</span>
                  <input type="time" value={times[i]} onChange={(e) => setTimes((t) => t.map((x, k) => (k === i ? e.target.value : x)))}
                    className="mt-1 w-full text-sm rounded-xl border border-slate-200 px-3 py-2" />
                </label>
              ))}
            </div>
            <p className="text-[11px] text-slate-500">{L.timesHint}</p>
            <button onClick={startPlan} disabled={starting}
              className="w-full py-3 rounded-xl text-sm font-black bg-purple-600 text-white flex items-center justify-center gap-2 disabled:opacity-40">
              {starting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CalendarClock className="w-4 h-4" />}
              {starting ? L.starting : L.start}
            </button>
            <button onClick={() => setEditing(true)} className="w-full text-[11px] font-bold text-purple-700 flex items-center justify-center gap-1">
              <Pencil className="w-3 h-3" />{L.editStyle}
            </button>
          </div>
        )}

        {/* ── 3. Faol reja: kelgusi videolar va ssenariylar ── */}
        {tab === 'plan' && !loading && !needsNiche && !showWizard && plan && planActive && (
          <>
            <div className="bg-white border border-slate-200/90 rounded-2xl p-3 flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xs font-black">{L.upcoming}</p>
                <p className="text-[10.5px] text-slate-500 truncate">
                  {L.cadence(plan.cadence)} {plan.settings?.times?.slice(0, plan.cadence.per_day).join(', ')} · ≤ {L.sec(profile?.seconds || 10)}
                </p>
              </div>
              <div className="flex flex-col gap-1 shrink-0">
                <button onClick={() => setEditing(true)} className="text-[10.5px] font-bold text-purple-700">{L.editStyle}</button>
                <button onClick={stopPlan} className="text-[10.5px] font-bold text-rose-600">{L.stop}</button>
              </div>
            </div>

            {visiblePlan.map((it) => {
              const isOpen = open === it.id;
              return (
                <div key={it.id} className="bg-white border border-slate-200/90 rounded-2xl p-3 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-black text-purple-700 flex items-center gap-1">
                      <CalendarClock className="w-3.5 h-3.5" />{localWhen(it.scheduled_at, lang)}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      it.status === 'published' ? 'bg-emerald-50 text-emerald-700'
                        : it.status === 'scheduled' ? 'bg-sky-50 text-sky-700'
                        : it.status === 'failed' ? 'bg-rose-50 text-rose-700' : 'bg-slate-100 text-slate-600'}`}>
                      {it.status === 'published' ? L.published : it.status === 'scheduled' ? L.ready
                        : it.status === 'failed' ? L.failed : it.scenario ? L.scenario : '…'}
                    </span>
                  </div>

                  {/* Video turi va uzunligi: yuz (haftada 1) / to'liq bo'y / so'zsiz + musiqa */}
                  {it.topic && (it.style || it.seconds) && (
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {it.style && (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                          it.style === 'silent' ? 'bg-amber-50 text-amber-700'
                            : it.style === 'closeup' ? 'bg-pink-50 text-pink-700' : 'bg-violet-50 text-violet-700'}`}>
                          {it.style === 'silent' ? L.styleSilent : it.style === 'closeup' ? L.styleCloseup : L.styleWide}
                        </span>
                      )}
                      {!!it.seconds && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">{L.sec(it.seconds)}</span>
                      )}
                    </div>
                  )}

                  {it.topic ? (
                    <button onClick={() => setOpen(isOpen ? null : it.id)} className="w-full text-left flex items-start justify-between gap-2">
                      <span className="text-[12.5px] font-bold leading-snug">{it.topic}</span>
                      {it.scenario && (isOpen ? <ChevronUp className="w-4 h-4 shrink-0 text-slate-400" /> : <ChevronDown className="w-4 h-4 shrink-0 text-slate-400" />)}
                    </button>
                  ) : (
                    <p className="text-[11px] text-slate-500 flex items-center gap-1.5">
                      {it.id === nextDraftId && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                      {it.id === nextDraftId ? L.preparing : L.pendingScript}
                    </p>
                  )}

                  {isOpen && it.scenario && (
                    <div className="rounded-xl bg-slate-50 border border-slate-100 p-2.5 text-[12px] leading-relaxed text-slate-700 whitespace-pre-line">
                      {it.scenario}
                    </div>
                  )}

                  {it.video_url && (
                    <video src={it.video_url} controls playsInline preload="metadata" className="w-full max-w-[220px] mx-auto aspect-[9/16] rounded-xl bg-black" />
                  )}

                  {it.status === 'draft' && it.scenario && (
                    <div className="flex items-center gap-1.5">
                      {(['kk', 'ru'] as const).map((l) => (
                        <button key={l} onClick={() => switchLang(it, l)} disabled={langBusy === it.id}
                          className={`px-3 py-1 rounded-lg text-[11px] font-black border active:scale-95 ${
                            (it.lang || 'kk') === l ? 'bg-purple-600 text-white border-purple-600' : 'bg-white text-slate-600 border-slate-200'}`}>
                          {l === 'kk' ? 'ҚАЗ' : 'РУС'}
                        </button>
                      ))}
                      {langBusy === it.id && <Loader2 className="w-3.5 h-3.5 text-purple-600 animate-spin" />}
                    </div>
                  )}

                  {it.status === 'draft' && it.scenario && (
                    <button onClick={() => { setAskFor(it); setWish(''); }}
                      className="w-full py-2 rounded-xl text-[11.5px] font-bold bg-purple-50 text-purple-700 border border-purple-200 flex items-center justify-center gap-1.5">
                      <RefreshCw className="w-3.5 h-3.5" />{L.other}
                    </button>
                  )}
                </div>
              );
            })}
          </>
        )}

        {/* ── Videolarim ── */}
        {tab === 'library' && (
          <div className="space-y-3">
            {videos.length === 0 && (
              <div className="bg-white border border-slate-200 rounded-2xl p-6 text-center text-sm text-slate-500">
                <Film className="w-8 h-8 mx-auto mb-2 text-slate-300" />{L.empty}
              </div>
            )}
            <div className="grid grid-cols-2 gap-2.5">
              {videos.map((v) => (
                <div key={v.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                  <video src={v.video_url} controls playsInline preload="metadata" className="w-full aspect-[9/16] bg-black" />
                  <div className="p-2">
                    <p className="text-[11px] font-semibold text-slate-800 line-clamp-2">{v.content}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{formatDay(v.created_at, language)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* "Boshqa tuz" — avval so'raydi */}
      {askFor && (
        <div className="absolute inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50" onClick={() => !regenerating && setAskFor(null)}>
          <div className="bg-white w-full max-w-[480px] rounded-t-3xl sm:rounded-3xl p-4 space-y-3" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black">{L.askTitle}</h3>
              <button onClick={() => !regenerating && setAskFor(null)} className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-[11px] text-slate-500 line-clamp-2">{askFor.topic}</p>
            <textarea value={wish} onChange={(e) => setWish(e.target.value)} rows={3} maxLength={1000} placeholder={L.askPh}
              disabled={regenerating}
              className="w-full text-sm rounded-xl border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-200 resize-none" />
            {regenerating ? (
              <p className="text-xs font-semibold text-purple-700 flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" />{L.writing}</p>
            ) : (
              <div className="flex gap-2">
                <button onClick={() => regenerate(false)} className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-slate-100">{L.byAi}</button>
                <button onClick={() => regenerate(true)} disabled={!wish.trim()}
                  className="flex-1 py-2.5 rounded-xl text-xs font-black bg-purple-600 text-white disabled:opacity-40">{L.byWish}</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
