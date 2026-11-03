// BUSINESS CRISIS — THE 09:17 INCIDENT
// Playable vertical slice: deterministic first-episode rules (not a server-authoritative multiplayer engine).
export const STARTING_CASH = 260000;
export const BASELINE_COST = 38000;
export const FUTURE_CONTRACT_FACE_VALUE = 240000;

export const ADVISERS = Object.freeze([
  {id:"legal",name:"Mara Voss",role:"General Counsel",short:"LEGAL",skin:"#b97c5f",hair:"#171b25",coat:"#3c4d62",style:"side",clue:"The leaked document is a draft. No board decision has been recorded. Announcing confirmed redundancies would create a legal problem that does not yet exist."},
  {id:"operations",name:"Imani Okafor",role:"Chief Operating Officer",short:"OPERATIONS",skin:"#714733",hair:"#171b20",coat:"#687c7a",style:"high",clue:"Three delivery teams are already over capacity. An all-hands meeting today would delay the client migration unless a senior owner protects delivery time."},
  {id:"finance",name:"Ellis Park",role:"Finance Director",short:"FINANCE",skin:"#d5a17c",hair:"#2b292d",coat:"#4c5669",style:"short",clue:"There is £260k in the 90-day response fund, but £38k of unavoidable operating costs hits this week. The £240k renewal is future contract value, not cash available to spend."},
  {id:"people",name:"Priya Sen",role:"People Director",short:"PEOPLE",skin:"#b87558",hair:"#1d1b24",coat:"#745c66",style:"long",clue:"Line managers saw the screenshot before leadership did. A scripted denial will travel faster than a thoughtful answer. Acknowledging uncertainty is safer than pretending nothing happened."},
  {id:"client",name:"Theo Mercer",role:"Client Director",short:"CLIENT",skin:"#c48c70",hair:"#44322b",coat:"#455b66",style:"swept",clue:"The client renewal worth £240k is due in 72 hours. Their concern is continuity: they want a named accountable owner, not a generic public-relations statement."},
  {id:"security",name:"Rowan Vale",role:"Information Security Lead",short:"SECURITY",skin:"#9b6c52",hair:"#24242b",coat:"#445264",style:"crop",clue:"The document link was opened internally at 09:12 and forwarded externally at 09:17. The logs do not establish who leaked it. Preserve evidence before assigning blame."}
]);

export const STRATEGIES = Object.freeze([
  {id:"public",index:"01",title:"Own the headline",tag:"PUBLIC RESPONSE",cost:32000,
    advantages:["Visible leadership before rumours harden","Immediate reassurance to the renewing client"],
    tradeoff:"A premature statement could misrepresent an unapproved restructuring.",
    outcomes:{client:66,people:43,legal:64,operations:52},
    headline:"YOU GOT AHEAD OF THE STORY. NOT THE FACTS.",
    consequence:"By 10:06, Northline has issued a holding statement and appointed a client continuity lead. The client accepts the call. Staff circulate a sentence about 'planned changes' that legal never approved.",
    aftershock:"Your message bought breathing room outside the business and created a harder conversation inside it.",
    pending:"Legal must correct the ambiguity before the staff forum. The client still expects a delivery plan by tomorrow.",
    notes:{legal:"Mara's draft-status warning now matters: the wording cannot imply an approved restructuring.",operations:"Imani warns that the client continuity promise needs protected delivery capacity.",finance:"Ellis flags that publicity has not increased available cash.",people:"Priya expects the staff forum to challenge the wording.",client:"Theo confirms that naming an owner was more useful than the public statement.",security:"Rowan insists the investigation remains open; there is no identified leaker."}
  },
  {id:"contain",index:"02",title:"Lock down the facts",tag:"EVIDENCE FIRST",cost:22000,
    advantages:["Preserves the forensic trail and legal position","Gives the client a private, specific continuity call"],
    tradeoff:"The silence leaves staff with a screenshot and no explanation.",
    outcomes:{client:59,people:34,legal:78,operations:63},
    headline:"YOU CONTAINED THE EVIDENCE. NOT THE RUMOUR.",
    consequence:"Security preserves the access trail, legal validates the draft, and the client gets a private call. At 10:21, an anonymous staff thread says leadership is hiding the truth.",
    aftershock:"The company has better facts than its employees have confidence.",
    pending:"A staff acknowledgement is overdue. The client wants a written service-continuity owner by tomorrow.",
    notes:{legal:"Mara confirms the evidence-first approach avoids treating a draft as a board decision.",operations:"Imani can preserve delivery hours, but not indefinitely.",finance:"Ellis says the cheaper response preserves runway, not goodwill.",people:"Priya warned that silence would be interpreted as evasion.",client:"Theo says the private call helps, but the renewal is not secured.",security:"Rowan has a defensible evidence chain, not proof of a culprit."}
  },
  {id:"people",index:"03",title:"Face your people",tag:"INTERNAL FIRST",cost:18000,
    advantages:["Restores a channel of trust with staff","Stops managers improvising contradictory answers"],
    tradeoff:"A slower external response may worry the client while delivery hours are stretched.",
    outcomes:{client:47,people:72,legal:69,operations:45},
    headline:"THE ROOM CALMED DOWN. THE CLIENT DIDN'T.",
    consequence:"At 10:00, managers receive a clear briefing: the document is a draft, no decision has been taken, and questions will be answered. Staff anxiety eases. The client hears about the meeting before receiving a continuity plan.",
    aftershock:"You stabilised the workforce and spent scarce delivery time doing it.",
    pending:"The client expects a named delivery owner within hours. Operations needs a plan to recover the lost capacity.",
    notes:{legal:"Mara approves the careful distinction between a draft and a decision.",operations:"Imani warns that today's manager briefings consume delivery capacity.",finance:"Ellis notes the lowest direct cost still carries an opportunity cost.",people:"Priya confirms that admitting uncertainty prevented a worse credibility gap.",client:"Theo says the client is still waiting for a concrete continuity plan.",security:"Rowan warns that the evidence trail remains unresolved."}
  }
]);

export function validateAdvisers(ids) {
  if (!Array.isArray(ids) || ids.length !== 2 || new Set(ids).size !== 2) {
    throw new Error("Choose exactly two different advisers before opening intelligence.");
  }
  if (ids.some(id => !ADVISERS.some(adviser => adviser.id === id))) {
    throw new Error("Unknown adviser.");
  }
  return Object.freeze([...ids]);
}

export function createSession(adviserIds) {
  return Object.freeze({phase:"decision",adviserIds:validateAdvisers(adviserIds),cash:STARTING_CASH,episode:1});
}

export function commitDecision(session,strategyId) {
  if (!session || session.phase !== "decision" || session.episode !== 1) {
    throw new Error("This decision has already been committed or the session is invalid.");
  }
  const strategy=STRATEGIES.find(item=>item.id===strategyId);
  if (!strategy) throw new Error("Unknown strategy.");
  const remaining=session.cash-BASELINE_COST-strategy.cost;
  if (remaining<0) throw new Error("Insufficient response cash.");
  const result=Object.freeze({
    strategyId:strategy.id,
    cashOpening:session.cash,
    baselineCost:BASELINE_COST,
    voluntarySpend:strategy.cost,
    cashRemaining:remaining,
    futureContractValue:FUTURE_CONTRACT_FACE_VALUE,
    outcomes:Object.freeze({...strategy.outcomes}),
    headline:strategy.headline,
    consequence:strategy.consequence,
    aftershock:strategy.aftershock,
    pending:strategy.pending,
    adviserNotes:session.adviserIds.map(id=>strategy.notes[id])
  });
  return Object.freeze({...session,phase:"resolved",cash:remaining,result});
}

export function money(value) {
  return new Intl.NumberFormat("en-GB",{style:"currency",currency:"GBP",maximumFractionDigits:0}).format(value);
}
