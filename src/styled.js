import { createGlobalStyle } from "styled-components";
// const getHeightDoc = () => {
//   const { scrollHeight: height } = document.body;
//   return {
//     height
//   };
// }

export const GlobalStyle = createGlobalStyle`

    html, * {
        margin: 0;
        padding: 0;
    }
	body {
        text-rendering: optimizelegibility;
        ${"" /* background: url("/background.jpg");  */}
	
        background-size: cover;
        background-color: #f2f2f2;
        
        font-family: 'Lexend', sans-serif;
        display: flex;
        justify-content: space-between;
        align-items: space-between;
        margin: 0;
        padding: 0;
        box-sizing: content-box;
        width: 100%; 
       
	}
    :root {
        --text: #eaeaea;
        --color-primary:  #569F99;
        --color-secondary: #E7B141;
        --color-secondary-3: white;
        --color-clar: #44444422;
        --color-fosc: #363636;
        --textclar: #efefef;
        --text-par: #c3c3c3;
        --textatt: rgba(180, 0, 0, 0.3);
        --shadow: 0.08rem 0.12rem 0rem #777;
        --back-red: rgba( 250, 0, 0, 0.8 );
        
        --btn-down: #45125893;
        --btn-up: #451258;
        --btn-color: white;
        --border: rgba(150,150,150,0.8);
        --bg-pieces: #0d075220;
        --bg-container: var(--color-primary);
        --bg-childs: var(--color-secondary);
        --back-white: var(--color-secondary-3);
        --mb: 1rem;
    }
    i{
        display: inline;
    }
    div#root{
        height: 100vh;
        width: 100vw;
        display: flex;
        justify-content: center;
        align-items: space-around;
        background: #ffffff89;
        padding-top: 0.6rem;
    }
`;
// font-family: 'Yanone Kaffeesatz', sans-serif;
// font-family: 'Rubik Bubbles', cursive;
// font-family: 'Rubik Puddles', cursive;
// font-family: "Work Sans", sans-serif;
//font-family: 'Varela Round', sans-serif;
