import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { ArrowLeft, RotateCcw, Trophy } from "lucide-react";
import { useNavigate } from "react-router-dom";
import confetti from 'canvas-confetti';

type Player = 'X' | 'O' | null;

const TicTacToe = () => {
  const navigate = useNavigate();
  const [board, setBoard] = useState<Player[]>(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState<boolean>(true);
  const [scores, setScores] = useState({ X: 0, O: 0 });

  const calculateWinner = (squares: Player[]) => {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return { winner: squares[a], winningLine: [a, b, c] };
      }
    }
    if (!squares.includes(null)) {
      return { winner: 'Draw', winningLine: [] };
    }
    return null;
  };

  const winInfo = calculateWinner(board);
  const winner = winInfo?.winner;
  const winningLine = winInfo?.winningLine || [];

  const handleClick = (index: number) => {
    if (board[index] || winner) return;

    const newBoard = [...board];
    newBoard[index] = isXNext ? 'X' : 'O';
    setBoard(newBoard);
    setIsXNext(!isXNext);

    const newWinInfo = calculateWinner(newBoard);
    if (newWinInfo?.winner && newWinInfo.winner !== 'Draw') {
      setScores(prev => ({
        ...prev,
        [newWinInfo.winner as string]: prev[newWinInfo.winner as keyof typeof prev] + 1
      }));
    }
  };

  useEffect(() => {
    if (winner && winner !== 'Draw') {
      const duration = 2.5 * 1000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 5,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: winner === 'X' ? ['#f43f5e', '#fda4af'] : ['#0ea5e9', '#7dd3fc'],
          zIndex: 100
        });
        confetti({
          particleCount: 5,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: winner === 'X' ? ['#f43f5e', '#fda4af'] : ['#0ea5e9', '#7dd3fc'],
          zIndex: 100
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      frame();
    }
  }, [winner]);

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setIsXNext(true);
  };

  const getStatus = () => {
    if (winner === 'Draw') return "It's a Draw!";
    if (winner) return `Player ${winner} Wins!`;
    return `Player ${isXNext ? 'X' : 'O'}'s Turn`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-indigo-950 flex flex-col items-center py-8 relative overflow-hidden">
      {/* Decorative background blobs */}
      <div className="absolute top-20 -left-20 w-72 h-72 bg-purple-600/30 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 -right-20 w-80 h-80 bg-blue-600/30 rounded-full blur-3xl animate-pulse delay-700"></div>

      <div className="w-full max-w-lg px-4 flex justify-between items-center mb-8 relative z-10">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/mini-games')}
          className="text-white hover:bg-white/20 transition-all font-semibold rounded-xl backdrop-blur-md border border-white/10"
        >
          <ArrowLeft className="w-5 h-5 mr-2" /> Back
        </Button>
        <div className="flex gap-4">
          <div className="bg-rose-500/20 backdrop-blur-md px-4 py-2 rounded-xl font-bold text-lg text-rose-300 border border-rose-500/30 shadow-[0_0_15px_rgba(244,63,94,0.3)]">
            X : {scores.X}
          </div>
          <div className="bg-sky-500/20 backdrop-blur-md px-4 py-2 rounded-xl font-bold text-lg text-sky-300 border border-sky-500/30 shadow-[0_0_15px_rgba(14,165,233,0.3)]">
            O : {scores.O}
          </div>
        </div>
      </div>

      <div className="relative z-10 flex flex-col items-center w-full max-w-sm">
        <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500 mb-2 drop-shadow-lg tracking-wider">
          TIC TAC TOE
        </h1>
        
        <div className={`text-xl font-bold mb-8 px-6 py-2 rounded-full backdrop-blur-sm border ${
          winner === 'X' ? 'bg-rose-500/20 text-rose-300 border-rose-500/50 shadow-[0_0_20px_rgba(244,63,94,0.4)]' : 
          winner === 'O' ? 'bg-sky-500/20 text-sky-300 border-sky-500/50 shadow-[0_0_20px_rgba(14,165,233,0.4)]' : 
          winner === 'Draw' ? 'bg-gray-500/20 text-gray-300 border-gray-500/50' : 
          'bg-white/10 text-white border-white/20'
        } transition-all duration-300`}>
          {getStatus()}
        </div>

        {/* Game Board */}
        <div className="grid grid-cols-3 gap-3 bg-white/5 p-4 rounded-3xl backdrop-blur-xl border border-white/10 shadow-2xl">
          {board.map((cell, index) => {
            const isWinningCell = winningLine.includes(index);
            return (
              <button
                key={index}
                onClick={() => handleClick(index)}
                disabled={!!cell || !!winner}
                className={`w-24 h-24 sm:w-28 sm:h-28 rounded-2xl text-6xl font-black flex items-center justify-center transition-all duration-300
                  ${!cell && !winner ? 'hover:bg-white/10 cursor-pointer active:scale-95 hover:shadow-[inset_0_0_15px_rgba(255,255,255,0.1)] hover:border hover:border-white/20' : 'cursor-default'}
                  ${cell === 'X' ? 'text-rose-400 drop-shadow-[0_0_15px_rgba(244,63,94,0.8)]' : ''}
                  ${cell === 'O' ? 'text-sky-400 drop-shadow-[0_0_15px_rgba(14,165,233,0.8)]' : ''}
                  ${isWinningCell ? 'bg-white/20 scale-105 ring-4 ring-white/60 winning-cell z-10' : 'bg-white/5 border border-white/5'}
                `}
                style={{
                  transformStyle: 'preserve-3d',
                  transform: cell ? 'rotateY(0deg)' : 'rotateY(180deg)',
                  transition: 'transform 0.4s cubic-bezier(0.4, 0.2, 0.2, 1), background-color 0.2s',
                }}
              >
                <div 
                  className={cell ? 'animate-bounce-in' : ''}
                  style={{ transform: cell ? 'rotateY(0deg)' : 'rotateY(180deg)', transition: 'opacity 0.2s', opacity: cell ? 1 : 0 }}
                >
                  {cell}
                </div>
              </button>
            );
          })}
        </div>

        {/* Reset Button */}
        <Button 
          size="lg"
          onClick={resetGame}
          className={`mt-10 px-8 py-6 rounded-2xl text-lg font-bold transition-all duration-300 ${
            winner 
              ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-[0_0_20px_rgba(168,85,247,0.5)] hover:scale-105' 
              : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
          }`}
        >
          <RotateCcw className={`w-6 h-6 mr-3 ${winner ? 'animate-spin-once' : ''}`} /> 
          {winner ? 'PLAY AGAIN' : 'RESET BOARD'}
        </Button>
      </div>

      <style>{`
        @keyframes spin-once {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(-360deg); }
        }
        .animate-spin-once {
          animation: spin-once 0.5s cubic-bezier(0.0, 0.0, 0.2, 1);
        }
        @keyframes bounce-in {
          0% { transform: scale(0.3); opacity: 0; }
          50% { transform: scale(1.15); opacity: 1; }
          70% { transform: scale(0.9); }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-bounce-in {
          animation: bounce-in 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 15px rgba(255,255,255,0.3); transform: scale(1.05); }
          50% { box-shadow: 0 0 35px rgba(255,255,255,0.8); transform: scale(1.1); }
        }
        .winning-cell {
          animation: pulse-glow 1s infinite alternate cubic-bezier(0.4, 0, 0.2, 1);
        }
      `}</style>
    </div>
  );
};

export default TicTacToe;
