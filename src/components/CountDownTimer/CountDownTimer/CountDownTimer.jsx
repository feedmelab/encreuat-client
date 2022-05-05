import React, { useEffect, useState } from "react";
import { WrapperCountDownTimer } from "./CountDownTimer.styles";
const { Howl, Howler } = require("howler");

const CountDownTimer = (props: any) => {
	const { onendtimer, setRemaining, initialSeconds = 60, soundActive } = props;
	const [seconds, setSeconds] = useState(initialSeconds);
	const sound = new Howl({
		src: ["/sounds/dong.mp3"],
		onplayerror: function () {
			sound.once("unlock", function () {
				sound.play();
			});
		},
		volume: 0.5,
	});

	useEffect(() => {
		Howler.autoUnlock = false;
		let myInterval = setInterval(() => {
			if (seconds > 0) {
				setSeconds((prevSeconds) => (prevSeconds -= 1));
				if (seconds > 0 && seconds - 1 < 5) {
					if (soundActive) {
						sound.rate(seconds - 1 === 0 ? "1.1" : "0.5");

						sound.play();
					}
				}
			}
			if (seconds === 0) {
				setSeconds(0);
				onendtimer();
				clearInterval(myInterval);
			}
		}, 1000);

		return () => {
			setRemaining(seconds);
			clearInterval(myInterval);
		};
	});
	return (
		<WrapperCountDownTimer>
			{<span className={seconds === 0 ? `torntrue lastsecondfade` : `torntrue`}>El teu torn</span>}
			{seconds === -1 ? null : (
				<span className={seconds < 5 ? (seconds === 0 ? `lastsecond lastsecondfade number` : `lastseconds number`) : `number`}>
					{seconds}
				</span>
			)}
		</WrapperCountDownTimer>
	);
};

export default CountDownTimer;
