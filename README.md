# admin-dileepa-dev

This is the administrative dashboard for managing content and data for [dileepa.dev](https://dileepa.dev) and its associated API.

## Demo Video

Click the link or image below to view the demo video on YouTube.

[![Admin Dashboard Demo](https://img.youtube.com/vi/nBv4h09KpyM/0.jpg)](https://www.youtube.com/watch?v=nBv4h09KpyM)

## Overview

This application serves as the central admin interface for:

- [**dileepa-dev**](https://github.com/dileepadev/dileepa-dev): The personal portfolio website.
- [**api-dileepa-dev**](https://github.com/dileepadev/api-dileepa-dev): The backend API providing data for the platform.

## Features

- **Dashboard:** Overview of the platform's content and status.
- **Content Management:** Manage various data entities including:
  - Blogs & Media
  - Experiences & Education
  - Projects & Tools
  - Communities & Events
  - Videos & Social Links
- **Authentication:** Secure access to the administrative panels.
- **Dark Mode Support:** Built-in theme switching with `next-themes`.

## Tech Stack

- **Framework:** [Next.js 16 (App Router)](https://nextjs.org/)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **UI & Styling:** [React 19](https://react.dev/), [Tailwind CSS 4](https://tailwindcss.com/), [Lucide React](https://lucide.dev/)
- **Validation:** [Zod](https://zod.dev/)

## Getting Started

### Prerequisites

- Node.js (Latest LTS recommended)
- npm or pnpm

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/dileepadev/admin-dileepa-dev.git
   cd admin-dileepa-dev
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up environment variables:

   Create a `.env.local` file based on `.env.example`:

   ```bash
   cp .env.example .env.local
   ```

   Update the variables with your local or production API endpoints.

### Development

Run the development server:

```bash
npm run dev
```

The dashboard will be available at `http://localhost:3001`.

### Build

To create an optimized production build:

```bash
npm run build
npm run start
```

## Related Projects

- [dileepa-dev](https://github.com/dileepadev/dileepa-dev) - Personal Portfolio Website.
- [api-dileepa-dev](https://github.com/dileepadev/api-dileepa-dev) - Personal Data API.
- [blog-dileepa-dev](https://github.com/dileepadev/blog-dileepa-dev) - Personal Blog Content.
- [links-dileepa-dev](https://github.com/dileepadev/links-dileepa-dev) - Linktree-style page.

## Guidelines

Please refer to the following documents for contribution and development standards:

- [CONTRIBUTING.md](CONTRIBUTING.md)
- [BRANCH_NAMING_GUIDELINES.md](BRANCH_NAMING_GUIDELINES.md)
- [COMMIT_MESSAGE_GUIDELINES.md](COMMIT_MESSAGE_GUIDELINES.md)
- [PULL_REQUEST_GUIDELINES.md](PULL_REQUEST_GUIDELINES.md)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
