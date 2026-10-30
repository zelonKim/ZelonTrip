export const TRIP_STYLE_TAGS = [
  "🎯 명소 탐방",
  "☕️ 힙한 카페 투어",
  "🌿 힐링·자연",
  "🏃 액티비티·체험",
  "🛍️ 쇼핑 중심",
  "📸 인스타 감성",
  "🎨 전시·문화",
] as const;

export const TENDENCY_TAGS = [
  "💸 가성비 중시",
  "👑 럭셔리",
  "🍺 음주 가능",
  "🤫 숨겨진 맛집",
  "🗿 현지 로컬 식당",
] as const;

export type TripStyleTag = (typeof TRIP_STYLE_TAGS)[number];
export type TendencyTag = (typeof TENDENCY_TAGS)[number];

// 여행 스타일 태그 번역 매핑
export const TRIP_STYLE_TRANSLATIONS: Record<
  TripStyleTag,
  { ko: string; en: string }
> = {
  "🎯 명소 탐방": { ko: "🎯 명소 탐방", en: "🎯 Landmarks & Sightseeing" },
  "☕️ 힙한 카페 투어": {
    ko: "☕️ 힙한 카페 투어",
    en: "☕️ Trendy Cafe Hopping",
  },
  "🌿 힐링·자연": { ko: "🌿 힐링·자연", en: "🌿 Healing & Nature" },
  "🏃 액티비티·체험": {
    ko: "🏃 액티비티·체험",
    en: "🏃 Activities & Experiences",
  },
  "🛍️ 쇼핑 중심": { ko: "🛍️ 쇼핑 중심", en: "🛍️ Shopping Spree" },
  "📸 인스타 감성": { ko: "📸 인스타 감성", en: "📸 Instagrammable Spots" },
  "🎨 전시·문화": { ko: "🎨 전시·문화", en: "🎨 Exhibitions & Culture" },
};

// 식당 성향 태그 번역 매핑
export const TENDENCY_TRANSLATIONS: Record<
  TendencyTag,
  { ko: string; en: string }
> = {
  "💸 가성비 중시": { ko: "💸 가성비 중시", en: "💸 Budget-Friendly / Value" },
  "👑 럭셔리": { ko: "👑 럭셔리", en: "👑 Fine Dining & Luxury" },
  "🍺 음주 가능": { ko: "🍺 음주 가능", en: "🍺 Drinks & Pubs Welcome" },
  "🤫 숨겨진 맛집": { ko: "🤫 숨겨진 맛집", en: "🤫 Hidden Gems" },
  "🗿 현지 로컬 식당": {
    ko: "🗿 현지 로컬 식당",
    en: "🗿 Authentic Local Eats",
  },
};
