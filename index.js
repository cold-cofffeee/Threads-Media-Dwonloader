const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const JSZip = require('jszip');
const readline = require('readline');

// Prompt user input from terminal
function askQuestion(query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  return new Promise(resolve => rl.question(query, ans => {
    rl.close();
    resolve(ans.trim());
  }));
}

// Filter out common low-res image URL patterns
function filterHighResUrls(urls) {
  const lowResPatterns = [
    /p\d+x\d+/i,      // e.g. p240x240
    /thumb/i,
    /small/i,
    /lowres/i,
    /thumbnail/i,
    /s\d+x\d+/i       // e.g. s150x150
  ];
  return urls.filter(url => !lowResPatterns.some(pattern => pattern.test(url)));
}

// Main function to download media from Threads
async function downloadThreadsMedia(profileUrl) {
  // Extract username from profile URL
  const usernameMatch = profileUrl.match(/@([a-zA-Z0-9_]+)/);
  const username = usernameMatch ? usernameMatch[1] : 'threads_user';
  const zipFilename = `${username}.zip`;

  console.log(`🚀 Starting media download from: ${profileUrl}`);
  console.log(`📦 ZIP output will be: ${zipFilename}`);
  console.log('🧭 Launching headless browser...');

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    defaultViewport: null
  });

  const page = await browser.newPage();
  await page.goto(profileUrl, { waitUntil: 'networkidle2' });
  console.log('✅ Page loaded.');

  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  console.log('🔄 Scrolling to load all posts...');
  const scrollToBottom = async (page, maxScrolls = 50) => {
    let previousHeight = await page.evaluate(() => document.body.scrollHeight);
    for (let i = 0; i < maxScrolls; i++) {
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      console.log(`📜 Scroll #${i + 1}`);
      await sleep(1500);
      const newHeight = await page.evaluate(() => document.body.scrollHeight);
      if (newHeight === previousHeight) {
        console.log('🛑 Reached bottom of page.');
        break;
      }
      previousHeight = newHeight;
    }
  };

  await scrollToBottom(page);

  console.log('🔍 Extracting media URLs...');
  let mediaUrls = await page.evaluate(() => {
    const urls = new Set();

    document.querySelectorAll('img, video, source').forEach(el => {
      const src = el.getAttribute('src') || el.src;
      if (src) urls.add(src);

      const srcset = el.getAttribute('srcset');
      if (srcset) {
        srcset.split(',').forEach(part => {
          const u = part.trim().split(' ')[0];
          if (u) urls.add(u);
        });
      }
    });

    document.querySelectorAll('*').forEach(el => {
      const bg = getComputedStyle(el).backgroundImage;
      const match = bg && bg.match(/url\("?([^")]+)"?\)/);
      if (match && match[1]) urls.add(match[1]);
    });

    return Array.from(urls);
  });

  mediaUrls = filterHighResUrls(mediaUrls);

  if (mediaUrls.length === 0) {
    console.log('❌ No media found on the page after filtering.');
    await browser.close();
    return;
  }

  console.log(`📸 Found ${mediaUrls.length} high-res media files. Starting downloads...`);

  const zip = new JSZip();
  let count = 0;

  for (const url of mediaUrls) {
    try {
      console.log(`⬇️  [${count + 1}/${mediaUrls.length}] Downloading: ${url}`);
      const response = await fetch(url);
      if (!response.ok) {
        console.warn(`⚠️  Failed to fetch: ${url} - Status ${response.status}`);
        continue;
      }

      const buffer = await response.arrayBuffer ? await response.arrayBuffer() : await response.buffer();
      const data = Buffer.from(buffer);

      let ext = 'bin';
      const contentType = response.headers.get('content-type');
      if (contentType) {
        const match = contentType.match(/image\/([a-z0-9]+)/) || contentType.match(/video\/([a-z0-9]+)/);
        if (match) ext = match[1];
      }

      let filename = path.basename(new URL(url).pathname);
      if (!filename.includes('.')) {
        filename += `.${ext}`;
      }

      filename = `${username}_${String(count + 1).padStart(3, '0')}_${filename}`.replace(/[^a-zA-Z0-9._-]/g, '_');
      zip.file(filename, data);
      count++;
    } catch (err) {
      console.error(`❌ Error downloading ${url}:`, err.message);
    }
  }

  if (count === 0) {
    console.log('❌ No files were downloaded.');
    await browser.close();
    return;
  }

  console.log(`📦 Creating ZIP with ${count} files...`);
  const zipData = await zip.generateAsync({ type: 'nodebuffer' });
  fs.writeFileSync(zipFilename, zipData);
  console.log(`✅ ZIP saved: ${zipFilename}`);

  await browser.close();
  console.log('🏁 Done.');
}

// --- Entry Point ---
(async () => {
  const inputUrl = await askQuestion('🔗 Enter Threads profile URL: ');
  if (!inputUrl || !inputUrl.startsWith('http')) {
    console.error('❌ Invalid URL. Please provide a valid Threads profile URL.');
    process.exit(1);
  }

  try {
    await downloadThreadsMedia(inputUrl);
  } catch (err) {
    console.error('❌ Unexpected error:', err);
  }
})();
// --- End of index.js ---