"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const initializeBoard = (gameName) => {
    if (gameName === 'tictactoe') {
        const tictactoe = [
            [null, null, null],
            [null, null, null],
            [null, null, null],
        ];
        return tictactoe;
    }
};
exports.default = initializeBoard;
