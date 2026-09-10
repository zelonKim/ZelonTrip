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

export const TRANSPORT_OPTIONS = [
  "대중교통",
  "자차/렌트카",
  "도보",
  "자전거",
] as const;


export type MBTI = (typeof MBTI_OPTIONS)[number];

export type COMPANION = (typeof COMPANION_OPTIONS)[number];

export type TRANSPORT = (typeof TRANSPORT_OPTIONS)[number];
