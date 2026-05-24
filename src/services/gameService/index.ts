import { Socket } from "socket.io-client";
import { IPlayerRespostes, IPlayerTimes, IStartJoc } from "../../components/EncreuatGame/types";
import { RoomErrorEvent, RoomJoinedEvent, RoomListItem, WinnersBoardEvent, WinnersBoardRow } from "../../types/socketEvents";

class GameService {
	private waitForRoomEvent(
		socket: Socket,
		emitEvent: string,
		payload: unknown,
		successEvent: string,
		errorEvent: string,
		getSuccessValue: (data: RoomJoinedEvent) => string
	): Promise<string> {
		return new Promise((resolve, reject) => {
			const timeoutMs = 10000;
			const timeoutId = setTimeout(() => {
				cleanup();
				reject("Temps d'espera esgotat. Torna-ho a provar.");
			}, timeoutMs);

			const onSuccess = (data: RoomJoinedEvent) => {
				cleanup();
				resolve(getSuccessValue(data));
			};

			const onError = ({ error }: RoomErrorEvent) => {
				cleanup();
				reject(error || "Error desconegut");
			};

			const cleanup = () => {
				clearTimeout(timeoutId);
				socket.off(successEvent, onSuccess);
				socket.off(errorEvent, onError);
			};

			socket.on(successEvent, onSuccess);
			socket.on(errorEvent, onError);
			socket.emit(emitEvent, payload);
		});
	}

	public requestOpenGames(socket: Socket) {
		socket.emit("get_open_games");
	}

	public onOpenGames(socket: Socket, listiner: (rooms: RoomListItem[]) => void) {
		const handler = ({ rooms }: { rooms: RoomListItem[] }) => listiner(rooms || []);
		socket.on("open_games", handler);
		return () => socket.off("open_games", handler);
	}

	public async createGameRoom(socket: Socket): Promise<string> {
		return this.waitForRoomEvent(socket, "create_game", undefined, "room_joined", "room_join_error", (data) => data?.roomId);
	}

	public async joinGameRoom(socket: Socket, roomId: string): Promise<string> {
		return this.waitForRoomEvent(socket, "join_game", { roomId }, "room_joined", "room_join_error", (data) => data?.roomId);
	}

	public async joinGameRoomWithName(socket: Socket, roomId: string, playerName: string): Promise<string> {
		return this.waitForRoomEvent(socket, "join_game", { roomId, playerName }, "room_joined", "room_join_error", (data) => data?.roomId);
	}

	public async joinGameRoomWithNameAndDifficulty(
		socket: Socket,
		roomId: string,
		playerName: string,
		difficulty: "easy" | "medium" | "hard"
	): Promise<string> {
		return this.waitForRoomEvent(
			socket,
			"join_game",
			{ roomId, playerName, difficulty },
			"room_joined",
			"room_join_error",
			(data) => data?.roomId
		);
	}

	public async cancelGameRoom(socket: Socket, roomId: string): Promise<string> {
		return this.waitForRoomEvent(socket, "cancel_game", { roomId }, "room_cancelled", "room_cancel_error", (data) => data?.roomId);
	}
	public async updateGame(socket: Socket, gameChances: IPlayerRespostes, gameTimes: IPlayerTimes) {
		let faseActual: number = Number(gameChances[5][0]) | 0;
		const esFinalFase = gameChances[faseActual].filter((r) => r === null);
		if (esFinalFase.length === 0) {
			gameChances[5][0] = faseActual = faseActual + 1;
		}

		socket.emit("update_game", { chances: gameChances, times: gameTimes });
	}

	public onGameUpdate(socket: Socket, listiner: (chances: IPlayerRespostes, times: IPlayerTimes) => void) {
		const handler = ({ chances, times }: { chances: IPlayerRespostes; times: IPlayerTimes }) => {
			listiner(chances, times);
		};
		socket.on("on_game_update", handler);
		return () => socket.off("on_game_update", handler);
	}

	public onGameFinished(socket: Socket, listener: (chances: IPlayerRespostes, times: IPlayerTimes) => void) {
		const handler = ({ chances, times }: { chances: IPlayerRespostes; times: IPlayerTimes }) => {
			listener(chances, times);
		};
		socket.on("game_finished", handler);
		return () => socket.off("game_finished", handler);
	}

	public onStartGame(socket: Socket, listiner: (options: IStartJoc) => void) {
		socket.on("start_game", listiner);
		return () => socket.off("start_game", listiner);
	}

	public onGamePreparing(socket: Socket, listener: ({ roomId }: { roomId: string }) => void) {
		socket.on("game_preparing", listener);
		return () => socket.off("game_preparing", listener);
	}

	public requestLeaderboard(socket: Socket) {
		socket.emit("get_winners_board");
	}

	public onLeaderboardUpdate(socket: Socket, listener: (board: WinnersBoardRow[]) => void) {
		const handler = ({ board }: WinnersBoardEvent) => listener(board || []);
		socket.on("winners_board", handler);
		return () => socket.off("winners_board", handler);
	}

	public reportWinner(socket: Socket, winnerName: string, matchId: string, winnerPoints: number) {
		socket.emit("report_match_winner", { winnerName, matchId, winnerPoints });
	}
}
const gameService = new GameService();
export default gameService;
