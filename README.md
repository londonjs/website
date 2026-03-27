# London.js Community Website

[![OpenSSF Best Practices](https://www.bestpractices.dev/projects/XXXXX/badge)](https://www.bestpractices.dev/projects/XXXXX)
[![OpenSSF Scorecard](https://api.scorecard.dev/projects/github.com/londonjs/website/badge)](https://scorecard.dev/viewer/?uri=github.com/londonjs/website)

Hopefully the official website for the London.js Community. We host regular meetups featuring talks, networking, and discussions about all things JavaScript.

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/faisalagood/londonjs.git

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## 📖 About

London.js is a community-driven meetup group focused on JavaScript and related technologies. This website serves as our digital home, providing information about upcoming and past events.

## 🛠 Tech Stack

- [Astro](https://astro.build) - Static Site Generator
- [Tailwind CSS](https://tailwindcss.com) - Styling
- Astro Content Collections - JSON files.

## 📝 Adding a New Meetup

1. Copy the template from `templates/meetup.json`
2. Create a new file in `src/content/meetups/` with the format `meetup-month-year.json`
3. Fill in the event details following the template structure
4. Add any sponsor logos to the `public/sponsors/` directory
5. Test locally before committing

You can use this command to create a new meetup:

```bash
# From project root
cp templates/meetup.json src/content/meetups/meetup-month-year.json
```

### Required Fields

- All fields in the template are required except those marked (optional)
- Dates must be in YYYY-MM-DD format
- Times must be in 24-hour HH:MM format
- URLs must be valid and include http(s)://

## 🤝 Contributing

We welcome contributions of all kinds! Here are some ways you can help:

### Code Contributions

- Bug fixes
- Feature enhancements
- Performance improvements
- Documentation updates

### Content Contributions

- Adding past events
- Updating event information
- Adding speaker details
- Improving documentation

### Future Development Goals

- Admin dashboard for easier event management
- Enhanced speaker profiles
- Event photo galleries
- Community showcase section

### Development Process

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 🔧 Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📁 Project Structure

```text
├── src/
│   ├── components/    # Reusable components
│   ├── content/       # Content collections
│   ├── layouts/       # Page layouts
│   ├── pages/         # Route components
│   └── utils/         # Utility functions
├── public/            # Static assets
└── astro.config.mjs   # Astro configuration
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Community

- [Join our Meetup Group](https://www.meetup.com/london-js/)
- [LinkedIn](https://www.linkedin.com/company/london-js/)
- [Conference Code of Conduct](http://confcodeofconduct.com)

## 🙏 Acknowledgments

- The organisers that made it happen!
- The generous sponsors that make it happen!
- The London.js community that join us!

---

Built with ❤️ by the London.js Community
