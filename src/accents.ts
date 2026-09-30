/** accent はこの8色から選択します。順序は 白・黄色・緑・赤・紫・ピンク・青・オレンジ。 */
export const accents = [
  { name: "white", label: "白", hex: "#FFFFFF" },
  { name: "yellow", label: "黄色", hex: "#FFD84D" },
  { name: "green", label: "緑", hex: "#57D98D" },
  { name: "red", label: "赤", hex: "#FF6670" },
  { name: "purple", label: "紫", hex: "#B9A0FF" },
  { name: "pink", label: "ピンク", hex: "#F3A4D9" },
  { name: "blue", label: "青", hex: "#7BDCFF" },
  { name: "orange", label: "オレンジ", hex: "#FFB977" },
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