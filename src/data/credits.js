// Photography: Unsplash (free Unsplash License). 3D models & HDRI: Poly Haven (CC0).
export const img = (k, size = '') => `/images/${k}${size === 'sm' ? '-sm' : ''}.webp`;
export const imgSet = (k) => `/images/${k}-sm.webp 900w, /images/${k}.webp 2000w`;

export const photoCredits = {
  residential: 'https://unsplash.com/photos/modern-living-room-with-a-cream-sofa-and-coffee-tables-XWRW66qiRp8',
  lounge: 'https://unsplash.com/photos/modern-hotel-lobby-with-designer-furniture-and-wood-walls-zSG-kd-L6vw',
  'living-olive': 'https://unsplash.com/photos/a-living-room-with-a-large-green-couch-VZ2z8ozzy10',
  boardroom: 'https://unsplash.com/photos/VG7bfI6YrT4',
  executive: 'https://unsplash.com/photos/UPnF1esOuWw',
  suite: 'https://unsplash.com/photos/pt3skDb2PLw',
  'suite-sculpt': 'https://unsplash.com/photos/WWYF8Lts8Ho',
  lobby: 'https://unsplash.com/photos/modern-lounge-area-with-contemporary-furniture-and-large-windows-yGEohCLnrl0',
  'lobby-grand': 'https://unsplash.com/photos/a-grand-hotel-lobby-filled-with-sunlight-SXePqzrArfY',
  atelier: 'https://unsplash.com/photos/a-man-working-on-a-leather-chair-in-a-shop-35sxh3UgL-s',
  carving: 'https://unsplash.com/photos/a-man-is-working-on-a-piece-of-wood-58bw-DFgqX4',
  fabric: 'https://unsplash.com/photos/brown-fabric-sofa-Y2k744FA5bg',
  courtyard: 'https://unsplash.com/photos/modern-courtyard-with-swimming-pool-and-lounge-chairs-qrCBfSB5uB8',
  library: 'https://unsplash.com/photos/books-on-shelves-in-a-modern-library-reading-area-kmVR1xWdSxs',
  clinic: 'https://unsplash.com/photos/people-waiting-in-a-hallway-with-chairs-and-chairs-rqdWlkRzerg',
  wardrobe: 'https://unsplash.com/photos/a-walk-in-closet-with-shelves-drawers-and-a-suitcase-qlAWpiUiFyc',
  kids: 'https://unsplash.com/photos/cozy-childs-bedroom-with-bed-and-desk-iSO22I2l5uc',
  lamp: 'https://unsplash.com/photos/black-and-brown-table-lamp-KqgkVv0UzqE',
  decor: 'https://unsplash.com/photos/a-golden-vase-with-green-plants-on-a-red-table-0G_vLnOKVbI',
  dining: 'https://unsplash.com/photos/a-dining-room-with-a-table-chairs-and-a-chandelier-K_Ij57GTXWY',
  dubai: 'https://unsplash.com/photos/a-view-of-a-city-at-night-from-the-top-of-a-skyscraper-6Xg267sypu8',
  wood: 'https://unsplash.com/photos/brown-wooden-slab-2SNC9jVruBc',
};
