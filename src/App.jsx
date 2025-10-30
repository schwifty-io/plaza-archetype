// src/App.jsx
import React, { useMemo, useState } from "react";

/**
 * Scoring:
 * - Key item: right-pole = 80, left-pole = 20
 * - Standard item: right-pole = 70, left-pole = 30
 * - Dimension thresholds: >=60 → right pole; <40 → left pole; 40–59 → use key-mean tiebreaker; else default left
 * Capacity flags (ability guardrails) will temper Risk Willingness B → S if any flag triggers.
 */

const QUESTIONS = [
  // ===== 1. Situation & Goals =====
  // Key items for Motivation: 1.1, 1.3, 1.4, 1.5, 1.10
  // Capacity flags (ability): 1.2, 1.6, 1.7, 1.8, 1.9

  { code: "1.1", section: "Situation & Goals",
    text: "Imagine you plan to withdraw money from your investments in the near future. Would you rather begin withdrawals within the next few years or wait more than 10 years?",
    A: "Begin within a few years", B: "Wait over 10 years",
    dimension: "Motivation", isKey: true, weight: 1, high: "B" },

  { code: "1.2", section: "Situation & Goals",
    text: "Once withdrawals begin, would you prefer to draw funds over a short period (less than 5 years) or plan for a longer duration?",
    A: "Short period", B: "Long duration",
    dimension: "CapacityConstraint",
    cap: (opt)=>({ Short_Horizon_Flag: opt==="A" }) },

  { code: "1.3", section: "Situation & Goals",
    text: "If you had to choose an investment horizon, would you focus on the short term or long-term growth potential?",
    A: "Short term", B: "Long term",
    dimension: "Motivation", isKey: true, weight: 1, high: "B" },

  { code: "1.4", section: "Situation & Goals",
    text: "Suppose your main objective is to grow your wealth. Would you prefer to protect capital first or prioritize growth?",
    A: "Protect capital", B: "Prioritize growth",
    dimension: "Motivation", isKey: true, weight: 1, high: "B" },

  { code: "1.5", section: "Situation & Goals",
    text: "If you could choose between steady income today and long-term growth tomorrow, which would you prefer?",
    A: "Steady income", B: "Long-term growth",
    dimension: "Motivation", isKey: true, weight: 1, high: "B" },

  { code: "1.6", section: "Situation & Goals",
    text: "Imagine an investment that offers higher return potential but with larger losses possible in a given year. Would you accept it or prefer a safer alternative?",
    A: "Accept higher potential losses", B: "Choose safer option",
    dimension: "CapacityConstraint",
    cap: (opt)=>({ ConsistencyCheck: opt==="A" ? "Aggressive":"Conservative" }) },

  { code: "1.7", section: "Situation & Goals",
    text: "Suppose your annual income and net worth are limited. Would you still invest aggressively or remain conservative?",
    A: "Invest aggressively", B: "Remain conservative",
    dimension: "CapacityConstraint",
    cap: (opt)=>({ LowCapacity_Aggressive: opt==="A" }) },

  { code: "1.8", section: "Situation & Goals",
    text: "If a large share of your total liquid assets would be invested in one account, would you be comfortable concentrating or prefer spreading risk?",
    A: "Concentrate investment", B: "Spread risk",
    dimension: "CapacityConstraint",
    cap: (opt)=>({ Concentration_Flag: opt==="A" }) },

  { code: "1.9", section: "Situation & Goals",
    text: "Imagine you face an emergency expense. Would you rely on your portfolio or your separate emergency reserves?",
    A: "Use portfolio", B: "Use emergency reserves",
    dimension: "CapacityConstraint",
    cap: (opt)=>({ No_Emergency_Fund: opt==="A" }) },

  { code: "1.10", section: "Situation & Goals",
    text: "If you rely on this account for living expenses, would you draw regularly or preserve it for future use?",
    A: "Draw regularly", B: "Preserve for future",
    dimension: "Motivation", isKey:false, weight:1, high:"B" },

  // ===== 2. Risk Tolerance =====
  // Key items for Risk Willingness: 2.1, 2.3, 4.8, 4.10 (also 2.4 for tracking error)
  { code: "2.1", section: "Risk Tolerance",
    text: "If your portfolio dropped 25% in three months, would you sell part to reduce losses or hold through volatility?",
    A: "Sell part", B: "Hold through volatility",
    dimension: "RiskTolerance_Willingness", isKey:true, weight:1, high:"B" },

  { code: "2.2", section: "Risk Tolerance",
    text: "If markets became volatile but with potential for higher returns, would you stay invested or reduce exposure?",
    A: "Stay invested", B: "Reduce exposure",
    dimension: "RiskTolerance_Willingness", isKey:false, weight:1, high:"A" },

  { code: "2.3", section: "Risk Tolerance",
    text: "Imagine choosing between an investment with small steady gains and one with higher ups and downs. Which would you choose?",
    A: "Small steady gains", B: "Higher ups and downs",
    dimension: "RiskTolerance_Willingness", isKey:true, weight:1, high:"B" },

  { code: "2.4", section: "Risk Tolerance",
    text: "Would you feel comfortable with returns that differ greatly from the market index, or prefer to track the index closely?",
    A: "Comfortable with deviations", B: "Track the index closely",
    dimension: "RiskTolerance_Willingness", isKey:false, weight:1, high:"A" },

  // ===== 3. Age & Experience =====
  // Key for Experience: 3.2, 3.3
  // 3.1 belongs to Behavioral Control (calm vs anxious)
  { code: "3.1", section: "Age & Experience",
    text: "When markets swing sharply, do you usually stay calm or feel anxious about potential losses?",
    A: "Stay calm", B: "Feel anxious",
    dimension: "BehavioralControl", isKey:false, weight:1, high:"A" },

  { code: "3.2", section: "Age & Experience",
    text: "Would you describe yourself as having long investing experience or being relatively new to it?",
    A: "Experienced", B: "New",
    dimension: "Experience", isKey:true, weight:1, high:"A" },

  { code: "3.3", section: "Age & Experience",
    text: "Have you personally experienced a major market downturn before?",
    A: "Yes", B: "No",
    dimension: "Experience", isKey:true, weight:1, high:"A" },

  { code: "3.4", section: "Age & Experience",
    text: "When hearing about a new investment product, would you assess it yourself or rely on professional advice?",
    A: "Assess myself", B: "Rely on advice",
    dimension: "Experience", isKey:false, weight:1, high:"A" },

  { code: "3.5", section: "Age & Experience",
    text: "Would you prefer to analyze data independently or depend on your advisor’s recommendations?",
    A: "Analyze independently", B: "Follow advisor recommendations",
    dimension: "Experience", isKey:false, weight:1, high:"A" },

  // ===== 4. Behavioral & Psychological =====
  // Key for Behavioral Control: 4.4, 4.9
  // Risk Willingness keys also include 4.8 and (advisor action) 4.10
  { code: "4.1", section: "Behavioral & Psychological",
    text: "When markets drop suddenly, do you check your investments frequently or avoid looking for a while?",
    A: "Check frequently", B: "Avoid looking",
    dimension: "BehavioralControl", isKey:false, weight:1, high:"B" },

  { code: "4.2", section: "Behavioral & Psychological",
    text: "If you sell a stock and it rises afterward, do you tend to regret the decision or move on quickly?",
    A: "Regret", B: "Move on quickly",
    dimension: "BehavioralControl", isKey:false, weight:1, high:"B" },

  { code: "4.3", section: "Behavioral & Psychological",
    text: "Would you describe yourself as enjoying trading activity or preferring a long-term hands-off approach?",
    A: "Enjoy trading", B: "Hands-off approach",
    dimension: "BehavioralControl", isKey:false, weight:1, high:"B" },

  { code: "4.4", section: "Behavioral & Psychological",
    text: "When a friend makes quick profits, do you feel tempted to copy them or stick to your own plan?",
    A: "Copy them", B: "Stick to my plan",
    dimension: "BehavioralControl", isKey:true, weight:1, high:"B" },

  { code: "4.5", section: "Behavioral & Psychological",
    text: "If faced with uncertainty, do you prefer to make a quick decision or wait for more information?",
    A: "Make quick decision", B: "Wait for information",
    dimension: "BehavioralControl", isKey:false, weight:1, high:"B" },

  { code: "4.6", section: "Behavioral & Psychological",
    text: "After a profitable period, would you rather take profits quickly or let winners run longer?",
    A: "Take profits quickly", B: "Let winners run",
    dimension: "BehavioralControl", isKey:false, weight:1, high:"B" },

  { code: "4.7", section: "Behavioral & Psychological",
    text: "After losses, would you prefer to hold losers or sell quickly to move on?",
    A: "Hold losers", B: "Sell quickly",
    dimension: "BehavioralControl", isKey:false, weight:1, high:"B" },

  { code: "4.8", section: "Behavioral & Psychological",
    text: "What is the largest one-year loss you could tolerate before reconsidering your plan — small or large?",
    A: "Small loss tolerance", B: "Large loss tolerance",
    dimension: "RiskTolerance_Willingness", isKey:true, weight:1, high:"B" },

  { code: "4.9", section: "Behavioral & Psychological",
    text: "During stressful markets, do you follow your rebalancing plan strictly or adjust emotionally?",
    A: "Follow plan", B: "Adjust emotionally",
    dimension: "BehavioralControl", isKey:true, weight:1, high:"A" },

  { code: "4.10", section: "Behavioral & Psychological",
    text: "In stressful times, would you prefer your advisor to reduce risk proactively or stay the course per plan?",
    A: "Reduce risk", B: "Stay the course",
    dimension: "RiskTolerance_Willingness", isKey:true, weight:1, high:"B" },
];

// === Polarity letters ===
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

    // capacity/guardrails
    if(q.dimension==="CapacityConstraint" && q.cap){
      Object.assign(capacity, q.cap(opt));
      continue;
    }

    // numeric scoring
    const towardRight = (opt === (q.high || "B"));
    const s = towardRight ? (q.isKey?keyHigh:stdHigh) : (q.isKey?keyLow:stdLow);
    perDim[q.dimension].push({ score:s, w:q.weight||1, isKey:!!q.isKey });
  }

  // dimension averages
  const dimScores={};
  for(const d of Object.keys(perDim)){
    const arr=perDim[d];
    if(!arr.length){ dimScores[d]=null; continue; }
    const w=arr.reduce((s,a)=>s+(a.w||1),0);
    const tot=arr.reduce((s,a)=>s+(a.score||0)*(a.w||1),0);
    dimScores[d]=Math.round((tot/w)*100)/100;
  }

  // polarity with thresholds + key tie-break
  const polarities={};
  for(const d of Object.keys(RIGHT_LEFT)){
    const sc=dimScores[d], [r,l]=RIGHT_LEFT[d];
    if(sc==null) { polarities[d]=DEFAULT_GRAY[d]; continue; }
    if(sc>=R) { polarities[d]=r; continue; }
    if(sc<L)  { polarities[d]=l; continue; }
    const keys=perDim[d].filter(a=>a.isKey);
    const km=keys.length?keys.reduce((s,a)=>s+a.score,0)/keys.length:NaN;
    if(!isNaN(km)&&km>=R) polarities[d]=r;
    else if(!isNaN(km)&&km<=L) polarities[d]=l;
    else polarities[d]=DEFAULT_GRAY[d];
  }

  // capacity guardrail tempers Risk Willingness
  const hard = capacity.Short_Horizon_Flag||capacity.Concentration_Flag||capacity.No_Emergency_Fund||capacity.LowCapacity_Aggressive;
  let riskLetter = polarities.RiskTolerance_Willingness||"S", capacityAdjusted=false;
  if(hard && riskLetter==="B"){ riskLetter="S"; capacityAdjusted=true; }

  const code = `${polarities.Motivation||"L"}${riskLetter}${polarities.Experience||"F"}${polarities.BehavioralControl||"D"}`;
  return { dimScores, polarities:{...polarities,RiskTolerance_Willingness:riskLetter}, archetype:code, capacity, capacityAdjusted };
}

// ===== Minimal, clean UI (no Tailwind) =====
const theme = {
  bg: "#fafafa", text: "#111", subtext: "#666", border: "#e6e6e6",
  card: "#fff", primary: "#111", muted: "#f2f2f2", green: "#22c55e"
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
    background: "#fff",
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
      <div style={S.code}>{q.section} · {q.code} · {q.dimension}{q.isKey ? " · Key": ""}</div>
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
              Scoring bands: Standard 30/70; Key 20/80. Thresholds ≥60 → right pole (M/B/E/D); &lt;40 → left pole (L/S/F/C); gray zone uses key-item mean; conservative default. Capacity flags (1.2/1.6/1.7/1.8/1.9) only temper Risk Willingness (B → S) when triggered.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
