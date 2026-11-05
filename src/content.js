(function(g){
"use strict";
const advisers=[
{id:"legal",name:"MARA VALE",role:"GENERAL COUNSEL",color:"#b9a6a0",line:"What you say now becomes evidence."},
{id:"ops",name:"DANIEL ROOK",role:"OPERATIONS DIRECTOR",color:"#a9bbc4",line:"The business still has to open tomorrow."},
{id:"client",name:"INES PARK",role:"CLIENT PARTNER",color:"#b4a6b5",line:"Trust is built in the uncomfortable call."},
{id:"finance",name:"ELI MERCER",role:"FINANCE CONTROLLER",color:"#9fbaa9",line:"Cash doesn't care about your intentions."},
{id:"security",name:"NOOR SHAH",role:"SECURITY LEAD",color:"#a9b3c6",line:"A timestamp is a clue, not a verdict."},
{id:"people",name:"RUTH BELL",role:"PEOPLE DIRECTOR",color:"#c4ae94",line:"Rumours spread faster than corrections."}
];
const episodes=[
{id:"send",number:"01",time:"09:17",title:"THE SEND",kicker:"One unexpected message. One leadership opportunity.",scene:"mail",base:8000,
brief:"At 09:17 an internal transformation proposal reaches 600 employees and three major clients. No restructuring decision has been approved. A £240,000-a-year client renewal is approaching, and the board needs a credible plan before lunch.",
headline:"ONE EMAIL. SIX DECISIONS. YOUR TEAM'S CALL.",question:"How will you protect trust and keep the business moving?",pressure:"The cause is unverified. Balance openness, security and continuity.",
evidence:[
{type:"LEAKED EMAIL",time:"09:17",title:"THE FORWARDED MEMO",body:"Subject: RESTRUCTURING — STRICTLY CONFIDENTIAL. The email distribution list includes all staff and three external client contacts. The attachment contains internal cost reductions and a proposed change to service coverage.",clue:"The message was sent, not merely drafted. Deleting it cannot recall copies."},
{type:"ACCESS LOG",time:"09:12",title:"THE OPEN SESSION",body:"A temporary contractor account accessed the shared documents folder five minutes before the send. The session was due to expire the previous evening.",clue:"An active session is evidence of access, not proof of who sent the email."},
{type:"CLIENT MESSAGE",time:"09:26",title:"THE FIRST CALL",body:"Your largest client asks whether the restructuring plan will affect the service they pay for. Procurement is copied into the message.",clue:"They are asking about delivery confidence, not just confidentiality."}
],
advice:[
"Preserve the original message and access logs. Do not name a culprit or assert containment until you can prove it.",
"Any blanket shutdown may stop the overnight delivery handover. Plan a continuity route before revoking access.",
"Call the renewal client with confirmed facts. Silence will be interpreted as avoidance.",
"£260k is your 90-day response fund. The £240k renewal is annual contract value, not spendable cash.",
"An open contractor session is a lead, not an attribution. Separate access evidence from transmission evidence.",
"Staff will see the restructuring language as a threat. Acknowledgement must precede reassurance."
],
plans:[
{name:"CONTAIN THE LEAK",verb:"Secure the perimeter",desc:"Suspend external sharing, preserve evidence and open a focused investigation.",benefits:["Limits further exposure","Protects forensic evidence"],cost:"Investigation costs money; delivery slows.",spend:18000,delta:{legal:-11,ops:6,workforce:2,customer:-8},trust:8,fallout:"The client receives a careful factual update. Investigators begin work, but operations report a slower handover.",tag:"CONTROL"},
{name:"PULL THE PLUG",verb:"Freeze everything",desc:"Shut down contractor access and outbound file sharing immediately.",benefits:["Rapidly closes access","Demonstrates visible action"],cost:"Service interruption and contractor claims become likely.",spend:32000,delta:{legal:-14,ops:16,workforce:7,customer:-4},trust:3,delay:{due:2,cost:9000,label:"Emergency restoration after blanket shutdown",delta:{ops:5}},fallout:"Access is cut. So is part of tomorrow's delivery pipeline. Your client now wants an operational recovery plan.",tag:"SHUTDOWN"},
{name:"CALL THE CLIENT",verb:"Protect the relationship",desc:"Keep services running and brief the client immediately while investigation starts.",benefits:["Preserves delivery","Builds client confidence"],cost:"Exposure remains open longer; early assurances carry legal risk.",spend:9000,delta:{legal:12,ops:-3,workforce:-2,customer:-14},trust:12,delay:{due:2,cost:13000,label:"Late forensic remediation",delta:{legal:5}},fallout:"The client appreciates the direct call. Security warns that the source of the leak is still unresolved.",tag:"RELATIONSHIP"}
],
signals:[
{name:"FACTS ONLY",line:"We have confirmed an unauthorised distribution and are investigating.",delta:{legal:-3,customer:-2},trust:2},
{name:"OPEN LETTER",line:"We will publish a verified timeline and corrective actions.",delta:{legal:4,workforce:-5,customer:-4},trust:5},
{name:"NO IMPACT",line:"There will be no impact on service.",delta:{legal:10,ops:5,customer:-5},trust:7,delay:{due:3,cost:8000,label:"Unfunded service assurance",delta:{customer:7}}}
]},
{id:"floor",number:"02",time:"10:06",title:"THE FLOOR",kicker:"Clarity and motivation can change the outcome.",scene:"floor",base:11000,
brief:"The draft references 40 roles, two depots and a hiring freeze. Colleagues are sharing screenshots and asking questions. A team leader says the afternoon shift may decline extra hours until management explains the proposal.",
headline:"PEOPLE NEED ANSWERS. THE BUSINESS NEEDS THEM.",question:"How will you engage the team and protect today's service?",pressure:"Proposed role changes are unsigned. An immediate staffing gap still needs a solution.",
evidence:[
{type:"STAFF CHAT",time:"09:44",title:"THE SCREENSHOT",body:"A message with the heading 'THEY ALREADY DECIDED' has been reposted hundreds of times. It quotes a preliminary cost model as a final decision.",clue:"The document is real. The interpretation is not yet verified."},
{type:"SHIFT ROSTER",time:"10:01",title:"THE COVERAGE GAP",body:"Two supervisors have requested leave and four experienced team members are refusing additional hours pending an explanation.",clue:"The next 24 hours are more fragile than the monthly staffing forecast."},
{type:"DRAFT MEMO",time:"08:30",title:"THE UNSIGNED PLAN",body:"The restructuring proposal carries no board approval. A margin note says 'subject to consultation and client commitments'.",clue:"Management can truthfully say no final decision has been taken."}
],
advice:[
"Consultation language matters. Do not treat a draft as an approved redundancy decision.",
"Your immediate constraint is shift coverage. The company cannot communicate its way around an empty depot.",
"A visible staff dispute will be noticed by clients faster than any official update.",
"An open-ended overtime guarantee is a liability. Put a cap on it.",
"Lock down copies of the memo without deleting the audit trail or silencing legitimate staff discussion.",
"Speak directly to employees. Managers-only messages will be read as concealment."
],
plans:[
{name:"OPEN THE ROOM",verb:"Face the workforce",desc:"Hold a live all-staff briefing, explain what is draft, and establish consultation.",benefits:["Cuts speculation","Creates a credible channel"],cost:"Management time and consultation costs; some operations pause.",spend:16000,delta:{workforce:-17,legal:-5,ops:5,customer:-2},trust:4,fallout:"Staff challenge the plan in public, but the most damaging rumour loses momentum.",tag:"DIALOGUE"},
{name:"KEEP THE LINE MOVING",verb:"Brief managers only",desc:"Give team leaders talking points and prioritise today's service coverage.",benefits:["Protects the shift","Low immediate cash cost"],cost:"Staff may see a closed-door response as evasive.",spend:8000,delta:{ops:-9,workforce:14,legal:3,customer:3},trust:-2,fallout:"The shift starts on time. By lunch, an anonymous staff account is publishing screenshots of your talking points.",tag:"CONTINUITY"},
{name:"BUY BREATHING ROOM",verb:"Offer temporary protection",desc:"Fund limited retention bonuses and a temporary overtime guarantee.",benefits:["Stabilises coverage","Signals tangible support"],cost:"Expensive precedent and deferred wage obligations.",spend:29000,delta:{workforce:-21,ops:-6,legal:4,customer:-3},trust:3,delay:{due:4,cost:10000,label:"Temporary overtime guarantee",delta:{liquidity:4}},fallout:"The rota fills. Finance asks how many more weeks you can afford this promise.",tag:"CASH"}
],
signals:[
{name:"INVITE QUESTIONS",line:"No final decisions have been approved. Ask us directly.",delta:{workforce:-6,legal:-2},trust:2},
{name:"PROTECT SERVICE",line:"Our first priority is uninterrupted delivery.",delta:{ops:-4,workforce:5},trust:0},
{name:"PROMISE JOBS",line:"No one will lose their role as a result of this.",delta:{workforce:-8,legal:12},trust:4,delay:{due:4,cost:12000,label:"Unfunded workforce promise",delta:{legal:6}}}
]},
{id:"client",number:"03",time:"11:24",title:"THE CLIENT MEETING",kicker:"Trust is an opportunity you can earn.",scene:"client",base:14000,
brief:"Your largest client has moved its renewal discussion forward. It wants an independently verifiable recovery plan by 14:00 and a service guarantee that the board can sign.",
headline:"A RENEWAL IS WON WITH EVIDENCE.",question:"What can you show the client by 14:00 to earn confidence?",pressure:"The £240k annual renewal is at stake, but future contract revenue is not today's cash.",
evidence:[
{type:"PROCUREMENT NOTE",time:"11:03",title:"THE CONDITIONS",body:"The client requires an incident owner, an audit trail and a credible plan for uninterrupted service. A full unconditional guarantee is not required.",clue:"A bounded commitment may be more credible than an absolute promise."},
{type:"FINANCE SHEET",time:"11:12",title:"THE EXPOSURE",body:"The renewal is worth £240,000 per year in revenue, not immediate cash. Emergency response spending draws on the separate £260,000 fund.",clue:"Do not treat future contract value as money available today."},
{type:"OPERATIONS NOTE",time:"11:18",title:"THE BOTTLENECK",body:"The client delivery team can meet the current deadline only if at least two specialist staff remain on the account.",clue:"A recovery plan that removes the delivery team is not operationally credible."}
],
advice:[
"Make any guarantee bounded and evidence-backed. Avoid signing an impossible absolute warranty.",
"Two specialists are the critical path. A recovery plan must fund their time.",
"The client is asking for accountability. A named incident owner may matter more than polished slides.",
"An independent review is affordable only if you preserve enough liquidity for operations.",
"An audit must validate controls, not just produce a glossy certificate.",
"Overloading the same two specialists creates a retention and burnout problem."
],
plans:[
{name:"INDEPENDENT REVIEW",verb:"Let outsiders test it",desc:"Commission an external review and give the client a time-bound remediation schedule.",benefits:["Credible evidence","Reduces legal ambiguity"],cost:"Audit expense and specialist time pressure.",spend:26000,delta:{legal:-10,customer:-17,ops:5,workforce:3},trust:15,fallout:"Procurement accepts the review timetable. Delivery managers scramble to free up specialists.",tag:"ASSURANCE"},
{name:"SIGN THE GUARANTEE",verb:"Offer certainty",desc:"Commit to full service and remediation deadlines before the technical work is complete.",benefits:["Fast reassurance","Protects short-term renewal talks"],cost:"Contractual liability if the guarantee is missed.",spend:12000,delta:{customer:-16,legal:10,ops:9,workforce:4},trust:13,delay:{due:5,cost:22000,label:"Contractual service guarantee exposure",delta:{customer:10,legal:6}},fallout:"The client likes the signature. Legal notes that the company has just priced an unknown risk at zero.",tag:"PROMISE"},
{name:"SERVICE FIRST",verb:"Deliver before declaring",desc:"Protect the specialist team and show the client operational proof before making promises.",benefits:["Improves delivery odds","Preserves practical credibility"],cost:"Burnout risk and slower independent assurance.",spend:18000,delta:{ops:-16,customer:-7,workforce:12,legal:4},trust:7,fallout:"The delivery dashboard improves. Staff warn that the same people are carrying the entire recovery.",tag:"EXECUTION"}
],
signals:[
{name:"SIGNED MILESTONES",line:"Here are the controls we can verify, with owners and dates.",delta:{customer:-5,legal:-3},trust:4},
{name:"BOARD GUARANTEE",line:"The board guarantees full recovery within 48 hours.",delta:{customer:-6,legal:10,ops:4},trust:8,delay:{due:5,cost:14000,label:"Board guarantee remediation",delta:{legal:4}}},
{name:"NO NEW PROMISES",line:"We will report when our assessment is complete.",delta:{legal:-5,customer:7},trust:-3}
]},
{id:"press",number:"04",time:"13:12",title:"THE PUBLIC CONVERSATION",kicker:"Your response can set a constructive example.",scene:"press",base:12000,
brief:"A business reporter has obtained the memo and asks for comment within 30 minutes. An employee has posted a contradictory account online. The story is moving beyond the company.",
headline:"YOUR RESPONSE CAN SHAPE THE STORY.",question:"How will you offer clarity without creating new risks?",pressure:"The journalist has the draft, but the facts are narrower than the rumour.",
evidence:[
{type:"PRESS ENQUIRY",time:"12:58",title:"THE JOURNALIST",body:"The reporter asks whether the company plans redundancies and whether client service will be cut. They have the first page of the draft but not its approval status.",clue:"There is a narrow opportunity to correct a material factual error."},
{type:"SOCIAL POST",time:"13:05",title:"THE ANONYMOUS THREAD",body:"An employee account claims the restructuring was approved last week. The attached screenshot shows an unsigned version.",clue:"The approval claim is unsubstantiated; the underlying document is genuine."},
{type:"BOARD MESSAGE",time:"13:09",title:"THE DIRECTIVE",body:"The chair wants the company to avoid speculation and protect the renewal. Legal warns against issuing a misleading blanket denial.",clue:"The board is divided between silence and controlled disclosure."}
],
advice:[
"Correct false factual claims, but do not deny the existence of the genuine draft.",
"Make sure public statements do not contradict what shift managers are telling staff.",
"Clients will read the press statement. Coordinate it with the account update.",
"Litigation threats consume money without guaranteeing a retraction.",
"Publish only facts verified by the investigation. Preserve screenshots and timestamps.",
"An anonymous employee is not an enemy to be publicly identified."
],
plans:[
{name:"CONTROLLED TIMELINE",verb:"Own the facts",desc:"Publish verified facts, correct the approval rumour and name the response lead.",benefits:["Reduces misinformation","Aligns internal and external messages"],cost:"Creates public scrutiny and legal review work.",spend:15000,delta:{legal:2,customer:-12,workforce:-9,ops:2},trust:10,fallout:"The headline still runs, but it now includes the company's verified timeline rather than speculation alone.",tag:"TRANSPARENCY"},
{name:"HOLD THE LINE",verb:"Issue a short holding note",desc:"Acknowledge the enquiry and decline to speculate until the investigation concludes.",benefits:["Avoids premature claims","Lower immediate spend"],cost:"Leaves the rumour cycle unanswered.",spend:9000,delta:{legal:-5,customer:8,workforce:6,ops:0},trust:-3,fallout:"The company avoids a false statement. The story fills the silence with anonymous commentary.",tag:"RESTRAINT"},
{name:"THREATEN ACTION",verb:"Go on the offensive",desc:"Demand the story be withdrawn and threaten legal proceedings over the leak.",benefits:["Signals resolve","May deter some re-publication"],cost:"Escalates attention and alienates staff and clients.",spend:24000,delta:{legal:10,customer:14,workforce:12,ops:2},trust:-12,fallout:"The legal letter becomes part of the story. The journalist publishes the company's threats alongside the memo.",tag:"CONFRONTATION"}
],
signals:[
{name:"CORRECT THE RECORD",line:"The document is a draft. No final restructuring decision has been approved.",delta:{legal:-4,workforce:-5,customer:-3},trust:4},
{name:"APOLOGISE BROADLY",line:"We apologise for every concern this has caused.",delta:{workforce:-4,customer:-4,legal:3},trust:3},
{name:"REFUSE COMMENT",line:"We will not comment on internal company matters.",delta:{legal:-2,workforce:7,customer:6},trust:-5}
]},
{id:"warehouse",number:"05",time:"15:40",title:"THE DELIVERY TEST",kicker:"Plans count only when the team can deliver.",scene:"warehouse",base:17000,
brief:"At 14:00, procurement logged whatever response your team provided—or the lack of one—and did not confirm renewal. Now the overnight service run is at risk: a contractor wants a supervised transition, two senior operators are exhausted, and procurement is still demanding verified delivery milestones.",
headline:"THE NEXT SHIFT IS OUR REAL TEST.",question:"How will you deliver while supporting the people doing the work?",pressure:"Two key specialists are fatigued and the backup route still needs validation.",
evidence:[
{type:"DELIVERY BOARD",time:"15:16",title:"THE MISSED HANDOVER",body:"One specialist team is short of capacity. The backup route has not been fully tested. There is still a narrow window to protect the critical shipment.",clue:"More money can buy capacity, but not instant experience."},
{type:"VENDOR LETTER",time:"15:27",title:"THE CONTRACTOR",body:"The contractor requests continued supervised access or a paid transition. Its agreement permits a short emergency extension under supervision.",clue:"An agreed, supervised transition is available, but it requires security controls and money."},
{type:"PEOPLE UPDATE",time:"15:34",title:"THE EXHAUSTION WARNING",body:"Two key staff have worked through their breaks. Both say another emergency shift would be unsafe.",clue:"A heroic overtime plan has a real operational and human limit."}
],
advice:[
"Document any vendor transition and ensure temporary access is restricted and auditable.",
"Protect the critical delivery path. The backup route is not yet proven.",
"Tell the client which milestone is genuinely at risk rather than hiding a miss.",
"Overtime is a deferred cost as well as a cash cost. Budget for recovery time.",
"Supervised vendor access can be safer than informal workarounds.",
"Exhausted staff are not a renewable resource. Repeated overtime raises future failure risk."
],
plans:[
{name:"BUY THE BACKUP",verb:"Switch delivery route",desc:"Fund a new specialist vendor and controlled transition to restore capacity.",benefits:["Diversifies delivery risk","Protects key staff"],cost:"Large cash commitment and transition uncertainty.",spend:38000,delta:{ops:-15,workforce:-5,customer:-5,legal:2},trust:5,delay:{due:7,cost:9000,label:"Vendor transition close-out",delta:{liquidity:4}},fallout:"The backup vendor takes the load. Finance records a transition commitment that will outlive the crisis.",tag:"RESILIENCE"},
{name:"ONE MORE SHIFT",verb:"Push the existing team",desc:"Pay overtime and accelerate the critical delivery using experienced staff.",benefits:["Fastest immediate recovery","Avoids an untested vendor"],cost:"Burnout and later service deterioration.",spend:24000,delta:{ops:-14,workforce:18,legal:4,customer:-4},trust:3,delay:{due:6,cost:12000,label:"Fatigue-related recovery and staffing",delta:{ops:10,workforce:7}},fallout:"The shipment moves. The people who saved it are asking who will cover tomorrow.",tag:"OVERTIME"},
{name:"RENEGOTIATE SCOPE",verb:"Tell the client the limit",desc:"Ask the client to defer lower-priority work and protect the critical shipment.",benefits:["Protects workforce capacity","Preserves cash"],cost:"Client may view the reduction as a breach of confidence.",spend:11000,delta:{ops:5,workforce:-11,customer:12,legal:-3},trust:-6,fallout:"The critical shipment remains viable, but the client wants a commercial concession for reduced scope.",tag:"TRADE-OFF"}
],
signals:[
{name:"MILESTONE ALERT",line:"This is the at-risk milestone and our revised recovery path.",delta:{customer:-5,legal:-2},trust:5},
{name:"EVERYTHING ON TRACK",line:"All delivery commitments remain on schedule.",delta:{customer:-4,legal:8,ops:6},trust:5,delay:{due:6,cost:10000,label:"Unverified delivery assurance",delta:{customer:9}}},
{name:"INTERNAL ONLY",line:"No external update until the shipment is complete.",delta:{ops:-2,customer:9},trust:-4}
]},
{id:"board",number:"06",time:"17:30",title:"THE NEXT MOVE",kicker:"Choose the company you want to build.",scene:"board",base:9000,
brief:"The board has your incident log, the cash ledger and the client's final questions. You cannot undo the morning. You can choose what kind of recovery the company will fund.",
headline:"SIX DECISIONS LATER, WHAT COMES NEXT?",question:"What will your leadership team invest in next?",pressure:"Your choices have created cash costs, staff responsibilities and opportunities to rebuild trust.",
evidence:[
{type:"BOARD PACK",time:"17:02",title:"THE COST OF THE DAY",body:"Every response commitment is now on the ledger. Unresolved contingent liabilities may become payable after this session.",clue:"Remaining cash and pending liabilities are separate. Neither is the client contract value."},
{type:"CLIENT POSITION",time:"17:18",title:"THE RENEWAL NOTE",body:"The client will judge evidence, continuity and the credibility of future commitments. It will not accept a cosmetic statement as remediation.",clue:"A contract can be conditionally retained even when trust is damaged."},
{type:"CHAIR'S QUESTION",time:"17:29",title:"THE LAST PAGE",body:"The chair asks: what are we prepared to stop doing to make this plan real? Every answer has a cost.",clue:"A smaller funded plan may be better than an impossible promise."}
],
advice:[
"Fund independent oversight and clear owners. Avoid signing unbounded warranties.",
"Make sure the recovery programme leaves sufficient operating capacity.",
"Clients reward evidence-backed follow-through, not theatrical certainty.",
"Protect liquidity. Pending commitments are not free because they fall after today.",
"Security controls require ongoing ownership after the immediate incident closes.",
"Staff need a recovery plan that does not depend on permanent emergency overtime."
],
plans:[
{name:"FUND OVERSIGHT",verb:"Build a lasting control",desc:"Approve independent monitoring, named owners and a measured recovery schedule.",benefits:["Stronger long-term assurance","Reduces legal and client exposure"],cost:"Significant final cash commitment.",spend:28000,delta:{legal:-13,customer:-10,workforce:-6,ops:3},trust:13,fallout:"The board funds the work rather than just approving the language. The client receives a verifiable plan.",tag:"GOVERNANCE"},
{name:"MAKE THE PLEDGE",verb:"Promise the full recovery",desc:"Announce an accelerated recovery timetable with additional client guarantees.",benefits:["Signals confidence","May rescue fragile renewal talks"],cost:"Creates expensive future obligations and staff pressure.",spend:18000,delta:{customer:-14,ops:-5,workforce:10,legal:5},trust:12,delay:{due:7,cost:18000,label:"Accelerated recovery commitment",delta:{liquidity:6}},fallout:"The board approves the pledge. The client is encouraged, but the cost of delivery has been pushed into next month.",tag:"AMBITION"},
{name:"CUT THE EXPOSURE",verb:"Protect the balance sheet",desc:"Reduce non-critical commitments and focus on a smaller sustainable service promise.",benefits:["Preserves cash","Reduces operational complexity"],cost:"Damages confidence and leaves workforce uncertainty.",spend:7000,delta:{ops:-5,workforce:12,customer:15,legal:-3},trust:-14,fallout:"The company protects cash. The client asks whether the smaller service promise is still worth renewing.",tag:"DISCIPLINE"}
],
signals:[
{name:"OWN THE TRADE-OFFS",line:"Here is what we will fund, what we will stop, and how progress will be verified.",delta:{legal:-5,customer:-6,workforce:-3},trust:6},
{name:"PROMISE EVERYTHING",line:"We will restore every commitment without exception.",delta:{customer:-7,legal:12,workforce:9},trust:9,delay:{due:7,cost:16000,label:"Unfunded board-wide guarantee",delta:{liquidity:5}}},
{name:"CLOSE THE FILE",line:"The incident is resolved and normal business has resumed.",delta:{legal:9,customer:8,workforce:5},trust:-6}
]}
];
g.BCContent={advisers:advisers,episodes:episodes,initialCash:260000,annualContractValue:240000,baseline:{legal:47,ops:38,workforce:44,customer:51,liquidity:25},variants:[
{title:"Temporary access remained active",effect:{legal:4,ops:2},note:"The contractor session was still live after its scheduled expiry."},
{title:"A forwarding rule widened exposure",effect:{legal:6,customer:3},note:"An internal forwarding rule amplified the distribution beyond the original list."},
{title:"The address book included old contacts",effect:{customer:5,workforce:2},note:"An outdated contact group added recipients who should not have been included."}
]};
})(globalThis);
