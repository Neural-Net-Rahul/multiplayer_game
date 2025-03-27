import "./App.css";
import Footer from "./components/Footer";
import GameComponent from "./components/GameComponent";
import Header from "./components/Header";
import socket from "./socket";
import tictactoe from "../public/tictactoe.png"; //
import chess from "../public/chess.png"; 
import connect4 from "../public/connect4.png";
import checkers from "../public/checkers.png";
import battleship from "../public/battleship.png";
import { useEffect } from "react";

const generateRandomId = () => {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let randomId = "";
  for (let i = 0; i < 12; i++) {
    randomId += chars[Math.floor(Math.random() * chars.length)];
  }
  return randomId;
};

function App() {
  useEffect(() => {
    socket.connect();
  }, []);

  return (
    <div>
      <Header />
      <div className="text-center py-10">
        <h1 className="text-4xl font-bold text-gray-600">
          Play together with your friends
        </h1>
        <p className="text-lg text-gray-500 mt-2">
          <b className="text-red-400">How to play?</b> Share roomId with your
          friends, and play together.
        </p>
      </div>

      <div className="flex flex-wrap bg-slate-300 p-6 gap-6">
        <GameComponent
          title={"tictactoe"}
          name={"Tic Tac Toe"}
          description={
            "A classic 3x3 grid game where two players compete to form a line of three marks."
          }
          roomId={generateRandomId()}
          image={tictactoe}
        />
        <GameComponent
          title={"chess"}
          name={"Chess"}
          description={
            "A strategic board game where players move pieces to checkmate their opponent's king."
          }
          roomId={generateRandomId()}
          image={chess}
        />
        <GameComponent
          title={"connect4"}
          name={"Connect 4"}
          description={
            "A two-player game where the goal is to connect four discs in a row before your opponent."
          }
          roomId={generateRandomId()}
          image={connect4}
        />
        <GameComponent
          title={"checkers"}
          name={"Checkers"}
          description={
            "A board game where players jump over opponent pieces to remove them and win the game."
          }
          roomId={generateRandomId()}
          image={checkers}
        />
        <GameComponent
          title={"battleship"}
          name={"Battleship"}
          description={
            "A guessing game where players aim to sink each other's fleet of ships on a hidden grid."
          }
          roomId={generateRandomId()}
          image={battleship}
        />
      </div>
      <Footer />
    </div>
  );
}

export default App;
