import { useEffect, useState } from "react";
import socket from "../socket";
import { useParams } from "react-router-dom";

const Game = () => {
  const [name, setName] = useState('');
  const { gameName, id } = useParams<{ gameName: string; id: string }>();
  const [messages, setMessages] = useState<
    { name: string; description: string }[]
  >([]);
  const [board, setBoard] = useState<any[][]>(
    Array(3)
      .fill(null)
      .map(() => Array(3).fill(null))
  );
  const [currentPlayer, setCurrentPlayer] = useState("X");
  const [winner, setWinner] = useState<string | null>(null);
  const [chatInput, setChatInput] = useState("");

  useEffect(() => {
    socket.emit("join_game", gameName, id);
  }, [gameName, id]);

  useEffect(() => {
    const handleGameUpdate = (updatedBoard: string, currentChats: string) => {
      try {
        console.log("ent");
        setBoard(JSON.parse(updatedBoard));
        setMessages(JSON.parse(currentChats));
      } catch (error) {
        console.error("Error parsing data:", error);
      }
    };

    socket.on("join_game_board_chat", handleGameUpdate);
    socket.on("new_update", handleGameUpdate);

    return () => {
      console.log("Cleaning happening.................");
      socket.off("join_game_board_chat", handleGameUpdate);
      socket.off("new_update", handleGameUpdate);
    };
  },[])

  const checkWinner = (newBoard: (string | null)[][]) => {
    const lines = [
      ...newBoard,
      ...newBoard[0].map((_, colIndex) => newBoard.map((row) => row[colIndex])),
      [
        [newBoard[0][0], newBoard[1][1], newBoard[2][2]],
        [newBoard[0][2], newBoard[1][1], newBoard[2][0]],
      ],
    ].flat();

    for (const line of lines) {
      if (Array.isArray(line) && line.every((cell: any) => cell === "X"))
        return "X";
      if (Array.isArray(line) && line.every((cell: any) => cell === "O"))
        return "O";
    }
    return null;
  };

  const handleCellClick = (rowIndex: number, colIndex: number) => {
    if (board[rowIndex][colIndex] || winner) return;
    const newBoard = board.map((row:any, rIdx:any) =>
      row.map((cell:any, cIdx:any) =>
        rIdx === rowIndex && cIdx === colIndex ? currentPlayer : cell
      )
    );
    setBoard(newBoard);
    socket.emit("message", id, messages, newBoard, gameName );
    const gameWinner = checkWinner(newBoard);
    if (gameWinner) setWinner(gameWinner);
    setCurrentPlayer(currentPlayer === "X" ? "O" : "X");
  };

  const handleSendMessage = () => {
    if (!chatInput.trim()) return;
    const newMessage = { name: name, description: chatInput };
    const updatedMessages = [...messages, newMessage];
    setMessages(updatedMessages);
    socket.emit("message", id, updatedMessages, board, gameName);
    setChatInput("");
  };

  return (
    <div className="flex flex-col lg:flex-row bg-gray-900 text-white min-h-screen p-6">
      {/* Board Section (Takes Full Width on Mobile, 75% on Desktop) */}
      <div className="w-full lg:w-3/4 flex flex-col items-center justify-center">
        <h1 className="text-4xl font-bold mb-4">Game: {gameName}</h1>
        <div>
          <h2 className="text-lg text-gray-400 mb-4">Room ID: {id}</h2>
          <div className="text-lg mt-2 text-gray-500 ml-7">Enter your name: </div>
          <input
            type="text"
            className="p-2 border-none text-black"
            style={{ border: "2px solid black" }}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <br />
        {winner && (
          <p className="text-2xl text-green-400 mb-4">Winner: {winner}!</p>
        )}

        {gameName === "tictactoe" && (
          <div className="grid grid-cols-3 gap-2 w-full max-w-[450px] h-auto bg-blue-900 p-4 rounded-lg shadow-lg">
            {board.map((row: any, rowIndex: any) =>
              row.map((cell: any, colIndex: any) => (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  className="w-24 h-24 sm:w-32 sm:h-32 flex items-center justify-center border-2 border-blue-500 text-4xl sm:text-5xl font-bold cursor-pointer bg-gray-700 hover:bg-gray-600 transition"
                  onClick={() => handleCellClick(rowIndex, colIndex)}
                >
                  {cell || ""}
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Chat Section (Takes Full Width on Mobile, 25% on Desktop) */}
      <div className="w-full lg:w-1/4 bg-gray-800 p-4 rounded-lg shadow-lg flex flex-col mt-6 lg:mt-0">
        <h3 className="text-xl font-semibold mb-4">Chat</h3>
        <div className="flex-1 space-y-2 overflow-y-auto pr-2 max-h-60 lg:max-h-none">
          {messages.length > 0 ? (
            messages.map((msg, index) => (
              <div key={index} className="p-2 bg-gray-700 rounded">
                <strong className="text-blue-400">{msg.name}</strong>:{" "}
                {msg.description}
              </div>
            ))
          ) : (
            <p className="text-gray-400">No messages yet.</p>
          )}
        </div>
        <div className="mt-4 flex gap-2">
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 p-2 bg-gray-700 rounded border border-gray-600 text-white"
          />
          <button
            onClick={handleSendMessage}
            className="bg-blue-500 hover:bg-blue-600 p-2 rounded transition"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default Game;
