(function(g){
"use strict";
// Six original, self-contained SVG scene posters. No photographs, external images or font dependencies.
const scenes={
 invitation:{tag:"01 / THE INVITATION",color:"#eac991",accent:"#a7d8cf",symbol:'<g transform="translate(310 62) rotate(13)"><rect x="0" y="0" width="205" height="285" rx="9" fill="#f1e5c9" stroke="#c58d67" stroke-width="4"/><path d="M22 42h161M22 58h119" stroke="#1b4244" stroke-width="6"/><text x="23" y="126" fill="#173738" font-size="51" font-family="Georgia" font-weight="bold">320</text><text x="23" y="158" fill="#31595c" font-size="18" font-family="Arial">PLACES</text><path d="M22 188h162M22 205h162M22 222h138" stroke="#a0b6aa" stroke-width="6"/><circle cx="172" cy="248" r="25" fill="#e3a47b"/></g>'},
 people:{tag:"02 / THE PEOPLE",color:"#a5d0be",accent:"#efbe8a",symbol:'<g transform="translate(297 78)"><circle cx="101" cy="35" r="35" fill="#edc2a0"/><path d="M44 135c0-65 115-65 115 0v70H44z" fill="#e0a778"/><circle cx="23" cy="106" r="25" fill="#f0d5a1"/><path d="M0 200v-44c0-52 73-52 73 0v44" fill="#98b9b5"/><circle cx="190" cy="106" r="25" fill="#e9ba91"/><path d="M152 200v-44c0-52 74-52 74 0v44" fill="#92bfb2"/><path d="M49 230H170" stroke="#f8ebcc" stroke-width="6"/><path d="M49 247H135" stroke="#f8ebcc" stroke-width="6"/></g>'},
 supplier:{tag:"03 / THE SUPPLIER",color:"#f0b28c",accent:"#b7d9ca",symbol:'<g transform="translate(292 86)"><rect x="10" y="99" width="210" height="160" rx="9" fill="#d6b892" stroke="#ead8b6" stroke-width="5"/><path d="M10 137h210M115 99v160" stroke="#fff1d3" stroke-width="7"/><path d="M35 8h75v92H35zM133 33h73v66h-73z" fill="#aec8bd" stroke="#e6eadc" stroke-width="4"/><text x="120" y="207" text-anchor="middle" fill="#345052" font-size="49" font-family="Georgia">180</text><circle cx="209" cy="24" r="18" fill="#e9c889"/><path d="M209 4v40M189 24h40" stroke="#1d4445" stroke-width="4"/></g>'},
 culture:{tag:"04 / THE CULTURE",color:"#c0b4e1",accent:"#efc18a",symbol:'<g transform="translate(306 74)"><path d="M100 4l110 80v176H-10V84z" fill="#a6bfc5" stroke="#f0d9b4" stroke-width="5"/><rect x="48" y="124" width="105" height="136" fill="#2c5057"/><rect x="13" y="111" width="30" height="30" fill="#e7cc8f"/><rect x="166" y="111" width="30" height="30" fill="#e7cc8f"/><path d="M-10 84h220M100 4v256" stroke="#f7e8c5" stroke-width="4"/><circle cx="100" cy="88" r="30" fill="#eacaa2"/><path d="M85 88h30" stroke="#234244" stroke-width="5"/></g>'},
 partner:{tag:"05 / THE PARTNER",color:"#e3c1a1",accent:"#b3cdda",symbol:'<g transform="translate(289 97) rotate(-8)"><rect x="15" y="0" width="190" height="252" rx="6" fill="#eee3d0" stroke="#f4e8cc" stroke-width="5"/><path d="M43 47h125M43 65h125" stroke="#9fada3" stroke-width="7"/><text x="45" y="131" fill="#254748" font-size="43" font-family="Georgia">£120K</text><text x="45" y="160" fill="#466667" font-size="17" font-family="Arial">PER YEAR</text><path d="M44 190h115M44 209h74" stroke="#b1bbae" stroke-width="6"/><circle cx="165" cy="222" r="29" fill="#df9b74" stroke="#f6d4a3" stroke-width="4"/></g>'},
 opening:{tag:"06 / OPENING NIGHT",color:"#eccd8e",accent:"#a7d8cf",symbol:'<g transform="translate(286 78)"><path d="M14 85h213v190H14z" fill="#87a9a7" stroke="#e7d9b4" stroke-width="5"/><path d="M10 85l110-70L233 85" fill="#e0b787" stroke="#f2dfba" stroke-width="5"/><rect x="50" y="136" width="64" height="139" fill="#e9d0a3"/><rect x="132" y="136" width="60" height="68" fill="#dfc69c"/><path d="M10 100h217" stroke="#f6e7ca" stroke-width="6"/><path d="M28 30l-12-17M206 32l15-21M120 5V-7" stroke="#eac996" stroke-width="6" stroke-linecap="round"/><circle cx="195" cy="239" r="19" fill="#e2ab82"/></g>'}
};
function svg(id){
 const a=scenes[id]||scenes.invitation;
 return '<svg class="scene-illustration" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Original illustration for '+a.tag+'" viewBox="0 0 560 340" preserveAspectRatio="xMidYMid meet">'+
 '<rect width="560" height="340" fill="#163337"/><circle cx="442" cy="128" r="165" fill="'+a.color+'" opacity=".14"/>'+
 '<circle cx="400" cy="166" r="117" fill="none" stroke="'+a.accent+'" opacity=".22" stroke-width="2"/>'+
 '<path d="M0 265L270 213M0 298L290 246" stroke="'+a.color+'" opacity=".14" stroke-width="3"/>'+
 '<text x="28" y="60" fill="'+a.color+'" font-size="14" font-family="Arial" letter-spacing="3">FIELDWORK</text>'+
 '<text x="28" y="90" fill="'+a.accent+'" font-size="14" font-family="Arial" letter-spacing="4">HOUSE</text>'+
 '<text x="28" y="250" fill="#e8e3d2" font-size="73" font-family="Georgia" opacity=".92">'+id.toUpperCase().slice(0,1)+'</text>'+
 '<text x="28" y="291" fill="#dccfae" font-size="11" font-family="Arial" letter-spacing="2">'+a.tag+'</text>'+
 a.symbol+'</svg>';
}
g.BCLearningArt=Object.freeze({svg});
})(globalThis);
