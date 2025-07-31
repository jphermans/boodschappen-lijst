import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, BarChart3, Users, Share2, List, TrendingUp, Calendar, Eye, Shield, Activity } from 'lucide-react';
import { getCurrentUserID } from '../firebase';

const AnalyticsPage = ({ lists, onBack }) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState('all');
  const currentUserId = getCurrentUserID();

  // Calculate analytics data
  const analytics = React.useMemo(() => {
    const ownedLists = lists.filter(list => list.isCreator);
    const sharedLists = lists.filter(list => !list.isCreator);
    
    // Total statistics
    const totalLists = lists.length;
    const totalOwnedLists = ownedLists.length;
    const totalSharedLists = sharedLists.length;
    
    // Sharing statistics
    let totalSharedUsers = 0;
    let totalShares = 0;
    let mostSharedList = null;
    let maxShares = 0;
    
    ownedLists.forEach(list => {
      const shareCount = (list.sharedWith || []).length;
      totalSharedUsers += shareCount;
      totalShares += shareCount;
      
      if (shareCount > maxShares) {
        maxShares = shareCount;
        mostSharedList = list;
      }
    });
    
    // Activity statistics
    const recentActivity = lists
      .filter(list => list.updatedAt)
      .sort((a, b) => {
        const dateA = a.updatedAt.toDate ? a.updatedAt.toDate() : new Date(a.updatedAt);
        const dateB = b.updatedAt.toDate ? b.updatedAt.toDate() : new Date(b.updatedAt);
        return dateB - dateA;
      })
      .slice(0, 5);
    
    // Items statistics
    const totalItems = lists.reduce((sum, list) => sum + (list.items || []).length, 0);
    const completedItems = lists.reduce((sum, list) => 
      sum + (list.items || []).filter(item => item.completed).length, 0
    );
    const completionRate = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
    
    // List size distribution
    const listSizes = lists.map(list => ({
      name: list.name,
      size: (list.items || []).length,
      isOwned: list.isCreator
    })).sort((a, b) => b.size - a.size);
    
    // Sharing distribution
    const sharingDistribution = ownedLists.map(list => ({
      name: list.name,
      shares: (list.sharedWith || []).length,
      createdAt: list.createdAt
    })).sort((a, b) => b.shares - a.shares);
    
    return {
      totalLists,
      totalOwnedLists,
      totalSharedLists,
      totalSharedUsers,
      totalShares,
      mostSharedList,
      maxShares,
      recentActivity,
      totalItems,
      completedItems,
      completionRate,
      listSizes,
      sharingDistribution
    };
  }, [lists]);

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Onbekend';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('nl-NL', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getTimeAgo = (timestamp) => {
    if (!timestamp) return 'Onbekend';
    
    const now = new Date();
    const time = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const diffMs = now - time;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffHours < 1) return 'Zojuist';
    if (diffHours < 24) return `${diffHours} uur geleden`;
    if (diffDays === 1) return 'Gisteren';
    if (diffDays < 7) return `${diffDays} dagen geleden`;
    return formatDate(timestamp);
  };

  return (
    <div className="min-h-screen-safe bg-[rgb(var(--bg-color))] transition-colors duration-300">
      {/* Safe area background extension */}
      <div className="fixed inset-x-0 top-0 h-[var(--safe-area-inset-top)] bg-[rgb(var(--card-bg))] z-50"></div>
      
      {/* Header */}
      <header className="fixed-top-safe bg-[rgb(var(--card-bg))] shadow-sm border-b border-[rgb(var(--border-color))]/20 header-safe-area">
        <div className="max-w-[1920px] mx-auto px-4 lg:px-8 xl:px-12 safe-area-x">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Back Button and Title */}
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="flex items-center justify-center w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-[rgb(var(--border-color))]/20 hover:bg-[rgb(var(--border-color))]/30 text-[rgb(var(--card-text))] transition-all duration-200 group"
                aria-label="Terug naar overzicht"
              >
                <ArrowLeft className="w-5 h-5 lg:w-6 lg:h-6 group-hover:-translate-x-1 transition-transform duration-200" />
              </button>
              <div>
                <h1 className="text-xl lg:text-2xl xl:text-3xl font-bold text-[rgb(var(--card-text))] tracking-tight">
                  Analytics Dashboard
                </h1>
                <p className="hidden lg:block text-sm text-[rgb(var(--text-color))]/60 font-medium">
                  Overzicht van je lijsten en delen-activiteit
                </p>
              </div>
            </div>

            {/* Analytics Icon */}
            <div className="flex items-center justify-center w-10 h-10 lg:w-12 lg:h-12 bg-[rgb(var(--primary-color))] rounded-xl shadow-lg">
              <BarChart3 className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 lg:px-8 xl:px-12 py-6 lg:py-8 xl:py-12 safe-area-x content-safe-area" style={{ paddingTop: 'calc(var(--header-height) + 1.5rem)' }}>
        <div className="space-y-8">
          {/* Overview Statistics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6"
          >
            <div className="bg-[rgb(var(--primary-color))]/10 rounded-xl lg:rounded-2xl p-4 lg:p-6 text-center">
              <List className="w-8 h-8 lg:w-10 lg:h-10 text-[rgb(var(--primary-color))] mx-auto mb-3" />
              <div className="text-2xl lg:text-3xl font-bold text-[rgb(var(--card-text))]">{analytics.totalLists}</div>
              <div className="text-sm lg:text-base text-[rgb(var(--text-color))]/60">Totaal lijsten</div>
            </div>
            
            <div className="bg-[rgb(var(--secondary-color))]/10 rounded-xl lg:rounded-2xl p-4 lg:p-6 text-center">
              <Shield className="w-8 h-8 lg:w-10 lg:h-10 text-[rgb(var(--secondary-color))] mx-auto mb-3" />
              <div className="text-2xl lg:text-3xl font-bold text-[rgb(var(--card-text))]">{analytics.totalOwnedLists}</div>
              <div className="text-sm lg:text-base text-[rgb(var(--text-color))]/60">Eigenaar van</div>
            </div>
            
            <div className="bg-[rgb(var(--accent-color))]/10 rounded-xl lg:rounded-2xl p-4 lg:p-6 text-center">
              <Users className="w-8 h-8 lg:w-10 lg:h-10 text-[rgb(var(--accent-color))] mx-auto mb-3" />
              <div className="text-2xl lg:text-3xl font-bold text-[rgb(var(--card-text))]">{analytics.totalSharedLists}</div>
              <div className="text-sm lg:text-base text-[rgb(var(--text-color))]/60">Gedeeld met jou</div>
            </div>
            
            <div className="bg-[rgb(var(--success-color))]/10 rounded-xl lg:rounded-2xl p-4 lg:p-6 text-center">
              <Share2 className="w-8 h-8 lg:w-10 lg:h-10 text-[rgb(var(--success-color))] mx-auto mb-3" />
              <div className="text-2xl lg:text-3xl font-bold text-[rgb(var(--card-text))]">{analytics.totalShares}</div>
              <div className="text-sm lg:text-base text-[rgb(var(--text-color))]/60">Keer gedeeld</div>
            </div>
          </motion.div>

          {/* Detailed Statistics */}
          <div className="grid lg:grid-cols-2 gap-6 lg:gap-8">
            {/* Sharing Statistics */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-[rgb(var(--card-bg))] rounded-2xl shadow-lg border border-[rgb(var(--border-color))]/20 p-6 lg:p-8"
            >
              <h2 className="text-xl lg:text-2xl font-bold text-[rgb(var(--card-text))] mb-6 flex items-center">
                <Share2 className="w-6 h-6 mr-3 text-[rgb(var(--secondary-color))]" />
                Deel Statistieken
              </h2>
              
              <div className="space-y-4 lg:space-y-6">
                <div className="flex justify-between items-center">
                  <span className="text-[rgb(var(--text-color))]/80">Totaal gedeelde gebruikers:</span>
                  <span className="font-semibold text-[rgb(var(--card-text))] text-lg">{analytics.totalSharedUsers}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-[rgb(var(--text-color))]/80">Gemiddeld per lijst:</span>
                  <span className="font-semibold text-[rgb(var(--card-text))] text-lg">
                    {analytics.totalOwnedLists > 0 ? 
                      Math.round((analytics.totalShares / analytics.totalOwnedLists) * 10) / 10 : 0}
                  </span>
                </div>
                
                {analytics.mostSharedList && (
                  <div className="pt-4 border-t border-[rgb(var(--border-color))]/20">
                    <div className="text-sm text-[rgb(var(--text-color))]/60 mb-2">Meest gedeelde lijst:</div>
                    <div className="font-medium text-[rgb(var(--card-text))] text-lg">
                      {analytics.mostSharedList.name}
                    </div>
                    <div className="text-sm text-[rgb(var(--secondary-color))]">
                      {analytics.maxShares} gebruiker{analytics.maxShares !== 1 ? 's' : ''}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Activity Statistics */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-[rgb(var(--card-bg))] rounded-2xl shadow-lg border border-[rgb(var(--border-color))]/20 p-6 lg:p-8"
            >
              <h2 className="text-xl lg:text-2xl font-bold text-[rgb(var(--card-text))] mb-6 flex items-center">
                <Activity className="w-6 h-6 mr-3 text-[rgb(var(--primary-color))]" />
                Activiteit Overzicht
              </h2>
              
              <div className="space-y-4 lg:space-y-6">
                <div className="flex justify-between items-center">
                  <span className="text-[rgb(var(--text-color))]/80">Totaal items:</span>
                  <span className="font-semibold text-[rgb(var(--card-text))] text-lg">{analytics.totalItems}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-[rgb(var(--text-color))]/80">Afgerond:</span>
                  <span className="font-semibold text-[rgb(var(--card-text))] text-lg">{analytics.completedItems}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-[rgb(var(--text-color))]/80">Voltooiingspercentage:</span>
                  <span className="font-semibold text-[rgb(var(--success-color))] text-lg">{analytics.completionRate}%</span>
                </div>
                
                <div className="pt-4 border-t border-[rgb(var(--border-color))]/20">
                  <div className="progress-bar-container h-3">
                    <div
                      className="progress-bar-fill"
                      style={{ width: `${analytics.completionRate}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Top Lists by Size */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-[rgb(var(--card-bg))] rounded-2xl shadow-lg border border-[rgb(var(--border-color))]/20 p-6 lg:p-8"
          >
            <h2 className="text-xl lg:text-2xl font-bold text-[rgb(var(--card-text))] mb-6 flex items-center">
              <TrendingUp className="w-6 h-6 mr-3 text-[rgb(var(--accent-color))]" />
              Grootste Lijsten
            </h2>
            
            <div className="space-y-3">
              {analytics.listSizes.slice(0, 5).map((list, index) => (
                <div key={index} className="flex items-center justify-between py-3 lg:py-4 border-b border-[rgb(var(--border-color))]/10 last:border-b-0">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 lg:w-12 lg:h-12 bg-[rgb(var(--primary-color))]/20 rounded-full flex items-center justify-center text-sm lg:text-base font-medium text-[rgb(var(--primary-color))]">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium text-[rgb(var(--card-text))] text-base lg:text-lg">{list.name}</div>
                      <div className="text-sm text-[rgb(var(--text-color))]/60">
                        {list.isOwned ? 'Eigenaar' : 'Gedeeld'}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-[rgb(var(--card-text))] text-lg lg:text-xl">{list.size}</div>
                    <div className="text-sm text-[rgb(var(--text-color))]/60">items</div>
                  </div>
                </div>
              ))}
              
              {analytics.listSizes.length === 0 && (
                <div className="text-center py-8 text-[rgb(var(--text-color))]/60">
                  Geen lijsten gevonden
                </div>
              )}
            </div>
          </motion.div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-[rgb(var(--card-bg))] rounded-2xl shadow-lg border border-[rgb(var(--border-color))]/20 p-6 lg:p-8"
          >
            <h2 className="text-xl lg:text-2xl font-bold text-[rgb(var(--card-text))] mb-6 flex items-center">
              <Calendar className="w-6 h-6 mr-3 text-[rgb(var(--secondary-color))]" />
              Recente Activiteit
            </h2>
            
            <div className="space-y-3">
              {analytics.recentActivity.map((list, index) => (
                <div key={index} className="flex items-center justify-between py-3 lg:py-4 border-b border-[rgb(var(--border-color))]/10 last:border-b-0">
                  <div className="flex items-center space-x-4">
                    <div className="w-3 h-3 bg-[rgb(var(--success-color))] rounded-full flex-shrink-0"></div>
                    <div>
                      <div className="font-medium text-[rgb(var(--card-text))] text-base lg:text-lg">{list.name}</div>
                      <div className="text-sm text-[rgb(var(--text-color))]/60">
                        {list.items?.length || 0} items • {list.isCreator ? 'Eigenaar' : 'Gedeeld'}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm lg:text-base text-[rgb(var(--text-color))]/80">
                      {getTimeAgo(list.updatedAt)}
                    </div>
                  </div>
                </div>
              ))}
              
              {analytics.recentActivity.length === 0 && (
                <div className="text-center py-8 text-[rgb(var(--text-color))]/60">
                  Geen recente activiteit
                </div>
              )}
            </div>
          </motion.div>

          {/* Footer Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-[rgb(var(--card-bg))] rounded-2xl shadow-lg border border-[rgb(var(--border-color))]/20 p-6 lg:p-8"
          >
            <div className="flex items-center justify-center text-[rgb(var(--text-color))]/60">
              <Eye className="w-5 h-5 mr-2" />
              <span className="text-sm lg:text-base">Gegevens worden lokaal berekend en niet opgeslagen</span>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default AnalyticsPage;