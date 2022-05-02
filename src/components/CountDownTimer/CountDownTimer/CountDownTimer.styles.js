import styled, { keyframes } from "styled-components";
export const blink = keyframes`
	0%{ transform: scale( 1 ) }
	20%{ transform: scale( 1.15 ) }
	40%{ transform: scale( 1 ); color: var(--color-secondary); }
	60%{ transform: scale( 1.1 ) }
	80%{ transform: scale( 1 ) }
	100%{ transform: scale( 1 ) }
`;
export const blinkxs = keyframes`
	0%{ color:  var(--color-primary) }
	50%{ color: var(--color-secondary); }
	100%{ color: var(--color-secondary); }
`;
export const WrapperCountDownTimer = styled.div`
	display: flex;
	flex-direction: row;
	align-items: space-around;
	justify-content: space-between;
	letter-spacing: 0.03rem;
	span.number {
		display: flex;
		align-items: center;
		justify-content: center;
		/*color: white;
		 animation: ${blinkxs} 1s infinite; 
		background-color: white;*/
		border-radius: 50%;
		width: 50%;
		text-shadow: none;
		font-size: 0.9rem;
	}
	span.lastseconds {
		color: red;
		animation: ${blinkxs} 1s infinite;
	}
	span.lastsecond {
		color: #ff8888;
		animation: none !important;
	}
	.lastsecondfade {
		visibility: hidden;
		opacity: 0;
		transition: visibility 0s 1s, opacity 1s linear;
	}

	span.torntrue {
		font-size: 0.5rem;
		width: 50%;
		font-weight: normal;
		color: var(--color-secondary);
	}
`;
