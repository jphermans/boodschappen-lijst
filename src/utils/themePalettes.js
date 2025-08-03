// Beautiful theme palettes inspired by ColorHunt.co popular palettes
// Each theme includes both dark and light mode variants

export const themePalettes = [
  {
    key: 'ocean-breeze',
    name: 'Ocean Breeze',
    description: 'Calming ocean-inspired blues and teals',
    colors: {
      primary: '52 152 219',      // #3498db (bright blue)
      secondary: '26 188 156',    // #1abc9c (turquoise)
      accent: '155 89 182',       // #9b59b6 (purple)
      background: '44 62 80',     // #2c3e50 (dark blue-gray)
      surface: '52 73 94',        // #34495e (lighter blue-gray)
      text: '236 240 241',        // #ecf0f1 (light gray)
      textSecondary: '189 195 199', // #bdc3c7 (medium gray)
      success: '46 204 113',      // #2ecc71 (emerald)
      warning: '241 196 15',      // #f1c40f (yellow)
      error: '231 76 60',         // #e74c3c (red)
      info: '52 152 219'          // #3498db (blue)
    },
    lightMode: {
      primary: '41 128 185',      // #2980b9 (darker blue)
      secondary: '22 160 133',    // #16a085 (darker turquoise)
      accent: '142 68 173',       // #8e44ad (darker purple)
      background: '236 240 241',  // #ecf0f1 (light gray)
      surface: '255 255 255',     // #ffffff (white)
      text: '44 62 80',           // #2c3e50 (dark blue-gray)
      textSecondary: '127 140 141' // #7f8c8d (gray)
    }
  },
  {
    key: 'sunset-glow',
    name: 'Sunset Glow',
    description: 'Warm sunset colors with orange and pink tones',
    colors: {
      primary: '255 107 107',     // #ff6b6b (coral red)
      secondary: '255 159 67',    // #ff9f43 (orange)
      accent: '255 107 129',      // #ff6b81 (pink)
      background: '47 54 64',     // #2f3640 (dark gray)
      surface: '64 75 88',        // #404b58 (lighter gray)
      text: '255 255 255',        // #ffffff (white)
      textSecondary: '223 230 233', // #dfe6e9 (light gray)
      success: '85 239 196',      // #55efc4 (mint)
      warning: '253 203 110',     // #fdcb6e (yellow)
      error: '255 107 107',       // #ff6b6b (coral)
      info: '116 185 255'         // #74b9ff (blue)
    },
    lightMode: {
      primary: '214 48 49',       // #d63031 (darker red)
      secondary: '230 126 34',    // #e67e22 (darker orange)
      accent: '253 121 168',      // #fd79a8 (pink)
      background: '253 251 251',  // #fdfbfb (off-white)
      surface: '255 255 255',     // #ffffff (white)
      text: '47 54 64',           // #2f3640 (dark gray)
      textSecondary: '99 110 114' // #636e72 (medium gray)
    }
  },
  {
    key: 'forest-mint',
    name: 'Forest Mint',
    description: 'Fresh forest greens with mint accents',
    colors: {
      primary: '85 239 196',      // #55efc4 (mint)
      secondary: '0 184 148',     // #00b894 (emerald)
      accent: '129 236 236',      // #81ecec (cyan)
      background: '45 52 54',     // #2d3436 (dark green-gray)
      surface: '99 110 114',      // #636e72 (medium gray)
      text: '253 251 251',        // #fdfbfb (off-white)
      textSecondary: '223 230 233', // #dfe6e9 (light gray)
      success: '0 184 148',       // #00b894 (emerald)
      warning: '253 203 110',     // #fdcb6e (yellow)
      error: '255 107 107',       // #ff6b6b (coral)
      info: '116 185 255'         // #74b9ff (blue)
    },
    lightMode: {
      primary: '0 150 136',       // #009688 (teal)
      secondary: '76 175 80',     // #4caf50 (green)
      accent: '0 188 212',        // #00bcd4 (cyan)
      background: '245 245 245',  // #f5f5f5 (light gray)
      surface: '255 255 255',     // #ffffff (white)
      text: '33 37 41',           // #212529 (dark)
      textSecondary: '108 117 125' // #6c757d (gray)
    }
  },
  {
    key: 'lavender-dream',
    name: 'Lavender Dream',
    description: 'Soft purples and pinks with dreamy pastels',
    colors: {
      primary: '162 155 254',     // #a29bfe (light purple)
      secondary: '253 121 168',   // #fd79a8 (pink)
      accent: '255 118 117',      // #ff7675 (coral)
      background: '45 52 54',     // #2d3436 (dark gray)
      surface: '99 110 114',      // #636e72 (medium gray)
      text: '253 251 251',        // #fdfbfb (off-white)
      textSecondary: '223 230 233', // #dfe6e9 (light gray)
      success: '85 239 196',      // #55efc4 (mint)
      warning: '253 203 110',     // #fdcb6e (yellow)
      error: '255 118 117',       // #ff7675 (coral)
      info: '116 185 255'         // #74b9ff (blue)
    },
    lightMode: {
      primary: '124 77 255',      // #7c4dff (deep purple)
      secondary: '233 30 99',     // #e91e63 (pink)
      accent: '255 64 129',       // #ff4081 (hot pink)
      background: '250 250 250',  // #fafafa (light gray)
      surface: '255 255 255',     // #ffffff (white)
      text: '33 33 33',           // #212121 (dark)
      textSecondary: '117 117 117' // #757575 (gray)
    }
  },
  {
    key: 'golden-hour',
    name: 'Golden Hour',
    description: 'Warm golden yellows and rich browns',
    colors: {
      primary: '255 193 7',       // #ffc107 (amber)
      secondary: '255 152 0',     // #ff9800 (orange)
      accent: '255 87 34',        // #ff5722 (deep orange)
      background: '62 39 35',     // #3e2723 (dark brown)
      surface: '93 64 55',        // #5d4037 (medium brown)
      text: '255 248 225',        // #fff8e1 (cream)
      textSecondary: '255 224 178', // #ffe0b2 (light orange)
      success: '139 195 74',      // #8bc34a (light green)
      warning: '255 193 7',       // #ffc107 (amber)
      error: '244 67 54',         // #f44336 (red)
      info: '33 150 243'          // #2196f3 (blue)
    },
    lightMode: {
      primary: '255 143 0',       // #ff8f00 (dark orange)
      secondary: '230 81 0',      // #e65100 (darker orange)
      accent: '191 54 12',        // #bf360c (deep red-orange)
      background: '255 253 245',  // #fffdf5 (cream)
      surface: '255 255 255',     // #ffffff (white)
      text: '62 39 35',           // #3e2723 (dark brown)
      textSecondary: '121 85 72'  // #795548 (brown)
    }
  },
  {
    key: 'midnight-blue',
    name: 'Midnight Blue',
    description: 'Deep blues with silver accents for elegance',
    colors: {
      primary: '63 81 181',       // #3f51b5 (indigo)
      secondary: '103 58 183',    // #673ab7 (deep purple)
      accent: '156 39 176',       // #9c27b0 (purple)
      background: '21 32 43',     // #15202b (dark blue)
      surface: '32 47 60',        // #202f3c (medium blue)
      text: '255 255 255',        // #ffffff (white)
      textSecondary: '176 190 197', // #b0bec5 (blue gray)
      success: '76 175 80',       // #4caf50 (green)
      warning: '255 193 7',       // #ffc107 (amber)
      error: '244 67 54',         // #f44336 (red)
      info: '33 150 243'          // #2196f3 (blue)
    },
    lightMode: {
      primary: '48 63 159',       // #303f9f (dark indigo)
      secondary: '81 45 168',     // #512da8 (dark purple)
      accent: '123 31 162',       // #7b1fa2 (dark purple)
      background: '245 245 245',  // #f5f5f5 (light gray)
      surface: '255 255 255',     // #ffffff (white)
      text: '33 33 33',           // #212121 (dark)
      textSecondary: '97 97 97'   // #616161 (gray)
    }
  },
  {
    key: 'cherry-blossom',
    name: 'Cherry Blossom',
    description: 'Soft pinks and whites inspired by spring',
    colors: {
      primary: '255 182 193',     // #ffb6c1 (light pink)
      secondary: '255 105 180',   // #ff69b4 (hot pink)
      accent: '219 112 147',      // #db7093 (pale violet red)
      background: '47 47 47',     // #2f2f2f (dark gray)
      surface: '64 64 64',        // #404040 (medium gray)
      text: '255 255 255',        // #ffffff (white)
      textSecondary: '192 192 192', // #c0c0c0 (silver)
      success: '144 238 144',     // #90ee90 (light green)
      warning: '255 215 0',       // #ffd700 (gold)
      error: '255 99 71',         // #ff6347 (tomato)
      info: '135 206 235'         // #87ceeb (sky blue)
    },
    lightMode: {
      primary: '199 21 133',      // #c71585 (medium violet red)
      secondary: '255 20 147',    // #ff1493 (deep pink)
      accent: '186 85 211',       // #ba55d3 (medium orchid)
      background: '255 240 245',  // #fff0f5 (lavender blush)
      surface: '255 255 255',     // #ffffff (white)
      text: '47 47 47',           // #2f2f2f (dark gray)
      textSecondary: '105 105 105' // #696969 (dim gray)
    }
  },
  {
    key: 'arctic-frost',
    name: 'Arctic Frost',
    description: 'Cool whites and icy blues for a clean look',
    colors: {
      primary: '70 130 180',      // #4682b4 (steel blue)
      secondary: '95 158 160',    // #5f9ea0 (cadet blue)
      accent: '176 196 222',      // #b0c4de (light steel blue)
      background: '25 25 25',     // #191919 (very dark gray)
      surface: '45 45 45',        // #2d2d2d (dark gray)
      text: '248 248 255',        // #f8f8ff (ghost white)
      textSecondary: '220 220 220', // #dcdcdc (gainsboro)
      success: '32 178 170',      // #20b2aa (light sea green)
      warning: '255 215 0',       // #ffd700 (gold)
      error: '220 20 60',         // #dc143c (crimson)
      info: '30 144 255'          // #1e90ff (dodger blue)
    },
    lightMode: {
      primary: '25 25 112',       // #191970 (midnight blue)
      secondary: '72 61 139',     // #483d8b (dark slate blue)
      accent: '106 90 205',       // #6a5acd (slate blue)
      background: '248 248 255',  // #f8f8ff (ghost white)
      surface: '255 255 255',     // #ffffff (white)
      text: '25 25 25',           // #191919 (very dark gray)
      textSecondary: '105 105 105' // #696969 (dim gray)
    }
  }
];