import { app, client } from "./app";
import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";
import Redis from "ioredis";
import initializeBoard from "./gameStructure";

dotenv.config();

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
  },
});

async function main() {
  const redisPub = new Redis("redis://localhost:6379");
  const redisSub = new Redis("redis://localhost:6379");

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

  const currentGames = new Map<
    string,
    { gameName: string; board: string; chat: string }
  >();

  redisSub.on("message", (channel, message) => {
    console.log("message: ", message);
    const { board, chat, gameName } = JSON.parse(message);
    currentGames.set(String(channel), { gameName, board, chat: chat });
    console.log(`Clients in room ${channel}:`, io.sockets.adapter.rooms.get(channel));
    console.log("channel: ", channel);
    console.log("board: ", board);
    console.log("chat: ", chat);
    io.to(String(channel)).emit("new_update", board, chat);
  });

  io.on("connection", (socket) => {
    console.log("A new connection has established!!!");

    socket.on("join_game", async (gameName, id) => {
      const roomId = id;
      socket.join(String(roomId));
      console.log(`Attempting to subscribe to room: ${roomId}`);
      try {
        await redisSub.subscribe(roomId);
        console.log(`Successfully subscribed to room: ${roomId}`);
      } catch (error) {
        console.error(`Error subscribing to room ${roomId}:`, error);
      }
      let currentStatus = currentGames.get(String(roomId));
      let currentBoard = "";
      let currentChats = "";
      console.log("id: ", roomId);
      console.log("gameName:", gameName);
      if (!currentStatus) {
        const game = await client.game.findFirst({
          where: {
            roomId: String(roomId),
          },
        });
        if (!game) {
          currentBoard = JSON.stringify(initializeBoard(gameName));
          currentGames.set(String(roomId), {
            board: currentBoard,
            chat: "",
            gameName,
          });

          try {
            const new_user = await client.game.create({
              data: {
                roomId: String(roomId),
                gameName,
                boardStatus: currentBoard,
                chatMessages: "",
              },
            });
            console.log("user: ", new_user);
          } catch (e) {
            console.log("Error detected: ", e);
          }
        } else {
          currentGames.set(String(roomId), {
            gameName,
            board: game.boardStatus,
            chat: game.chatMessages,
          });
          currentBoard = game.boardStatus;
          currentChats = game.chatMessages;
        }
      } else {
        currentBoard = currentStatus.board;
        currentChats = currentStatus.chat;
      }
      console.log("currentBoard: ", currentBoard);
      console.log("currentChats: ", currentChats);
      socket.emit("join_game_board_chat", currentBoard, currentChats);
    });

    socket.on("message", async (roomId, chatMessage, board, gameName) => {
      currentGames.set(String(roomId), { gameName, board, chat: chatMessage });
      console.log("updatedBoard: ", JSON.stringify(board));
      await client.game.update({
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
      redisPub.publish(
        String(roomId),
        JSON.stringify({ gameName, board, chat: chatMessage })
      );
    });

    socket.on("disconnect", () => {
      console.log("A user disconnected with id: ", socket.id);
    });
  });
}

main();

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
