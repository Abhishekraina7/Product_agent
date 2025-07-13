'use client';

import { useEffect, useRef, useState } from 'react';
import { Search, Mic, ArrowUp, Star, ShoppingCart, Heart, Wifi, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { BackgroundGradient } from '@/components/ui/background-gradient';
import { useSocket, BotMessage, Product } from '@/hooks/useSocket';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter } from 'next/navigation';

const suggestionQueries = [
  "Affordable sandals for men",
  "Women's kurtis with latest designs",
  "Dish racks and kitchen organizers under 500",
  "Home decor items for living room"
];

export default function Home() {
  // ...existing state and hooks
  // (no changes here)

  const [searchQuery, setSearchQuery] = useState('');
  const [chat, setChat] = useState<{ sender: 'user' | 'bot'; text: string }[]>([]);
  type ProductBlock = {
    query: string;
    products: Product[];
    loading: boolean;
  };

  const [productBlocks, setProductBlocks] = useState<ProductBlock[]>([]);
  const pendingBlockIdxRef = useRef<number | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Socket.IO integration
  const { connected, sendUserMessage } = useSocket({
    onBotMessage: (msg) => {
      setChat((prev) => [...prev, { sender: 'bot', text: msg.text }]);
      // Only hide loader if this is a final message and no products will be sent
      if (
        /sorry|couldn't interpret|provide exactly 3 keywords|scraping failed|no products found|session closed|goodbye|interest you|more options/i.test(msg.text)
      ) {
        setIsSearching(false);
      }
    },
    onProduct: (product) => {
      setProductBlocks((blocks) => {
        const idx = pendingBlockIdxRef.current;
        if (idx === null) return blocks;
        const updated = [...blocks];
        // Deduplicate only within this block
        const exists = updated[idx].products.some(p => p.id === product.id);
        if (!exists) {
          updated[idx].products = [...updated[idx].products, product];
        }
        updated[idx].loading = false;
        return updated;
      });
      setShowResults(true);
      setIsSearching(false);
    },
    onConnect: () => setError(null),
    onDisconnect: () => setError('Lost connection to backend.'),
  });

  // Scroll chat to bottom on new message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat]);

  // Send query to backend
  const handleSearch = (query: string) => {
    if (!query.trim()) return;
    setChat((prev) => [...prev, { sender: 'user', text: query }]);
    setProductBlocks((prev) => {
      const newBlocks = [...prev, { query, products: [], loading: true }];
      pendingBlockIdxRef.current = newBlocks.length - 1;
      return newBlocks;
    });
    setShowResults(true);
    setIsSearching(true);
    setError(null);
    sendUserMessage(query);
    setSearchQuery('');
  };

  const ProductCard = ({ product }: { product: Product }) => (
    <BackgroundGradient className="rounded-[22px] p-1 group cursor-pointer">
      <Card className="bg-slate-800/90 border-0 rounded-[18px] overflow-hidden h-full transition-all duration-300 group-hover:scale-[1.02]">
        <CardContent className="p-0 h-full">
          <div className="relative">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-48 object-cover"
            />
            {product.discount && product.discount > 0 && (
              <div className="absolute top-3 left-3 bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                -{product.discount}%
              </div>
            )}
            <button className="absolute top-3 right-3 p-2 bg-black/60 backdrop-blur-sm rounded-full text-white hover:bg-black/80 transition-all duration-200 hover:scale-110">
              <Heart size={16} />
            </button>
          </div>
          <div className="p-5">
            <h3 className="font-semibold text-white text-sm line-clamp-2 mb-3 group-hover:text-blue-300 transition-colors leading-relaxed">
              {product.name}
            </h3>
            <div className="flex items-center mb-3">
              <div className="flex items-center">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="text-yellow-400 text-sm ml-1 font-medium">{product.rating?.toFixed(1) || '4.0'}</span>
              </div>
              <span className="text-gray-400 text-sm ml-2">({(product.reviews || 0).toLocaleString()})</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-white font-bold text-lg">{product.currency || product.currencySymbol || ''}{product.price}</span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <span className="text-gray-400 line-through text-sm">{product.currency || product.currencySymbol || ''}{product.originalPrice}</span>
                )}
              </div>
              <Button size="sm" className="bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-black font-semibold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105">
                <ShoppingCart size={14} className="mr-1" />
                Add
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </BackgroundGradient>
  );

  const router = useRouter();

  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';
      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setSearchQuery(transcript);
        setIsListening(false);
      };
      recognitionRef.current.onend = () => setIsListening(false);
      recognitionRef.current.onerror = () => setIsListening(false);
    }
  }, []);

  const handleMicClick = () => {
    if (!recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      {/* Loading Overlay */}
      {isSearching && productBlocks.length === 0 && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm transition-all">
          <div className="flex flex-col items-center">
            <svg className="animate-spin h-12 w-12 text-blue-400 mb-6" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
            </svg>
            <div className="text-lg text-white font-semibold mb-2">Searching for products...</div>
            <div className="w-64">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {Array.from({ length: 4 }).map((_, idx) => (
                  <Skeleton key={idx} className="h-24 w-full rounded-xl mb-2" />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-800 flex-shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              <button
                className="flex items-center space-x-2 focus:outline-none group"
                onClick={() => {
                  setShowResults(false);
                  setProductBlocks([]);
                  setChat([]);
                  setError(null);
                  setSearchQuery('');
                  setIsSearching(false);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                aria-label="Go to landing page"
              >
                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <span className="text-blue-600 font-bold text-lg">S</span>
                </div>
                <span className="text-white font-bold text-xl group-hover:text-blue-400 transition-colors">SmartSearch</span>
              </button>
              <nav className="hidden md:flex space-x-6">
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white">
                Sign In
              </Button>
              <Button size="sm" className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg">
                Sign Up
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {showResults ? (
          /* Results Layout - ChatGPT Style */
          <>
            {/* Results Area - Scrollable */}
            <div className="flex-1 overflow-y-auto">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Chat-like product blocks */}
                {productBlocks.length === 0 && (
                  <div className="text-center py-20">
                    <div className="text-gray-400 mb-4">
                      <Search size={48} className="mx-auto mb-4 opacity-50" />
                      <p className="text-xl">No products found</p>
                      <p className="text-sm">Try a different search term</p>
                    </div>
                  </div>
                )}
                {productBlocks.map((block, blockIdx) => (
                  <div key={blockIdx} className="mb-12">
                    {/* User query as chat bubble */}
                    <div className="flex items-start mb-4">
                      <div className="bg-blue-600 text-white px-4 py-2 rounded-2xl shadow-lg max-w-xl">
                        <span className="font-medium">You:</span> {block.query}
                      </div>
                    </div>
                    {/* Loading skeletons for this block */}
                    {block.loading && block.products.length === 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                        {Array.from({ length: 6 }).map((_, idx) => (
                          <div key={idx} className="rounded-[22px] p-1">
                            <div className="bg-slate-800/90 border-0 rounded-[18px] overflow-hidden h-full">
                              <div className="p-0 h-full">
                                <div className="relative">
                                  <Skeleton className="w-full h-48 object-cover" />
                                  <div className="absolute top-3 left-3">
                                    <Skeleton className="w-16 h-6 rounded-full" />
                                  </div>
                                  <div className="absolute top-3 right-3">
                                    <Skeleton className="w-8 h-8 rounded-full" />
                                  </div>
                                </div>
                                <div className="p-5">
                                  <Skeleton className="h-6 w-3/4 mb-3 rounded" />
                                  <Skeleton className="h-4 w-1/3 mb-3 rounded" />
                                  <Skeleton className="h-6 w-1/2 rounded" />
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    {/* Product grid for this block */}
                    {!block.loading && block.products.length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mb-4">
                        {block.products.slice(0, 12).map((product, index) => (
                          <ProductCard key={product.id || `block-${blockIdx}-product-${index}`} product={product} />
                        ))}
                      </div>
                    )}
                    {/* No products for this block */}
                    {!block.loading && block.products.length === 0 && (
                      <div className="text-gray-400 mb-4">No products found for this query.</div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Fixed Search Bar at Bottom */}
            <div className="flex-shrink-0 bg-slate-900/95 backdrop-blur-sm border-t border-slate-800">
              <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="Ask anything about products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch(searchQuery)}
                    className="w-full h-14 px-6 pr-20 bg-slate-800/50 border-slate-700 text-white placeholder-gray-400 text-lg rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-lg"
                    disabled={isSearching}
                  />
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
                    {recognitionRef.current && (
                      <button
                        className={`p-2 transition-colors ${isListening ? 'text-blue-400 animate-pulse' : 'text-gray-400 hover:text-white'}`}
                        onClick={handleMicClick}
                        aria-label={isListening ? "Stop listening" : "Start voice input"}
                        type="button"
                        disabled={isSearching}
                      >
                        <Mic size={20} />
                      </button>
                    )}
                    <button
                      onClick={() => handleSearch(searchQuery)}
                      className="p-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg transition-all duration-200 hover:scale-105 shadow-lg"
                    >
                      <ArrowUp size={20} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          /* Landing Page - Centered */
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent">
                Meet AI Search
              </h1>
              <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
                Ask detailed questions for better product recommendations
              </p>

              {/* Border Glowing Search Input */}
              <div className="relative max-w-2xl mx-auto mb-12">
                {/* Glowing border effect - only shows when search is empty */}
                {!searchQuery && (
                  <div className="absolute inset-0 rounded-2xl p-[2px]">
                    {/* Animated glowing border layers */}
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500 via-purple-500 via-pink-500 to-blue-500 opacity-75 animate-pulse"></div>
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-400 via-purple-400 via-pink-400 to-blue-400 opacity-50 animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-400 via-blue-400 via-purple-400 to-cyan-400 opacity-30 animate-pulse" style={{ animationDelay: '1s' }}></div>
                    {/* Inner background to create border effect */}
                    <div className="absolute inset-[2px] rounded-2xl bg-slate-800/50"></div>
                  </div>
                )}

                <div className="relative z-10">
                  <Input
                    type="text"
                    placeholder="Ask anything about products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch(searchQuery)}
                    className={`w-full h-16 px-6 pr-20 text-white placeholder-gray-400 text-lg rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-lg transition-all duration-300 ${!searchQuery
                      ? 'bg-transparent border-transparent'
                      : 'bg-slate-800/50 border-slate-700'
                      }`}
                    disabled={isSearching}
                  />
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
                    {recognitionRef.current && (
                      <button
                        className={`p-2 transition-colors ${isListening ? 'text-blue-400 animate-pulse' : 'text-gray-400 hover:text-white'}`}
                        onClick={handleMicClick}
                        aria-label={isListening ? "Stop listening" : "Start voice input"}
                        type="button"
                        disabled={isSearching}
                      >
                        <Mic size={20} />
                      </button>
                    )}
                    <button
                      onClick={() => handleSearch(searchQuery)}
                      className="p-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg transition-all duration-200 hover:scale-105 shadow-lg"
                    >
                      <ArrowUp size={20} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Suggestion Cards */}
              <div className="space-y-4 max-w-2xl mx-auto">
                {suggestionQueries.map((query, index) => (
                  <button
                    key={index}
                    onClick={() => handleSearch(query)}
                    className="w-full text-left p-4 bg-slate-800/30 hover:bg-slate-800/50 border border-slate-700 rounded-xl text-gray-300 hover:text-white transition-all duration-200 hover:border-blue-500/50 hover:shadow-lg"
                  >
                    <div className="flex items-center">
                      <Search size={16} className="mr-3 text-gray-400" />
                      {query}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}