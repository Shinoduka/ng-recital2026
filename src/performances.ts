import { getAccent, type Accent } from "./accents";
import { getMembers, type Member } from "./members";

export type Performance = {
  id: string;
  title: string;
  genre: string;
  type: "official" | "voluntary";
  instructors: Member[];
  description: string;
  accent: Accent;
  members: Member[];
  cover?: string;
};

export const performances: Performance[] = [
  {
    id: "M01",
    title: "OVERDRIVE",
    genre: "MIX",
    type: "official",
    instructors: getMembers("友哉"),
    description: "講師陣による",
    accent: getAccent("white"),
    members: getMembers(
      "A005",
      "A008",
      "A014",
      "A016",
      "A020",
      "A029",
      "A041",
      "A045",
      "A046",
      "A050",
      "A057",
      "A073",
      "A077",
      "A079",
      "A082",
      "A084",
      "A099",
      "A100",
      "A118",
      "A151"),
  },
];