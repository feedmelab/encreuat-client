export type IPlayerRespostes = Array<Array<string | number | null>>;
export type IPlayerResultats = Array<string | null>;
export type IPlayerTimes = Array<Array<string | number | null>>;
export type IPlayerPreguntes = Array<string>;
export type IPlayerFetch = string;

export interface IStartJoc {
	start: boolean;
	symbol: "A" | "B";
	room: string;
	dades: any[];
	players?: { A: string; B: string };
	matchId?: string;
}
