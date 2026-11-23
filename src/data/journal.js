// Insights & Inspiration — article topics from the website content package.
// Body copy is draft editorial content for the client to review.

export const articles = [
  {
    slug: 'luxury-interior-trends',
    image: 'residential',
    category: 'Luxury Interior Trends',
    title: 'Quiet Luxury: The Interiors Defining the Next Decade',
    excerpt: 'Restraint, texture and craftsmanship are replacing logos and excess. Here is how quiet luxury translates into furniture.',
    minutes: 5,
    model: 'sofa',
    body: [
      'Luxury interiors are moving away from statement-for-statement’s-sake. The rooms that feel most expensive today are often the calmest: a considered palette, generous proportions and materials that reward a second look.',
      'In furniture, that means silhouettes with soft, rounded geometry, deep seat cushions and frames that sit low and wide. Bouclé, velvet and full-grain leather bring tactility, while brushed brass and champagne-gold details add warmth without shouting.',
      'Colour is grounded — stone, sand, espresso and olive — with a single saturated accent such as emerald or oxblood. The effect is a room that feels collected rather than bought in one go.',
      'The principle we return to is simple: luxury is not just seen, it is experienced. Choose fewer pieces, choose them well, and let the craftsmanship speak.',
    ],
  },
  {
    slug: 'craftsmanship-and-materials',
    image: 'fabric',
    category: 'Craftsmanship & Materials',
    title: 'Reading a Piece of Furniture: Frames, Fabrics & Finishes',
    excerpt: 'What separates heirloom-quality furniture from the ordinary? A guide to the details worth asking about.',
    minutes: 6,
    model: 'armchair',
    body: [
      'Great furniture starts where you can’t see it. The frame determines how a sofa or chair ages — how it holds its shape, how it handles daily use and whether it can be reupholstered years from now.',
      'Upholstery is next. Cushion construction affects comfort over time, and the choice of fabric or leather determines how a piece wears. Performance fabrics suit busy family rooms and hospitality; natural fibres and full-grain leathers develop character with age.',
      'Finishes complete the story: hand-applied lacquers, natural stone tops, solid-wood veneers and metal details that are plated or brushed with care. Ask about each layer — a reputable supplier will be happy to explain.',
      'At Dapoco we specify every piece with this checklist in mind, so that what arrives in your home or project is built to last as long as it is admired.',
    ],
  },
  {
    slug: 'hospitality-design-insights',
    image: 'suite-sculpt',
    category: 'Hospitality Design Insights',
    title: 'Designing Guest Rooms That Feel Like a Private Residence',
    excerpt: 'Five-star guests expect a sense of home — with the durability a hotel demands. Balancing both is an art.',
    minutes: 4,
    model: 'bed',
    body: [
      'The best hotel rooms make guests forget they are in a hotel. Upholstered headboards, warm lighting and a proper lounge chair do more for a guest’s experience than any amount of décor.',
      'Behind the scenes, every piece has to work harder than residential furniture: commercial-grade frames, cleanable fabrics, protected edges and finishes that withstand constant turnover.',
      'A consistent material story — one wood tone, one metal, a curated set of fabrics — makes rooms feel designed while keeping maintenance and replacements simple.',
      'From beds and nightstands to mini-bar cabinets and vanity units, we source complete room packages that balance residential warmth with hospitality durability.',
    ],
  },
  {
    slug: 'executive-spaces',
    image: 'executive',
    category: 'Office Luxury & Executive Spaces',
    title: 'The Executive Office as a Statement of Leadership',
    excerpt: 'An executive suite communicates before anyone speaks. How to design one that projects presence and supports focus.',
    minutes: 4,
    model: 'executive',
    body: [
      'The executive office is part workspace, part meeting room and part brand statement. The desk anchors it: substantial, beautifully finished and organised enough to keep the surface clear.',
      'Seating matters as much as the desk. An executive chair should combine posture support with a refined silhouette, while visitor chairs set the tone for every conversation held in the room.',
      'Storage — credenzas, display shelving and cabinets — keeps the space calm, and a small lounge setting creates room for less formal discussions.',
      'Our executive collections pair premium veneers, stone and leather with ergonomic engineering, so leaders can work well and host with confidence.',
    ],
  },
  {
    slug: 'sustainable-luxury',
    image: 'wood',
    category: 'Sustainability in Luxury Furniture',
    title: 'Sustainable Luxury: Why the Longest-Lasting Piece Wins',
    excerpt: 'The most sustainable furniture is the piece you never need to replace. Luxury and responsibility can coexist.',
    minutes: 5,
    model: 'decor',
    body: [
      'Sustainability in furniture is often framed as a trade-off. We see it differently: well-made furniture that lasts for decades is inherently the more responsible choice.',
      'Responsible sourcing starts with partners — manufacturers who follow responsible production practices and use certified woods, low-impact finishes and recyclable packaging wherever possible.',
      'Timeless design matters too. Pieces that are not tied to a passing trend stay in use longer, can be reupholstered or refinished, and often find a second life rather than landfill.',
      'Elegance with responsibility is the standard we hold ourselves to — beautiful today, and built for tomorrow.',
    ],
  },
];

export const findArticle = (slug) => articles.find((a) => a.slug === slug);
