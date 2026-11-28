// Eksperiment o'lchovlari va variantlari nomlari (services/creative_playbook.py VIDEO_FORMATS / HOOK_HINTS).
// Sayt: Desktop\operon\src\lib\expLabels.ts — bir xil.
type Tx = { uz: string; ru: string; kk: string };

export const DIM_LABEL: Record<string, Tx> = {
  format: { uz: "Video formati", ru: 'Формат видео', kk: 'Бейне форматы' },
  hook: { uz: "Birinchi 2 soniya (ilgak)", ru: 'Первые 2 секунды (крючок)', kk: 'Алғашқы 2 секунд (ілмек)' },
  seconds: { uz: "Davomiylik", ru: 'Длина', kk: 'Ұзындығы' },
  hour: { uz: "Chiqish vaqti", ru: 'Время выхода', kk: 'Шығу уақыты' },
  cta: { uz: "Yakuniy chaqiriq", ru: 'Призыв в конце', kk: 'Соңындағы шақыру' },
  delivery: { uz: "Taqdimot", ru: 'Подача', kk: 'Беру тәсілі' },
  music: { uz: "Musiqa", ru: 'Музыка', kk: 'Музыка' },
};

const ARM: Record<string, Tx> = {
  myth_bust: { uz: "Afsonani buzish", ru: 'Разрушение мифа', kk: 'Мифті бұзу' },
  quick_tip: { uz: "Tez maslahat", ru: 'Быстрый совет', kk: 'Жылдам кеңес' },
  answer_question: { uz: "Mijoz savoliga javob", ru: 'Ответ на вопрос клиента', kk: 'Клиент сұрағына жауап' },
  scenario_pov: { uz: "POV sahnasi", ru: 'Сценка POV', kk: 'POV көрінісі' },
  show_test: { uz: "Tekshirish / test", ru: 'Проверка / тест', kk: 'Тексеру / тест' },
  this_or_that: { uz: "Bu yoki u", ru: 'Это или то', kk: 'Мынау ма, анау ма' },
  behind_scenes: { uz: "Kadr ortida", ru: 'За кадром', kk: 'Кадр сыртында' },
  checklist: { uz: "Chek-list", ru: 'Чек-лист', kk: 'Чек-лист' },
  new_arrival: { uz: "Yangi mahsulot", ru: 'Новинка', kk: 'Жаңа тауар' },
  in_real_life: { uz: "Haqiqiy hayotda", ru: 'В жизни', kk: 'Өмірде' },
  silent_text: { uz: "So'zsiz, matn + musiqa", ru: 'Без слов, текст + музыка', kk: 'Сөзсіз, мәтін + музыка' },
  giant_product: { uz: "Shaharda ulkan mahsulot", ru: 'Гигантский товар в городе', kk: 'Қаладағы алып тауар' },
  miniature_world: { uz: "Mahsulotda mini-dunyo", ru: 'Мини-мир на товаре', kk: 'Тауардағы шағын әлем' },
  texture_asmr: { uz: "Tekstura yirik planda (ilmoq)", ru: 'Текстура крупно (петля)', kk: 'Жақын текстура (цикл)' },
  billboard_breakout: { uz: "Bilbord jonlanadi", ru: 'Билборд оживает', kk: 'Билборд жанданады' },
  mechanical_toy: { uz: "Mexanik o'yinchoq", ru: 'Механическая игрушка', kk: 'Механикалық ойыншық' },
  style_remix: { uz: "Qahramon yangi uslubda (seriya)", ru: 'Герой в новом стиле (серия)', kk: 'Кейіпкер жаңа стильде (серия)' },
  craft_reveal: { uz: "Jarayon → tayyor mahsulot", ru: 'Процесс → готовый товар', kk: 'Процесс → дайын тауар' },
  popup_catalog: { uz: "Ochiladigan katalog-kitob", ru: 'Каталог-книжка pop-up', kk: 'Ашылатын каталог-кітап' },
  mascot_runway: { uz: "Qahramon podiumda (lookbook)", ru: 'Герой на подиуме (лукбук)', kk: 'Кейіпкер подиумда (лукбук)' },
  escalator_parade: { uz: "Eskalator paradi (loop)", ru: 'Парад на эскалаторе (петля)', kk: 'Эскалатор парады (цикл)' },
  upbeat: { uz: "Energetik", ru: 'Энергичная', kk: 'Серпінді' },
  chill: { uz: "Sokin", ru: 'Спокойная', kk: 'Тыныш' },
  funny: { uz: "Quvnoq", ru: 'Весёлая', kk: 'Көңілді' },
  elegant: { uz: "Nafis", ru: 'Элегантная', kk: 'Талғампаз' },
  warm: { uz: "Iliq", ru: 'Тёплая', kk: 'Жылы' },
  quality_switch: { uz: '144p → 1080p', ru: '144p → 1080p', kk: '144p → 1080p' },
  cartoon_cameo: { uz: "Ertak multfilm", ru: 'Сказочный мультфильм', kk: 'Ертегі мультфильм' },
  cozy_loop: { uz: "Qahramon bilan yoqimli loop", ru: 'Уютная петля с героем', kk: 'Кейіпкермен жайлы цикл' },
  mascot_drama: { uz: "Qahramon bilan serial", ru: 'Сериал с героем', kk: 'Кейіпкер сериалы' },
  pov_meme: { uz: "POV-mem", ru: 'POV-мем', kk: 'POV-мем' },
  talking_product: { uz: "Gapiradigan mahsulot", ru: 'Говорящий товар', kk: 'Сөйлейтін тауар' },
  exploded_view: { uz: "Nimadan tayyorlangan", ru: 'Из чего сделано', kk: 'Неден жасалған' },
  product_drop: { uz: "Mahsulot yaqindan", ru: 'Товар крупным планом', kk: 'Тауар жақыннан' },
  customer_answer: { uz: "Mijoz savoliga javob", ru: 'Ответ на вопрос клиента', kk: 'Клиент сұрағына жауап' },
  why_started: { uz: "Nega boshladim", ru: 'Почему я начал(а)', kk: 'Неге бастадым' },
  owner_values: { uz: "Bizning qoidamiz", ru: 'Наше правило', kk: 'Біздің ереже' },
  diagnostic: { uz: "Tomoshabinga tashxis", ru: 'Диагноз зрителю', kk: 'Көрерменге диагноз' },
  contrarian: { uz: "Hammaga qarshi", ru: 'Против всех', kk: 'Бәріне қарсы' },
  scenario: { uz: "Sahna", ru: 'Сценка', kk: 'Көрініс' },
  result_first: { uz: "Avval natija", ru: 'Сначала результат', kk: 'Алдымен нәтиже' },
  mistake: { uz: "Keng tarqalgan xato", ru: 'Частая ошибка', kk: 'Жиі қате' },
  question: { uz: "Savol", ru: 'Вопрос', kk: 'Сұрақ' },
  open_loop: { uz: "Intriga", ru: 'Интрига', kk: 'Интрига' },
  callout: { uz: "O'zlarga murojaat", ru: 'Обращение к своим', kk: 'Өз аудиториясына үндеу' },
  authentic: { uz: "Halol, boricha", ru: 'Честно, как есть', kk: 'Шынайы' },
  silent: { uz: "So'zsiz", ru: 'Без слов', kk: 'Сөзсіз' },
  talk: { uz: "Kadrda gapiradi", ru: 'Говорит в кадре', kk: 'Кадрда сөйлейді' },
  voiceover: { uz: "Kadr ortida ovoz", ru: 'Голос за кадром', kk: 'Кадр сыртындағы дауыс' },
  telegram: { uz: "Telegramga chaqiramiz", ru: 'Зовём в Telegram', kk: 'Telegram-ға шақыру' },
  other: { uz: "Kommentariya / Direct", ru: 'Комментарий / Direct', kk: 'Пікір / Direct' },
  none: { uz: "Chaqiriqsiz", ru: 'Без призыва', kk: 'Шақырусыз' },
};

export function armLabel(dim: string, key: string, lang: 'uz' | 'ru' | 'kk'): string {
  if (dim === 'seconds') return `${key} ${(lang === 'uz' ? "sek" : lang === 'kk' ? 'сек' : 'сек')}`;
  if (dim === 'hour') return `${key}:00–${String((parseInt(key, 10) + 3) % 24).padStart(2, '0')}:00`;
  return ARM[key]?.[lang] || key;
}

export const STATUS_LABEL: Record<string, Tx> = {
  winner: { uz: "Ishlaydi — ko'proq", ru: 'Работает — чаще', kk: 'Жұмыс істейді — жиірек' },
  ok: { uz: "O'rtacha", ru: 'Средне', kk: 'Орташа' },
  weak: { uz: "Kuchsiz — kamroq", ru: 'Слабо — реже', kk: 'Әлсіз — сирек' },
  retired: { uz: "Deyarli ko'rilmaydi — deyarli ishlatilmaydi", ru: 'Почти не смотрят — почти не используем', kk: 'Көрмейді — дерлік қолданбаймыз' },
  testing: { uz: "Tekshiramiz", ru: 'Проверяем', kk: 'Тексеріп жатырмыз' },
};
