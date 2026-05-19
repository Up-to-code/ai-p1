import type { PromptChipData } from "@/conversation/components/PromptChips";

type PromptLocale = "ar" | "en" | "fr";

type PlacePrompt = {
  id: string;
  name: string;
  tag: string;
  query: string;
};

const PLACE_PROMPTS: Record<PromptLocale, PlacePrompt[]> = {
  ar: [
    {
      id: "new_cairo",
      name: "القاهرة الجديدة",
      tag: "فيلات وكومباوند",
      query: "ورّيني عقارات في القاهرة الجديدة، خصوصًا الفيلات والكومباوندات",
    },
    {
      id: "sheikh_zayed",
      name: "الشيخ زايد",
      tag: "كمبوندات مغلقة",
      query: "دورلي على شقق داخل كمبوندات مغلقة في الشيخ زايد",
    },
    {
      id: "maadi",
      name: "المعادي",
      tag: "هادية وقريبة",
      query: "إيه أفضل الفيلات والبيوت المعروضة للبيع في المعادي؟",
    },
    {
      id: "new_capital",
      name: "العاصمة الجديدة",
      tag: "استثمار وعائد",
      query: "ورّيني فرص استثمارية قوية في العاصمة الإدارية الجديدة",
    },
    {
      id: "north_coast",
      name: "الساحل الشمالي",
      tag: "شاطئ ومصيف",
      query: "دورلي على شاليهات وفيلات مميزة في الساحل الشمالي",
    },
    {
      id: "october",
      name: "6 أكتوبر",
      tag: "عائلي وسعره معقول",
      query: "ورّيني شقق وكمبوندات مناسبة للعائلات في 6 أكتوبر",
    },
    {
      id: "deep_search",
      name: "بحث سوق عميق",
      tag: "تحليل وبيانات",
      query: "اعمل بحث سوق عميق عن العقارات الفاخرة ذات أفضل عائد استثماري في شرق القاهرة",
    },
  ],
  en: [
    {
      id: "new_cairo",
      name: "New Cairo",
      tag: "Villas & Compounds",
      query: "Show me properties in New Cairo — villas and compounds",
    },
    {
      id: "sheikh_zayed",
      name: "Sheikh Zayed",
      tag: "Gated Communities",
      query: "Find gated compound apartments in Sheikh Zayed City",
    },
    {
      id: "maadi",
      name: "Maadi",
      tag: "Leafy Suburb · Nile Views",
      query: "What are the best villas and houses for sale in Maadi?",
    },
    {
      id: "new_capital",
      name: "New Capital",
      tag: "Rising City · Best ROI",
      query: "Show investment opportunities in the New Administrative Capital",
    },
    {
      id: "north_coast",
      name: "North Coast",
      tag: "Sahel · Beachfront",
      query: "Find beach chalets and villas on Egypt's North Coast",
    },
    {
      id: "october",
      name: "6th October",
      tag: "Affordable · Family",
      query: "Show family apartments and compounds in 6th October City",
    },
    {
      id: "deep_search",
      name: "Deep Market Search",
      tag: "Analysis · Data",
      query: "Perform a deep market search for luxury properties with the best ROI in East Cairo",
    },
  ],
  fr: [
    {
      id: "new_cairo",
      name: "Nouveau Caire",
      tag: "Villas et compounds",
      query: "Montre-moi des biens au Nouveau Caire, surtout des villas et des compounds",
    },
    {
      id: "sheikh_zayed",
      name: "Sheikh Zayed",
      tag: "Résidences sécurisées",
      query: "Trouve des appartements en résidence fermée à Sheikh Zayed",
    },
    {
      id: "maadi",
      name: "Maadi",
      tag: "Calme et verdoyant",
      query: "Quelles sont les meilleures villas et maisons à vendre à Maadi ?",
    },
    {
      id: "new_capital",
      name: "Nouvelle Capitale",
      tag: "Croissance et rendement",
      query: "Montre-moi les meilleures opportunités d’investissement dans la Nouvelle Capitale Administrative",
    },
    {
      id: "north_coast",
      name: "North Coast",
      tag: "Plage et été",
      query: "Trouve des chalets et villas en bord de mer sur la côte nord de l’Égypte",
    },
    {
      id: "october",
      name: "6 Octobre",
      tag: "Familial et accessible",
      query: "Montre-moi des appartements et compounds familiaux à 6 Octobre",
    },
    {
      id: "deep_search",
      name: "Recherche de marché",
      tag: "Analyse et données",
      query: "Fais une recherche de marché approfondie sur les biens de luxe avec le meilleur rendement dans l’est du Caire",
    },
  ],
};

export const EDITING_COPY: Record<PromptLocale, { label: string; cancel: string }> = {
  ar: { label: "تعديل الرسالة", cancel: "إلغاء" },
  en: { label: "Editing message", cancel: "Cancel" },
  fr: { label: "Modification du message", cancel: "Annuler" },
};

export const EXPANDED_COPY: Record<PromptLocale, { title: string; done: string; placeholder: string }> = {
  ar: { title: "اكتب براحتك", done: "تم", placeholder: "اكتب سؤالك أو تفاصيل طلبك..." },
  en: { title: "Write in detail", done: "Done", placeholder: "Write your question or details..." },
  fr: { title: "Écrire en détail", done: "Terminé", placeholder: "Écris ta question ou les détails..." },
};

export function getPreparedPlacePrompts(
  locale: PromptLocale,
  setDraftText: (value: string) => void,
): PromptChipData[] {
  return PLACE_PROMPTS[locale].map((prompt) => ({
    id: prompt.id,
    label: prompt.name,
    tag: prompt.tag,
    onPress: () => setDraftText(prompt.query),
  }));
}
