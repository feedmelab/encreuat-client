import React, { ReactHTMLElement, useContext, useEffect, useState } from "react";
import gameContext from "../../gameContext";
import gameService from "../../services/gameService";
import socketService from "../../services/socketService";
import CountDownTimer from "../CountDownTimer/CountDownTimer";
import Confetti from "react-confetti";

import {
	ChancesContainer,
	DefinicioBox,
	EnctBotoneraBox,
	EnctBox,
	EnctContainer,
	EnctInfo,
	EnctTitle,
	EnctRespostaForm,
	Vida,
	VidaActiva,
	Muerte,
	RespostesBox,
	WaitForOther,
	WordField,
	WordFieldBox,
	ParaulaBox,
	ParaulesRespostesBox,
	ParaulesIdecBox,
	EnctBoxLoader,
	RespostesBoxContainer,
	Congrats,
} from "./Encreuat.styles";

export type IPlayerRespostes = Array<Array<string | number | null>>;
export type IPlayerResultats = Array<string | null>;
export type IPlayerTimes = Array<Array<string | number | null>>;
export type IPlayerPreguntes = Array<string>;
export type IPlayerFetch = string;
export interface IStartJoc {
	start: boolean;
	symbol: "A" | "B";
	room: string;
	dades: [];
	players?: { A: string; B: string };
	matchId?: string;
}

export const EncreuatGame = () => {
	const [resultatTemps, setresultatTemps] = useState<IPlayerResultats>([null, null, null, null, null]);
	const [resultatParaula, setresultatParaula] = useState<IPlayerRespostes>([
		[null, null],
		[null, null],
		[null, null],
		[null, null],
		[null, null],
	]);
	const [punts, setPunts] = useState<Array<number>>([0, 0]);
	const [resultatFinal, setresultatFinal] = useState<IPlayerResultats>([null, null, null, null, null]);
	const [chances, setChances] = useState<IPlayerRespostes>([[null, null], [null, null], [null, null], [null, null], [null, null], [0]]);
	const [times, setTimes] = useState<IPlayerTimes>([
		[null, null],
		[null, null],
		[null, null],
		[null, null],
		[null, null],
	]);
	const [back, setBack] = useState<boolean>(false);
	const [sound, setSound] = useState<boolean>(true);
	const {
			room,
			setRoom,
			playerSymbol,
			setPlayerSymbol,
			setInRoom,
			fase,
			setFase,
			setPlayerTurn,
			isPlayerTurn,
			setGameStarted,
		isGameStarted,
		isGameEnded,
		setGameEnded,
			playerRes,
			setPlayerRes,
			dades,
			playerAName,
			playerBName,
			matchId,
		} = useContext(gameContext);

	const [remaining, setRemaining] = useState<number | null>(null);
	const [reportedWinner, setReportedWinner] = useState<string>("");
	const timeToPlay: number = 60;

	const recomputeResults = (nextChances: IPlayerRespostes, nextTimes: IPlayerTimes) => {
		const nextResultatTemps: IPlayerResultats = [null, null, null, null, null];
		const nextResultatFinal: IPlayerResultats = [null, null, null, null, null];
		const nextResultatParaula: IPlayerRespostes = [
			[null, null],
			[null, null],
			[null, null],
			[null, null],
			[null, null],
		];
		const nextPunts = [0, 0];

		for (let round = 0; round < 5; round++) {
			const t0 = nextTimes?.[round]?.[0];
			const t1 = nextTimes?.[round]?.[1];
			if (t0 === null || t1 === null || t0 === undefined || t1 === undefined) continue;

			const timeWinner = Number(t0) === Number(t1) ? "AB" : Number(t0) < Number(t1) ? "A" : "B";
			nextResultatTemps[round] = timeWinner;

			const expected = String(dades?.[round]?.d?.nom || "").toLowerCase();
			const a0 = String(nextChances?.[round]?.[0] || "").toLowerCase();
			const a1 = String(nextChances?.[round]?.[1] || "").toLowerCase();
			const aCorrect = expected && a0 !== "passo" && a0 === expected;
			const bCorrect = expected && a1 !== "passo" && a1 === expected;

			const winners: Array<"A" | "B"> = [];
			if (aCorrect) winners.push("A");
			if (bCorrect) winners.push("B");
			nextResultatParaula[round] = [aCorrect ? "A" : null, bCorrect ? "B" : null];

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

		setresultatTemps(nextResultatTemps);
		setresultatParaula(nextResultatParaula);
		setresultatFinal(nextResultatFinal);
		setPunts(nextPunts);
	};
	const updateGameChances = async (event: React.FormEvent | null, fase: number, puntero: number, resposta: string) => {
		if (event) event.preventDefault();
		if (resposta === "") resposta = "Passo";
		if (fase < 5) {
			const newChances = [...chances];
			const newTimes = [...times];

				if (newChances[fase][puntero] === "" || newChances[fase][puntero] === null) {
					newChances[fase][puntero] = resposta;
					newTimes[fase][puntero] = remaining;
					setChances(newChances);
					setTimes(newTimes);
					recomputeResults(newChances, newTimes);
				}

			if (socketService.socket) {
				gameService.updateGame(socketService.socket, newChances, newTimes);
				setPlayerTurn(false);
				setPlayerRes("");
				if (fase === 4) checkLastRound(newChances);
			}
		}
	};
	const handleBackground = () => {
		setBack((prevBack) => (prevBack = !prevBack));
	};
	const handleSound = () => {
		setSound((prevSound) => (prevSound = !prevSound));
	};
	const isRoundCorrect = (round: number, playerIndex: 0 | 1) => {
		const answer = chances[round]?.[playerIndex];
		const expected = dades?.[round]?.d?.nom;
		if (!answer || answer === "Passo" || !expected) return false;
		return String(answer).toLowerCase() === String(expected).toLowerCase();
	};

	const getRoundIconClass = (round: number, playerIndex: 0 | 1) => {
		if (!isRoundCorrect(round, playerIndex)) return "wrong";
		const winner = resultatFinal[round];
		if (winner === "AB") return "win";
		if (winner === "A") return playerIndex === 0 ? "win" : "correct";
		if (winner === "B") return playerIndex === 1 ? "win" : "correct";
		return "correct";
	};

	const handleName = (name: any, flag: boolean) => {
		const n = name.replace(/[a-zA-ZÀ-ú]/gi, "*");
		return flag ? n : name;
	};

	const handleTimer = () => {
		if (fase < 5) updateGameChances(null, fase, playerSymbol === "A" ? 0 : 1, "Passo");
	};
	const handleRemaining = (r: number = 0) => {
		if (r) {
			setRemaining(timeToPlay - (r - 1));
		}
	};
	const checkLastRound = (newChances: any) => {
		if (fase === 4) {
			const isLastPlayer = newChances[4].some((r: any) => r === null);
			//es la ultima jugada
			if (!isLastPlayer) {
				setPlayerTurn(false);
				setGameEnded(true);
			}
		} else return;
	};

	const handleChangeLetter = (e: React.ChangeEvent<any>) => {
		//use id param to transmit full word length...not so much polite but it's just a number
		const { maxLength, value, name, id } = e.target;
		const [fieldName, fieldIndex] = name.split("-");

		// Check if they hit the max character length
		if (value.length >= maxLength) {
			// Check if it's not the last input field
			if (parseInt(fieldIndex, 10) < id) {
				// Get the next input field
				const nextSibling: any = document.querySelector(`input[name=ssn-${parseInt(fieldIndex, 10) + 1}]`);

					const totalFields = Number(id) || 0;
					const chars = Array.from({ length: totalFields })
						.map((_, idx) => {
							const input = document.querySelector(`input[name=ssn-${idx}]`) as HTMLInputElement | null;
							return (input?.value || "").toLowerCase();
						})
						.join("");
					setPlayerRes(chars);
					// If found, focus the next field
					if (nextSibling !== null) {
						nextSibling.focus();
					}
				} else alert("last");
			}
		};

	const handleWordKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		const input = e.currentTarget;
		const [_, fieldIndexRaw] = input.name.split("-");
		const fieldIndex = Number(fieldIndexRaw) || 0;

		if (e.key === "Backspace" && input.value === "" && fieldIndex > 0) {
			const prevInput = document.querySelector(`input[name=ssn-${fieldIndex - 1}]`) as HTMLInputElement | null;
			if (prevInput) {
				prevInput.value = "";
				prevInput.focus();
			}
		}

		const totalFields = Number(input.id) || 0;
		const chars = Array.from({ length: totalFields })
			.map((_, idx) => {
				const node = document.querySelector(`input[name=ssn-${idx}]`) as HTMLInputElement | null;
				return (node?.value || "").toLowerCase();
			})
			.join("");
		setPlayerRes(chars);
	};
	const getCongratsGrade = (punts: any) => {
		const congrats =
			punts > 10
				? "Enhorabona!\nHas guanyat la partida amb una puntuació espectacular!"
				: punts < 5
				? "Enhorabona! Has guanyat la partida..però pel pèls..;)"
				: "Enhorabona!!\nHas guanyat la partida!";
		return congrats;
	};
	useEffect(() => {
		let unsubscribeGameUpdate: (() => void) | null = null;
		const unsubscribeConnected = socketService.onConnected((socket) => {
			if (unsubscribeGameUpdate) unsubscribeGameUpdate();
			unsubscribeGameUpdate = gameService.onGameUpdate(socket, (newChances, newTimes) => {
				setChances(newChances);
				setTimes(newTimes);
				recomputeResults(newChances, newTimes);
				setFase(Number(newChances[5][0]) || 0);

				const isLastRoundFinished = newChances[4].every((r) => r !== null);
				const isGameFinished = (Number(newChances[5][0]) || 0) >= 5 || isLastRoundFinished;

				if (isGameFinished) {
					setPlayerTurn(false);
					setGameEnded(true);
				} else {
					setPlayerTurn(true);
				}
			});
		});

		return () => {
			unsubscribeConnected();
			if (unsubscribeGameUpdate) unsubscribeGameUpdate();
		};
	}, []);
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
		if (socketService.socket && room) {
			await gameService.cancelGameRoom(socketService.socket, room).catch(() => {});
		}
		setInRoom(false);
		setGameEnded(false);
		setGameStarted(false);
		setPlayerTurn(false);
		setRoom("");
		setFase(0);
		setPlayerRes("");
		setReportedWinner("");
	};
	const handleInputRes = (e: React.ChangeEvent<any>) => {
		e.preventDefault();
		const inputRes = e.target.value.toLowerCase();
		setPlayerRes(inputRes);
	};

	return (
		<EnctContainer>
			<EnctBox bgEffect={back}>
				<EnctTitle>
						{!isGameStarted && (
							<WaitForOther>
								Sala oberta: {room || "-"}<br />
								Esperant a un altre contrincant per a començar...
							</WaitForOther>
						)}
					{isGameStarted && (
						<div className="d-flex flex-row justify-content-around">
							<span>SALA: {room}</span>
							<h3>Jugador: {playerSymbol}</h3>
							<span>Fase: {fase}</span>
							<span>Punts: {punts[playerSymbol === "A" ? 0 : 1]}</span>
							<span>
								<div className={back ? "effect" : "effect effecton"} onClick={() => handleBackground()}>
									😀
								</div>
								<div className={sound ? "effect" : "effect effecton"} onClick={() => handleSound()}>
									🤐
								</div>
							</span>
						</div>
					)}
				</EnctTitle>
			</EnctBox>
			{isGameEnded ? (
				<>
					<EnctBox bgEffect={back}>
						<ParaulesRespostesBox>
							<h4>La partida ha finalitzat</h4>
							<ChancesContainer>
								<div className={playerSymbol === "A" ? "or1 block l" : "or2 block l"}>
									<h5 className={playerSymbol === "A" ? "teu" : "seu"}>
										{playerSymbol === "A" ? "Les teves respostes" : "Les seves respostes"}
									</h5>
									{chances.map((chance, index) =>
										index < 5 ? (
											<div>
												{index === 0 ? (
													<ul key={index} className="respostes-header">
														<li className={playerSymbol === "B" ? "or1" : "or3"}>temps</li>
														<li className="or2">paraula</li>
														<li className={playerSymbol === "B" ? "or3" : "or1"}>resultat</li>
													</ul>
												) : null}
												{chance[0] ? (
													<div className="resultlist">
														<span className={playerSymbol === "B" ? "or1 " : "or2 "}>
															{playerSymbol === "A" ? (
																<>
																	<span className="paraula">{handleName(chance[0], false)}</span>
																	<span className="remaining">({times[index][0]} s.)</span>
																</>
															) : (
																<>
																	<span className="remaining">({times[index][0]} s.)</span>
																	<span className="paraula">{handleName(chance[0], false)}</span>
																</>
															)}
														</span>
															<span className={playerSymbol === "A" ? "or1 index" : "or2 index"}>
																{getRoundIconClass(index, 0) === "wrong" ? (
																	<span className="wrong-x">X</span>
																) : (
																	<img className={getRoundIconClass(index, 0)} src="/asterisc_encreuat.svg" alt="" />
																)}
															</span>
													</div>
												) : null}
											</div>
										) : null
									)}
								</div>
								<div className={playerSymbol === "B" ? "or1 block l" : "or2 block l"}>
									<h5 className={playerSymbol === "B" ? "teu" : "seu"}>
										{playerSymbol === "B" ? "Les teves respostes" : "Les seves respostes"}
									</h5>
									{chances.map((chance, index) =>
										index < 5 ? (
											<div>
												{index === 0 ? (
													<ul key={index} className="respostes-header">
														<li className={playerSymbol === "A" ? "or1" : "or3"}>temps</li>
														<li className="or2">paraula</li>
														<li className={playerSymbol === "A" ? "or3" : "or1"}>resultat</li>
													</ul>
												) : null}
												{chance[1] ? (
													<div className="resultlist">
														<span className={playerSymbol === "B" ? "or2" : "or1"}>
															{playerSymbol === "B" ? (
																<>
																	<span className="paraula">{handleName(chance[1], false)}</span>
																	<span className="remaining">({times[index][1]} s.)</span>
																</>
															) : (
																<>
																	<span className="remaining">({times[index][1]} s.)</span>
																	<span className="paraula">{handleName(chance[1], false)}</span>
																</>
															)}
														</span>
															<span className={playerSymbol === "A" ? "or2 index" : "or1 index"}>
																{getRoundIconClass(index, 1) === "wrong" ? (
																	<span className="wrong-x">X</span>
																) : (
																	<img className={getRoundIconClass(index, 1)} src="/asterisc_encreuat.svg" alt="" />
																)}
															</span>
													</div>
												) : null}
											</div>
										) : null
									)}
								</div>
							</ChancesContainer>
						</ParaulesRespostesBox>
					</EnctBox>
						<EnctBox bgEffect={back}>
							<ParaulesIdecBox>
							<Congrats>
								{punts[0] > punts[1] ? (
									playerSymbol === "A" ? (
										<>
											<Confetti
												colors={["#E7B141", "#569F99"]}
												drawShape={(ctx) => {
													ctx.fillRect(2, 2, 5, 8);
												}}
											/>
											<h4>{getCongratsGrade(punts[0])}</h4>
										</>
									) : (
										<>
											<h4>
												Has perdut... :-(
												<br />
												Torna-hi!
											</h4>
										</>
									)
								) : punts[0] === punts[1] ? (
									punts[1] > 0 ? (
										<>
											<h4>
												Taules ;)
												<br />
												Bona partida!
											</h4>
										</>
									) : (
										<>
											<h4>
												Si tu passes...
												<br />
												jo també passo ;)
											</h4>
										</>
									)
								) : playerSymbol === "B" ? (
									<>
										<Confetti
											colors={["#E7B141", "#569F99"]}
											drawShape={(ctx) => {
												ctx.fillRect(2, 2, 3, 6);
											}}
										/>
										<h4>{getCongratsGrade(punts[1])}</h4>
									</>
								) : (
									<>
										<h4>
											Has perdut! :-(
											<br />
											Torna-hi!
										</h4>
									</>
								)}
							</Congrats>
						</ParaulesIdecBox>
					</EnctBox>
					<EnctBox bgEffect={back}>
						<ParaulesIdecBox>
							<h4>Respostes correctes</h4>
							<ul>
								{[...dades].map((dada: any, index: number) => {
									return (
										<li key={index}>
											<h5>{dada.d.nom}</h5>
											<p>{dada.d.descripcio}</p>
										</li>
									);
								})}
							</ul>
								<div className="thankyou">
									<span>Agraïments a:</span>
									<a href="https://dlc.iec.cat/" rel="noreferrer" target="_blank">
										<img src="/LOGO_IEC2.png" alt="" />
									</a>
								</div>
								<EnctBotoneraBox>
									<button className="btn btn-danger" type="button" onClick={goToNewGame}>
										TORNAR A JUGAR
									</button>
								</EnctBotoneraBox>
							</ParaulesIdecBox>
						</EnctBox>
				</>
			) : null}
			{isGameStarted && !isGameEnded ? (
				<>
					<EnctBox bgEffect={back}>
						<ParaulesRespostesBox>
							<EnctInfo>
								<RespostesBoxContainer>
										<div className={playerSymbol === "A" ? "or1 l marcador" : "or2 r marcador"}>
											<span>{playerAName || "Jugador A"}</span>
										<RespostesBox>
											{chances.map((chance, index) =>
												index < 5 ? (
													chance[0] === null ? (
														index !== fase ? (
															<Muerte key={index} />
														) : (
															<VidaActiva key={index} />
														)
													) : playerSymbol === "A" ? (
														<Vida key={index} />
													) : (
														<Vida key={index} />
													)
												) : null
											)}
										</RespostesBox>
									</div>
									<div className="or3 marcadorcentral">
										<h4>Respostes</h4>
										{isPlayerTurn && fase < 5 ? (
											<CountDownTimer
												soundActive={sound}
												inititalSeconds="60"
												onendtimer={() => handleTimer()}
												setRemaining={handleRemaining}
											/>
										) : null}
									</div>
										<div className={playerSymbol === "B" ? "or1 r marcador" : "or2 r marcador"}>
											<span>{playerBName || "Jugador B"}</span>
										<RespostesBox>
											{chances.map((chance, index) =>
												index < 5 ? (
													chance[1] === null ? (
														index !== fase ? (
															<Muerte key={index} />
														) : (
															<VidaActiva key={index} />
														)
													) : playerSymbol === "B" ? (
														<Vida key={index} />
													) : (
														<Vida key={index} />
													)
												) : null
											)}
										</RespostesBox>
									</div>
								</RespostesBoxContainer>
							</EnctInfo>
						</ParaulesRespostesBox>
					</EnctBox>

					<EnctBox bgEffect={back}>
						<DefinicioBox>
							{isPlayerTurn && fase < 5 ? (
								<>
									<h4>Definició:</h4>
									<p>{dades[fase].d.descripcio}</p>
								</>
							) : (
								<>
									{!isPlayerTurn ? (
										<span className="d-flex flex-row justify-content-center align-center">
											<img src="/loading_balls.svg" alt="" /> Torn del contrincant
										</span>
									) : null}
								</>
							)}

							<WordFieldBox>
								<ParaulaBox>
									{isPlayerTurn && fase < 5
										? dades[fase].d.nom.split("").map((x: string, index: number) => (
												<>
													<input
														type="text"
														name={`ssn-${index}`}
														maxLength={1}
														autoFocus={index === 0 ? true : undefined}
														placeholder={index === 0 ? x : undefined}
															id={dades[fase].d.nom.length}
															onChange={handleChangeLetter}
															onKeyDown={handleWordKeyDown}
														/>
													{/* <WordField key={index}>
														<span>{index === 0 ? x : `*`}</span>
													</WordField> */}
												</>
										  ))
										: null}
								</ParaulaBox>
							</WordFieldBox>
						</DefinicioBox>
					</EnctBox>
					{isPlayerTurn && fase < 5 ? (
						<EnctBox bgEffect={back}>
							<EnctRespostaForm
								onKeyDown={(e) => {
									e.key === "Enter" && e.preventDefault();
								}}>
								{/* <h4>La teva resposta</h4>
								<input type="text" required data-errormessage-value-missing="Digues quelcom raonable.." onChange={handleInputRes} /> */}
								<EnctBotoneraBox>
									<button
										className="btn btn-secondary"
										type="button"
										onClick={(e: any) => updateGameChances(e, fase, playerSymbol === "A" ? 0 : 1, "Passo")}>
										PASSAR
									</button>
									<button
										className="btn btn-danger"
										type="button"
										onKeyPress={(e) => {
											e.key === "Enter" && e.preventDefault();
										}}
										onClick={(e: any) => updateGameChances(e, fase, playerSymbol === "A" ? 0 : 1, playerRes)}>
										ENVIAR
									</button>
								</EnctBotoneraBox>
							</EnctRespostaForm>
						</EnctBox>
					) : null}
				</>
			) : !isGameEnded ? (
				<EnctBoxLoader bgEffect={back}>
					<img src="/loading_balls.svg" alt="" />
				</EnctBoxLoader>
			) : null}
		</EnctContainer>
	);
};
