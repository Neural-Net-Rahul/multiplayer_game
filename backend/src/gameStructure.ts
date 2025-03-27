const initializeBoard = (gameName:string) => {
    if(gameName === 'tictactoe'){
        const tictactoe = [
          [null, null, null],
          [null, null, null],
          [null, null, null],
        ];
        return tictactoe;
    }
}

export default initializeBoard;