import styled from "styled-components";

export const HeaderContainer = styled.header`
	display: flex;
	flex-direction: column;
	padding: 0.3rem 0.9rem 0.8rem 0.9rem;
	width: 100%;
	align-items: center;
	justify-content: flex-start;
`;

export const HeaderTopRow = styled.div`
	width: 100%;
	display: flex;
	justify-content: flex-end;
	margin-bottom: 0.3rem;
`;

export const LogoContainer = styled.div`
	display: flex;
	justify-content: center;
	width: 100%;
	img {
		width: clamp(10rem, 24vw, 15rem);
		display: block;
	}
`;
export const LogoFeedMe = styled.div`
	display: flex;
	width: 3rem;
	height: 3rem;
	justify-content: center;
	align-items: center;
	border: none;
	border-radius: 0.6rem;
	overflow: hidden;
	img {
		width: 2.54rem;
		height: 2.54rem;
	}
`;

export const HeaderSubtitle = styled.p`
	font-family: "Varela Round", sans-serif;
	font-size: 0.9rem;
	color: var(--color-fosc);
	margin: 0.4rem 0 0;
	text-align: center;
`;
