import arielImg    from "../../../assets/goldenrelics/ariel.png";
import tridentImg  from "../../../assets/goldenrelics/sym-trident.png";
import chestImg    from "../../../assets/goldenrelics/sym-chest.png";
import crownImg    from "../../../assets/goldenrelics/sym-crown.png";
import coinImg from "../../../assets/goldenrelics/sym-coin.png";
import sapphireImg from "../../../assets/goldenrelics/sym-sapphire.png";
import turtleImg from "../../../assets/goldenrelics/sym-turtle.png";
import anchorImg from "../../../assets/goldenrelics/sym-anchor.png";
import pearlImg    from "../../../assets/goldenrelics/sym-pearl.png";
import octopusImg  from "../../../assets/goldenrelics/sym-octopus.png";
export const SYMBOLS = [
  "pearl", "chest", "crown", "trident", "coin",
  "sapphire", "turtle", "octopus", "anchor", "poseidon",
];

export const SYMBOL_LABEL = {
  pearl:    "Pearl",
  chest:    "Chest",
  crown:    "Crown",
  trident:  "Trident",
  coin:     "Coin",
  sapphire: "Sapphire",
  turtle:   "Turtle",
  octopus:  "Octopus",
  anchor:   "Anchor",
  poseidon: "Ariel",
};

export const SYMBOL_PAY = {
  poseidon: 50,
  trident:  25,
  crown:    20,
  chest:    15,
  octopus:  10,
  turtle:   8,
  sapphire: 6,
  anchor:   5,
  pearl:    4,
  coin:     3,
};

export const SYMBOL_WEIGHT = {
  poseidon: 1,
  trident:  2,
  crown:    3,
  chest:    4,
  octopus:  6,
  turtle:   9,
  sapphire: 12,
  anchor:   16,
  pearl:    20,
  coin:     27,
};

// ─── Symbol image map ─────────────────────────────────────────────────────────
// 🔧 Replace null values with your imported PNG variables

const SYMBOL_IMGS = {
  poseidon: arielImg,
  trident:  tridentImg,
  crown:    crownImg,
  chest:    chestImg,
  pearl:    pearlImg,
  octopus:  octopusImg,
  coin:     coinImg,
  sapphire: sapphireImg,
  turtle:   turtleImg,
  anchor:   anchorImg,
};
const SYMBOL_GLOW = {
  poseidon: "rgba(94,231,255,0.5)",
  trident:  "rgba(255,217,122,0.55)",
  crown:    "rgba(200,140,255,0.5)",
  chest:    "rgba(255,180,60,0.5)",
  pearl:    "rgba(180,235,255,0.55)",
  octopus:  "rgba(200,120,255,0.5)",
  coin:     "rgba(255,217,122,0.6)",
  sapphire: "rgba(100,180,255,0.55)",
  turtle:   "rgba(120,220,140,0.5)",
  anchor:   "rgba(255,200,80,0.5)",
};

export function SymbolGlyph({ k }) {
  const src  = SYMBOL_IMGS[k];
  const glow = SYMBOL_GLOW[k] ?? "rgba(255,255,255,0.4)";

  if (!src) {
    // Fallback placeholder until you wire up your PNGs
    return (
      <div style={{
        width: "100%", height: "100%",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: "10px", color: "rgba(255,255,255,0.4)",
        fontFamily: "monospace",
      }}>
        {k}
      </div>
    );
  }

  return (
    <div style={{ position: "relative", height: "100%", width: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <img
        src={src}
        alt={SYMBOL_LABEL[k]}
        loading="lazy"
        draggable={false}
        style={{
          height: "100%", width: "100%",
          objectFit: "contain",
          filter: `drop-shadow(0 0 10px ${glow})`,
        }}
      />
    </div>
  );
}
