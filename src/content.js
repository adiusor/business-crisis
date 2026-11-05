(function(g){
"use strict";
// Project Spark: the opportunity-led 09:17 Challenge. Fictional model, not a financial forecast.
const data={
  "advisers": [
    {
      "id": "legal",
      "name": "MARA VALE",
      "role": "LEGAL & ACCESSIBILITY",
      "color": "#b9a6a0",
      "line": "An exciting promise must work for everyone."
    },
    {
      "id": "ops",
      "name": "DANIEL ROOK",
      "role": "OPERATIONS DIRECTOR",
      "color": "#a9bbc4",
      "line": "A beautiful plan deserves a practical delivery route."
    },
    {
      "id": "client",
      "name": "INES PARK",
      "role": "PARTNERSHIPS LEAD",
      "color": "#b4a6b5",
      "line": "Make it ambitious, but make it believable."
    },
    {
      "id": "finance",
      "name": "ELI MERCER",
      "role": "FINANCE CONTROLLER",
      "color": "#9fbaa9",
      "line": "An idea succeeds only if we can fund the reality."
    },
    {
      "id": "security",
      "name": "NOOR SHAH",
      "role": "TECH & DATA LEAD",
      "color": "#a9b3c6",
      "line": "Test the experience before promising the technology."
    },
    {
      "id": "people",
      "name": "RUTH BELL",
      "role": "PEOPLE & CULTURE",
      "color": "#c4ae94",
      "line": "The strongest design includes the people who deliver it."
    }
  ],
  "episodes": [
    {
      "id": "invitation",
      "number": "01",
      "time": "09:17",
      "title": "THE INVITATION",
      "kicker": "One unexpected opportunity. A day to make it real.",
      "scene": "mail",
      "base": 8000,
      "brief": "At 09:17, a national partner invites your company to pitch Project Spark: a 90-day pilot turning under-used spaces into welcoming, interactive experiences for businesses, schools and communities. The board proposal is due at 17:30. Up to three locations are possible, but nothing has been awarded. Your company has a separate £260,000 ninety-day improvement reserve and an existing £240,000-per-year service contract. Neither guarantees revenue from Project Spark.",
      "headline": "A BIG IDEA. SIX DECISIONS. YOUR TEAM'S CALL.",
      "question": "What will you promise before the details have been tested?",
      "teamPrompt": "Hear two different voices: how would each option protect the people already delivering other work?",
      "teamPrompt": "Which detail in the invitation is a fact, and which is still only an assumption? Agree on one thing you would verify first.",
      "pressure": "Excitement is real. So are the limits on money, staff time and proof.",
      "evidence": [
        {
          "type": "PARTNER INVITATION",
          "time": "09:17",
          "title": "THE SHORTLIST",
          "body": "Project Spark seeks a credible 90-day pilot with options for one, two or three locations. The funding committee will review proposals at 17:30. A place on the shortlist is not a signed contract.",
          "clue": "A clear plan wins attention; a contract is not yet guaranteed."
        },
        {
          "type": "CONCEPT SKETCH",
          "time": "09:10",
          "title": "THE THREE SPACES",
          "body": "The concept team proposes interactive learning zones, a creative workshop and a community experience. Sketches show what might be possible; none are approved technical specifications.",
          "clue": "An exciting illustration is not proof that all three locations can be delivered."
        },
        {
          "type": "FINANCE BRIEF",
          "time": "09:24",
          "title": "THE REAL BUDGET",
          "body": "The company has £260,000 allocated across its 90-day improvement and contingency work. An existing client service agreement is worth £240,000 annually, but that future revenue is not spendable cash.",
          "clue": "The new pilot has no guaranteed income and must fit the available reserve."
        }
      ],
      "advice": [
        "Separate the shortlisted invitation from an actual contract. Accessibility, public claims and approvals still need evidence.",
        "Do not reserve three sites before checking locations, staffing and operational dependencies.",
        "The partner wants imagination backed by a credible path, not a presentation full of promises.",
        "The £260,000 is a 90-day company reserve. The existing £240,000 annual service contract cannot pay today's bills.",
        "The sketches need offline and accessible alternatives before anyone treats the digital features as launch-ready.",
        "Ask the teams who would welcome visitors; they may spot practical needs absent from the first concept."
      ],
      "plans": [
        {
          "name": "DESIGN THE PROOF",
          "verb": "Verify before expanding",
          "desc": "Check feasibility, accessibility and costs, then offer a phased proposal backed by evidence.",
          "benefits": [
            "Builds credible evidence",
            "Protects future flexibility"
          ],
          "cost": "Checking the details takes time and temporarily slows creative momentum.",
          "spend": 18000,
          "delta": {
            "legal": -11,
            "ops": 6,
            "workforce": 2,
            "customer": -8
          },
          "trust": 8,
          "fallout": "The partner welcomes a clear, verifiable approach. Your team has a smaller set of claims, but stronger evidence for each.",
          "tag": "PROOF"
        },
        {
          "name": "MAKE THE BIG BID",
          "verb": "Explore the three-site vision",
          "desc": "Build a bold three-location proposal and reserve specialist design capacity now.",
          "benefits": [
            "Creates excitement",
            "Shows creative ambition"
          ],
          "cost": "Complexity, staffing and later revisions could push beyond today's assumptions.",
          "spend": 32000,
          "delta": {
            "legal": 10,
            "ops": 12,
            "workforce": 7,
            "customer": -18
          },
          "trust": 12,
          "fallout": "The three-site concept draws attention. Finance and operations will need real evidence before anyone commits to delivering every location.",
          "tag": "AMBITION",
          "delay": {
            "due": 3,
            "cost": 9000,
            "label": "Three-location feasibility and access checks",
            "delta": {
              "ops": 5
            }
          }
        },
        {
          "name": "START SMALL, SCALE SMART",
          "verb": "Start with one excellent site",
          "desc": "Offer a well-defined first location with priced, optional expansion gates.",
          "benefits": [
            "Protects the reserve",
            "Makes first delivery manageable"
          ],
          "cost": "The client might prefer a more dramatic launch proposition.",
          "spend": 9000,
          "delta": {
            "legal": -5,
            "ops": -3,
            "workforce": -2,
            "customer": 4
          },
          "trust": 3,
          "fallout": "The partner can see the practical first step, although it asks what would justify a second or third location.",
          "tag": "FOCUS"
        }
      ],
      "signals": [
        {
          "name": "TESTED PROPOSAL",
          "line": "We'll show which parts of this pilot are tested, funded and ready for review.",
          "delta": {
            "legal": -3,
            "customer": -2
          },
          "trust": 2
        },
        {
          "name": "EXPLORE THREE SITES",
          "line": "We're developing the ambition for three locations, subject to evidence and approval.",
          "delta": {
            "legal": 4,
            "workforce": -5,
            "customer": -4
          },
          "trust": 5
        },
        {
          "name": "PROVE ONE SITE",
          "line": "Our first priority is one outstanding pilot; expansion will depend on verified results.",
          "delta": {
            "legal": -2,
            "ops": -2,
            "customer": 4
          },
          "trust": 3,
          "delay": {
            "due": 3,
            "cost": 8000,
            "label": "First-location demonstration review",
            "delta": {
              "customer": -2
            }
          }
        }
      ]
    },
    {
      "id": "people",
      "number": "02",
      "time": "10:06",
      "title": "THE PEOPLE BEHIND THE PLAN",
      "kicker": "The cleverest idea needs people who can deliver it.",
      "scene": "floor",
      "base": 11000,
      "brief": "The concept looks promising, but the operations board is crowded. A team responsible for existing clients is fully booked, educators suggest a simpler inclusive activity, and a qualified external crew offers short-term help. The proposal needs the right people, not just an enthusiastic presentation.",
      "headline": "GREAT IDEAS NEED GREAT TEAMS.",
      "question": "How will you bring people together without overloading them?",
      "pressure": "Every hour moved to Spark is an hour not spent on an existing commitment.",
      "evidence": [
        {
          "type": "CAPACITY BOARD",
          "time": "09:56",
          "title": "WHO IS AVAILABLE",
          "body": "The project team has limited design capacity this week. Current client programmes must still operate on schedule; one senior team is already fully committed.",
          "clue": "Additional assignments need either a revised schedule or reliable extra support."
        },
        {
          "type": "STAFF WORKSHOP",
          "time": "10:03",
          "title": "AN IDEA FROM THE FLOOR",
          "body": "Front-of-house and education colleagues propose a tactile, step-free interactive option that does not depend on an app or constant connectivity.",
          "clue": "Inclusive design may be a creative advantage, not merely a compliance cost."
        },
        {
          "type": "SUPPORT OFFER",
          "time": "10:04",
          "title": "THE OUTSIDE CREW",
          "body": "A trained temporary crew can support the prototype and venue preparation. Its quote covers setup but requires an agreed handover and follow-up fee.",
          "clue": "Extra capacity is useful only if the transition is funded and supervised."
        }
      ],
      "advice": [
        "Invite frontline accessibility insight early; an unsuitable concept costs far more to repair later.",
        "Assign named owners to existing service commitments before borrowing their staff for Spark.",
        "The partner will value evidence that real visitors helped shape the design.",
        "Temporary support is a real expense now and a handover liability later. Cap the contract.",
        "An offline-first alternative can make the experience easier to install and maintain.",
        "People are more engaged when they help shape the project, but their time still needs protecting."
      ],
      "plans": [
        {
          "name": "CO-DESIGN THE EXPERIENCE",
          "verb": "Let frontline ideas lead",
          "desc": "Reserve time for a focused workshop with educators, visitor teams and delivery staff.",
          "benefits": [
            "Improves ownership",
            "Surfaces accessibility ideas"
          ],
          "cost": "Managers must redirect part of their delivery time.",
          "spend": 16000,
          "delta": {
            "workforce": -17,
            "legal": -5,
            "ops": 5,
            "customer": -2
          },
          "trust": 4,
          "fallout": "Staff return with practical improvements to the visitor experience, including an accessible offline activity.",
          "tag": "COLLABORATE"
        },
        {
          "name": "SET THE OWNERS",
          "verb": "Give the team a clear plan",
          "desc": "Appoint responsible leads, agree what existing work must continue and set deliverable milestones.",
          "benefits": [
            "Keeps work moving",
            "Clarifies accountability"
          ],
          "cost": "A leadership-led timetable may overlook useful staff ideas.",
          "spend": 8000,
          "delta": {
            "ops": -9,
            "workforce": 14,
            "legal": 3,
            "customer": 3
          },
          "trust": -2,
          "fallout": "The schedule becomes clearer quickly. A few team members would still like a say in the visitor experience.",
          "tag": "CONTROL"
        },
        {
          "name": "BUY BREATHING ROOM",
          "verb": "Add specialist help",
          "desc": "Hire a qualified temporary crew to protect current programmes while Spark develops.",
          "benefits": [
            "Adds delivery capacity",
            "Reduces immediate pressure"
          ],
          "cost": "Onboarding and a later handover create extra commitments.",
          "spend": 29000,
          "delta": {
            "workforce": -21,
            "ops": -6,
            "legal": 4,
            "customer": -3
          },
          "trust": 3,
          "fallout": "The additional crew makes space for the prototype. Finance records the agreed transition fee.",
          "tag": "SUPPORT",
          "delay": {
            "due": 4,
            "cost": 10000,
            "label": "Qualified crew onboarding and handover",
            "delta": {
              "ops": 2
            }
          }
        }
      ],
      "signals": [
        {
          "name": "INVITE THE TEAM",
          "line": "The people delivering this experience will help shape its next version.",
          "delta": {
            "workforce": -6,
            "legal": -2
          },
          "trust": 2
        },
        {
          "name": "PUBLISH RESPONSIBILITIES",
          "line": "We've assigned accountable leads and protected current customer commitments.",
          "delta": {
            "ops": -4,
            "workforce": 5
          },
          "trust": 0
        },
        {
          "name": "PROTECT CAPACITY",
          "line": "We'll fund additional support while keeping existing services fully staffed.",
          "delta": {
            "workforce": -7,
            "legal": 5
          },
          "trust": 4,
          "delay": {
            "due": 4,
            "cost": 12000,
            "label": "Temporary workforce capacity cover",
            "delta": {
              "workforce": -2
            }
          }
        }
      ]
    },
    {
      "id": "partner",
      "number": "03",
      "time": "11:24",
      "title": "THE PARTNER DEAL",
      "kicker": "A deal that looks good today must still work at launch.",
      "scene": "client",
      "base": 14000,
      "brief": "Three supplier options could power Project Spark. One is proven but expensive, one promises faster delivery with conditions, and an in-house team can build a simpler demonstration. The partner wants a defensible recommendation by 14:00, including accessibility evidence, clear owners and a credible delivery schedule.",
      "headline": "THE BEST OFFER IS THE ONE YOU CAN DELIVER.",
      "question": "Which partnership can you defend after the launch?",
      "teamPrompt": "Have someone defend the fastest supplier and someone defend the safest. What evidence would change either mind?",
      "pressure": "Speed, independent proof and in-house control cannot all be maximised at once.",
      "evidence": [
        {
          "type": "SUPPLIER MATRIX",
          "time": "11:11",
          "title": "THREE ROUTES",
          "body": "Supplier A offers established delivery with a slower schedule. Supplier B can move faster if the company accepts milestone conditions. The in-house route is flexible but needs scarce specialist time.",
          "clue": "Compare total obligations and reliability, not only headline spend."
        },
        {
          "type": "ACCESSIBILITY CHECK",
          "time": "11:17",
          "title": "THE EARLY USER TEST",
          "body": "A prototype interaction works for most testers. Screen-reader support and step-free access still need formal verification before a public commitment.",
          "clue": "A successful demonstration is not a complete accessibility sign-off."
        },
        {
          "type": "CONTRACT NOTES",
          "time": "11:21",
          "title": "THE FINE PRINT",
          "body": "The proposed contract contains delivery milestones, privacy responsibilities and service conditions. The partner does not require an unconditional guarantee.",
          "clue": "A bounded, evidenced commitment is more valuable than an impossible warranty."
        }
      ],
      "advice": [
        "Define measurable accessibility and contractual milestones before accepting the fastest timetable.",
        "Independent verification consumes specialist time as well as money.",
        "The partner values a named owner and a credible prototype more than glossy promises.",
        "A low headline quote may hide future milestone costs and contingency spending.",
        "Require data minimisation and offline continuity before selecting technology.",
        "Protect staff workloads while using them to verify the proof-of-concept."
      ],
      "plans": [
        {
          "name": "CHOOSE PROVEN DELIVERY",
          "verb": "Pay for verified capability",
          "desc": "Commission an independent technical and accessibility review around a reliable supplier route.",
          "benefits": [
            "Builds evidence-based confidence",
            "Reduces contractual uncertainty"
          ],
          "cost": "Audit and supplier coordination take time and money.",
          "spend": 26000,
          "delta": {
            "legal": -10,
            "customer": -17,
            "ops": 5,
            "workforce": 3
          },
          "trust": 15,
          "fallout": "The partner receives independently reviewable milestones. Delivery teams now need to coordinate the proof.",
          "tag": "ASSURANCE"
        },
        {
          "name": "NEGOTIATE A FAST ROUTE",
          "verb": "Trade speed for clear conditions",
          "desc": "Agree a faster supplier timetable with named owners and contractual contingency checkpoints.",
          "benefits": [
            "Keeps momentum high",
            "Makes responsibilities explicit"
          ],
          "cost": "Unverified dependencies may turn into additional cost.",
          "spend": 12000,
          "delta": {
            "customer": -16,
            "legal": 10,
            "ops": 9,
            "workforce": 4
          },
          "trust": 13,
          "fallout": "The partner likes the pace, but the fast-track commitment creates a defined future exposure.",
          "tag": "SPEED",
          "delay": {
            "due": 5,
            "cost": 22000,
            "label": "Fast-route contractual milestone contingency",
            "delta": {
              "customer": 10,
              "legal": 6
            }
          }
        },
        {
          "name": "BUILD THE ESSENTIALS",
          "verb": "Show a working core",
          "desc": "Use internal specialists to prove the minimum inclusive experience before extending the scope.",
          "benefits": [
            "Demonstrates real delivery",
            "Retains technical control"
          ],
          "cost": "The team has less time for its other commitments.",
          "spend": 18000,
          "delta": {
            "ops": -16,
            "customer": -7,
            "workforce": 12,
            "legal": 4
          },
          "trust": 7,
          "fallout": "The early demonstration works. The delivery lead now needs a sustainable specialist schedule.",
          "tag": "PROTOTYPE"
        }
      ],
      "signals": [
        {
          "name": "VERIFIED MILESTONES",
          "line": "Here are the delivery checks, owners and dates we can substantiate.",
          "delta": {
            "customer": -5,
            "legal": -3
          },
          "trust": 4
        },
        {
          "name": "FAST TRACK WITH CHECKS",
          "line": "We're targeting an accelerated pilot with verification at every milestone.",
          "delta": {
            "customer": -6,
            "legal": 5,
            "ops": 4
          },
          "trust": 7,
          "delay": {
            "due": 5,
            "cost": 14000,
            "label": "Accelerated pilot milestone review",
            "delta": {
              "legal": 4
            }
          }
        },
        {
          "name": "PROOF BEFORE PROMISES",
          "line": "We'll confirm prototype performance before making a wider commitment.",
          "delta": {
            "legal": -5,
            "customer": 7
          },
          "trust": -3
        }
      ]
    },
    {
      "id": "spotlight",
      "number": "04",
      "time": "13:12",
      "title": "THE SPOTLIGHT",
      "kicker": "Big interest brings bigger expectations.",
      "scene": "press",
      "base": 12000,
      "brief": "At 13:12, the partner's marketing team shares a scheduled teaser of Project Spark. People immediately ask where they can visit, whether all three locations will open and if the experience will be accessible to everyone. The teaser depicts an unapproved concept, not a confirmed launch.",
      "headline": "THE IDEA HAS ATTENTION. NOW EARN THE TRUST.",
      "question": "How will you protect the excitement without promising a fantasy?",
      "teamPrompt": "Look back at your team's earlier promise. Does the public teaser make that promise harder to keep?",
      "pressure": "The public is interested, but the site list and access checks are still conditional.",
      "evidence": [
        {
          "type": "PUBLIC TEASER",
          "time": "13:05",
          "title": "THE CONCEPT GOES LIVE",
          "body": "A creative teaser shows interactive pop-up spaces and asks people what they would like to explore. Several commenters assume all three locations have been approved.",
          "clue": "Audience enthusiasm is real; an illustration is not an opening announcement."
        },
        {
          "type": "APPROVAL REGISTER",
          "time": "13:09",
          "title": "WHAT IS CONFIRMED",
          "body": "Only the pilot concept and proposal review have been approved. Venue availability, accessibility sign-off and final dates remain conditional.",
          "clue": "Being shortlisted is not the same as receiving permission to open."
        },
        {
          "type": "COMMUNITY FEEDBACK",
          "time": "13:11",
          "title": "THREE QUESTIONS",
          "body": "A teacher asks about age suitability, a visitor asks about wheelchair access, and a local partner offers to help test the offline activities.",
          "clue": "The questions can improve the project if the team listens."
        }
      ],
      "advice": [
        "Correct confusion about confirmed sites without dampening genuine interest.",
        "Make public communication consistent with the actual delivery plan.",
        "The partner wants confidence, not a promise the legal team cannot support.",
        "Engaging community groups is worthwhile if the time and staffing are funded.",
        "Share only verified prototype and access claims. Avoid claiming an untested feature works everywhere.",
        "Listen to teachers and visitors; co-design is also an opportunity for the staff team."
      ],
      "plans": [
        {
          "name": "SHOW WHAT'S VERIFIED",
          "verb": "Be clear and optimistic",
          "desc": "Publish approved facts, correct location assumptions and identify the next checkable milestone.",
          "benefits": [
            "Protects public trust",
            "Prevents a misleading launch claim"
          ],
          "cost": "Verification and careful review may reduce momentum briefly.",
          "spend": 15000,
          "delta": {
            "legal": 2,
            "customer": -12,
            "workforce": -9,
            "ops": 2
          },
          "trust": 10,
          "fallout": "The teaser stays exciting, but now readers can distinguish what is real from what is still being designed.",
          "tag": "CLARITY"
        },
        {
          "name": "HOLD THE DETAIL",
          "verb": "Confirm before announcing",
          "desc": "Thank people for their interest and set a clear window for a detailed update.",
          "benefits": [
            "Avoids unsupported claims",
            "Protects room for technical checks"
          ],
          "cost": "Leaving details unanswered allows some speculation.",
          "spend": 9000,
          "delta": {
            "legal": -5,
            "customer": 8,
            "workforce": 6,
            "ops": 0
          },
          "trust": -3,
          "fallout": "The team avoids overpromising. The audience needs a specific and useful next update.",
          "tag": "PATIENCE"
        },
        {
          "name": "INVITE PEOPLE IN",
          "verb": "Turn interest into co-design",
          "desc": "Fund a short, moderated consultation with educators, local partners and accessibility testers.",
          "benefits": [
            "Improves inclusion",
            "Builds a more useful design"
          ],
          "cost": "The extra consultation takes time and budget.",
          "spend": 19000,
          "delta": {
            "legal": -7,
            "customer": 5,
            "workforce": -8,
            "ops": 4
          },
          "trust": 4,
          "fallout": "Visitors offer valuable refinements. The team must now decide which ideas are realistic for the pilot.",
          "tag": "CO-DESIGN"
        }
      ],
      "signals": [
        {
          "name": "CONFIRMED FACTS",
          "line": "The project is shortlisted, with locations and dates still subject to approval.",
          "delta": {
            "legal": -4,
            "workforce": -5,
            "customer": -3
          },
          "trust": 4
        },
        {
          "name": "OPEN INVITATION",
          "line": "Tell us what would make these spaces useful, fun and accessible for you.",
          "delta": {
            "workforce": -4,
            "customer": -4,
            "legal": 3
          },
          "trust": 3
        },
        {
          "name": "CHECK THE VENUES",
          "line": "We'll announce opening dates after the venue and access checks are complete.",
          "delta": {
            "legal": -2,
            "workforce": -8,
            "customer": 7
          },
          "trust": 1
        }
      ]
    },
    {
      "id": "reality",
      "number": "05",
      "time": "15:40",
      "title": "THE REALITY CHECK",
      "kicker": "The prototype is exciting. The conditions are not perfect.",
      "scene": "warehouse",
      "base": 17000,
      "brief": "At 15:40, the venue dry run exposes an intermittent connection problem. The demonstration is not a public launch. A qualified backup supplier is available, while the internal team has a robust offline alternative. The client needs a credible plan for the evening board decision.",
      "headline": "A GREAT PLAN SHOULD ALSO SURVIVE REALITY.",
      "question": "What will you protect when the demo meets a practical limit?",
      "teamPrompt": "Choose one feature you would protect at all costs — and one you would willingly delay. Can everyone agree?",
      "pressure": "The connectivity fault is repeatable. There is no time to pretend it has vanished.",
      "evidence": [
        {
          "type": "DEMO RUN LOG",
          "time": "15:16",
          "title": "THE INTERRUPTED TEST",
          "body": "The interactive experience works when the venue connection is stable. In a repeatable test the network drops, and several screens stop updating.",
          "clue": "A polished demo cannot replace an offline or supported continuity plan."
        },
        {
          "type": "BACKUP QUOTE",
          "time": "15:27",
          "title": "THE SUPPORT ROUTE",
          "body": "A vetted supplier can provide supervised fallback support. Activation has a realistic lead time and a funded transition and close-out cost.",
          "clue": "Backup capacity reduces risk, but cannot be switched on without planning."
        },
        {
          "type": "ACCESSIBILITY & STAFF CHECK",
          "time": "15:34",
          "title": "THE OPTION THAT WORKS",
          "body": "An offline-first version remains usable for more visitors and needs less network support. Existing staff have limited time to adapt the programme.",
          "clue": "Simpler design can improve resilience without pretending every feature is ready."
        }
      ],
      "advice": [
        "Document the fallback route and the actual access and venue checks.",
        "Protect the essential visitor experience instead of chasing an unsupported full launch.",
        "Tell the partner what passed and what failed in the prototype.",
        "Budget for suppliers and staff after today's demonstration; promises persist.",
        "Make offline operation part of the plan, not a hidden emergency shortcut.",
        "Do not solve a technical problem by giving the existing staff unlimited unpaid work."
      ],
      "plans": [
        {
          "name": "FUND THE BACKUP",
          "verb": "Protect the interactive plan",
          "desc": "Hire a vetted fallback supplier with supervised transition and close-out responsibilities.",
          "benefits": [
            "Adds delivery resilience",
            "Protects planned features"
          ],
          "cost": "This is the costliest response and creates a later supplier commitment.",
          "spend": 38000,
          "delta": {
            "ops": -15,
            "workforce": -5,
            "customer": -5,
            "legal": 2
          },
          "trust": 5,
          "fallout": "The supplier can support the core experience. The team must account for follow-up work after the review.",
          "tag": "RESILIENCE",
          "delay": {
            "due": 7,
            "cost": 9000,
            "label": "Backup supplier close-out and handover",
            "delta": {}
          }
        },
        {
          "name": "REDESIGN WITH WHAT WORKS",
          "verb": "Make offline-first the default",
          "desc": "Simplify the demonstration for unreliable venues and redeploy qualified staff to the most important features.",
          "benefits": [
            "Protects accessibility",
            "Reduces dependence on connectivity"
          ],
          "cost": "Several ambitious features are delayed and internal capacity is diverted.",
          "spend": 24000,
          "delta": {
            "ops": -14,
            "workforce": -4,
            "legal": 2,
            "customer": 6
          },
          "trust": 3,
          "fallout": "The offline version is robust. The client sees a narrower but more credible demonstration.",
          "tag": "SIMPLIFY",
          "delay": {
            "due": 6,
            "cost": 12000,
            "label": "Offline prototype rework and staff cover",
            "delta": {
              "ops": 6,
              "customer": 4
            }
          }
        },
        {
          "name": "RESET THE SCOPE",
          "verb": "Agree a smaller reliable pilot",
          "desc": "Ask the partner to review a one-location, accessible pilot with a priced expansion path.",
          "benefits": [
            "Protects cash and people",
            "Keeps commitments deliverable"
          ],
          "cost": "Ambition is reduced and the client may renegotiate the scope.",
          "spend": 11000,
          "delta": {
            "ops": 5,
            "workforce": -11,
            "customer": 12,
            "legal": -3
          },
          "trust": -6,
          "fallout": "The plan becomes simpler to deliver. The partner needs to agree the smaller scope before any launch promise is valid.",
          "tag": "FOCUS"
        }
      ],
      "signals": [
        {
          "name": "REPORT THE TEST",
          "line": "Here are the prototype features that passed and the changes still needed.",
          "delta": {
            "customer": -5,
            "legal": -2
          },
          "trust": 5
        },
        {
          "name": "BACKUP PLAN",
          "line": "We've defined a supported fallback for the critical experience and will verify each milestone.",
          "delta": {
            "customer": -8,
            "legal": 5,
            "ops": 3
          },
          "trust": 5,
          "delay": {
            "due": 6,
            "cost": 10000,
            "label": "Backup service assurance follow-up",
            "delta": {
              "customer": 9
            }
          }
        },
        {
          "name": "RECHECK THE MILESTONE",
          "line": "We'll confirm the next delivery target after the venue checks are complete.",
          "delta": {
            "ops": -2,
            "customer": 9
          },
          "trust": -4
        }
      ]
    },
    {
      "id": "final",
      "number": "06",
      "time": "17:30",
      "title": "THE FINAL CALL",
      "kicker": "Your team's plan is about to meet the board.",
      "scene": "board",
      "base": 9000,
      "brief": "At 17:30, the partner and company board review your Project Spark proposal. They have the prototype evidence, team-capacity plan, public communications, £260,000 reserve ledger and every remaining commitment. No pilot has been awarded yet. The board is deciding whether your plan is credible enough to pursue, not magically signing a contract.",
      "headline": "ONE LAST DECISION. WHAT WILL YOU MAKE REAL?",
      "question": "Which next step could your team defend six weeks from now?",
      "teamPrompt": "Before the final vote, name one promise you can definitely deliver and one assumption the board must still challenge.",
      "pressure": "The strongest ending must match the resources, people and promises you actually have.",
      "evidence": [
        {
          "type": "FINANCIAL SUMMARY",
          "time": "17:02",
          "title": "THE REAL COST",
          "body": "The 90-day reserve shows funded spending separately from remaining cash and contractual commitments that will fall due after today's meeting.",
          "clue": "Future liabilities still matter even when they have not been paid yet."
        },
        {
          "type": "PARTNER SCORECARD",
          "time": "17:18",
          "title": "THE READINESS REVIEW",
          "body": "The partner is comparing feasibility, inclusive access, honest public promises, named delivery owners and operational evidence. No award decision has been made.",
          "clue": "Readiness is not the same as a signed contract or guaranteed income."
        },
        {
          "type": "THE BOARD QUESTION",
          "time": "17:29",
          "title": "WHAT WILL YOU STOP?",
          "body": "The chair asks each team which features it would delay, which activities it would fund and which commitments it could deliver with confidence.",
          "clue": "A smaller, funded plan may be stronger than an impossible promise."
        }
      ],
      "advice": [
        "Use clear ownership and verifiable commitments; do not promise full approval without evidence.",
        "A sustainable pilot needs a resilient implementation and realistic staff capacity.",
        "Make the partner's confidence depend on proof, not an invented contract award.",
        "Pending commitments are liabilities, not imaginary free cash.",
        "Fund real accessibility and offline checks before announcing readiness.",
        "People need a workable schedule that does not depend on permanent last-minute overtime."
      ],
      "plans": [
        {
          "name": "PHASE IT, PROVE IT",
          "verb": "Fund a transparent first phase",
          "desc": "Approve accountable owners, independent checks and a phased rollout based on verified milestones.",
          "benefits": [
            "Creates lasting delivery confidence",
            "Supports an inclusive launch plan"
          ],
          "cost": "The programme investment reduces the remaining reserve.",
          "spend": 28000,
          "delta": {
            "legal": -13,
            "customer": -10,
            "workforce": -6,
            "ops": 3
          },
          "trust": 13,
          "fallout": "The board sees an accountable path forward. Every expansion step will require evidence and funding.",
          "tag": "GOVERNANCE"
        },
        {
          "name": "BACK THE BIGGER VISION",
          "verb": "Accelerate with conditions",
          "desc": "Offer a faster, more ambitious multi-location plan with explicit conditions and capacity milestones.",
          "benefits": [
            "Keeps partner enthusiasm high",
            "Could improve a future rollout"
          ],
          "cost": "More pressure and a funded follow-up commitment remain.",
          "spend": 18000,
          "delta": {
            "customer": -21,
            "ops": -9,
            "workforce": 10,
            "legal": 5
          },
          "trust": 12,
          "fallout": "The board sees strong ambition, but follow-up resources must be secured before expansion can be authorised.",
          "tag": "AMBITION",
          "delay": {
            "due": 7,
            "cost": 18000,
            "label": "Accelerated multi-site milestone programme",
            "delta": {}
          }
        },
        {
          "name": "DO ONE THING BRILLIANTLY",
          "verb": "Earn expansion through proof",
          "desc": "Propose one excellent, accessible site with measured outcomes and a staged expansion discussion.",
          "benefits": [
            "Preserves delivery capacity",
            "Keeps the plan funded"
          ],
          "cost": "The partner may reduce immediate scope or ask for a new approval.",
          "spend": 7000,
          "delta": {
            "ops": -11,
            "workforce": -7,
            "customer": 10,
            "legal": -3
          },
          "trust": 4,
          "fallout": "The plan protects money and focuses resources on a demonstrable success. Further locations remain conditional.",
          "tag": "DISCIPLINE"
        }
      ],
      "signals": [
        {
          "name": "OWN THE TRADE-OFFS",
          "line": "Here is what we will fund, what we will delay and how progress will be measured.",
          "delta": {
            "legal": -5,
            "customer": -6,
            "workforce": -3
          },
          "trust": 6
        },
        {
          "name": "ACCELERATE RESPONSIBLY",
          "line": "We will pursue the next sites only as verified milestones and funding permit.",
          "delta": {
            "customer": -7,
            "legal": 7,
            "workforce": 8
          },
          "trust": 8,
          "delay": {
            "due": 7,
            "cost": 16000,
            "label": "Accelerated programme verification",
            "delta": {}
          }
        },
        {
          "name": "SHOW THE FIRST RESULT",
          "line": "We'll publish a verified first-site handover before proposing wider expansion.",
          "delta": {
            "legal": -2,
            "customer": 3,
            "workforce": 2,
            "ops": -8
          },
          "trust": 2
        }
      ]
    }
  ],
  "initialCash": 260000,
  "annualContractValue": 240000,
  "baseline": {
    "legal": 47,
    "ops": 38,
    "workforce": 44,
    "customer": 51,
    "liquidity": 25
  },
  "variants": [
    {
      "title": "First site has limited access hours",
      "effect": {
        "legal": 4,
        "ops": 2
      },
      "note": "The preferred venue has strict opening-hour limits and requires a separate access check."
    },
    {
      "title": "A supplier needs early confirmation",
      "effect": {
        "legal": 6,
        "customer": 3
      },
      "note": "One attractive quote expires before the funding committee meets."
    },
    {
      "title": "Audience demand exceeds the pilot brief",
      "effect": {
        "customer": 5,
        "workforce": 2
      },
      "note": "Community organisations are already asking whether additional venues will be included."
    }
  ]
};
g.BCContent=data;
})(globalThis);
