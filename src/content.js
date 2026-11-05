(function(g){
"use strict";
const advisers=[
{id:"legal",name:"MARA VALE",role:"GENERAL COUNSEL",color:"#b9a6a0",line:"Clear facts make confident decisions possible."},
{id:"ops",name:"DANIEL ROOK",role:"OPERATIONS DIRECTOR",color:"#a9bbc4",line:"A strong plan must also work on the floor."},
{id:"client",name:"INES PARK",role:"CLIENT PARTNER",color:"#b4a6b5",line:"Trust grows when we show our work."},
{id:"finance",name:"ELI MERCER",role:"FINANCE CONTROLLER",color:"#9fbaa9",line:"Every pound should support a real outcome."},
{id:"security",name:"NOOR SHAH",role:"SECURITY LEAD",color:"#a9b3c6",line:"Follow the evidence, not the first theory."},
{id:"people",name:"RUTH BELL",role:"PEOPLE DIRECTOR",color:"#c4ae94",line:"A good leader gives people a real voice."}
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
{name:"VERIFY & SECURE",verb:"Protect the facts",desc:"Restrict risky external sharing, preserve evidence and assign clear investigation owners.",benefits:["Protects verified evidence","Supports credible client updates"],cost:"Targeted controls take resources and slow some handovers.",spend:18000,delta:{legal:-11,ops:6,workforce:2,customer:-8},trust:8,fallout:"The client receives a verified update and an owner for next steps. Services continue with a slower, supervised handover.",tag:"CONTROL"},
{name:"PROTECT THE SYSTEMS",verb:"Prioritise secure access",desc:"Temporarily suspend contractor access and external sharing while operations agree a safe workaround.",benefits:["Closes the known access route","Creates a visible control"],cost:"Extra restoration work and slower operations remain likely.",spend:32000,delta:{legal:-14,ops:16,workforce:7,customer:-4},trust:3,delay:{due:2,cost:9000,label:"Controlled access restoration and delivery handover",delta:{ops:5}},fallout:"The sensitive access route is closed. Your team now needs a funded recovery route for the delayed delivery handover.",tag:"SHUTDOWN"},
{name:"PUT CLIENTS FIRST",verb:"Lead with communication",desc:"Keep essential services running and brief the client promptly while technical verification begins.",benefits:["Preserves client confidence","Keeps critical work moving"],cost:"Unverified exposure persists until the evidence review catches up.",spend:9000,delta:{legal:12,ops:-3,workforce:-2,customer:-14},trust:12,delay:{due:2,cost:13000,label:"Late forensic remediation",delta:{legal:5}},fallout:"The client values the direct call and a named contact. Security asks for extra remediation because the source is still unresolved.",tag:"RELATIONSHIP"}
],
signals:[
{name:"VERIFIED FACTS",line:"We have identified an unexpected distribution and are verifying the facts.",delta:{legal:-3,customer:-2},trust:2},
{name:"OPEN UPDATE",line:"We will share a verified timeline, accountable owners and corrective steps.",delta:{legal:4,workforce:-5,customer:-4},trust:5},
{name:"SERVICE ASSURANCE",line:"Our plan is to maintain essential services while we verify the controls.",delta:{legal:6,ops:3,customer:-5},trust:6,delay:{due:3,cost:8000,label:"Service assurance contingency",delta:{customer:7}}}
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
{name:"OPEN THE CONVERSATION",verb:"Listen and clarify",desc:"Bring colleagues together, explain what remains a draft and open a structured consultation channel.",benefits:["Creates employee voice","Reduces speculation"],cost:"Management time is redirected from daily operations.",spend:16000,delta:{workforce:-17,legal:-5,ops:5,customer:-2},trust:4,fallout:"Colleagues ask difficult questions, but the live discussion replaces some rumours with verifiable next steps.",tag:"DIALOGUE"},
{name:"STABILISE THE SHIFT",verb:"Protect continuity",desc:"Equip team leaders with verified talking points, an escalation channel and a practical coverage plan.",benefits:["Maintains today's service","Gives supervisors a clear plan"],cost:"A manager-led approach may still feel distant to the workforce.",spend:8000,delta:{ops:-9,workforce:14,legal:3,customer:3},trust:-2,fallout:"The shift starts on time. Colleagues want a direct forum, not just a message through supervisors.",tag:"CONTINUITY"},
{name:"BACK THE TEAM",verb:"Provide tangible support",desc:"Offer capped retention incentives and a time-limited overtime arrangement alongside staff consultation.",benefits:["Supports staff coverage","Acknowledges extra effort"],cost:"Extra financial commitments reduce future flexibility.",spend:29000,delta:{workforce:-21,ops:-6,legal:4,customer:-3},trust:3,delay:{due:4,cost:10000,label:"Temporary overtime guarantee",delta:{liquidity:4}},fallout:"The rota fills, and employees see practical support. Finance now tracks the time-limited payroll commitment.",tag:"CASH"}
],
signals:[
{name:"INVITE QUESTIONS",line:"No final changes are approved; here is how to ask questions and contribute.",delta:{workforce:-6,legal:-2},trust:2},
{name:"EXPLAIN THE PLAN",line:"We will protect service today while creating time for an open conversation.",delta:{ops:-4,workforce:5},trust:0},
{name:"PAUSE ROLE CHANGES",line:"We will pause proposed role changes while formal consultation is organised.",delta:{workforce:-7,legal:5},trust:4,delay:{due:4,cost:12000,label:"Temporary consultation and staffing protection",delta:{legal:6}}}
]},
{id:"client",number:"03",time:"11:24",title:"THE CLIENT MEETING",kicker:"Trust is an opportunity you can earn.",scene:"client",base:14000,
brief:"Your largest client has moved its renewal discussion forward. It wants an independently verifiable recovery plan by 14:00, an accountable owner and service milestones the board can genuinely deliver.",
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
{name:"INDEPENDENT REVIEW",verb:"Invite independent scrutiny",desc:"Commission an external review with owners, clear milestones and a verified remediation schedule.",benefits:["Credible evidence","Reduces legal ambiguity"],cost:"Audit expense and specialist time pressure.",spend:26000,delta:{legal:-10,customer:-17,ops:5,workforce:3},trust:15,fallout:"Procurement welcomes independently reviewed milestones. Specialists must balance the audit with delivery.",tag:"ASSURANCE"},
{name:"COMMIT TO RECOVERY",verb:"Offer accountable milestones",desc:"Agree a bounded service-recovery commitment before every technical dependency is verified.",benefits:["Shows accountable ownership","Keeps renewal talks constructive"],cost:"Future cost rises if agreed milestones are missed.",spend:12000,delta:{customer:-16,legal:10,ops:9,workforce:4},trust:13,delay:{due:5,cost:22000,label:"Contractual service guarantee exposure",delta:{customer:10,legal:6}},fallout:"The client appreciates a concrete plan. Legal records the uncertainty as a funded contractual obligation.",tag:"PROMISE"},
{name:"PROVE SERVICE VALUE",verb:"Show operational evidence",desc:"Focus specialists on measurable delivery improvements and demonstrate progress before wider assurances.",benefits:["Shows operational progress","Builds practical confidence"],cost:"Concentrating delivery work on a few specialists risks fatigue.",spend:18000,delta:{ops:-16,customer:-7,workforce:12,legal:4},trust:7,fallout:"The delivery dashboard improves. The team needs a sustainable rota to maintain those results.",tag:"EXECUTION"}
],
signals:[
{name:"VERIFIED MILESTONES",line:"Here are the controls, owners and dates we can substantiate.",delta:{customer:-5,legal:-3},trust:4},
{name:"RECOVERY TARGET",line:"Our target is full recovery within 48 hours, with verification at each stage.",delta:{customer:-6,legal:5,ops:4},trust:7,delay:{due:5,cost:14000,label:"Board guarantee remediation",delta:{legal:4}}},
{name:"EVIDENCE FIRST",line:"We will give you a verified progress update before extending our commitments.",delta:{legal:-5,customer:7},trust:-3}
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
"A targeted request to protect personal data may help; suppressing all coverage would damage credibility.",
"Publish only facts verified by the investigation. Preserve screenshots and timestamps.",
"An anonymous employee is not an enemy to be publicly identified."
],
plans:[
{name:"SHARE THE VERIFIED STORY",verb:"Communicate transparently",desc:"Release confirmed facts, correct the approval rumour and name a response lead.",benefits:["Provides constructive context","Aligns public and staff messages"],cost:"Openness creates scrutiny and legal review work.",spend:15000,delta:{legal:2,customer:-12,workforce:-9,ops:2},trust:10,fallout:"The article still appears, but includes verified facts, a named owner and a timeline for follow-through.",tag:"TRANSPARENCY"},
{name:"VERIFY BEFORE SPEAKING",verb:"Protect accuracy",desc:"Acknowledge the enquiry and commit to a short verification window before a wider update.",benefits:["Avoids unsupported claims","Protects investigation quality"],cost:"An information gap allows others to fill in the story.",spend:9000,delta:{legal:-5,customer:8,workforce:6,ops:0},trust:-3,fallout:"The company avoids guessing, but the press needs an explicit time for the next useful update.",tag:"RESTRAINT"},
{name:"PROTECT CONFIDENTIALITY",verb:"Set responsible boundaries",desc:"Ask the journalist to protect personal details while providing an authorised factual clarification.",benefits:["Protects sensitive information","Maintains a constructive channel"],cost:"Legal review and careful wording can delay clarity.",spend:19000,delta:{legal:-7,customer:5,workforce:3,ops:2},trust:1,fallout:"Sensitive personal information is withheld. The broader concerns remain, and colleagues still need a clear explanation.",tag:"CONFRONTATION"}
],
signals:[
{name:"CORRECT THE RECORD",line:"This is a draft; no final restructuring decision has been approved.",delta:{legal:-4,workforce:-5,customer:-3},trust:4},
{name:"ACKNOWLEDGE CONCERNS",line:"We understand the concerns and will answer with verified information.",delta:{workforce:-4,customer:-4,legal:3},trust:3},
{name:"STAFF FIRST",line:"We will answer colleagues directly before sharing our verified client update.",delta:{legal:-2,workforce:-11,customer:7},trust:1}
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
{name:"ACTIVATE THE BACKUP",verb:"Share delivery load",desc:"Fund a vetted specialist partner and a controlled handover to restore capacity.",benefits:["Diversifies delivery resources","Creates breathing room for staff"],cost:"A significant cash and transition commitment remains.",spend:38000,delta:{ops:-15,workforce:-5,customer:-5,legal:2},trust:5,delay:{due:7,cost:9000,label:"Vendor transition close-out",delta:{liquidity:4}},fallout:"The specialist partner takes part of the load. The company funds a handover and future vendor close-out.",tag:"RESILIENCE"},
{name:"REDEPLOY THE CREW",verb:"Bring in rested specialists",desc:"Transfer qualified, rested colleagues from lower-priority work, fund cover for their previous assignments and protect exhausted staff.",benefits:["Uses experienced staff without unsafe overtime","Restores critical delivery quickly"],cost:"Reassignment costs money and can delay lower-priority clients.",spend:24000,delta:{ops:-14,workforce:-4,legal:2,customer:6},trust:3,delay:{due:6,cost:12000,label:"Temporary specialist cover and handover",delta:{ops:6,customer:4}},fallout:"Rested specialists secure the urgent delivery. Other clients need a clear transition plan while their normal team is temporarily reassigned.",tag:"PEOPLE"},
{name:"RENEGOTIATE PRIORITIES",verb:"Focus on what matters",desc:"Agree a short-term priority order with the client, protecting critical work and employee capacity.",benefits:["Protects frontline capacity","Uses cash responsibly"],cost:"A change of scope needs an agreed concession.",spend:11000,delta:{ops:5,workforce:-11,customer:12,legal:-3},trust:-6,fallout:"The most important delivery remains viable. The client requests a fair adjustment for rescheduled work.",tag:"TRADE-OFF"}
],
signals:[
{name:"MILESTONE ALERT",line:"Here are the priority milestones and a realistic recovery path.",delta:{customer:-5,legal:-2},trust:5},
{name:"CONFIDENT UPDATE",line:"We are protecting priority service with named contingencies, and will report any milestone change.",delta:{customer:-8,legal:5,ops:3},trust:5,delay:{due:6,cost:10000,label:"Customer assurance contingency",delta:{customer:9}}},
{name:"VERIFY BEFORE UPDATING",line:"We will confirm the next milestone after operational checks are complete.",delta:{ops:-2,customer:9},trust:-4}
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
{name:"FUND THE NEXT STEPS",verb:"Turn learning into action",desc:"Fund independent monitoring, accountable owners and a sustainable improvement schedule.",benefits:["Protects future partnerships","Creates lasting governance"],cost:"The investment reduces remaining response cash.",spend:28000,delta:{legal:-13,customer:-10,workforce:-6,ops:3},trust:13,fallout:"The team secures funding for improvements. The client receives milestones that can be checked.",tag:"GOVERNANCE"},
{name:"INVEST IN MOMENTUM",verb:"Build on confidence",desc:"Back a faster recovery timetable with measurable milestones and explicit resource commitments.",benefits:["Signals positive direction","May strengthen renewal talks"],cost:"Accelerated delivery consumes cash and adds staff pressure.",spend:18000,delta:{customer:-14,ops:-5,workforce:10,legal:5},trust:12,delay:{due:7,cost:18000,label:"Accelerated recovery commitment",delta:{liquidity:6}},fallout:"The board backs a more ambitious plan. The opportunity is real, and so are next month's commitments.",tag:"AMBITION"},
{name:"FOCUS & DELIVER",verb:"Choose sustainable scope",desc:"Prioritise services you can reliably deliver and offer the client an honest scope review.",benefits:["Preserves future capacity","Makes commitments manageable"],cost:"A narrower offer may reduce confidence and revenue.",spend:7000,delta:{ops:-5,workforce:12,customer:15,legal:-3},trust:-14,fallout:"The company protects the reserve and clarifies its offer. The client asks for a case for revised scope.",tag:"DISCIPLINE"}
],
signals:[
{name:"OWN THE TRADE-OFFS",line:"Here is what we will fund, what we will stop and how we will report progress.",delta:{legal:-5,customer:-6,workforce:-3},trust:6},
{name:"BUILD MOMENTUM",line:"We will accelerate the most important commitments with published milestones.",delta:{customer:-7,legal:7,workforce:8},trust:8,delay:{due:7,cost:16000,label:"Accelerated milestone investment",delta:{liquidity:5}}},
{name:"SHARE THE NEXT STEPS",line:"We will publish owners and a verified handover timetable for the next shift.",delta:{legal:-2,customer:3,workforce:2,ops:-8},trust:2}
]}
];
g.BCContent={advisers:advisers,episodes:episodes,initialCash:260000,annualContractValue:240000,baseline:{legal:47,ops:38,workforce:44,customer:51,liquidity:25},variants:[
{title:"Temporary access remained active",effect:{legal:4,ops:2},note:"The contractor session was still live after its scheduled expiry."},
{title:"A forwarding rule widened exposure",effect:{legal:6,customer:3},note:"An internal forwarding rule amplified the distribution beyond the original list."},
{title:"The address book included old contacts",effect:{customer:5,workforce:2},note:"An outdated contact group added recipients who should not have been included."}
]};
})(globalThis);
