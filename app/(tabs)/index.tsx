import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Pressable,
  Alert,
  Linking,
  Platform,
} from 'react-native';
import { useState, useEffect } from 'react';
import * as Clipboard from 'expo-clipboard';
import Constants from 'expo-constants';
import type { NewsItem } from '@/types/news';

export default function HomeScreen() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNews = async () => {
    try {
      setLoading(true);
      setError(null);

      // Web: GitHub Pagesのベースパスを考慮、Native: Netlifyの絶対URL
      const baseUrl = Platform.OS === 'web'
        ? (Constants.expoConfig?.extra?.router?.origin || '')
        : (Constants.expoConfig?.extra?.apiUrl || 'https://recaplet.netlify.app');
      const response = await fetch(`${baseUrl}/data/news.json`);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: データの取得に失敗しました`);
      }

      const data = await response.json();
      setNews(data.items || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : '不明なエラーが発生しました');
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async (item: NewsItem) => {
    try {
      const text = `${item.summary}\n\n${item.url}`;
      await Clipboard.setStringAsync(text);
      Alert.alert('コピーしました！', '要約とURLをクリップボードにコピーしました');
    } catch (error) {
      Alert.alert('エラー', 'コピーに失敗しました');
      console.error('Copy error:', error);
    }
  };

  const handleOpenLink = async (url: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('エラー', 'このURLを開けません');
      }
    } catch (error) {
      console.error('Link error:', error);
      Alert.alert('エラー', 'リンクを開けませんでした');
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.loadingText}>読み込み中...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>エラー: {error}</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={news}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <View style={styles.card}>
          {/* ヘッダー: タイトルとコピーボタン */}
          <View style={styles.cardHeader}>
            <Pressable
              style={styles.titleContainer}
              onPress={() => handleOpenLink(item.url)}
            >
              <Text style={styles.title}>{item.title}</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.copyIconButton,
                pressed && { opacity: 0.5 },
              ]}
              onPress={() => handleCopy(item)}
            >
              <Text style={styles.copyIcon}>📋</Text>
            </Pressable>
          </View>

          <Text style={styles.summary}>{item.summary}</Text>

          <View style={styles.meta}>
            <Text style={styles.source}>{item.source}</Text>
            <Text style={styles.date}>
              {new Date(item.publishedAt).toLocaleDateString('ja-JP')}
            </Text>
          </View>
        </View>
      )}
      contentContainerStyle={styles.listContainer}
    />
  );
}

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    fontSize: 16,
    color: '#ff0000',
    textAlign: 'center',
    padding: 20,
  },
  listContainer: {
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  titleContainer: {
    flex: 1,
    marginRight: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0066cc',
    textDecorationLine: 'underline',
  },
  copyIconButton: {
    padding: 4,
    borderRadius: 4,
    backgroundColor: '#f0f0f0',
  },
  copyIcon: {
    fontSize: 20,
  },
  summary: {
    fontSize: 14,
    lineHeight: 20,
    color: '#666',
    marginBottom: 12,
  },
  meta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 8,
  },
  source: {
    fontSize: 12,
    color: '#0066cc',
    fontWeight: '600',
  },
  date: {
    fontSize: 12,
    color: '#999',
  },
});
