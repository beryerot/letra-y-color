import { useState, useEffect } from "react";

// ─── Data ─────────────────────────────────────────────────────────────────────

const LETTERS = [
  // E 13.7% → 14
  "E","E","E","E","E","E","E","E","E","E","E","E","E","E",
  // A 12.5% → 13
  "A","A","A","A","A","A","A","A","A","A","A","A","A",
  // O 8.7% → 9
  "O","O","O","O","O","O","O","O","O",
  // R 6.9% → 7
  "R","R","R","R","R","R","R",
  // S 7.9% → 8
  "S","S","S","S","S","S","S","S",
  // N 6.7% → 7
  "N","N","N","N","N","N","N",
  // I 6.2% → 6
  "I","I","I","I","I","I",
  // L 4.9% → 5
  "L","L","L","L","L",
  // D 4.6% → 5
  "D","D","D","D","D",
  // T 4.6% → 5
  "T","T","T","T","T",
  // C 4.0% → 4
  "C","C","C","C",
  // U 3.9% → 4
  "U","U","U","U",
  // M 3.1% → 3
  "M","M","M",
  // P 2.5% → 3
  "P","P","P",
  // B 1.4% → 2
  "B","B",
  // H 1.2% → 1
  "H",
  // V 0.9% → 1
  "V",
  // G 1.0% → 1
  "G",
  // Z 0.5% → 1
  "Z",
  // F 0.7% → 1
  "F",
  // J 0.4% → 1
  "J",
  // Ñ 0.3% → 1
  "Ñ",
  // X 0.2% → 1
  "X",
];
const COLORS = ["blue", "red"];
const CATEGORIES = ["Geografía", "Nombres", "Comidas"];
const CATEGORY_ICONS = { "Geografía": "🌍", "Nombres": "👤", "Comidas": "🍽️" };
const TOTAL_ROUNDS = 8;
const STARTING_POINTS = 8;

const PC = [
  { bg: "#f59e0b", text: "#000" },
  { bg: "#10b981", text: "#000" },
  { bg: "#ef4444", text: "#fff" },
  { bg: "#3b82f6", text: "#fff" },
  { bg: "#8b5cf6", text: "#fff" },
  { bg: "#ec4899", text: "#fff" },
];

function generateHand(count) {
  const cards = [];
  let categoryUsed = false;
  let swapUsed = false;
  for (let i = 0; i < count; i++) {
    const roll = Math.random();
    if (!categoryUsed && !swapUsed && roll < 0.10) {
      const category = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
      cards.push({ type: "category", category, id: Math.random() });
      categoryUsed = true;
    } else if (!swapUsed && roll < 0.20) {
      cards.push({ type: "swap", id: Math.random() });
      swapUsed = true;
    } else {
      const letter = LETTERS[Math.floor(Math.random() * LETTERS.length)];
      const color = COLORS[Math.floor(Math.random() * COLORS.length)];
      cards.push({ type: "letter", letter, color, id: Math.random() });
    }
  }
  return cards;
}

// ─── CSS ──────────────────────────────────────────────────────────────────────

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500;700&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #f2f2ef; }

  @keyframes slideUp {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes cardIn {
    0%   { opacity: 0; transform: translateY(-32px) scale(0.9); }
    70%  { opacity: 1; transform: translateY(2px) scale(1.02); }
    100% { opacity: 1; transform: translateY(0) scale(1); }
  }
  @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
  @keyframes pop {
    0%   { transform: scale(1); }
    40%  { transform: scale(0.88); }
    100% { transform: scale(1); }
  }
  @keyframes fadeIn { from{opacity:0} to{opacity:1} }

  input { font-family: 'DM Sans', sans-serif; }
  input:focus { outline: none; }
  button { font-family: 'DM Sans', sans-serif; cursor: pointer; border: none; }
  button:disabled { cursor: default; }
  button:not(:disabled):active { transform: scale(0.96); }
`;

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  const [screen, setScreen]                 = useState("menu");
  const [playerCount, setPlayerCount]       = useState(2);
  const [playerNames, setPlayerNames]       = useState(["Jugador 1", "Jugador 2"]);
  const [cardsPerPlayer, setCardsPerPlayer] = useState(1);
  const [scores, setScores]                 = useState([]);
  const [cards, setCards]                   = useState([]);
  const [round, setRound]                   = useState(1);
  const [animating, setAnimating]           = useState(false);
  const [loserIdx, setLoserIdx]             = useState(null);
  const [dealt, setDealt]                   = useState(false);
  const [penalized, setPenalized]           = useState(false);

  useEffect(() => {
    const el = document.createElement("style");
    el.textContent = CSS;
    document.head.appendChild(el);
    return () => { try { document.head.removeChild(el); } catch(e) {} };
  }, []);

  const handlePlayerCount = (n) => {
    setPlayerCount(n);
    setPlayerNames(Array.from({ length: n }, (_, i) => `Jugador ${i + 1}`));
  };

  const startGame = () => {
    setScores(Array(playerCount).fill(STARTING_POINTS));
    setCards([]); setRound(1); setDealt(false);
    setLoserIdx(null); setPenalized(false);
    setScreen("game");
  };

  const dealCards = () => {
    setAnimating(true); setDealt(false);
    setPenalized(false); setLoserIdx(null);
    const newCards = generateHand(playerCount * cardsPerPlayer);
    setTimeout(() => { setCards(newCards); setDealt(true); setAnimating(false); }, 380);
  };

  const penalizePlayer = (idx) => {
    if (penalized) return;
    setPenalized(true); setLoserIdx(idx);
    const newScores = [...scores];
    newScores[idx] = Math.max(0, newScores[idx] - 1);
    setScores(newScores);
    const nextRound = round + 1;
    setTimeout(() => {
      setLoserIdx(null);
      if (nextRound > TOTAL_ROUNDS) { setScreen("results"); }
      else { setRound(nextRound); setCards([]); setDealt(false); }
    }, 900);
  };

  const maxScore = Math.max(...(scores.length ? scores : [0]));

  return (
    <div style={{ minHeight: "100vh", background: "#f2f2ef", fontFamily: "'DM Sans', sans-serif", color: "#111" }}>
      {screen === "menu"    && <MenuScreen playerCount={playerCount} playerNames={playerNames} cardsPerPlayer={cardsPerPlayer} onCardsPerPlayer={setCardsPerPlayer} onPlayerCount={handlePlayerCount} onNameChange={(i,v)=>{ const n=[...playerNames]; n[i]=v; setPlayerNames(n); }} onStart={startGame} />}
      {screen === "game"    && <GameScreen playerNames={playerNames} scores={scores} cards={cards} round={round} animating={animating} dealt={dealt} loserIdx={loserIdx} maxScore={maxScore} penalized={penalized} onDeal={dealCards} onRedeal={dealCards} onPenalize={penalizePlayer} onMenu={()=>setScreen("menu")} />}
      {screen === "results" && <ResultsScreen playerNames={playerNames} scores={scores} onPlayAgain={startGame} onMenu={()=>setScreen("menu")} />}
    </div>
  );
}

// ─── Menu ─────────────────────────────────────────────────────────────────────

function MenuScreen({ playerCount, playerNames, cardsPerPlayer, onCardsPerPlayer, onPlayerCount, onNameChange, onStart }) {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
      <div style={{ width: "100%", maxWidth: 420, animation: "slideUp .4s ease both" }}>

        {/* Title */}
        <div style={{ marginBottom: 36 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#3b82f6" }} />
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#ef4444" }} />
          </div>
          <h1 style={{ fontSize: 36, fontWeight: 700, letterSpacing: -1, lineHeight: 1 }}>
            Letra <span style={{ color: "#3b82f6" }}>&</span> Color
          </h1>
          <p style={{ color: "#999", fontSize: 14, marginTop: 6 }}>El juego de palabras inspirado en Momo</p>
        </div>

        {/* Players */}
        <Section label="Jugadores">
          <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
            {[2,3,4,5,6].map(n => (
              <Chip key={n} active={playerCount===n} onClick={() => onPlayerCount(n)}>{n}</Chip>
            ))}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {playerNames.map((name, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: PC[i].bg, flexShrink: 0 }} />
                <input value={name} onChange={e => onNameChange(i, e.target.value)} maxLength={16}
                  style={{ flex: 1, background: "#fff", border: "1.5px solid #ddd", borderRadius: 10, color: "#111", padding: "9px 14px", fontSize: 14 }} />
              </div>
            ))}
          </div>
        </Section>

        {/* Cards per player */}
        <Section label="Cartas por jugador">
          <div style={{ display: "flex", gap: 8, marginBottom: 6 }}>
            {[1,2,3,4].map(n => (
              <Chip key={n} active={cardsPerPlayer===n} onClick={() => onCardsPerPlayer(n)}>{n}</Chip>
            ))}
          </div>
          <p style={{ fontSize: 12, color: "#aaa" }}>{playerCount * cardsPerPlayer} cartas por mano</p>
        </Section>

        {/* Rules */}
        <Section label="Reglas">
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[
              { color: "#3b82f6", label: "Azul",     desc: "Di una palabra que contenga la letra" },
              { color: "#ef4444", label: "Rojo",     desc: "Di una palabra que no la contenga" },
              { color: "#f59e0b", label: "Dorada",   desc: "Di algo de esa categoría" },
              { color: null,      label: "Inversión",desc: "Rojo pasa a azul y azul a rojo", swap: true },
            ].map(r => (
              <div key={r.label} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 52, height: 28, borderRadius: 6, flexShrink: 0, overflow: "hidden",
                  background: r.swap ? "linear-gradient(90deg, #3b82f6 50%, #ef4444 50%)" : r.color,
                  display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {!r.swap && <span style={{ fontSize: 10, fontWeight: 700, color: r.color === "#f59e0b" ? "#000" : "#fff" }}>{r.label.toUpperCase()}</span>}
                  {r.swap && <span style={{ fontSize: 13 }}>⇅</span>}
                </div>
                <span style={{ fontSize: 13, color: "#999", lineHeight: 1.4 }}>{r.desc}</span>
              </div>
            ))}
          </div>
        </Section>

        <button onClick={onStart} style={{ width: "100%", padding: "14px", background: "#111", borderRadius: 12, color: "#fff", fontSize: 15, fontWeight: 600, letterSpacing: -.2, transition: "background .15s" }}>
          Comenzar partida →
        </button>
      </div>
    </div>
  );
}

// ─── Game ─────────────────────────────────────────────────────────────────────

function GameScreen({ playerNames, scores, cards, round, animating, dealt, loserIdx, maxScore, penalized, onDeal, onRedeal, onPenalize, onMenu }) {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", padding: "16px", gap: 14 }}>

      {/* Top bar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <button onClick={onMenu} style={{ background: "none", color: "#aaa", fontSize: 13, padding: "6px 0" }}>← Salir</button>
        <span style={{ fontSize: 12, color: "#bbb", fontWeight: 600, letterSpacing: 1, textTransform: "uppercase" }}>
          Mano {round} / {TOTAL_ROUNDS}
        </span>
        <div style={{ width: 48 }} />
      </div>

      {/* Progress bar */}
      <div style={{ height: 2, background: "#ddd", borderRadius: 2 }}>
        <div style={{ height: "100%", width: `${(round - 1) / TOTAL_ROUNDS * 100}%`, background: "#111", borderRadius: 2, transition: "width .5s ease" }} />
      </div>

      {/* Scores */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {playerNames.map((name, i) => {
          const isLoser  = loserIdx === i;
          const isLeader = scores[i] === maxScore;
          return (
            <div key={i} style={{
              borderRadius: 10, padding: "8px 14px", flex: 1, minWidth: 70,
              background: isLoser ? "#fff0f0" : "#fff",
              border: `1.5px solid ${isLoser ? "#ef4444" : isLeader ? PC[i].bg : "#e5e5e5"}`,
              animation: isLoser ? "pop .4s ease" : "none",
              transition: "all .3s",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                <div style={{ width: 7, height: 7, borderRadius: "50%", background: PC[i].bg }} />
                <span style={{ fontSize: 11, color: "#999", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{name}</span>
                {isLeader && !isLoser && <span style={{ marginLeft: "auto", fontSize: 10 }}>♛</span>}
              </div>
              <span style={{ fontSize: 24, fontWeight: 700, color: isLoser ? "#ef4444" : "#111" }}>{scores[i]}</span>
            </div>
          );
        })}
      </div>

      {/* Cards zone */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", background: "#e8e8e4", borderRadius: 16, border: "1.5px solid #ddd", minHeight: 180 }}>
        {!dealt && !animating && (
          <button onClick={onDeal} style={{ background: "#f2f2ef", border: "1.5px dashed #ccc", borderRadius: 12, color: "#bbb", padding: "20px 40px", fontSize: 14, display: "flex", flexDirection: "column", alignItems: "center", gap: 8, transition: "border-color .15s, color .15s" }}>
            <span style={{ fontSize: 32 }}>🃏</span>
            <span>Repartir cartas</span>
          </button>
        )}
        {animating && (
          <span style={{ fontSize: 13, color: "#bbb", letterSpacing: 2, textTransform: "uppercase", animation: "pulse 1s infinite" }}>Repartiendo…</span>
        )}
        {dealt && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center", padding: "20px 16px" }}>
            {cards.map((card, i) => <CardDisplay key={card.id} card={card} index={i} />)}
          </div>
        )}
      </div>

      {/* Penalty */}
      {dealt && (
        <div>
          <p style={{ fontSize: 11, color: "#bbb", letterSpacing: 1.5, textTransform: "uppercase", fontWeight: 600, marginBottom: 10, textAlign: "center" }}>¿Quién pierde el punto?</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", marginBottom: 10 }}>
            {playerNames.map((name, i) => (
              <button key={i} onClick={() => onPenalize(i)} disabled={penalized}
                style={{
                  padding: "10px 18px", borderRadius: 10, fontSize: 13, fontWeight: 600,
                  background: loserIdx === i ? PC[i].bg : "#fff",
                  color: loserIdx === i ? PC[i].text : "#999",
                  border: `1.5px solid ${loserIdx === i ? PC[i].bg : "#e5e5e5"}`,
                  opacity: penalized && loserIdx !== i ? 0.3 : 1,
                  transition: "all .2s",
                }}>
                {loserIdx === i ? "✗ " : ""}{name}
              </button>
            ))}
          </div>
          {!penalized && (
            <div style={{ textAlign: "center" }}>
              <button onClick={onRedeal} style={{ background: "none", color: "#ccc", fontSize: 12, padding: "6px 16px", borderRadius: 8, border: "1px dashed #ddd" }}>
                ↺ Volver a tirar
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Card ─────────────────────────────────────────────────────────────────────

function CardDisplay({ card, index }) {
  const isCategory = card.type === "category";
  const isSwap     = card.type === "swap";
  const isBlue     = card.color === "blue";

  const bg = isCategory ? "#f59e0b"
           : isSwap     ? null
           : isBlue     ? "#3b82f6"
                        : "#ef4444";

  const textColor = isCategory ? "#000" : "#fff";

  return (
    <div style={{ animation: `cardIn .35s cubic-bezier(.34,1.56,.64,1) ${index * 75}ms both` }}>
      <div style={{
        width: 100, height: 148, borderRadius: 14,
        background: isSwap ? "none" : bg,
        overflow: "hidden", position: "relative",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        boxShadow: isSwap ? "none" : `0 4px 24px ${bg}44`,
        ...(isSwap ? { border: "none" } : {}),
      }}>
        {isSwap ? (
          <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", borderRadius: 14, overflow: "hidden" }}>
            {/* Top half blue */}
            <div style={{ flex: 1, background: "#3b82f6", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="36" height="24" viewBox="0 0 36 24" fill="none">
                <path d="M4 18 L18 6 L32 18" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            {/* Divider */}
            <div style={{ height: 2, background: "#f2f2ef" }} />
            {/* Bottom half red */}
            <div style={{ flex: 1, background: "#ef4444", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="36" height="24" viewBox="0 0 36 24" fill="none">
                <path d="M4 6 L18 18 L32 6" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
        ) : isCategory ? (
          <div style={{ textAlign: "center", padding: "0 10px" }}>
            <div style={{ fontSize: 28, marginBottom: 6 }}>{CATEGORY_ICONS[card.category]}</div>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 13, color: "#000", lineHeight: 1.2 }}>{card.category}</div>
          </div>
        ) : (
          <>
            <span style={{ position: "absolute", top: 8, left: 10, fontFamily: "'DM Mono', monospace", fontSize: 11, color: "rgba(255,255,255,0.5)", fontWeight: 500 }}>{card.letter}</span>
            <span style={{ fontFamily: "'DM Mono', monospace", fontWeight: 700, fontSize: 64, color: textColor, lineHeight: 1 }}>{card.letter}</span>
            <span style={{ position: "absolute", bottom: 8, right: 10, fontFamily: "'DM Mono', monospace", fontSize: 11, color: "rgba(255,255,255,0.5)", fontWeight: 500, transform: "rotate(180deg)" }}>{card.letter}</span>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Results ──────────────────────────────────────────────────────────────────

function ResultsScreen({ playerNames, scores, onPlayAgain, onMenu }) {
  const maxScore = Math.max(...scores);
  const winners  = scores.reduce((a,s,i) => s===maxScore?[...a,i]:a, []);
  const isTie    = winners.length > 1;
  const sorted   = [...scores.map((s,i) => ({s,i}))].sort((a,b) => b.s-a.s);
  const medals   = ["🥇","🥈","🥉"];

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
      <div style={{ width: "100%", maxWidth: 400, animation: "slideUp .4s ease both" }}>

        <div style={{ marginBottom: 32 }}>
          <p style={{ fontSize: 12, color: "#aaa", letterSpacing: 2, textTransform: "uppercase", fontWeight: 600, marginBottom: 8 }}>Fin de partida</p>
          <h2 style={{ fontSize: 28, fontWeight: 700, letterSpacing: -0.5, lineHeight: 1.1 }}>
            {isTie ? "¡Empate!" : `Ganó ${playerNames[winners[0]]}`}
          </h2>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 32 }}>
          {sorted.map(({s, i}, rank) => (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: 14,
              padding: "14px 16px", borderRadius: 12,
              background: rank === 0 ? "#fff" : "none",
              border: `1.5px solid ${rank === 0 ? "#e5e5e5" : "transparent"}`,
              animation: `slideUp .3s ease ${rank * 60}ms both`,
            }}>
              <span style={{ fontSize: 18, width: 28 }}>{medals[rank] || `${rank+1}.`}</span>
              <div style={{ width: 9, height: 9, borderRadius: "50%", background: PC[i].bg, flexShrink: 0 }} />
              <span style={{ flex: 1, fontSize: 15, color: rank === 0 ? "#111" : "#bbb" }}>{playerNames[i]}</span>
              <span style={{ fontFamily: "'DM Mono', monospace", fontWeight: 700, fontSize: 22, color: rank === 0 ? "#111" : "#ccc" }}>{s}</span>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onMenu} style={{ flex: 1, padding: "13px", background: "#e8e8e4", borderRadius: 12, color: "#999", fontSize: 14, fontWeight: 500, border: "1.5px solid #ddd" }}>
            Menú
          </button>
          <button onClick={onPlayAgain} style={{ flex: 2, padding: "13px", background: "#111", borderRadius: 12, color: "#fff", fontSize: 14, fontWeight: 600 }}>
            Jugar de nuevo →
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Shared components ────────────────────────────────────────────────────────

function Section({ label, children }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <p style={{ fontSize: 11, color: "#bbb", letterSpacing: 1.5, textTransform: "uppercase", fontWeight: 600, marginBottom: 12 }}>{label}</p>
      {children}
    </div>
  );
}

function Chip({ active, onClick, children }) {
  return (
    <button onClick={onClick} style={{
      width: 42, height: 42, borderRadius: 10, fontSize: 16, fontWeight: 600,
      background: active ? "#111" : "#fff",
      color: active ? "#fff" : "#aaa",
      border: `1.5px solid ${active ? "#111" : "#e5e5e5"}`,
      transition: "all .15s",
    }}>
      {children}
    </button>
  );
}
