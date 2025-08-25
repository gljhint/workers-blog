import { NextResponse } from 'next/server';
import { db } from "@/lib/db";
import { admins, site_settings, categories, tags, posts, comments, post_tags, menus } from "@/lib/schema";
import bcrypt from 'bcryptjs';

// POST方法用于执行初始化
export async function GET() {
  try {
    console.log('🚀 开始初始化...');

    // 检查是否已经存在管理员账户
    const existingAdmin = await db().select().from(admins).limit(1);
    if (existingAdmin.length > 0) {
      return NextResponse.json({
        message: '管理员账户已存在',
        admin: {
          username: existingAdmin[0].username,
          email: existingAdmin[0].email
        }
      });
    }

    // 创建管理员账户
    console.log('👤 创建管理员账户...');
    const passwordHash = await bcrypt.hash('admin123', 12);
    
    const [admin] = await db().insert(admins).values({
      username: 'admin',
      email: 'admin@example.com',
      password_hash: passwordHash,
      display_name: '博客管理员',
      bio: '这是一个测试管理员账户',
      is_active: true
    }).returning();
    
    console.log('✅ 管理员账户创建成功');

    // 创建基础站点设置
    console.log('⚙️  创建站点设置...');
    await db().insert(site_settings).values({
      site_name: '我的博客',
      site_title: '我的技术博客',
      site_description: '分享技术经验与思考',
      site_email: 'admin@example.com',
      site_url: 'https://myblog.com',
      posts_per_page: 10,
      introduction: '欢迎来到我的技术博客，在这里我分享编程经验、技术心得和学习笔记。',
      site_footer: '© 2024 我的博客. All rights reserved.'
    });
    console.log('✅ 站点设置创建完成');

    // 创建示例分类
    console.log('📁 创建示例分类...');
    const now = new Date().toISOString();
    const [techCategory] = await db().insert(categories).values({
      name: '技术分享',
      slug: 'tech',
      description: '技术相关的文章分享',
      post_count: 0,
      created_at: now,
      updated_at: now
    }).returning();

    const [lifeCategory] = await db().insert(categories).values({
      name: '生活随笔',
      slug: 'life',
      description: '生活感悟和随笔',
      post_count: 0,
      created_at: now,
      updated_at: now
    }).returning();
    console.log('✅ 示例分类创建完成');

    // 创建示例标签
    console.log('🏷️  创建示例标签...');
    const [jsTag] = await db().insert(tags).values({
      name: 'JavaScript',
      slug: 'javascript',
      post_count: 0,
      created_at: now,
      updated_at: now
    }).returning();

    const [reactTag] = await db().insert(tags).values({
      name: 'React',
      slug: 'react',
      post_count: 0,
      created_at: now,
      updated_at: now
    }).returning();
    console.log('✅ 示例标签创建完成');

    // 创建示例文章
    console.log('📝 创建示例文章...');
    const [post1] = await db().insert(posts).values({
      title: '欢迎来到我的博客',
      slug: 'welcome-to-my-blog',
      content: `<h2>欢迎！</h2><p>这是我的第一篇博客文章。在这里，我会分享我的技术经验、学习心得和生活感悟。</p><p>希望我的分享能够对你有所帮助！</p>`,
      description: '我的第一篇博客文章，欢迎大家来访！',
      is_published: true,
      is_featured: true,
      view_count: 42,
      published_at: now,
      category_id: techCategory.id,
      author_id: admin.id,
      allow_comments: true,
      created_at: now,
      updated_at: now
    }).returning();

    const [post2] = await db().insert(posts).values({
      title: 'React开发最佳实践',
      slug: 'react-best-practices',
      content: `<h2>React最佳实践</h2><p>在React开发中，有一些最佳实践可以帮助我们写出更好的代码：</p><ol><li>使用函数组件和Hooks</li><li>合理使用useCallback和useMemo</li><li>保持组件的单一职责</li></ol><p>让我们一起学习这些实践吧！</p>`,
      description: '分享一些React开发中的最佳实践',
      is_published: true,
      is_featured: false,
      view_count: 28,
      published_at: now,
      category_id: techCategory.id,
      author_id: admin.id,
      allow_comments: true,
      created_at: now,
      updated_at: now
    }).returning();

    // 给文章添加标签
    await db().insert(post_tags).values([
      { post_id: post1.id, tag_id: jsTag.id, created_at: now },
      { post_id: post2.id, tag_id: jsTag.id, created_at: now },
      { post_id: post2.id, tag_id: reactTag.id, created_at: now }
    ]);
    
    console.log('✅ 示例文章创建完成');

    // 创建示例评论和回复
    console.log('💬 创建示例评论...');
    
    // 第一篇文章的评论
    const [{ id: comment1Id }] = await db().insert(comments).values({
      post_id: post1.id,
      parent_id: null,
      author_name: '张三',
      author_email: 'zhangsan@example.com',
      author_website: null,
      content: '写得很好！期待更多的分享',
      is_approved: true,
      reply_count: 2, // 手动设置，稍后会有2个回复
      created_at: now,
      updated_at: now
    }).returning({ id: comments.id });

    // 给第一条评论的回复
    await db().insert(comments).values({
      post_id: post1.id,
      parent_id: comment1Id,
      author_name: '博客作者',
      author_email: 'admin@example.com',
      author_website: null,
      content: '谢谢支持！我会继续努力的',
      is_approved: true,
      reply_count: 0,
      created_at: new Date(Date.now() + 60000).toISOString(), // 1分钟后
      updated_at: new Date(Date.now() + 60000).toISOString()
    });

    await db().insert(comments).values({
      post_id: post1.id,
      parent_id: comment1Id,
      author_name: '李四',
      author_email: 'lisi@example.com',
      author_website: null,
      content: '我也很期待！',
      is_approved: true,
      reply_count: 0,
      created_at: new Date(Date.now() + 120000).toISOString(), // 2分钟后
      updated_at: new Date(Date.now() + 120000).toISOString()
    });

    // 第一篇文章的另一条评论
    const [{ id: comment2Id }] = await db().insert(comments).values({
      post_id: post1.id,
      parent_id: null,
      author_name: '王五',
      author_email: 'wangwu@example.com',
      author_website: 'https://example.com',
      content: '界面设计很不错，内容也很有价值',
      is_approved: true,
      reply_count: 1, // 手动设置，稍后会有1个回复
      created_at: new Date(Date.now() + 180000).toISOString(), // 3分钟后
      updated_at: new Date(Date.now() + 180000).toISOString()
    }).returning({ id: comments.id });

    // 给第二条评论的回复
    await db().insert(comments).values({
      post_id: post1.id,
      parent_id: comment2Id,
      author_name: '博客作者',
      author_email: 'admin@example.com',
      author_website: null,
      content: '感谢你的认可！',
      is_approved: true,
      reply_count: 0,
      created_at: new Date(Date.now() + 240000).toISOString(), // 4分钟后
      updated_at: new Date(Date.now() + 240000).toISOString()
    });

    // 第二篇文章的评论
    const insertComment3 = await db().insert(comments).values({
      post_id: post2.id,
      parent_id: null,
      author_name: '赵六',
      author_email: 'zhaoliu@example.com',
      author_website: null,
      content: '这些最佳实践很实用，学到了很多！',
      is_approved: true,
      reply_count: 0,
      created_at: new Date(Date.now() + 300000).toISOString(), // 5分钟后
      updated_at: new Date(Date.now() + 300000).toISOString()
    });

    // 一条待审核的评论
    await db().insert(comments).values({
      post_id: post2.id,
      parent_id: null,
      author_name: '匿名用户',
      author_email: 'anonymous@example.com',
      author_website: null,
      content: '这条评论需要审核',
      is_approved: false, // 未审核
      reply_count: 0,
      created_at: new Date(Date.now() + 360000).toISOString(), // 6分钟后
      updated_at: new Date(Date.now() + 360000).toISOString()
    });

    console.log('✅ 示例评论创建完成');

    // 创建菜单项
    console.log('🧭 创建菜单项...');
    
    // 首页菜单
    await db().insert(menus).values({
      title: '首页',
      url: '/',
      target: '_self',
      icon: null,
      description: '网站首页',
      parent_id: null,
      menu_order: 1,
      is_active: true,
      level: 0,
      path: '1',
      created_at: now,
      updated_at: now
    });

    // 分类菜单
    await db().insert(menus).values({
      title: '分类',
      url: '/categories',
      target: '_self',
      icon: null,
      description: '文章分类',
      parent_id: null,
      menu_order: 2,
      is_active: true,
      level: 0,
      path: '2',
      created_at: now,
      updated_at: now
    });

    // 标签菜单
    await db().insert(menus).values({
      title: '标签',
      url: '/tags',
      target: '_self',
      icon: null,
      description: '文章标签',
      parent_id: null,
      menu_order: 3,
      is_active: true,
      level: 0,
      path: '3',
      created_at: now,
      updated_at: now
    });

    console.log('✅ 菜单项创建完成');

    return NextResponse.json({
      success: true,
      message: '初始化完成！已创建示例数据',
      admin: {
        username: 'admin',
        email: 'admin@example.com',
        password: 'admin123'
      },
      data: {
        categories: 2,
        tags: 2,
        posts: 2,
        comments: 7,
        replies: 3,
        menus: 4
      }
    });

  } catch (error) {
    console.error('❌ 初始化失败:', error);
    return NextResponse.json(
      { error: '初始化失败', details: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    );
  }
}