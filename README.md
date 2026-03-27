# London.js Community Website

[![CI](https://github.com/londonjs/website/actions/workflows/ci.yml/badge.svg)](https://github.com/londonjs/website/actions/workflows/ci.yml)
[![CodeQL](https://github.com/londonjs/website/actions/workflows/codeql.yml/badge.svg)](https://github.com/londonjs/website/actions/workflows/codeql.yml)
[![OpenSSF Scorecard](https://api.scorecard.dev/projects/github.com/londonjs/website/badge)](https://scorecard.dev/viewer/?uri=github.com/londonjs/website)

The official website for the London.js Community. We host regular meetups featuring talks, networking, and discussions about all things JavaScript.

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/londonjs/website.git

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Prerequisites

- **Node.js 22** or later
- **npm 10** or later (comes with Node.js 22)
- **gitleaks** (for pre-commit secret scanning - see [CONTRIBUTING.md](CONTRIBUTING.md))

## 📖 About

London.js is a community-driven meetup group focused on JavaScript and related technologies. This website serves as our digital home, providing information about upcoming and past events.

## 🛠 Tech Stack

- [Astro](https://astro.build) - Static Site Generator
- [Tailwind CSS](https://tailwindcss.com) - Styling
- [React 19](https://react.dev) - UI components
- [Vitest](https://vitest.dev) - Testing
- Astro Content Collections - JSON files

## 📜 Available Scripts

Key commands for development. See [CONTRIBUTING.md](CONTRIBUTING.md) for the full list.

| Command         | Description              |
| --------------- | ------------------------ |
| `npm run dev`   | Start development server |
| `npm run build` | Build for production     |
| `npm test`      | Run tests                |

## 🔒 Security & Quality

This project follows OpenSSF best practices for supply chain security:

- **SHA-pinned GitHub Actions** - All workflow actions pinned to immutable SHA hashes
- **Pre-commit hooks** - Automatic linting, formatting, and secret detection
- **CI/CD pipeline** - Automated testing, linting, and security scanning
- **CodeQL SAST** - Static analysis for security vulnerabilities
- **Dependabot** - Automated dependency updates for npm and GitHub Actions
- **Secret scanning** - gitleaks prevents secrets from being committed

For vulnerability disclosure, see [SECURITY.md](SECURITY.md).

## 📝 Adding a New Meetup

1. Copy the template from [`src/templates/meetup.json`](src/templates/meetup.json)
2. Create a new file in `src/content/meetups/` with the format `meetup-month-year.json`
3. Fill in the event details following the template structure
4. Add any sponsor logos to the `public/sponsors/` directory
5. Test locally before committing

You can use this command to create a new meetup:

```bash
# From project root
cp src/templates/meetup.json src/content/meetups/meetup-month-year.json
```

### Required Fields

- All fields in the template are required except those marked (optional)
- Dates must be in YYYY-MM-DD format
- Times must be in 24-hour HH:MM format
- URLs must be valid and include http(s)://

## 🤝 Contributing

We welcome contributions! See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

### Quick Contributing Guide

1. Fork the repository
2. Install dependencies: `npm install` (sets up pre-commit hooks)
3. Create a feature branch
4. Make your changes
5. Run tests: `npm test`
6. Build: `npm run build`
7. Submit a pull request

### Future Development Goals

- Admin dashboard for easier event management
- Enhanced speaker profiles
- Event photo galleries
- Community showcase section

## 🔧 Local Development

```bash
# Install dependencies (also sets up pre-commit hooks)
npm install

# Start development server
npm run dev

# Run all quality checks
npm run lint && npm run format:check && npm run lint:md && npm test

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
