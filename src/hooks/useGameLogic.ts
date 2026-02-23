import { useState, useEffect, useCallback, useRef } from 'react';
import { Block, GameMode, GRID_ROWS, GRID_COLS, INITIAL_ROWS, TIME_LIMIT } from '../types';
import confetti from 'canvas-confetti';

const generateId = () => Math.random().toString(36).substr(2, 9);
const generateValue = () => Math.floor(Math.random() * 9) + 1;

export const useGameLogic = () => {
  const [grid, setGrid] = useState<(Block | null)[][]>([]);
  const [target, setTarget] = useState(0);
  const [score, setScore] = useState(0);
  const [mode, setMode] = useState<GameMode>(GameMode.CLASSIC);
  const [isGameOver, setIsGameOver] = useState(false);
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
  const [isPaused, setIsPaused] = useState(true);
  const [needsShift, setNeedsShift] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const generateTarget = useCallback(() => {
    setTarget(Math.floor(Math.random() * 15) + 10);
  }, []);

  const addNewRow = useCallback(() => {
    setGrid(prev => {
      if (prev.length === 0) return prev;
      // Check if top row has any blocks
      if (prev[0] && prev[0].some(cell => cell !== null)) {
        setIsGameOver(true);
        return prev;
      }

      const newGrid = [...prev];
      // Shift everything up
      for (let r = 0; r < GRID_ROWS - 1; r++) {
        newGrid[r] = [...newGrid[r + 1]];
      }
      // Add new row at bottom
      newGrid[GRID_ROWS - 1] = Array.from({ length: GRID_COLS }, () => ({
        id: generateId(),
        value: generateValue(),
        isSelected: false,
      }));

      return newGrid;
    });
  }, []);

  const resetToMenu = useCallback(() => {
    setGrid([]);
    setIsPaused(true);
    setIsGameOver(false);
    setNeedsShift(false);
  }, []);

  const initGame = useCallback((selectedMode: GameMode) => {
    const initialGrid: (Block | null)[][] = Array.from({ length: GRID_ROWS }, () => 
      Array.from({ length: GRID_COLS }, () => null)
    );

    // Fill bottom rows
    for (let r = GRID_ROWS - INITIAL_ROWS; r < GRID_ROWS; r++) {
      for (let c = 0; c < GRID_COLS; c++) {
        initialGrid[r][c] = {
          id: generateId(),
          value: generateValue(),
          isSelected: false,
        };
      }
    }

    setGrid(initialGrid);
    setMode(selectedMode);
    setScore(0);
    setIsGameOver(false);
    setIsPaused(false); // 确保游戏开始时不处于暂停状态
    setTimeLeft(TIME_LIMIT);
    setNeedsShift(false);
    generateTarget();
  }, [generateTarget]);

  const toggleSelect = (row: number, col: number) => {
    if (isGameOver || isPaused) return;
    
    setGrid(prev => {
      const newGrid = prev.map(r => [...r]);
      const block = newGrid[row][col];
      if (block) {
        newGrid[row][col] = { ...block, isSelected: !block.isSelected };
      }
      return newGrid;
    });
  };

  // 监听 needsShift 状态，实现“先下落，后上升”的顺序
  useEffect(() => {
    if (needsShift) {
      const timer = setTimeout(() => {
        addNewRow();
        setNeedsShift(false);
      }, 400); // 等待下落动画完成
      return () => clearTimeout(timer);
    }
  }, [needsShift, addNewRow]);

  // Check sum whenever grid changes
  useEffect(() => {
    if (grid.length === 0 || isGameOver || isPaused || needsShift) return;

    const selectedBlocks: { r: number; c: number; value: number }[] = [];
    grid.forEach((row, rIndex) => {
      row.forEach((block, cIndex) => {
        if (block?.isSelected) {
          selectedBlocks.push({ r: rIndex, c: cIndex, value: block.value });
        }
      });
    });

    const currentSum = selectedBlocks.reduce((acc, b) => acc + b.value, 0);

    if (currentSum === target) {
      // Success!
      setGrid(prev => {
        const newGrid = prev.map(r => [...r]);
        selectedBlocks.forEach(b => {
          newGrid[b.r][b.c] = null;
        });
        
        // Apply gravity
        for (let c = 0; c < GRID_COLS; c++) {
          let emptyRow = GRID_ROWS - 1;
          for (let r = GRID_ROWS - 1; r >= 0; r--) {
            if (newGrid[r][c] !== null) {
              const temp = newGrid[r][c];
              newGrid[r][c] = null;
              newGrid[emptyRow][c] = temp;
              emptyRow--;
            }
          }
        }
        return newGrid;
      });

      setScore(s => s + (selectedBlocks.length * 10));
      generateTarget();
      
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.7 },
        colors: ['#F2D5D5', '#F2E2D2', '#D5E2D5', '#D5DDE2', '#E2D5E2', '#4F46E5']
      });

      setNeedsShift(true); // 触发整体上升

      if (mode === GameMode.TIME) {
        setTimeLeft(TIME_LIMIT);
      }
    } else if (currentSum > target) {
      // Deselect all
      setGrid(prev => prev.map(row => row.map(block => block ? { ...block, isSelected: false } : null)));
    }
  }, [grid, target, mode, generateTarget, addNewRow, isGameOver, isPaused, needsShift]);

  // Timer for Time Mode
  useEffect(() => {
    if (mode === GameMode.TIME && !isGameOver && !isPaused) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            addNewRow();
            return TIME_LIMIT;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [mode, isGameOver, isPaused, addNewRow]);

  const shuffleGrid = useCallback(() => {
    if (isGameOver || isPaused) return;
    setGrid(prev => {
      const allBlocks = prev.flat().filter(b => b !== null) as Block[];
      // 随机打乱
      for (let i = allBlocks.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [allBlocks[i], allBlocks[j]] = [allBlocks[j], allBlocks[i]];
      }
      
      const newGrid: (Block | null)[][] = Array.from({ length: GRID_ROWS }, () => 
        Array.from({ length: GRID_COLS }, () => null)
      );
      
      // 从底部向上重新填充
      let blockIdx = 0;
      for (let r = GRID_ROWS - 1; r >= 0 && blockIdx < allBlocks.length; r--) {
        for (let c = 0; c < GRID_COLS && blockIdx < allBlocks.length; c++) {
          newGrid[r][c] = { ...allBlocks[blockIdx], isSelected: false };
          blockIdx++;
        }
      }
      return newGrid;
    });
    // 撒一点点小花表示刷新成功
    confetti({
      particleCount: 40,
      spread: 50,
      origin: { y: 0.8 },
      colors: ['#F2D5D5', '#F2E2D2', '#D5E2D5']
    });
  }, [isGameOver, isPaused]);

  return {
    grid,
    target,
    score,
    mode,
    isGameOver,
    timeLeft,
    isPaused,
    setIsPaused,
    initGame,
    resetToMenu,
    shuffleGrid,
    toggleSelect,
  };
};
