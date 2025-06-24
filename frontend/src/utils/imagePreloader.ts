// Advanced Image Preloader for Instant Loading
export class ImagePreloader {
  private static instance: ImagePreloader;
  private loadedImages = new Set<string>();
  private loadingPromises = new Map<string, Promise<void>>();

  static getInstance(): ImagePreloader {
    if (!ImagePreloader.instance) {
      ImagePreloader.instance = new ImagePreloader();
    }
    return ImagePreloader.instance;
  }

  async preloadImage(src: string): Promise<void> {
    if (this.loadedImages.has(src)) {
      return Promise.resolve();
    }

    if (this.loadingPromises.has(src)) {
      return this.loadingPromises.get(src)!;
    }

    const promise = new Promise<void>((resolve, reject) => {
      const img = new Image();
      
      img.onload = () => {
        this.loadedImages.add(src);
        this.loadingPromises.delete(src);
        resolve();
      };
      
      img.onerror = () => {
        this.loadingPromises.delete(src);
        reject(new Error(`Failed to load image: ${src}`));
      };
      
      // Set high priority and immediate loading
      img.loading = 'eager';
      img.fetchPriority = 'high';
      img.src = src;
    });

    this.loadingPromises.set(src, promise);
    return promise;
  }

  preloadImages(sources: string[]): Promise<void[]> {
    return Promise.all(sources.map(src => this.preloadImage(src)));
  }

  isLoaded(src: string): boolean {
    return this.loadedImages.has(src);
  }
}

// Critical images to preload immediately
export const CRITICAL_IMAGES = ['/Gym.jpg'];

// Initialize preloader and start loading critical images
export const preloader = ImagePreloader.getInstance();

// Start preloading immediately when module loads
preloader.preloadImages(CRITICAL_IMAGES).catch(console.error); 