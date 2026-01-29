import { supabase } from './supabase';
import type { Category, Post, PostFaq, GetPostsOptions, Comment, CreateCommentInput } from './types';

/**
 * Fetch all categories
 */
export async function getCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching categories:', error);
    return [];
  }

  return data || [];
}

/**
 * Fetch a single category by slug
 */
export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) {
    console.error('Error fetching category:', error);
    return null;
  }

  return data;
}

/**
 * Fetch posts with optional filters
 */
export async function getPosts(options: GetPostsOptions = {}): Promise<Post[]> {
  const {
    limit = 20,
    offset = 0,
    categorySlug,
    featured,
    published = true,
    excludeId,
  } = options;

  let query = supabase
    .from('posts')
    .select(`
      *,
      category:categories(*)
    `)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (published) {
    query = query.eq('published', true);
  }

  if (featured !== undefined) {
    query = query.eq('featured', featured);
  }

  if (categorySlug) {
    // First get the category ID
    const { data: category } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', categorySlug)
      .single();

    if (category) {
      query = query.eq('category_id', category.id);
    } else {
      return [];
    }
  }

  if (excludeId) {
    query = query.neq('id', excludeId);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching posts:', error);
    return [];
  }

  return data || [];
}

/**
 * Fetch a single post by category and post slug
 */
export async function getPostBySlug(
  categorySlug: string,
  postSlug: string
): Promise<Post | null> {
  // First get the category
  const category = await getCategoryBySlug(categorySlug);
  if (!category) {
    return null;
  }

  const { data, error } = await supabase
    .from('posts')
    .select(`
      *,
      category:categories(*)
    `)
    .eq('slug', postSlug)
    .eq('category_id', category.id)
    .eq('published', true)
    .single();

  if (error) {
    console.error('Error fetching post:', error);
    return null;
  }

  return data;
}

/**
 * Fetch FAQs for a specific post
 */
export async function getFaqsByPostId(postId: string): Promise<PostFaq[]> {
  const { data, error } = await supabase
    .from('post_faqs')
    .select('*')
    .eq('post_id', postId);

  if (error) {
    console.error('Error fetching FAQs:', error);
    return [];
  }

  return data || [];
}

/**
 * Increment view count for a post (fire and forget)
 */
export function incrementViews(postId: string): void {
  // Fire and forget - silently fail if RPC doesn't exist
  supabase.rpc('increment_post_views', { post_id: postId }).then(() => {
    // Success - do nothing
  });
}

/**
 * Get related posts based on category
 */
export async function getRelatedPosts(
  categoryId: string,
  currentPostId: string,
  limit = 3
): Promise<Post[]> {
  const { data, error } = await supabase
    .from('posts')
    .select(`
      *,
      category:categories(*)
    `)
    .eq('category_id', categoryId)
    .eq('published', true)
    .neq('id', currentPostId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching related posts:', error);
    return [];
  }

  return data || [];
}

/**
 * Get all published posts for sitemap generation
 */
export async function getAllPostsForSitemap(): Promise<
  Pick<Post, 'slug' | 'updated_at' | 'category'>[]
> {
  const { data, error } = await supabase
    .from('posts')
    .select(`
      slug,
      updated_at,
      category:categories(slug)
    `)
    .eq('published', true);

  if (error) {
    console.error('Error fetching posts for sitemap:', error);
    return [];
  }

  return data || [];
}

/**
 * Get approved comments for a post (with nested replies)
 */
export async function getCommentsByPostId(postId: string): Promise<Comment[]> {
  const { data, error } = await supabase
    .from('comments')
    .select('*')
    .eq('post_id', postId)
    .eq('status', 'approved')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching comments:', error);
    return [];
  }

  // Organize into threaded structure
  const comments = data || [];
  const topLevel: Comment[] = [];
  const byId: Record<string, Comment> = {};

  // First pass: index by id
  for (const comment of comments) {
    byId[comment.id] = { ...comment, replies: [] };
  }

  // Second pass: build tree
  for (const comment of comments) {
    if (comment.parent_id && byId[comment.parent_id]) {
      byId[comment.parent_id].replies!.push(byId[comment.id]);
    } else {
      topLevel.push(byId[comment.id]);
    }
  }

  return topLevel;
}

/**
 * Get comment count for a post
 */
export async function getCommentCount(postId: string): Promise<number> {
  const { count, error } = await supabase
    .from('comments')
    .select('*', { count: 'exact', head: true })
    .eq('post_id', postId)
    .eq('status', 'approved');

  if (error) {
    console.error('Error fetching comment count:', error);
    return 0;
  }

  return count || 0;
}

/**
 * Create a new comment (goes to pending status)
 */
export async function createComment(input: CreateCommentInput): Promise<{ success: boolean; error?: string }> {
  const { data, error } = await supabase
    .from('comments')
    .insert({
      post_id: input.post_id,
      parent_id: input.parent_id || null,
      author_name: input.author_name.trim().slice(0, 100),
      author_email: input.author_email.trim().toLowerCase(),
      content: input.content.trim().slice(0, 2000),
      user_agent: input.user_agent || null,
      status: 'pending',
    });

  if (error) {
    console.error('Error creating comment:', error);
    return { success: false, error: 'Erro ao enviar comentário. Tente novamente.' };
  }

  return { success: true };
}
