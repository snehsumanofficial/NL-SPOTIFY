"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Search, MapPin, User, ChevronRight, ChevronLeft, Info, Users, X, ShoppingBag, Trash2, CheckCircle } from 'lucide-react';
import { MOCK_USERS, MOCK_PRODUCTS, Category } from '@/data/data';
import { getBasketTwins, MatchingResult } from '@/utils/matchingEngine';

const CATEGORIES = [
  { name: 'Groceries', emoji: '🌾' },
  { name: 'Snacks', emoji: '🥔' },
  { name: 'Household', emoji: '🧺' },
  { name: 'Personal Care', emoji: '🧴' },
  { name: 'Pet Supplies', emoji: '🐕' },
  { name: 'Baby Products', emoji: '👶' },
  { name: 'Fruits & Veg', emoji: '🍎' }
];

export default function Home() {
  const [activeTab, setActiveTab] = useState('home');
  const [matchingResult, setMatchingResult] = useState<MatchingResult | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<any | null>(null);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [viewingCategory, setViewingCategory] = useState<Category | null>(null);
  const [cart, setCart] = useState<any[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  
  const cartTotal = cart.reduce((sum, item) => sum + item.price, 0);
  
  // The explicitly mocked current user (Routine Buyer)
  const currentUser = useMemo(() => MOCK_USERS.find(u => u.isCurrentUser)!, []);
  
  useEffect(() => {
    // Run the matching engine on mount
    const result = getBasketTwins(currentUser);
    setMatchingResult(result);
  }, [currentUser]);

  return (
    <div className="mobile-wrapper flex flex-col bg-gray-50 font-sans">
      
      {activeTab === 'home' ? (
        <>
          {/* Header */}
      <header className="bg-white pt-12 pb-4 px-4 sticky top-0 z-20 shadow-sm shrink-0">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="bg-[var(--color-swiggy-orange-light)] p-2 rounded-full text-[var(--color-swiggy-orange)]">
              <MapPin size={20} />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg flex items-center gap-1 leading-tight">
                Home <ChevronRight size={16} />
              </span>
              <span className="text-xs text-gray-500 truncate w-48">A-12, Green Park Extension, New...</span>
            </div>
          </div>
          <div className="bg-gray-100 p-2 rounded-full text-gray-600">
            <User size={20} />
          </div>
        </div>
        
        {/* Mock Search Bar */}
        <div className="bg-gray-100 rounded-xl p-3 flex items-center gap-2 text-gray-500">
          <Search size={18} />
          <span className="text-sm">Search for 'milk', 'bread'...</span>
        </div>
      </header>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto pb-20 no-scrollbar">
        
        {/* Category Rail */}
        <div className="py-5 px-4 bg-white mb-2">
          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
            {CATEGORIES.map((cat, i) => (
              <div 
                key={i} 
                className="flex flex-col items-center gap-2 min-w-[70px] cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => setViewingCategory(cat.name as Category)}
              >
                <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center text-3xl shadow-sm border border-orange-100">
                  {cat.emoji}
                </div>
                <span className="text-[10px] font-semibold text-center leading-tight text-gray-700">{cat.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Your Routine Preview */}
        <div className="px-4 py-4 mb-2">
          <h2 className="font-bold text-lg mb-3 flex items-center gap-2 text-gray-800">
            <ShoppingBag size={18} className="text-[var(--color-swiggy-orange)]" /> 
            Your Routine
          </h2>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <p className="text-xs text-gray-500 mb-3">Your typical weekly basket</p>
            <div className="flex flex-wrap gap-2">
              {['🌾 Aashirvaad Atta', '🍎 Fresh Apple', '🥔 Lay\'s Masala', '🥛 Amul Milk'].map((item, i) => (
                <span key={i} className="bg-gray-50 border border-gray-200 text-xs px-2 py-1 rounded-md text-gray-700">
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* --- CORE FEATURE: BASKET TWIN WIDGET --- */}
        {matchingResult && matchingResult.recommendedCategories.length > 0 && (
          <div className="px-4 py-2 mb-6">
            <div className="relative overflow-hidden bg-gradient-to-br from-indigo-50 to-purple-50 border border-purple-100 rounded-3xl p-5 shadow-sm">
              
              {/* Background Decoration */}
              <div className="absolute -right-4 -top-4 opacity-[0.03] transform rotate-12">
                <Users size={120} />
              </div>
              
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-2">
                  <div className="bg-purple-100 text-purple-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider flex items-center gap-1 w-fit">
                    <Users size={12} className="fill-purple-700" /> Peer Discovery
                  </div>
                  <button 
                    onClick={() => setShowInfoModal(true)}
                    className="text-purple-400 hover:text-purple-600 p-1"
                  >
                    <Info size={16} />
                  </button>
                </div>
                
                <h3 className="text-lg font-bold font-serif leading-tight text-gray-900 mb-1">
                  Households like yours also buy...
                </h3>
                <p className="text-[11px] text-gray-600 mb-4 leading-relaxed pr-4">
                  Based on your {currentUser.householdType.toLowerCase()} household and {currentUser.orderFrequency}x/month orders, your "basket twins" love exploring these categories.
                </p>
                
                <div className="flex overflow-x-auto gap-3 pb-1 no-scrollbar">
                  {matchingResult.recommendedCategories.slice(0, 3).map((rec, i) => (
                    <div 
                      key={i}
                      onClick={() => setSelectedCategory(rec)}
                      className="min-w-[130px] bg-white border border-purple-100 rounded-2xl p-3 flex flex-col gap-2 cursor-pointer shadow-sm hover:border-purple-300 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{CATEGORIES.find(c => c.name === rec.category)?.emoji}</span>
                        <div className="bg-green-100 text-green-700 text-[9px] font-bold px-1.5 py-0.5 rounded-full whitespace-nowrap">
                          {rec.adoptionRate}% buy this
                        </div>
                      </div>
                      <span className="font-semibold text-xs text-gray-800 leading-tight">{rec.category}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      </>
      
      ) : activeTab === 'checkup' ? (
        /* --- CATEGORY CHECKUP SCREEN --- */
        <div className="flex-1 overflow-y-auto pb-20 fade-in bg-white">
          <div className="p-6 bg-gradient-to-br from-indigo-600 to-purple-700 text-white rounded-b-[40px] shadow-sm mb-6">
            <h2 className="text-2xl font-bold mb-1">Category Checkup</h2>
            <p className="text-sm opacity-90 mb-6">Let's see how your basket diversity compares to your Twin Cohort this month.</p>
            
            {/* Visual comparison bar */}
            <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-sm border border-white/20">
              <div className="mb-4">
                <div className="flex justify-between text-xs mb-1 font-semibold">
                  <span>Your Diversity</span>
                  <span>{currentUser.categoriesPurchased.length} Categories</span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-2">
                  <div className="bg-orange-400 h-2 rounded-full" style={{ width: `${(currentUser.categoriesPurchased.length / 7) * 100}%` }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-xs mb-1 font-semibold">
                  <span>Twin Cohort Avg</span>
                  <span>{Math.round(matchingResult ? matchingResult.twinCohort.reduce((acc, t) => acc + t.categoriesPurchased.length, 0) / matchingResult.twinCohort.length : 5)} Categories</span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-2">
                  <div className="bg-green-400 h-2 rounded-full" style={{ width: `${((matchingResult ? matchingResult.twinCohort.reduce((acc, t) => acc + t.categoriesPurchased.length, 0) / matchingResult.twinCohort.length : 5) / 7) * 100}%` }}></div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="px-6">
            <h3 className="font-bold text-gray-800 mb-4 text-lg">Actionable Suggestion</h3>
            
            <div className="bg-purple-50 border border-purple-100 rounded-2xl p-4 flex gap-3 mb-6">
              <div className="w-10 h-10 bg-purple-200 rounded-full flex items-center justify-center text-purple-700 shrink-0">
                <Users size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-700 leading-relaxed font-medium">
                  Your household twins buy a lot more <strong>{matchingResult?.recommendedCategories[0]?.category}</strong> than you do! 
                </p>
                <button 
                  className="mt-3 text-sm font-bold text-purple-700 bg-purple-100 px-4 py-2 rounded-lg"
                  onClick={() => {
                    setSelectedCategory(matchingResult?.recommendedCategories[0]);
                    setActiveTab('home');
                  }}
                >
                  Explore Category
                </button>
              </div>
            </div>
            
            <h3 className="font-bold text-gray-800 mb-3 text-lg">Your Current Mix</h3>
            <div className="flex flex-wrap gap-2">
              {currentUser.categoriesPurchased.map((cat, i) => (
                <div key={i} className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 px-3 py-2 rounded-xl text-sm">
                  <span>{CATEGORIES.find(c => c.name === cat)?.emoji}</span>
                  <span className="font-medium text-gray-700">{cat}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      {/* --- FULL CATEGORY VIEW (EXPLORE ALL) --- */}
      {viewingCategory && (
        <div className="absolute inset-0 bg-gray-50 z-50 flex flex-col fade-in">
          <header className="bg-white pt-12 pb-4 px-4 sticky top-0 z-20 shadow-sm shrink-0 flex items-center gap-3">
            <button onClick={() => setViewingCategory(null)} className="p-2 -ml-2 rounded-full hover:bg-gray-100">
              <ChevronLeft size={24} />
            </button>
            <h1 className="font-bold text-xl flex items-center gap-2">
              {CATEGORIES.find(c => c.name === viewingCategory)?.emoji} {viewingCategory}
            </h1>
          </header>
          
          <div className="flex-1 overflow-y-auto p-4 no-scrollbar pb-24">
            <div className="grid grid-cols-2 gap-4">
              {MOCK_PRODUCTS[viewingCategory]?.map((item: any) => (
                <div key={item.id} className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
                  <div className="w-20 h-20 bg-gray-50 rounded-xl flex items-center justify-center text-4xl mb-3">
                    {item.emoji}
                  </div>
                  <span className="font-semibold text-sm leading-tight text-gray-800 mb-1 line-clamp-2 h-10">{item.name}</span>
                  <span className="text-gray-800 font-bold text-sm mb-3">₹{item.price}</span>
                  <button 
                    className="w-full bg-white text-[var(--color-swiggy-orange)] border border-[var(--color-swiggy-orange)] font-bold text-xs py-2 rounded-lg hover:bg-orange-50 transition-colors"
                    onClick={() => setCart([...cart, item])}
                  >
                    ADD
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* --- BOTTOM NAVIGATION --- */}
      <div className="bg-white border-t border-gray-100 absolute bottom-0 left-0 w-full px-6 py-3 flex justify-around items-center shrink-0 z-40 pb-5 shadow-[0_-5px_15px_rgba(0,0,0,0.02)]">
        <button 
          className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'home' ? 'text-[var(--color-swiggy-orange)]' : 'text-gray-400'}`}
          onClick={() => setActiveTab('home')}
        >
          <Search size={22} className={activeTab === 'home' ? 'stroke-[2.5px]' : ''} />
          <span className="text-[10px] font-bold">Instamart</span>
        </button>
        
        <button 
          className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'checkup' ? 'text-purple-600' : 'text-gray-400'}`}
          onClick={() => setActiveTab('checkup')}
        >
          <Users size={22} className={activeTab === 'checkup' ? 'stroke-[2.5px]' : ''} />
          <span className="text-[10px] font-bold">Checkup</span>
        </button>
      </div>

      {/* --- CATEGORY DETAILS MODAL --- */}
      {selectedCategory && (
        <div className="absolute inset-0 bg-black/60 z-50 flex items-end fade-in pb-0">
          <div className="bg-white w-full rounded-t-3xl p-5 slide-up shadow-2xl relative max-h-[85%] flex flex-col">
            
            <div className="shrink-0 w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-4"></div>
            
            <div className="shrink-0 flex justify-between items-start mb-4">
              <div>
                <div className="bg-purple-100 text-purple-700 w-fit px-2 py-0.5 rounded text-[10px] font-bold uppercase mb-1">
                  Top Match
                </div>
                <h2 className="text-2xl font-bold font-serif leading-tight text-gray-800 flex items-center gap-2">
                  {CATEGORIES.find(c => c.name === selectedCategory.category)?.emoji} {selectedCategory.category}
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  <strong className="text-green-600">{selectedCategory.adoptionRate}% of your Basket Twins</strong> buy from this category.
                </p>
              </div>
              <button className="text-gray-400 bg-gray-100 p-2 rounded-full" onClick={() => setSelectedCategory(null)}>
                <X size={18} />
              </button>
            </div>

            <div className="overflow-y-auto no-scrollbar pb-24">
              <div className="bg-blue-50 text-blue-800 text-xs p-3 rounded-xl mb-4 border border-blue-100 flex items-start gap-2">
                <Info size={16} className="shrink-0 mt-0.5 text-blue-600" />
                <span>These items were ordered 40+ times by similar households this month.</span>
              </div>
              
              <div className="flex flex-col gap-3">
                {selectedCategory.sampleProducts.map((item: any, i: number) => (
                  <div key={i} className="flex items-center justify-between p-3 border border-gray-100 rounded-xl bg-white shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center text-2xl shrink-0">
                        {item.emoji}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-semibold text-sm leading-tight text-gray-800 mb-1">{item.name}</span>
                        <span className="text-gray-800 font-bold text-xs">₹{item.price}</span>
                      </div>
                    </div>
                    <button 
                      className="bg-white text-[var(--color-swiggy-orange)] border border-[var(--color-swiggy-orange)] font-bold text-[10px] px-4 py-2 rounded-lg"
                      onClick={() => setCart([...cart, item])}
                    >
                      ADD
                    </button>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="absolute bottom-0 left-0 w-full p-4 border-t border-gray-100 bg-white shadow-[0_-10px_15px_-3px_rgba(0,0,0,0.05)]">
               <button 
                className="w-full bg-[var(--color-swiggy-orange)] text-white font-bold px-8 py-3.5 rounded-xl shadow-lg shadow-orange-200"
                onClick={() => {
                  setViewingCategory(selectedCategory.category);
                  setSelectedCategory(null);
                }}
               >
                 Explore all {selectedCategory.category}
               </button>
            </div>
            
          </div>
        </div>
      )}

      {/* --- INFO MODAL ("Why am I seeing this?") --- */}
      {showInfoModal && (
        <div className="absolute inset-0 bg-black/60 z-50 flex items-center justify-center fade-in p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 slide-up shadow-2xl relative">
            <button className="absolute right-4 top-4 text-gray-400" onClick={() => setShowInfoModal(false)}>
              <X size={20} />
            </button>
            
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 mb-4">
              <Users size={24} />
            </div>
            
            <h3 className="text-xl font-bold text-gray-900 mb-2">How Basket Twin works</h3>
            <p className="text-sm text-gray-600 mb-4">
              Instead of showing you random products, we securely group anonymous order data to find households with a lifestyle similar to yours.
            </p>
            
            <div className="bg-gray-50 rounded-xl p-4 flex flex-col gap-3 mb-6">
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-500">Your Profile:</span>
                <span className="font-semibold text-gray-800">{currentUser.householdType}</span>
              </div>
              <div className="w-full h-[1px] bg-gray-200"></div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-500">Order Frequency:</span>
                <span className="font-semibold text-gray-800">{currentUser.orderFrequency} / month</span>
              </div>
              <div className="w-full h-[1px] bg-gray-200"></div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-500">Routine Categories:</span>
                <span className="font-semibold text-gray-800 text-right">{currentUser.categoriesPurchased.join(', ')}</span>
              </div>
            </div>
            
            <p className="text-xs text-gray-500 text-center leading-relaxed">
              We never share your personal information or specific purchase history with anyone. Matching is 100% anonymized.
            </p>
            
            <button 
              className="w-full mt-4 bg-gray-900 text-white font-bold py-3 rounded-xl"
              onClick={() => setShowInfoModal(false)}
            >
              Got it
            </button>
          </div>
        </div>
      )}

      {/* --- FLOATING CART STRIP --- */}
      {cart.length > 0 && !showCart && (
        <div 
          className="absolute bottom-[70px] left-4 right-4 bg-green-700 text-white rounded-xl p-3 flex justify-between items-center shadow-lg z-40 cursor-pointer slide-up"
          onClick={() => setShowCart(true)}
        >
          <div className="flex items-center gap-3">
            <div className="bg-green-800 p-1.5 rounded-lg">
              <ShoppingBag size={18} className="fill-white/20" />
            </div>
            <div>
              <div className="font-bold text-sm">{cart.length} item{cart.length > 1 ? 's' : ''}</div>
              <div className="text-xs text-green-100">₹{cartTotal} • View Cart</div>
            </div>
          </div>
          <ChevronRight size={20} />
        </div>
      )}

      {/* --- CART MODAL --- */}
      {showCart && (
        <div className="absolute inset-0 bg-black/60 z-50 flex items-end fade-in pb-0">
          <div className="bg-white w-full rounded-t-3xl p-5 slide-up shadow-2xl relative max-h-[80%] flex flex-col">
            <div className="shrink-0 w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-4"></div>
            
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Your Cart</h2>
              <button className="text-gray-400 bg-gray-100 p-2 rounded-full" onClick={() => setShowCart(false)}>
                <X size={18} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto no-scrollbar pb-24">
              {cart.length === 0 ? (
                <div className="text-center text-gray-500 py-10">Your cart is empty.</div>
              ) : (
                <div className="flex flex-col gap-4">
                  {cart.map((item, i) => (
                    <div key={i} className="flex justify-between items-center border-b border-gray-100 pb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-2xl">
                          {item.emoji}
                        </div>
                        <div>
                          <div className="font-medium text-sm text-gray-800">{item.name}</div>
                          <div className="font-bold text-xs text-gray-800">₹{item.price}</div>
                        </div>
                      </div>
                      <button 
                        className="text-red-400 hover:text-red-600 bg-red-50 p-2 rounded-lg"
                        onClick={() => {
                          const newCart = [...cart];
                          newCart.splice(i, 1);
                          setCart(newCart);
                        }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="absolute bottom-0 left-0 w-full p-4 border-t border-gray-100 bg-white shadow-[0_-10px_15px_-3px_rgba(0,0,0,0.05)]">
               <button 
                className="w-full bg-green-700 text-white font-bold px-8 py-3.5 rounded-xl shadow-lg shadow-green-200 flex justify-between items-center"
                onClick={() => {
                  setCart([]);
                  setShowCart(false);
                  setOrderPlaced(true);
                }}
               >
                 <span>₹{cartTotal}</span>
                 <span>Proceed to Pay</span>
               </button>
            </div>
          </div>
        </div>
      )}

      {/* --- ORDER PLACED SCREEN --- */}
      {orderPlaced && (
        <div className="absolute inset-0 bg-green-50 z-50 flex flex-col items-center justify-center fade-in p-6">
          <div className="bg-white p-8 rounded-3xl shadow-xl flex flex-col items-center text-center w-full max-w-sm">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-6 slide-up">
              <CheckCircle size={40} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Placed!</h2>
            <p className="text-gray-600 mb-8 leading-relaxed">
              Your items have been packed and will be delivered to your door in <strong className="text-green-700 font-bold">10 minutes</strong>.
            </p>
            <button 
              className="w-full bg-gray-900 text-white font-bold py-3.5 rounded-xl hover:bg-gray-800 transition-colors"
              onClick={() => setOrderPlaced(false)}
            >
              Continue Shopping
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
