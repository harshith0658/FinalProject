import React, { useEffect, useRef, useState } from 'react';
import { Button } from "@/components/ui/button";
import { ArrowLeft, Trophy, Play } from "lucide-react";
import { useNavigate } from "react-router-dom";

const FlappyBird = () => {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);

  // Constants
  const GRAVITY = 0.5;
  const JUMP = -8;
  const PIPE_SPEED = 3;
  const PIPE_SPAWN_RATE = 90; // frames
  const GAP_SIZE = 150;

  // Game state refs (to avoid stale closures in requestAnimationFrame)
  const gameState = useRef({
    birdY: 300,
    velocity: 0,
    pipes: [] as { x: number, y: number, passed: boolean }[],
    frames: 0,
    score: 0
  });

  const requestRef = useRef<number>();

  const resetGame = () => {
    gameState.current = {
      birdY: 300,
      velocity: 0,
      pipes: [],
      frames: 0,
      score: 0
    };
    setScore(0);
    setGameOver(false);
    setIsPlaying(true);
  };

  const jump = () => {
    if (!isPlaying && !gameOver) {
      setIsPlaying(true);
    }
    if (gameOver) return;
    gameState.current.velocity = JUMP;
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        jump();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, gameOver]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const state = gameState.current;

      // Draw background
      // Adding a dynamic gradient background based on score
      const skyTheme = state.score % 20 < 10 ? '#87CEEB' : '#ff9d76'; // Day/Sunset dynamic switch
      ctx.fillStyle = skyTheme;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (isPlaying && !gameOver) {
        state.velocity += GRAVITY;
        state.birdY += state.velocity;
        state.frames++;

        // Spawn pipes
        if (state.frames % PIPE_SPAWN_RATE === 0) {
          const minPipeHeight = 50;
          const maxPipeHeight = canvas.height - GAP_SIZE - minPipeHeight;
          const pipeY = Math.floor(Math.random() * (maxPipeHeight - minPipeHeight + 1) + minPipeHeight);
          
          state.pipes.push({
            x: canvas.width,
            y: pipeY,
            passed: false
          });
        }

        // Update pipes
        for (let i = 0; i < state.pipes.length; i++) {
          let p = state.pipes[i];
          p.x -= PIPE_SPEED;

          // Collision detection
          const birdX = 50;
          const birdRadius = 15;

          // Check pipe collision
          if (birdX + birdRadius > p.x && birdX - birdRadius < p.x + 50) {
            if (state.birdY - birdRadius < p.y || state.birdY + birdRadius > p.y + GAP_SIZE) {
              handleGameOver();
            }
          }

          // Pass pipe
          if (p.x === birdX) {
            state.score++;
            setScore(state.score);
            p.passed = true;
          }

          if (p.x + 50 < 0) {
            state.pipes.shift();
            i--;
          }
        }

        // Ground / Ceiling collision
        if (state.birdY + 15 >= canvas.height || state.birdY - 15 <= 0) {
          handleGameOver();
        }
      }

      // Draw pipes
      ctx.fillStyle = '#2ECC71';
      state.pipes.forEach(p => {
        // Top pipe
        ctx.fillRect(p.x, 0, 50, p.y);
        // Bottom pipe
        ctx.fillRect(p.x, p.y + GAP_SIZE, 50, canvas.height - (p.y + GAP_SIZE));
        
        // Pipe caps
        ctx.fillStyle = '#27AE60';
        ctx.fillRect(p.x - 2, p.y - 20, 54, 20);
        ctx.fillRect(p.x - 2, p.y + GAP_SIZE, 54, 20);
        ctx.fillStyle = '#2ECC71';
      });

      // Draw bird
      ctx.save();
      ctx.translate(50, state.birdY);
      // Rotate based on velocity
      const rotation = Math.min(Math.PI / 4, Math.max(-Math.PI / 4, (state.velocity * 0.1)));
      ctx.rotate(rotation);
      
      // Body
      ctx.fillStyle = '#F1C40F';
      ctx.beginPath();
      ctx.arc(0, 0, 15, 0, Math.PI * 2);
      ctx.fill();
      
      // Eye
      ctx.fillStyle = 'white';
      ctx.beginPath();
      ctx.arc(6, -4, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'black';
      ctx.beginPath();
      ctx.arc(8, -4, 2, 0, Math.PI * 2);
      ctx.fill();

      // Beak
      ctx.fillStyle = '#E67E22';
      ctx.beginPath();
      ctx.moveTo(10, 2);
      ctx.lineTo(20, 5);
      ctx.lineTo(10, 8);
      ctx.fill();

      ctx.restore();

      requestRef.current = requestAnimationFrame(draw);
    };

    const handleGameOver = () => {
      setGameOver(true);
      setIsPlaying(false);
      setHighScore(prev => Math.max(prev, gameState.current.score));
    };

    requestRef.current = requestAnimationFrame(draw);

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isPlaying, gameOver]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-300 via-sky-200 to-sky-400 flex flex-col items-center py-8">
      <div className="w-full max-w-4xl px-4 flex justify-between items-center mb-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/mini-games')}
          className="hover:scale-110 transition-transform bg-white/50 backdrop-blur-sm text-sky-900 border-sky-200 hover:bg-white/70"
        >
          <ArrowLeft className="w-5 h-5 mr-2" /> Back to Games
        </Button>
        <div className="flex gap-4">
          <div className="bg-white/50 backdrop-blur-sm px-6 py-2 rounded-full font-bold text-xl text-sky-900 border-2 border-white/50">
            Score: {score}
          </div>
          <div className="bg-yellow-400/80 backdrop-blur-sm px-6 py-2 rounded-full font-bold text-xl text-yellow-900 border-2 border-yellow-300 flex items-center gap-2">
            <Trophy className="w-5 h-5" /> {highScore}
          </div>
        </div>
      </div>

      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-sky-400 to-blue-500 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
        <div className="relative bg-white rounded-2xl p-4 shadow-2xl border border-sky-100">
          <canvas
            ref={canvasRef}
            width={400}
            height={600}
            onClick={jump}
            className="rounded-xl cursor-pointer max-w-full"
            style={{ width: '400px', height: '600px', maxWidth: '100%', objectFit: 'contain' }}
          />
          
          {!isPlaying && !gameOver && (
            <div className="absolute inset-4 flex flex-col items-center justify-center bg-black/40 rounded-xl backdrop-blur-sm">
              <h1 className="text-4xl font-extrabold text-white mb-6 drop-shadow-lg tracking-wider">FLOPPING BIRD</h1>
              <Button 
                size="lg"
                onClick={resetGame}
                className="bg-yellow-400 hover:bg-yellow-500 text-yellow-900 font-bold text-xl px-8 py-6 rounded-full shadow-xl hover:scale-105 transition-all"
              >
                <Play className="w-6 h-6 mr-2 fill-current" /> PLAY
              </Button>
              <p className="text-white/80 mt-4 font-medium animate-pulse">Click or press Space to jump</p>
            </div>
          )}

          {gameOver && (
            <div className="absolute inset-4 flex flex-col items-center justify-center bg-black/60 rounded-xl backdrop-blur-sm">
              <h2 className="text-5xl font-extrabold text-white mb-2 drop-shadow-md">GAME OVER</h2>
              <div className="bg-white/20 p-6 rounded-2xl backdrop-blur-md mb-6 border border-white/30 text-center">
                <p className="text-white text-lg font-medium mb-1">Final Score</p>
                <p className="text-5xl font-black text-yellow-400 drop-shadow-md">{score}</p>
              </div>
              <Button 
                size="lg"
                onClick={resetGame}
                className="bg-sky-500 hover:bg-sky-600 text-white font-bold text-xl px-8 py-6 rounded-full shadow-xl hover:scale-105 transition-all"
              >
                PLAY AGAIN
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FlappyBird;
