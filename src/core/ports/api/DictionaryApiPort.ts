export interface WordDetails {
  word: string;
  phonetics: {
    text: string;
    audio?: string;
  }[];
  meanings: {
    partOfSpeech: string;
    definitions: {
      definition: string;
      example?: string;
      synonyms?: string[];
      antonyms?: string[];
    }[];
  }[];
}

export interface DictionaryApiPort {
  fetchWordDetails(word: string): Promise<WordDetails>;
  searchWords(query: string): Promise<string[]>;
}