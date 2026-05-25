import React, { useContext, useEffect, useState } from "react";
import gameContext from "../../gameContext";
import gameService from "../../services/gameService";
import socketService from "../../services/socketService";
import { RoomHeader, WelcomeMessage, JoinButton, JoinRoomContainer, RoomIdInput, RoomsBox, RoomPar, EncreuatForm } from "./JoinRoom.styles";
import { RoomListItem } from "../../types/socketEvents";

interface IJoinRoomProps {}

export function JoinRoom(props: IJoinRoomProps) {
	const [roomName, setRoomName] = useState("");
	const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium");
	const [localName, setLocalName] = useState("");
	const [isJoining, setJoining] = useState(false);
	const [openGames, setOpenGames] = useState<RoomListItem[]>([]);
	const [winnersBoard, setWinnersBoard] = useState<Array<{ name: string; wins: number; points: number }>>([]);
	const [isEditingName, setIsEditingName] = useState(false);

	const { setRoom, room, playerName, setPlayerName, isPreparingGame, setPreparingGame } = useContext(gameContext);

	useEffect(() => {
		if (playerName && !localName) setLocalName(playerName);
	}, [playerName, localName]);

	const handleRoomNameChange = (e: React.ChangeEvent<any>) => {
		const value = e.target.value.toUpperCase();
		setRoomName(value);
	};

	const handleDifficultyChange = (e: React.ChangeEvent<any>) => {
		const next = String(e.target.value || "medium");
		if (next === "easy" || next === "medium" || next === "hard") setDifficulty(next);
	};

	const joinRoom = async (e: React.FormEvent) => {
		e.preventDefault();

		const socket = socketService.socket;
		if (!playerName || !roomName || roomName.trim() === "" || !socket) return;

		setJoining(true);

		const joinedRoomId = await gameService.joinGameRoomWithNameAndDifficulty(socket, roomName, playerName, difficulty).catch((err) => {
			alert(err);
		});

		if (joinedRoomId) {
			setRoom(joinedRoomId);
		}
		setJoining(false);
	};

	const joinOpenedGame = async (roomId: string) => {
		const socket = socketService.socket;
		if (!socket || !playerName) return;

		setJoining(true);
		const joinedRoomId = await gameService.joinGameRoomWithName(socket, roomId, playerName).catch((err) => {
			alert(err);
		});
		if (joinedRoomId) {
			setRoom(joinedRoomId);
		}
		setJoining(false);
	};

	const startSoloGame = async () => {
		const socket = socketService.socket;
		if (!socket || !playerName) return;

		setJoining(true);
		setPreparingGame(true);
		const joinedRoomId = await gameService.createSoloGameRoom(socket, playerName, difficulty).catch((err) => {
			alert(err);
			setPreparingGame(false);
		});
		if (joinedRoomId) {
			setRoom(joinedRoomId);
		}
		setJoining(false);
	};

	const saveName = () => {
		const sanitized = localName.trim();
		if (!sanitized) return;
		setPlayerName(sanitized);
		localStorage.setItem("encreuat_player_name", sanitized);
		setIsEditingName(false);
	};

	const cancelCreatedGame = async () => {
		const socket = socketService.socket;
		if (!socket || !room) return;

		setJoining(true);
		const cancelledRoomId = await gameService.cancelGameRoom(socket, room).catch((err) => {
			alert(err);
		});
		if (cancelledRoomId) {
			setRoom("");
			setRoomName("");
			setPreparingGame(false);
		}
		setJoining(false);
	};

	useEffect(() => {
		let unsubscribeOpenGames: (() => void) | null = null;
		const unsubscribeConnected = socketService.onConnected((socket) => {
			if (unsubscribeOpenGames) unsubscribeOpenGames();
			unsubscribeOpenGames = gameService.onOpenGames(socket, (rooms) => {
				setOpenGames(rooms);
			});
			gameService.requestOpenGames(socket);
		});

		return () => {
			unsubscribeConnected();
			if (unsubscribeOpenGames) unsubscribeOpenGames();
		};
	}, []);

	useEffect(() => {
		let unsubscribeLeaderboard: (() => void) | null = null;
		const unsubscribeConnected = socketService.onConnected((socket) => {
			if (unsubscribeLeaderboard) unsubscribeLeaderboard();
			unsubscribeLeaderboard = gameService.onLeaderboardUpdate(socket, (board) => {
				setWinnersBoard(board);
			});
			gameService.requestLeaderboard(socket);
		});
		return () => {
			unsubscribeConnected();
			if (unsubscribeLeaderboard) unsubscribeLeaderboard();
		};
	}, []);

	useEffect(() => {
		const socket = socketService.socket;
		if (!socket) return;
		const onRoomError = () => {
			setPreparingGame(false);
		};
		socket.on("room_join_error", onRoomError);
		return () => {
			socket.off("room_join_error", onRoomError);
		};
	}, [setPreparingGame]);

	return (
		<form onSubmit={joinRoom}>
			<JoinRoomContainer>
				<RoomsBox>
					<WelcomeMessage>Benvingut/da a l'Encreua't!</WelcomeMessage>

					<RoomPar>
						Un joc on hauràs de trobar les paraules correctes deduïnt-les amb les descripcions que t'anirem donant...
						<br />
						Però això no és tot, hauràs de descobrir-ne més de les que en descobreixi el teu contrincant!!
					</RoomPar>
				</RoomsBox>
				{(!playerName || isEditingName) && (
					<RoomsBox>
						<RoomHeader>{playerName ? "Edita el teu nom o pseudònim" : "Primer pas: escriu el teu nom o pseudònim"}</RoomHeader>
						<EncreuatForm>
							<RoomIdInput
								placeholder="Nom o pseudònim"
								value={localName}
								onChange={(e: React.ChangeEvent<any>) => setLocalName(e.target.value)}
							/>
							<JoinButton type="button" onClick={saveName} disabled={!localName.trim()}>
								GUARDAR
							</JoinButton>
							{playerName && (
								<JoinButton
									type="button"
									onClick={() => {
										setLocalName(playerName);
										setIsEditingName(false);
									}}>
									CANCEL·LAR
								</JoinButton>
							)}
						</EncreuatForm>
					</RoomsBox>
				)}
				{playerName && !room && !isEditingName && (
					<>
						<RoomsBox>
							<EncreuatForm>
								<RoomPar>Jugador: {playerName}</RoomPar>
								<JoinButton type="button" onClick={() => setIsEditingName(true)}>
									EDITAR NOM
								</JoinButton>
							</EncreuatForm>
							<RoomHeader>Crea't una sala i comparteix el teu id o introdueix l'id del teu contrincant i comença a jugar!</RoomHeader>

								<EncreuatForm>
									<RoomIdInput placeholder="Room ID" value={roomName} onChange={handleRoomNameChange} />
									<RoomIdInput
										as="select"
										value={difficulty}
										onChange={handleDifficultyChange}>
										<option value="easy">Dificultat: fàcil</option>
										<option value="medium">Dificultat: mitjana</option>
										<option value="hard">Dificultat: difícil</option>
									</RoomIdInput>
									<JoinButton type="submit" disabled={isJoining}>
										{isJoining ? "CONECTANT..." : "ENCREUA'T"}
									</JoinButton>
									<JoinButton type="button" disabled={isJoining} onClick={startSoloGame}>
										{isJoining ? "PREPARANT..." : "JUGAR SOL/A"}
									</JoinButton>
								</EncreuatForm>
						</RoomsBox>
						<RoomsBox>
							<RoomHeader>Partides obertes esperant jugador</RoomHeader>
							{openGames.length === 0 && <RoomPar>No hi ha cap partida oberta ara mateix.</RoomPar>}
							{openGames.length > 0 &&
								openGames.map((openRoom) => (
									<EncreuatForm key={openRoom.roomId}>
										<RoomPar>
											{openRoom.roomId} ({openRoom.players}/2) - {openRoom.status === "started" ? "EN JOC" : "DISPONIBLE"} -{" "}
											{openRoom.difficulty === "easy" ? "FÀCIL" : openRoom.difficulty === "hard" ? "DIFÍCIL" : "MITJANA"}
										</RoomPar>
										{openRoom.status === "waiting" ? (
											<JoinButton type="button" disabled={isJoining} onClick={() => joinOpenedGame(openRoom.roomId)}>
												ENTRAR
											</JoinButton>
										) : (
											<JoinButton type="button" disabled>
												EN JOC
											</JoinButton>
										)}
									</EncreuatForm>
								))}
						</RoomsBox>
					</>
				)}
				{room && (
					<RoomsBox>
						<RoomHeader>Sala oberta: {room}</RoomHeader>
						<RoomPar>
							{isPreparingGame
								? "Preparant partida: carregant definicions vàlides..."
								: "Esperant que un altre jugador entri a aquesta sala per començar la partida."}
						</RoomPar>
						<EncreuatForm>
							<JoinButton type="button" disabled={isJoining} onClick={cancelCreatedGame}>
								ELIMINAR JOC
							</JoinButton>
						</EncreuatForm>
					</RoomsBox>
				)}
				<RoomsBox>
					<RoomHeader>Guanyadors freqüents</RoomHeader>
					{winnersBoard.length === 0 && <RoomPar>Encara no hi ha partides registrades.</RoomPar>}
					{winnersBoard.slice(0, 10).map((item, idx) => (
						<RoomPar key={`${item.name}-${idx}`}>
							{idx + 1}. {item.name} - {item.wins} victòries - {item.points} punts
						</RoomPar>
					))}
				</RoomsBox>
			</JoinRoomContainer>
		</form>
	);
}
