/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion, AnimatePresence } from 'motion/react';
import { useGameLogic } from './hooks/useGameLogic';
import { GameMode, GRID_ROWS, GRID_COLS } from './types';
import { Trophy, Timer, Play, RotateCcw, Pause, Info, ArrowLeft, HelpCircle } from 'lucide-react';
import { useState } from 'react';

const MORANDI_COLORS: Record<number, string> = {
  1: '#F2D5D5', // 柔粉
  2: '#F2E2D2', // 奶黄
  3: '#D5E2D5', // 豆绿
  4: '#D5DDE2', // 灰蓝
  5: '#E2D5E2', // 浅紫
  6: '#E9C46A', // 芥末黄 (稍深一点增加对比)
  7: '#F4A261', // 珊瑚粉
  8: '#A2D2FF', // 天蓝
  9: '#B8AFE6', // 薰衣草紫
};

export default function App() {
  const {
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
  } = useGameLogic();

  const [showHelp, setShowHelp] = useState(false);

  const currentSum = grid.flat().reduce((acc, b) => acc + (b?.isSelected ? b.value : 0), 0);
  const isMenu = grid.length === 0;

  return (
    <div className="min-h-screen flex flex-col items-center py-6 px-4 bg-slate-50">
      {/* Header Stats */}
      {!isMenu && (
        <div className="w-full max-w-md mb-4 flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <button 
              onClick={resetToMenu}
              className="flex items-center gap-1 text-slate-500 hover:text-indigo-600 transition-colors text-sm font-bold"
            >
              <ArrowLeft size={16} />
              返回
            </button>
            <div className="text-right">
              <div className="flex items-center justify-end gap-1 text-slate-400 text-[10px] font-mono uppercase">
                <Trophy size={10} />
                <span>分数</span>
              </div>
              <div className="text-xl font-display font-bold text-indigo-600 leading-none">{score}</div>
            </div>
          </div>

          <div className="glass-panel p-3 flex items-center justify-between relative overflow-hidden bg-white border-indigo-100 ring-4 ring-indigo-50/30">
            <div className="relative z-10">
              <div className="text-[10px] font-mono text-indigo-400 font-bold uppercase mb-0.5">目标和</div>
              <div className="flex items-baseline gap-3">
                <div className="text-4xl font-display font-black text-indigo-900 animate-pulse-target">
                  {target}
                </div>
                {mode === GameMode.TIME && (
                  <div className="flex items-center gap-1 px-2 py-0.5 bg-indigo-100 rounded-md text-indigo-600 font-mono text-xs font-bold">
                    <Timer size={12} />
                    <span>{timeLeft}s</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="relative z-10 text-right">
              <div className="text-[10px] font-mono text-slate-400 uppercase mb-0.5">当前和</div>
              <div className={`text-2xl font-display font-bold transition-colors ${
                currentSum > target ? 'text-red-500' : currentSum === target ? 'text-emerald-500' : 'text-slate-300'
              }`}>
                {currentSum}
              </div>
            </div>

            {/* Progress Bar for Time Mode */}
            {mode === GameMode.TIME && (
              <div className="absolute bottom-0 left-0 w-full h-1 bg-slate-100">
                <motion.div 
                  className="h-full bg-indigo-500"
                  initial={{ width: '100%' }}
                  animate={{ width: `${(timeLeft / 10) * 100}%` }}
                  transition={{ duration: 1, ease: "linear" }}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Game Board Container */}
      <div className={`relative glass-panel p-1.5 shadow-2xl shadow-indigo-500/5 ${isMenu ? 'hidden' : 'block'}`}>
        <div 
          className="grid gap-1"
          style={{ 
            gridTemplateColumns: `repeat(${GRID_COLS}, minmax(0, 1fr))`,
            gridTemplateRows: `repeat(${GRID_ROWS}, minmax(0, 1fr))`
          }}
        >
          {grid.map((row, rIdx) => 
            row.map((block, cIdx) => (
              <motion.button
                key={block?.id || `empty-${rIdx}-${cIdx}`}
                layout
                onClick={() => toggleSelect(rIdx, cIdx)}
                disabled={!block || isGameOver || isPaused}
                style={{ 
                  backgroundColor: block ? (block.isSelected ? '#4F46E5' : MORANDI_COLORS[block.value]) : 'transparent',
                  color: block ? (block.isSelected ? '#FFFFFF' : '#4A5568') : 'transparent'
                }}
                className={`
                  w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-lg flex items-center justify-center text-lg font-display font-bold transition-all
                  ${!block ? 'bg-slate-100/30 border border-dashed border-slate-200' : 
                    block.isSelected 
                      ? 'shadow-lg shadow-indigo-200 z-10 scale-105 border-2 border-indigo-600' 
                      : 'border border-white/50 shadow-sm hover:brightness-95 active:scale-95'
                  }
                `}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ 
                  layout: { type: "spring", stiffness: 500, damping: 30 },
                  scale: { duration: 0.2 },
                  opacity: { duration: 0.2 }
                }}
              >
                {block?.value}
              </motion.button>
            ))
          )}
        </div>

        {/* Overlays */}
        <AnimatePresence>
          {(isPaused || isGameOver) && !isMenu && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-20 backdrop-blur-md bg-white/80 rounded-2xl flex flex-col items-center justify-center p-8 text-center"
            >
              {isGameOver ? (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <h2 className="text-4xl font-display font-black text-slate-900">游戏结束</h2>
                    <p className="text-slate-500 font-mono">方块触顶了！</p>
                  </div>
                  <div className="text-5xl font-display font-bold text-indigo-600">{score}</div>
                  <div className="flex gap-3">
                    <button 
                      onClick={() => initGame(mode)}
                      className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-full font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all"
                    >
                      <RotateCcw size={18} />
                      再试一次
                    </button>
                    <button 
                      onClick={resetToMenu}
                      className="flex items-center gap-2 px-6 py-3 bg-slate-200 text-slate-700 rounded-full font-bold hover:bg-slate-300 transition-all"
                    >
                      <ArrowLeft size={18} />
                      主菜单
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <h2 className="text-4xl font-display font-black text-slate-900">暂停中</h2>
                  <div className="flex gap-3">
                    <button 
                      onClick={() => setIsPaused(false)}
                      className="flex items-center gap-2 px-8 py-4 bg-indigo-600 text-white rounded-full font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all"
                    >
                      <Play size={20} className="fill-current" />
                      继续游戏
                    </button>
                    <button 
                      onClick={resetToMenu}
                      className="flex items-center gap-2 px-8 py-4 bg-slate-200 text-slate-700 rounded-full font-bold hover:bg-slate-300 transition-all"
                    >
                      <ArrowLeft size={20} />
                      退出
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Start Menu */}
      {isMenu && (
        <div className="flex flex-col items-center justify-center space-y-12 animate-in fade-in zoom-in duration-500">
          <div className="text-center space-y-4">
            <div className="inline-block px-3 py-1 bg-indigo-100 text-indigo-600 rounded-full text-[10px] font-bold tracking-widest uppercase mb-2">
              Math Puzzle Game
            </div>
            <h1 className="text-6xl md:text-7xl font-display font-black text-slate-900 tracking-tighter leading-none">
              数字<span className="text-indigo-600">消除</span>
            </h1>
            <p className="text-slate-500 max-w-xs mx-auto text-sm leading-relaxed">
              点击方块凑出目标总和，在方块填满屏幕前尽可能获得高分。
            </p>
          </div>

          <div className="flex flex-row gap-4 w-full max-w-sm">
            <button 
              onClick={() => initGame(GameMode.CLASSIC)}
              className="flex-1 flex flex-col items-center justify-center gap-3 p-6 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all hover:-translate-y-1 active:scale-95"
            >
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <Play size={24} className="fill-current ml-1" />
              </div>
              <span>经典模式</span>
            </button>
            <button 
              onClick={() => initGame(GameMode.TIME)}
              className="flex-1 flex flex-col items-center justify-center gap-3 p-6 bg-white text-slate-900 border-2 border-slate-100 rounded-2xl font-bold hover:border-indigo-200 hover:bg-indigo-50/30 transition-all hover:-translate-y-1 active:scale-95"
            >
              <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center">
                <Timer size={24} className="text-indigo-600" />
              </div>
              <span>限时挑战</span>
            </button>
          </div>

          <button 
            onClick={() => setShowHelp(true)}
            className="flex items-center gap-2 text-slate-400 hover:text-indigo-600 transition-colors text-sm font-medium"
          >
            <HelpCircle size={18} />
            如何开始？
          </button>
        </div>
      )}

      {/* Footer Controls */}
      {!isMenu && (
        <div className="mt-8 flex gap-6 items-center">
          <div className="flex flex-col items-center gap-1">
            <button 
              onClick={() => setIsPaused(!isPaused)}
              className="p-4 glass-panel hover:bg-slate-100 transition-colors text-slate-400 hover:text-indigo-600 shadow-lg active:scale-95"
              title={isPaused ? "继续" : "暂停"}
            >
              {isPaused ? <Play size={24} /> : <Pause size={24} />}
            </button>
            <span className="text-[10px] font-bold text-slate-400 uppercase">暂停</span>
          </div>

          <div className="flex flex-col items-center gap-1">
            <button 
              onClick={shuffleGrid}
              className="p-4 glass-panel hover:bg-slate-100 transition-colors text-slate-400 hover:text-indigo-600 shadow-lg active:scale-95"
              title="打乱数字"
            >
              <RotateCcw size={24} />
            </button>
            <span className="text-[10px] font-bold text-slate-400 uppercase">洗牌</span>
          </div>

          <div className="flex flex-col items-center gap-1">
            <button 
              className="p-4 glass-panel hover:bg-slate-100 transition-colors text-slate-400 hover:text-indigo-600 shadow-lg active:scale-95"
              onClick={() => setShowHelp(true)}
              title="帮助"
            >
              <Info size={24} />
            </button>
            <span className="text-[10px] font-bold text-slate-400 uppercase">帮助</span>
          </div>
        </div>
      )}

      {/* Help Modal */}
      <AnimatePresence>
        {showHelp && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl"
            >
              <h3 className="text-2xl font-display font-black text-slate-900 mb-4">游戏规则</h3>
              <ul className="space-y-4 text-slate-600 text-sm">
                <li className="flex gap-3">
                  <div className="w-5 h-5 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold">1</div>
                  <p>点击方块中的数字，使它们相加等于顶部的<b>目标数字</b>。</p>
                </li>
                <li className="flex gap-3">
                  <div className="w-5 h-5 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold">2</div>
                  <p>数字无需相邻，你可以选择屏幕上任何位置的方块。</p>
                </li>
                <li className="flex gap-3">
                  <div className="w-5 h-5 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold">3</div>
                  <p><b>经典模式：</b>每次成功消除后，底部会新增一行方块。</p>
                </li>
                <li className="flex gap-3">
                  <div className="w-5 h-5 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold">4</div>
                  <p><b>限时挑战：</b>必须在进度条结束前完成消除，否则会强制新增一行。</p>
                </li>
                <li className="flex gap-3">
                  <div className="w-5 h-5 bg-red-100 text-red-600 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold">!</div>
                  <p>如果方块堆积到屏幕顶部，游戏即告结束。</p>
                </li>
              </ul>
              <button 
                onClick={() => setShowHelp(false)}
                className="w-full mt-8 py-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all"
              >
                我知道了
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
