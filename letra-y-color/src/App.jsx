import { useState, useEffect } from "react";

const LETTERS = [
  "E","E","E","E","E","E","A","A","A","A","A","O","O","O","O","O",
  "S","S","S","S","N","N","N","N","R","R","R","R","I","I","I",
  "L","L","L","D","D","D","T","T","T","C","C","C","U","U","U",
  "M","M","P","P","B","B","G","G","V","V","H","H","F","J","Z","Ñ","X","Q","K",
];
const COLORS = ["blue", "red"];
const CATEGORIES = ["Geografía", "Nombres", "Comidas"];
const CATEGORY_ICONS = { "Geografía": "🌍", "Nombres": "👤", "Comidas": "🍽️" };
const TOTAL_ROUNDS = 8;
const STARTING_POINTS = 8;
const PLAYER_COLORS = [
  { bg: "#c8960c", border: "#f0c040", text: "#1a0e00" },
  { bg: "#1a7a3c", border: "#4ade80", text: "#f0fff4" },
  { bg: "#9b2626", border: "#f87171", text: "#fff0f0" },
  { bg: "#1e3a8a", border: "#60a5fa", text: "#eff6ff" },
  { bg: "#6b21a8", border: "#c084fc", text: "#faf5ff" },
  { bg: "#0f766e", border: "#2dd4bf", text: "#f0fdfa" },
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

const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700;900&family=Crimson+Text:ital,wght@0,400;0,600;1,400&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  @keyframes cardDeal {
    0%   { opacity:0; transform:translateY(-45px) scale(0.84); }
    65%  { opacity:1; transform:translateY(3px) scale(1.02); }
    100% { opacity:1; transform:translateY(0) scale(1); }
  }
  @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.38} }
  @keyframes fadeUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
  @keyframes shrink { 0%{transform:scale(1)} 40%{transform:scale(0.87)} 100%{transform:scale(1)} }
  input:focus { outline:none; border-color:#c8960c !important; box-shadow:0 0 0 3px rgba(200,150,12,0.2); }
  button { font-family:'Cinzel',serif; cursor:pointer; transition: opacity .15s, transform .1s; }
  button:not(:disabled):hover { opacity:.88; }
  button:not(:disabled):active { transform:scale(0.96) !important; }
  button:disabled { cursor:default; }
`;

export default function App() {
  const [screen, setScreen]               = useState("menu");
  const [playerCount, setPlayerCount]     = useState(2);
  const [playerNames, setPlayerNames]     = useState(["Jugador 1", "Jugador 2"]);
  const [cardsPerPlayer, setCardsPerPlayer] = useState(1);
  const [scores, setScores]               = useState([]);
  const [cards, setCards]                 = useState([]);
  const [round, setRound]                 = useState(1);
  const [animating, setAnimating]         = useState(false);
  const [loserIdx, setLoserIdx]           = useState(null);
  const [dealt, setDealt]                 = useState(false);
  const [penalized, setPenalized]         = useState(false);

  useEffect(() => {
    const el = document.createElement("style");
    el.textContent = GLOBAL_CSS;
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
    const totalCards = playerCount * cardsPerPlayer;
    const newCards = generateHand(totalCards);
    setTimeout(() => { setCards(newCards); setDealt(true); setAnimating(false); }, 420);
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
    }, 950);
  };

  const maxScore = Math.max(...(scores.length ? scores : [0]));

  return (
    <div style={{ minHeight:"100vh", position:"relative", overflow:"hidden", fontFamily:"'Crimson Text',Georgia,serif" }}>
      <div style={{ position:"fixed", inset:0, background:"radial-gradient(ellipse at 50% 38%, #2a5c3a 0%, #183d26 55%, #0d2218 100%)", zIndex:0 }} />
      <div style={{ position:"fixed", inset:0, opacity:.55, zIndex:0,
        backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)' opacity='0.1'/%3E%3C/svg%3E")`,
      }} />
      {screen === "menu"    && <MenuScreen playerCount={playerCount} playerNames={playerNames} cardsPerPlayer={cardsPerPlayer} onCardsPerPlayer={setCardsPerPlayer} onPlayerCount={handlePlayerCount} onNameChange={(i,v)=>{ const n=[...playerNames]; n[i]=v; setPlayerNames(n); }} onStart={startGame} />}
      {screen === "game"    && <GameScreen playerNames={playerNames} scores={scores} cards={cards} round={round} animating={animating} dealt={dealt} loserIdx={loserIdx} maxScore={maxScore} penalized={penalized} onDeal={dealCards} onRedeal={dealCards} onPenalize={penalizePlayer} onMenu={()=>setScreen("menu")} />}
      {screen === "results" && <ResultsScreen playerNames={playerNames} scores={scores} onPlayAgain={startGame} onMenu={()=>setScreen("menu")} />}
    </div>
  );
}

function MenuScreen({ playerCount, playerNames, cardsPerPlayer, onCardsPerPlayer, onPlayerCount, onNameChange, onStart }) {
  return (
    <div style={{ position:"relative", zIndex:1, minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", padding:"20px" }}>
      <div style={pnl}>
        <div style={pnlHdr}>
          <div style={ornS}>✦ ✦ ✦</div>
          <h1 style={{ fontFamily:"'Cinzel',serif", fontWeight:900, fontSize:32, color:"#fff", letterSpacing:2, textShadow:"0 2px 10px #0007", margin:"6px 0" }}>
            Letra <span style={{ color:"#fde68a" }}>&amp;</span> Color
          </h1>
          <p style={{ fontFamily:"'Crimson Text',serif", fontStyle:"italic", fontSize:15, color:"#fde68a", opacity:.85 }}>El juego de palabras</p>
          <div style={{ ...ornS, marginTop:6 }}>✦ ✦ ✦</div>
        </div>
        <div style={{ padding:"22px 24px 26px" }}>
          <div style={{ marginBottom:20 }}>
            <label style={lbl}>Número de jugadores</label>
            <div style={{ display:"flex", gap:8 }}>
              {[2,3,4,5,6].map(n => (
                <button key={n} onClick={() => onPlayerCount(n)} style={{ width:44, height:44, borderRadius:10, border:`2px solid ${playerCount===n?"#f0c040":"#78500a"}`, background:playerCount===n?"#78500a":"#2a1f0e", color:playerCount===n?"#fde68a":"#c8960c", fontSize:18, fontWeight:700 }}>
                  {n}
                </button>
              ))}
            </div>
          </div>
          <div style={{ marginBottom:20 }}>
            <label style={lbl}>Cartas por jugador</label>
            <div style={{ display:"flex", gap:8 }}>
              {[1,2,3,4].map(n => (
                <button key={n} onClick={() => onCardsPerPlayer(n)} style={{ width:44, height:44, borderRadius:10, border:`2px solid ${cardsPerPlayer===n?"#f0c040":"#78500a"}`, background:cardsPerPlayer===n?"#78500a":"#2a1f0e", color:cardsPerPlayer===n?"#fde68a":"#c8960c", fontSize:18, fontWeight:700 }}>
                  {n}
                </button>
              ))}
            </div>
            <p style={{ fontFamily:"'Crimson Text',serif", fontSize:13, color:"#78500a", marginTop:6 }}>
              {playerCount * cardsPerPlayer} cartas por mano en total
            </p>
          </div>
          <div style={{ marginBottom:20 }}>
            <label style={lbl}>Jugadores</label>
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              {playerNames.map((name, i) => (
                <div key={i} style={{ display:"flex", alignItems:"center", gap:10 }}>
                  <div style={{ width:28, height:28, borderRadius:"50%", background:PLAYER_COLORS[i].bg, border:`2px solid ${PLAYER_COLORS[i].border}`, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Cinzel',serif", fontWeight:700, fontSize:12, color:PLAYER_COLORS[i].text, flexShrink:0 }}>{i+1}</div>
                  <input value={name} onChange={e=>onNameChange(i,e.target.value)} maxLength={16}
                    style={{ flex:1, background:"rgba(255,255,255,0.06)", border:"1px solid #78500a", borderRadius:8, color:"#e8d8b0", padding:"8px 12px", fontSize:15, fontFamily:"'Crimson Text',serif" }} />
                </div>
              ))}
            </div>
          </div>
          <div style={{ background:"rgba(0,0,0,0.3)", border:"1px solid #78500a", borderRadius:12, padding:"14px 16px", marginBottom:22 }}>
            <p style={lbl}>Reglas</p>
            {[
              { bg:"#1a2a5e", bdr:"#3b82f6", col:"#93c5fd", tag:"AZUL",   desc:"Di una palabra que contenga esa letra" },
              { bg:"#5e1a1a", bdr:"#ef4444", col:"#fca5a5", tag:"ROJO",   desc:"Di una palabra que no contenga esa letra" },
              { bg:"#5e4a00", bdr:"#f59e0b", col:"#fde68a", tag:"DORADA", desc:"Di algo que pertenezca a la categoría" },
              { bg:"linear-gradient(135deg,#162d6b 50%,#6b1212 50%)", bdr:"#c084fc", col:"#e9d5ff", tag:"⇅", desc:"Rojo pasa a azul y azul a rojo" },
            ].map(r => (
              <div key={r.tag} style={{ display:"flex", alignItems:"center", gap:12, marginBottom:8 }}>
                <div style={{ minWidth:58, padding:"5px 6px", borderRadius:8, background:r.bg, border:`2px solid ${r.bdr}`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                  <span style={{ color:r.col, fontWeight:700, fontFamily:"'Cinzel',serif", fontSize:11 }}>{r.tag}</span>
                </div>
                <span style={{ fontFamily:"'Crimson Text',serif", fontSize:15, color:"#c8b890", lineHeight:1.3 }}>{r.desc}</span>
              </div>
            ))}
          </div>
          <button onClick={onStart} style={{ width:"100%", padding:"14px", background:"linear-gradient(135deg,#78500a,#c8960c,#78500a)", border:"2px solid #f0c040", borderRadius:12, color:"#1a0e00", fontSize:16, fontWeight:700, letterSpacing:1, boxShadow:"0 4px 20px #c8960c44" }}>
            ✦ Comenzar partida ✦
          </button>
        </div>
      </div>
    </div>
  );
}

function GameScreen({ playerNames, scores, cards, round, animating, dealt, loserIdx, maxScore, penalized, onDeal, onRedeal, onPenalize, onMenu }) {
  return (
    <div style={{ position:"relative", zIndex:1, minHeight:"100vh", display:"flex", flexDirection:"column", padding:"14px", gap:12 }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <button onClick={onMenu} style={{ background:"none", border:"1px solid #78500a55", borderRadius:8, color:"#c8960c99", padding:"7px 14px", fontSize:13 }}>← Salir</button>
        <div style={{ background:"rgba(0,0,0,0.5)", border:"1px solid #c8960c55", borderRadius:20, padding:"5px 20px", display:"flex", alignItems:"center", gap:6 }}>
          <span style={{ fontFamily:"'Cinzel',serif", fontSize:10, letterSpacing:2, color:"#c8960c", textTransform:"uppercase" }}>MANO</span>
          <span style={{ fontFamily:"'Cinzel',serif", fontSize:20, fontWeight:700, color:"#fde68a" }}>{round}</span>
          <span style={{ fontFamily:"'Cinzel',serif", fontSize:10, letterSpacing:2, color:"#c8960c" }}>/ {TOTAL_ROUNDS}</span>
        </div>
        <div style={{ width:72 }} />
      </div>

      <div style={{ display:"flex", gap:8, flexWrap:"wrap", justifyContent:"center" }}>
        {playerNames.map((name, i) => {
          const isLoser  = loserIdx === i;
          const isLeader = scores[i] === maxScore;
          return (
            <div key={i} style={{
              borderRadius:12, padding:"8px 14px", minWidth:68,
              display:"flex", flexDirection:"column", alignItems:"center", position:"relative",
              background: PLAYER_COLORS[i].bg,
              border: `2px solid ${isLoser?"#ef4444":isLeader?"#fde68a":PLAYER_COLORS[i].border}`,
              color: PLAYER_COLORS[i].text,
              transform: isLoser?"scale(0.91)":isLeader?"scale(1.06)":"scale(1)",
              boxShadow: isLoser?"0 0 16px #ef444455":isLeader?`0 0 18px ${PLAYER_COLORS[i].border}88`:"0 4px 12px #0006",
              animation: isLoser?"shrink .4s ease":"none",
              transition:"all .3s cubic-bezier(.34,1.56,.64,1)",
            }}>
              {isLeader && !isLoser && <span style={{ position:"absolute", top:-11, fontSize:15 }}>♛</span>}
              <span style={{ fontFamily:"'Cinzel',serif", fontSize:10, letterSpacing:1, textTransform:"uppercase", opacity:.9, marginTop:2 }}>{name}</span>
              <div style={{ width:"70%", height:1, background:"currentColor", opacity:.25, margin:"4px 0" }} />
              <span style={{ fontFamily:"'Cinzel',serif", fontSize:26, fontWeight:900, lineHeight:1 }}>{scores[i]}</span>
            </div>
          );
        })}
      </div>

      <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center" }}>
        <div style={{ width:"100%", maxWidth:560, minHeight:190, background:"radial-gradient(ellipse at center,#2e6342 0%,#1a3d28 65%,#0f2518 100%)", border:"3px solid #78500a", borderRadius:24, boxShadow:"0 8px 40px #0009, inset 0 2px 0 #4a7a5a55, inset 0 -2px 0 #0a1f12", display:"flex", alignItems:"center", justifyContent:"center", padding:"24px 16px" }}>
          {!dealt && !animating && (
            <button onClick={onDeal} style={{ background:"rgba(0,0,0,0.45)", border:"2px dashed #c8960c77", borderRadius:16, color:"#c8960c", padding:"18px 36px", fontSize:15, fontWeight:700, letterSpacing:1, textAlign:"center", lineHeight:1.5 }}>
              <span style={{ fontSize:28, display:"block" }}>🃏</span>Repartir cartas
            </button>
          )}
          {animating && <p style={{ fontFamily:"'Cinzel',serif", fontSize:15, letterSpacing:4, color:"#c8960c", animation:"pulse 1s infinite" }}>Repartiendo…</p>}
          {dealt && (
            <div style={{ display:"flex", flexWrap:"wrap", gap:12, justifyContent:"center", alignItems:"flex-end" }}>
              {cards.map((card, i) => <CardDisplay key={card.id} card={card} index={i} total={cards.length} />)}
            </div>
          )}
        </div>
      </div>

      {dealt && (
        <div style={{ paddingBottom:8 }}>
          <p style={{ textAlign:"center", fontFamily:"'Cinzel',serif", fontSize:11, letterSpacing:2, textTransform:"uppercase", color:"#c8960c", marginBottom:10 }}>¿Quién pierde el punto?</p>
          <div style={{ display:"flex", flexWrap:"wrap", gap:8, justifyContent:"center", marginBottom:12 }}>
            {playerNames.map((name, i) => (
              <button key={i} onClick={() => onPenalize(i)} disabled={penalized}
                style={{ borderRadius:10, padding:"10px 18px", fontSize:14, fontWeight:700, letterSpacing:.5, background:PLAYER_COLORS[i].bg, border:`2px solid ${loserIdx===i?"#fff":PLAYER_COLORS[i].border}`, color:PLAYER_COLORS[i].text, opacity:penalized&&loserIdx!==i?0.32:1, transform:loserIdx===i?"scale(1.1)":"scale(1)", transition:"all .2s", boxShadow:"0 4px 12px #0005" }}>
                {loserIdx===i?"✗ ":""}{name}
              </button>
            ))}
          </div>
          {!penalized && (
            <div style={{ display:"flex", justifyContent:"center" }}>
              <button onClick={onRedeal} style={{ background:"none", border:"1px dashed #78500a88", borderRadius:10, color:"#78500a", padding:"8px 22px", fontSize:12, letterSpacing:1 }}>
                ↺ Volver a tirar
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function CardDisplay({ card, index, total }) {
  const isCategory = card.type === "category";
  const isSwap     = card.type === "swap";
  const isBlue     = card.color === "blue";
  const cardBg     = isCategory ? "linear-gradient(155deg,#5e3a00,#c8960c,#5e3a00)"
                   : isSwap     ? "linear-gradient(135deg, #2563eb 0%, #2563eb 50%, #dc2626 50%, #dc2626 100%)"
                   : isBlue     ? "linear-gradient(155deg,#162d6b,#2563eb,#162d6b)"
                                : "linear-gradient(155deg,#6b1212,#dc2626,#6b1212)";
  const borderCol  = isCategory ? "#f0c040" : isSwap ? "#c084fc" : isBlue ? "#93c5fd" : "#fca5a5";
  const glowCol    = isCategory ? "#f59e0b" : isSwap ? "#a855f7" : isBlue ? "#3b82f6" : "#ef4444";

  return (
    <div style={{ animation:`cardDeal .4s cubic-bezier(.34,1.56,.64,1) ${index*85}ms both` }}>
      <div style={{ width:108, height:158, borderRadius:14, background:cardBg, border:`2.5px solid ${borderCol}`, boxShadow:`0 8px 24px #0009, 0 0 16px ${glowCol}44, inset 0 1px 0 ${borderCol}44`, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", inset:5, borderRadius:10, border:`1px solid ${borderCol}33`, pointerEvents:"none", zIndex:2 }} />
        {!isCategory && !isSwap && <>
          <span style={{ position:"absolute", top:7, left:9, fontSize:12, fontFamily:"'Cinzel',serif", color:`${borderCol}bb`, fontWeight:700, zIndex:2 }}>{card.letter}</span>
          <span style={{ position:"absolute", bottom:7, right:9, fontSize:12, fontFamily:"'Cinzel',serif", color:`${borderCol}bb`, fontWeight:700, transform:"rotate(180deg)", zIndex:2 }}>{card.letter}</span>
        </>}
        {isCategory ? (
          <div style={{ textAlign:"center", padding:"0 8px", zIndex:2 }}>
            <div style={{ fontSize:32, marginBottom:6 }}>{CATEGORY_ICONS[card.category]}</div>
            <div style={{ fontFamily:"'Cinzel',serif", fontWeight:700, fontSize:13, color:"#fde68a", lineHeight:1.25, letterSpacing:.5 }}>{card.category}</div>
          </div>
        ) : isSwap ? (
          <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:6, zIndex:2 }}>
            {/* Arrow up (blue side → red) */}
            <svg width="52" height="28" viewBox="0 0 52 28" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 22 L26 6 L48 22" stroke="#93c5fd" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
              <path d="M26 6 L26 26" stroke="#93c5fd" strokeWidth="4" strokeLinecap="round"/>
            </svg>
            {/* Divider line */}
            <div style={{ width:60, height:2, background:"rgba(255,255,255,0.3)", borderRadius:1 }} />
            {/* Arrow down (red side → blue) */}
            <svg width="52" height="28" viewBox="0 0 52 28" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 6 L26 22 L48 6" stroke="#fca5a5" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
              <path d="M26 22 L26 2" stroke="#fca5a5" strokeWidth="4" strokeLinecap="round"/>
            </svg>
            <span style={{ fontFamily:"'Cinzel',serif", fontSize:9, letterSpacing:1, color:"rgba(255,255,255,0.7)", textTransform:"uppercase", marginTop:2 }}>Inversión</span>
          </div>
        ) : (
          <span style={{ fontFamily:"'Cinzel',serif", fontWeight:900, fontSize:66, color:"#fff", lineHeight:1, textShadow:`0 2px 10px #0009, 0 0 28px ${glowCol}77`, zIndex:2 }}>{card.letter}</span>
        )}
      </div>
    </div>
  );
}

function ResultsScreen({ playerNames, scores, onPlayAgain, onMenu }) {
  const maxScore = Math.max(...scores);
  const winners  = scores.reduce((a,s,i) => s===maxScore?[...a,i]:a, []);
  const isTie    = winners.length > 1;
  const sorted   = [...scores.map((s,i) => ({s,i}))].sort((a,b) => b.s-a.s);
  const medals   = ["🥇","🥈","🥉"];
  return (
    <div style={{ position:"relative", zIndex:1, minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", padding:"20px" }}>
      <div style={{ ...pnl, animation:"fadeUp .5s ease both" }}>
        <div style={pnlHdr}>
          <div style={ornS}>✦ ✦ ✦</div>
          <h1 style={{ fontFamily:"'Cinzel',serif", fontWeight:900, fontSize:26, color:"#fff", letterSpacing:2, margin:"6px 0" }}>Fin de partida</h1>
          <div style={ornS}>✦ ✦ ✦</div>
        </div>
        <div style={{ padding:"22px 24px 26px" }}>
          <p style={{ textAlign:"center", fontFamily:"'Crimson Text',serif", fontSize:19, color:"#fde68a", marginBottom:20, fontStyle:"italic" }}>
            {isTie?`¡Empate entre ${winners.map(i=>playerNames[i]).join(" y ")}!`:`¡Victoria de ${playerNames[winners[0]]}!`}
          </p>
          <div style={{ display:"flex", flexDirection:"column", gap:8, marginBottom:22 }}>
            {sorted.map(({s,i}, rank) => (
              <div key={i} style={{ display:"flex", alignItems:"center", gap:12, background:rank===0?"rgba(200,150,12,0.12)":"rgba(255,255,255,0.04)", border:`1px solid ${rank===0?"#c8960c55":"#ffffff15"}`, borderRadius:12, padding:"10px 16px", animation:`fadeUp .4s ease ${rank*70}ms both` }}>
                <span style={{ fontSize:20, width:28, textAlign:"center" }}>{medals[rank]||`${rank+1}.`}</span>
                <div style={{ width:13, height:13, borderRadius:"50%", background:PLAYER_COLORS[i].bg, border:`2px solid ${PLAYER_COLORS[i].border}`, flexShrink:0 }} />
                <span style={{ flex:1, fontFamily:"'Crimson Text',serif", fontSize:17, color:"#e8d8b0" }}>{playerNames[i]}</span>
                <span style={{ fontFamily:"'Cinzel',serif", fontWeight:700, fontSize:22, color:PLAYER_COLORS[i].border }}>{s}</span>
                <span style={{ fontSize:12, color:"#555" }}>pts</span>
              </div>
            ))}
          </div>
          <div style={{ display:"flex", gap:10 }}>
            <button onClick={onMenu} style={{ flex:1, padding:"12px", background:"none", border:"1px solid #c8960c66", borderRadius:12, color:"#c8960c", fontSize:14 }}>Menú</button>
            <button onClick={onPlayAgain} style={{ flex:1, padding:"12px", background:"linear-gradient(135deg,#78500a,#c8960c,#78500a)", border:"2px solid #f0c040", borderRadius:12, color:"#1a0e00", fontSize:15, fontWeight:700 }}>Jugar de nuevo</button>
          </div>
        </div>
      </div>
    </div>
  );
}

const pnl = { width:"100%", maxWidth:460, borderRadius:18, background:"linear-gradient(170deg,#2a1f0e,#1a1208)", border:"2px solid #c8960c", boxShadow:"0 0 0 1px #78500a, 0 24px 80px #000a, inset 0 1px 0 #f0c04020", overflow:"hidden" };
const pnlHdr = { background:"linear-gradient(135deg,#6b3e00,#c8960c,#6b3e00)", padding:"16px 24px 12px", textAlign:"center", borderBottom:"2px solid #78500a" };
const ornS = { color:"#fde68a", fontSize:11, letterSpacing:6, opacity:.65, marginBottom:2 };
const lbl = { display:"block", fontFamily:"'Cinzel',serif", fontSize:11, letterSpacing:2, textTransform:"uppercase", color:"#c8960c", marginBottom:10 };
