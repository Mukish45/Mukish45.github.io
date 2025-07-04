# Personal Website - Data Scientist Portfolio

A modern, Gen-Z themed personal website showcasing data science expertise, particularly in language models, with integrated blogging capabilities and interactive portfolio features.

## 🌟 Features

### Core Features
- **Responsive Design**: Mobile-first approach that works on all devices
- **Dark/Light Theme**: Toggle between dark and light modes with system preference detection
- **Modern Animations**: Smooth transitions, hover effects, and scroll-based animations
- **Interactive Elements**: Typewriter effect, particle systems, and magnetic hover effects
- **Accessibility**: Keyboard navigation, reduced motion support, and semantic HTML

### Page Structure
- **Homepage**: Hero section, skills showcase, featured projects, and latest blog posts
- **About Page**: Professional story, skills visualization, experience timeline, and personal interests
- **Projects Page**: Portfolio showcase with filtering by category and search functionality
- **Blog Page**: Article listing with search, categories, and newsletter signup
- **Contact Page**: Contact form, social links, and availability information

### Technical Features
- **Pure HTML/CSS/JavaScript**: No frameworks required
- **Modern CSS**: CSS Grid, Flexbox, custom properties (CSS variables)
- **Performance Optimized**: Lazy loading, animation optimization, and minimal dependencies
- **SEO Ready**: Semantic HTML, meta tags, and structured content

## 🚀 Getting Started

### Prerequisites
- A modern web browser
- A text editor (VS Code, Sublime Text, etc.)
- Basic knowledge of HTML, CSS, and JavaScript

### Installation
1. Clone or download the project files
2. Open `index.html` in your web browser
3. That's it! No build process required.

### File Structure
```
personal-website/
├── index.html              # Homepage
├── about.html              # About page
├── projects.html           # Projects showcase
├── blog.html              # Blog listing
├── contact.html           # Contact page
├── styles/
│   ├── main.css           # Main styles and layout
│   └── animations.css     # Animation definitions
├── scripts/
│   ├── main.js            # Core functionality
│   └── animations.js      # Animation controls
└── README.md              # This file
```

## 🎨 Customization

### Personal Information
Update the following in all HTML files:
- Replace "Mukish" with your name
- Update meta descriptions and titles
- Change contact information in `contact.html`
- Update social media links throughout

### Colors and Theme
Edit the CSS variables in `styles/main.css`:
```css
:root {
  --primary-500: #3b82f6;    /* Main brand color */
  --accent-pink: #ec4899;     /* Accent color 1 */
  --accent-purple: #8b5cf6;   /* Accent color 2 */
  --accent-cyan: #06b6d4;     /* Accent color 3 */
  /* ... more colors */
}
```

### Content Updates

#### Homepage (`index.html`)
- Update the hero section text and typewriter words
- Modify skills sections with your technologies
- Replace project cards with your actual projects
- Update blog post previews

#### About Page (`about.html`)
- Replace the professional story with yours
- Update statistics and achievements
- Modify the experience timeline
- Change personal interests and hobbies

#### Projects Page (`projects.html`)
- Replace project cards with your work
- Update project categories and filters
- Add real GitHub and demo links
- Modify project descriptions and technologies

#### Blog Page (`blog.html`)
- Replace sample blog posts with your articles
- Update categories to match your content
- Modify the newsletter signup
- Add real blog post links

#### Contact Page (`contact.html`)
- Update contact information
- Modify the contact form submission (currently simulated)
- Update social media links
- Change availability and location info

### Adding Real Functionality

#### Contact Form
To make the contact form functional, you'll need:
1. A backend service (Node.js, PHP, etc.)
2. Form handling endpoint
3. Email service integration

Example with EmailJS:
```javascript
// Add EmailJS CDN to your HTML
// Update the form submission in contact.html
emailjs.send("your_service_id", "your_template_id", {
    name: formData.get('name'),
    email: formData.get('email'),
    message: formData.get('message')
});
```

#### Blog Integration
For a real blog, consider:
1. **Static Site Generators**: Jekyll, Hugo, or Gatsby
2. **Headless CMS**: Contentful, Strapi, or Sanity
3. **Markdown Files**: Simple file-based approach

#### Analytics
Add Google Analytics or similar:
```html
<!-- Add to <head> section of all pages -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

## 🛠️ Advanced Customization

### Adding New Animations
1. Define new CSS animations in `styles/animations.css`
2. Add JavaScript controls in `scripts/animations.js`
3. Apply classes to HTML elements

### Custom Components
Create reusable components by:
1. Defining CSS classes for styling
2. Adding JavaScript functionality
3. Using consistent HTML structure

### Performance Optimization
- Optimize images (use WebP format)
- Minify CSS and JavaScript for production
- Add a service worker for caching
- Use a CDN for font and icon loading

## 📱 Browser Support

- **Modern Browsers**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Mobile**: iOS Safari 14+, Chrome Mobile 90+
- **Features**: CSS Grid, Flexbox, Custom Properties, Intersection Observer

## 🚀 Deployment

### Static Hosting Options
1. **GitHub Pages**: Free hosting for public repositories
2. **Netlify**: Drag-and-drop deployment with forms
3. **Vercel**: Fast deployment with GitHub integration
4. **Firebase Hosting**: Google's hosting solution

### Deployment Steps (Netlify Example)
1. Create a Netlify account
2. Drag your project folder to Netlify dashboard
3. Configure domain and settings
4. Your site is live!

## 🔧 Troubleshooting

### Common Issues

**Animations not working:**
- Check if `prefers-reduced-motion` is enabled
- Ensure JavaScript files are loading properly
- Verify CSS animation classes are applied

**Theme toggle not working:**
- Check localStorage permissions
- Ensure theme-toggle button has correct ID
- Verify CSS variables are properly defined

**Mobile menu not opening:**
- Check JavaScript console for errors
- Ensure nav-toggle and nav-menu IDs are correct
- Verify mobile CSS media queries

### Performance Issues
- Reduce animation complexity
- Optimize images and fonts
- Consider lazy loading for images
- Remove unused CSS and JavaScript

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Contributing

Feel free to:
- Report bugs and issues
- Suggest new features
- Submit pull requests
- Share improvements

## 📞 Support

For questions or help with customization:
- Check the code comments for guidance
- Refer to MDN Web Docs for HTML/CSS/JS reference
- Open an issue for bugs or feature requests

---

Built with ❤️ using pure HTML, CSS, and JavaScript. No frameworks, just modern web standards! 