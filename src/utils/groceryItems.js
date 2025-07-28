// Common grocery items organized by category for smart suggestions
export const groceryItems = [
  // Fruits & Vegetables
  'Appels', 'Bananen', 'Sinaasappels', 'Peren', 'Druiven', 'Aardbeien', 'Tomaten',
  'Komkommers', 'Wortels', 'Uien', 'Paprika', 'Broccoli', 'Sla', 'Spinazie',
  'Aardappelen', 'Courgette', 'Aubergine', 'Champignons', 'Avocado', 'Citroen',
  
  // Dairy & Eggs
  'Melk', 'Boter', 'Kaas', 'Yoghurt', 'Eieren', 'Kwark', 'Roomkaas', 'Slagroom',
  'Karnemelk', 'Vla', 'Pudding', 'IJsjes',
  
  // Meat & Fish
  'Kip', 'Rundvlees', 'Varkensvlees', 'Gehakt', 'Worst', 'Ham', 'Bacon', 'Zalm',
  'Tonijn', 'Garnalen', 'Kabeljauw', 'Kipfilet', 'Lamsvlees',
  
  // Bread & Bakery
  'Brood', 'Volkoren brood', 'Croissants', 'Beschuit', 'Crackers', 'Koekjes',
  'Cake', 'Muffins', 'Bagels', 'Tortillas',
  
  // Pantry & Dry Goods
  'Rijst', 'Pasta', 'Bloem', 'Suiker', 'Zout', 'Peper', 'Olijfolie', 'Azijn',
  'Honing', 'Jam', 'Pindakaas', 'Nutella', 'Thee', 'Koffie', 'Muesli', 'Havermout',
  
  // Beverages
  'Water', 'Frisdrank', 'Sap', 'Bier', 'Wijn', 'Koffie', 'Thee', 'Energy drink',
  'Sportdrank', 'Smoothie',
  
  // Frozen Foods
  'Diepvries groenten', 'Diepvries fruit', 'IJs', 'Pizza', 'Friet', 'Vis sticks',
  'Kipnuggets', 'Erwten', 'Spinazie diepvries',
  
  // Snacks & Sweets
  'Chips', 'Noten', 'Chocolade', 'Snoep', 'Popcorn', 'Biscuits', 'Stroopwafels',
  'Drop', 'Pepernoten', 'Speculoos',
  
  // Household & Personal Care
  'Toiletpapier', 'Tandpasta', 'Shampoo', 'Zeep', 'Wasmiddel', 'Afwasmiddel',
  'Keukenpapier', 'Deodorant', 'Tandenborstel', 'Schoonmaakmiddel',
  
  // Baby & Kids
  'Luiers', 'Babyvoeding', 'Melkpoeder', 'Babydoekjes', 'Flesjes', 'Spenen',
  
  // International & Special
  'Sushi', 'Curry', 'Pasta saus', 'Pesto', 'Hummus', 'Guacamole', 'Salsa',
  'Sojasaus', 'Wasabi', 'Kimchi'
];

// Function to get suggestions based on input
export const getSuggestions = (input, maxSuggestions = 5) => {
  if (!input || input.length < 2) return [];
  
  const query = input.toLowerCase().trim();
  
  // Find items that start with the query (priority)
  const startsWith = groceryItems.filter(item => 
    item.toLowerCase().startsWith(query)
  );
  
  // Find items that contain the query
  const contains = groceryItems.filter(item => 
    item.toLowerCase().includes(query) && 
    !item.toLowerCase().startsWith(query)
  );
  
  // Combine and limit results
  return [...startsWith, ...contains].slice(0, maxSuggestions);
};

// Function to get random popular items for empty state
export const getPopularItems = (count = 8) => {
  const popular = [
    'Melk', 'Brood', 'Eieren', 'Bananen', 'Appels', 'Kip', 'Pasta', 'Kaas',
    'Tomaten', 'Uien', 'Wortels', 'Yoghurt', 'Rijst', 'Olijfolie', 'Koffie', 'Thee'
  ];
  
  return popular.slice(0, count);
}; 