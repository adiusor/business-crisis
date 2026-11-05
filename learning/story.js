(function(g){
'use strict';
// Original fictional educational scenario; deliberately independent from the existing 09:17 story.
const scene={
  "id": "opening-night",
  "title": "Opening Night",
  "subtitle": "Six scenes. One launch. A thousand unexpected possibilities.",
  "studio": "FIELDWORK HOUSE",
  "sponsor": "£120,000 annual potential (not cash)",
  "advisers": [
    {
      "name": "MAYA CHEN",
      "role": "PEOPLE & CULTURE",
      "color": "#adcbbd",
      "line": "When everyone agrees too fast, ask who hasn't spoken."
    },
    {
      "name": "ELI TURNER",
      "role": "OPERATIONS LEAD",
      "color": "#bbc5ba",
      "line": "A full room still needs a safe plan."
    },
    {
      "name": "ZARA KHAN",
      "role": "MARKETING LEAD",
      "color": "#e5b899",
      "line": "A viral promise is still a promise."
    },
    {
      "name": "LEO PARK",
      "role": "FINANCE LEAD",
      "color": "#cfc7b5",
      "line": "Tomorrow's income cannot pay today's bill."
    },
    {
      "name": "NINA FLORES",
      "role": "PARTNERSHIPS LEAD",
      "color": "#b6b9d9",
      "line": "Know your alternative before you say yes."
    },
    {
      "name": "ARUN SHAH",
      "role": "CUSTOMER EXPERIENCE",
      "color": "#e2c8ae",
      "line": "A guest can forgive a mistake they understand."
    }
  ],
  "episodes": [
    {
      "id": "invitation",
      "number": "01",
      "time": "09:00",
      "title": "THE INVITATION",
      "kicker": "A promising launch; one ambiguous invitation",
      "scene": "invitation",
      "base": 7000,
      "brief": "FIELDWORK HOUSE opens tonight: a creative venue with workshops, a café and pop-up events. The sign-up page promised 'open to everyone' without specifying that the evening has only 320 safe places. A short social clip attracts 1,100 registrations. The team has £210,000 of event response cash, including required operating cover.",
      "headline": "THE INTERNET INVITED ITSELF.",
      "question": "What should your team do with 1,100 registrations and 320 places?",
      "pressure": "An honest invitation can still disappoint people.",
      "evidence": [
        {
          "type": "EVENT REGISTRATION",
          "time": "08:55",
          "title": "1,100 NAMES",
          "body": "The registration page allowed 1,100 people to register without automatically confirming their entry. Its footer says 'confirmation subject to capacity'.",
          "clue": "Registrations are not confirmed admissions."
        },
        {
          "type": "SAFETY NOTE",
          "time": "08:58",
          "title": "320 VERIFIED PLACES",
          "body": "Operations certifies 320 safe attendee places including staff and contractors. A second timed session would require a separate fire and staffing review.",
          "clue": "The current hard capacity is 320, not a negotiation tactic."
        },
        {
          "type": "DESIGN DRAFT",
          "time": "08:43",
          "title": "THE MISSING LINE",
          "body": "An earlier draft read 'open to everyone online; limited places in person'. The final post lost the second half during design revision.",
          "clue": "The error is a missing qualifier, not evidence of malicious intent."
        }
      ],
      "advice": [
        "Confirm what the team knows, and invite the quieter perspective before choosing.",
        "Verify the live capacity; an event's size cannot increase because a spreadsheet says so.",
        "Correct what the invitation actually promises instead of blaming customers for reading it.",
        "£210k is available event response cash. The £120k annual sponsorship is future commercial value, not immediate cash.",
        "Sponsor commitments depend on verified capacity and accessible conditions.",
        "Acknowledge the invite confusion without insulting the people who signed up."
      ],
      "plans": [
        {
          "name": "CAP THE GUEST LIST",
          "verb": "Publish a fair allocation",
          "desc": "Pause confirmations, clarify the cap, and offer livestream access to everyone else.",
          "benefits": [
            "Credible admissions",
            "More accessible audience"
          ],
          "cost": "Some disappointed registrants; production costs.",
          "spend": 12000,
          "delta": {
            "legal": -8,
            "ops": 2,
            "workforce": 0,
            "customer": -10
          },
          "trust": 10,
          "fallout": "A plain explanation lands. Most people accept the cap, but a vocal few demand a bigger venue."
        },
        {
          "name": "ADD A SECOND SESSION",
          "verb": "Grow carefully",
          "desc": "Plan a second attendance slot with conditional verification and separate staff coverage.",
          "benefits": [
            "More invitations honoured",
            "New revenue opportunity"
          ],
          "cost": "Capacity must be reassessed; staff costs rise.",
          "spend": 26000,
          "delta": {
            "legal": 3,
            "ops": 9,
            "workforce": 8,
            "customer": -11
          },
          "trust": 12,
          "fallout": "The extra slot gets applause online. Operations warns that the second event remains contingent on clearance."
        },
        {
          "name": "KEEP THE HYPE",
          "verb": "Trust the queue",
          "desc": "Leave the open-invite copy running and turn registration volume into publicity.",
          "benefits": [
            "Demand remains strong",
            "Low upfront costs"
          ],
          "cost": "Risk of misleading visitors and unsafe crowding.",
          "spend": 7000,
          "delta": {
            "legal": 18,
            "ops": 21,
            "workforce": 5,
            "customer": 19
          },
          "trust": -8,
          "fallout": "Registrations keep rising. Security asks for a real attendance decision before opening."
        }
      ],
      "signals": [
        {
          "name": "CLARIFY NOW",
          "line": "'Registration isn't admission; capacity is 320, and online access is free.'",
          "delta": {
            "legal": -5,
            "ops": -2,
            "workforce": -1,
            "customer": -6
          },
          "trust": 7
        },
        {
          "name": "HUMAN NOTE",
          "line": "'We underestimated your enthusiasm. Here's how the allocation works.'",
          "delta": {
            "legal": -2,
            "ops": 0,
            "workforce": -3,
            "customer": -4
          },
          "trust": 5
        },
        {
          "name": "STAY VAGUE",
          "line": "'It's going to be huge. Watch this space.'",
          "delta": {
            "legal": 6,
            "ops": 3,
            "workforce": 0,
            "customer": 9
          },
          "trust": -4
        }
      ],
      "learning": {
        "pearsonLO": "LO3",
        "topic": "Distinguish team consensus, evidence and customer-facing clarity.",
        "facilitatorPrompt": "Did your team check the original evidence or argue from assumptions?"
      }
    },
    {
      "id": "people",
      "number": "02",
      "time": "10:20",
      "title": "THE PEOPLE",
      "kicker": "A team divided by invisible work",
      "scene": "people",
      "base": 11000,
      "brief": "Two hours after the sign-up correction, the staff group chat erupts: the production crew wants extra support, volunteers want actual breaks, and the brand team insists the show must go on. A junior employee, Sam, has proposed a rotating assignment board—but nobody has asked them to explain it.",
      "headline": "WHO GETS HEARD?",
      "question": "How do you motivate a team without making the quiet people carry the work?",
      "pressure": "The shift must still be staffed tonight.",
      "evidence": [
        {
          "type": "ROTA",
          "time": "10:07",
          "title": "SEVEN DOUBLE SHIFTS",
          "body": "Seven experienced staff have been assigned overlapping set-up and guest-facing duties. The original rota has no reliable breaks.",
          "clue": "Workload is not equally distributed."
        },
        {
          "type": "TEAM CHAT",
          "time": "10:13",
          "title": "SAM'S UNREAD IDEA",
          "body": "Sam offers a self-selected roles board and a ten-minute briefing. The message is buried beneath manager announcements.",
          "clue": "A useful perspective has not been evaluated."
        },
        {
          "type": "PEOPLE NOTE",
          "time": "10:18",
          "title": "WHAT THE TEAM REQUESTED",
          "body": "Staff cite autonomy, predictable breaks and clarity—not simply a bonus—as priorities.",
          "clue": "Different motives require different responses."
        }
      ],
      "advice": [
        "Don't mistake silence for agreement. Let staff identify practical constraints.",
        "A rotation and cross-training plan must leave the opening team staffed.",
        "Publicly recognising teams can help, but do not substitute praise for workload relief.",
        "A guaranteed extra shift creates cash costs now and potentially later.",
        "Plan how contractor and volunteer roles will interact.",
        "People want to be consulted about a schedule affecting their evening."
      ],
      "plans": [
        {
          "name": "CO-DESIGN THE ROTA",
          "verb": "Give teams a voice",
          "desc": "Invite Sam to demonstrate a rotation board; teams agree bounded roles and protected breaks.",
          "benefits": [
            "Autonomy and voice",
            "Better rota clarity"
          ],
          "cost": "Brief setup pause and supervisory time.",
          "spend": 15000,
          "delta": {
            "legal": -4,
            "ops": 4,
            "workforce": -16,
            "customer": -4
          },
          "trust": 9,
          "fallout": "Sam's idea turns a tense meeting into a collaborative rota. Teams own assignments, but the new handovers take practice."
        },
        {
          "name": "PAY THE EXTRA HOURS",
          "verb": "Buy coverage",
          "desc": "Offer capped overtime and short-term recognition bonuses for the busiest groups.",
          "benefits": [
            "Quick coverage",
            "Visible reward"
          ],
          "cost": "Costly, and not everyone values the same incentive.",
          "spend": 27000,
          "delta": {
            "legal": 1,
            "ops": -6,
            "workforce": -8,
            "customer": -1
          },
          "trust": 3,
          "fallout": "Coverage improves. A few teammates appreciate the money; others ask why the plan still expects them to skip breaks.",
          "delay": {
            "due": 4,
            "cost": 9000,
            "label": "Additional paid recovery shifts",
            "delta": {
              "workforce": 5
            }
          }
        },
        {
          "name": "DIRECT THE FLOOR",
          "verb": "Choose speed",
          "desc": "Let managers assign roles and avoid another meeting before doors open.",
          "benefits": [
            "Fast coordination",
            "Lower immediate cost"
          ],
          "cost": "Quiet concerns stay unheard and fatigue grows.",
          "spend": 8000,
          "delta": {
            "legal": 0,
            "ops": -6,
            "workforce": 14,
            "customer": 2
          },
          "trust": -4,
          "fallout": "The schedule prints on time. By midday, the people holding the event together are quietly considering leaving early."
        }
      ],
      "signals": [
        {
          "name": "ASK BEFORE ASSIGNING",
          "line": "'Tell us the constraint we have missed; then we'll publish the rota.'",
          "delta": {
            "legal": -2,
            "ops": 1,
            "workforce": -6,
            "customer": -2
          },
          "trust": 5
        },
        {
          "name": "PROMISE BONUSES",
          "line": "'Everyone who stays late will get an extra payment.'",
          "delta": {
            "legal": 0,
            "ops": -1,
            "workforce": -5,
            "customer": 1
          },
          "trust": 3,
          "delay": {
            "due": 5,
            "cost": 11000,
            "label": "Unbudgeted overtime promise",
            "delta": {
              "liquidity": 5
            }
          }
        },
        {
          "name": "SHUT DOWN THE THREAD",
          "line": "'Please stop arguing publicly. Managers have this covered.'",
          "delta": {
            "legal": 2,
            "ops": 0,
            "workforce": 10,
            "customer": 5
          },
          "trust": -7
        }
      ],
      "learning": {
        "pearsonLO": "LO1 / LO2 / LO3",
        "topic": "Apply a content and a process motivation theory to different employees.",
        "facilitatorPrompt": "Which decision offered autonomy or fairness? Which simply offered more money?"
      }
    },
    {
      "id": "supplier",
      "number": "03",
      "time": "12:05",
      "title": "THE SUPPLIER",
      "kicker": "A fair deal is not always the cheapest",
      "scene": "supplier",
      "base": 13000,
      "brief": "A key refreshment supplier confirms it can deliver only 180 of the 320 planned guest packs. It offers priority delivery if you accept an expensive rush fee. A local collective can supply the difference, but only if you simplify the menu. A sponsor representative is watching.",
      "headline": "SOMEONE HAS TO NEGOTIATE.",
      "question": "What is your best alternative if the supplier refuses to improve its offer?",
      "pressure": "A supplier promise is not stock in the storeroom.",
      "evidence": [
        {
          "type": "SUPPLIER OFFER",
          "time": "11:48",
          "title": "180 PACKS",
          "body": "The incumbent can guarantee 180 packs at the original price, or 320 at a high rush fee contingent on another delivery slot.",
          "clue": "The full offer is conditional, not firm."
        },
        {
          "type": "LOCAL COLLECTIVE",
          "time": "11:56",
          "title": "140 SIMPLE PACKS",
          "body": "A neighbourhood food collective has verified supplies for 140 alternative packs at £18 each. It cannot match all customisation.",
          "clue": "The fallback is real, but requires honest communication."
        },
        {
          "type": "CONTRACT TERM",
          "time": "12:02",
          "title": "NO EXCLUSIVITY",
          "body": "The existing contract has no clause preventing a second supplier. An approved swap needs allergen and service checks.",
          "clue": "You can negotiate without accepting a monopoly."
        }
      ],
      "advice": [
        "Create options with the vendor; a negotiation is not simply a price cut.",
        "Temporary delivery slots and pickup windows matter more than the headline discount.",
        "Don't promise unlimited samples when the order is capped.",
        "The emergency alternative is more expensive but sets a walk-away point.",
        "The supplier has another booking; investigate both parties' alternatives.",
        "Keep customer information consistent with what will actually be delivered."
      ],
      "plans": [
        {
          "name": "NEGOTIATE TWO SOURCES",
          "verb": "Use your BATNA",
          "desc": "Keep 180 guaranteed packs and contract 140 simpler local packs with clear ingredient controls.",
          "benefits": [
            "Reliable alternative",
            "Local collaboration"
          ],
          "cost": "Two-supplier coordination and revised guest information.",
          "spend": 22000,
          "delta": {
            "legal": -3,
            "ops": -10,
            "workforce": -3,
            "customer": -7
          },
          "trust": 8,
          "fallout": "The simpler menu becomes a talking point, and most guests like the community angle. Two supplier teams need careful coordination."
        },
        {
          "name": "PAY FOR PRIORITY",
          "verb": "Buy speed",
          "desc": "Accept the rush offer for 320 packs, including a firm delivery checkpoint and penalty.",
          "benefits": [
            "Single operating channel",
            "Consistent experience"
          ],
          "cost": "Higher immediate spend and one-vendor dependency.",
          "spend": 36000,
          "delta": {
            "legal": 3,
            "ops": -9,
            "workforce": 2,
            "customer": -4
          },
          "trust": 5,
          "fallout": "The supplier rearranges deliveries. Your plan works if the promised truck arrives, but it is the expensive road."
        },
        {
          "name": "HOLD THE ORIGINAL ORDER",
          "verb": "Wait for more",
          "desc": "Use the 180 packs and offer a later redeemable benefit to the rest.",
          "benefits": [
            "Preserves cash",
            "Avoids uncertain logistics"
          ],
          "cost": "Guest dissatisfaction and service recovery obligations.",
          "spend": 9000,
          "delta": {
            "legal": 2,
            "ops": 10,
            "workforce": 0,
            "customer": 18
          },
          "trust": -9,
          "fallout": "Half the room gets the original pack. The other half remembers the apology rather than the experience.",
          "delay": {
            "due": 5,
            "cost": 12000,
            "label": "Guest recovery vouchers",
            "delta": {
              "customer": 5
            }
          }
        }
      ],
      "signals": [
        {
          "name": "STATE THE ALTERNATIVE",
          "line": "'We have a verified second source if we cannot agree workable terms.'",
          "delta": {
            "legal": -2,
            "ops": -2,
            "workforce": 0,
            "customer": -3
          },
          "trust": 4
        },
        {
          "name": "GUARANTEE EVERYTHING",
          "line": "'Every guest will get the exact original pack.'",
          "delta": {
            "legal": 8,
            "ops": 7,
            "workforce": 0,
            "customer": -3
          },
          "trust": 6,
          "delay": {
            "due": 6,
            "cost": 13000,
            "label": "Unverified pack guarantee",
            "delta": {
              "legal": 7
            }
          }
        },
        {
          "name": "SAY NOTHING",
          "line": "'We'll sort food on site.'",
          "delta": {
            "legal": 2,
            "ops": 1,
            "workforce": 0,
            "customer": 8
          },
          "trust": -5
        }
      ],
      "learning": {
        "pearsonLO": "LO3 / linked Unit 36 and Unit 37",
        "topic": "Explain BATNA, trade-offs and a fallback before negotiation.",
        "facilitatorPrompt": "What was the actual walk-away alternative, and what did it cost?"
      }
    },
    {
      "id": "culture",
      "number": "04",
      "time": "14:10",
      "title": "THE CULTURE",
      "kicker": "Power, politics and a missing voice",
      "scene": "culture",
      "base": 9000,
      "brief": "A sponsor asks to approve every public message. Meanwhile a staff meme makes the rounds: 'Our official policy is to check with six people before opening a door.' Sam's earlier idea has helped the rota, but the leadership team still treats junior comments as 'noise'.",
      "headline": "WHO GETS TO DECIDE?",
      "question": "How much control should one sponsor have over your organisation's voice?",
      "pressure": "The culture you practise today will be visible to guests tonight.",
      "evidence": [
        {
          "type": "SPONSOR NOTE",
          "time": "13:40",
          "title": "THE APPROVAL REQUEST",
          "body": "The sponsor asks to sign off all public messaging but the current agreement permits approval only when its name or logo is used.",
          "clue": "Their influence is real, but limited by written terms."
        },
        {
          "type": "STAFF PULSE",
          "time": "13:58",
          "title": "SILENT MEETINGS",
          "body": "Nine of 20 surveyed staff say they would not challenge a manager in front of colleagues.",
          "clue": "Absence of dissent does not prove trust."
        },
        {
          "type": "SOCIAL MEME",
          "time": "14:02",
          "title": "THE SIX SIGNATURES",
          "body": "Staff parody the slow approval chain. The clip is funny and mostly internal; it highlights a genuine delay.",
          "clue": "The joke contains operational information."
        }
      ],
      "advice": [
        "Be alert to who gets to define the story: senior staff aren't the only credible source.",
        "Maintain a clear decision owner, without blocking genuine feedback.",
        "A calm transparent response can improve trust more than a clever defensive slogan.",
        "A media push with uncertain facts may create liabilities.",
        "The sponsor asks for evidence; decide who has authority to give it.",
        "Ask staff to share concerns safely; don't treat criticism as disloyalty."
      ],
      "plans": [
        {
          "name": "SET CLEAR BOUNDARIES",
          "verb": "Separate rights from control",
          "desc": "Publish an approval matrix: sponsor brand approval, team leads own operations, staff can raise safety issues freely.",
          "benefits": [
            "Faster decisions",
            "Role clarity"
          ],
          "cost": "Requires a direct but respectful sponsor discussion.",
          "spend": 14000,
          "delta": {
            "legal": -9,
            "ops": -7,
            "workforce": -12,
            "customer": -6
          },
          "trust": 9,
          "fallout": "The sponsor accepts a limited approval role, and staff finally know which decisions they can own."
        },
        {
          "name": "PUT THE SPONSOR FIRST",
          "verb": "Centralise the story",
          "desc": "Give the sponsor temporary sign-off over all guest communication.",
          "benefits": [
            "One channel",
            "Avoids immediate confrontation"
          ],
          "cost": "Slow decisions and employee voice suppressed.",
          "spend": 10000,
          "delta": {
            "legal": 3,
            "ops": 8,
            "workforce": 15,
            "customer": 2
          },
          "trust": -3,
          "fallout": "Every message reaches a queue. The sponsor is pleased, but the staff meme becomes a very accurate process diagram."
        },
        {
          "name": "TURN THE MEME INTO A CAMPAIGN",
          "verb": "Laugh and listen",
          "desc": "Run a humorous public campaign about transparent decision-making, but leave authority rules unresolved.",
          "benefits": [
            "Energy and brand attention",
            "Engages staff creativity"
          ],
          "cost": "Risk of confusing guests and dodging structural problems.",
          "spend": 12000,
          "delta": {
            "legal": 6,
            "ops": 3,
            "workforce": -3,
            "customer": 4
          },
          "trust": 1,
          "fallout": "The public loves the joke. At the next decision, nobody is sure who is allowed to approve the caption."
        }
      ],
      "signals": [
        {
          "name": "SPEAK PLAINLY",
          "line": "'Here's who owns decisions, and how anyone can flag a concern.'",
          "delta": {
            "legal": -4,
            "ops": -2,
            "workforce": -5,
            "customer": -3
          },
          "trust": 6
        },
        {
          "name": "BLAME THE TEAM",
          "line": "'Our staff made this more complicated than it needed to be.'",
          "delta": {
            "legal": 4,
            "ops": 0,
            "workforce": 12,
            "customer": 10
          },
          "trust": -9
        },
        {
          "name": "RELEASE A SLOGAN",
          "line": "'The future is seamless.'",
          "delta": {
            "legal": 1,
            "ops": 1,
            "workforce": 2,
            "customer": 5
          },
          "trust": -2
        }
      ],
      "learning": {
        "pearsonLO": "LO4",
        "topic": "Identify formal authority, informal influence and psychological safety.",
        "facilitatorPrompt": "What did the sponsor have a legitimate right to approve? Who was excluded?"
      }
    },
    {
      "id": "partner",
      "number": "05",
      "time": "16:05",
      "title": "THE PARTNER",
      "kicker": "The offer everyone wants to sign",
      "scene": "partner",
      "base": 15000,
      "brief": "A high-profile partner offers £120,000 in future annual sponsorship value—but wants the entire next year's programme exclusively branded and 80 VIP places tonight. Your fallback is a smaller, non-exclusive local package worth £45,000 annually. Neither agreement pays cash today.",
      "headline": "A GOOD DEAL FOR WHOM?",
      "question": "Would you trade independence for a headline sponsorship?",
      "pressure": "Future value isn't spendable tonight.",
      "evidence": [
        {
          "type": "PARTNER LETTER",
          "time": "15:49",
          "title": "£120K ANNUALLY",
          "body": "The major partner's headline value is contingent on annual exclusivity and 80 reserved event places.",
          "clue": "A future contract is neither cash now nor a guarantee."
        },
        {
          "type": "LOCAL FALLBACK",
          "time": "15:57",
          "title": "£45K NON-EXCLUSIVE",
          "body": "A coalition of local businesses offers a lower-value package with no exclusivity; acceptance expires tomorrow.",
          "clue": "You have a credible BATNA."
        },
        {
          "type": "GUEST ALLOCATION",
          "time": "16:02",
          "title": "THE 80 VIP PLACES",
          "body": "Your verified total capacity remains 320. VIP access would replace some community seats, not create extra space.",
          "clue": "A partner can buy access, not raise the safety limit."
        }
      ],
      "advice": [
        "Set a clear decision process before partners bargain over visibility.",
        "Assess whether the partner's logistics can be supported safely.",
        "The exclusivity clause may harm your brand's independent appeal.",
        "Compare the contract's expected net value with your already available alternative.",
        "Your fallback is a modest local sponsor, not zero. Define your BATNA.",
        "Exclusive VIP space can create resentment among early registrants."
      ],
      "plans": [
        {
          "name": "BUILD A BOUNDED PARTNERSHIP",
          "verb": "Negotiate terms",
          "desc": "Offer six-month sponsor priority with a measurable review and a maximum of 20 VIP seats.",
          "benefits": [
            "Protects audience fairness",
            "Tests the relationship"
          ],
          "cost": "May lose the highest headline deal.",
          "spend": 19000,
          "delta": {
            "legal": -9,
            "ops": -3,
            "workforce": -6,
            "customer": -9
          },
          "trust": 9,
          "fallout": "The sponsor pushes back, then agrees to discuss a narrower package. The community seats remain the centre of the opening."
        },
        {
          "name": "SIGN EXCLUSIVITY",
          "verb": "Take the headline",
          "desc": "Accept the £120k annual exclusive package and reserve the full 80 VIP seats.",
          "benefits": [
            "Clear long-term prospect",
            "Stronger sponsor attention"
          ],
          "cost": "Damages community access; creates future obligations.",
          "spend": 9000,
          "delta": {
            "legal": 9,
            "ops": 7,
            "workforce": 8,
            "customer": 18
          },
          "trust": 2,
          "fallout": "The sponsor signs the headline exclusivity proposal, but local members object as 80 VIP places displace community invitations. The team must now fund the obligations it accepted.",
          "delay": {
            "due": 7,
            "cost": 24000,
            "label": "Exclusivity programme and VIP delivery commitments",
            "delta": {
              "customer": 10
            }
          }
        },
        {
          "name": "BACK THE LOCAL COALITION",
          "verb": "Choose independence",
          "desc": "Accept the £45k annual fallback and retain open supplier and community relationships.",
          "benefits": [
            "Community continuity",
            "Lower future dependency"
          ],
          "cost": "Less sponsorship upside and new admin work.",
          "spend": 15000,
          "delta": {
            "legal": -4,
            "ops": -3,
            "workforce": -7,
            "customer": -6
          },
          "trust": 7,
          "fallout": "The local partners cheer. Your board now has to explain why the smaller contract might be more resilient."
        }
      ],
      "signals": [
        {
          "name": "OWN THE TRADE-OFF",
          "line": "'Any partnership must honour confirmed guest access and our programme.'",
          "delta": {
            "legal": -3,
            "ops": 0,
            "workforce": -1,
            "customer": -5
          },
          "trust": 5
        },
        {
          "name": "ANNOUNCE THE FULL DEAL",
          "line": "'A major partner is fully committed for next year.'",
          "delta": {
            "legal": 9,
            "ops": 0,
            "workforce": 0,
            "customer": -6
          },
          "trust": 6,
          "delay": {
            "due": 7,
            "cost": 10000,
            "label": "Premature sponsorship announcement remediation",
            "delta": {
              "legal": 6
            }
          }
        },
        {
          "name": "AVOID THE QUESTION",
          "line": "'We have no partnership comment today.'",
          "delta": {
            "legal": -1,
            "ops": 0,
            "workforce": 0,
            "customer": 4
          },
          "trust": -3
        }
      ],
      "learning": {
        "pearsonLO": "LO3 / linked Unit 37",
        "topic": "Compare negotiated value, control rights and BATNA; protect trust.",
        "facilitatorPrompt": "What would you walk away from? Does the largest number mean the best agreement?"
      }
    },
    {
      "id": "opening",
      "number": "06",
      "time": "18:00",
      "title": "OPENING NIGHT",
      "kicker": "The lights come on",
      "scene": "opening",
      "base": 10000,
      "brief": "The doors open. After a day of ambitious plans, trade-offs and team conversations, the most important detail is simple: the capacity sign says 320, and someone has finally made a usable plan. The team discovers that the original 'open to everyone' line was a scheduled draft published without the final qualifier. No villain—just a system and a missed handover.",
      "headline": "MAKE IT AN EVENING WORTH REMEMBERING.",
      "question": "What will your leadership team protect after the applause?",
      "pressure": "Celebrate the people who made the event real—not just the headline number.",
      "evidence": [
        {
          "type": "SCHEDULER RECORD",
          "time": "17:28",
          "title": "THE CAUSE",
          "body": "The scheduling system published a draft caption from the wrong approval queue. The removed qualifier is visible in its revision history.",
          "clue": "The origin is established. Blaming an individual would miss the process failure."
        },
        {
          "type": "TEAM BOARD",
          "time": "17:36",
          "title": "THE PEOPLE WHO DELIVERED",
          "body": "Sam's rotation idea, the venue crew and the supplier handover have shaped the final opening programme.",
          "clue": "Leadership is visible in who contributes and how decisions travel."
        },
        {
          "type": "BOARD NOTE",
          "time": "17:51",
          "title": "WHAT HAPPENS NEXT",
          "body": "The founders want a credible next-event plan including staffing, guest fairness, sponsor terms and the remaining cash balance.",
          "clue": "A memorable night means little if the next one cannot operate."
        }
      ],
      "advice": [
        "Praise meaningful contributions without ranking employees' personalities.",
        "A realistic closing schedule is as important as opening the doors.",
        "The finale is a chance for earned public recognition rather than a false success claim.",
        "Leave cash for the next event. Don't book the annual sponsorship as paid cash.",
        "Secure future partner commitments only with achievable dates.",
        "Close the loop with guests, employees and community supporters."
      ],
      "plans": [
        {
          "name": "MAKE THE TEAM THE HEADLINE",
          "verb": "Fund the next chapter",
          "desc": "Use the opening to recognise cross-team contributions and fund a measured follow-up series.",
          "benefits": [
            "Learning and trust",
            "Sustainable operating plan"
          ],
          "cost": "Less cash available for aggressive expansion.",
          "spend": 23000,
          "delta": {
            "legal": -8,
            "ops": -4,
            "workforce": -15,
            "customer": -12
          },
          "trust": 13,
          "fallout": "Guests applaud the people who built the night. The venue earns its first repeat community booking."
        },
        {
          "name": "GO BIG NEXT MONTH",
          "verb": "Scale fast",
          "desc": "Commit to an even bigger series and expand before documenting lessons from tonight.",
          "benefits": [
            "Ambition and momentum",
            "Possible growth upside"
          ],
          "cost": "Higher deferred costs and staff fatigue.",
          "spend": 16000,
          "delta": {
            "legal": 7,
            "ops": 11,
            "workforce": 12,
            "customer": -7
          },
          "trust": 7,
          "fallout": "The founders announce an ambitious expanded series. The room cheers, but the operations team is already counting the overtime and facilities commitments that will land next month.",
          "delay": {
            "due": 7,
            "cost": 19000,
            "label": "Unfunded next-series expansion obligations",
            "delta": {
              "liquidity": 6
            }
          }
        },
        {
          "name": "PROTECT THE RESERVE",
          "verb": "End on a measured note",
          "desc": "Close the evening within budget, document what worked and delay all expansion promises.",
          "benefits": [
            "Preserves cash",
            "Honest reflection"
          ],
          "cost": "May frustrate partners hoping for a big announcement.",
          "spend": 7000,
          "delta": {
            "legal": -4,
            "ops": -7,
            "workforce": -3,
            "customer": 7
          },
          "trust": 2,
          "fallout": "The event ends without a dramatic expansion promise. The team leaves with usable evidence and a clearer plan for next time."
        }
      ],
      "signals": [
        {
          "name": "SHARE THE RECEIPTS",
          "line": "'Here's what changed today, who made it possible, and what we will improve.'",
          "delta": {
            "legal": -5,
            "ops": -3,
            "workforce": -6,
            "customer": -6
          },
          "trust": 7
        },
        {
          "name": "DECLARE PERFECTION",
          "line": "'Every promise was delivered without compromise.'",
          "delta": {
            "legal": 11,
            "ops": 3,
            "workforce": 2,
            "customer": 8
          },
          "trust": -4
        },
        {
          "name": "CREDIT THE CEO",
          "line": "'A great night, led entirely by senior management.'",
          "delta": {
            "legal": 1,
            "ops": 0,
            "workforce": 11,
            "customer": 4
          },
          "trust": -7
        }
      ],
      "learning": {
        "pearsonLO": "LO1 / LO2 / LO3 / LO4",
        "topic": "Synthesize people, motivation, culture and commercial trade-offs.",
        "facilitatorPrompt": "Who changed your team's thinking? What did you learn that a scoreboard cannot capture?"
      }
    }
  ],
  "initialCash": 210000,
  "annualContractValue": 120000,
  "baseline": {
    "legal": 37,
    "ops": 35,
    "workforce": 42,
    "customer": 47,
    "liquidity": 20
  },
  "variants": [
    {
      "title": "Early registrations came through the creator network",
      "effect": {
        "customer": 3,
        "ops": 2
      },
      "note": "A local creator's preview increased expectations beyond the official list."
    },
    {
      "title": "The team had not rehearsed the opening announcement",
      "effect": {
        "workforce": 5,
        "customer": 2
      },
      "note": "Nobody had practised explaining the capacity policy to guests."
    },
    {
      "title": "A supplier booking had an overlooked delivery clause",
      "effect": {
        "ops": 5,
        "legal": 1
      },
      "note": "The delivery deadline requires a same-day confirmation."
    }
  ]
};
g.BCLearningContent=scene;
})(globalThis);
