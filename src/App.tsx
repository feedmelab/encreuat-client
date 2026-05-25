import React, { useEffect, useState } from 'react';
import { Container } from 'react-bootstrap';
import HeaderGame from './components/HeaderGame/HeaderGame';
import socketService from './services/socketService';
import gameService from './services/gameService';
import { JoinRoom } from './components/JoinRoom/index';
import GameContext, { IEncreuatGameContextProps } from './gameContext';
import { EncreuatGame } from './components/EncreuatGame';

const App = () => {
  const [isInRoom, setInRoom] = useState(false);
  const [playerSymbol, setPlayerSymbol] = useState<string>('');
  const [isPlayerTurn, setPlayerTurn] = useState(false);
  const [isGameStarted, setGameStarted] = useState(false);
  const [isPreparingGame, setPreparingGame] = useState(false);
  const [isGameEnded, setGameEnded] = useState<boolean>(false);
  const [dades, setDades] = useState<Array<string>>([]);
  const [room, setRoom] = useState<string>('');
  const [fase, setFase] = useState<number>(0);
  const [playerRes, setPlayerRes] = useState<string>('');
  const [playerName, setPlayerName] = useState<string>(
    () => localStorage.getItem('encreuat_player_name') || '',
  );
  const [playerAName, setPlayerAName] = useState<string>('');
  const [playerBName, setPlayerBName] = useState<string>('');
  const [matchId, setMatchId] = useState<string>('');

  const connectSocket = async () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    //const urlDeploy = "http://localhost:9000";
    const urlProd = 'https://api-encreuat.feedmelab.com';
    await socketService.connect(urlProd).catch((err) => {
      console.log('Error: ', err);
    });
  };

  useEffect(() => {
    connectSocket();
  }, []);

  useEffect(() => {
    let unsubscribeStartGame: (() => void) | null = null;
    let unsubscribeGamePreparing: (() => void) | null = null;
    const unsubscribeConnected = socketService.onConnected((socket) => {
      if (unsubscribeStartGame) unsubscribeStartGame();
      if (unsubscribeGamePreparing) unsubscribeGamePreparing();
      unsubscribeGamePreparing = gameService.onGamePreparing(socket, () => {
        setPreparingGame(true);
      });
      unsubscribeStartGame = gameService.onStartGame(socket, (options) => {
        setDades(options.dades);
        setGameStarted(true);
        setPreparingGame(false);
        setPlayerSymbol(options.symbol);
        setRoom(options.room);
        setPlayerAName(options?.players?.A || '');
        setPlayerBName(options?.players?.B || '');
        setMatchId(options?.matchId || '');
        setPlayerTurn(!!options.start);
        setInRoom(true);
      });
    });

    return () => {
      unsubscribeConnected();
      if (unsubscribeStartGame) unsubscribeStartGame();
      if (unsubscribeGamePreparing) unsubscribeGamePreparing();
    };
  }, []);

  const gameContextValue: IEncreuatGameContextProps = {
    isInRoom,
    setInRoom,
    playerSymbol,
    setPlayerSymbol,
    isPlayerTurn,
    setPlayerTurn,
    isGameStarted,
    setGameStarted,
    isPreparingGame,
    setPreparingGame,
    isGameEnded,
    setGameEnded,
    room,
    setRoom,
    fase,
    setFase,
    playerRes,
    setPlayerRes,
    dades,
    setDades,
    playerName,
    setPlayerName,
    playerAName,
    setPlayerAName,
    playerBName,
    setPlayerBName,
    matchId,
    setMatchId,
  };

  return (
    <GameContext.Provider value={gameContextValue}>
      <Container>
        <HeaderGame></HeaderGame>
        {!isInRoom && <JoinRoom />}
        {isInRoom && <EncreuatGame />}
      </Container>
    </GameContext.Provider>
  );
};

export default App;
