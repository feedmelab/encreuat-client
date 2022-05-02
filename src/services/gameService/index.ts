import { Socket } from "socket.io-client";
import { IPlayerRespostes, IPlayerTimes, IStartJoc } from "../../components/EncreuatGame";

class GameService {
	public async joinGameRoom(socket: Socket, roomId: string): Promise<boolean> {
		return new Promise((rs, rj) => {
			socket.emit("join_game", { roomId });
			socket.on("room_joined", () => rs(true));
			socket.on("room_join_error", ({ error }) => rj(error));
		});
	}
	public async updateGame(socket: Socket, gameChances: IPlayerRespostes, gameTimes: IPlayerTimes) {
		let faseActual: number = Number(gameChances[5][0]) | 0;
		const esFinalFase = gameChances[faseActual].filter((r) => r === null);
		if (esFinalFase.length === 0) {
			gameChances[5][0] = faseActual = faseActual + 1;
		}

		socket.emit("update_game", { chances: gameChances, times: gameTimes });
	}

	public async onGameUpdate(socket: Socket, listiner: (chances: IPlayerRespostes, times: IPlayerTimes) => void) {
		socket.on("on_game_update", ({ chances, times }) => {
			listiner(chances, times);
		});
	}

	public async onStartGame(socket: Socket, listiner: (options: IStartJoc) => void) {
		socket.on("start_game", listiner);
	}
}
export default new GameService();
