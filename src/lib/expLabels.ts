// Eksperiment o'lchovlari va variantlari nomlari (services/creative_playbook.py VIDEO_FORMATS / HOOK_HINTS).
// Sayt: Desktop\operon\src\lib\expLabels.ts — bir xil.
type Tx = { ru: string; kk: string };

export const DIM_LABEL: Record<string, Tx> = {
  format: { ru: 'Формат видео', kk: 'Бейне форматы' },
  hook: { ru: 'Первые 2 секунды (крючок)', kk: 'Алғашқы 2 секунд (ілмек)' },
  seconds: { ru: 'Длина', kk: 'Ұзындығы' },
  hour: { ru: 'Время выхода', kk: 'Шығу уақыты' },
  cta: { ru: 'Призыв в конце', kk: 'Соңындағы шақыру' },
  delivery: { ru: 'Подача', kk: 'Беру тәсілі' },
};

const ARM: Record<string, Tx> = {
  myth_bust: { ru: 'Разрушение мифа', kk: 'Мифті бұзу' },
  quick_tip: { ru: 'Быстрый совет', kk: 'Жылдам кеңес' },
  answer_question: { ru: 'Ответ на вопрос клиента', kk: 'Клиент сұрағына жауап' },
  scenario_pov: { ru: 'Сценка POV', kk: 'POV көрінісі' },
  show_test: { ru: 'Проверка / тест', kk: 'Тексеру / тест' },
  this_or_that: { ru: 'Это или то', kk: 'Мынау ма, анау ма' },
  behind_scenes: { ru: 'За кадром', kk: 'Кадр сыртында' },
  checklist: { ru: 'Чек-лист', kk: 'Чек-лист' },
  new_arrival: { ru: 'Новинка', kk: 'Жаңа тауар' },
  in_real_life: { ru: 'В жизни', kk: 'Өмірде' },
  silent_text: { ru: 'Без слов, текст + музыка', kk: 'Сөзсіз, мәтін + музыка' },
  diagnostic: { ru: 'Диагноз зрителю', kk: 'Көрерменге диагноз' },
  contrarian: { ru: 'Против всех', kk: 'Бәріне қарсы' },
  scenario: { ru: 'Сценка', kk: 'Көрініс' },
  result_first: { ru: 'Сначала результат', kk: 'Алдымен нәтиже' },
  mistake: { ru: 'Частая ошибка', kk: 'Жиі қате' },
  question: { ru: 'Вопрос', kk: 'Сұрақ' },
  open_loop: { ru: 'Интрига', kk: 'Интрига' },
  callout: { ru: 'Обращение к своим', kk: 'Өз аудиториясына үндеу' },
  authentic: { ru: 'Честно, как есть', kk: 'Шынайы' },
  silent: { ru: 'Без слов', kk: 'Сөзсіз' },
  talk: { ru: 'Говорит в кадре', kk: 'Кадрда сөйлейді' },
  voiceover: { ru: 'Голос за кадром', kk: 'Кадр сыртындағы дауыс' },
  telegram: { ru: 'Зовём в Telegram', kk: 'Telegram-ға шақыру' },
  other: { ru: 'Комментарий / Direct', kk: 'Пікір / Direct' },
  none: { ru: 'Без призыва', kk: 'Шақырусыз' },
};

export function armLabel(dim: string, key: string, lang: 'ru' | 'kk'): string {
  if (dim === 'seconds') return `${key} ${lang === 'kk' ? 'сек' : 'сек'}`;
  if (dim === 'hour') return `${key}:00–${String((parseInt(key, 10) + 3) % 24).padStart(2, '0')}:00`;
  return ARM[key]?.[lang] || key;
}

export const STATUS_LABEL: Record<string, Tx> = {
  winner: { ru: 'Работает — чаще', kk: 'Жұмыс істейді — жиірек' },
  ok: { ru: 'Средне', kk: 'Орташа' },
  weak: { ru: 'Слабо — реже', kk: 'Әлсіз — сирек' },
  retired: { ru: 'Почти не смотрят — почти не используем', kk: 'Көрмейді — дерлік қолданбаймыз' },
  testing: { ru: 'Проверяем', kk: 'Тексеріп жатырмыз' },
};
