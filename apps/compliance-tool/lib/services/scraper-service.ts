import axios, { AxiosError } from 'axios';
import * as cheerio from 'cheerio';

const HTTP_TIMEOUT_MS = 10_000;
const MAX_REDIRECTS = 3;
const MAX_TEXT_LENGTH = 15_000;

export interface ScrapedWebsiteData {
  privacyPolicyUrl: string;
  privacyPolicyText: string;
  termsUrl: string;
  termsText: string;
  cookieNoticeText: string;
  hasPrivacyPolicy: boolean;
  hasTerms: boolean;
  hasCookieNotice: boolean;
}

export type ScrapeErrorCode = 'INVALID_URL' | 'FETCH_FAILED' | 'TIMEOUT' | 'BLOCKED';

export class ScrapeError extends Error {
  code: ScrapeErrorCode;
  userMessage: string;

  constructor(code: ScrapeErrorCode, userMessage: string, message?: string) {
    super(message ?? userMessage);
    this.name = 'ScrapeError';
    this.code = code;
    this.userMessage = userMessage;
  }
}

function createHttpClient() {
  return axios.create({
    timeout: HTTP_TIMEOUT_MS,
    maxRedirects: MAX_REDIRECTS,
    headers: {
      'User-Agent': 'AetherComplianceBot/1.0',
      Accept: 'text/html,application/xhtml+xml',
    },
    validateStatus: (status) => status >= 200 && status < 400,
  });
}

function parseAndValidateUrl(input: string): URL {
  try {
    const parsed = new URL(input);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      throw new Error('URL protocol must be http or https');
    }
    return parsed;
  } catch (error) {
    throw new ScrapeError(
      'INVALID_URL',
      'Please enter a valid website URL including http:// or https://.',
      error instanceof Error ? error.message : 'Invalid URL format'
    );
  }
}

function resolveLink(baseUrl: string, href: string): string {
  try {
    return new URL(href, baseUrl).toString();
  } catch {
    return '';
  }
}

function normalizeText(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

function truncateText(value: string): string {
  if (value.length <= MAX_TEXT_LENGTH) {
    return value;
  }

  return `${value.slice(0, MAX_TEXT_LENGTH)}\n\n[Content truncated at 15,000 characters for processing limits.]`;
}

function mapAxiosError(error: unknown): ScrapeError {
  const axiosError = error as AxiosError;

  if (axios.isAxiosError(axiosError)) {
    const status = axiosError.response?.status;

    if (axiosError.code === 'ECONNABORTED' || /timeout/i.test(axiosError.message)) {
      return new ScrapeError(
        'TIMEOUT',
        'The website took too long to respond. Please try again or paste policy text manually.',
        axiosError.message
      );
    }

    return new ScrapeError(
      'FETCH_FAILED',
      'We could not fetch this website. Please verify the URL or paste your policy text manually.',
      status ? `HTTP ${status}: ${axiosError.message}` : axiosError.message
    );
  }

  if (error instanceof ScrapeError) {
    return error;
  }

  return new ScrapeError(
    'FETCH_FAILED',
    'Unable to scrape this website right now. Please try again or paste content manually.',
    error instanceof Error ? error.message : 'Unknown fetch error'
  );
}

function looksLikeJsRenderedSite($: cheerio.CheerioAPI): boolean {
  const bodyText = normalizeText($('body').text());
  const scriptCount = $('script').length;
  const rootCandidates = ['#__next', '#root', '#app', '[data-reactroot]', '[id*="__nuxt"]'];
  const hasRootShell = rootCandidates.some((selector) => $(selector).length > 0);

  return bodyText.length < 220 && scriptCount > 8 && hasRootShell;
}

export function detectPrivacyPolicyLink($: cheerio.CheerioAPI, baseUrl: string): string {
  const patterns = ['privacy', 'privacy-policy', 'data-protection', 'datenschutz'];

  const links = $('a[href]')
    .toArray()
    .map((element) => {
      const href = $(element).attr('href') || '';
      const anchorText = normalizeText($(element).text()).toLowerCase();
      const hrefLower = href.toLowerCase();

      const matched = patterns.some((pattern) => hrefLower.includes(pattern) || anchorText.includes(pattern));
      return matched ? resolveLink(baseUrl, href) : '';
    })
    .filter(Boolean);

  return links[0] || '';
}

export function detectTermsLink($: cheerio.CheerioAPI, baseUrl: string): string {
  const patterns = ['terms', 'terms-of-service', 'tos', 'legal', 'conditions'];

  const links = $('a[href]')
    .toArray()
    .map((element) => {
      const href = $(element).attr('href') || '';
      const anchorText = normalizeText($(element).text()).toLowerCase();
      const hrefLower = href.toLowerCase();

      const matched = patterns.some((pattern) => hrefLower.includes(pattern) || anchorText.includes(pattern));
      return matched ? resolveLink(baseUrl, href) : '';
    })
    .filter(Boolean);

  return links[0] || '';
}

export function detectCookieNotice($: cheerio.CheerioAPI): string {
  const selectors = ['[class*="cookie"]', '[id*="cookie"]', '[class*="gdpr"]', '[class*="consent"]'];

  for (const selector of selectors) {
    const node = $(selector).first();
    if (node.length > 0) {
      const text = normalizeText(node.text());
      if (text.length > 0) {
        return truncateText(text);
      }
    }
  }

  return '';
}

export async function fetchPageText(url: string): Promise<string> {
  const client = createHttpClient();

  try {
    const response = await client.get<string>(url);
    const $ = cheerio.load(response.data || '');

    $('script, style, noscript, svg').remove();
    const text = normalizeText($('body').text());

    return truncateText(text);
  } catch (error) {
    throw mapAxiosError(error);
  }
}

export async function scrapeWebsite(url: string): Promise<ScrapedWebsiteData> {
  const parsedUrl = parseAndValidateUrl(url);
  const client = createHttpClient();

  try {
    const homepageResponse = await client.get<string>(parsedUrl.toString());
    const $ = cheerio.load(homepageResponse.data || '');

    // MVP note: Puppeteer is intentionally not used to avoid heavy Docker image/runtime overhead.
    if (looksLikeJsRenderedSite($)) {
      throw new ScrapeError(
        'BLOCKED',
        'This website appears to require JavaScript rendering. Please paste your Privacy Policy and Terms content manually.'
      );
    }

    const privacyPolicyUrl = detectPrivacyPolicyLink($, parsedUrl.toString());
    const termsUrl = detectTermsLink($, parsedUrl.toString());
    const cookieNoticeText = detectCookieNotice($);

    const [privacyPolicyText, termsText] = await Promise.all([
      privacyPolicyUrl ? fetchPageText(privacyPolicyUrl) : Promise.resolve(''),
      termsUrl ? fetchPageText(termsUrl) : Promise.resolve(''),
    ]);

    return {
      privacyPolicyUrl,
      privacyPolicyText,
      termsUrl,
      termsText,
      cookieNoticeText,
      hasPrivacyPolicy: Boolean(privacyPolicyUrl),
      hasTerms: Boolean(termsUrl),
      hasCookieNotice: Boolean(cookieNoticeText),
    };
  } catch (error) {
    if (error instanceof ScrapeError) {
      throw error;
    }

    throw mapAxiosError(error);
  }
}
