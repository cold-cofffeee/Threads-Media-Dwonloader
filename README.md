# Threads Media Dwonloader

[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18-brightgreen.svg)](https://nodejs.org/)  
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**Download all high-resolution images and videos from a Threads profile into a single ZIP archive using Node.js and Puppeteer.**

---

## 🔍 SEO Description

Easily download and archive all high-quality photos and videos from any Threads.net profile with this automated Node.js script. Perfect for backing up your favorite Threads content into a neatly named ZIP file.

---

## ✨ Features

- ✅ Automatically scrolls through a Threads profile to load all posts  
- 📸 Extracts only high-resolution images and videos (skips low-res/thumbnail versions)  
- 🗂️ Downloads all media into a single ZIP archive named after the profile username  
- 🧾 Terminal logging of every step and file  
- ⚡ Fast and headless browser automation using Puppeteer  
- 📦 No external fetch dependency (uses Node 18+ native `fetch`)  

---

## 🧰 Requirements

- **Node.js v18 or later** ([download](https://nodejs.org/))  
- npm (comes with Node)

---

## ⚙️ Installation

1. Clone or download this repository  
2. Navigate into the project folder in your terminal  
3. Install dependencies:

```bash
npm install puppeteer jszip
````

---

## 🚀 Usage

### 1. Run with a specific profile URL

```bash
node index.js https://www.threads.net/@your_username
```

> The downloaded ZIP will be named: `your_username.zip`

### 2. Or use the default (fallback) URL

If you don't pass a URL, the script will fall back to a hardcoded profile (you can change it in `index.js`):

```bash
node index.js
```

---

## 🧪 Example Output

```bash
🚀 Starting media download from: https://www.threads.net/@helooooo
📦 ZIP output will be: helooooo.zip
🧭 Launching headless browser...
✅ Page loaded.
🔄 Scrolling to load all posts...
📜 Scroll #1
🛑 Reached bottom of page.
🔍 Extracting media URLs...
📸 Found 78 high-res media files. Starting downloads...
⬇️  [1/78] Downloading: https://...
...
📦 Creating ZIP with 78 files...
✅ ZIP saved: helooooo.zip
🏁 Done.
```

---

## 💡 Notes

* The script filters out thumbnail or low-resolution images by detecting common URL patterns like `p240x240`, `thumb`, etc.
* Download time depends on the number of posts and your internet speed
* Use responsibly and in accordance with Threads/Meta's Terms of Service

---

## 🧯 Troubleshooting

| Issue                       | Solution                                                                                                      |
| --------------------------- | ------------------------------------------------------------------------------------------------------------- |
| ❌ `fetch is not a function` | You must use **Node.js v18+** — check with `node -v`                                                          |
| ❌ Puppeteer install failed  | Try `npm install puppeteer --force` or refer to [Puppeteer troubleshooting](https://pptr.dev/troubleshooting) |
| ❌ `No media found`          | Ensure the profile is public and has posts with images/videos                                                 |

---

## 📁 .gitignore

To keep your project clean:

```
node_modules/
*.zip
.DS_Store
```

---

## 📜 License

This project is licensed under the [MIT License](https://opensource.org/licenses/MIT).
Use this script responsibly and for personal archiving only.

---

## 🤝 Contact

Found a bug or want a new feature?
Open an issue or start a discussion on GitHub!

---

**Enjoy your Threads backups!**
🚀📦🧵
