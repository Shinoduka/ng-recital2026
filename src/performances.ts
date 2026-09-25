export type Performance = {
  id: string;
  title: string;
  genre: string;
  type: "official" | "voluntary";
  instructors: string[];
  description: string;
  accent: string;
  members: { id: string; name: string; photo?: string }[];
  cover?: string;
};

// デモ用データ。cover / photo に画像URLを設定すると写真を表示します。
export const performances: Performance[] = [
  {
    id: "M01", title: "CROSS THE LINES", genre: "HIPHOP × LOCK", type: "official",
    instructors: ["INSTRUCTOR A", "INSTRUCTOR B"], accent: "#7bdcff",
    description: "異なる個性が交わるとき、新しい表現が生まれる。二つのスタイルがひとつのステージで出会い、まだ見たことのない景色へ進んでいく。",
    members: ["MEMBER 01", "MEMBER 02", "MEMBER 03", "MEMBER 04", "MEMBER 05", "MEMBER 06"].map((name, i) => ({ id: `m01-${i}`, name })),
  },
  {
    id: "M02", title: "AFTERGLOW", genre: "JAZZ", type: "official",
    instructors: ["INSTRUCTOR C", "INSTRUCTOR D"], accent: "#f3a4d9",
    description: "重なり合う感情が、ひとつの光になる。11年目のその先へ、私たちだけの軌跡を描く。",
    members: ["MEMBER 07", "MEMBER 08", "MEMBER 09", "MEMBER 10"].map((name, i) => ({ id: `m02-${i}`, name })),
  },
  {
    id: "M03", title: "OWN WAY", genre: "HOUSE", type: "voluntary",
    instructors: [], accent: "#ffb977",
    description: "自分たちで選んだ音と道。自由な発想が集まって、今だけのダンスを生み出す。",
    members: ["MEMBER 11", "MEMBER 12", "MEMBER 13", "MEMBER 14", "MEMBER 15"].map((name, i) => ({ id: `m03-${i}`, name })),
  },
  {
    id: "M04", title: "UNBOUND", genre: "WAACK", type: "voluntary",
    instructors: [], accent: "#b9a0ff",
    description: "誰かの正解ではなく、自分たちの表現を。伸びていく線の先には、まだ知らない可能性がある。",
    members: ["MEMBER 16", "MEMBER 17", "MEMBER 18", "MEMBER 19"].map((name, i) => ({ id: `m04-${i}`, name })),
  },
];
