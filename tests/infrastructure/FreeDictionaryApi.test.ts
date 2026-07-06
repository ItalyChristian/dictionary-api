import { describe, it, expect, vi, afterEach } from 'vitest';
import { FreeDictionaryApi } from '@infrastructure/api/FreeDictionaryApi';

const BASE_URL = 'https://api.dictionaryapi.dev/api/v2/entries/en';

function mockFetch(response: Partial<Response> & { json?: () => Promise<unknown> }) {
  const fetchMock = vi.fn().mockResolvedValue({
    ok: response.ok ?? true,
    status: response.status ?? 200,
    json: response.json ?? (async () => [])
  });
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

const sampleEntry = {
  word: 'hello',
  phonetics: [
    { text: '/həˈloʊ/', audio: 'http://audio/hello.mp3' },
    { text: '', audio: '' }
  ],
  meanings: [
    {
      partOfSpeech: 'noun',
      synonyms: ['hi'],
      definitions: [
        {
          definition: 'A greeting.',
          example: 'a warm hello',
          synonyms: ['greeting'],
          antonyms: ['goodbye']
        }
      ]
    }
  ]
};

describe('FreeDictionaryApi', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  describe('fetchWordDetails', () => {
    it('builds the request URL, lowercasing and encoding the word', async () => {
      const fetchMock = mockFetch({ json: async () => [sampleEntry] });
      const api = new FreeDictionaryApi(BASE_URL + '/');

      await api.fetchWordDetails('Hello');

      expect(fetchMock).toHaveBeenCalledWith(`${BASE_URL}/hello`);
    });

    it('maps phonetics (dropping empty text) and meanings', async () => {
      mockFetch({ json: async () => [sampleEntry] });
      const api = new FreeDictionaryApi(BASE_URL);

      const details = await api.fetchWordDetails('hello');

      expect(details.word).toBe('hello');
      expect(details.phonetics).toEqual([
        { text: '/həˈloʊ/', audio: 'http://audio/hello.mp3' }
      ]);
      expect(details.meanings[0].partOfSpeech).toBe('noun');
      expect(details.meanings[0].definitions[0].definition).toBe('A greeting.');
    });

    it('throws when the word is not found (404 -> empty)', async () => {
      mockFetch({ status: 404, ok: false });
      const api = new FreeDictionaryApi(BASE_URL);

      await expect(api.fetchWordDetails('zzzzzz')).rejects.toThrow(
        'Word not found: zzzzzz'
      );
    });

    it('throws when the API responds with a server error', async () => {
      mockFetch({ status: 500, ok: false });
      const api = new FreeDictionaryApi(BASE_URL);

      await expect(api.fetchWordDetails('hello')).rejects.toThrow(
        /Dictionary API request failed \(500\)/
      );
    });
  });

  describe('searchWords', () => {
    it('collects unique synonyms from meanings and definitions', async () => {
      mockFetch({ json: async () => [sampleEntry] });
      const api = new FreeDictionaryApi(BASE_URL);

      const synonyms = await api.searchWords('hello');

      expect(synonyms.sort()).toEqual(['greeting', 'hi']);
    });

    it('returns an empty array when the request fails', async () => {
      mockFetch({ status: 500, ok: false });
      const api = new FreeDictionaryApi(BASE_URL);

      expect(await api.searchWords('hello')).toEqual([]);
    });
  });
});
