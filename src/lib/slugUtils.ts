import { pinyin } from "pinyin-pro";

/**
 * 通用的 slug 生成工具函数
 * 支持中文转拼音，处理英文数字混合文本
 */
export function generateSlugFromText(text: string): string {
  // 先尝试中文转拼音
  let slug = chineseToSlug(text);
  
  // 如果转换后为空或只有特殊字符，则使用简化方式
  if (!slug || slug.trim() === '' || slug === '-') {
    // 保留中文字符，只替换空格和特殊字符
    slug = text
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[<>:"\/\\|?*《》（）【】「」""''！？。，、；：]/g, '') // 移除文件系统和URL不友好字符，包括中文标点
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }
  
  // 最终清理：确保slug安全用于URL
  slug = slug
    .replace(/[<>:"\/\\|?*《》（）【】「」""''！？。，、；：]/g, '') // 再次清理所有可能的问题字符
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  
  return slug;
}

/**
 * 使用 pinyin-pro 转换中文为拼音 slug
 */
function chineseToSlug(text: string): string {
  try {
    // 先清理标点符号再转换拼音
    const cleanText = text.replace(/[<>:"\/\\|?*《》（）【】「」""''！？。，、；：\s]+/g, ' ').trim();
    
    // 使用 pinyin-pro 转换中文为拼音
    const pinyinArray = pinyin(cleanText, { toneType: "none", type: "array" });
    
    if (pinyinArray && pinyinArray.length > 0) {
      return pinyinArray
        .filter(item => item.trim() !== '') // 过滤空项
        .join('-')
        .toLowerCase();
    }
    
    return '';
  } catch (error) {
    console.error('拼音转换失败，使用原始文本:', error);
    return '';
  }
}