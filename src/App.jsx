// src/App.jsx
import React, { useMemo, useState } from "react";

/** ---------------------------
 *  Question bank (A/B only)
 *  ---------------------------
 */
const QUESTIONS = [
  // 1.* Motivation + Capacity (capacity items only flag; not scored)
  { code: "1.1", text: "When would you start withdrawing from this account?", A: "Within a few years", B: "In 10+ years", dimension: "Motivation", isKey: true, weight: 1, high: "B" },
  { code: "1.2", text: "Preferred withdrawal horizon?", A: "Short (<5y)", B: "Longer plan", dimension: "CapacityConstraint", cap: (opt)=>({ Short_Horizon_Flag: opt==="A" }) },
  { code: "1.3", text: "Main focus for the horizon?", A: "Short term", B: "Long term", dimension: "Motivation", isKey: false, weight: 1, high: "B" },
  { code: "1.4", text: "What matters more?", A: "Capital protection", B: "Growth", dimension: "Motivation", isKey: false, weight: 1, high: "B" },
  { code: "1.5", text: "Income today vs growth tomorrow?", A: "Income now", B: "Growth later", dimension: "Motivation", isKey: false, weight: 1, high: "B" },
  { code: "1.6", text: "Accept a potentially large annual loss?", A: "Yes, accept", B: "Prefer safer", dimension: "CapacityConstraint", cap: (opt)=>({ ConsistencyCheck: opt==="A" ? "Aggressive":"Conservative" }) },
  { code: "1.7", text: "Limited income / net worth; invest style?", A: "Still aggressive", B: "Conservative", dimension: "CapacityConstraint", cap: (opt)=>({ LowCapacity_Aggressive: opt==="A" }) },
  { code: "1.8", text: "Positioning preference?", A: "Concentrated", B: "Diversified", dimension: "CapacityConstraint", cap: (opt)=>({ Concentration_Flag: opt==="A" }) },
  { code: "1.9", text: "Emergency funding source?", A: "Use this portfolio", B: "Use separate emergency fund", dimension: "CapacityConstraint", cap: (opt)=>({ No_Emergency_Fund: opt==="A" }) },
  { code: "1.10", text: "Reliance on this account for living expenses?", A: "Draw regularly", B: "Preserve for future", dimension: "Motivation", isKey:false, weight:1, high:"B" },

  // 2.* Risk Willingness
  { code: "2.1", text: "If this portfolio fell 25% in 3 months…", A: "Sell some to reduce losses", B: "Hold through volatility", dimension: "RiskTolerance_Willingness", isKey:true, weight:1, high:"B" },
  { code: "2.2", text: "Volatile market with higher potential returns…", A: "Stay invested", B: "Reduce exposure", dimension: "RiskTolerance_Willingness", isKey:false, weight:1, high:"A" },
  { code: "2.3", text: "Choose between small steady gains vs higher ups/downs", A: "Small steady gains", B: "Higher ups/downs", dimension: "RiskTolerance_Willingness", isKey:false, weight:1, high:"B" },
  { code: "2.4", text: "Comfort with tracking error vs index", A: "Comfortable deviating", B: "Prefer to track index", dimension: "RiskTolerance_Willingness", isKey:false, weight:1, high:"A" },

  // 3.* Experience / Behavioral Control
  { code: "3.1", text: "During market swings you usually…", A: "Stay calm", B: "Feel anxious", dimension: "BehavioralControl", isKey:false, weight:1, high:"A" },
  { code: "3.2", text: "Investing experience", A: "Experienced", B: "New", dimension: "Experience", isKey:true, weight:1, high:"A" },
  { code: "3.3", text: "Have you experienced a major drawdown?", A: "Yes", B: "No", dimension: "Experience", isKey:true, weight:1, high:"A" },
  { code: "3.4", text: "New product due diligence", A: "Assess myself", B: "Rely on advice", dimension: "Experience", isKey:false, weight:1, high:"A" },
  { code: "3.5", text: "Analysis style", A: "Independent analysis", B: "Advisor recommendations", dimension: "Experience", isKey:false, weight:1, high:"A" },

  // 4.* More behavioral / risk items
  { code: "4.1", text: "After a sudden drop you…", A: "Check frequently", B: "Avoid looking for a while", dimension: "BehavioralControl", isKey:false, weight:1, high:"B" },
  { code: "4.2", text: "After selling then price rises…", A: "Regret", B: "Move on quickly", dimension: "BehavioralControl", isKey:false, weight:1, high:"B" },
  { code: "4.3", text: "Style preference", A: "Enjoy trading", B: "Hands-off long-term", dimension: "BehavioralControl", isKey:false, weight:1, high:"B" },
  { code: "4.4", text: "Friends make quick profits…", A: "Copy them", B: "Stick to my plan", dimension: "BehavioralControl", isKey:true, weight:1, high:"B" },
  { code: "4.5", text: "Under uncertainty you…", A: "Decide quickly", B: "Wait for more info", dimension: "BehavioralControl", isKey:false, weight:1, high:"B" },
  { code: "4.6", text: "After profits you…", A: "Take profit quickly", B: "Let winners run", dimension: "BehavioralControl", isKey:false, weight:1, high:"B" },
  { code: "4.7", text: "After losses you…", A: "Hold losers", B: "Sell quickly", dimension: "BehavioralControl", isKey:false, weight:1, high:"B" },
  { code: "4.8", text: "Largest one-year loss tolerable", A: "Small loss tolerance", B: "Large loss tolerance", dimension: "RiskTolerance_Willingness", isKey:true, weight:1, high:"B" },
  { code: "4.9", text: "Rebalancing during stress", A: "Follow plan strictly", B: "Adjust emotionally", dimension: "BehavioralControl", isKey:true, weight:1, high:"A" },
  { code: "4.10", text: "Advisor action in stressful times", A: "Reduce risk proactively", B: "Stay the course", dimension: "RiskTolerance_Willingness", isKey:false, weight:1, high:"B" },
];

/** ---------------------------
 *  Scoring helpers
 *  ---------------------------
 */
const RIGHT_LEFT = {
  Motivation: ["M","L"],
  RiskTolerance_Willingness: ["B","S"],
  Experience: ["E","F"],
  BehavioralControl: ["D","C"],
};
const DEFAULT_GRAY = { Motivation:"L", RiskTolerance_Willingness:"S", Experience:"F", BehavioralControl:"D" };

function computeScores(answers){
  const capacity = { Short_Horizon_Flag:false, Concentration_Flag:false, No_Emergency_Fund:false, LowCapacity_Aggressive:false };
  const perDim = { Motivation:[], RiskTolerance_Willingness:[], Experience:[], BehavioralControl:[] };
  const stdLow=30,stdHigh=70,keyLow=20,keyHigh=80; const R=60,L=40;

  for(const q of QUESTIONS){
    const opt=answers[q.code]; if(!opt) continue;
    if(q.dimension==="CapacityConstraint" && q.cap){ Object.assign(capacity, q.cap(opt)); continue; }
    const s = opt===(q.high||"B") ? (q.isKey?keyHigh:stdHigh) : (q.isKey?keyLow:stdLow);
    perDim[q.dimension].push({ score:s, w:q.weight||1, isKey:!!q.isKey });
  }

  const dimScores={};
  for(const d of Object.keys(perDim)){
    const arr=perDim[d]; if(!arr.length){ dimScores[d]=null; continue; }
    const w=arr.reduce((s,a)=>s+(a.w||1),0), tot=arr.reduce((s,a)=>s+(a.score||0)*(a.w||1),0);
    dimScores[d]=Math.round((tot/w)*100)/100;
  }

  const polarities={};
  for(const d of Object.keys(RIGHT_LEFT)){
    const sc=dimScores[d], [r,l]=RIGHT_LEFT[d];
    if(sc==null) polarities[d]=DEFAULT_GRAY[d];
    else if(sc>=R) polarities[d]=r;
    else if(sc<L)  polarities[d]=l;
    else{
      const keys=perDim[d].filter(a=>a.isKey); const km=keys.length?keys.reduce((s,a)=>s+a.score,0)/keys.length:NaN;
      if(!isNaN(km)&&km>=R) polarities[d]=r; else if(!isNaN(km)&&km<=L) polarities[d]=l; else polarities[d]=DEFAULT_GRAY[d];
    }
  }

  const hard = capacity.Short_Horizon_Flag||capacity.Concentration_Flag||capacity.No_Emergency_Fund||capacity.LowCapacity_Aggressive;
  let riskLetter = polarities.RiskTolerance_Willingness||"S", capacityAdjusted=false;
  if(hard && riskLetter==="B"){ riskLetter="S"; capacityAdjusted=true; }

  const code = `${polarities.Motivation||"L"}${riskLetter}${polarities.Experience||"F"}${polarities.BehavioralControl||"D"}`;
  return { dimScores, polarities:{...polarities,RiskTolerance_Willingness:riskLetter}, archetype:code, capacity, capacityAdjusted };
}

/** ---------------------------
 *  UI (no tailwind)
 *  ---------------------------
 */
const theme = {
  bg: "#fafafa",
  text: "#111",
  subtext: "#666",
  border: "#e6e6e6",
  card: "#fff",
  primary: "#111",
  muted: "#f2f2f2",
  green: "#22c55e",
};

const S = {
  page: { fontFamily:"system-ui, -apple-system, Segoe UI, Roboto, Arial", background: theme.bg, color: theme.text, minHeight:"100vh" },
  wrap: { maxWidth: 980, margin: "0 auto", padding: "24px" },
  header: { display:"flex", justifyContent:"space-between", alignItems:"flex-end", gap:12, marginBottom:16 },
  h1: { fontSize: 24, fontWeight: 800, margin: 0 },
  hint: { fontSize: 13, color: theme.subtext },
  progressBox: { width: 180 },
  progressBar: { height:8, background: theme.muted, borderRadius:999, overflow:"hidden" },
  progressInner: (w)=>({ width: w+"%", height:"100%", background: theme.primary, transition:"width .25s ease" }),
  grid: { display:"grid", gap:12 },
  card: { background: theme.card, border:`1px solid ${theme.border}`, borderRadius:16, padding:16, boxShadow:"0 2px 8px rgba(0,0,0,.04)" },
  code: { fontSize:12, color: theme.subtext, marginBottom:6 },
  qtext: { fontWeight:600, marginBottom:10, lineHeight:1.35 },
  twoCols: { display:"grid", gap:10, gridTemplateColumns:"1fr 1fr" },
  radio: (active)=>({
    display:"flex", gap:10, alignItems:"flex-start",
    border:`1px solid ${active? theme.primary: theme.border}`,
    borderRadius:12, padding:"10px 12px", cursor:"pointer",
    background: active? "#fff" : "#fff",
    boxShadow: active? "0 2px 10px rgba(0,0,0,.06)" : "none",
    transition:"all .15s ease"
  }),
  small: { fontSize:12, color: theme.subtext },
  btnRow: { display:"flex", gap:10, marginTop:16 },
  btnPrimary: { background: theme.primary, color:"#fff", padding:"10px 16px", borderRadius:14, border:"none", cursor:"pointer", fontWeight:600 },
  btnOutline: { background:"#fff", color:theme.text, padding:"10px 16px", borderRadius:14, border:`1px solid ${theme.border}`, cursor:"pointer", fontWeight:600 },
  result: { marginTop:16, border:`2px solid ${theme.text}`, borderRadius:16, padding:16 },
  resultHead: { display:"flex", alignItems:"center", gap:8, flexWrap:"wrap", marginBottom:10 },
  badge: { border:`1px solid ${theme.border}`, padding:"4px 10px", borderRadius:999, fontSize:14 },
  stats: { display:"grid", gap:10, gridTemplateColumns:"repeat(4,minmax(0,1fr))" },
  statCard: { border:`1px solid ${theme.border}`, borderRadius:12, padding:12 },
  statTitle: { fontSize:12, color: theme.subtext },
  statScore: { fontSize:20, fontWeight:800 },
  statPol: { fontSize:13 },
  note: { marginTop:8, fontSize:13, color:theme.subtext },
};

function Radio({name,label,checked,onChange,desc}) {
  return (
    <label style={S.radio(checked===label)}>
      <input type="radio" name={name} value={label} checked={checked===label} onChange={(e)=>onChange(e.target.value)} style={{marginTop:2}} />
      <div>
        <div style={S.small}>Option {label}</div>
        <div style={{fontSize:14, lineHeight:1.35}}>{desc}</div>
      </div>
    </label>
  );
}

function QuestionCard({q, value, set}) {
  return (
    <div style={S.card}>
      <div style={S.code}>{q.code} · {q.dimension} {q.isKey ? "· Key": ""}</div>
      <div style={S.qtext}>{q.text}</div>
      <div style={S.twoCols}>
        <Radio name={q.code} label="A" checked={value} onChange={(v)=>set(q.code,v)} desc={q.A}/>
        <Radio name={q.code} label="B" checked={value} onChange={(v)=>set(q.code,v)} desc={q.B}/>
      </div>
    </div>
  );
}

function Stat({title, score, pol}){
  return (
    <div style={S.statCard}>
      <div style={S.statTitle}>{title}</div>
      <div style={S.statScore}>{score ?? "-"}</div>
      <div style={S.statPol}>{pol || "-"}</div>
    </div>
  );
}

export default function App(){
  const [answers,setAnswers]=useState({});
  const [show,setShow]=useState(false);

  const done = Object.keys(answers).filter(k=>answers[k]).length;
  const progress = Math.round((done/QUESTIONS.length)*100);

  const result = useMemo(()=>computeScores(answers),[answers]);

  return (
    <div style={S.page}>
      <div style={S.wrap}>
        {/* header */}
        <div style={S.header}>
          <div>
            <h1 style={S.h1}>Plaza Financial Archetype — Questionnaire</h1>
            <p style={S.hint}>Choose A/B for each question. You can submit with partial answers.</p>
          </div>
          <div style={S.progressBox}>
            <div style={{textAlign:"right", fontSize:12, color:theme.subtext, marginBottom:4}}>{progress}%</div>
            <div style={S.progressBar}><div style={S.progressInner(progress)}/></div>
          </div>
        </div>

        {/* questions */}
        <div style={S.grid}>
          {QUESTIONS.map(q=>(
            <QuestionCard key={q.code} q={q} value={answers[q.code]} set={(code,val)=>setAnswers(p=>({...p,[code]:val}))}/>
          ))}
        </div>

        {/* actions */}
        <div style={S.btnRow}>
          <button style={S.btnPrimary} onClick={()=>setShow(true)}>Compute Archetype</button>
          <button style={S.btnOutline} onClick={()=>{ setAnswers({}); setShow(false); }}>Reset</button>
        </div>

        {/* results */}
        {show && (
          <div style={S.result}>
            <div style={S.resultHead}>
              <div style={{fontSize:18, fontWeight:700}}>Results</div>
              <div style={S.badge}>Archetype: <b>{result.archetype}</b></div>
              {result.capacityAdjusted && <div style={{...S.badge, borderColor: theme.green, color: theme.green}}>Capacity triggered → Risk set to S</div>}
            </div>

            <div style={S.stats}>
              <Stat title="Motivation"  score={result.dimScores?.Motivation}                 pol={result.polarities?.Motivation}/>
              <Stat title="RiskTol"     score={result.dimScores?.RiskTolerance_Willingness}  pol={result.polarities?.RiskTolerance_Willingness}/>
              <Stat title="Experience"  score={result.dimScores?.Experience}                  pol={result.polarities?.Experience}/>
              <Stat title="Control"     score={result.dimScores?.BehavioralControl}           pol={result.polarities?.BehavioralControl}/>
            </div>

            <p style={S.note}>
              Scoring: standard 30/70; key 20/80; thresholds ≥60 → right pole (M/B/E/D), &lt;40 → left pole (L/S/F/C); gray zone uses key-item mean; conservative default.
              Capacity flags (1.2/1.6/1.7/1.8/1.9) only change willingness if any flag is true and Risk = B → set to S.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
