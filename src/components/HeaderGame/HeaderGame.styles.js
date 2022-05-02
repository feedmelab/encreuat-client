import styled from "styled-components";

export const CellBox = styled.div`
	display: flex;
	flex-direction: column;
	padding: 2rem;
	width: 100%;
	align-items: center;
	justify-content: center;
	border-top-left-radius: 2rem;
	border-top-right-radius: 2rem;
	font-family: "Varela Round", sans-serif;
`;
export const LogoContainer = styled.div`
	display: flex;
	justify-content: center;
	width: 100%;
	img {
		width: 15rem;
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
export const DisplayHelp = styled.div`
	display: flex;
	width: 3rem;
	justify-content: center;
	align-items: center;
	span {
		display: flex;
		width: 2.54rem;
		height: 2.54rem;
		border: 1px solid var(--border);
		border-radius: 0.6rem;
		color: red;
		background: var(--background);
		justify-content: center;
		align-items: center;
	}
`;
