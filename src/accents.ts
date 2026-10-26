/** accent はこの8色から選択します。順序は 白・黄色・緑・赤・紫・ピンク・青・オレンジ。 */
export const accents = [
  { name: "white", label: "白", hex: "#FFFFFF", genre: "ALL" },
  { name: "yellow", label: "黄色", hex: "#FFD84D", genre: "HIPHOP"},
  { name: "green", label: "緑", hex: "#57D98D", genre: "POP" },
  { name: "red", label: "赤", hex: "#FF6670", genre: "" },
  { name: "purple", label: "紫", hex: "#B9A0FF", genre: "WAACK" },
  { name: "pink", label: "ピンク", hex: "#F3A4D9", genre: "JAZZHIPHOP" },
  { name: "blue", label: "青", hex: "#7BDCFF", genre: "LOCK" },
  { name: "orange", label: "オレンジ", hex: "#FFB977", genre: "FREESTYLE" },
] as const;

export type Accent = (typeof accents)[number]["hex"];
export type AccentName = (typeof accents)[number]["name"];

export const getAccent = (name: AccentName): Accent => {
  const accent = accents.find((accent) => accent.name === name);

  if (!accent) {
    throw new Error(`Accentが見つかりません: "${name}"`);
  }

  return accent.hex;
};