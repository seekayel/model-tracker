import { useState } from 'react';
import { Link } from 'react-router-dom';
import { PLACEHOLDER_GAMES } from '../data';

/**
 * V5 — TERMINAL / HACKER
 * Monochrome green-on-black terminal interface. ASCII art header,
 * blinking cursor, command-line aesthetic, and table-based layouts.
 */

const ASCII_HEADER = `
 ███╗   ███╗ ██████╗ ██████╗ ███████╗██╗
 ████╗ ████║██╔═══██╗██╔══██╗██╔════╝██║
 ██╔████╔██║██║   ██║██║  ██║█████╗  ██║
 ██║╚██╔╝██║██║   ██║██║  ██║██╔══╝  ██║
 ██║ ╚═╝ ██║╚██████╔╝██████╔╝███████╗███████╗
 ╚═╝     ╚═╝ ╚═════╝ ╚═════╝ ╚══════╝╚══════╝
 ████████╗██████╗  █████╗  ██████╗██╗  ██╗███████╗██████╗
 ╚══██╔══╝██╔══██╗██╔══██╗██╔════╝██║ ██╔╝██╔════╝██╔══██╗
    ██║   ██████╔╝███████║██║     █████╔╝ █████╗  ██████╔╝
    ██║   ██╔══██╗██╔══██║██║     ██╔═██╗ ██╔══╝  ██╔══██╗
    ██║   ██║  ██║██║  ██║╚██████╗██║  ██╗███████╗██║  ██║
    ╚═╝   ╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝
`.trim();

export default function V5Gallery() {
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState('');

  const selected = PLACEHOLDER_GAMES.find(g => g.id === selectedGame);

  function handleCommand(e: React.FormEvent) {
    e.preventDefault();
    const cmd = inputValue.trim().toLowerCase();
    if (cmd === 'ls' || cmd === 'list') {
      setSelectedGame(null);
    } else if (cmd === 'back' || cmd === 'home') {
      window.location.hash = '/';
    } else {
      const found = PLACEHOLDER_GAMES.find(
        g => g.id === cmd || g.title.toLowerCase().includes(cmd)
      );
      if (found) setSelectedGame(found.id);
    }
    setInputValue('');
  }

  return (
    <div className="min-h-screen bg-black text-green-400 font-mono p-4 md:p-8 selection:bg-green-400 selection:text-black">
      {/* ASCII Header */}
      <pre className="text-green-500 text-[6px] sm:text-[8px] md:text-[10px] leading-tight mb-4 overflow-x-auto">
        {ASCII_HEADER}
      </pre>

      {/* System info */}
      <div className="text-green-600 text-xs mb-6 border-b border-green-900 pb-4">
        <p>System: MODEL_TRACKER v5.0.0 | Terminal Edition</p>
        <p>Games loaded: {PLACEHOLDER_GAMES.length} | Models: {new Set(PLACEHOLDER_GAMES.map(g => g.model)).size} | Status: <span className="text-green-400">ONLINE</span></p>
        <p className="mt-2">
          <Link to="/" className="text-green-500 hover:text-green-300 underline">
            [cd /home]
          </Link>
          {' '}&mdash; Type a game name to inspect, or &quot;ls&quot; to list all.
        </p>
      </div>

      {/* Command input */}
      <form onSubmit={handleCommand} className="flex items-center gap-2 mb-8">
        <span className="text-green-600">visitor@model-tracker:~$</span>
        <input
          type="text"
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          className="flex-1 bg-transparent border-none outline-none text-green-400 caret-green-400"
          placeholder="type a command..."
          autoFocus
        />
        <span className="animate-pulse">&#9608;</span>
      </form>

      {/* Detail view */}
      {selected ? (
        <div className="border border-green-800 p-4 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-green-600 text-xs">{'>'} cat /games/{selected.id}/README.md</p>
              <h2 className="text-2xl font-bold text-green-300 mt-2">{selected.title}</h2>
            </div>
            <button
              onClick={() => setSelectedGame(null)}
              className="text-green-600 hover:text-green-400 text-xs border border-green-800 px-2 py-1"
            >
              [close]
            </button>
          </div>
          <table className="w-full text-xs mb-4">
            <tbody>
              <tr className="border-b border-green-900">
                <td className="py-1 pr-4 text-green-600">MODEL</td>
                <td className="py-1">{selected.model}</td>
              </tr>
              <tr className="border-b border-green-900">
                <td className="py-1 pr-4 text-green-600">RATING</td>
                <td className="py-1">{'[' + '='.repeat(Math.round(selected.rating)) + ' '.repeat(5 - Math.round(selected.rating)) + ']'} {selected.rating}/5.0</td>
              </tr>
              <tr className="border-b border-green-900">
                <td className="py-1 pr-4 text-green-600">TAGS</td>
                <td className="py-1">{selected.tags.join(', ')}</td>
              </tr>
              <tr>
                <td className="py-1 pr-4 text-green-600 align-top">DESC</td>
                <td className="py-1">{selected.description}</td>
              </tr>
            </tbody>
          </table>
          <button className="border border-green-500 text-green-400 px-4 py-2 text-xs hover:bg-green-500 hover:text-black transition-colors">
            {'>'} ./launch --game={selected.id}
          </button>
        </div>
      ) : (
        /* Table listing */
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b-2 border-green-700 text-green-600">
                <th className="text-left py-2 pr-4">ID</th>
                <th className="text-left py-2 pr-4">TITLE</th>
                <th className="text-left py-2 pr-4">MODEL</th>
                <th className="text-left py-2 pr-4">TAGS</th>
                <th className="text-right py-2 pr-4">RATING</th>
                <th className="text-left py-2">ACTION</th>
              </tr>
            </thead>
            <tbody>
              {PLACEHOLDER_GAMES.map((game, i) => (
                <tr
                  key={game.id}
                  className={`border-b border-green-900/50 hover:bg-green-950 cursor-pointer transition-colors ${
                    i % 2 === 0 ? 'bg-green-950/20' : ''
                  }`}
                  onClick={() => setSelectedGame(game.id)}
                >
                  <td className="py-2 pr-4 text-green-700">{String(i).padStart(2, '0')}</td>
                  <td className="py-2 pr-4 font-bold text-green-300">{game.title}</td>
                  <td className="py-2 pr-4 text-green-500">{game.model}</td>
                  <td className="py-2 pr-4 text-green-600">{game.tags.join(' | ')}</td>
                  <td className="py-2 pr-4 text-right text-yellow-400">{game.rating}</td>
                  <td className="py-2">
                    <button
                      className="text-green-500 hover:text-green-300"
                      onClick={(e) => { e.stopPropagation(); setSelectedGame(game.id); }}
                    >
                      [view]
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Footer */}
      <footer className="mt-12 pt-4 border-t border-green-900 text-green-700 text-[10px]">
        <p>model-tracker v5.0.0 &mdash; terminal edition &mdash; all systems nominal</p>
        <p>connection: secure | latency: 12ms | uptime: 99.97%</p>
      </footer>
    </div>
  );
}
