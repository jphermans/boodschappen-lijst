import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Copy, Download, Share2, MessageCircle, Send } from 'lucide-react';
import QRCode from 'react-qr-code';

const QRShareModal = ({ listId, list, onClose }) => {
  // JavaScript-based mobile detection for more reliable results
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      // Multiple detection methods for better reliability
      const userAgent = navigator.userAgent.toLowerCase();
      const isMobileUA = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      const isSmallScreen = window.innerWidth < 1024; // Less than desktop size
      
      // Consider it mobile if any of these conditions are true
      const mobile = isMobileUA || isTouchDevice || isSmallScreen;
      setIsMobile(mobile);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  const shareUrl = `${window.location.origin}${window.location.pathname}#/shared/${listId}`;
  const isOwner = list?.isCreator || false;
  const listName = list?.name || 'Boodschappenlijst';
  
  // Create a nice share message
  const shareMessage = `🛒 ${listName}\n\nIk deel mijn boodschappenlijst met je! Klik op de link om de lijst te bekijken en items toe te voegen:\n\n${shareUrl}`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      const button = event.target.closest('button');
      const originalText = button.innerHTML;
      button.innerHTML = '<span class="inline-flex items-center"><svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>Gekopieerd!</span>';
      setTimeout(() => {
        button.innerHTML = originalText;
      }, 2000);
    } catch (err) {
      console.error('Kon link niet kopiëren:', err);
      alert('Kon link niet kopiëren. Probeer handmatig te selecteren.');
    }
  };

  const downloadQR = () => {
    const svg = document.getElementById('qr-code');
    if (svg) {
      const svgData = new XMLSerializer().serializeToString(svg);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        
        const a = document.createElement('a');
        a.href = canvas.toDataURL('image/png');
        a.download = `boodschappenlijst-${listId}.png`;
        a.click();
      };
      
      img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
    }
  };

  // Direct sharing functions
  const shareViaWhatsApp = () => {
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareMessage)}`;
    window.open(whatsappUrl, '_blank');
  };

  const shareViaTelegram = () => {
    const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(`🛒 ${listName} - Boodschappenlijst`)}`;
    window.open(telegramUrl, '_blank');
  };

  const shareViaEmail = () => {
    const subject = encodeURIComponent(`🛒 ${listName} - Gedeelde Boodschappenlijst`);
    const body = encodeURIComponent(`Hallo!\n\nIk deel mijn boodschappenlijst "${listName}" met je.\n\nKlik op deze link om de lijst te bekijken en items toe te voegen:\n${shareUrl}\n\nGroeten!`);
    const emailUrl = `mailto:?subject=${subject}&body=${body}`;
    window.open(emailUrl);
  };

  const shareViaNativeAPI = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `🛒 ${listName}`,
          text: `Bekijk mijn boodschappenlijst "${listName}"`,
          url: shareUrl,
        });
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Error sharing:', err);
          // Fallback to copy to clipboard
          copyToClipboard();
        }
      }
    } else {
      // Fallback to copy to clipboard
      copyToClipboard();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-start lg:pt-[88px] justify-center p-4 z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-[rgb(var(--card-bg))] rounded-2xl shadow-xl w-full max-w-md max-h-[calc(100vh-2rem)] lg:max-h-[calc(100vh-88px)] flex flex-col mt-0 relative"
        onClick={(e) => e.stopPropagation()}
        style={{
          WebkitOverflowScrolling: 'touch', // Enable smooth scrolling on iOS
          overscrollBehavior: 'contain' // Prevent scroll chaining
        }}
      >
        {/* Always visible close button for mobile - multiple fallback approaches */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 z-50 p-3 rounded-full bg-red-500 hover:bg-red-600 shadow-2xl border-2 border-white transition-all duration-200 transform hover:scale-110 md:hidden"
          style={{
            backgroundColor: '#ef4444',
            borderColor: '#ffffff',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3), 0 4px 10px rgba(0, 0, 0, 0.2)',
            minWidth: '48px',
            minHeight: '48px'
          }}
          aria-label="Sluiten"
        >
          <X className="w-6 h-6 text-white" />
        </button>

        {/* Backup close button - always visible on small screens */}
        <button
          onClick={onClose}
          className="absolute top-2 left-2 z-50 px-3 py-2 rounded-lg bg-black bg-opacity-70 text-white text-sm font-medium hover:bg-opacity-80 transition-all duration-200 md:hidden"
          style={{
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
          }}
        >
          ✕ Sluiten
        </button>

        <div className="flex items-center justify-between p-6 border-b border-[rgb(var(--border-color))]/50 flex-shrink-0">
          <h2 className="text-xl font-semibold text-[rgb(var(--card-text))] pr-20 md:pr-0">
            {isOwner ? 'Deel boodschappenlijst' : 'Doorsturen boodschappenlijst'}
          </h2>
          {/* Desktop close button - visible on medium screens and up */}
          <button
            onClick={onClose}
            className="hidden md:flex p-2 rounded-lg hover:bg-[rgb(var(--border-color))]/20 transition-colors"
          >
            <X className="w-5 h-5 text-[rgb(var(--text-color))]/60" />
          </button>
        </div>

        {/* Scrollable content area with enhanced mobile scrolling */}
        <div
          className="flex-1 overflow-y-auto overscroll-contain"
          style={{
            WebkitOverflowScrolling: 'touch',
            scrollBehavior: 'smooth',
            overscrollBehavior: 'contain',
            touchAction: 'pan-y' // Allow vertical scrolling only
          }}
        >
          <div className="p-6 space-y-6 pb-8">
          <div className="text-center">
            <p className="text-[rgb(var(--text-color))]/80 mb-4">
              {isOwner
                ? 'Scan de QR-code om deze boodschappenlijst te delen'
                : 'Scan de QR-code om deze gedeelde boodschappenlijst door te sturen'
              }
            </p>
            
            <div className="flex justify-center mb-4">
              <div className="bg-white p-4 rounded-lg shadow-lg border border-[rgb(var(--border-color))]/20">
                <QRCode
                  id="qr-code"
                  value={shareUrl}
                  size={200}
                  level="H"
                  className="w-full h-full"
                  bgColor="#ffffff"
                  fgColor="#000000"
                />
              </div>
            </div>

            <div className="text-sm text-[rgb(var(--text-color))]/80 mb-4">
              <p className="font-medium mb-2">Deellink:</p>
              <p className="text-xs break-all font-mono bg-[rgb(var(--border-color))]/20 p-2 rounded">
                {shareUrl}
              </p>
            </div>

            {/* Direct Sharing Buttons */}
            <div className="space-y-3">
              <p className="text-sm font-medium text-[rgb(var(--card-text))] text-center">
                Direct delen via:
              </p>
              
              {/* Primary sharing options */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={shareViaWhatsApp}
                  className="flex items-center justify-center space-x-2 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span className="font-medium text-sm">WhatsApp</span>
                </button>
                
                <button
                  onClick={shareViaTelegram}
                  className="flex items-center justify-center space-x-2 px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                >
                  <Send className="w-4 h-4" />
                  <span className="font-medium text-sm">Telegram</span>
                </button>
              </div>
              
              {/* Secondary sharing options */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={shareViaEmail}
                  className="flex items-center justify-center space-x-2 px-4 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                >
                  <span className="text-sm">📧</span>
                  <span className="font-medium text-sm">E-mail</span>
                </button>
                
                <button
                  onClick={shareViaNativeAPI}
                  className="flex items-center justify-center space-x-2 px-4 py-3 bg-[rgb(var(--color-info-button))] hover:opacity-90 text-white rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                >
                  <Share2 className="w-4 h-4" />
                  <span className="font-medium text-sm">Meer...</span>
                </button>
              </div>
            </div>

            {/* Traditional options */}
            <div className="flex space-x-3 pt-2 border-t border-[rgb(var(--border-color))]/20">
              <button
                onClick={copyToClipboard}
                className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-[rgb(var(--color-primary-button))] hover:opacity-90 text-white rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              >
                <Copy className="w-4 h-4" />
                <span className="font-medium">📋 Kopieer</span>
              </button>
              <button
                onClick={downloadQR}
                className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-[rgb(var(--color-secondary-button))] hover:opacity-90 text-white rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              >
                <Download className="w-4 h-4" />
                <span className="font-medium">💾 QR</span>
              </button>
            </div>
          </div>

          <div className="text-xs text-[rgb(var(--text-color))]/60 text-center space-y-2">
            <p>
              <strong>{isOwner ? 'Delen met anderen:' : 'Doorsturen naar anderen:'}</strong>
            </p>
            <div className="bg-[rgb(var(--border-color))]/10 p-3 rounded-lg text-left">
              <p className="mb-1">✅ Anderen kunnen items toevoegen en bewerken</p>
              <p className="mb-1">✅ Anderen kunnen items als voltooid markeren</p>
              {isOwner ? (
                <p className="text-accent">🔒 Alleen jij kunt de lijst verwijderen</p>
              ) : (
                <p className="text-accent">🔒 Alleen de eigenaar kan de lijst verwijderen</p>
              )}
            </div>

            {/* Mobile-only close button at bottom with extra spacing */}
            <div className="md:hidden mt-8 pt-6 border-t border-[rgb(var(--border-color))]/20">
              <button
                onClick={onClose}
                className="w-full py-4 px-6 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl shadow-lg transition-all duration-200 transform hover:scale-105"
              >
                <div className="flex items-center justify-center space-x-2">
                  <X className="w-5 h-5" />
                  <span>Sluiten</span>
                </div>
              </button>
              {/* Extra padding at bottom to ensure scrolling reaches the button */}
              <div className="h-8"></div>
            </div>
          </div>
        </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default QRShareModal;