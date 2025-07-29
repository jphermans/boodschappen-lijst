import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, BarChart3, Users, Share2, List, TrendingUp, Calendar, Eye, Shield, Activity } from 'lucide-react';
import { getCurrentUserID } from '../firebase';

const AnalyticsDashboard = ({ lists, onClose }) => {
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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-[rgb(var(--card-bg))] rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[rgb(var(--border-color))]/50">
          <div className="flex items-center space-x-3">
            <BarChart3 className="w-6 h-6 text-primary" />
            <div>
              <h2 className="text-xl font-semibold text-[rgb(var(--card-text))]">
                Analytics Dashboard
              </h2>
              <p className="text-sm text-[rgb(var(--text-color))]/60">
                Overzicht van je lijsten en delen-activiteit
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-[rgb(var(--border-color))]/20 transition-colors"
          >
            <X className="w-5 h-5 text-[rgb(var(--text-color))]/60" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[75vh]">
          {/* Overview Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg p-4 text-center">
              <List className="w-8 h-8 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold text-[rgb(var(--card-text))]">{analytics.totalLists}</div>
              <div className="text-sm text-[rgb(var(--text-color))]/60">Totaal lijsten</div>
            </div>
            
            <div className="bg-gradient-to-br from-secondary/10 to-secondary/5 rounded-lg p-4 text-center">
              <Shield className="w-8 h-8 text-secondary mx-auto mb-2" />
              <div className="text-2xl font-bold text-[rgb(var(--card-text))]">{analytics.totalOwnedLists}</div>
              <div className="text-sm text-[rgb(var(--text-color))]/60">Eigenaar van</div>
            </div>
            
            <div className="bg-gradient-to-br from-accent/10 to-accent/5 rounded-lg p-4 text-center">
              <Users className="w-8 h-8 text-accent mx-auto mb-2" />
              <div className="text-2xl font-bold text-[rgb(var(--card-text))]">{analytics.totalSharedLists}</div>
              <div className="text-sm text-[rgb(var(--text-color))]/60">Gedeeld met jou</div>
            </div>
            
            <div className="bg-gradient-to-br from-green-500/10 to-green-500/5 rounded-lg p-4 text-center">
              <Share2 className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-[rgb(var(--card-text))]">{analytics.totalShares}</div>
              <div className="text-sm text-[rgb(var(--text-color))]/60">Keer gedeeld</div>
            </div>
          </div>

          {/* Detailed Statistics */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Sharing Statistics */}
            <div className="bg-[rgb(var(--border-color))]/10 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-[rgb(var(--card-text))] mb-4 flex items-center">
                <Share2 className="w-5 h-5 mr-2 text-secondary" />
                Deel Statistieken
              </h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-[rgb(var(--text-color))]/80">Totaal gedeelde gebruikers:</span>
                  <span className="font-semibold text-[rgb(var(--card-text))]">{analytics.totalSharedUsers}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-[rgb(var(--text-color))]/80">Gemiddeld per lijst:</span>
                  <span className="font-semibold text-[rgb(var(--card-text))]">
                    {analytics.totalOwnedLists > 0 ? 
                      Math.round((analytics.totalShares / analytics.totalOwnedLists) * 10) / 10 : 0}
                  </span>
                </div>
                
                {analytics.mostSharedList && (
                  <div className="pt-2 border-t border-[rgb(var(--border-color))]/20">
                    <div className="text-sm text-[rgb(var(--text-color))]/60 mb-1">Meest gedeelde lijst:</div>
                    <div className="font-medium text-[rgb(var(--card-text))]">
                      {analytics.mostSharedList.name}
                    </div>
                    <div className="text-sm text-secondary">
                      {analytics.maxShares} gebruiker{analytics.maxShares !== 1 ? 's' : ''}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Activity Statistics */}
            <div className="bg-[rgb(var(--border-color))]/10 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-[rgb(var(--card-text))] mb-4 flex items-center">
                <Activity className="w-5 h-5 mr-2 text-primary" />
                Activiteit Overzicht
              </h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-[rgb(var(--text-color))]/80">Totaal items:</span>
                  <span className="font-semibold text-[rgb(var(--card-text))]">{analytics.totalItems}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-[rgb(var(--text-color))]/80">Afgerond:</span>
                  <span className="font-semibold text-[rgb(var(--card-text))]">{analytics.completedItems}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-[rgb(var(--text-color))]/80">Voltooiingspercentage:</span>
                  <span className="font-semibold text-green-500">{analytics.completionRate}%</span>
                </div>
                
                <div className="pt-2 border-t border-[rgb(var(--border-color))]/20">
                  <div className="w-full bg-[rgb(var(--border-color))]/20 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-green-500 to-green-400 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${analytics.completionRate}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Top Lists by Size */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-[rgb(var(--card-text))] mb-4 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-accent" />
              Grootste Lijsten
            </h3>
            
            <div className="bg-[rgb(var(--border-color))]/10 rounded-lg p-4">
              {analytics.listSizes.slice(0, 5).map((list, index) => (
                <div key={index} className="flex items-center justify-between py-2 border-b border-[rgb(var(--border-color))]/10 last:border-b-0">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center text-sm font-medium text-primary">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium text-[rgb(var(--card-text))]">{list.name}</div>
                      <div className="text-xs text-[rgb(var(--text-color))]/60">
                        {list.isOwned ? 'Eigenaar' : 'Gedeeld'}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-[rgb(var(--card-text))]">{list.size}</div>
                    <div className="text-xs text-[rgb(var(--text-color))]/60">items</div>
                  </div>
                </div>
              ))}
              
              {analytics.listSizes.length === 0 && (
                <div className="text-center py-4 text-[rgb(var(--text-color))]/60">
                  Geen lijsten gevonden
                </div>
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div>
            <h3 className="text-lg font-semibold text-[rgb(var(--card-text))] mb-4 flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-secondary" />
              Recente Activiteit
            </h3>
            
            <div className="bg-[rgb(var(--border-color))]/10 rounded-lg p-4">
              {analytics.recentActivity.map((list, index) => (
                <div key={index} className="flex items-center justify-between py-3 border-b border-[rgb(var(--border-color))]/10 last:border-b-0">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div>
                      <div className="font-medium text-[rgb(var(--card-text))]">{list.name}</div>
                      <div className="text-sm text-[rgb(var(--text-color))]/60">
                        {list.items?.length || 0} items • {list.isCreator ? 'Eigenaar' : 'Gedeeld'}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-[rgb(var(--text-color))]/80">
                      {getTimeAgo(list.updatedAt)}
                    </div>
                  </div>
                </div>
              ))}
              
              {analytics.recentActivity.length === 0 && (
                <div className="text-center py-4 text-[rgb(var(--text-color))]/60">
                  Geen recente activiteit
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-[rgb(var(--border-color))]/50 p-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-[rgb(var(--text-color))]/60">
              <Eye className="w-4 h-4 inline mr-1" />
              Gegevens worden lokaal berekend en niet opgeslagen
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-primary hover:opacity-90 text-white rounded-lg transition-colors"
            >
              Sluiten
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AnalyticsDashboard;