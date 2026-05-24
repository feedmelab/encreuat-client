import { Button, Container } from "react-bootstrap";
import styled, { keyframes } from "styled-components";

export const swing = keyframes`
	15% {transform: translateX(5px);}
	30% {transform: translateX(-5px);}
	50% {transform: translateX(3px);}
	65% {transform: translateX(-3px);}
	80% {transform: translateX(2px);}
	100% {transform: translateX(0);}
`;

export const JoinRoomContainer = styled(Container)`
	display: grid;
	grid-template-columns: 1fr;
	gap: 0.95rem;
	max-width: 1500px;
	padding: 0 0.7rem 1rem 0.7rem;
	@media only screen and (min-width: 768px) {
		grid-template-columns: 1fr 1fr;
	}
`;

export const RoomsBox = styled.div`
	border: 1px solid var(--border);
	color: var(--textclar);
	border-radius: 0.8rem;
	background: var(--bg-container);
	box-shadow: 0 10px 20px rgba(0, 0, 0, 0.18);
	padding: 1.15rem 1.05rem;
	display: flex;
	flex-direction: column;
	justify-content: flex-start;
	min-height: 11rem;
`;

export const WelcomeMessage = styled.h2`
	width: 100%;
	flex-wrap: wrap;
	line-height: 1.8rem;
	font-size: 1.5rem;
	margin-bottom: var(--mb);
	text-shadow: 0.2rem 0.2rem 0.9rem #000000;
`;

export const RoomPar = styled.h4`
	font-size: 1rem;
	align-items: flex-end;
	color: var(--text);
	text-align: left;
	font-family: "Varela Round", sans-serif;
`;

export const RoomHeader = styled.h4`
	font-size: 1rem;
	align-items: flex-start;
	color: var(--text);
	text-align: left;
	font-family: "Varela Round", sans-serif;
`;
export const EncreuatForm = styled.div`
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
	gap: 0.45rem;
	justify-items: stretch;
	align-items: center;
	margin-top: 0.35rem;
`;
export const RoomIdInput = styled.input`
	width: 100%;
	border-radius: 0.3rem;
	border: 1px solid var(--text);
	outline: none;
	padding: 0.5rem 0.72rem;
	color: black;
	font-size: 0.8rem;
	background: var(--back-white);
	font-family: "Orbitron", sans-serif;

	text-transform: uppercase;
	letter-spacing: 0.02rem;
	transition: border-color 0.2s ease, box-shadow 0.2s ease, letter-spacing 0.2s ease;
	&:hover {
		letter-spacing: 0.04rem;
		border: 1px solid var(--bg-childs);
		box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.2);
	}
	&:focus {
		border: 1px solid var(--bg-childs);
		box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.25);
	}
	&:visited {
		background: var(--bg-childs);
	}
`;
export const JoinButton = styled(Button)`
	border: 0px solid var(--border);
	background: var(--bg-childs);
	font-weight: 700;
	font-size: 0.82rem;
	letter-spacing: 0.02rem;
	padding: 0.5rem 0.65rem;
	text-shadow: 1px 1px rgb(0, 0, 80);

	&:hover {
		animation: ${swing} 1s ease;
		animation-iteration-count: 1;
		border: 0px solid var(--border);

		background: var(--btn-up);
	}
	&:disabled {
		opacity: 0.72;
	}
`;
