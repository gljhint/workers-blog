import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/middleware/auth';
import { db } from "@/lib/db";
import { categories, tags, posts, pages, post_tags, site_settings, menus } from "@/lib/schema";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const authResult = await verifyToken(request);
    if (!authResult.valid || !authResult.admin) {
      return NextResponse.json({ 
        success: false, 
        error: '未授权' 
      }, { status: 401 });
    }

    const body = await request.json() as {
      data: any;
      options?: {
        overwrite?: boolean;
        skipExisting?: boolean;
        importCategories?: boolean;
        importTags?: boolean;
        importPosts?: boolean;
        importPages?: boolean;
        importMenus?: boolean;
        importComments?: boolean;
        importSettings?: boolean;
      };
    };
    const { data, options = {} } = body;

    if (!data) {
      return NextResponse.json({ 
        success: false, 
        error: '没有提供导入数据' 
      }, { status: 400 });
    }

    const {
      overwrite = false,
      skipExisting = true,
      importCategories = true,
      importTags = true,
      importPosts = true,
      importPages = true,
      importMenus = true,
      importComments = true,
      importSettings = true
    } = options;

    let importResults = {
      categories: { imported: 0, skipped: 0, errors: 0 },
      tags: { imported: 0, skipped: 0, errors: 0 },
      posts: { imported: 0, skipped: 0, errors: 0 },
      pages: { imported: 0, skipped: 0, errors: 0 },
      menus: { imported: 0, skipped: 0, errors: 0 },
      comments: { imported: 0, skipped: 0, errors: 0 },
      settings: { imported: 0, skipped: 0, errors: 0 }
    };

    // 导入分类
    if (importCategories && data.categories) {
      for (const category of data.categories) {
        try {
          const now = new Date().toISOString();
          
          // 检查是否已存在
          const dbInstance = await db();
          const existing = await dbInstance.select().from(categories).where(eq(categories.slug, category.slug)).limit(1);

          if (existing.length > 0) {
            if (overwrite) {
              const dbInstance1 = await db();
              await dbInstance1.update(categories)
                .set({
                  name: category.name,
                  description: category.description || null,
                  updated_at: now
                })
                .where(eq(categories.slug, category.slug));
              importResults.categories.imported++;
            } else {
              importResults.categories.skipped++;
            }
          } else {
            const dbInstance2 = await db();
            await dbInstance2.insert(categories).values({
              name: category.name,
              slug: category.slug,
              description: category.description || null,
              post_count: 0,
              created_at: now,
              updated_at: now
            });
            importResults.categories.imported++;
          }
        } catch (error) {
          console.error('导入分类失败:', error);
          importResults.categories.errors++;
        }
      }
    }

    // 导入标签
    if (importTags && data.tags) {
      for (const tag of data.tags) {
        try {
          const now = new Date().toISOString();
          
          // 检查是否已存在
          const dbInstance3 = await db();
          const existing = await dbInstance3.select().from(tags).where(eq(tags.slug, tag.slug)).limit(1);

          if (existing.length > 0) {
            if (overwrite) {
              const dbInstance4 = await db();
              await dbInstance4.update(tags)
                .set({
                  name: tag.name,
                  updated_at: now
                })
                .where(eq(tags.slug, tag.slug));
              importResults.tags.imported++;
            } else {
              importResults.tags.skipped++;
            }
          } else {
            const dbInstance5 = await db();
            await dbInstance5.insert(tags).values({
              name: tag.name,
              slug: tag.slug,
              post_count: 0,
              created_at: now,
              updated_at: now
            });
            importResults.tags.imported++;
          }
        } catch (error) {
          console.error('导入标签失败:', error);
          importResults.tags.errors++;
        }
      }
    }

    // 导入页面
    if (importPages && data.pages) {
      for (const page of data.pages) {
        try {
          const now = new Date().toISOString();
          
          // 检查是否已存在
          const dbInstance6 = await db();
          const existing = await dbInstance6.select().from(pages).where(eq(pages.slug, page.slug)).limit(1);

          if (existing.length > 0) {
            if (overwrite) {
              const dbInstance7 = await db();
              await dbInstance7.update(pages)
                .set({
                  title: page.title,
                  content: page.content,
                  is_published: page.is_published || false,
                  updated_at: now
                })
                .where(eq(pages.slug, page.slug));
              importResults.pages.imported++;
            } else {
              importResults.pages.skipped++;
            }
          } else {
            const dbInstance8 = await db();
            await dbInstance8.insert(pages).values({
              slug: page.slug,
              title: page.title,
              content: page.content,
              is_published: page.is_published || false,
              created_at: now,
              updated_at: now
            });
            importResults.pages.imported++;
          }
        } catch (error) {
          console.error('导入页面失败:', error);
          importResults.pages.errors++;
        }
      }
    }

    // 导入文章（需要先处理分类和标签的映射）
    if (importPosts && data.posts) {
      for (const post of data.posts) {
        try {
          const now = new Date().toISOString();
          
          // 检查是否已存在
          const dbInstance9 = await db();
          const existing = await dbInstance9.select().from(posts).where(eq(posts.slug, post.slug)).limit(1);

          let categoryId = null;
          if (post.category_slug) {
            const dbInstance10 = await db();
            const categoryResult = await dbInstance10.select().from(categories).where(eq(categories.slug, post.category_slug)).limit(1);
            if (categoryResult.length > 0) {
              categoryId = categoryResult[0].id;
            }
          }

          if (existing.length > 0) {
            if (overwrite) {
              const postId = existing[0].id;
              
              const dbInstance11 = await db();
              await dbInstance11.update(posts)
                .set({
                  title: post.title,
                  description: post.description,
                  content: post.content,
                  is_published: post.is_published || false,
                  category_id: categoryId,
                  updated_at: now
                })
                .where(eq(posts.slug, post.slug));

              // 更新标签关联
              const dbInstance12 = await db();
              await dbInstance12.delete(post_tags).where(eq(post_tags.post_id, postId));
              if (post.tags && post.tags.length > 0) {
                for (const tag of post.tags) {
                  const dbInstance13 = await db();
                  const tagResult = await dbInstance13.select().from(tags).where(eq(tags.slug, tag.slug)).limit(1);
                  if (tagResult.length > 0) {
                    const dbInstance14 = await db();
                    await dbInstance14.insert(post_tags).values({
                      post_id: postId,
                      tag_id: tagResult[0].id,
                      created_at: now
                    });
                  }
                }
              }
              
              importResults.posts.imported++;
            } else {
              importResults.posts.skipped++;
            }
          } else {
            const dbInstance15 = await db();
            const insertedPost = await dbInstance15.insert(posts).values({
              slug: post.slug,
              title: post.title,
              description: post.description,
              content: post.content,
              is_published: post.is_published || false,
              category_id: categoryId,
              author_id: post.author_id || null,
              view_count: 0,
              like_count: 0,
              comment_count: 0,
              allow_comments: true,
              created_at: now,
              updated_at: now
            }).returning({ id: posts.id });

            if (insertedPost.length > 0) {
              const postId = insertedPost[0].id;
              
              // 添加标签关联
              if (post.tags && post.tags.length > 0) {
                for (const tag of post.tags) {
                  const dbInstance16 = await db();
                  const tagResult = await dbInstance16.select().from(tags).where(eq(tags.slug, tag.slug)).limit(1);
                  if (tagResult.length > 0) {
                    const dbInstance17 = await db();
                    await dbInstance17.insert(post_tags).values({
                      post_id: postId,
                      tag_id: tagResult[0].id,
                      created_at: now
                    });
                  }
                }
              }
            }
            
            importResults.posts.imported++;
          }
        } catch (error) {
          console.error('导入文章失败:', error);
          importResults.posts.errors++;
        }
      }
    }

    // 导入菜单
    if (importMenus && data.menus) {
      for (const menu of data.menus) {
        try {
          const now = new Date().toISOString();
          
          // 检查是否已存在（使用title作为唯一标识）
          const dbInstance18 = await db();
          const existing = await dbInstance18.select().from(menus).where(eq(menus.title, menu.title || menu.name)).limit(1);

          if (existing.length > 0) {
            if (overwrite) {
              const dbInstance19 = await db();
              await dbInstance19.update(menus)
                .set({
                  title: menu.title || menu.name,
                  url: menu.url,
                  icon: menu.icon || null,
                  menu_order: menu.menu_order || menu.sort_order || 0,
                  target: menu.target || '_self',
                  is_active: menu.is_active || true,
                  description: menu.description || null,
                  updated_at: now
                })
                .where(eq(menus.title, menu.title || menu.name));
              importResults.menus.imported++;
            } else {
              importResults.menus.skipped++;
            }
          } else {
            const dbInstance20 = await db();
            await dbInstance20.insert(menus).values({
              title: menu.title || menu.name,
              url: menu.url,
              icon: menu.icon || null,
              menu_order: menu.menu_order || menu.sort_order || 0,
              target: menu.target || '_self',
              is_active: menu.is_active || true,
              description: menu.description || null,
              parent_id: menu.parent_id || null,
              level: menu.level || 0,
              created_at: now,
              updated_at: now
            });
            importResults.menus.imported++;
          }
        } catch (error) {
          console.error('导入菜单失败:', error);
          importResults.menus.errors++;
        }
      }
    }

    // 导入站点设置
    if (importSettings && data.site_settings) {
      try {
        // 检查是否已存在站点设置记录
        const dbInstance21 = await db();
        const existing = await dbInstance21.select().from(site_settings).limit(1);

        if (existing.length > 0) {
          if (overwrite) {
            const dbInstance22 = await db();
            await dbInstance22.update(site_settings)
              .set({
                site_name: data.site_settings.site_name || null,
                site_title: data.site_settings.site_title || null,
                site_description: data.site_settings.site_description || null,
                site_email: data.site_settings.site_email || null,
                site_url: data.site_settings.site_url || null,
                posts_per_page: data.site_settings.posts_per_page || 10,
                introduction: data.site_settings.introduction || null,
                site_footer: data.site_settings.site_footer || null
              })
              .where(eq(site_settings.id, existing[0].id));
            importResults.settings.imported++;
          } else {
            importResults.settings.skipped++;
          }
        } else {
          const dbInstance23 = await db();
          await dbInstance23.insert(site_settings).values({
            site_name: data.site_settings.site_name || null,
            site_title: data.site_settings.site_title || null,
            site_description: data.site_settings.site_description || null,
            site_email: data.site_settings.site_email || null,
            site_url: data.site_settings.site_url || null,
            posts_per_page: data.site_settings.posts_per_page || 10,
            introduction: data.site_settings.introduction || null,
            site_footer: data.site_settings.site_footer || null
          });
          importResults.settings.imported++;
        }
      } catch (error) {
        console.error('导入设置失败:', error);
        importResults.settings.errors++;
      }
    }

    return NextResponse.json({
      success: true,
      message: '数据导入完成',
      results: importResults,
      summary: {
        total_imported: Object.values(importResults).reduce((sum: number, result: any) => sum + result.imported, 0),
        total_skipped: Object.values(importResults).reduce((sum: number, result: any) => sum + result.skipped, 0),
        total_errors: Object.values(importResults).reduce((sum: number, result: any) => sum + result.errors, 0)
      }
    });

  } catch (error) {
    console.error('导入数据失败:', error);
    return NextResponse.json({ 
      success: false, 
      error: '导入失败' 
    }, { status: 500 });
  }
}