import React from "react";

export interface IEncreuatGameContextProps {
	isInRoom: boolean;
	setInRoom: (inRoom: boolean) => void;
	room: string;
	setRoom: (room: string) => void;
	playerSymbol: string;
	setPlayerSymbol: (symbol: string) => void;
	isPlayerTurn: boolean;
	setPlayerTurn: (turn: boolean) => void;
	isGameStarted: boolean;
	setGameStarted: (started: boolean) => void;
	isGameEnded: boolean;
	setGameEnded: (started: boolean) => void;
	fase: any;
	setFase: (fase: any) => void;
	playerRes: string;
	setPlayerRes: (res: string) => void;
	dades: any;
	setDades: (d: any) => void;
}

const defaultState: IEncreuatGameContextProps = {
	isInRoom: false,
	setInRoom: () => {},
	room: "",
	setRoom: () => {},
	playerSymbol: "",
	setPlayerSymbol: () => {},
	isPlayerTurn: false,
	setPlayerTurn: () => {},
	isGameStarted: false,
	setGameStarted: () => {},
	isGameEnded: false,
	setGameEnded: () => {},
	fase: 0,
	setFase: () => {},
	playerRes: "",
	setPlayerRes: () => {},
	dades: [{}],
	setDades: () => {},
};

export default React.createContext(defaultState);
