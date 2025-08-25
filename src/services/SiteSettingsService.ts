import { getSiteSettings, upsertSiteSettings } from '@/models/SiteSettingModel';
import { getKVCache, CacheKeys } from '@/lib/kvCache';

export interface SiteSettings {
  site_name: string;
  site_title: string;
  site_description: string;
  site_email: string;
  site_url: string;
  posts_per_page: number;
  introduction: string;
  site_footer: string;
}

/**
 * 站点设置服务类
 * 使用 Cloudflare KV 作为主要缓存，内存缓存作为备用
 */
export class SiteSettingsService {
  private static instance: SiteSettingsService;
  private memoryCache: Map<string, any> = new Map();
  private memoryCacheExpiry: Map<string, number> = new Map();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5分钟缓存
  private kvCache = getKVCache();

  private constructor() {
  }

  public static getInstance(): SiteSettingsService {
    if (!SiteSettingsService.instance) {
      SiteSettingsService.instance = new SiteSettingsService();
    }
    return SiteSettingsService.instance;
  }

  /**
   * 获取所有站点设置
   */
  async getAllSettings(): Promise<SiteSettings> {
    const cacheKey = CacheKeys.SITE_SETTINGS;
    
    // 优先使用 KV 缓存
    if (this.kvCache) {
      const cached = await this.kvCache.get<SiteSettings>(cacheKey);
      if (cached) {
        return cached;
      }
    }
    
    // 回退到内存缓存
    if (this.isCacheValid(cacheKey)) {
      return this.memoryCache.get(cacheKey);
    }

    try {
      const siteSetting = await getSiteSettings();
      
      const settings: SiteSettings = {
        site_name: siteSetting?.site_name || '我的博客',
        site_title: siteSetting?.site_title || '我的博客',
        site_description: siteSetting?.site_description || '一个基于 Next.js 的现代博客',
        site_email: siteSetting?.site_email || 'admin@blog.com',
        site_url: siteSetting?.site_url || 'https://myblog.com',
        posts_per_page: siteSetting?.posts_per_page || 10,
        introduction: siteSetting?.introduction || '欢迎来到我的博客',
        site_footer: siteSetting?.site_footer || '© 2024 我的博客. 保留所有权利。'
      };

      // 缓存设置到 KV 和内存
      await this.updateCache(cacheKey, settings);
      
      return settings;
    } catch (error) {
      console.error('Failed to get site settings:', error);
      // 返回默认设置
      return this.getDefaultSettings();
    }
  }

  /**
   * 获取单个设置
   */
  async getSetting<T = string>(key: keyof SiteSettings, defaultValue?: T): Promise<T> {
    const cacheKey = `setting_${key}`;
    
    // 优先使用 KV 缓存
    if (this.kvCache) {
      const cached = await this.kvCache.get<T>(cacheKey);
      if (cached !== null) {
        return cached;
      }
    }
    
    // 检查内存缓存
    if (this.isCacheValid(cacheKey)) {
      return this.memoryCache.get(cacheKey);
    }

    try {
      let value: any;
      
      // Simplified: get all settings and extract the specific value
      const allSettings = await this.getAllSettings();
      value = allSettings[key] || defaultValue;

      // 更新缓存
      await this.updateCache(cacheKey, value);
      
      return value;
    } catch (error) {
      console.error(`Failed to get setting ${key}:`, error);
      return defaultValue as T;
    }
  }

  /**
   * 获取每页文章数
   */
  async getPostsPerPage(): Promise<number> {
    return await this.getSetting('posts_per_page', 10);
  }

  /**
   * 获取站点名称
   */
  async getSiteName(): Promise<string> {
    return await this.getSetting('site_name', '我的博客');
  }

  /**
   * 获取网站标题
   */
  async getSiteTitle(): Promise<string> {
    return await this.getSetting('site_title', '我的博客');
  }

  /**
   * 获取网站描述
   */
  async getSiteDescription(): Promise<string> {
    return await this.getSetting('site_description', '一个基于 Next.js 的现代博客');
  }

  /**
   * 获取网站邮箱
   */
  async getSiteEmail(): Promise<string> {
    return await this.getSetting('site_email', 'admin@blog.com');
  }

  /**
   * 获取网站 URL
   */
  async getSiteUrl(): Promise<string> {
    return await this.getSetting('site_url', 'https://myblog.com');
  }

  /**
   * 获取站点介绍
   */
  async getIntroduction(): Promise<string> {
    return await this.getSetting('introduction', '欢迎来到我的博客');
  }

  /**
   * 获取网站页脚
   */
  async getSiteFooter(): Promise<string> {
    return await this.getSetting('site_footer', '© 2024 我的博客. 保留所有权利。');
  }

  /**
   * 更新设置
   */
  async updateSetting(key: keyof SiteSettings, value: string | number | boolean): Promise<void> {
    try {
      // Create a partial update object for the specific key
      const updateData: any = {};
      updateData[key] = value;
      await upsertSiteSettings(updateData);
      
      // 清除相关缓存
      await this.clearSettingCache(key);
      await this.clearCache(); // 清除全部设置缓存
    } catch (error) {
      console.error(`Failed to update setting ${key}:`, error);
      throw error;
    }
  }

  /**
   * 清除缓存
   */
  async clearCache(): Promise<void> {
    // 清除 KV 缓存
    if (this.kvCache) {
      await this.kvCache.delete(CacheKeys.SITE_SETTINGS);
    }
    // 清除内存缓存
    this.memoryCache.clear();
    this.memoryCacheExpiry.clear();
  }

  /**
   * 清除单个设置的缓存
   */
  async clearSettingCache(key: keyof SiteSettings): Promise<void> {
    const cacheKey = `setting_${key}`;
    
    // 清除 KV 缓存
    if (this.kvCache) {
      await this.kvCache.delete(cacheKey);
    }
    // 清除内存缓存
    this.memoryCache.delete(cacheKey);
    this.memoryCacheExpiry.delete(cacheKey);
  }

  /**
   * 获取默认设置
   */
  private getDefaultSettings(): SiteSettings {
    return {
      site_name: '我的博客',
      site_title: '我的博客',
      site_description: '一个基于 Next.js 的现代博客',
      site_email: 'admin@blog.com',
      site_url: 'https://myblog.com',
      posts_per_page: 10,
      introduction: '欢迎来到我的博客',
      site_footer: '© 2024 我的博客. 保留所有权利。'
    };
  }

  /**
   * 检查内存缓存是否有效
   */
  private isCacheValid(key: string): boolean {
    const expiry = this.memoryCacheExpiry.get(key);
    if (!expiry || Date.now() > expiry) {
      this.memoryCache.delete(key);
      this.memoryCacheExpiry.delete(key);
      return false;
    }
    return this.memoryCache.has(key);
  }

  /**
   * 更新缓存（KV + 内存）
   */
  private async updateCache(key: string, value: any): Promise<void> {
    // 更新 KV 缓存
    if (this.kvCache) {
      await this.kvCache.set(key, value, { ttl: 300 }); // 5分钟
    }
    
    // 更新内存缓存
    this.memoryCache.set(key, value);
    this.memoryCacheExpiry.set(key, Date.now() + this.CACHE_TTL);
  }
}