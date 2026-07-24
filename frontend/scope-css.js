import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const replaceMap = {
  'merchant': {
    jsx: path.join(__dirname, 'src', 'components', 'Sidebar.jsx'),
    css: path.join(__dirname, 'src', 'components', 'Sidebar.css'),
    prefix: 'merchant-'
  },
  'admin': {
    jsx: path.join(__dirname, 'src', 'components', 'admin', 'AdminSidebar.jsx'),
    css: path.join(__dirname, 'src', 'components', 'admin', 'AdminSidebar.css'),
    prefix: 'admin-'
  },
  'superadmin': {
    jsx: path.join(__dirname, 'src', 'pages', 'superadmin', 'SuperAdminSidebar.jsx'),
    css: path.join(__dirname, 'src', 'pages', 'superadmin', 'SuperAdminSidebar.css'),
    prefix: 'superadmin-'
  }
};

const classesToPrefix = [
  'sidebar-overlay',
  'sidebar-menu',
  'sidebar-profile',
  'sidebar-header',
  'sidebar',
  'logo-subtitle',
  'logo',
  'avatar',
  'profile-info',
  'logout-section',
  'hamburger-btn'
];

for (const key in replaceMap) {
  const { jsx, css, prefix } = replaceMap[key];

  if (fs.existsSync(jsx)) {
    let jsxContent = fs.readFileSync(jsx, 'utf8');
    classesToPrefix.forEach(cls => {
      // Replace className="cls" or className={'cls'} or className={`cls`}
      // Also match class names inside strings like "sidebar open"
      const regex = new RegExp(`\\b${cls}\\b`, 'g');
      jsxContent = jsxContent.replace(regex, `${prefix}${cls}`);
    });
    fs.writeFileSync(jsx, jsxContent);
    console.log(`Updated ${jsx}`);
  }

  if (fs.existsSync(css)) {
    let cssContent = fs.readFileSync(css, 'utf8');
    classesToPrefix.forEach(cls => {
      // Replace .cls
      const regex = new RegExp(`\\.${cls}\\b`, 'g');
      cssContent = cssContent.replace(regex, `.${prefix}${cls}`);
    });
    fs.writeFileSync(css, cssContent);
    console.log(`Updated ${css}`);
  }
}
