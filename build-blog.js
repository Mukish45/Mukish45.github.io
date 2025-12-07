#!/usr/bin/env node

/**
 * build-blog.js - Markdown to Blog Post Converter
 * 
 * Usage: node build-blog.js
 * 
 * Converts all .md files in the /posts directory to styled HTML blog posts.
 * Also generates a posts.json file for the blog listing.
 */

const fs = require('fs');
const path = require('path');
const { marked } = require('marked');
const matter = require('gray-matter');

// Configuration
const POSTS_DIR = path.join(__dirname, 'posts');
const OUTPUT_DIR = path.join(__dirname, 'blog');
const POSTS_JSON = path.join(__dirname, 'posts.json');

// Category icon mapping
const CATEGORY_ICONS = {
    'Machine Learning': '🤖',
    'Deep Learning': '🧠',
    'NLP': '💬',
    'Computer Vision': '👁️',
    'Generative AI': '✨',
    'LLM': '🔮',
    'Data Science': '📊',
    'Tutorial': '📖',
    'default': '📝'
};

// Configure marked for better code highlighting
marked.setOptions({
    breaks: true,
    gfm: true
});

/**
 * Generate the HTML template for a blog post
 */
function generatePostHTML(frontmatter, content, slug) {
    const icon = CATEGORY_ICONS[frontmatter.category] || CATEGORY_ICONS['default'];
    const formattedDate = new Date(frontmatter.date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="${frontmatter.description || frontmatter.title}">
    <title>${frontmatter.title} | Mukish S Blog</title>

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet">

    <link rel="stylesheet" href="/styles.css">
    <style>
        .post-header {
            padding-top: 120px;
            padding-bottom: var(--space-3xl);
            text-align: center;
            max-width: 800px;
            margin: 0 auto;
        }

        .post-category {
            display: inline-block;
            padding: var(--space-xs) var(--space-md);
            background: rgba(0, 245, 212, 0.1);
            border: 1px solid rgba(0, 245, 212, 0.2);
            border-radius: var(--radius-full);
            font-size: 0.75rem;
            color: var(--color-accent-cyan);
            margin-bottom: var(--space-lg);
        }

        .post-title {
            font-size: clamp(2rem, 5vw, 3rem);
            background: var(--gradient-primary);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            margin-bottom: var(--space-lg);
            line-height: 1.2;
        }

        .post-meta {
            display: flex;
            justify-content: center;
            gap: var(--space-xl);
            color: var(--color-text-muted);
            font-size: 0.9rem;
        }

        .post-meta span {
            display: flex;
            align-items: center;
            gap: var(--space-sm);
        }

        .post-content {
            max-width: 720px;
            margin: 0 auto;
            padding-bottom: var(--space-4xl);
        }

        .post-content h2 {
            font-size: 1.75rem;
            margin-top: var(--space-3xl);
            margin-bottom: var(--space-lg);
            color: var(--color-accent-cyan);
        }

        .post-content h3 {
            font-size: 1.35rem;
            margin-top: var(--space-2xl);
            margin-bottom: var(--space-md);
        }

        .post-content p {
            font-size: 1.1rem;
            line-height: 1.8;
            color: var(--color-text-secondary);
            margin-bottom: var(--space-lg);
        }

        .post-content code {
            background: var(--color-bg-tertiary);
            padding: 2px 8px;
            border-radius: var(--radius-sm);
            font-family: 'Fira Code', monospace;
            font-size: 0.9em;
            color: var(--color-accent-magenta);
        }

        .post-content pre {
            background: var(--color-bg-secondary);
            border: 1px solid rgba(255, 255, 255, 0.05);
            border-radius: var(--radius-lg);
            padding: var(--space-xl);
            overflow-x: auto;
            margin: var(--space-xl) 0;
        }

        .post-content pre code {
            background: none;
            padding: 0;
            color: var(--color-text-primary);
        }

        .post-content blockquote {
            border-left: 3px solid var(--color-accent-coral);
            padding-left: var(--space-lg);
            margin: var(--space-xl) 0;
            font-style: italic;
            color: var(--color-text-secondary);
        }

        .post-content ul, .post-content ol {
            margin: var(--space-lg) 0;
            padding-left: var(--space-xl);
            color: var(--color-text-secondary);
        }

        .post-content li {
            margin-bottom: var(--space-sm);
            line-height: 1.7;
        }

        .post-content a {
            color: var(--color-accent-cyan);
            text-decoration: underline;
            text-decoration-color: rgba(0, 245, 212, 0.3);
            transition: var(--transition-fast);
        }

        .post-content a:hover {
            text-decoration-color: var(--color-accent-cyan);
        }

        .post-content img {
            max-width: 100%;
            border-radius: var(--radius-lg);
            margin: var(--space-xl) 0;
        }

        .share-section {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: var(--space-lg);
            padding: var(--space-2xl) 0;
            border-top: 1px solid rgba(255, 255, 255, 0.05);
            margin-top: var(--space-3xl);
        }

        .share-label { color: var(--color-text-muted); }

        .share-buttons {
            display: flex;
            gap: var(--space-md);
        }

        .share-btn {
            width: 44px;
            height: 44px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: var(--color-bg-card);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: var(--radius-lg);
            color: var(--color-text-secondary);
            transition: var(--transition-fast);
        }

        .share-btn:hover {
            border-color: var(--color-accent-cyan);
            color: var(--color-accent-cyan);
        }

        .share-btn svg { width: 20px; height: 20px; }

        .back-link {
            display: inline-flex;
            align-items: center;
            gap: var(--space-sm);
            color: var(--color-text-secondary);
            margin-bottom: var(--space-xl);
            transition: var(--transition-fast);
        }

        .back-link:hover { color: var(--color-accent-cyan); }

        .author-card {
            display: flex;
            align-items: center;
            gap: var(--space-xl);
            background: var(--color-bg-card);
            border: 1px solid rgba(255, 255, 255, 0.05);
            border-radius: var(--radius-xl);
            padding: var(--space-xl);
            margin-top: var(--space-3xl);
        }

        .author-avatar {
            width: 80px;
            height: 80px;
            background: var(--gradient-primary);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 2rem;
            flex-shrink: 0;
        }

        .author-info h4 {
            font-size: 1.25rem;
            margin-bottom: var(--space-xs);
        }

        .author-info p {
            color: var(--color-text-secondary);
            font-size: 0.95rem;
            margin-bottom: var(--space-sm) !important;
        }

        .author-links {
            display: flex;
            gap: var(--space-md);
        }

        .author-links a {
            color: var(--color-text-muted);
            transition: var(--transition-fast);
        }

        .author-links a:hover { color: var(--color-accent-cyan); }
    </style>
</head>
<body>
    <canvas id="neural-canvas"></canvas>

    <!-- Navigation -->
    <nav class="nav" id="nav">
        <div class="nav-container">
            <a href="/" class="nav-logo">
                <span class="logo-bracket">&lt;</span>
                <span class="logo-text">MS</span>
                <span class="logo-bracket">/&gt;</span>
            </a>
            <ul class="nav-links" id="nav-links">
                <li><a href="/#about" class="nav-link">About</a></li>
                <li><a href="/#skills" class="nav-link">Skills</a></li>
                <li><a href="/#projects" class="nav-link">Projects</a></li>
                <li><a href="/blog/" class="nav-link">Blog</a></li>
                <li><a href="/#contact" class="nav-link">Contact</a></li>
            </ul>
            <button class="nav-toggle" id="nav-toggle" aria-label="Toggle navigation">
                <span></span><span></span><span></span>
            </button>
        </div>
    </nav>

    <main class="container">
        <a href="/blog/" class="back-link">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Back to Blog
        </a>

        <header class="post-header">
            <span class="post-category">${icon} ${frontmatter.category}</span>
            <h1 class="post-title">${frontmatter.title}</h1>
            <div class="post-meta">
                <span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="16" y1="2" x2="16" y2="6"></line>
                        <line x1="8" y1="2" x2="8" y2="6"></line>
                        <line x1="3" y1="10" x2="21" y2="10"></line>
                    </svg>
                    ${formattedDate}
                </span>
                <span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"></circle>
                        <polyline points="12 6 12 12 16 14"></polyline>
                    </svg>
                    ${frontmatter.readTime || '5 min read'}
                </span>
            </div>
        </header>

        <article class="post-content">
            ${content}

            <div class="share-section">
                <span class="share-label">Share this article:</span>
                <div class="share-buttons">
                    <a href="https://twitter.com/intent/tweet?text=${encodeURIComponent(frontmatter.title)}&url=" class="share-btn" target="_blank" aria-label="Share on Twitter">
                        <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                        </svg>
                    </a>
                    <a href="https://www.linkedin.com/sharing/share-offsite/?url=" class="share-btn" target="_blank" aria-label="Share on LinkedIn">
                        <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                        </svg>
                    </a>
                </div>
            </div>

            <div class="author-card">
                <div class="author-avatar">👨‍💻</div>
                <div class="author-info">
                    <h4>Mukish S</h4>
                    <p>Data Scientist at MangoBytes. Passionate about Machine Learning and Generative AI.</p>
                    <div class="author-links">
                        <a href="https://twitter.com/mukish_s" target="_blank">Twitter</a>
                        <a href="https://github.com/mukish45" target="_blank">GitHub</a>
                        <a href="https://linkedin.com/in/mukish-s2034033" target="_blank">LinkedIn</a>
                    </div>
                </div>
            </div>
        </article>
    </main>

    <footer class="footer">
        <div class="container">
            <div class="footer-content">
                <p class="footer-text">
                    Designed & Built by <span class="highlight">Mukish S</span> © 2025
                </p>
            </div>
        </div>
    </footer>

    <script src="/script.js"></script>
</body>
</html>`;
}

/**
 * Convert a single markdown file to HTML
 */
function convertPost(filePath) {
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const { data: frontmatter, content: markdownContent } = matter(fileContent);

    // Generate slug from filename
    const slug = path.basename(filePath, '.md');

    // Convert markdown to HTML
    const htmlContent = marked(markdownContent);

    // Generate full HTML page
    const fullHTML = generatePostHTML(frontmatter, htmlContent, slug);

    // Create subdirectory for the post
    const postDir = path.join(OUTPUT_DIR, slug);
    if (!fs.existsSync(postDir)) {
        fs.mkdirSync(postDir, { recursive: true });
    }

    // Write to output directory as index.html in subdirectory
    const outputPath = path.join(postDir, 'index.html');
    fs.writeFileSync(outputPath, fullHTML);

    console.log(`✅ Generated: blog/${slug}/index.html`);

    return {
        slug,
        title: frontmatter.title,
        description: frontmatter.description || '',
        category: frontmatter.category || 'General',
        date: frontmatter.date,
        readTime: frontmatter.readTime || '5 min read',
        icon: CATEGORY_ICONS[frontmatter.category] || CATEGORY_ICONS['default'],
        url: `/blog/${slug}/`
    };
}

/**
 * Main build function
 */
function build() {
    console.log('\n🔨 Building blog posts...\n');

    // Ensure output directory exists
    if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    // Check if posts directory exists
    if (!fs.existsSync(POSTS_DIR)) {
        console.log('📁 No posts directory found. Creating one...');
        fs.mkdirSync(POSTS_DIR, { recursive: true });
        console.log('📝 Add your .md files to the /posts directory and run this script again.\n');
        return;
    }

    // Get all markdown files
    const files = fs.readdirSync(POSTS_DIR).filter(f => f.endsWith('.md'));

    if (files.length === 0) {
        console.log('📭 No markdown files found in /posts directory.');
        console.log('📝 Add your .md files with frontmatter and run this script again.\n');
        console.log('Example frontmatter:');
        console.log('---');
        console.log('title: Your Article Title');
        console.log('category: Machine Learning');
        console.log('date: 2025-12-07');
        console.log('readTime: 5 min read');
        console.log('---\n');
        return;
    }

    // Convert all posts
    const posts = files.map(file => {
        const filePath = path.join(POSTS_DIR, file);
        return convertPost(filePath);
    });

    // Sort by date (newest first)
    posts.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Write posts.json for the blog listing
    fs.writeFileSync(POSTS_JSON, JSON.stringify(posts, null, 2));
    console.log(`\n📋 Generated: posts.json (${posts.length} posts)`);

    // Update the blog section in index.html
    updateIndexHTML(posts);

    console.log('\n✨ Build complete!\n');
}

/**
 * Generate HTML for a blog card on the homepage
 */
function generateBlogCardHTML(post, isFeatured = false) {
    const formattedDate = new Date(post.date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    const featuredClass = isFeatured ? ' featured-blog' : '';

    return `                <article class="blog-card${featuredClass}">
                    <div class="blog-content">
                        <div class="blog-meta">
                            <span class="blog-date">${formattedDate}</span>
                            <span class="blog-read">${post.readTime}</span>
                        </div>
                        <h3 class="blog-title">${post.title}</h3>
                        <p class="blog-excerpt">
                            ${post.description}
                        </p>
                        <a href="${post.url}" class="blog-link">Read Article →</a>
                    </div>
                </article>`;
}

/**
 * Update the blog section in index.html with the latest posts
 */
function updateIndexHTML(posts) {
    const indexPath = path.join(__dirname, 'index.html');

    if (!fs.existsSync(indexPath)) {
        console.log('⚠️  index.html not found, skipping homepage update.');
        return;
    }

    let indexHTML = fs.readFileSync(indexPath, 'utf-8');

    // Take the latest 3 posts for the homepage
    const latestPosts = posts.slice(0, 3);

    if (latestPosts.length === 0) {
        console.log('⚠️  No posts to display on homepage.');
        return;
    }

    // Generate blog cards HTML
    const blogCardsHTML = latestPosts.map((post, index) =>
        generateBlogCardHTML(post, index === 0)
    ).join('\n');

    // Find and replace the blog-grid content
    // Match the blog-grid div and its contents
    const blogGridRegex = /(<div class="blog-grid">)([\s\S]*?)(<\/div>\s*<div class="blog-cta">)/;

    if (blogGridRegex.test(indexHTML)) {
        indexHTML = indexHTML.replace(blogGridRegex, `$1\n${blogCardsHTML}\n            $3`);
        fs.writeFileSync(indexPath, indexHTML);
        console.log(`📄 Updated: index.html blog section with ${latestPosts.length} latest posts`);
    } else {
        console.log('⚠️  Could not find blog-grid section in index.html');
    }
}

// Run the build
build();
