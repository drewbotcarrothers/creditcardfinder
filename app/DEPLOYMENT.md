# Deploying to Hostinger

This guide explains how to deploy your Canadian Credit Card Finder website to Hostinger using the static export files.

## Prerequisites

*   A Hostinger account with a hosting plan.
*   Access to the **File Manager** (or FTP) in your Hostinger dashboard.
*   The `out` folder generated on your local machine (Desktop/Google Antigravity/Canadian_Credit_Card_Finder/app/out).

## Step 1: Locate Your Build Files

After running the build, all the necessary files are in the `out` folder inside your project directory:

`.../Canadian_Credit_Card_Finder/app/out/`

This folder contains:
*   `index.html` (Home page)
*   `compare.html` (Compare page)
*   `card/` (Folder containing all individual card pages)
*   `_next/` (Static assets like CSS and JS)
*   `images/` (Card images)

## Step 2: Upload to Hostinger

1.  Log in to your **Hostinger Dashboard**.
2.  Go to **Websites** and click **Manage** next to your domain (`canadiancreditcardfinder.com`).
3.  Scroll down to the **Files** section and click on **File Manager**.
4.  Navigate into the `public_html` folder.
    *   *Note: If there are default files here (like `default.php`), delete them.*
5.  **Upload the contents of the `out` folder**:
    *   Select all files and folders **INSIDE** the `out` folder (`index.html`, `_next`, `card`, etc.).
    *   Drag and drop them directly into the `public_html` directory in Hostinger's File Manager.
    *   Alternatively, use the **Upload** button (top right) -> **Folder** (or zipped archive if you prefer to zip `out` content first and unzip on server).

## Step 3: Verify Deployment

1.  Visit your website URL (e.g., `https://canadiancreditcardfinder.com`).
2.  Check that the homepage loads.
3.  Click on a card to see if the product page loads (e.g., `/card/westjet-rbc-mastercard`).
4.  Try the "Compare" page.

## Troubleshooting

*   **404 Errors**: Ensure you uploaded the `_next` folder. This contains the styling and scripts.
*   **Images Missing**: Ensure the `images` folder was uploaded correctly.
*   **Changes not showing**: You might need to clear your browser cache or Hostinger's cache (if enabled).

## Future Updates

To update your site:
1.  Run `npm run build` locally.
2.  Delete the old files in `public_html` on Hostinger.
3.  Upload the new contents of the `out` folder.
