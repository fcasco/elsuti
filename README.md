# Dog Tag OpenSCAD Generator

A web application for generating parametric OpenSCAD files for custom dog name tags.

## Features

- **Text**: The dog's name extruded as a 3D shape (front color)
- **Background**: Same text shape but slightly larger, creating an outline/border effect (back color)
- **Ring**: A torus at the top for collar attachment
- Customizable parameters: name, font, colors, dimensions, ring position
- Live preview with front view and cross-section
- Download generated `.scad` files or copy the code

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Deployment to GitHub Pages

This project includes a GitHub Actions workflow (`.github/workflows/deploy.yml`) that automatically deploys to GitHub Pages on every push to the `main` branch.

### Setup Instructions

1. **Enable GitHub Pages** in your repository settings:
   - Go to **Settings** → **Pages**
   - Under **Source**, select **GitHub Actions**
   
2. **Push to main branch**: The workflow will automatically:
   - Build the project with the correct base path
   - Deploy to GitHub Pages
   - Your app will be available at `https://<username>.github.io/<repository-name>/`

3. **Manual deployment**: You can also trigger the workflow manually from the **Actions** tab by clicking **Run workflow**.

### Workflow Details

The deployment workflow:
- Triggers on push to `main` branch or manual dispatch
- Uses Node.js 20
- Builds the Vite app with the repository name as base path
- Deploys using GitHub's official Pages actions
- Handles concurrency to prevent overlapping deployments

## Technology Stack

- React 18
- TypeScript
- Vite
- Tailwind CSS 4
