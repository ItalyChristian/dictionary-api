import {
  DictionaryApiPort,
  WordDetails
} from '../../core/ports/api/DictionaryApiPort';
import { FreeDictionaryEntry } from './types/FreeDictionaryEntry';

export class FreeDictionaryApi implements DictionaryApiPort {
  /**
   * @param baseUrl e.g. https://api.dictionaryapi.dev/api/v2/entries/en
   */
  constructor(private readonly baseUrl: string) {}

  async fetchWordDetails(word: string): Promise<WordDetails> {
    const entries = await this.request(word);

    if (entries.length === 0) {
      throw new Error(`Word not found: ${word}`);
    }

    const phonetics = entries
      .flatMap((entry) => entry.phonetics ?? [])
      .filter((phonetic) => Boolean(phonetic.text))
      .map((phonetic) => ({
        text: phonetic.text as string,
        audio: phonetic.audio || undefined
      }));

    const meanings = entries
      .flatMap((entry) => entry.meanings ?? [])
      .map((meaning) => ({
        partOfSpeech: meaning.partOfSpeech,
        definitions: meaning.definitions.map((definition) => ({
          definition: definition.definition,
          example: definition.example,
          synonyms: definition.synonyms,
          antonyms: definition.antonyms
        }))
      }));

    return {
      word: entries[0].word,
      phonetics,
      meanings
    };
  }

  async searchWords(query: string): Promise<string[]> {
    const entries = await this.request(query).catch(() => []);

    const synonyms = new Set<string>();
    for (const entry of entries) {
      for (const meaning of entry.meanings ?? []) {
        for (const synonym of meaning.synonyms ?? []) {
          synonyms.add(synonym);
        }
        for (const definition of meaning.definitions ?? []) {
          for (const synonym of definition.synonyms ?? []) {
            synonyms.add(synonym);
          }
        }
      }
    }

    return Array.from(synonyms);
  }

  private async request(word: string): Promise<FreeDictionaryEntry[]> {
    const url = `${this.baseUrl.replace(/\/$/, '')}/${encodeURIComponent(
      word.toLowerCase().trim()
    )}`;

    const response = await fetch(url);

    if (response.status === 404) {
      return [];
    }

    if (!response.ok) {
      throw new Error(
        `Dictionary API request failed (${response.status}) for word: ${word}`
      );
    }

    const data = (await response.json()) as FreeDictionaryEntry[];
    return Array.isArray(data) ? data : [];
  }
}
