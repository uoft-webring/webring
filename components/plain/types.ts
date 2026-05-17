/** The slice of a member the plain page needs; keeps the client payload small. */
export type PlainMember = {
    ringId: number;
    name: string;
    year: number | null;
    domain: string;
    label: string;
};
