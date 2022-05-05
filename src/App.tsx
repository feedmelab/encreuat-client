import React, { useEffect, useState } from "react";
import { Container } from "react-bootstrap";
import HeaderGame from "./components/HeaderGame/HeaderGame";
import socketService from "./services/socketService";
import { JoinRoom } from "./components/JoinRoom/index";
import GameContext, { IEncreuatGameContextProps } from "./gameContext";
import { EncreuatGame } from "./components/EncreuatGame";

const App = () => {
	const [isInRoom, setInRoom] = useState(false);
	const [playerSymbol, setPlayerSymbol] = useState<string>("");
	const [isPlayerTurn, setPlayerTurn] = useState(false);
	const [isGameStarted, setGameStarted] = useState(false);
	const [isGameEnded, setGameEnded] = useState<boolean>(false);
	const [dades, setDades] = useState<Array<string>>([]);
	const [room, setRoom] = useState<string>("");
	const [fase, setFase] = useState<number>(0);
	const [playerRes, setPlayerRes] = useState<string>("");

	const connectSocket = async () => {
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const urlDeploy = "http://localhost:9000";
		//const urlProd = "https://jocs.feedmelab.com";
		const socket = await socketService.connect(urlDeploy).catch((err) => {
			console.log("Error: ", err);
		});
	};

	useEffect(() => {
		connectSocket();
	}, []);

	const gameContextValue: IEncreuatGameContextProps = {
		isInRoom,
		setInRoom,
		playerSymbol,
		setPlayerSymbol,
		isPlayerTurn,
		setPlayerTurn,
		isGameStarted,
		setGameStarted,
		isGameEnded,
		setGameEnded,
		room,
		setRoom,
		fase,
		setFase,
		playerRes,
		setPlayerRes,
		dades,
		setDades,
	};

	return (
		<GameContext.Provider value={gameContextValue}>
			<Container>
				<HeaderGame></HeaderGame>
				{!isInRoom && <JoinRoom />}
				{isInRoom && <EncreuatGame />}
			</Container>
		</GameContext.Provider>
	);
};

export default App;
