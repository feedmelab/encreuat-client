import React from "react";
import CountDownTimer from "../CountDownTimer/CountDownTimer";
import Confetti from "react-confetti";
import { useGameEngine } from "./useGameEngine";

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
	WordFieldBox,
	ParaulaBox,
	ParaulesRespostesBox,
	ParaulesIdecBox,
	EnctBoxLoader,
	RespostesBoxContainer,
	Congrats,
} from "./Encreuat.styles";

export const EncreuatGame = () => {
	const isAutoProvidedChar = (char: string) => /[-’'·\s]/u.test(char);
	const isFixedHintChar = (char: string, index: number) => index === 0 || isAutoProvidedChar(char);

	const {
		punts,
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
	} = useGameEngine();
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
												<input
													key={`${fase}-${index}`}
													type="text"
													name={`ssn-${index}`}
													maxLength={1}
													autoFocus={index === 1 ? true : undefined}
													placeholder={undefined}
													id={dades[fase].d.nom.length}
													defaultValue={isFixedHintChar(x, index) ? x : ""}
													disabled={isFixedHintChar(x, index)}
													onChange={handleChangeLetter}
													onKeyDown={handleWordKeyDown}
												/>
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
