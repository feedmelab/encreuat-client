import React, { useCallback, useContext, useEffect, useState } from "react";
import gameContext from "../../gameContext";
import gameService from "../../services/gameService";
import socketService from "../../services/socketService";
import { IPlayerRespostes, IPlayerResultats, IPlayerTimes } from "./types";

export function useGameEngine() {
	const [punts, setPunts] = useState<Array<number>>([0, 0]);
	const [resultatFinal, setresultatFinal] = useState<IPlayerResultats>([null, null, null, null, null]);
	const [chances, setChances] = useState<IPlayerRespostes>([[null, null], [null, null], [null, null], [null, null], [null, null], [0]]);
	const [times, setTimes] = useState<IPlayerTimes>([[null, null], [null, null], [null, null], [null, null], [null, null]]);
	const [back, setBack] = useState<boolean>(false);
	const [sound, setSound] = useState<boolean>(true);
	const {
		room,
		playerSymbol,
		setInRoom,
		fase,
		setFase,
		setPlayerTurn,
		isPlayerTurn,
		isGameStarted,
		isGameEnded,
		setGameEnded,
		playerRes,
		setPlayerRes,
		dades,
		playerAName,
		playerBName,
		matchId,
		setGameStarted,
		setRoom,
	} = useContext(gameContext);

	const [remaining, setRemaining] = useState<number | null>(null);
	const [reportedWinner, setReportedWinner] = useState<string>("");
	const timeToPlay = 60;

	const normalizeForCompare = (value: unknown) =>
		String(value || "")
			.toLowerCase()
			.replace(/[’']/g, "")
			.trim();

	const isAllowedCatalanChar = (value: string) => /^[A-Za-zÀ-ÖØ-öø-ÿÇç·'’-]$/u.test(value);
	const isAutoProvidedChar = (value: string) => /[-’'·\s]/u.test(value);

	const getCurrentTypedWord = (totalFields: number) =>
		Array.from({ length: totalFields })
			.map((_, idx) => (document.querySelector(`input[name=ssn-${idx}]`) as HTMLInputElement | null)?.value?.toLowerCase() || "")
			.join("");

	const recomputeResults = useCallback(
		(nextChances: IPlayerRespostes, nextTimes: IPlayerTimes) => {
			const nextResultatFinal: IPlayerResultats = [null, null, null, null, null];
			const nextPunts = [0, 0];
			for (let round = 0; round < 5; round++) {
				const t0 = nextTimes?.[round]?.[0];
				const t1 = nextTimes?.[round]?.[1];
				if (t0 === null || t1 === null || t0 === undefined || t1 === undefined) continue;
				const timeWinner = Number(t0) === Number(t1) ? "AB" : Number(t0) < Number(t1) ? "A" : "B";
				const expected = normalizeForCompare(dades?.[round]?.d?.nom);
				const a0 = normalizeForCompare(nextChances?.[round]?.[0]);
				const a1 = normalizeForCompare(nextChances?.[round]?.[1]);
				const aCorrect = expected && a0 !== "passo" && a0 === expected;
				const bCorrect = expected && a1 !== "passo" && a1 === expected;
				const winners: Array<"A" | "B"> = [];
				if (aCorrect) winners.push("A");
				if (bCorrect) winners.push("B");
				if (winners.length === 2) {
					nextResultatFinal[round] = timeWinner;
					if (timeWinner === "A") nextPunts[0] += 3;
					else if (timeWinner === "B") nextPunts[1] += 3;
					else {
						nextPunts[0] += 1;
						nextPunts[1] += 1;
					}
				} else if (winners.length === 1) {
					nextResultatFinal[round] = winners[0];
					if (winners[0] === "A") nextPunts[0] += 3;
					else nextPunts[1] += 3;
				}
			}
			setresultatFinal(nextResultatFinal);
			setPunts(nextPunts);
		},
		[dades]
	);

	const isGameFinishedFromState = (nextChances: IPlayerRespostes) => {
		const faseFromState = Number(nextChances?.[5]?.[0]) || 0;
		const isLastRoundFinished = nextChances?.[4]?.every((r) => r !== null) || false;
		return faseFromState >= 5 || isLastRoundFinished;
	};

	const updateGameChances = async (event: React.FormEvent | null, currentFase: number, puntero: number, resposta: string) => {
		if (event) event.preventDefault();
		if (resposta === "") resposta = "Passo";
		if (currentFase >= 5) return;

		const newChances = [...chances];
		const newTimes = [...times];
		if (newChances[currentFase][puntero] === "" || newChances[currentFase][puntero] === null) {
			newChances[currentFase][puntero] = resposta;
			newTimes[currentFase][puntero] = remaining;
			setChances(newChances);
			setTimes(newTimes);
			recomputeResults(newChances, newTimes);
			setFase(Number(newChances?.[5]?.[0]) || 0);
		}
		const isGameFinished = isGameFinishedFromState(newChances);
		if (socketService.socket) {
			gameService.updateGame(socketService.socket, newChances, newTimes);
			if (isGameFinished) {
				setPlayerTurn(false);
				setGameEnded(true);
			} else {
				setPlayerTurn(false);
			}
			setPlayerRes("");
		}
	};

	const handleBackground = () => setBack((prevBack) => !prevBack);
	const handleSound = () => setSound((prevSound) => !prevSound);

	const isRoundCorrect = (round: number, playerIndex: 0 | 1) => {
		const answer = chances[round]?.[playerIndex];
		const expected = dades?.[round]?.d?.nom;
		if (!answer || answer === "Passo" || !expected) return false;
		return normalizeForCompare(answer) === normalizeForCompare(expected);
	};

	const getRoundIconClass = (round: number, playerIndex: 0 | 1) => {
		if (!isRoundCorrect(round, playerIndex)) return "wrong";
		const winner = resultatFinal[round];
		if (winner === "AB") return "win";
		if (winner === "A") return playerIndex === 0 ? "win" : "correct";
		if (winner === "B") return playerIndex === 1 ? "win" : "correct";
		return "correct";
	};

	const handleName = (name: string | number | null, flag: boolean) => {
		if (name === null || name === undefined) return "";
		const value = String(name);
		const masked = value.replace(/[a-zA-ZÀ-ú]/gi, "*");
		return flag ? masked : value;
	};

	const handleTimer = () => {
		if (fase < 5) updateGameChances(null, fase, playerSymbol === "A" ? 0 : 1, "Passo");
	};
	const handleRemaining = (r = 0) => {
		if (r) setRemaining(timeToPlay - (r - 1));
	};

	const handleChangeLetter = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { maxLength, name, id } = e.target;
		let { value } = e.target;
		const [, fieldIndex] = name.split("-");
		if (isAutoProvidedChar(value)) return;
		if (!value) return;
		const latestChar = value[value.length - 1];
		if (!isAllowedCatalanChar(latestChar)) {
			e.target.value = "";
			return;
		}
		e.target.value = latestChar;
		if (value.length < maxLength) return;
		if (parseInt(fieldIndex, 10) < Number(id)) {
			const nextSibling = document.querySelector(`input[name=ssn-${parseInt(fieldIndex, 10) + 1}]`) as HTMLInputElement | null;
			const totalFields = Number(id) || 0;
			const chars = getCurrentTypedWord(totalFields);
			setPlayerRes(chars);
			if (nextSibling) nextSibling.focus();
		} else {
			alert("last");
		}
	};

	const handleWordKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		const input = e.currentTarget;
		const [, fieldIndexRaw] = input.name.split("-");
		const fieldIndex = Number(fieldIndexRaw) || 0;
		if (e.key.length === 1 && !isAllowedCatalanChar(e.key) && e.key !== "Backspace") {
			e.preventDefault();
		}
		if (e.key === "Backspace" && input.value === "" && fieldIndex > 0) {
			const prevInput = document.querySelector(`input[name=ssn-${fieldIndex - 1}]`) as HTMLInputElement | null;
			if (prevInput) {
				prevInput.value = "";
				prevInput.focus();
			}
		}
		const totalFields = Number(input.id) || 0;
		const chars = getCurrentTypedWord(totalFields);
		setPlayerRes(chars);
	};

	const getCongratsGrade = (score: number) =>
		score > 10
			? "Enhorabona!\nHas guanyat la partida amb una puntuació espectacular!"
			: score < 5
			? "Enhorabona! Has guanyat la partida..però pel pèls..;)"
			: "Enhorabona!!\nHas guanyat la partida!";

	useEffect(() => {
		let unsubscribeGameUpdate: (() => void) | null = null;
		let unsubscribeGameFinished: (() => void) | null = null;
		const unsubscribeConnected = socketService.onConnected((socket) => {
			if (unsubscribeGameUpdate) unsubscribeGameUpdate();
			if (unsubscribeGameFinished) unsubscribeGameFinished();
			unsubscribeGameUpdate = gameService.onGameUpdate(socket, (newChances, newTimes) => {
				setChances(newChances);
				setTimes(newTimes);
				recomputeResults(newChances, newTimes);
				setFase(Number(newChances[5][0]) || 0);
				const isGameFinished = isGameFinishedFromState(newChances);
				if (isGameFinished) {
					setPlayerTurn(false);
					setGameEnded(true);
				} else {
					setPlayerTurn(true);
				}
			});
			unsubscribeGameFinished = gameService.onGameFinished(socket, (newChances, newTimes) => {
				setChances(newChances);
				setTimes(newTimes);
				recomputeResults(newChances, newTimes);
				setFase(Number(newChances?.[5]?.[0]) || 0);
				setPlayerTurn(false);
				setGameEnded(true);
			});
		});
		return () => {
			unsubscribeConnected();
			if (unsubscribeGameUpdate) unsubscribeGameUpdate();
			if (unsubscribeGameFinished) unsubscribeGameFinished();
		};
	}, [recomputeResults, setFase, setGameEnded, setPlayerTurn]);

	useEffect(() => {
		if (!isGameEnded || reportedWinner) return;
		if (!socketService.socket) return;
		if (playerSymbol !== "A") return;
		let winnerName = "";
		let winnerPoints = 0;
		if (punts[0] > punts[1]) winnerName = playerAName;
		else if (punts[1] > punts[0]) winnerName = playerBName;
		if (winnerName === playerAName) winnerPoints = punts[0];
		if (winnerName === playerBName) winnerPoints = punts[1];
		if (!winnerName) return;
		gameService.reportWinner(socketService.socket, winnerName, matchId || room, winnerPoints);
		setReportedWinner(winnerName);
	}, [isGameEnded, reportedWinner, punts, playerAName, playerBName, playerSymbol, room, matchId]);

	const goToNewGame = async () => {
		if (socketService.socket && room) await gameService.cancelGameRoom(socketService.socket, room).catch(() => {});
		setInRoom(false);
		setGameEnded(false);
		setGameStarted(false);
		setPlayerTurn(false);
		setRoom("");
		setFase(0);
		setPlayerRes("");
		setReportedWinner("");
	};

	return {
		punts,
		resultatFinal,
		chances,
		times,
		back,
		sound,
		room,
		playerSymbol,
		fase,
		isPlayerTurn,
		isGameStarted,
		isGameEnded,
		playerRes,
		dades,
		playerAName,
		playerBName,
		handleBackground,
		handleSound,
		getRoundIconClass,
		handleName,
		handleTimer,
		handleRemaining,
		handleChangeLetter,
		handleWordKeyDown,
		getCongratsGrade,
		updateGameChances,
		goToNewGame,
	};
}
