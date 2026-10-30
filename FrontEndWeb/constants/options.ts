export const MBTI_OPTIONS = [
  "INFJ",
  "INFP",
  "ENFJ",
  "ENFP",
  "ISTJ",
  "ISFJ",
  "ESTJ",
  "ESFJ",
  "INTJ",
  "INTP",
  "ENTJ",
  "ENTP",
  "ISTP",
  "ISFP",
  "ESTP",
  "ESFP",
] as const;

export const COMPANION_OPTIONS = [
  "혼자",
  "친구와",
  "연인과",
  "가족과",
  "아이와",
  "부모님과",
] as const;

export const COMPANION_LABELS = {
  ko: {
    혼자: "혼자",
    친구와: "친구와",
    연인과: "연인과",
    가족과: "가족과",
    아이와: "아이와",
    부모님과: "부모님과",
  },
  en: {
    혼자: "Solo",
    친구와: "With Friends",
    연인과: "Couple",
    가족과: "With Family",
    아이와: "With Kids",
    부모님과: "With Parents",
  },
} as const;

export const TRANSPORT_OPTIONS = [
  "대중교통",
  "자차/렌트카",
  "도보",
  "자전거",
] as const;

export const TRANSPORT_LABELS = {
  ko: {
    대중교통: "대중교통",
    "자차/렌트카": "자차/렌트카",
    도보: "도보",
    자전거: "자전거",
  },
  en: {
    대중교통: "Public Transit",
    "자차/렌트카": "Car / Rental",
    도보: "Walking",
    자전거: "Bicycle",
  },
} as const;

export type MBTI = (typeof MBTI_OPTIONS)[number];
export type COMPANION = (typeof COMPANION_OPTIONS)[number];
export type TRANSPORT = (typeof TRANSPORT_OPTIONS)[number];
