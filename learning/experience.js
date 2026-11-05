(function(g){
"use strict";
// Original facilitator prompts. These vary the HUMAN interaction without creating an
// unvalidated scoring quiz or inventing economic consequences.
const beats={
  invitation:{
    act:"THE PROMISE TEST",label:"Issue the guest-facing message",
    intro:"A campaign promise has escaped its original context. Communication must be clear even if the truth is inconvenient.",
    roles:[["THE EARLY GUEST","I registered yesterday. Does my confirmation mean I can attend?"],["THE OPERATIONS LEAD","Our certified limit is 320 people, staff included. I cannot negotiate fire safety."]],
    challenge:"Give each perspective 30 seconds. Agree on one sentence you would be comfortable reading aloud to the people waiting outside.",
    spotlight:"Communication · Evidence · Customer expectations",
    next:"An apparently small wording error has made the staffing rota everyone's business."
  },
  people:{
    act:"THE TEAM HUDDLE",label:"Choose how you lead the staff huddle",
    intro:"The strongest idea might come from the least senior colleague. Your plan must create space for dissent without abandoning delivery.",
    roles:[["SAM, THE JUNIOR COORDINATOR","We can rotate roles so people actually take breaks. Could I show you the board?"],["THE FLOOR MANAGER","We have minutes to finalise staffing. I need to know who is in charge."]],
    challenge:"Let each participant defend one role. Agree what you will ask Sam before deciding, and what your manager needs to deliver tonight.",
    spotlight:"Motivation · Autonomy · Perception",
    next:"The supplier calls while half the event crew is still debating the rota."
  },
  supplier:{
    act:"THE NEGOTIATION TABLE",label:"Choose your negotiation position",
    intro:"The original supplier can guarantee 180 packs. A verified local collective can deliver 140 simpler packs. Neither choice is free.",
    roles:[["THE MAIN SUPPLIER","My rush fee reflects rearranging another client's delivery. Will you guarantee the order?"],["THE COMMUNITY COLLECTIVE","We have 140 packs ready, but the ingredients and menu will differ."]],
    challenge:"Name your real alternative before asking for a concession. Negotiate for terms, not simply the cheapest price.",
    spotlight:"BATNA · Trade-offs · Operational delivery",
    next:"A sponsor sees the event's growing reach and wants a bigger say in the brand."
  },
  culture:{
    act:"WHO OWNS THE DECISION?",label:"Set the approval boundary",
    intro:"Formal authority, informal influence and staff psychological safety collide over a single caption.",
    roles:[["THE SPONSOR","Our name is attached to the event. We want to see every external message."],["SAM, THE COORDINATOR","I spend longer waiting for approval than solving the actual issue."]],
    challenge:"Draw a line between legitimate brand approval, operational authority and the right to raise a concern. Then communicate it.",
    spotlight:"Power · Culture · Informal influence",
    next:"The sponsor returns with a contract offer far more attractive on paper than in practice."
  },
  partner:{
    act:"THE DEAL ROOM",label:"Answer the partner's offer",
    intro:"The £120,000 headline sponsorship is future annual commercial value, not cash in the event response fund. Exclusivity affects the whole community.",
    roles:[["THE BIG PARTNER","Eighty VIP spaces and exclusive branding are the conditions for our headline offer."],["THE COMMUNITY PARTNER","Our smaller non-exclusive offer keeps the venue open to local groups."]],
    challenge:"List what you can give away, what you cannot, and your walk-away point. Remember the verified capacity is still 320.",
    spotlight:"Negotiation · Stakeholders · Long-term value",
    next:"It's opening time. Your receipts, promises and team relationships are about to face the public."
  },
  opening:{
    act:"THE CLOSING MOMENT",label:"Choose the boardroom message",
    intro:"A management team is remembered for what it funds, who it credits and whether the promises were real.",
    roles:[["THE FOUNDING DIRECTOR","The event is on everyone’s feeds. How do we turn tonight into next year's growth?"],["THE FRONTLINE COORDINATOR","The guests are smiling. Please don't promise another huge event on the same exhausted rota."]],
    challenge:"Give a 30-second closing address that credits specific contributions and names one commitment the team can actually fund.",
    spotlight:"Ethical leadership · Recognition · Sustainable execution",
    next:"The event ends with a process lesson, not a villain: the wrong draft passed through the scheduling queue."
  }
};
g.BCLearningExperience=Object.freeze(beats);
})(globalThis);
