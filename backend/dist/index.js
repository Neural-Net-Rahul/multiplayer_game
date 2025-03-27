"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
const dotenv_1 = __importDefault(require("dotenv"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const ioredis_1 = __importDefault(require("ioredis"));
const gameStructure_1 = __importDefault(require("./gameStructure"));
dotenv_1.default.config();
const server = http_1.default.createServer(app_1.app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: "http://localhost:5173",
    },
});
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const redisPub = new ioredis_1.default("redis://localhost:6379");
        const redisSub = new ioredis_1.default("redis://localhost:6379");
        redisPub.on("connect", () => {
            console.log("Publisher is connected");
        });
        redisSub.on("connect", () => {
            console.log("Subscriber is connected");
        });
        redisPub.on("error", (e) => {
            console.log("Publisher giving error", e);
        });
        redisSub.on("error", (e) => {
            console.log("Subscriber giving error", e);
        });
        const currentGames = new Map();
        // redisSub.on("message", (channel, message) => {
        //   console.log("message: ", message);
        //   const { board, chat, gameName } = JSON.parse(message);
        //   currentGames.set(String(channel), { gameName, board, chat: chat });
        //   console.log(`Clients in room ${channel}:`, io.sockets.adapter.rooms.get(channel));
        //   console.log("channel: ", channel);
        //   console.log("board: ", board);
        //   console.log("chat: ", chat);
        //   io.to(String(channel)).emit("new_update", board, chat);
        // });
        io.on("connection", (socket) => {
            console.log("A new connection has established!!!");
            socket.on("join_game", (gameName, id) => __awaiter(this, void 0, void 0, function* () {
                const roomId = id;
                socket.join(String(roomId));
                console.log(`Attempting to subscribe to room: ${roomId}`);
                // try {
                //   await redisSub.subscribe(roomId);
                //   console.log(`Successfully subscribed to room: ${roomId}`);
                // } catch (error) {
                //   console.error(`Error subscribing to room ${roomId}:`, error);
                // }
                let currentStatus = currentGames.get(String(roomId));
                let currentBoard = "";
                let currentChats = "";
                console.log("id: ", roomId);
                console.log("gameName:", gameName);
                if (!currentStatus) {
                    const game = yield app_1.client.game.findFirst({
                        where: {
                            roomId: String(roomId),
                        },
                    });
                    if (!game) {
                        currentBoard = JSON.stringify((0, gameStructure_1.default)(gameName));
                        currentGames.set(String(roomId), {
                            board: currentBoard,
                            chat: "",
                            gameName,
                        });
                        try {
                            const new_user = yield app_1.client.game.create({
                                data: {
                                    roomId: String(roomId),
                                    gameName,
                                    boardStatus: currentBoard,
                                    chatMessages: "",
                                },
                            });
                            console.log("user: ", new_user);
                        }
                        catch (e) {
                            console.log("Error detected: ", e);
                        }
                    }
                    else {
                        currentGames.set(String(roomId), {
                            gameName,
                            board: game.boardStatus,
                            chat: game.chatMessages,
                        });
                        currentBoard = game.boardStatus;
                        currentChats = game.chatMessages;
                    }
                }
                else {
                    currentBoard = currentStatus.board;
                    currentChats = currentStatus.chat;
                }
                console.log("currentBoard: ", currentBoard);
                console.log("currentChats: ", currentChats);
                socket.emit("join_game_board_chat", currentBoard, currentChats);
            }));
            socket.on("message", (roomId, chatMessage, board, gameName) => __awaiter(this, void 0, void 0, function* () {
                currentGames.set(String(roomId), { gameName, board, chat: chatMessage });
                console.log("updatedBoard: ", JSON.stringify(board));
                yield app_1.client.game.update({
                    where: {
                        roomId: String(roomId),
                    },
                    data: {
                        boardStatus: JSON.stringify(board),
                        chatMessages: JSON.stringify(chatMessage),
                    },
                });
                currentGames.set(String(roomId), {
                    gameName,
                    board: JSON.stringify(board),
                    chat: chatMessage,
                });
                io.to(String(roomId)).emit("new_update", board, chatMessage);
                // redisPub.publish(
                //   String(roomId),
                //   JSON.stringify({ gameName, board, chat: chatMessage })
                // );
            }));
            socket.on("disconnect", () => {
                console.log("A user disconnected with id: ", socket.id);
            });
        });
    });
}
main();
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
