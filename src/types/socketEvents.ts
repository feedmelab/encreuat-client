export interface RoomListItem {
	roomId: string;
	status: "waiting" | "started";
	players: number;
}

export interface RoomJoinedEvent {
	roomId: string;
	players?: number;
}

export interface RoomErrorEvent {
	error: string;
}

export interface WinnersBoardRow {
	name: string;
	wins: number;
	points: number;
}

export interface WinnersBoardEvent {
	board: WinnersBoardRow[];
}
