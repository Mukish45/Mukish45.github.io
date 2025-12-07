# Mukish S Portfolio

Personal portfolio website with an integrated blog system.

## Blog System

### Adding a New Blog Post

1. **Create a markdown file** in the `/posts` directory:

```markdown
---
title: Your Article Title
category: Machine Learning
date: 2025-12-07
readTime: 5 min read
description: Brief description of your article.
---

Your article content here...
```

2. **Run the build script**:

```bash
node build-blog.js
```

This will:
- Generate the blog post HTML at `/blog/<slug>/index.html`
- Update `posts.json` with post metadata
- Auto-update the blog section on the homepage with the latest 3 posts

### Supported Categories

- Machine Learning
- Deep Learning
- NLP
- Computer Vision
- Generative AI
- LLM
- Data Science
- Tutorial

### Local Development

```bash
python3 -m http.server 8000
```

Visit `http://localhost:8000` to preview the site.
