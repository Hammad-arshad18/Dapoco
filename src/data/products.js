// Complete product range from the "Comprehensive Product List" and
// "Product List with Descriptions" documents.

export const categories = [
  {
    slug: 'office-furniture',
    image: 'executive',
    banner: 'boardroom',
    scene: 'office',
    n: '01',
    title: 'Office Furniture',
    tagline: 'Where Executive Presence Meets Functional Elegance',
    model: 'executive',
    intro:
      'Prestigious desks, ergonomic seating and complete boardroom settings — modern, productivity-enhancing solutions for today’s evolving workplaces.',
    highlights: [
      { title: 'Executive Desks', text: 'Premium desks designed for leadership spaces, featuring high-quality materials, elegant finishes, and ample storage for a professional workspace.' },
      { title: 'Workstations & Cubicles', text: 'Modular workstation systems built for productivity, offering privacy, cable management, and customizable layouts for teams of any size.' },
      { title: 'Office Chairs', text: 'Ergonomic seating options including executive, task, and visitor chairs, designed to support comfort and posture throughout the workday.' },
      { title: 'Reception Desks', text: 'Modern reception counters that create a strong first impression, combining functionality with stylish design.' },
    ],
    groups: [
      { name: 'Desks & Workstations', items: ['Executive Desks (wood, veneer, metal frame, L-shape, U-shape)', 'Manager Desks', 'Staff Desks', 'Height-Adjustable Desks', 'Modular Workstations (2, 4 & 6-person clusters)', 'Bench-Style Workstations', 'Computer Desks', 'Reception Desks & Counters'] },
      { name: 'Office Seating', items: ['Executive Office Chairs', 'Ergonomic Task Chairs', 'Mesh Back Chairs', 'Visitor Chairs', 'Conference Room Chairs', 'Training Room Chairs', 'Bar-Height Office Stools', 'Lounge & Waiting Area Chairs'] },
      { name: 'Meeting & Collaboration', items: ['Conference Tables (rectangular, oval, boat-shape)', 'Meeting Room Tables', 'Training Tables (foldable, mobile)', 'Collaborative Pods & Acoustic Booths', 'Whiteboards & Presentation Boards'] },
      { name: 'Storage Solutions', items: ['Filing Cabinets (2, 3 & 4-drawer)', 'Mobile Pedestals', 'Wooden Storage Cabinets', 'Metal Storage Cabinets', 'Lockers (steel, ABS, digital lock)', 'Bookshelves & Display Shelves', 'Credenzas'] },
      { name: 'Office Accessories', items: ['Monitor Arms', 'Cable Management Systems', 'Partition Screens', 'Desk Organizers', 'Coat Stands'] },
    ],
  },
  {
    slug: 'home-furniture',
    image: 'residential',
    banner: 'living-olive',
    scene: 'home',
    n: '02',
    title: 'Home Furniture',
    tagline: 'Luxury Living, Crafted for Modern Lifestyles',
    model: 'sofa',
    intro:
      'Stylish, durable and thoughtfully designed pieces that turn villas, penthouses and residences into homes — from the living room to the bedroom.',
    highlights: [
      { title: 'Sofas & Sectionals', text: 'Comfortable and stylish seating options available in fabric, leather, and modular designs to suit any home interior.' },
      { title: 'Beds', text: 'Sturdy and elegant bed frames in King, Queen and Single sizes and multiple finishes to match your bedroom style.' },
      { title: 'Dining Tables', text: 'Durable dining tables in wood, glass, and marble finishes, suitable for families and gatherings.' },
      { title: 'Recliners & Lounge Chairs', text: 'Relaxation seating designed for comfort, support, and style.' },
    ],
    groups: [
      { name: 'Living Room', items: ['Sofas (fabric, leather, sectional, recliner)', 'Sofa Beds', 'Armchairs & Lounge Chairs', 'Coffee Tables', 'Side Tables', 'TV Units & Media Consoles', 'Display Cabinets', 'Bookshelves', 'Nesting Tables'] },
      { name: 'Bedroom', items: ['Bed Frames (King, Queen, Single)', 'Upholstered Beds', 'Storage Beds', 'Wardrobes (hinged, sliding, walk-in)', 'Dressers & Mirrors', 'Bedside Tables', 'Chest of Drawers', 'Mattresses (spring, memory foam, hybrid)', 'Bedroom Benches'] },
      { name: 'Dining Room', items: ['Dining Tables (wood, marble, glass)', 'Dining Chairs', 'Dining Benches', 'Sideboards & Buffets', 'Bar Tables', 'Bar Stools', 'Wine Cabinets'] },
      { name: 'Home Office', items: ['Compact Desks', 'Study Chairs', 'Bookshelves', 'Filing Units'] },
    ],
  },
  {
    slug: 'hospitality-commercial',
    image: 'suite',
    banner: 'lobby',
    scene: 'hospitality',
    n: '03',
    title: 'Hospitality & Commercial',
    tagline: 'Designed for Five-Star Experiences',
    model: 'bed',
    intro:
      'Premium furnishings for hotels, resorts, restaurants, cafés, lounges and event venues — crafted for heavy use and an unforgettable guest experience.',
    highlights: [
      { title: 'Hotel Room Furniture', text: 'Complete room sets including beds, nightstands, desks, and wardrobes designed for durability and comfort.' },
      { title: 'Restaurant Tables & Chairs', text: 'Commercial-grade dining furniture built for heavy use while maintaining style and comfort.' },
      { title: 'Banquet Chairs & Tables', text: 'Stackable, lightweight, and durable options ideal for events, halls, and conference venues.' },
      { title: 'Lobby Sofas', text: 'Elegant seating solutions that enhance the look and comfort of hotel lobbies and waiting areas.' },
    ],
    groups: [
      { name: 'Hotel Furniture', items: ['Hotel Beds & Headboards', 'Nightstands', 'Writing Desks', 'Luggage Racks', 'Wardrobes', 'TV Consoles', 'Mini-Bar Cabinets', 'Vanity Units', 'Hotel Sofas & Lounge Chairs'] },
      { name: 'Restaurant & Café', items: ['Dining Tables (indoor/outdoor)', 'Dining Chairs', 'Booth Seating', 'Bar Counters', 'Bar Stools', 'High Tables', 'Outdoor Bistro Sets'] },
      { name: 'Banquet & Event', items: ['Banquet Chairs (stackable, cushioned, steel/aluminium)', 'Banquet Tables (round, rectangular, foldable)', 'Podiums & Lecterns', 'Stage Platforms', 'Trolleys for Chairs & Tables'] },
      { name: 'Lobby & Public Areas', items: ['Lobby Sofas', 'Lounge Chairs', 'Coffee Tables', 'Reception Counters', 'Waiting Benches'] },
    ],
  },
  {
    slug: 'outdoor-furniture',
    image: 'courtyard',
    banner: 'courtyard',
    scene: 'outdoor',
    n: '04',
    title: 'Outdoor Furniture',
    tagline: 'Crafted for Luxury Outdoor Living',
    model: 'lounger',
    intro:
      'Weather-resistant seating, dining and shade made to withstand sun, moisture and daily use — for terraces, gardens, poolsides and resorts.',
    highlights: [
      { title: 'Patio Sets', text: 'Complete outdoor seating sets designed for relaxation and entertainment.' },
      { title: 'Sun Loungers', text: 'Comfortable loungers perfect for poolsides, gardens, and resorts.' },
      { title: 'Outdoor Sofas', text: 'Modern outdoor seating built to withstand sun, moisture, and daily use.' },
      { title: 'Umbrellas & Gazebos', text: 'Shade solutions for outdoor comfort and protection.' },
    ],
    groups: [
      { name: 'Outdoor Seating', items: ['Outdoor Sofas', 'Patio Chairs', 'Sun Loungers', 'Hammocks', 'Swing Chairs'] },
      { name: 'Outdoor Tables', items: ['Dining Tables', 'Coffee Tables', 'Side Tables'] },
      { name: 'Outdoor Sets', items: ['Patio Sets (2, 4 & 6-seater)', 'Garden Sofa Sets', 'Bistro Sets'] },
      { name: 'Shade & Protection', items: ['Umbrellas', 'Gazebos', 'Pergolas'] },
      { name: 'Outdoor Accessories', items: ['Outdoor Cushions', 'Planters', 'Outdoor Storage Boxes'] },
    ],
  },
  {
    slug: 'educational-institutional',
    image: 'library',
    banner: 'library',
    scene: 'education',
    n: '05',
    title: 'Educational & Institutional',
    tagline: 'Durable, Functional & Ergonomically Designed',
    model: 'student',
    intro:
      'Furniture that supports learning and focus — for schools, universities, libraries and training centres.',
    highlights: [
      { title: 'Student Desks', text: 'Functional desks designed to support learning and creativity.' },
      { title: 'Lecture Hall Seating', text: 'Durable, ergonomic seating configured for auditoriums and lecture halls.' },
    ],
    groups: [
      { name: 'School Furniture', items: ['Student Desks', 'Classroom Chairs', 'Teacher Desks', 'Whiteboards & Notice Boards', 'Storage Cabinets'] },
      { name: 'University & Training Centres', items: ['Lecture Hall Seating', 'Training Desks', 'Auditorium Chairs', 'Library Furniture'] },
    ],
  },
  {
    slug: 'healthcare-furniture',
    image: 'clinic',
    banner: 'clinic',
    scene: 'healthcare',
    n: '06',
    title: 'Healthcare Furniture',
    tagline: 'Comfort, Hygiene & Professional Functionality',
    model: 'recliner',
    intro:
      'Professional furniture for hospitals and clinics, balancing patient comfort with hygiene and day-to-day practicality.',
    highlights: [
      { title: 'Recliner Chairs', text: 'Supportive recliners for patient rooms, treatment areas and recovery spaces.' },
      { title: 'Waiting Room Chairs', text: 'Comfortable, easy-to-clean seating for reception and waiting areas.' },
    ],
    groups: [
      { name: 'Hospital & Clinic Furniture', items: ['Hospital Beds', 'Examination Tables', 'Waiting Room Chairs', 'Bedside Cabinets', 'Medical Trolleys', 'Recliner Chairs'] },
    ],
  },
  {
    slug: 'storage-shelving',
    image: 'wardrobe',
    banner: 'wardrobe',
    scene: 'storage',
    n: '07',
    title: 'Storage & Shelving Systems',
    tagline: 'Smart Storage for Residential & Commercial Spaces',
    model: 'shelf',
    intro:
      'From elegant wooden cabinets to heavy-duty racking — storage that keeps homes, offices and warehouses beautifully organised.',
    highlights: [
      { title: 'Wooden Cabinets', text: 'Elegant storage units crafted from high-quality wood for home or office use.' },
      { title: 'Metal Storage Units', text: 'Heavy-duty storage ideal for warehouses, offices, and commercial spaces.' },
      { title: 'Bookshelves', text: 'Open shelving units for books, décor, and display items.' },
      { title: 'Modular Shelving Systems', text: 'Customizable shelving solutions for flexible storage needs.' },
    ],
    groups: [
      { name: 'Residential Storage', items: ['Wardrobes', 'Shoe Cabinets', 'Bookshelves', 'Storage Benches'] },
      { name: 'Commercial Storage', items: ['Metal Shelving Units', 'Heavy-Duty Racks', 'Mobile Shelving', 'Archive Storage Systems'] },
    ],
  },
  {
    slug: 'kids-furniture',
    image: 'kids',
    banner: 'kids',
    scene: 'kids',
    n: '08',
    title: 'Kids’ Furniture',
    tagline: 'Safe, Stylish & Built for Growing Minds',
    model: 'kids',
    intro:
      'Playful, safe and durable pieces made with child-friendly materials and sizes — for bedrooms, study corners and playrooms.',
    highlights: [
      { title: 'Kids’ Beds', text: 'Safe and colorful bed designs suitable for children of all ages.' },
      { title: 'Kids’ Chairs', text: 'Comfortable seating made with child-friendly materials and sizes.' },
      { title: 'Toy Storage Units', text: 'Organized storage solutions to keep play areas tidy.' },
    ],
    groups: [
      { name: 'Kids’ Bedroom', items: ['Kids’ Beds', 'Bunk Beds', 'Study Desks', 'Kids’ Chairs', 'Toy Storage Units'] },
      { name: 'Playroom Furniture', items: ['Activity Tables', 'Soft Seating', 'Bookshelves'] },
    ],
  },
  {
    slug: 'decor-accessories',
    image: 'decor',
    banner: 'lamp',
    scene: 'decor',
    n: '09',
    title: 'Décor & Accessories',
    tagline: 'Finishing Touches That Define Luxury',
    model: 'decor',
    intro:
      'Rugs, lighting, mirrors and sculptural objects — the details that complete a room and give it a personality of its own.',
    highlights: [
      { title: 'Lighting', text: 'Floor lamps, table lamps, and decorative lighting to brighten and elevate interiors.' },
      { title: 'Rugs & Carpets', text: 'Soft and stylish floor coverings that enhance any room’s ambiance.' },
      { title: 'Mirrors', text: 'Functional and decorative mirrors available in various shapes and sizes.' },
      { title: 'Cushions & Throws', text: 'Soft accessories that add comfort, color, and texture to your furniture.' },
    ],
    groups: [
      { name: 'Soft Furnishings', items: ['Rugs & Carpets', 'Cushions & Throws', 'Curtains & Blinds'] },
      { name: 'Decorative Items', items: ['Wall Art', 'Mirrors', 'Clocks', 'Vases & Sculptures'] },
      { name: 'Lighting', items: ['Floor Lamps', 'Table Lamps', 'Pendant Lights', 'Wall Lights'] },
    ],
  },
  {
    slug: 'custom-made',
    image: 'atelier',
    banner: 'fabric',
    scene: 'bespoke',
    n: '10',
    title: 'Custom-Made Furniture',
    tagline: 'Bespoke Creations Tailored to Your Vision',
    model: 'armchair',
    intro:
      'Every bespoke piece is crafted using premium materials, exclusive finishes, and meticulous detailing — designed to reflect your identity and elevate your space.',
    highlights: [
      { title: 'Your Specification', text: 'Dimensions, materials and finishes defined around your space and vision.' },
      { title: 'Exclusive Finishes', text: 'Premium fabrics, leathers, veneers, stone and metal finishes.' },
    ],
    groups: [
      { name: 'Bespoke Creations', items: ['Custom Office Desks', 'Custom Cabinets', 'Custom Hotel Furniture', 'Custom Retail Counters', 'Custom Upholstery'] },
    ],
  },
];

export const totalProducts = categories.reduce(
  (sum, c) => sum + c.groups.reduce((s, g) => s + g.items.length, 0),
  0,
);

export const findCategory = (slug) => categories.find((c) => c.slug === slug);
