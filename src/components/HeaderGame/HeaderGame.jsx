import React from "react";

import { HeaderContainer, HeaderTopRow, LogoContainer, LogoFeedMe, HeaderSubtitle } from "./HeaderGame.styles";

const HeaderGame = () => (
	<HeaderContainer>
		<HeaderTopRow>
			<LogoFeedMe>
				<img src="/fblogo.jpg" alt="feedmelab brand" />
			</LogoFeedMe>
		</HeaderTopRow>
		<LogoContainer>
			<img src="/logo_encreuat.svg" alt="Emblema encreua't" />
		</LogoContainer>
		<HeaderSubtitle>Troba més paraules que el teu contrincant.</HeaderSubtitle>
	</HeaderContainer>
);

export default HeaderGame;
