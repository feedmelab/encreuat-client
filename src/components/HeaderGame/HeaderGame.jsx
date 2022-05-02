import React from "react";

import { LogoContainer, LogoFeedMe, DisplayHelp } from "./HeaderGame.styles";

const HeaderGame = () => (
	<div className="container-fluid d-flex flex-row justify-content-around  pt-3 pb-3">
		<LogoFeedMe>
			<img src="/fblogo.jpg" alt="feedmelab brand" />
		</LogoFeedMe>
		<LogoContainer>
			<img src="/logo_encreuat.svg" alt="Emblema encreua't" />
		</LogoContainer>
		<DisplayHelp>
			<span>?</span>
		</DisplayHelp>
	</div>
);

export default HeaderGame;
