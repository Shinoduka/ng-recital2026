/** 出演者マスター。複数ナンバーに出演する人は同じIDを使用します。 */
export type Member = {
  id: string;
  name: string;
  photo?: string;
};

export const members: Member[] = [
  { id: "member-001", name: "MEMBER 01" },
  { id: "member-002", name: "MEMBER 02" },
  { id: "member-003", name: "MEMBER 03" },
  { id: "member-004", name: "MEMBER 04" },
  { id: "member-005", name: "MEMBER 05" },
  { id: "member-006", name: "MEMBER 06" },
  { id: "member-007", name: "MEMBER 07" },
  { id: "member-008", name: "MEMBER 08" },
  { id: "member-009", name: "MEMBER 09" },
  { id: "member-010", name: "MEMBER 10" },
  { id: "member-011", name: "MEMBER 11" },
  { id: "member-012", name: "MEMBER 12" },
  { id: "member-013", name: "MEMBER 13" },
  { id: "member-014", name: "MEMBER 14" },
  { id: "member-015", name: "MEMBER 15" },
  { id: "member-016", name: "MEMBER 16" },
  { id: "member-017", name: "MEMBER 17" },
  { id: "member-018", name: "MEMBER 18" },
  { id: "member-019", name: "MEMBER 19" },
];

const memberById = new Map(members.map(member => [member.id, member]));

/** performances.ts からID順に出演者情報を取得します。未登録IDは開発中に気付けるようエラーにします。 */
export function getMembers(ids: readonly string[]): Member[] {
  return ids.map(id => {
    const member = memberById.get(id);
    if (!member) throw new Error(`members.ts に出演者ID「${id}」がありません`);
    return member;
  });
}
