(function(g){
"use strict";
function building(x,w,h,lit){let out='<g><rect x="'+x+'" y="'+(570-h)+'" width="'+w+'" height="'+h+'" fill="'+(lit?'#182d3a':'#10212d')+'"/>';for(let y=595-h;y<560;y+=24){for(let xx=x+11;xx<x+w-8;xx+=19){const on=((xx*7+y*3)%9<3);out+='<rect x="'+xx+'" y="'+y+'" width="7" height="10" fill="'+(on?'#c5a26a':'#263e4c')+'" opacity="'+(on?'.46':'.4')+'"/>';}}return out+'</g>';}
function skyline(){let a='';const heights=[270,190,330,240,350,180,300,215,395,270,200,360,260,315,190,340,280,225,370,260,190,310];let x=0;for(let i=0;i<heights.length;i++){const w=58+(i%3)*14;a+=building(x,w,heights[i],i%2);x+=w+9;}return a;}
function room(){return '<rect x="0" y="0" width="1440" height="800" fill="url(#night)"/>'+
'<path d="M0 0H1440V575H0Z" fill="url(#glass)"/><path d="M0 360Q420 270 720 350T1440 290V560H0Z" fill="#3e5660" opacity=".17"/>'+
skyline()+
'<path d="M0 0H1440V60H0Z" fill="#09141d"/><path d="M0 0H85V640H0Z" fill="#0b1821"/><path d="M1350 0H1440V640H1350Z" fill="#0b1821"/>'+
'<path d="M480 0V560M970 0V560" stroke="#07131c" stroke-width="24"/>'+
'<path d="M0 570H1440V800H0Z" fill="url(#floor)"/><path d="M0 573H1440" stroke="#73808a" stroke-width="7" opacity=".3"/>'+
'<path d="M0 800L520 565H925L1440 800" fill="#111e28" opacity=".65"/>';
}
function person(x,y,scale,tone,coat){return '<g transform="translate('+x+' '+y+') scale('+scale+')">'+
'<ellipse cx="0" cy="0" rx="94" ry="24" fill="#000" opacity=".2"/>'+
'<path d="M-62 -23Q-57 -113 -12 -124H16Q59 -116 66 -23Z" fill="'+coat+'"/>'+
'<path d="M-15 -118V-149H18V-117L0 -103Z" fill="'+tone+'"/>'+
'<ellipse cx="0" cy="-176" rx="39" ry="49" fill="'+tone+'"/>'+
'<path d="M-40 -179Q-45 -240 0 -232Q47 -231 40 -177Q28 -215 0 -214Q-25 -215 -40 -179Z" fill="#131923"/>'+
'<path d="M-27 -102L0 -72L25 -103" stroke="#b7c5cb" stroke-width="5" fill="none"/>'+
'</g>';}
function desk(){return '<path d="M140 624L1160 624L1440 800H0Z" fill="url(#desk)" stroke="#6d5e4e" stroke-width="6"/>'+
'<path d="M250 646H1115" stroke="#e4bd7c" stroke-width="3" opacity=".28"/>'+
'<g transform="translate(700 675) rotate(-5)"><rect x="-130" y="-55" width="260" height="110" rx="4" fill="#c9c6b8"/><rect x="-105" y="-35" width="180" height="5" fill="#79848c"/><rect x="-105" y="-20" width="206" height="4" fill="#79848c"/><rect x="-105" y="-5" width="145" height="4" fill="#79848c"/><rect x="-105" y="10" width="190" height="4" fill="#79848c"/><rect x="-105" y="25" width="155" height="4" fill="#79848c"/></g>'+
'<ellipse cx="350" cy="706" rx="46" ry="17" fill="#050b0f" opacity=".5"/><path d="M320 683H377L370 714H327Z" fill="#f1e7d3"/><path d="M377 690Q407 686 390 709H373" stroke="#f1e7d3" stroke-width="7" fill="none"/>';
}
function props(id){
if(id==="mail")return '<g transform="translate(950 300) rotate(9)"><rect x="-190" y="-120" width="380" height="245" rx="7" fill="#e5dfd0" stroke="#a79b8b" stroke-width="4"/><path d="M-190 -120L0 25L190 -120" fill="none" stroke="#a39a8d" stroke-width="5"/><path d="M-190 125L-20 -4M190 125L20 -4" stroke="#b3a799" stroke-width="4"/><rect x="-135" y="-80" width="150" height="14" fill="#d46b5e"/><rect x="-135" y="-48" width="230" height="7" fill="#7d8b91"/></g>'+
'<g transform="translate(290 440) rotate(-14)"><rect x="0" y="0" width="240" height="150" fill="#e1dac9"/><path d="M22 30H190M22 48H170M22 66H210M22 84H130" stroke="#9d9c92" stroke-width="5"/><rect x="20" y="105" width="115" height="22" fill="#b3524d"/></g>';
if(id==="floor")return '<g transform="translate(260 360)"><rect x="0" y="0" width="310" height="190" rx="9" fill="#08151f" stroke="#5a6c78" stroke-width="12"/><rect x="17" y="18" width="276" height="150" fill="#223a48"/><path d="M38 50H240M38 78H225M38 106H180" stroke="#8aa6b3" stroke-width="8" opacity=".6"/><path d="M155 190V240M95 240H215" stroke="#7a8790" stroke-width="13"/></g>'+person(1040,700,1.25,"#b78973","#253a47")+person(1220,705,1.0,"#d0ad92","#3c3a42");
if(id==="client")return '<g transform="translate(720 190)"><rect x="0" y="0" width="545" height="365" rx="12" fill="#07111a" stroke="#758894" stroke-width="18"/><rect x="19" y="19" width="507" height="327" fill="#223c4c"/><circle cx="270" cy="135" r="60" fill="#9e8e86"/><path d="M125 345Q145 225 270 226Q398 225 418 345" fill="#142c3a"/><circle cx="45" cy="42" r="9" fill="#d76c61"/><path d="M420 45H490" stroke="#b9d1d9" stroke-width="8" opacity=".5"/></g>'+desk();
if(id==="press")return '<g transform="translate(750 190)"><rect x="0" y="0" width="560" height="340" rx="9" fill="#0c1b26" stroke="#7e8d95" stroke-width="16"/><rect x="18" y="18" width="524" height="304" fill="#263d4d"/><rect x="18" y="220" width="524" height="102" fill="#a83e3c"/><path d="M38 250H450M38 279H350" stroke="#f4e9db" stroke-width="17"/><circle cx="460" cy="65" r="13" fill="#d96358"/></g>'+
'<g transform="translate(360 555)"><rect x="-125" y="-70" width="250" height="125" rx="15" fill="#172a35"/><circle cx="0" cy="-5" r="55" fill="#0a151d" stroke="#526978" stroke-width="16"/><path d="M0 55V150M-100 150H100" stroke="#425766" stroke-width="24"/><rect x="90" y="-46" width="85" height="35" fill="#111d26"/></g>';
if(id==="warehouse")return '<path d="M0 280H1440V630H0Z" fill="#29353a" opacity=".75"/>'+
'<path d="M0 330H1440M0 440H1440M0 550H1440" stroke="#6d756c" stroke-width="7" opacity=".45"/>'+
'<g transform="translate(200 415)"><rect x="0" y="0" width="250" height="190" fill="#74543c" stroke="#bc9567" stroke-width="10"/><path d="M125 0V190M0 95H250" stroke="#aa8259" stroke-width="9"/></g>'+
'<g transform="translate(460 470)"><rect x="0" y="0" width="240" height="145" fill="#775943" stroke="#b9946b" stroke-width="9"/><path d="M120 0V145M0 72H240" stroke="#b9946b" stroke-width="7"/></g>'+
'<g transform="translate(1000 480)"><rect x="0" y="75" width="240" height="90" rx="8" fill="#c48d46"/><rect x="130" y="0" width="75" height="110" fill="none" stroke="#b18b56" stroke-width="18"/><circle cx="45" cy="170" r="30" fill="#141b1e"/><circle cx="205" cy="170" r="30" fill="#141b1e"/><path d="M20 75V30H115V75" fill="#263c47"/></g>';
return '<g transform="translate(360 270)">'+person(0,410,1.05,"#b98b70","#1c313c")+person(340,410,1.15,"#c8a18a","#29313b")+person(690,410,1.05,"#a87663","#273e48")+'</g>'+desk()+
'<g transform="translate(545 200)"><rect x="0" y="0" width="350" height="180" rx="9" fill="#0a1823" stroke="#657e8e" stroke-width="12"/><path d="M50 50H300M50 80H230M50 110H270" stroke="#c5a478" stroke-width="12" opacity=".7"/></g>';
}
function scene(id){
const theme=id==="press"?"#a84c43":id==="warehouse"?"#c5965c":id==="floor"?"#79a3b1":"#e6b16d";
return '<svg class="scene-art" viewBox="0 0 1440 800" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Original illustrated team business challenge scene">'+
'<defs><linearGradient id="night" x2=".8" y2="1"><stop stop-color="#142c3b"/><stop offset=".65" stop-color="#07121d"/><stop offset="1" stop-color="#07111a"/></linearGradient>'+
'<linearGradient id="glass" x2="0" y2="1"><stop stop-color="#314d5c"/><stop offset=".65" stop-color="#4d5860"/><stop offset="1" stop-color="#a27354"/></linearGradient>'+
'<linearGradient id="floor" x2="0" y2="1"><stop stop-color="#283540"/><stop offset="1" stop-color="#0a131b"/></linearGradient>'+
'<linearGradient id="desk" x2="0" y2="1"><stop stop-color="#534438"/><stop offset="1" stop-color="#171e24"/></linearGradient>'+
'<radialGradient id="halo"><stop stop-color="'+theme+'" stop-opacity=".28"/><stop offset="1" stop-color="'+theme+'" stop-opacity="0"/></radialGradient>'+
'<pattern id="grain" width="9" height="9" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r=".6" fill="#fff" opacity=".13"/><circle cx="6" cy="7" r=".5" fill="#000" opacity=".2"/></pattern></defs>'+
room()+'<ellipse cx="880" cy="350" rx="610" ry="460" fill="url(#halo)"/>'+props(id)+
'<rect x="0" y="0" width="1440" height="800" fill="url(#grain)" opacity=".5"/>'+
'<path d="M0 0H1440V800H0Z" fill="none" stroke="#08141c" stroke-width="30"/></svg>';
}
const faces=[
{skin:"#bd866c",hair:"#241e23",coat:"#353d46",shirt:"#d7c6b6",shape:"M40 90Q26 20 100 18Q177 24 161 99Q144 54 115 52Q72 61 40 90Z",extra:"<path d='M52 132Q100 159 148 132' stroke='#7a4b42' stroke-width='3' fill='none'/>"},
{skin:"#c19b7c",hair:"#272727",coat:"#2b4554",shirt:"#aebdc1",shape:"M35 100Q28 15 104 26Q165 19 170 100L153 77Q142 40 90 44Q57 50 35 100Z",extra:"<path d='M72 138Q100 157 127 138' stroke='#674e44' stroke-width='5' fill='none'/>"},
{skin:"#a8785c",hair:"#1c2227",coat:"#3c343d",shirt:"#e0d4ca",shape:"M33 100Q27 22 92 21Q164 15 170 92Q150 55 125 55Q71 47 33 100Z",extra:"<path d='M49 60Q39 100 45 133M159 65Q170 102 161 137' stroke='#1c2227' stroke-width='17' fill='none'/>"},
{skin:"#d1b39b",hair:"#5e5147",coat:"#384d46",shirt:"#e0e2d9",shape:"M38 83Q35 28 96 27Q159 20 163 91Q151 57 119 58Q77 50 38 83Z",extra:"<path d='M59 107H92M108 107H141M92 107H108' stroke='#aeb9ba' stroke-width='4' fill='none'/><rect x='52' y='94' width='43' height='27' rx='7' stroke='#3c5057' stroke-width='4' fill='none'/><rect x='105' y='94' width='43' height='27' rx='7' stroke='#3c5057' stroke-width='4' fill='none'/>"},
{skin:"#b98c75",hair:"#151c23",coat:"#313e50",shirt:"#c9d6d5",shape:"M32 96Q25 20 100 17Q175 21 169 102Q149 45 113 48Q73 45 32 96Z",extra:"<path d='M45 61Q34 107 46 146M156 60Q168 111 158 147' stroke='#151c23' stroke-width='20' fill='none'/>"},
{skin:"#d5a886",hair:"#6b5948",coat:"#534641",shirt:"#ddd6c9",shape:"M30 98Q24 20 98 16Q174 15 173 103Q147 54 109 54Q67 52 30 98Z",extra:"<path d='M31 82Q23 128 44 153M167 79Q179 130 158 155' stroke='#6b5948' stroke-width='17' fill='none'/>"}
];
function portrait(i){
const f=faces[i]||faces[0],bg=["#4a555f","#41596a","#574e57","#465d54","#44566c","#66584c"][i]||"#445566";
return '<svg viewBox="0 0 200 250" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Illustrated portrait of '+g.BCContent.advisers[i].name+'">'+
'<defs><linearGradient id="pb'+i+'" x2="1" y2="1"><stop stop-color="'+bg+'"/><stop offset="1" stop-color="#151e28"/></linearGradient></defs>'+
'<rect width="200" height="250" fill="url(#pb'+i+')"/><circle cx="156" cy="43" r="72" fill="#e3b17a" opacity=".1"/>'+
'<path d="M-15 254Q-12 174 61 169L100 191L140 169Q215 182 215 254Z" fill="'+f.coat+'"/>'+
'<path d="M76 166L100 203L126 165L116 250H84Z" fill="'+f.shirt+'"/>'+
'<path d="M82 145V180Q100 195 118 180V145Z" fill="'+f.skin+'"/>'+
'<ellipse cx="100" cy="102" rx="60" ry="74" fill="'+f.skin+'"/>'+
'<path d="'+f.shape+'" fill="'+f.hair+'"/>'+
'<path d="M62 101Q75 96 87 102M112 102Q126 96 139 101" stroke="'+f.hair+'" stroke-width="4" fill="none"/>'+
'<ellipse cx="76" cy="111" rx="4" ry="3" fill="#27252b"/><ellipse cx="125" cy="111" rx="4" ry="3" fill="#27252b"/>'+
'<path d="M100 114L95 136Q101 140 108 136" stroke="#8d6153" stroke-width="3" fill="none"/>'+
'<path d="M82 153Q100 160 119 152" stroke="#714c45" stroke-width="3" fill="none"/>'+f.extra+
'<path d="M0 234H200" stroke="#e2b77d" stroke-width="3" opacity=".7"/>'+
'</svg>';
}
function insignia(){return '<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M8 8H40V40H8Z" fill="none" stroke="currentColor" stroke-width="2"/><path d="M15 15L33 33M33 15L15 33" stroke="currentColor" stroke-width="2"/><circle cx="24" cy="24" r="4" fill="currentColor"/></svg>';}
g.BCArt={scene:scene,portrait:portrait,insignia:insignia};
})(globalThis);
