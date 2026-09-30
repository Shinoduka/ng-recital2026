import { accents, type Accent } from "./accents";
import { getMembers, type Member } from "./members";

export type Performance = {
  id: string;
  title: string;
  genre: string;
  type: "official" | "voluntary";
  instructors: string[];
  description: string;
  accent: Accent;
  members: Member[];
  cover?: string;
};

// デモ用データ。出演者の名前・写真は members.ts、色は accents.ts で管理します。
export const performances: Performance[] = [
  {
    id: "M01", title: "CROSS THE LINES", genre: "HIPHOP × LOCK", type: "official",
    instructors: ["INSTRUCTOR A", "INSTRUCTOR B"], accent: accents[6].hex,
    description: "異なる個性が交わるとき、新しい表現が生まれる。二つのスタイルがひとつのステージで出会い、まだ見たことのない景色へ進んでいく。",
    members: getMembers(["member-001", "member-002", "member-003", "member-004", "member-005", "member-006"]),
  },
  {
    id: "M02", title: "AFTERGLOW", genre: "JAZZ", type: "official",
    instructors: ["INSTRUCTOR C", "INSTRUCTOR D"], accent: accents[5].hex,
    description: "重なり合う感情が、ひとつの光になる。11年目のその先へ、私たちだけの軌跡を描く。",
    members: getMembers(["member-007", "member-008", "member-009", "member-010"]),
  },
  {
    id: "M03", title: "OWN WAY", genre: "HOUSE", type: "voluntary",
    instructors: [], accent: accents[7].hex,
    description: "自分たちで選んだ音と道。自由な発想が集まって、今だけのダンスを生み出す。",
    members: getMembers(["member-011", "member-012", "member-013", "member-014", "member-015"]),
  },
  {
    id: "M04", title: "UNBOUND", genre: "WAACK", type: "voluntary",
    instructors: [], accent: accents[4].hex,
    description: "誰かの正解ではなく、自分たちの表現を。伸びていく線の先には、まだ知らない可能性がある。",
    members: getMembers(["member-016", "member-017", "member-018", "member-019"]),
  },
];
