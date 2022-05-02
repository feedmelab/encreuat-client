import React, { useContext, useState } from "react";
import gameContext from "../../gameContext";
import gameService from "../../services/gameService";
import socketService from "../../services/socketService";
import { RoomHeader, WelcomeMessage, JoinButton, JoinRoomContainer, RoomIdInput, RoomsBox, RoomPar, EncreuatForm } from "./JoinRoom.styles";

interface IJoinRoomProps {}

export function JoinRoom(props: IJoinRoomProps) {
	const [roomName, setRoomName] = useState("");
	const [isJoining, setJoining] = useState(false);

	const { setInRoom, isInRoom } = useContext(gameContext);

	const handleRoomNameChange = (e: React.ChangeEvent<any>) => {
		const value = e.target.value.toUpperCase();
		setRoomName(value);
	};

	const joinRoom = async (e: React.FormEvent) => {
		e.preventDefault();

		const socket = socketService.socket;
		if (!roomName || roomName.trim() === "" || !socket) return;

		setJoining(true);

		const joined = await gameService.joinGameRoom(socket, roomName).catch((err) => {
			alert(err);
		});

		if (joined) setInRoom(true);
		setJoining(false);
	};

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
				<RoomsBox>
					<RoomHeader>Crea't una sala i comparteix el teu id o introdueix l'id del teu contrincant i comença a jugar!</RoomHeader>

					<EncreuatForm>
						<RoomIdInput placeholder="Room ID" value={roomName} onChange={handleRoomNameChange} />
						<JoinButton type="submit" disabled={isJoining}>
							{isJoining ? "CONECTANT..." : "ENCREUA'T"}
						</JoinButton>
					</EncreuatForm>
				</RoomsBox>
			</JoinRoomContainer>
		</form>
	);
}
