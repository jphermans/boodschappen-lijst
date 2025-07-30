// Comprehensive theme palettes from popular color schemes
// Based on iTerm2 color schemes and popular VS Code themes

export const themePalettes = [
  {
    key: 'gruvbox',
    name: 'Gruvbox',
    description: 'Retro groove color scheme',
    colors: {
      primary: '254 128 25',      // #fe8019 (orange)
      secondary: '184 187 38',    // #b8bb26 (green)
      accent: '251 73 52',        // #fb4934 (red)
      background: '40 40 40',     // #282828 (dark)
      surface: '60 56 54',        // #3c3836 (dark1)
      text: '235 219 178',        // #ebdbb2 (light)
      textSecondary: '168 153 132', // #a89984 (light2)
      success: '184 187 38',      // #b8bb26 (green)
      warning: '250 189 47',      // #fabd2f (yellow)
      error: '251 73 52',         // #fb4934 (red)
      info: '131 165 152'         // #83a598 (blue)
    },
    lightMode: {
      primary: '175 58 3',        // #af3a03 (orange)
      secondary: '121 116 14',    // #79740e (green)
      accent: '157 0 6',          // #9d0006 (red)
      background: '251 241 199',  // #fbf1c7 (light)
      surface: '242 229 188',     // #f2e5bc (light1)
      text: '60 56 54',           // #3c3836 (dark)
      textSecondary: '102 92 84'  // #665c54 (gray)
    }
  },
  {
    key: 'solarized',
    name: 'Solarized',
    description: 'Precision colors for machines and people',
    colors: {
      primary: '38 139 210',      // #268bd2 (blue)
      secondary: '133 153 0',     // #859900 (green)
      accent: '220 50 47',        // #dc322f (red)
      background: '0 43 54',      // #002b36 (base03)
      surface: '7 54 66',         // #073642 (base02)
      text: '131 148 150',        // #839496 (base0)
      textSecondary: '101 123 131', // #586e75 (base01)
      success: '133 153 0',       // #859900 (green)
      warning: '181 137 0',       // #b58900 (yellow)
      error: '220 50 47',         // #dc322f (red)
      info: '38 139 210'          // #268bd2 (blue)
    },
    lightMode: {
      primary: '38 139 210',      // #268bd2 (blue)
      secondary: '133 153 0',     // #859900 (green)
      accent: '220 50 47',        // #dc322f (red)
      background: '253 246 227',  // #fdf6e3 (base3)
      surface: '238 232 213',     // #eee8d5 (base2)
      text: '101 123 131',        // #586e75 (base01)
      textSecondary: '131 148 150' // #839496 (base0)
    }
  },
  {
    key: 'dracula',
    name: 'Dracula',
    description: 'Dark theme for the cool kids',
    colors: {
      primary: '189 147 249',     // #bd93f9 (purple)
      secondary: '80 250 123',    // #50fa7b (green)
      accent: '255 85 85',        // #ff5555 (red)
      background: '40 42 54',     // #282a36 (background)
      surface: '68 71 90',        // #44475a (current line)
      text: '248 248 242',        // #f8f8f2 (foreground)
      textSecondary: '139 233 253', // #8be9fd (cyan)
      success: '80 250 123',      // #50fa7b (green)
      warning: '241 250 140',     // #f1fa8c (yellow)
      error: '255 85 85',         // #ff5555 (red)
      info: '139 233 253'         // #8be9fd (cyan)
    },
    lightMode: {
      primary: '189 147 249',     // #bd93f9 (purple)
      secondary: '80 250 123',    // #50fa7b (green)
      accent: '255 85 85',        // #ff5555 (red)
      background: '248 248 242',  // #f8f8f2 (light background)
      surface: '255 255 255',     // #ffffff (white)
      text: '40 42 54',           // #282a36 (dark text)
      textSecondary: '68 71 90'   // #44475a (gray)
    }
  },
  {
    key: 'nord',
    name: 'Nord',
    description: 'Arctic, north-bluish color palette',
    colors: {
      primary: '129 161 193',     // #81a1c1 (nord9)
      secondary: '163 190 140',   // #a3be8c (nord14)
      accent: '191 97 106',       // #bf616a (nord11)
      background: '46 52 64',     // #2e3440 (nord0)
      surface: '59 66 82',        // #3b4252 (nord1)
      text: '216 222 233',        // #d8dee9 (nord4)
      textSecondary: '129 161 193', // #81a1c1 (nord9)
      success: '163 190 140',     // #a3be8c (nord14)
      warning: '235 203 139',     // #ebcb8b (nord13)
      error: '191 97 106',        // #bf616a (nord11)
      info: '136 192 208'         // #88c0d0 (nord8)
    },
    lightMode: {
      primary: '94 129 172',      // #5e81ac (nord10)
      secondary: '136 192 208',   // #88c0d0 (nord8)
      accent: '191 97 106',       // #bf616a (nord11)
      background: '229 233 240',  // #e5e9f0 (nord6)
      surface: '236 239 244',     // #eceff4 (nord5)
      text: '46 52 64',           // #2e3440 (nord0)
      textSecondary: '76 86 106'  // #4c566a (nord3)
    }
  },
  {
    key: 'monokai',
    name: 'Monokai Pro',
    description: 'Professional dark theme with vibrant colors',
    colors: {
      primary: '120 220 232',     // #78dce8 (cyan)
      secondary: '169 220 118',   // #a9dc76 (green)
      accent: '255 97 136',       // #ff6188 (pink)
      background: '45 42 46',     // #2d2a2e (background)
      surface: '60 56 61',        // #3c3c3d (selection)
      text: '252 252 250',        // #fcfcfa (foreground)
      textSecondary: '120 220 232', // #78dce8 (cyan)
      success: '169 220 118',     // #a9dc76 (green)
      warning: '255 214 102',     // #ffd666 (yellow)
      error: '255 97 136',        // #ff6188 (pink)
      info: '171 157 242'         // #ab9df2 (purple)
    },
    lightMode: {
      primary: '120 220 232',     // #78dce8 (cyan)
      secondary: '169 220 118',   // #a9dc76 (green)
      accent: '255 97 136',       // #ff6188 (pink)
      background: '252 252 250',  // #fcfcfa (light background)
      surface: '255 255 255',     // #ffffff (white)
      text: '45 42 46',           // #2d2a2e (dark text)
      textSecondary: '60 56 61'   // #3c3c3d (gray)
    }
  },
  {
    key: 'onedark',
    name: 'One Dark',
    description: 'Atom One Dark theme for everyone',
    colors: {
      primary: '97 175 239',      // #61afef (blue)
      secondary: '152 195 121',   // #98c379 (green)
      accent: '224 108 117',      // #e06c75 (red)
      background: '40 44 52',     // #282c34 (background)
      surface: '53 59 69',        // #353b45 (current line)
      text: '171 178 191',        // #abb2bf (foreground)
      textSecondary: '171 178 191', // #abb2bf (foreground)
      success: '152 195 121',     // #98c379 (green)
      warning: '229 192 123',     // #e5c07b (yellow)
      error: '224 108 117',       // #e06c75 (red)
      info: '97 175 239'          // #61afef (blue)
    },
    lightMode: {
      primary: '97 175 239',      // #61afef (blue)
      secondary: '152 195 121',   // #98c379 (green)
      accent: '224 108 117',      // #e06c75 (red)
      background: '250 251 252',  // #fafbfc (light background)
      surface: '255 255 255',     // #ffffff (white)
      text: '40 44 52',           // #282c34 (dark text)
      textSecondary: '92 99 112'  // #5c6370 (comment)
    }
  },
  {
    key: 'tokyonight',
    name: 'Tokyo Night',
    description: 'Dark theme inspired by Tokyo at night',
    colors: {
      primary: '122 162 247',     // #7aa2f7 (blue)
      secondary: '158 206 106',   // #9ece6a (green)
      accent: '247 118 142',      // #f7768e (red)
      background: '26 27 38',     // #1a1b26 (background)
      surface: '36 40 59',        // #24283b (current line)
      text: '192 202 245',        // #c0caf5 (foreground)
      textSecondary: '169 177 214', // #a9b1d6 (comment)
      success: '158 206 106',     // #9ece6a (green)
      warning: '255 203 107',     // #ffcb6b (yellow)
      error: '247 118 142',       // #f7768e (red)
      info: '122 162 247'         // #7aa2f7 (blue)
    },
    lightMode: {
      primary: '122 162 247',     // #7aa2f7 (blue)
      secondary: '158 206 106',   // #9ece6a (green)
      accent: '247 118 142',      // #f7768e (red)
      background: '223 225 239',  // #dfe1ef (light background)
      surface: '241 243 255',     // #f1f3ff (light surface)
      text: '26 27 38',           // #1a1b26 (dark text)
      textSecondary: '76 79 105'  // #4c4f69 (gray)
    }
  }
];