import { useNavigate } from "react-router-dom";
import { useState } from "react";

const GameComponent = ({
  title,
  name,
  description,
  roomId,
  image
}: {
  title: string;
  name: string;
  description: string;
  roomId: string
  image : any
}) => {
    const navigate = useNavigate();
    const [value, setValue] = useState(roomId);
  return (
    <div className="bg-gray-900 text-white p-6 rounded-2xl shadow-lg w-96 mx-auto space-y-4 border border-gray-700">
      <img
        src={image}
        alt={title}
        className="w-full h-40 object-cover rounded-lg border border-gray-600"
      />

      <div className="text-xl font-semibold text-gray-200">{name}</div>
      <div className="text-gray-400 text-sm">{description}</div>

      <div className="space-y-2">
        <div className="text-gray-300">Join with Id:</div>
        <div className="flex gap-2">
          <input
            type="text"
            className="w-full p-2 rounded-md bg-gray-800 text-white border border-gray-600 focus:ring-2 focus:ring-gray-400 outline-none"
            placeholder="Enter Room ID"
            value={value}
            onChange={(e) => {
                setValue(e.target.value);
            }}
          />
          <button className="bg-gray-700 p-2 rounded border-gray-100 border" onClick={() => {
            navigate(`/game/${title}/${value}`);            
          }}>Join</button>
        </div>
      </div>
    </div>
  );
};

export default GameComponent;
