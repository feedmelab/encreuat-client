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
	playerName: string;
	setPlayerName: (name: string) => void;
	playerAName: string;
	setPlayerAName: (name: string) => void;
	playerBName: string;
	setPlayerBName: (name: string) => void;
	matchId: string;
	setMatchId: (id: string) => void;
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
	playerName: "",
	setPlayerName: () => {},
	playerAName: "",
	setPlayerAName: () => {},
	playerBName: "",
	setPlayerBName: () => {},
	matchId: "",
	setMatchId: () => {},
};

export default React.createContext(defaultState);
