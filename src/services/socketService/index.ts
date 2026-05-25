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
			console.log("[socket-client] connect:start", { url });
			this.socket = io(url, {
				transports: ["polling"],
				upgrade: false,
				path: "/socket.io",
			});

			if (!this.socket) {
				this.connectPromise = null;
				return rj();
			}

			this.socket.on("disconnect", (reason) => {
				console.warn("[socket-client] disconnect", { reason });
			});
			this.socket.on("error", (error) => {
				console.error("[socket-client] error", error);
			});

			this.socket.once("connect", () => {
				console.log("[socket-client] connect:ok", {
					id: this.socket?.id,
					transport: this.socket?.io?.engine?.transport?.name,
				});
				this.notifyConnected(this.socket as Socket<DefaultEventsMap, DefaultEventsMap>);
				rs(this.socket as Socket<DefaultEventsMap, DefaultEventsMap>);
			});

			this.socket.once("connect_error", (err) => {
				console.error("[socket-client] connect:error", {
					message: err?.message,
					name: err?.name,
					description: (err as any)?.description,
					context: (err as any)?.context,
				});
				this.connectPromise = null;
				rj(err);
			});
		});

		return this.connectPromise;
	}
}

const socketService = new SocketService();
export default socketService;
