import React, { useState, useEffect } from 'react';
import { ShoppingCart, Eye, Download, TrendingUp, User } from 'lucide-react';

export default function RecommenderDashboard() {
  const [userId, setUserId] = useState('user_001');
  const [products, setProducts] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('explore');

  const API_BASE = 'http://localhost:5000/api';

  // Fetch products on mount
  useEffect(() => {
    fetchProducts();
  }, []);

  // Fetch recommendations when user changes
  useEffect(() => {
    if (userId) {
      fetchRecommendations();
      fetchUserProfile();
    }
  }, [userId]);

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${API_BASE}/products`);
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/recommendations/${userId}?count=4`);
      const data = await response.json();
      setRecommendations(data.recommendations || []);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserProfile = async () => {
    try {
      const response = await fetch(`${API_BASE}/user/${userId}/profile`);
      const data = await response.json();
      setUserProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const trackInteraction = async (productId, type) => {
    try {
      await fetch(`${API_BASE}/user/${userId}/track`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: productId, type })
      });
      // Refresh recommendations and profile
      setTimeout(() => {
        fetchRecommendations();
        fetchUserProfile();
      }, 500);
    } catch (error) {
      console.error('Error tracking interaction:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="bg-slate-950 border-b border-slate-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <TrendingUp className="text-purple-400" size={32} />
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Product Recommender
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <input
                type="text"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="Enter user ID"
                className="px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-purple-400"
              />
              <button
                onClick={() => setUserId(`user_${Math.floor(Math.random() * 10000)}`)}
                className="px-3 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white text-sm font-medium transition"
              >
                Random User
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Tab Navigation */}
        <div className="flex gap-4 mb-8 border-b border-slate-700">
          {['explore', 'recommendations', 'profile'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 font-medium transition border-b-2 ${
                activeTab === tab
                  ? 'border-purple-400 text-purple-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Explore Products Tab */}
        {activeTab === 'explore' && (
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">Product Catalog</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="bg-slate-800 border border-slate-700 rounded-lg p-6 hover:border-purple-400 transition group"
                >
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-semibold text-white group-hover:text-purple-400 transition">
                      {product.name}
                    </h3>
                    <span className="text-pink-400 font-bold text-lg">${product.price}</span>
                  </div>
                  
                  <p className="text-slate-400 text-sm mb-4">{product.category}</p>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {product.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs px-2 py-1 bg-purple-900 bg-opacity-50 text-purple-300 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => trackInteraction(product.id, 'view')}
                      className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-2 rounded flex items-center justify-center gap-2 transition text-sm"
                    >
                      <Eye size={16} /> View
                    </button>
                    <button
                      onClick={() => trackInteraction(product.id, 'purchase')}
                      className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 rounded flex items-center justify-center gap-2 transition text-sm"
                    >
                      <ShoppingCart size={16} /> Buy
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recommendations Tab */}
        {activeTab === 'recommendations' && (
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">Personalized Recommendations</h2>
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin">
                  <TrendingUp className="text-purple-400" size={32} />
                </div>
                <p className="text-slate-300 mt-4">Generating personalized recommendations...</p>
              </div>
            ) : recommendations.length > 0 ? (
              <div className="space-y-6">
                {recommendations.map((rec, idx) => (
                  <div
                    key={idx}
                    className="bg-gradient-to-r from-slate-800 to-slate-750 border border-slate-700 rounded-lg p-6 hover:border-purple-400 transition"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-white mb-1">{rec.product.name}</h3>
                        <p className="text-slate-400 text-sm">
                          {rec.product.category} • ${rec.product.price}
                        </p>
                      </div>
                      <span className="bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                        Rec #{idx + 1}
                      </span>
                    </div>

                    <div className="bg-slate-900 bg-opacity-50 border-l-4 border-pink-400 rounded p-4 mb-4">
                      <p className="text-slate-200 text-sm leading-relaxed">
                        <span className="font-semibold text-pink-300">Why this pick? </span>
                        {rec.explanation}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {rec.product.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-xs px-2 py-1 bg-purple-900 bg-opacity-50 text-purple-300 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    <button
                      onClick={() => trackInteraction(rec.product.id, 'purchase')}
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-2 rounded font-medium transition"
                    >
                      Add to Cart
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-slate-800 border border-slate-700 rounded-lg p-12 text-center">
                <p className="text-slate-400 mb-4">No recommendations yet</p>
                <p className="text-slate-500 text-sm">Browse and interact with products to get personalized recommendations</p>
              </div>
            )}
          </div>
        )}

        {/* User Profile Tab */}
        {activeTab === 'profile' && (
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">User Profile & History</h2>
            {userProfile ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Stats */}
                <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <User className="text-purple-400" size={24} />
                    <h3 className="text-lg font-semibold text-white">User Stats</h3>
                  </div>
                  <div className="space-y-4">
                    <div className="bg-slate-900 p-4 rounded">
                      <p className="text-slate-400 text-sm">User ID</p>
                      <p className="text-white font-mono text-lg">{userProfile.user_id}</p>
                    </div>
                    <div className="bg-slate-900 p-4 rounded">
                      <p className="text-slate-400 text-sm">Products Viewed</p>
                      <p className="text-purple-400 font-bold text-2xl">{userProfile.viewed_count}</p>
                    </div>
                    <div className="bg-slate-900 p-4 rounded">
                      <p className="text-slate-400 text-sm">Purchases</p>
                      <p className="text-pink-400 font-bold text-2xl">{userProfile.purchase_count}</p>
                    </div>
                  </div>
                </div>

                {/* Favorite Categories */}
                <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Favorite Categories</h3>
                  <div className="space-y-3">
                    {Object.entries(userProfile.favorite_categories)
                      .filter(([_, count]) => count > 0)
                      .sort((a, b) => b[1] - a[1])
                      .map(([category, count]) => (
                        <div key={category}>
                          <div className="flex justify-between mb-1">
                            <span className="text-slate-200 text-sm">{category}</span>
                            <span className="text-purple-400 font-bold">{count}</span>
                          </div>
                          <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                              style={{ width: `${(count / 10) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    {Object.values(userProfile.favorite_categories).every(c => c === 0) && (
                      <p className="text-slate-500 text-sm">No category preferences yet</p>
                    )}
                  </div>
                </div>

                {/* History */}
                <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
                  <div className="space-y-3">
                    {userProfile.purchased_products.length > 0 && (
                      <div>
                        <p className="text-slate-400 text-xs mb-2 font-semibold">PURCHASED</p>
                        <div className="space-y-2">
                          {userProfile.purchased_products.map((product, i) => (
                            <p key={i} className="text-slate-200 text-sm truncate">✓ {product}</p>
                          ))}
                        </div>
                      </div>
                    )}
                    {userProfile.viewed_products.length > 0 && (
                      <div className="pt-4 border-t border-slate-700">
                        <p className="text-slate-400 text-xs mb-2 font-semibold">VIEWED</p>
                        <div className="space-y-2">
                          {userProfile.viewed_products.map((product, i) => (
                            <p key={i} className="text-slate-300 text-sm truncate">○ {product}</p>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-slate-800 border border-slate-700 rounded-lg p-12 text-center">
                <p className="text-slate-400">Loading profile...</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}