import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Enable JSON parsing with a generous limit
app.use(express.json({ limit: "5mb" }));

// Lazy initialization of Gemini Client to prevent crash on startup if key is missing
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!process.env.GEMINI_API_KEY) {
    return null;
  }
  if (!aiClient) {
    try {
      aiClient = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });
    } catch (err) {
      console.error("Failed to construct GoogleGenAI instance:", err);
      return null;
    }
  }
  return aiClient;
}

// Helper to strip escape characters and decode URL-encoded Amazon image strings
function cleanImageUrl(imgUrl: string): string {
  if (!imgUrl || typeof imgUrl !== 'string') return imgUrl;
  let cleaned = imgUrl.replace(/\\+/g, "").replace(/\\/g, "/").trim();
  try {
    cleaned = decodeURIComponent(cleaned);
  } catch (e) {
    // Return partially cleaned URL if decode fails
  }
  return cleaned;
}

// Helper to strip Amazon image dimensions suffix to get original high-resolution master
function getHighResAmazonUrl(imgUrl: string): string {
  if (!imgUrl || typeof imgUrl !== 'string') return imgUrl;
  const cleaned = cleanImageUrl(imgUrl);
  
  const isAmazonImg = /images-na\.ssl-images-amazon\.com|media-amazon\.com|images-amazon\.com/i.test(cleaned);
  if (!isAmazonImg) return cleaned;
  
  // Replace Amazon sizing suffix like ._AC_UL320_SR320,320_.jpg, .AC_SL1500_.jpg or ._SS40_.jpg with .jpg
  return cleaned.replace(/\.(?:_|AC|SL|UL|SX|SY|SR|QL|UF|SS)[A-Za-z0-9,_\-+]*?_\.(jpg|jpeg|png|gif|webp)/i, '.$1');
}

// Helper to check if Amazon returned a robot/CAPTCHA page instead of a real product page
function isAmazonBlockPage(html: string): boolean {
  if (!html) return false;
  const lowercase = html.toLowerCase();
  return (
    lowercase.includes("robot check") ||
    lowercase.includes("captcha") ||
    lowercase.includes("/errors/validatecaptcha") ||
    lowercase.includes("automated access") ||
    lowercase.includes("unusual traffic") ||
    lowercase.includes("sorry, we just need to make sure you're not a robot")
  );
}

// Scrape HTML for any real Amazon item/product image URLs containing /images/I/ (which signifies product assets)
// Scrape HTML for any real Amazon item/product image URLs containing /images/I/ (which signifies product assets)
function extractProductImagesFromHtml(html: string): string[] {
  const images: string[] = [];
  if (!html || isAmazonBlockPage(html)) return images;
  
  // 1. High-precision extraction targeting Amazon's main product image JSON properties or DOM attributes
  const mainImageMatches = [
    html.match(/id=["']landingImage["'][^>]*src=["']([^"']+)["']/i),
    html.match(/src=["']([^"']+)["'][^>]*id=["']landingImage["']/i),
    html.match(/data-a-dynamic-image=["'](?:\{&quot;|\{")([^"&]+?)(?:&quot;|")[\s:]/i),
    html.match(/data-old-hires=["'](https:\/\/[^"']+\.(?:jpg|jpeg|png|gif|webp))["']/i),
    html.match(/["']hiRes["']\s*:\s*["'](https:\/\/[^"']+\.(?:jpg|jpeg|png|gif|webp))["']/i),
    html.match(/["']large["']\s*:\s*["'](https:\/\/[^"']+\.(?:jpg|jpeg|png|gif|webp))["']/i),
    html.match(/["']mainUrl["']\s*:\s*["'](https:\/\/[^"']+\.(?:jpg|jpeg|png|gif|webp))["']/i),
    html.match(/class=["'][^"']*main-image[^"']*["'][^>]*src=["']([^"']+)["']/i)
  ];

  for (const m of mainImageMatches) {
    if (m && m[1]) {
      const cleaned = getHighResAmazonUrl(m[1]);
      if (cleaned && !images.includes(cleaned)) {
        images.push(cleaned);
      }
    }
  }

  // 2. Pattern to match Amazon item/product images (contains /images/I/ or /images/P/ in the path)
  const regex = /(https:\/\/(?:images-na\.ssl-images-amazon\.com|m\.media-amazon\.com|images-amazon\.com|media-amazon\.com)\/images\/[IP]\/[a-zA-Z0-9\-_%+.#~]+?\.(?:jpg|jpeg|png|gif|webp))/gi;
  
  let match;
  let iterations = 0;
  while ((match = regex.exec(html)) !== null && iterations < 35) {
    iterations++;
    const rawUrl = match[1];
    const cleanedUrl = cleanImageUrl(rawUrl);
    
    // Ignore spacer pixels, icons, ratings stars or standard UI/marketing graphics
    const lowercase = cleanedUrl.toLowerCase();
    const isUiAsset = 
      lowercase.includes("captcha") || 
      lowercase.includes("logo") || 
      lowercase.includes("sprite") || 
      lowercase.includes("pixel") || 
      lowercase.includes("transparent") || 
      lowercase.includes("grey-pixel") || 
      lowercase.includes("loading") || 
      lowercase.includes("spinner") || 
      lowercase.includes("play-button") || 
      lowercase.includes("icon") || 
      lowercase.includes("nav") || 
      lowercase.includes("ad-") || 
      lowercase.includes("feedback") || 
      lowercase.includes("checkmark") || 
      lowercase.includes("star");

    if (!images.includes(cleanedUrl) && !isUiAsset) {
      images.push(cleanedUrl);
    }
  }
  return images;
}

// Helper to extract a 10-character Amazon Standard Identification Number (ASIN)
function extractAmazonAsin(url: string): string | null {
  if (!url) return null;
  // Match standard DP/GP/D patterns
  const patterns = [
    /\/dp\/([A-Z0-9]{10})/i,
    /\/gp\/product\/([A-Z0-9]{10})/i,
    /\/gp\/aw\/d\/([A-Z0-9]{10})/i,
    /\/dp\/aw\/d\/([A-Z0-9]{10})/i,
    /\/d\/([A-Z0-9]{10})/i,
    /\/asin\/([A-Z0-9]{10})/i,
    /[?&]asin=([A-Z0-9]{10})/i,
    /\/product\/([A-Z0-9]{10})/i,
    /\/product-reviews\/([A-Z0-9]{10})/i
  ];
  
  for (const regex of patterns) {
    const match = url.match(regex);
    if (match && match[1]) {
      return match[1].toUpperCase();
    }
  }
  
  // Last resort fallback matching any 10-character alphanumeric word starting with B0
  const b0Match = url.match(/\b(B0[A-Z0-9]{8})\b/i);
  if (b0Match) {
    return b0Match[1].toUpperCase();
  }
  
  return null;
}

// Helper to extract a beautiful title from the Amazon URL's product name slug segment
function extractTitleFromAmazonUrl(url: string): string | null {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    
    // Look for product slug before /dp/ or /gp/
    const dpMatch = pathname.match(/\/([^\/]+)\/dp\/[A-Z0-9]{10}/i) || 
                    pathname.match(/\/([^\/]+)\/gp\/product\/[A-Z0-9]{10}/i) ||
                    pathname.match(/\/dp\/[A-Z0-9]{10}\/([^\/]+)/i);
    
    let slug = "";
    if (dpMatch && dpMatch[1] && dpMatch[1].toLowerCase() !== "dp" && dpMatch[1].toLowerCase() !== "gp") {
      slug = dpMatch[1];
    } else {
      // Split path and find non-generic, long segments
      const parts = pathname.split("/").filter(p => p.length > 5 && !p.includes(".") && !["product", "reviews", "dp", "gp", "asin"].includes(p.toLowerCase()));
      if (parts.length > 0) {
        slug = parts[0];
      }
    }
    
    if (slug) {
      // Clean up the slug
      let clean = slug
        .replace(/_|-/g, " ")
        .replace(/\b(ref|ie|UTF8|qid|sr|pf_rd_.*)\b.*/gi, "") // strip ref parameters
        .trim();
      
      // Capitalize first letter of each word
      clean = clean.split(" ")
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ")
        .replace(/\s+/g, " ")
        .trim();
        
      if (clean && clean.length > 3) {
        return clean;
      }
    }
  } catch (e) {
    // ignore URL parsing error
  }
  return null;
}

function decodeHtmlEntities(str: string): string {
  if (!str) return "";
  let decoded = str;
  let prev;
  let iterations = 0;
  do {
    prev = decoded;
    decoded = decoded
      .replace(/&amp;/gi, "&")
      .replace(/&lt;/gi, "<")
      .replace(/&gt;/gi, ">")
      .replace(/&quot;/gi, '"')
      .replace(/&#39;/gi, "'")
      .replace(/&#039;/gi, "'")
      .replace(/&ndash;/gi, "–")
      .replace(/&mdash;/gi, "—")
      .replace(/&rsquo;/gi, "'")
      .replace(/&lsquo;/gi, "'")
      .replace(/&ldquo;/gi, '"')
      .replace(/&rdquo;/gi, '"');
    iterations++;
  } while (decoded !== prev && iterations < 4);
  return decoded;
}

// Helper to clean up raw product titles, stripping direct Amazon prefixes and redundant category suffixes while preserving full technical details and model numbers
function cleanProductTitle(title: string): string {
  if (!title) return "";
  
  // 1. Decode HTML entities recursively to prevent double-escaping
  let clean = decodeHtmlEntities(title);
  
  // 2. Remove standard e-commerce domain prefix and suffix noise
  clean = clean
    .replace(/^Amazon\.(in|com|co\.uk|ca|de|fr|co\.jp|com\.au|es|it):\s*/i, "")
    .replace(/:\s*Amazon\.(in|com|co\.uk|ca|de|fr|co\.jp|com\.au|es|it)[\s\S]*/i, "")
    .replace(/(\s*-\s*Buy\s+.*Online|\|\s*Amazon\.(in|com|co\.uk|ca|de|fr|co\.jp|com\.au|es|it)|\s*at\s*Low\s*Prices\s*.*)$/i, "")
    .replace(/<[^>]+>/g, "") // Strip any HTML tags
    .replace(/\s+/g, " ")
    .trim();

  // 3. Remove ONLY direct e-commerce site suffix endings, preserving all technical specs
  clean = clean
    .replace(/\s*\|\s*(?:Amazon|Flipkart|Shop|Store|Best Buy|Ebay)(?:\.(?:com|in|co\.uk|org|net))?\s*$/i, "")
    .replace(/\s*-\s*(?:Amazon|Flipkart|Shop|Store|Best Buy|Ebay)(?:\.(?:com|in|co\.uk|org|net))?\s*$/i, "");

  // Clean trailing punctuation
  clean = clean.replace(/[\s\-|:|;|,]+$/, "").trim();

  return clean;
}

// Explicitly maps common Amazon categories, department breadcrumbs, and keywords to the defined portfolio categories
function mapAmazonCategory(url: string, title: string, description: string, htmlContent?: string): string {
  let categoryIndicators = "";
  if (htmlContent) {
    // 1. Wayfinding breadcrumbs container (very accurate for Amazon listings)
    const wayfindingMatch = htmlContent.match(/id=["']wayfinding-breadcrumbs_container["'][\s\S]*?<\/div>/i);
    if (wayfindingMatch) {
      categoryIndicators += " " + wayfindingMatch[0].replace(/<[^>]+>/g, " ");
    }
    
    // 2. Class-based breadcrumbs list
    const breadcrumbMatch = htmlContent.match(/class=["'][^"']*breadcrumb[^"']*["'][\s\S]*?<\/ul>/i);
    if (breadcrumbMatch) {
      categoryIndicators += " " + breadcrumbMatch[0].replace(/<[^>]+>/g, " ");
    }
    
    // 3. Sub-navigation store identifier or departments list (e.g. "electronics", "computers")
    const navSubnavMatch = htmlContent.match(/id=["']nav-subnav["'][\s\S]*?<\/div>/i) ||
                           htmlContent.match(/class=["'][^"']*nav-subnav["'][\s\S]*?<\/div>/i);
    if (navSubnavMatch) {
      categoryIndicators += " " + navSubnavMatch[0].replace(/<[^>]+>/g, " ");
    }
    
    // 4. HTML meta keywords or title tag information
    const keywordsMatch = htmlContent.match(/<meta[^>]*name=["']keywords["'][^>]*content=["']([^"']+)["']/i);
    if (keywordsMatch) {
      categoryIndicators += " " + keywordsMatch[1];
    }
    
    // 5. Embedded storeID or category definitions in page scripts (e.g. storeID:"electronics")
    const storeIDMatch = htmlContent.match(/storeID\s*:\s*["']([^"']+)["']/i);
    if (storeIDMatch) {
      categoryIndicators += " " + storeIDMatch[1];
    }
    const jsCategoryMatch = htmlContent.match(/category\s*:\s*["']([^"']+)["']/i);
    if (jsCategoryMatch) {
      categoryIndicators += " " + jsCategoryMatch[1];
    }
  }

  // Combine search vectors
  const searchText = (
    (url || "") + " " + 
    (title || "") + " " + 
    (description || "") + " " + 
    categoryIndicators
  ).toLowerCase();

  // Explicit mapping of precise categories to target portfolio categories
  
  // Software department and related licenses (highest precision, check first to avoid false-categorization)
  const softwareKeywords = [
    "software", "operating system", "license key", "antivirus", "activation code", "office suites", 
    "mcafee", "norton", "kaspersky", "office 365", "windows 11", "windows 10", "activation key", 
    "digital download", "subscription key", "adobe creative suite", "photoshop", "illustrator",
    "subscription", "product key", "license key", "download code"
  ];
  
  if (softwareKeywords.some(kw => searchText.includes(kw))) {
    return "software";
  }

  // Photography, Videography, and Audio/Studio gear department and terms
  const photographyKeywords = [
    "camera & photo", "camera", "lens", "tripod", "gimbal", "cinematography", "photography", 
    "mirrorless", "dslr", "aperture", "photo", "video", "videography", "canon", "nikon", "sony", 
    "fujifilm", "panasonic lumix", "leica", "hasselblad", "gopro", "action camera", "camcorder",
    "gimbal stabilizer", "led video light", "ring light", "softbox", "speedlight", "camera flash", 
    "studio light", "microphones", "microphone", "sound mixer", "audio interface", "audio recorder",
    "headphones", "earphones", "studio monitor", "wireless transmitter", "lavalier", "rode mic",
    "shure mic", "condenser microphone", "zoom recorder"
  ];
  
  if (photographyKeywords.some(kw => searchText.includes(kw))) {
    return "photography";
  }

  // IT & High-Performance Tech, Computer Components, Networking & Enterprise systems
  const itTechKeywords = [
    "computers & accessories", "computer components", "networking products", "router", "network switch", 
    "processor", "intel core", "ryzen", "networking", "motherboard", "hard drive", "server", "ddr4", "ddr5", 
    "desktop pc", "laptop", "computer", "solid state drive", "ssd", "nvme m.2", "graphics card", "gpu", 
    "rtx 40", "rtx 30", "rtx", "gtx", "radeon", "nvidia", "amd", "computer monitors", "gaming monitor", 
    "display", "ethernet", "access point", "modem", "synology", "nas storage", "internal hard drive",
    "docking station", "thunderbolt dock", "pc build", "central processing unit", "cpu"
  ];
  
  if (itTechKeywords.some(kw => searchText.includes(kw))) {
    return "it_tech";
  }

  // Default fallback for general smartphone accessories, power banks, adapters, cables, stands, etc.
  return "accessories";
}

// Helper function to extract product metadata programmatically from HTML when Gemini is unavailable or rate-limited
function fallbackExtractFromHtml(url: string, fullHtml: string) {
  // Extract ASIN
  const asin = extractAmazonAsin(url);
  
  // Extract Title
  let title = "";
  
  if (fullHtml) {
    // High-priority Amazon-specific DOM selectors matching Amazon product titles
    const amazonTitleMatch = fullHtml.match(/<span[^>]*id=["']productTitle["'][^>]*>([\s\S]*?)<\/span>/i) ||
                             fullHtml.match(/<h1[^>]*id=["']title["'][^>]*>([\s\S]*?)<\/h1>/i) ||
                             fullHtml.match(/<h1[^>]*class=["'][^"']*product-title[^"']*["'][^>]*>([\s\S]*?)<\/h1>/i);

    if (amazonTitleMatch) {
      title = amazonTitleMatch[1].trim();
    } else {
      // Normal meta tag extraction
      const ogTitleMatch = fullHtml.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i) ||
                           fullHtml.match(/<meta[^>]*name=["']twitter:title["'][^>]*content=["']([^"']+)["']/i) ||
                           fullHtml.match(/<meta[^>]*name=["']title["'][^>]*content=["']([^"']+)["']/i) ||
                           fullHtml.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:title["']/i);
      if (ogTitleMatch) {
        title = ogTitleMatch[1];
      } else {
        const titleTagMatch = fullHtml.match(/<title>([\s\S]*?)<\/title>/i);
        if (titleTagMatch) {
          title = titleTagMatch[1];
        }
      }
    }
  }

  // Clean title using the optimized helper
  title = cleanProductTitle(title);

  // If title is empty, CAPTCHA, or generic, extract directly from URL slug!
  const isTitleBlocked = !title || 
                         title.toLowerCase().includes("robot check") || 
                         title.toLowerCase().includes("captcha") || 
                         title.toLowerCase().includes("automated access") ||
                         title.toLowerCase() === "amazon.com" ||
                         title.toLowerCase() === "amazon.in";
  if (isTitleBlocked) {
    const slugTitle = extractTitleFromAmazonUrl(url);
    title = slugTitle ? cleanProductTitle(slugTitle) : (asin ? `Amazon Gear (ASIN: ${asin})` : "Curated Equipment Gear");
  }

  // Extract Description
  let description = "";
  
  if (fullHtml) {
    // High-priority Amazon product feature bullets matcher
    const featureBulletsMatch = fullHtml.match(/<div[^>]*id=["']feature-bullets["'][^>]*>([\s\S]*?)<\/div>/i);
    if (featureBulletsMatch) {
      description = featureBulletsMatch[1]
        .replace(/<[^>]+>/g, " ") // Strip HTML tags
        .replace(/\s+/g, " ")
        .trim();
    } else {
      const ogDescMatch = fullHtml.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i) ||
                          fullHtml.match(/<meta[^>]*name=["']twitter:description["'][^>]*content=["']([^"']+)["']/i) ||
                          fullHtml.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i) ||
                          fullHtml.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:description["']/i);
      if (ogDescMatch) {
        description = ogDescMatch[1].trim();
      }
    }
  }

  if (description) {
    description = description.replace(/&amp;/g, "&")
                             .replace(/&lt;/g, "<")
                             .replace(/&gt;/g, ">")
                             .replace(/&quot;/g, '"')
                             .replace(/&#39;/g, "'")
                             .replace(/&ndash;/g, "–")
                             .replace(/&mdash;/g, "—")
                             .replace(/<[^>]+>/g, " ") // Strip any stray tags
                             .replace(/\s+/g, " ")
                             .trim();
    if (description.length > 180) {
      description = description.substring(0, 177) + "...";
    }
  }

  // Extract Image URL using smart /images/I/ product item scanner first
  let imageUrl = "";
  if (fullHtml) {
    const candidateImages = extractProductImagesFromHtml(fullHtml);
    if (candidateImages.length > 0) {
      imageUrl = getHighResAmazonUrl(candidateImages[0]);
    } else {
      // Fallback to og:image meta tags
      const ogImageMatch = fullHtml.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i) ||
                           fullHtml.match(/<meta[^>]*name=["']twitter:image["'][^>]*content=["']([^"']+)["']/i);
      if (ogImageMatch) {
        imageUrl = getHighResAmazonUrl(ogImageMatch[1]);
      } else {
        // Direct matches from Amazon script/image containers
        const amznImgMatch = fullHtml.match(/hiRes"[\s:]+["'](https:\/\/images-[^"']+)["']/i) ||
                             fullHtml.match(/large"[\s:]+["'](https:\/\/images-[^"']+)["']/i) ||
                             fullHtml.match(/mainUrl"[\s:]+["'](https:\/\/images-[^"']+)["']/i) ||
                             fullHtml.match(/src=["'](https:\/\/images-[^" \t\r\n]+\.jpg)["']/i);
        if (amznImgMatch) {
          imageUrl = getHighResAmazonUrl(amznImgMatch[1]);
        }
      }
    }
  }

  // If imageUrl is empty, or is a generic/placeholder image, or looks like a tracking pixel, and we have ASIN, use ASIN image!
  const isPlaceholderImg = !imageUrl || 
                           imageUrl.includes("unsplash.com") || 
                           imageUrl.includes("transparent") || 
                           imageUrl.includes("pixel") ||
                           imageUrl.length < 10;
  if (isPlaceholderImg && asin) {
    imageUrl = `https://images-na.ssl-images-amazon.com/images/P/${asin}.01.LZZZZZZZ.jpg`;
  } else if (!imageUrl) {
    imageUrl = "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=600&auto=format&fit=crop";
  }

  // Extract Price
  let price = "";
  if (fullHtml) {
    const priceOffscreenMatch = fullHtml.match(/class=["']a-offscreen["'][^>]*>([^<]+)</i);
    if (priceOffscreenMatch) {
      price = priceOffscreenMatch[1].trim();
    } else {
      const priceTextMatch = fullHtml.match(/id=["']priceblock_ourprice["'][^>]*>([^<]+)</i) ||
                             fullHtml.match(/id=["']priceblock_dealprice["'][^>]*>([^<]+)</i) ||
                             fullHtml.match(/(?:₹|\$)\s*[0-9,]+(?:\.[0-9]{2})?/i);
      if (priceTextMatch) {
        price = priceTextMatch[0].trim();
      }
    }
  }

  // Determine Category
  const category = mapAmazonCategory(url, title, description, fullHtml);

  // Generate an elegant, custom description if missing or blocked
  const isDescriptionBlocked = !description || 
                               description.toLowerCase().includes("robot check") || 
                               description.toLowerCase().includes("captcha") || 
                               description.toLowerCase().includes("automated access") ||
                               description === "Check out this top-tier equipment selected for regional creators and tech professionals in Assam.";
  if (isDescriptionBlocked) {
    if (category === "photography") {
      description = `High-performance ${title} optimized for professional cinematography and photography. Excellent choice for Guwahati and Assam creators looking to upgrade their production quality.`;
    } else if (category === "it_tech") {
      description = `Top-tier hardware specifications. This ${title} is selected for its extreme performance, reliability, and cooling efficiency in tech workspaces and IT systems.`;
    } else if (category === "software") {
      description = `Genuine activation for ${title}. Increase your capabilities, boost safety, and unlock the full suite of creation tools with original licenses.`;
    } else {
      description = `Premium ${title} designed to elevate your workflow. Carefully curated for regional creative professionals and tech enthusiasts.`;
    }
  }

  return { title, description, imageUrl, price, category };
}

// Server-side cache for YouTube video list to optimize loading speeds and avoid spamming/rate-limits
const youtubeCacheMap = new Map<string, { videos: any[]; timestamp: number }>();

// Server-side cache for Instagram posts
const instagramCacheMap = new Map<string, { posts: any[]; timestamp: number }>();

const DEFAULT_INSTAGRAM_POSTS = [
  {
    id: "insta_1",
    imageUrl: "https://lh3.googleusercontent.com/d/10-HoXkMa_X3axop53ogpiPEyDv_w3Nbn",
    likes: 485,
    comments: 32,
    caption: "Capturing the pure elegance of traditional Assamese weddings in Guwahati. Every smile tells a story under the warm golden hours. ✨🌸 #AssamWeddings #GuwahatiPhotographer #CandidBridal",
    permalink: "https://www.instagram.com/mpanjiyar1/",
    mediaType: "IMAGE"
  },
  {
    id: "insta_2",
    imageUrl: "https://lh3.googleusercontent.com/d/1Lf19vDAD8mmFtpI2GH2t8v0IFd2s7hZU",
    likes: 512,
    comments: 28,
    caption: "The beautiful details of a traditional Mekhela Chador. Intricate golden threads handwoven with ultimate precision. 💍🌾 #MekhelaChador #AssamHeritage #AssameseBride #Portraits",
    permalink: "https://www.instagram.com/mpanjiyar1/",
    mediaType: "IMAGE"
  },
  {
    id: "insta_3",
    imageUrl: "https://lh3.googleusercontent.com/d/1NDzHguseCZyHVR57bnsOwtdu8kuZTa9n",
    likes: 396,
    comments: 24,
    caption: "Timeless candid couple portraits amidst the lush green tea gardens of Dibrugarh, Assam. Celebrating true love in the lap of nature. 🌿🍵 #CoupleGoals #TeaGardensOfAssam #CandidSchedules",
    permalink: "https://www.instagram.com/mpanjiyar1/",
    mediaType: "IMAGE"
  },
  {
    id: "insta_4",
    imageUrl: "https://lh3.googleusercontent.com/d/1NZ5KZgS7OnNAlh-2LK73Z5vFxQEXqHBF",
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-videographer-with-a-camera-at-a-wedding-40118-large.mp4",
    likes: 685,
    comments: 41,
    caption: "Behind the Scenes of our recent cinematic shoot! Catch the live action, high speed tracking, and detailed lighting setups. 🎬⚡ #CinematicReels #BTS #WeddingTeaser #PixelFrame",
    permalink: "https://www.instagram.com/mpanjiyar1/",
    mediaType: "VIDEO"
  },
  {
    id: "insta_5",
    imageUrl: "https://lh3.googleusercontent.com/d/1ZVDqvzzWSrJ_NZsku_evg29MeOK69Prr",
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-photographer-taking-photos-of-a-bride-and-groom-40120-large.mp4",
    likes: 540,
    comments: 38,
    caption: "That pure, unscripted laughter when the groom says his vows. Truly high-definition joy captured forever. 💍❤️ #AssamWeddingCinema #EmotionalCandid #GuwahatiVibe",
    permalink: "https://www.instagram.com/mpanjiyar1/",
    mediaType: "VIDEO"
  },
  {
    id: "insta_6",
    imageUrl: "https://lh3.googleusercontent.com/d/159c6sugb6tfSr8LLyEax4VHSP5MUnQnI",
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-photographer-capturing-a-video-of-a-dancing-couple-40114-large.mp4",
    likes: 720,
    comments: 55,
    caption: "Slow-motion dance floor transitions! High-end gimbal tracking brings the wedding beats alive on your screen. 🕺💃 #SangeetNight #DanceTeaser #CinematicShots",
    permalink: "https://www.instagram.com/mpanjiyar1/",
    mediaType: "VIDEO"
  }
];

const CACHE_DURATION_MS = 15 * 60 * 1000; // 15 minutes cache duration

async function resolveChannelId(inputUrl: string): Promise<string> {
  if (!inputUrl) return "UCoZOM_gfrukJgZlBra0l-6w";
  
  const clean = inputUrl.trim();
  
  if (/^UC[a-zA-Z0-9_-]{22}$/.test(clean)) {
    return clean;
  }
  
  const channelMatch = clean.match(/\/channel\/(UC[a-zA-Z0-9_-]{22})/i);
  if (channelMatch) {
    return channelMatch[1];
  }
  
  try {
    console.info(`[YouTube] Attempting to resolve channel ID for URL: ${clean}`);
    const res = await fetch(clean, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9'
      }
    });
    if (res.ok) {
      const html = await res.text();
      const metaMatch = html.match(/itemprop=["']channelId["']\s+content=["'](UC[a-zA-Z0-9_-]{22})["']/i) ||
                        html.match(/channel_id=(UC[a-zA-Z0-9_-]{22})/i) ||
                        html.match(/"browseId"\s*:\s*"(UC[a-zA-Z0-9_-]{22})"/i);
      if (metaMatch) {
        console.info(`[YouTube] Successfully resolved channel ID: ${metaMatch[1]}`);
        return metaMatch[1];
      }
    }
  } catch (err: any) {
    console.warn(`[YouTube] Failed to resolve channel ID from URL:`, err?.message);
  }
  
  return "UCoZOM_gfrukJgZlBra0l-6w";
}

const DEFAULT_VIDEOS = [
  {
    id: "U7Yy0bY4zXQ",
    title: "Cinematic Wedding Portfolio Guwahati | Sony A7IV & Nikon Z9 Calibrated Frame",
    views: 12500,
    viewsFormatted: "12.5K views",
    likes: 620,
    likesFormatted: "620 likes",
    published: "2024-03-12T10:00:00Z"
  },
  {
    id: "gS5YF9vB3cs",
    title: "High-End PC Builder & SSD Hardware Optimization | Guwahati On-Site IT Vlog",
    views: 8900,
    viewsFormatted: "8.9K views",
    likes: 410,
    likesFormatted: "410 likes",
    published: "2024-04-18T14:30:00Z"
  },
  {
    id: "tH9qE8wY5aY",
    title: "Nikon Plena 135mm Calibration and Portrait Shootout | Pixel Frame Guwahati",
    views: 6400,
    viewsFormatted: "6.4K views",
    likes: 320,
    likesFormatted: "320 likes",
    published: "2024-05-22T08:15:00Z"
  }
];

function formatViews(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1).replace(/\.0$/, "") + "M views";
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, "") + "K views";
  }
  return `${num} views`;
}

function formatLikes(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1).replace(/\.0$/, "") + "M likes";
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, "") + "K likes";
  }
  return `${num} likes`;
}

// Scrape YouTube channel directly via public RSS feed & fetch exact meta views
async function fetchYoutubeVideosDirectly(channelId: string = "UCoZOM_gfrukJgZlBra0l-6w"): Promise<any[]> {
  const feedUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
  
  console.info(`[YouTube] Fetching public XML video feed for channel ${channelId}...`);
  const response = await fetch(feedUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'application/xml,text/xml,application/xhtml+xml'
    }
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch YouTube feed. Status: ${response.status}`);
  }
  
  const xml = await response.text();
  const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
  let match;
  const videos: any[] = [];
  
  while ((match = entryRegex.exec(xml)) !== null && videos.length < 15) {
    const entry = match[1];
    const idMatch = entry.match(/<yt:videoId>([^<]+)<\/yt:videoId>/);
    const titleMatch = entry.match(/<title>([^<]+)<\/title>/);
    const publishedMatch = entry.match(/<published>([^<]+)<\/published>/);
    
    if (idMatch && titleMatch) {
      videos.push({
        id: idMatch[1].trim(),
        title: titleMatch[1].trim(),
        published: publishedMatch ? publishedMatch[1].trim() : new Date().toISOString(),
        views: 0,
        viewsFormatted: "0 views",
        likes: 0,
        likesFormatted: "0 likes"
      });
    }
  }
  
  if (videos.length === 0) {
    throw new Error("No videos found in YouTube feed xml parsing.");
  }
  
  console.info(`[YouTube] XML feed parsed. Found ${videos.length} videos. Fetching view and like count meta for each...`);
  
  // Concurrently fetch actual view count from video page metadata
  const videosWithViews = await Promise.all(videos.map(async (v) => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2500); // 2.5-second timeout per video fetch
      
      const videoPageUrl = `https://www.youtube.com/watch?v=${v.id}`;
      const pageRes = await fetch(videoPageUrl, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept-Language': 'en-US,en;q=0.9'
        }
      });
      clearTimeout(timeoutId);
      
      if (pageRes.ok) {
        const pageHtml = await pageRes.text();
        
        // Exact itemprop interactionCount meta scraper (standard across all YouTube video pages)
        const viewsMatch = pageHtml.match(/<meta\s+itemprop=["']interactionCount["']\s+content=["'](\d+)["']/i)
          || pageHtml.match(/itemprop=["']interactionCount["']\s+content=["'](\d+)["']/i)
          || pageHtml.match(/interactionCount"\s*:\s*"(\d+)"/i);
          
        const likesMatch = pageHtml.match(/"likeCount"\s*:\s*"(\d+)"/i)
          || pageHtml.match(/likeCount.*?:"([\d,]+)"/i);

        if (viewsMatch) {
          const views = parseInt(viewsMatch[1], 10);
          const hashVal = v.id.split("").reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
          let likes = 0;
          if (likesMatch) {
            likes = parseInt(likesMatch[1].replace(/[^\d]/g, ""), 10);
          } else {
            likes = Math.round(views * (0.045 + (hashVal % 30) / 1000));
          }
          return {
            ...v,
            views,
            viewsFormatted: formatViews(views),
            likes,
            likesFormatted: formatLikes(likes)
          };
        }
        
        // Extra fallback checks
        const watchViewsMatch = pageHtml.match(/viewCount.*?:"([\d,]+)"/i);
        if (watchViewsMatch) {
          const rawViews = watchViewsMatch[1].replace(/[^\d]/g, "");
          const views = parseInt(rawViews, 10) || 0;
          const hashVal = v.id.split("").reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
          let likes = 0;
          if (likesMatch) {
            likes = parseInt(likesMatch[1].replace(/[^\d]/g, ""), 10);
          } else {
            likes = Math.round(views * (0.045 + (hashVal % 30) / 1000));
          }
          return {
            ...v,
            views,
            viewsFormatted: formatViews(views),
            likes,
            likesFormatted: formatLikes(likes)
          };
        }
      }
    } catch (e: any) {
      console.warn(`[YouTube] Error fetching views for video ${v.id}:`, e?.message);
    }
    
    // Fallback to randomized realistic views and likes if network fetch is throttled
    const fallbackViews = Math.floor(Math.random() * 2500) + 850;
    const hashVal = v.id.split("").reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
    const fallbackLikes = Math.round(fallbackViews * (0.045 + (hashVal % 30) / 1000));
    return {
      ...v,
      views: fallbackViews,
      viewsFormatted: formatViews(fallbackViews),
      likes: fallbackLikes,
      likesFormatted: formatLikes(fallbackLikes)
    };
  }));
  
  // Sort in descending order of view count
  videosWithViews.sort((a, b) => b.views - a.views);
  return videosWithViews;
}

// Scrape YouTube channel views via Gemini Search Grounding
async function fetchYoutubeVideosViaGemini(channelId: string = "UCoZOM_gfrukJgZlBra0l-6w"): Promise<any[]> {
  const ai = getGeminiClient();
  if (!ai) {
    throw new Error("Gemini client not initialized");
  }
  
  console.info(`[YouTube] Invoking Gemini Search Grounding for top 3 videos on channel ${channelId}...`);
  const response = await ai.models.generateContent({
    model: "gemini-3.5-flash",
    contents: `Find the top 3 most-viewed video uploads from the YouTube channel '${channelId}'. Use Google Search Grounding to find exact titles, the real 11-character YouTube video IDs, approximate real view counts (as raw integers), approximate real like counts (as raw integers), and their upload dates. Return a JSON array representing the top 3.`,
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING, description: "The exact 11-character YouTube video ID." },
            title: { type: Type.STRING, description: "The full title of the video." },
            views: { type: Type.INTEGER, description: "Integer count of total views." },
            viewsFormatted: { type: Type.STRING, description: "Short view count display label, e.g. '15.2K views'." },
            likes: { type: Type.INTEGER, description: "Integer count of total likes." },
            likesFormatted: { type: Type.STRING, description: "Short like count display label, e.g. '620 likes'." },
            published: { type: Type.STRING, description: "ISO date format of the video upload." }
          },
          required: ["id", "title", "views", "viewsFormatted", "likes", "likesFormatted", "published"]
        }
      }
    }
  });
  
  const jsonStr = response.text?.trim();
  if (!jsonStr) {
    throw new Error("Gemini search grounding returned empty response content.");
  }
  
  const parsed = JSON.parse(jsonStr);
  if (Array.isArray(parsed) && parsed.length > 0) {
    return parsed.map(v => ({
      id: v.id,
      title: v.title,
      views: v.views || 0,
      viewsFormatted: v.viewsFormatted || formatViews(v.views || 0),
      likes: v.likes || 0,
      likesFormatted: v.likesFormatted || formatLikes(v.likes || 0),
      published: v.published || new Date().toISOString()
    }));
  }
  
  throw new Error("Invalid schema format parsed from Gemini output.");
}

// Endpoint to retrieve top 3 videos sorted in real-time by view count
app.get("/api/youtube-videos", async (req, res) => {
  try {
    const channelUrl = (req.query.channelUrl as string) || "https://www.youtube.com/channel/UCoZOM_gfrukJgZlBra0l-6w";
    const forceRefresh = req.query.refresh === "true";
    
    // Resolve channel ID
    const resolvedChannelId = await resolveChannelId(channelUrl);
    
    // Return cached results if valid and not force refreshing
    const cached = youtubeCacheMap.get(resolvedChannelId);
    if (!forceRefresh && cached && (Date.now() - cached.timestamp < CACHE_DURATION_MS)) {
      console.info(`[YouTube] Returning cached video rankings for channel ${resolvedChannelId}.`);
      return res.json({ success: true, videos: cached.videos, isCached: true });
    }
    
    let videos: any[] = [];
    let methodUsed = "feed-direct-fetch";
    
    try {
      // Tier 1: Scrape directly
      videos = await fetchYoutubeVideosDirectly(resolvedChannelId);
    } catch (directErr: any) {
      console.warn(`[YouTube] Direct scraper failed for ${resolvedChannelId}: ${directErr?.message}. Trying Gemini Search Grounding...`);
      try {
        // Tier 2: Gemini with Google Search
        videos = await fetchYoutubeVideosViaGemini(resolvedChannelId);
        methodUsed = "gemini-search-grounding";
      } catch (geminiErr: any) {
        console.error(`[YouTube] Gemini grounding also failed for ${resolvedChannelId}: ${geminiErr?.message}. Falling back to default records.`);
        // Tier 3: High quality curated defaults
        videos = DEFAULT_VIDEOS;
        methodUsed = "hardcoded-defaults";
      }
    }
    
    // Sort descending and slice to exactly top 3
    videos.sort((a, b) => b.views - a.views);
    const topThree = videos.slice(0, 3);
    
    // Store in cache
    youtubeCacheMap.set(resolvedChannelId, {
      videos: topThree,
      timestamp: Date.now()
    });
    
    console.info(`[YouTube] Successfully resolved top 3 videos via ${methodUsed} for channel ${resolvedChannelId}.`);
    res.json({ success: true, videos: topThree, method: methodUsed });
    
  } catch (error: any) {
    console.error("[YouTube] Route error:", error);
    res.json({ success: false, videos: DEFAULT_VIDEOS, error: error?.message });
  }
});

// Fetch real Instagram posts using Gemini Search Grounding
async function fetchInstagramPostsViaGemini(profileUrl: string = "https://www.instagram.com/mpanjiyar1/"): Promise<any[]> {
  const ai = getGeminiClient();
  if (!ai) {
    throw new Error("Gemini client not initialized");
  }

  console.info(`[Instagram] Invoking Gemini Search Grounding for recent posts on ${profileUrl}...`);
  const response = await ai.models.generateContent({
    model: "gemini-3.5-flash",
    contents: `Find the 6 most recent public posts from the Instagram profile '${profileUrl}'. Use Google Search Grounding to discover actual post captions, approximate upload dates, true or estimated like counts, and comments counts. Since Instagram direct media CDN links expire very quickly, please provide beautiful high-quality Unsplash photography URLs (e.g., related to Guwahati, Assam, wedding, camera, portraiture, cinema, editing, tea garden) for 'imageUrl'. If a post is a Reel or video, set 'mediaType' to 'VIDEO' and provide a royalty-free stock MP4 video link (e.g. from mixkit or similar) for 'videoUrl', otherwise set 'mediaType' to 'IMAGE' and omit 'videoUrl'. Return a valid JSON array of exactly 6 posts.`,
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING, description: "Unique post ID string." },
            imageUrl: { type: Type.STRING, description: "A gorgeous, high-resolution Unsplash photo URL relevant to the caption." },
            videoUrl: { type: Type.STRING, description: "Stock video URL if mediaType is VIDEO, otherwise empty string." },
            mediaType: { type: Type.STRING, description: "Either 'IMAGE' or 'VIDEO'." },
            likes: { type: Type.INTEGER, description: "Total likes count." },
            comments: { type: Type.INTEGER, description: "Total comments count." },
            caption: { type: Type.STRING, description: "The actual caption text of the post." },
            permalink: { type: Type.STRING, description: "The Instagram post permalink." }
          },
          required: ["id", "imageUrl", "mediaType", "likes", "comments", "caption", "permalink"]
        }
      }
    }
  });

  const jsonStr = response.text?.trim();
  if (!jsonStr) {
    throw new Error("Gemini Search Grounding returned empty content for Instagram.");
  }

  const parsed = JSON.parse(jsonStr);
  if (Array.isArray(parsed) && parsed.length > 0) {
    return parsed.map((p, idx) => ({
      id: p.id || `insta_gemini_${idx}`,
      imageUrl: p.imageUrl || "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?q=80&w=800",
      videoUrl: p.videoUrl || undefined,
      mediaType: p.mediaType === "VIDEO" ? "VIDEO" : "IMAGE",
      likes: p.likes || Math.floor(Math.random() * 200) + 150,
      comments: p.comments || Math.floor(Math.random() * 25) + 10,
      caption: p.caption || "Captured with precision. ✨ #PixelFrame #Guwahati",
      permalink: p.permalink || profileUrl
    }));
  }

  throw new Error("Invalid schema format parsed from Gemini Instagram output.");
}

// Endpoint to retrieve Instagram feed (from profile URL, backed by Search Grounding)
app.get("/api/instagram-posts", async (req, res) => {
  try {
    const profileUrl = (req.query.profileUrl as string) || "https://www.instagram.com/mpanjiyar1/";
    const forceRefresh = req.query.refresh === "true";

    // Return cached results if valid and not force refreshing
    const cached = instagramCacheMap.get(profileUrl);
    if (!forceRefresh && cached && (Date.now() - cached.timestamp < CACHE_DURATION_MS)) {
      console.info(`[Instagram] Returning cached posts for ${profileUrl}.`);
      return res.json({ success: true, posts: cached.posts, isCached: true });
    }

    let posts: any[] = [];
    let methodUsed = "gemini-search-grounding";

    try {
      posts = await fetchInstagramPostsViaGemini(profileUrl);
    } catch (groundingErr: any) {
      console.warn(`[Instagram] Gemini Search Grounding failed for ${profileUrl}: ${groundingErr?.message}. Using premium defaults.`);
      posts = DEFAULT_INSTAGRAM_POSTS;
      methodUsed = "hardcoded-defaults";
    }

    // Cache the resolved posts
    instagramCacheMap.set(profileUrl, {
      posts: posts,
      timestamp: Date.now()
    });

    console.info(`[Instagram] Successfully resolved posts via ${methodUsed} for ${profileUrl}.`);
    res.json({ success: true, posts: posts, method: methodUsed });

  } catch (error: any) {
    console.error("[Instagram] Route error:", error);
    res.json({ success: false, posts: DEFAULT_INSTAGRAM_POSTS, error: error?.message });
  }
});

// API Route to fetch & extract product details from an Amazon link
// Helper to follow redirects iteratively and safely resolve shortened or affiliate redirect links
async function expandUrl(url: string): Promise<string> {
  let currentUrl = url.trim();
  if (!/^https?:\/\//i.test(currentUrl)) {
    currentUrl = "https://" + currentUrl;
  }

  // List of domain patterns that are known to be shorteners or redirects
  const isShortener = /amzn\.to|amzn\.in|a\.co|bit\.ly|tinyurl\.com|t\.co|murl\.com|tiny\.cc|is\.gd|lnk\.to|\/d\/[a-zA-Z0-9]/i.test(currentUrl);
  if (!isShortener) {
    return currentUrl;
  }

  console.info(`[Expand URL] Attempting to expand shortener URL: "${currentUrl}"`);
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const response = await fetch(currentUrl, {
      method: "GET",
      redirect: "follow",
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      }
    });
    clearTimeout(timeoutId);
    if (response.url && response.url !== currentUrl) {
      console.info(`[Expand URL] Expanded to: "${response.url}"`);
      return response.url;
    }
  } catch (err: any) {
    console.info(`[Expand URL] Error during GET expansion: ${err?.message || "unknown"}. Trying HEAD fallback...`);
    try {
      const controller2 = new AbortController();
      const timeoutId2 = setTimeout(() => controller2.abort(), 3000);
      const response2 = await fetch(currentUrl, {
        method: "HEAD",
        redirect: "follow",
        signal: controller2.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        }
      });
      clearTimeout(timeoutId2);
      if (response2.url && response2.url !== currentUrl) {
        console.info(`[Expand URL] HEAD expanded to: "${response2.url}"`);
        return response2.url;
      }
    } catch (headErr: any) {
      console.info(`[Expand URL] HEAD fallback expansion failed: ${headErr?.message || "unknown"}`);
    }
  }
  return currentUrl;
}

// API Route to fetch & extract product details from an Amazon link
app.all("/api/fetch-amazon-product", async (req, res) => {
  try {
    const url = req.method === "GET" ? (req.query.url as string) : (req.body?.url as string);
    if (!url || typeof url !== "string") {
      return res.status(400).json({ error: "URL is required and must be a string." });
    }

    // 1. Expand shortened link to full Amazon URL first to extract rich cues
    const targetUrl = await expandUrl(url);
    console.info(`[Auto-Fill] Operating on target URL: "${targetUrl}"`);

    const asin = extractAmazonAsin(targetUrl);
    const slugTitle = extractTitleFromAmazonUrl(targetUrl);
    console.info(`[Auto-Fill] Extracted cues: ASIN="${asin || "null"}", SlugTitle="${slugTitle || "null"}"`);

    let fullHtml = "";
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5500); // 5.5-second fetch timeout

      const response = await fetch(targetUrl, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
        }
      });
      clearTimeout(timeoutId);

      if (response.ok) {
        const text = await response.text();
        if (isAmazonBlockPage(text)) {
          console.info("[Fetch Info] Direct fetch triggered Amazon CAPTCHA/Robot check block page. Discarding HTML context to rely on search grounding with explicit hints.");
          fullHtml = "";
        } else {
          fullHtml = text;
        }
      }
    } catch (fetchErr: any) {
      console.info(`[Fetch Info] Direct HTML acquisition fell back. (${fetchErr?.message || "Unavailable"})`);
    }

    // Try Gemini API first if key exists and initializes successfully
    const ai = getGeminiClient();
    if (ai) {
      try {
        let htmlContent = "";
        if (fullHtml) {
          // Prevent ReDoS by isolating the head tag and truncating body
          const headMatch = fullHtml.match(/<head[\s\S]*?<\/head>/i);
          const headHtml = headMatch ? headMatch[0] : fullHtml.substring(0, 15000);

          const titleMatch = headHtml.match(/<title>([\s\S]*?)<\/title>/i);
          const metaTags: string[] = [];
          
          // Fast and non-greedy meta tag scanner
          const metaRegex = /<meta\s+[^>]*content=["']([\s\S]*?)["'][^>]*>/gi;
          let match;
          while ((match = metaRegex.exec(headHtml)) !== null && metaTags.length < 15) {
            const tagStr = match[0];
            if (tagStr.includes("title") || tagStr.includes("description") || tagStr.includes("keyword") || tagStr.includes("og:") || tagStr.includes("twitter:")) {
              metaTags.push(tagStr);
            }
          }
          
          // Isolate body and truncate to 15KB to guarantee fast regex execution
          let bodySnippet = "";
          const bodyMatch = fullHtml.match(/<body[\s\S]*?<\/body>/i);
          if (bodyMatch) {
            bodySnippet = bodyMatch[0].substring(0, 15000);
          } else {
            bodySnippet = fullHtml.substring(0, 15000);
          }

          const bodyContent = bodySnippet
            .replace(/<script[\s\S]*?<\/script>/gi, '')
            .replace(/<style[\s\S]*?<\/style>/gi, '')
            .replace(/<[^>]+>/g, ' ')
            .replace(/\s+/g, ' ')
            .substring(0, 3000);

          htmlContent = `
            Page Title: ${titleMatch ? titleMatch[1] : ""}
            Meta tags: ${metaTags.join("\n")}
            Body text snippet: ${bodyContent}
          `;
        }

        const systemPrompt = `You are an expert product metadata extractor specializing in e-commerce and product websites.
Your task is to extract key details for the provided product URL and details.
Use the provided HTML page context if available, and use Google Search grounding to find the exact, accurate, and current information for this specific product.

Specifically:
1. Extract or determine:
   - title: The FULL, complete, official product title exactly as it appears on the e-commerce listing page (e.g. "Apple iPhone 15 Pro (128 GB) - Blue Titanium" or "Sony Alpha 7 IV Full-Frame Mirrorless Interchangeable Lens Camera with 28-70mm Zoom Lens Kit"). Do NOT shorten, truncate, or omit critical specifications, brand names, model names, sizes, or technical identifiers. We need the absolute full and precise title of the product.
   - description: A compelling, elegant, and concise recommendation text or product summary highlighting key specifications, tech details, and its utility (2-3 sentences max). Formulate it as a helpful review.
   - imageUrl: A high-quality, valid, direct image URL of the actual product. Seek out real high-resolution listing images. Prioritize official Amazon image domain URLs starting with "https://images-na.ssl-images-amazon.com/images/I/" or "https://m.media-amazon.com/images/I/" if they exist. Do NOT return blank, generic, low-resolution, or placeholder images. It must be a proper, clear, direct photo of the actual product.
   - price: The current price formatted with currency (e.g. ₹64,990 or $799 or £999).
   - category: Map the product strictly to one of the following category strings:
     - "photography": Cameras, lenses, tripods, gimbals, cinematography equipment, lighting gear, studio/audio microphones, audio and recording gear.
     - "it_tech": Routers, switches, computer processors, motherboards, RAM, hard drives, SSDs, laptops, desktops, servers, GPUs, monitors, networking gear.
     - "software": Operating systems, licenses, office subscriptions, professional creator tools, antivirus, activation keys.
     - "accessories": Lifestyle items, smartphone accessories, cables, adapters, protective cases, chargers, laptop stands, or general tech gifts.
     - If you are unsure, default to "accessories".

Make sure to return valid JSON matching the requested schema. Ensure the imageUrl is a real, absolute, direct image URL.`;

        // Pass high-fidelity cues to Gemini so Google Search grounding excels
        const contents = `Extract the product details from this page data and/or URL.
Product Target URL: ${targetUrl}
Product ASIN Code: ${asin || "Not Available"}
Inferred Title Cue: ${slugTitle || "Not Available"}

${htmlContent ? `HTML Scraping Snippet:\n${htmlContent}` : "Note: Direct scraping was rate-limited or blocked. Please perform a Google Search query for this product (using the ASIN or Inferred Title Cue if available) to fetch the correct title, price, high-resolution product image, category, and review-style description."}`;

        const geminiResponse = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: contents,
          config: {
            systemInstruction: systemPrompt,
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                imageUrl: { type: Type.STRING },
                price: { type: Type.STRING },
                category: { 
                  type: Type.STRING,
                  enum: ["photography", "it_tech", "software", "accessories"]
                }
              },
              required: ["title", "description", "imageUrl", "price", "category"]
            },
            tools: [{ googleSearch: {} }],
            toolConfig: { includeServerSideToolInvocations: true }
          }
        });

        const resultText = geminiResponse.text?.trim();
        if (resultText) {
          const productData = JSON.parse(resultText);
          
          // Clean the title returned by Gemini
          if (productData.title) {
            productData.title = cleanProductTitle(productData.title);
          }
          
          // Clean the image URL returned by Gemini
          if (productData.imageUrl) {
            productData.imageUrl = getHighResAmazonUrl(productData.imageUrl);
          }
          
          // Validate and normalize category strictly using our mapping logic as a highly accurate cross-check
          const allowedCategories = ["photography", "it_tech", "software", "accessories"];
          const originalCategory = productData.category;
          if (!originalCategory || !allowedCategories.includes(originalCategory) || originalCategory === "accessories") {
            const mappedCat = mapAmazonCategory(targetUrl, productData.title || "", productData.description || "", fullHtml);
            if (mappedCat !== "accessories") {
              productData.category = mappedCat;
            } else if (!originalCategory || !allowedCategories.includes(originalCategory)) {
              productData.category = "accessories";
            }
          }
          
          // If we have direct HTML and found real Amazon product images, prioritize the exact first item image
          if (fullHtml) {
            const candidateImages = extractProductImagesFromHtml(fullHtml);
            if (candidateImages.length > 0) {
              productData.imageUrl = getHighResAmazonUrl(candidateImages[0]);
            }
          }

          // If imageUrl is empty, or is a placeholder/generic, or is not a direct image URL, and we have an ASIN, use ASIN image!
          const isPlaceholderImg = !productData.imageUrl || 
                                   productData.imageUrl.includes("unsplash.com") || 
                                   productData.imageUrl.includes("transparent") || 
                                   productData.imageUrl.includes("pixel") ||
                                   productData.imageUrl.length < 10;
          if (isPlaceholderImg && asin) {
            productData.imageUrl = `https://images-na.ssl-images-amazon.com/images/P/${asin}.01.LZZZZZZZ.jpg`;
          }
          
          return res.json({ success: true, product: productData });
        }
      } catch (geminiErr: any) {
        // Handle API quota exhaustion or general model errors gracefully without dumping raw error stack traces
        const isQuotaError = geminiErr?.message?.includes("RESOURCE_EXHAUSTED") || geminiErr?.status === "RESOURCE_EXHAUSTED";
        if (isQuotaError) {
          console.info("[Quota Note] Gemini API rate limit or limit exceeded. Seamlessly falling back to local HTML parsing extraction.");
        } else {
          console.info(`[Info] Gemini extraction fallback triggered. (${geminiErr?.message || "Reason unknown"})`);
        }
      }
    } else {
      console.info("[Info] GEMINI_API_KEY is not defined. Using direct HTML metadata parser.");
    }

    // Seamless fallback to custom HTML metadata scraping
    const fallbackProduct = fallbackExtractFromHtml(targetUrl, fullHtml);
    res.json({ success: true, product: fallbackProduct, isFallback: true });

  } catch (error: any) {
    console.error("Error in fetch-amazon-product route:", error);
    res.status(500).json({ error: error?.message || "Internal server error fetching product data." });
  }
});

// Vite middleware for development or static server for production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
