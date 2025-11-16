import { config } from 'dotenv';
import { generateText } from 'ai';
import { google } from '@ai-sdk/google';

// .env.local を明示的に読み込み
config({ path: '.env.local' });

// TODO(human): 以下の処理を実装してください
// 1. generateText() を使って「こんにちは」を英語に翻訳
// 2. モデルは google('gemini-1.5-flash') を使用
// 3. プロンプトは「以下のテキストを英語に翻訳してください:\n\nこんにちは」
// 4. 結果の .text を console.log で表示

async function testGemini() {
  try {
    // 環境変数のチェック
    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      throw new Error('GOOGLE_GENERATIVE_AI_API_KEY が設定されていません。');
    }

    console.log('Gemini API テスト開始...\n');

    // Geminiで翻訳
    const result = await generateText({
      model: google('gemini-2.5-flash'),
      prompt: '以下のテキストを英語に翻訳してください:\n\nこんにちは',
    });

    console.log('=== 翻訳結果 ===');
    console.log(result.text);
    console.log('\n=== トークン使用量 ===');
    console.log(`入力: ${result.usage.inputTokens} tokens`);
    console.log(`出力: ${result.usage.outputTokens} tokens`);
    console.log(`合計: ${result.usage.totalTokens} tokens`);
  } catch (error) {
    console.error('エラー:', error);
  }
}

testGemini();
