import crypto from 'crypto';

/**
 * URL 文字列から一意な ID を生成する
 * @param url 記事の URL
 * @returns SHA-256 ハッシュの最初の12文字
 */
export function generateArticleId(url: string): string {
  const hash = crypto.createHash('sha256');
  hash.update(url);
  return hash.digest('hex').slice(0, 12);
}

/**
 * コンテンツ文字列から一意なハッシュを生成する
 * @param content 記事の本文コンテンツ
 * @returns SHA-256 ハッシュの最初の12文字
 */
export function generateContentHash(content: string): string {
  const hash = crypto.createHash('sha256');
  hash.update(content);
  return hash.digest('hex').slice(0, 12);
}
