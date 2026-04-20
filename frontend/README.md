# Wireeo Frontend Application

A complete, production-ready frontend application for Wireeo corporate website with an integrated Graphic Product Configurator and Admin Panel.

## Tech Stack

- React (Vite)
- React Router
- Tailwind CSS
- Axios
- Zustand
- React Konva

## Features

### Public Website

- Home page
- Solutions page
- Products listing with ranges
- Product detail pages with configurator access
- Projects/References
- Resources/Downloads
- About Wireeo
- Contact
- Legal pages (GDPR, Cookies, Terms)

### Product Configurator

- Canvas-based layered rendering
- Layer management (color, material, variants)
- Text customization
- Rule validation
- Configuration export

### Admin Panel

- Login system
- Dashboard
- Products management
- Categories management
- Product ranges management
- Configurator model management
- Graphic layers management
- Compatibility rules management

## Getting Started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start the backend API on `http://localhost:5000`.

3. Start development server:

   ```bash
   npm run dev
   ```

   Local API requests go to `/api` and Vite proxies them to `http://localhost:5000` by default.
   If your backend runs elsewhere, create `frontend/.env` and set `VITE_PROXY_TARGET`.

4. Build for production:
   ```bash
   npm run build
   ```

## Project Structure

```
src/
├── components/
│   ├── layout/
│   │   ├── Header.jsx
│   │   ├── Footer.jsx
│   │   └── Layout.jsx
│   └── configurator/
│       ├── Configurator.jsx
│       ├── ConfiguratorCanvas.jsx
│       ├── LayerRenderer.jsx
│       ├── OptionsPanel.jsx
│       ├── TextEditor.jsx
│       └── PreviewPanel.jsx
├── pages/
│   ├── Home.jsx
│   ├── Solutions.jsx
│   ├── Products.jsx
│   ├── products/
│   │   └── ProductDetail.jsx
│   ├── Projects.jsx
│   ├── Resources.jsx
│   ├── About.jsx
│   ├── Contact.jsx
│   ├── Legal.jsx
│   └── admin/
│       ├── AdminLogin.jsx
│       ├── AdminDashboard.jsx
│       └── AdminProducts.jsx
├── store/
│   └── useStore.js
├── services/
│   └── api.js
├── utils/
│   └── RuleValidator.js
└── data/
    └── (mock data)
```

## Mock Data

All API calls use mock data for development. Backend integration can be added by updating the `api.js` service file.

## Admin Access

- Username: admin
- Password: admin

## Notes

- No backend code included
- Responsive design for desktop, tablet, and mobile
- SEO-friendly structure
- Clean, scalable architecture
