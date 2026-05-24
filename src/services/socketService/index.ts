import { io, Socket } from "socket.io-client";
import { DefaultEventsMap } from "socket.io/dist/typed-events";

class SocketService {
	public socket: Socket | null = null;
	private connectPromise: Promise<Socket<DefaultEventsMap, DefaultEventsMap>> | null = null;
	private connectedListeners = new Set<(socket: Socket<DefaultEventsMap, DefaultEventsMap>) => void>();

	private notifyConnected(socket: Socket<DefaultEventsMap, DefaultEventsMap>) {
		this.connectedListeners.forEach((listener) => listener(socket));
	}

	public onConnected(listener: (socket: Socket<DefaultEventsMap, DefaultEventsMap>) => void) {
		this.connectedListeners.add(listener);
		if (this.socket?.connected) listener(this.socket as Socket<DefaultEventsMap, DefaultEventsMap>);
		return () => {
			this.connectedListeners.delete(listener);
		};
	}

	public connect(url: string): Promise<Socket<DefaultEventsMap, DefaultEventsMap>> {
		if (this.socket?.connected) return Promise.resolve(this.socket as Socket<DefaultEventsMap, DefaultEventsMap>);
		if (this.connectPromise) return this.connectPromise;

		this.connectPromise = new Promise((rs, rj) => {
			this.socket = io(url);

			if (!this.socket) {
				this.connectPromise = null;
				return rj();
			}

			this.socket.once("connect", () => {
				this.notifyConnected(this.socket as Socket<DefaultEventsMap, DefaultEventsMap>);
				rs(this.socket as Socket<DefaultEventsMap, DefaultEventsMap>);
			});

			this.socket.once("connect_error", (err) => {
				console.error("Error de conexión:", err);
				this.connectPromise = null;
				rj(err);
			});
		});

		return this.connectPromise;
	}
}

const socketService = new SocketService();
export default socketService;
