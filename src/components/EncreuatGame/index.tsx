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
		setDades,
	} = useContext(gameContext);

	const [remaining, setRemaining] = useState<number | null>(null);
	const timeToPlay: number = 60;
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
	const handleGameUpdate = () => {
		if (socketService.socket)
			gameService.onGameUpdate(socketService.socket, (newChances, newTimes) => {
				setChances(newChances);
				setTimes(newTimes);
				handleGameUpdate();
				setPlayerTurn(true);
				checkLastRound(newChances);
			});
	};
	const handleStage = () => {
		if (fase < 5) {
			const faltanRespuestas = times[fase].filter((r) => r === null);

			if (faltanRespuestas.length === 0) {
				//if time is less say time win or tie
				const timeWinner = times[fase].reduce((acc, curr) => {
					if (acc === curr) return "AB";
					return acc < curr ? "A" : "B";
				});

				//if word is ok push to winners
				const winners: any = [];
				const paraulaWinner = chances[fase].filter((chance, index) => {
					let pa = chance?.toString();
					if (pa !== "Passo" && pa === dades[fase].d.nom) {
						winners.push(index === 0 ? "A" : "B");
					}

					return index === 1 ? winners.join("") : null;
				});

				const newresultatTemps = [...resultatTemps];
				const newresultatParaula = [...resultatParaula];
				const newresultatFinal = [...resultatFinal];

				newresultatTemps[fase] = String(timeWinner);
				newresultatParaula[fase] = [...winners];

				const npunts = [...punts];

				// hi ha tie de parules
				if (String(newresultatParaula[fase]) === "A,B") {
					newresultatFinal[fase] = newresultatTemps[fase];
					npunts[0] = npunts[0] += newresultatFinal[fase] === "A" ? 3 : newresultatFinal[fase] === "AB" ? 1 : 2;
					npunts[1] = npunts[1] += newresultatFinal[fase] === "B" ? 3 : newresultatFinal[fase] === "AB" ? 1 : 2;
				} else if (String(newresultatParaula[fase]) !== "") {
					newresultatFinal[fase] = String(newresultatParaula[fase]);
					npunts[String(newresultatParaula[fase]) === "A" ? 0 : 1] = punts[String(newresultatParaula[fase]) === "A" ? 0 : 1] += 3;
				}

				setPunts(npunts);
				setresultatParaula(newresultatParaula);
				setresultatTemps(newresultatTemps);
				setresultatFinal(newresultatFinal);
				setFase(chances[5][0]);
			}
		}
	};

	const handleName = (name: any, flag: boolean) => {
		const n = name.replace(/[a-zA-ZÀ-ú]/gi, "*");
		return flag ? n : name;
	};

	const handleTimer = () => {
		if (fase < 5) updateGameChances(null, fase, playerSymbol === "A" ? 0 : 1, "Passo");
	};
	const handleStartJoc = () => {
		if (socketService.socket)
			gameService.onStartGame(socketService.socket, (options) => {
				setDades(options.dades);

				setGameStarted(true);
				setPlayerSymbol(options.symbol);
				setRoom(options.room);
				if (options.start) setPlayerTurn(true);
				else setPlayerTurn(false);
			});
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

				setPlayerRes((prevValue) => {
					if (prevValue.length >= fieldIndex) {
						//prevValue = prevValue.slice(0, -1);
					}
					return prevValue + value.toLowerCase();
				});
				// If found, focus the next field
				if (nextSibling !== null) {
					nextSibling.focus();
				}
			} else alert("last");
		}
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
		handleGameUpdate();
	});
	useEffect(() => {
		handleStage();
	});
	useEffect(() => {
		handleStartJoc();
	});

	const handleInputRes = (e: React.ChangeEvent<any>) => {
		e.preventDefault();
		const inputRes = e.target.value.toLowerCase();
		setPlayerRes(inputRes);
	};

	return (
		<EnctContainer>
			<EnctBox bgEffect={back}>
				<EnctTitle>
					{!isGameStarted && <WaitForOther>Esperant a un altre contrincant per a començar...</WaitForOther>}
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
															<img
																className={resultatTemps[index] === "AB" ? "pair" : resultatTemps[index] === "A" ? "win" : "loose"}
																src="/asterisc_encreuat.svg"
																alt=""
															/>
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
															<img
																className={resultatTemps[index] === "AB" ? "pair" : resultatTemps[index] === "B" ? "win" : "loose"}
																src="/asterisc_encreuat.svg"
																alt=""
															/>
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
								<a href="https://vilaweb.cat/" rel="noreferrer" target="_blank">
									<img src="/vilaweb.png" alt="" />
								</a>
							</div>
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
										<span>Jugador A</span>
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
										<span>Jugador B</span>
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
