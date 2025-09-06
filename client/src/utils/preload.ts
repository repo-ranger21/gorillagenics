// GuerillaGenics asset preloading utilities for performance optimization

interface PreloadConfig {
  priority?: 'high' | 'low';
  crossOrigin?: 'anonymous' | 'use-credentials';
  onLoad?: () => void;
  onError?: (error: Error) => void;
}

class AssetPreloader {
  private preloadedAssets = new Set<string>();
  private preloadPromises = new Map<string, Promise<void>>();

  // Preload a font file
  preloadFont(url: string, config: PreloadConfig = {}): Promise<void> {
    if (this.preloadedAssets.has(url)) {
      return this.preloadPromises.get(url) || Promise.resolve();
    }

    const promise = new Promise<void>((resolve, reject) => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'font';
      link.type = 'font/woff2';
      link.href = url;
      link.crossOrigin = config.crossOrigin || 'anonymous';

      link.onload = () => {
        console.log(`🦍 Preloaded font: ${url}`);
        config.onLoad?.();
        resolve();
      };

      link.onerror = () => {
        const error = new Error(`Failed to preload font: ${url}`);
        console.warn('🦍', error.message);
        config.onError?.(error);
        reject(error);
      };

      document.head.appendChild(link);
    });

    this.preloadedAssets.add(url);
    this.preloadPromises.set(url, promise);
    return promise;
  }

  // Preload an image
  preloadImage(url: string, config: PreloadConfig = {}): Promise<void> {
    if (this.preloadedAssets.has(url)) {
      return this.preloadPromises.get(url) || Promise.resolve();
    }

    const promise = new Promise<void>((resolve, reject) => {
      const img = new Image();
      
      img.onload = () => {
        console.log(`🦍 Preloaded image: ${url}`);
        config.onLoad?.();
        resolve();
      };

      img.onerror = () => {
        const error = new Error(`Failed to preload image: ${url}`);
        console.warn('🦍', error.message);
        config.onError?.(error);
        reject(error);
      };

      img.src = url;
    });

    this.preloadedAssets.add(url);
    this.preloadPromises.set(url, promise);
    return promise;
  }

  // Preload a generic resource
  preloadResource(url: string, as: string, config: PreloadConfig = {}): Promise<void> {
    if (this.preloadedAssets.has(url)) {
      return this.preloadPromises.get(url) || Promise.resolve();
    }

    const promise = new Promise<void>((resolve, reject) => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = as;
      link.href = url;
      
      if (config.crossOrigin) {
        link.crossOrigin = config.crossOrigin;
      }

      link.onload = () => {
        console.log(`🦍 Preloaded ${as}: ${url}`);
        config.onLoad?.();
        resolve();
      };

      link.onerror = () => {
        const error = new Error(`Failed to preload ${as}: ${url}`);
        console.warn('🦍', error.message);
        config.onError?.(error);
        reject(error);
      };

      document.head.appendChild(link);
    });

    this.preloadedAssets.add(url);
    this.preloadPromises.set(url, promise);
    return promise;
  }

  // Preload critical CSS
  preloadCSS(url: string, config: PreloadConfig = {}): Promise<void> {
    return this.preloadResource(url, 'style', config);
  }

  // Preload JavaScript
  preloadScript(url: string, config: PreloadConfig = {}): Promise<void> {
    return this.preloadResource(url, 'script', config);
  }

  // Get preload statistics
  getStats() {
    return {
      totalPreloaded: this.preloadedAssets.size,
      pendingPromises: this.preloadPromises.size,
      preloadedAssets: Array.from(this.preloadedAssets)
    };
  }

  // Check if asset is preloaded
  isPreloaded(url: string): boolean {
    return this.preloadedAssets.has(url);
  }
}

// Create singleton instance
export const preloader = new AssetPreloader();

// GuerillaGenics specific asset URLs
export const GORILLA_ASSETS = {
  // Fonts
  fonts: {
    primary: '/fonts/Inter-VariableFont_slnt_wght.woff2',
    heading: '/fonts/Bungee-Regular.woff2',
    mono: '/fonts/JetBrainsMono-Regular.woff2'
  },
  
  // Images
  images: {
    mascot: '/images/guerilla-mascot.svg',
    logo: '/images/guerilla-logo.svg',
    backgroundTexture: '/images/jungle-texture.webp',
    heroBackground: '/images/jungle-hero-bg.webp'
  },
  
  // Icons
  icons: {
    navigation: '/icons/nav-sprite.svg',
    sports: '/icons/sports-sprite.svg',
    ui: '/icons/ui-sprite.svg'
  }
};

// Preload critical GuerillaGenics assets
export async function preloadCriticalAssets(): Promise<void> {
  console.log('🦍 Starting critical asset preload...');
  
  const criticalAssets = [
    // Critical fonts
    preloader.preloadFont(GORILLA_ASSETS.fonts.primary, { priority: 'high' }),
    preloader.preloadFont(GORILLA_ASSETS.fonts.heading, { priority: 'high' }),
    
    // Critical images
    preloader.preloadImage(GORILLA_ASSETS.images.mascot, { priority: 'high' }),
    preloader.preloadImage(GORILLA_ASSETS.images.logo, { priority: 'high' })
  ];

  try {
    await Promise.allSettled(criticalAssets);
    console.log('🦍 Critical assets preloaded successfully');
  } catch (error) {
    console.warn('🦍 Some critical assets failed to preload:', error);
  }
}

// Preload non-critical assets
export async function preloadSecondaryAssets(): Promise<void> {
  console.log('🦍 Starting secondary asset preload...');
  
  const secondaryAssets = [
    // Secondary fonts
    preloader.preloadFont(GORILLA_ASSETS.fonts.mono, { priority: 'low' }),
    
    // Background images
    preloader.preloadImage(GORILLA_ASSETS.images.backgroundTexture, { priority: 'low' }),
    preloader.preloadImage(GORILLA_ASSETS.images.heroBackground, { priority: 'low' }),
    
    // Icon sprites
    preloader.preloadResource(GORILLA_ASSETS.icons.navigation, 'image', { priority: 'low' }),
    preloader.preloadResource(GORILLA_ASSETS.icons.sports, 'image', { priority: 'low' }),
    preloader.preloadResource(GORILLA_ASSETS.icons.ui, 'image', { priority: 'low' })
  ];

  try {
    await Promise.allSettled(secondaryAssets);
    console.log('🦍 Secondary assets preloaded successfully');
  } catch (error) {
    console.warn('🦍 Some secondary assets failed to preload:', error);
  }
}

// Preload fonts for better web vitals
export function addFontPreloadTags(): void {
  const fonts = [
    { href: GORILLA_ASSETS.fonts.primary, display: 'swap' },
    { href: GORILLA_ASSETS.fonts.heading, display: 'swap' },
    { href: GORILLA_ASSETS.fonts.mono, display: 'swap' }
  ];

  fonts.forEach(font => {
    // Check if already added
    const existing = document.querySelector(`link[href="${font.href}"]`);
    if (existing) return;

    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'font';
    link.type = 'font/woff2';
    link.href = font.href;
    link.crossOrigin = 'anonymous';
    
    // Add font-display for better performance
    const style = document.createElement('style');
    style.textContent = `
      @font-face {
        font-display: ${font.display};
        src: url('${font.href}');
      }
    `;
    
    document.head.appendChild(link);
    document.head.appendChild(style);
  });

  console.log('🦍 Font preload tags added to head');
}

// Initialize preloading
export function initializePreloading(): void {
  // Add font preload tags immediately
  addFontPreloadTags();
  
  // Start critical asset preloading
  preloadCriticalAssets();
  
  // Delay secondary assets to not block critical path
  setTimeout(() => {
    preloadSecondaryAssets();
  }, 1000);
}

// Utility to check if all critical assets are loaded
export function waitForCriticalAssets(): Promise<void> {
  return preloadCriticalAssets();
}

export default preloader;