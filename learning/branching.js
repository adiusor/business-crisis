(function(g){
"use strict";
// A bounded, evidence-grounded narrative branch for each completed decision.
// These are reminders of actual committed strategies, not invented numeric effects.
const branches=Object.freeze({
 invitation:{
   "CAP THE GUEST LIST":"The guest list is capped, but disappointed registrants are still asking how places were allocated. Staff need a consistent answer.",
   "ADD A SECOND SESSION":"The second event slot remains conditional on staffing and safety approval. Your team is already discussing who will cover it.",
   "KEEP THE HYPE":"Registrations kept climbing after your team left the invitation ambiguous. Front-of-house staff now inherit the clarification problem."
 },
 people:{
   "CO-DESIGN THE ROTA":"Sam's rotation idea is on the table. The supply handover now has a named team lead, though staff still need practice with the new process.",
   "PAY THE EXTRA HOURS":"The rota has coverage, but promised extra shifts will be paid later. Finance carries the commitment into the supplier conversation.",
   "DIRECT THE FLOOR":"Managers imposed a quick plan. The supplier problem arrives before the unresolved staff concerns have been properly heard."
 },
 supplier:{
   "NEGOTIATE TWO SOURCES":"You secured a second supply option. Ingredient checks and a coordinated handover are now operational priorities, not abstract advantages.",
   "PAY FOR PRIORITY":"Your team bought a costly priority delivery. The sponsor will want proof that the promise is being monitored and can be kept.",
   "HOLD THE ORIGINAL ORDER":"There will not be enough original guest packs for everyone. The sponsor and staff are hearing requests for an honest recovery offer."
 },
 culture:{
   "SET CLEAR BOUNDARIES":"You clarified approval rights. When the partner deal arrives, you can separate sponsor branding from operational decision authority.",
   "PUT THE SPONSOR FIRST":"The sponsor has additional control over messaging. Its upcoming contract offer could make that dependency harder to reverse.",
   "TURN THE MEME INTO A CAMPAIGN":"The joke travelled further, but the approval chain remains unclear. The partner's proposal will test who can actually sign off."
 },
 partner:{
   "BUILD A BOUNDED PARTNERSHIP":"You proposed limited VIP places and a review period. Tonight's team can plan around the offered terms, while the wider deal remains subject to agreement.",
   "SIGN EXCLUSIVITY":"You agreed to a large VIP allocation and exclusivity. Community guests have fewer places, and future programme commitments remain on the ledger.",
   "BACK THE LOCAL COALITION":"You chose a smaller non-exclusive relationship. The opening remains community-led, but the lost upside is a real strategic trade-off."
 },
 opening:{
   "MAKE THE TEAM THE HEADLINE":"You funded follow-through and recognised the people who made the opening possible. Cash decreased to support that promise.",
   "GO BIG NEXT MONTH":"You announced expansion before learning the full cost of tonight. The outstanding expansion commitments are not automatically funded.",
   "PROTECT THE RESERVE":"You chose liquidity and measured learning over another announcement. Partners hoping for immediate expansion will need a clear explanation."
 }
});
function interlude(history,round){
 if(!Array.isArray(history)||round<=0||round>5)return null;
 const last=history[round-1];
 if(!last || !last.episode)return null;
 const mapping=branches[Object.keys(branches)[round-1]];
 const text=mapping?.[last.plan]||last.fallout;
 return {round:last.round,plan:last.plan,text,priorCash:last.cash,pendingLiability:last.pendingLiability};
}
function ending(history){
 if(!Array.isArray(history)||history.length!==6)return null;
 const last=history[5];return branches.opening[last.plan]||last.fallout;
}
g.BCLearningBranches=Object.freeze({interlude,ending,branches});
})(globalThis);
