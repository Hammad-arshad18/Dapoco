/* ============================================================================
   DAPOCO STUDIO — configurable pieces
   Every piece is a photoreal Poly Haven model (CC0). Each model was split
   offline into colour "zones" (upholstery, frame, top…) so each part can be
   re-dyed live while keeping its real texture detail (grain, weave, creases).
   `ref` = average linear luminance of the zone's original texture; the dye
   shader uses it to map the original texture onto the new colour.
   ========================================================================== */

const O = { key: 'original', name: 'Signature', color: null };

/* Finish palettes. `mr` = [metalness, roughness] override (−1 keeps the original). */
export const PALETTES = {
  leather: {
    label: 'Leather',
    detail: 0.55,
    items: [
      O,
      { key: 'onyx', name: 'Onyx Leather', color: '#1b1917' },
      { key: 'cognac', name: 'Cognac Leather', color: '#8a4c26' },
      { key: 'tobacco', name: 'Tobacco Leather', color: '#5b3a22' },
      { key: 'oxblood', name: 'Oxblood Leather', color: '#5a1a17' },
      { key: 'forest', name: 'Forest Leather', color: '#23362b' },
      { key: 'midnight', name: 'Midnight Leather', color: '#1c2333' },
      { key: 'sand', name: 'Sand Nubuck', color: '#c4ab8a' },
      { key: 'ivory', name: 'Ivory Leather', color: '#e8dfcf' },
    ],
  },
  fabric: {
    label: 'Fabric',
    detail: 0.6,
    items: [
      O,
      { key: 'boucle', name: 'Ivory Bouclé', color: '#ebe4d6' },
      { key: 'oat', name: 'Oat Linen', color: '#cbbda2' },
      { key: 'dove', name: 'Dove Grey', color: '#9a958e' },
      { key: 'charcoal', name: 'Charcoal Wool', color: '#2e2d2b' },
      { key: 'emerald', name: 'Emerald Velvet', color: '#1d4a39' },
      { key: 'sapphire', name: 'Sapphire Velvet', color: '#1f2f5c' },
      { key: 'rouge', name: 'Rouge Velvet', color: '#6b1d2a' },
      { key: 'saffron', name: 'Saffron Velvet', color: '#b8862b' },
      { key: 'blush', name: 'Blush Velvet', color: '#d2a397' },
    ],
  },
  wood: {
    label: 'Wood',
    detail: 0.95,
    items: [
      O,
      { key: 'oak', name: 'Natural Oak', color: '#b48c5f' },
      { key: 'teak', name: 'Golden Teak', color: '#8b5a32' },
      { key: 'walnut', name: 'American Walnut', color: '#5a3a22' },
      { key: 'mahogany', name: 'Mahogany', color: '#5b2418' },
      { key: 'smoked', name: 'Smoked Oak', color: '#6e5e50' },
      { key: 'ebony', name: 'Ebonised', color: '#1a1715' },
      { key: 'ash', name: 'Bleached Ash', color: '#d9cbb4' },
    ],
  },
  lacquer: {
    label: 'Lacquer',
    detail: 0.35,
    items: [
      O,
      { key: 'ivory', name: 'Ivory Lacquer', color: '#e9e2d5', mr: [0, 0.25] },
      { key: 'piano', name: 'Piano Black', color: '#121212', mr: [0, 0.18] },
      { key: 'forest', name: 'Forest Lacquer', color: '#1f3a2f', mr: [0, 0.25] },
      { key: 'terracotta', name: 'Terracotta', color: '#b0582f', mr: [0, 0.3] },
      { key: 'navy', name: 'Navy Lacquer', color: '#1c2740', mr: [0, 0.22] },
      { key: 'celadon', name: 'Celadon', color: '#8fb3a3', mr: [0, 0.3] },
      { key: 'blush', name: 'Blush Lacquer', color: '#d7a79b', mr: [0, 0.3] },
    ],
  },
  metal: {
    label: 'Metal',
    detail: 0.3,
    items: [
      O,
      { key: 'brass', name: 'Brushed Brass', color: '#c9a35c', mr: [1, 0.32] },
      { key: 'champagne', name: 'Champagne Gold', color: '#d8c08a', mr: [1, 0.22] },
      { key: 'chrome', name: 'Polished Chrome', color: '#e0e2e5', mr: [1, 0.1] },
      { key: 'bronze', name: 'Antique Bronze', color: '#6b4a2e', mr: [1, 0.4] },
      { key: 'gunmetal', name: 'Gunmetal', color: '#3a3b3d', mr: [1, 0.35] },
      { key: 'black', name: 'Matte Black', color: '#161616', mr: [0.3, 0.6] },
    ],
  },
  stone: {
    label: 'Stone',
    detail: 0.85,
    items: [
      O,
      { key: 'calacatta', name: 'Calacatta Marble', color: '#eeeae4', mr: [0, 0.18] },
      { key: 'nero', name: 'Nero Marquina', color: '#1c1b1a', mr: [0, 0.16] },
      { key: 'travertine', name: 'Roman Travertine', color: '#cfb998', mr: [0, 0.45] },
      { key: 'verde', name: 'Verde Alpi', color: '#2e4a3e', mr: [0, 0.18] },
      { key: 'rosso', name: 'Rosso Levanto', color: '#6d2a25', mr: [0, 0.2] },
      { key: 'grey', name: 'Fior di Bosco', color: '#9b968f', mr: [0, 0.22] },
    ],
  },
};

export const STUDIO_CATEGORIES = [
  { key: 'all', label: 'All pieces' },
  { key: 'seating', label: 'Seating' },
  { key: 'sofas', label: 'Sofas' },
  { key: 'tables', label: 'Tables' },
  { key: 'storage', label: 'Storage' },
  { key: 'bedroom', label: 'Bedroom' },
  { key: 'office', label: 'Office & Outdoor' },
];

const z = (key, label, type, mats, ref) => ({ key, label, type, mats, ref });

export const PIECES = [
  {
    id: 'mid_century_lounge_chair', name: 'Aurelia Lounge Chair', cat: 'seating',
    blurb: 'A sculpted moulded-veneer shell cradling tufted leather on a swivelling five-star base.',
    zones: [
      z('upholstery', 'Upholstery', 'leather', ['mid_century_lounge_chair__z1'], 0.0351),
      z('shell', 'Shell', 'wood', ['mid_century_lounge_chair__z0'], 0.1113),
      z('base', 'Base', 'metal', ['mid_century_lounge_chair__z2'], 0.3702),
    ],
  },
  {
    id: 'modern_arm_chair_01', name: 'Linea Armchair', cat: 'seating',
    blurb: 'Slender solid-wood frame with a deep, hand-stitched leather cushion.',
    zones: [
      z('upholstery', 'Upholstery', 'leather', ['modern_arm_chair_01_pillow'], 0.0078),
      z('frame', 'Frame', 'wood', ['modern_arm_chair_01_legs'], 0.123),
    ],
  },
  {
    id: 'ArmChair_01', name: 'Versailles Bergère', cat: 'seating',
    blurb: 'A hand-carved bergère with a generous seat — classical proportions, tailored upholstery.',
    zones: [
      z('upholstery', 'Upholstery', 'fabric', ['ArmChair_01__z0'], 0.3249),
      z('frame', 'Carved frame', 'wood', ['ArmChair_01__z1'], 0.0304),
    ],
  },
  {
    id: 'GreenChair_01', name: 'Royale Fauteuil', cat: 'seating',
    blurb: 'Louis-style fauteuil with scrolled arms and a crest-carved back.',
    zones: [
      z('upholstery', 'Upholstery', 'fabric', ['GreenChair_01__z0'], 0.0461),
      z('frame', 'Carved frame', 'wood', ['GreenChair_01__z1'], 0.0133),
    ],
  },
  {
    id: 'dining_chair_02', name: 'Chesterfield Dining Chair', cat: 'seating',
    blurb: 'Diamond-tufted high back with a scrolled crest — made for long dinners.',
    zones: [
      z('upholstery', 'Upholstery', 'leather', ['dining_chair_02__z0'], 0.0202),
      z('legs', 'Legs', 'wood', ['dining_chair_02__z1'], 0.0017),
    ],
  },
  {
    id: 'Ottoman_01', name: 'Cloud Ottoman', cat: 'seating',
    blurb: 'Pillow-soft stacked leather on turned feet; footrest, seat or side table.',
    zones: [
      z('upholstery', 'Upholstery', 'leather', ['Ottoman_01__z0', 'Ottoman_01__z1'], 0.031),
      z('feet', 'Feet', 'wood', ['Ottoman_01__z2'], 0.0181),
    ],
  },
  {
    id: 'chinese_armchair', name: 'Ming Scholar’s Chair', cat: 'seating',
    blurb: 'The “official’s hat” armchair — sweeping yoke rail in solid hardwood.',
    zones: [z('finish', 'Wood finish', 'wood', ['chinese_armchair'], 0.0293)],
  },
  {
    id: 'Rockingchair_01', name: 'Heritage Rocking Chair', cat: 'seating',
    blurb: 'Spindle-back rocker with steam-bent runners and a saddle seat.',
    zones: [z('finish', 'Wood finish', 'wood', ['Rockingchair_01'], 0.022)],
  },
  {
    id: 'bar_chair_round_01', name: 'Halden Bar Stool', cat: 'seating',
    blurb: 'Counter-height stool with a turned footring and a low curved back.',
    zones: [z('finish', 'Wood finish', 'wood', ['Bar Chair'], 0.0493)],
  },
  {
    id: 'sofa_02', name: 'Chesterfield Sofa', cat: 'sofas',
    blurb: 'Deep-buttoned rolled arms and a hand-finished hardwood plinth.',
    zones: [
      z('upholstery', 'Upholstery', 'leather', ['sofa_02__z0'], 0.0055),
      z('base', 'Base', 'wood', ['sofa_02__z1'], 0.0116),
    ],
  },
  {
    id: 'Sofa_01', name: 'Louis Settee', cat: 'sofas',
    blurb: 'A serpentine-backed settee with carved cabriole legs.',
    zones: [
      z('upholstery', 'Upholstery', 'fabric', ['Sofa_01__z0'], 0.2595),
      z('frame', 'Carved frame', 'wood', ['Sofa_01__z1'], 0.0077),
    ],
  },
  {
    id: 'sofa_03', name: 'Grand Salon Sofa', cat: 'sofas',
    blurb: 'An opulent three-seater with scatter cushions, fringing and carved show-wood.',
    zones: [
      z('upholstery', 'Upholstery', 'fabric', ['sofa_03__z1', 'sofa_03_fringe__z0', 'sofa_03_fringe__z1'], 0.08),
      z('frame', 'Show-wood', 'wood', ['sofa_03__z0'], 0.0405),
    ],
  },
  {
    id: 'GothicBed_01', name: 'Cathedral Bed', cat: 'bedroom',
    blurb: 'A four-post bed with tracery headboard, dressed in soft linen.',
    zones: [
      z('linen', 'Bed linen', 'fabric', ['GothicBed_01__z0'], 0.4923),
      z('frame', 'Bed frame', 'wood', ['GothicBed_01__z1'], 0.0143),
    ],
  },
  {
    id: 'ClassicNightstand_01', name: 'Baroque Nightstand', cat: 'bedroom',
    blurb: 'Open nightstand with acanthus carving and scrolled feet.',
    zones: [z('finish', 'Finish', 'wood', ['ClassicNightstand_01'], 0.0129)],
  },
  {
    id: 'GothicCommode_01', name: 'Abbey Chest of Drawers', cat: 'bedroom',
    blurb: 'Three deep drawers beneath arched tracery — two-tone by design.',
    zones: [
      z('carcass', 'Carcass', 'wood', ['GothicCommode_01__z1'], 0.0166),
      z('fronts', 'Drawer fronts', 'wood', ['GothicCommode_01__z0'], 0.0281),
    ],
  },
  {
    id: 'modern_wooden_cabinet', name: 'Atelier Sideboard', cat: 'storage',
    blurb: 'A long, low sideboard in solid timber with push-to-open doors.',
    zones: [z('finish', 'Wood finish', 'wood', ['modern_wooden_cabinet'], 0.0352)],
  },
  {
    id: 'wooden_display_shelves_01', name: 'Gallery Shelving', cat: 'storage',
    blurb: 'Open display cubbies with woven storage boxes below.',
    zones: [
      z('frame', 'Frame', 'wood', ['wooden_display_shelves_01__z0'], 0.2651),
      z('boxes', 'Storage boxes', 'fabric', ['wooden_display_shelves_01__z1'], 0.557),
    ],
  },
  {
    id: 'ClassicConsole_01', name: 'Régence Console', cat: 'storage',
    blurb: 'Pierced-apron console on cabriole legs — a hallway statement.',
    zones: [z('finish', 'Finish', 'lacquer', ['ClassicConsole_01'], 0.0086)],
  },
  {
    id: 'chinese_console_table', name: 'Dynasty Altar Console', cat: 'storage',
    blurb: 'Everted-end altar table with carved scroll panels.',
    zones: [z('finish', 'Wood finish', 'wood', ['chinese_console_table'], 0.051)],
  },
  {
    id: 'coffee_table_round_01', name: 'Orbit Marble Table', cat: 'tables',
    blurb: 'A floating stone disc on a looping metal ribbon base.',
    zones: [
      z('top', 'Top', 'stone', ['coffee_table_round_01__z0'], 0.4984),
      z('base', 'Base', 'metal', ['coffee_table_round_01__z1'], 0.0131),
    ],
  },
  {
    id: 'modern_coffee_table_01', name: 'Monolith Coffee Table', cat: 'tables',
    blurb: 'A cantilevered stone slab wrapped by a folded timber frame.',
    zones: [
      z('top', 'Top', 'stone', ['modern_coffee_table_01__z0'], 0.1469),
      z('frame', 'Frame', 'wood', ['modern_coffee_table_01__z1'], 0.19),
    ],
  },
  {
    id: 'modern_coffee_table_02', name: 'Lattice Coffee Table', cat: 'tables',
    blurb: 'A low block with a geometric timber lattice inlaid in its top.',
    zones: [
      z('body', 'Body', 'lacquer', ['modern_coffee_table_02_base'], 0.0113),
      z('inlay', 'Lattice inlay', 'wood', ['modern_coffee_table_02_wood'], 0.0384),
    ],
  },
  {
    id: 'CoffeeTable_01', name: 'Provence Coffee Table', cat: 'tables',
    blurb: 'Painted drawers framed by carved, gilded-edge timber.',
    zones: [
      z('paint', 'Painted top', 'lacquer', ['CoffeeTable_01__z0'], 0.3002),
      z('frame', 'Frame', 'wood', ['CoffeeTable_01__z1'], 0.1544),
    ],
  },
  {
    id: 'round_wooden_table_01', name: 'Pedestal Dining Table', cat: 'tables',
    blurb: 'A round table for four on a turned pedestal with splayed feet.',
    zones: [z('finish', 'Wood finish', 'wood', ['round_wooden_table_01'], 0.0171)],
  },
  {
    id: 'side_table_01', name: 'Cube Side Table', cat: 'tables',
    blurb: 'Two open shelves in a simple, solid-wood cube.',
    zones: [z('finish', 'Wood finish', 'wood', ['side_table_01'], 0.1473)],
  },
  {
    id: 'side_table_tall_01', name: 'Plinth Pedestal', cat: 'tables',
    blurb: 'A tall pedestal for a sculpture, lamp or orchid.',
    zones: [z('finish', 'Wood finish', 'wood', ['side_table_tall_01'], 0.0173)],
  },
  {
    id: 'metal_office_desk', name: 'Executive Desk', cat: 'office',
    blurb: 'A double-pedestal executive desk with a full-width worktop.',
    zones: [
      z('body', 'Body', 'lacquer', ['metal_office_desk__z1'], 0.082),
      z('top', 'Worktop', 'stone', ['metal_office_desk__z0'], 0.3685),
    ],
  },
  {
    id: 'outdoor_table_chair_set_01', name: 'Riviera Bistro Set', cat: 'office',
    blurb: 'A teak bistro table and folding chair for terraces and courtyards.',
    zones: [
      z('chair', 'Chair', 'wood', ['outdoor_table_chair_set_01_chair'], 0.1768),
      z('table', 'Table', 'wood', ['outdoor_table_chair_set_01_table'], 0.203),
    ],
  },
];

export const PIECE_MAP = Object.fromEntries(PIECES.map((p) => [p.id, p]));
export const thumb = (id) => `/thumbs/${id}.webp`;

export const finishOf = (zone, key) => PALETTES[zone.type].items.find((f) => f.key === key) || PALETTES[zone.type].items[0];

/* Per-piece starting finishes. Kept empty on purpose: every piece opens in its
   Signature (original) finish so the 3D view matches its thumbnail in the grid
   (thumbnails are rendered from the untouched models). */
export const DEFAULTS = {};

export const defaultFinishes = (piece) => {
  const d = DEFAULTS[piece.id] || {};
  return Object.fromEntries(piece.zones.map((zn) => [zn.key, d[zn.key] || 'original']));
};

export const specText = (piece, finishes) =>
  `${piece.name} — ${piece.zones.map((zn) => `${zn.label}: ${finishOf(zn, finishes[zn.key]).name}`).join(', ')}`;
