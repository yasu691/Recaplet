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
