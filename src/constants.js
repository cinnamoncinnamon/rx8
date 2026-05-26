export const NUM_COLORS = {
  0: ["red", "violet"],
  1: ["green"],
  2: ["red"],
  3: ["green"],
  4: ["red"],
  5: ["green", "violet"],
  6: ["red"],
  7: ["green"],
  8: ["red"],
  9: ["green"],
};
export const isBig = (n) => n >= 5;
export const BASE = "20260513100051260";
export const makePID = (base, off = 0) => (BigInt(base) - BigInt(off)).toString();
export const G = {
  red: "#EF5350",
  green: "#22C55E",
  violet: "#7C3AED",
  orange: "#F97316",
  blue: "#3B82F6",
  bg: "#F4F4F8",
  text: "#1A1A2E",
  sub: "#888",
};
export const gradient = `linear-gradient(135deg,#EF5350,#FF8A80)`;
export const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800;900&family=Orbitron:wght@700;900&display=swap');
*{box-sizing:border-box;margin:0;padding:0;}
@keyframes slideUp{from{transform:translateY(100%)}to{transform:translateY(0)}}
@keyframes fadeIn{from{opacity:0;transform:scale(.85)}to{opacity:1;transform:scale(1)}}
@keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.08)}}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes engineGlow{0%,100%{opacity:.7;transform:scaleX(1)}50%{opacity:1;transform:scaleX(1.4)}}
@keyframes multPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.04)}}
@keyframes msgIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
@keyframes dotBounce{0%,80%,100%{transform:scale(0)}40%{transform:scale(1)}}
@keyframes crashShake{0%,100%{transform:translateX(0)}20%{transform:translateX(-8px)}40%{transform:translateX(8px)}60%{transform:translateX(-4px)}80%{transform:translateX(4px)}}
input::placeholder{color:#777;}
input:focus{outline:none;}
button:active{opacity:.85;}
::-webkit-scrollbar{width:0;height:0;}
`;
export function genHist(n = 50) {
  return Array.from({ length: n }, (_, i) => {
    const num = Math.floor(Math.random() * 10);
    return {
      period: makePID(BASE, i + 1),
      number: num,
      bigSmall: isBig(num) ? "Big" : "Small",
      colors: NUM_COLORS[num],
    };
  });
}