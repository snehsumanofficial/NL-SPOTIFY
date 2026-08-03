export type Category = 'Groceries' | 'Snacks' | 'Household' | 'Personal Care' | 'Pet Supplies' | 'Baby Products' | 'Fruits & Veg';

export type HouseholdType = 'Alone' | 'Family of 3+' | 'Roommates';
export type OrderFrequency = '1-2' | '3-5' | '6-10' | '10+'; // Orders per month

export interface UserProfile {
  id: string;
  householdType: HouseholdType;
  orderFrequency: OrderFrequency;
  categoriesPurchased: Category[];
  isCurrentUser?: boolean;
}

export const MOCK_PRODUCTS: Record<Category, {id: number, name: string, price: number, emoji: string}[]> = {
  'Groceries': [
    { id: 1, name: 'Aashirvaad Atta 5kg', price: 250, emoji: '🌾' },
    { id: 2, name: 'Amul Taaza Milk', price: 68, emoji: '🥛' },
    { id: 3, name: 'Tata Salt 1kg', price: 25, emoji: '🧂' },
  ],
  'Snacks': [
    { id: 11, name: 'Lay\'s Magic Masala', price: 20, emoji: '🥔' },
    { id: 12, name: 'Good Day Cookies', price: 30, emoji: '🍪' },
  ],
  'Household': [
    { id: 21, name: 'Surf Excel Matic', price: 220, emoji: '🧺' },
    { id: 22, name: 'Vim Dishwash Gel', price: 105, emoji: '🧼' },
  ],
  'Personal Care': [
    { id: 31, name: 'Himalaya Neem Facewash', price: 150, emoji: '🧴' },
    { id: 32, name: 'Dettol Soap 4pk', price: 160, emoji: '🧼' },
    { id: 33, name: 'Colgate MaxFresh', price: 110, emoji: '🪥' },
  ],
  'Pet Supplies': [
    { id: 41, name: 'Pedigree Adult 1kg', price: 320, emoji: '🐕' },
    { id: 42, name: 'Whiskas Kitten Food', price: 190, emoji: '🐈' },
    { id: 43, name: 'Drools Pet Treats', price: 150, emoji: '🦴' },
  ],
  'Baby Products': [
    { id: 51, name: 'Pampers Diapers L', price: 650, emoji: '👶' },
    { id: 52, name: 'Johnson Baby Powder', price: 180, emoji: '🧸' },
  ],
  'Fruits & Veg': [
    { id: 61, name: 'Onion 1kg', price: 40, emoji: '🧅' },
    { id: 62, name: 'Apple Fuji 4pcs', price: 120, emoji: '🍎' },
  ]
};

// Seed dataset of 30 users to act as the matching universe
export const MOCK_USERS: UserProfile[] = [
  // The explicitly defined current user demo persona (Routine Buyer)
  { id: 'u_current', householdType: 'Family of 3+', orderFrequency: '6-10', categoriesPurchased: ['Groceries', 'Fruits & Veg', 'Snacks'], isCurrentUser: true },
  
  // Twins (High similarity) - Same household, similar freq, buy Groceries + New Categories
  { id: 'u_1', householdType: 'Family of 3+', orderFrequency: '6-10', categoriesPurchased: ['Groceries', 'Fruits & Veg', 'Snacks', 'Personal Care'] },
  { id: 'u_2', householdType: 'Family of 3+', orderFrequency: '10+', categoriesPurchased: ['Groceries', 'Snacks', 'Pet Supplies', 'Personal Care'] },
  { id: 'u_3', householdType: 'Family of 3+', orderFrequency: '6-10', categoriesPurchased: ['Groceries', 'Household', 'Pet Supplies'] },
  { id: 'u_4', householdType: 'Family of 3+', orderFrequency: '6-10', categoriesPurchased: ['Groceries', 'Fruits & Veg', 'Personal Care', 'Baby Products'] },
  { id: 'u_5', householdType: 'Family of 3+', orderFrequency: '3-5', categoriesPurchased: ['Groceries', 'Snacks', 'Pet Supplies', 'Personal Care'] },
  
  // Distant Profiles (Low similarity)
  { id: 'u_6', householdType: 'Alone', orderFrequency: '1-2', categoriesPurchased: ['Snacks', 'Personal Care'] },
  { id: 'u_7', householdType: 'Roommates', orderFrequency: '10+', categoriesPurchased: ['Snacks', 'Household', 'Personal Care'] },
  { id: 'u_8', householdType: 'Alone', orderFrequency: '3-5', categoriesPurchased: ['Groceries', 'Pet Supplies'] },
  { id: 'u_9', householdType: 'Family of 3+', orderFrequency: '1-2', categoriesPurchased: ['Baby Products', 'Household'] },
  { id: 'u_10', householdType: 'Roommates', orderFrequency: '6-10', categoriesPurchased: ['Snacks', 'Groceries'] },
  
  // Add 20 more variations to make the matching algorithm run on a decent set
  { id: 'u_11', householdType: 'Family of 3+', orderFrequency: '6-10', categoriesPurchased: ['Groceries', 'Fruits & Veg', 'Personal Care'] },
  { id: 'u_12', householdType: 'Family of 3+', orderFrequency: '6-10', categoriesPurchased: ['Groceries', 'Snacks', 'Household', 'Personal Care'] },
  { id: 'u_13', householdType: 'Alone', orderFrequency: '6-10', categoriesPurchased: ['Groceries', 'Household'] },
  { id: 'u_14', householdType: 'Roommates', orderFrequency: '3-5', categoriesPurchased: ['Snacks', 'Fruits & Veg'] },
  { id: 'u_15', householdType: 'Family of 3+', orderFrequency: '10+', categoriesPurchased: ['Groceries', 'Baby Products', 'Personal Care'] },
  { id: 'u_16', householdType: 'Family of 3+', orderFrequency: '6-10', categoriesPurchased: ['Groceries', 'Pet Supplies'] },
  { id: 'u_17', householdType: 'Alone', orderFrequency: '1-2', categoriesPurchased: ['Snacks'] },
  { id: 'u_18', householdType: 'Roommates', orderFrequency: '10+', categoriesPurchased: ['Groceries', 'Snacks', 'Household'] },
  { id: 'u_19', householdType: 'Family of 3+', orderFrequency: '3-5', categoriesPurchased: ['Groceries', 'Fruits & Veg', 'Personal Care'] },
  { id: 'u_20', householdType: 'Family of 3+', orderFrequency: '6-10', categoriesPurchased: ['Groceries', 'Snacks', 'Personal Care'] },
  { id: 'u_21', householdType: 'Family of 3+', orderFrequency: '10+', categoriesPurchased: ['Groceries', 'Household', 'Pet Supplies'] },
  { id: 'u_22', householdType: 'Alone', orderFrequency: '6-10', categoriesPurchased: ['Fruits & Veg', 'Personal Care'] },
  { id: 'u_23', householdType: 'Roommates', orderFrequency: '1-2', categoriesPurchased: ['Snacks'] },
  { id: 'u_24', householdType: 'Family of 3+', orderFrequency: '6-10', categoriesPurchased: ['Groceries', 'Baby Products'] },
  { id: 'u_25', householdType: 'Family of 3+', orderFrequency: '3-5', categoriesPurchased: ['Groceries', 'Snacks', 'Pet Supplies'] },
  { id: 'u_26', householdType: 'Alone', orderFrequency: '10+', categoriesPurchased: ['Groceries', 'Fruits & Veg'] },
  { id: 'u_27', householdType: 'Roommates', orderFrequency: '6-10', categoriesPurchased: ['Snacks', 'Household', 'Personal Care'] },
  { id: 'u_28', householdType: 'Family of 3+', orderFrequency: '6-10', categoriesPurchased: ['Groceries', 'Personal Care', 'Pet Supplies'] },
  { id: 'u_29', householdType: 'Family of 3+', orderFrequency: '1-2', categoriesPurchased: ['Baby Products'] },
  { id: 'u_30', householdType: 'Family of 3+', orderFrequency: '6-10', categoriesPurchased: ['Groceries', 'Snacks', 'Household', 'Personal Care'] }
];
