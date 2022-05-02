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
	grid-template-rows: 1fr 1fr;
	grid-gap: 1rem;
	@media only screen and (min-width: 768px) {
		grid-template-columns: 1fr 1fr;
		grid-gap: 1rem;
	}
`;

export const RoomsBox = styled.div`
	border: 1px solid transparent;
	color: var(--textclar);
	border-radius: 0.5rem;
	background: var(--bg-container);
	box-shadow: 0.1rem 0.05rem 0.32rem #444;
	padding: 1.5rem;
	display: flex;
	flex-direction: column;
	justify-content: space-around;
`;

export const WelcomeMessage = styled.h2`
	width: 75%;
	flex-wrap: wrap;
	line-height: 1.8rem;
	font-size: 1.6rem;
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
	grid-template-columns: 1fr 1fr;
	grid-gap: 0.4rem;
	justify-items: stretch;
`;
export const RoomIdInput = styled.input`
	width: 100%;
	border-radius: 0.3rem;
	border: 1px solid var(--text);
	outline: none;
	padding: 0 0.86rem;
	color: black;
	font-size: 0.6rem;
	background: var(--back-white);
	font-family: "Orbitron", sans-serif;

	text-transform: uppercase;
	letter-spacing: 0.02rem;
	&:hover {
		transition: 0.6s ease;

		letter-spacing: 0.12rem;
		background: var(--bg-childs);
		border: 3px solid var(--text);
	}
	&:visited {
		background: var(--bg-childs);
	}
`;
export const JoinButton = styled(Button)`
	border: 0px solid var(--border);
	background: var(--bg-childs);

	text-shadow: 1px 1px rgb(0, 0, 80);

	&:hover {
		animation: ${swing} 1s ease;
		animation-iteration-count: 1;
		border: 0px solid var(--border);

		background: var(--btn-up);
	}
`;
