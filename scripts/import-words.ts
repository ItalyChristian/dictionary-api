import { DIContainer } from '../src/infrastructure/config/dependencies';
import { Word } from '../src/core/domain/entities/Word';
import { WordRepository } from '../src/core/domain/repositories/WordRepository';
import { LoggerPort } from '../src/core/ports/logger/LoggerPort';

async function importWords() {
  console.log('Starting word import...');
  
  const di = DIContainer.getInstance();
  await di.setup();

  const wordRepository = di.get<WordRepository>('wordRepository');
  const logger = di.get<LoggerPort>('logger');

  try {
    const response = await fetch(
      'https://raw.githubusercontent.com/dwyl/english-words/master/words_dictionary.json'
    );
    const wordsDict = (await response.json()) as Record<string, number>;
    const wordList = Object.keys(wordsDict);

    console.log(`Found ${wordList.length} words to import`);

    const batchSize = 1000;
    let imported = 0;

    for (let i = 0; i < wordList.length; i += batchSize) {
      const batch = wordList.slice(i, i + batchSize);
      
      const wordEntities = batch.map(w => 
        Word.create(w, [], [])
      );

      await wordRepository.saveMany(wordEntities);
      
      imported += batch.length;
      console.log(`Imported ${imported}/${wordList.length} words`);
    }

    console.log('Word import completed successfully!');
  } catch (error) {
    logger.error('Error importing words:', error);
    throw error;
  } finally {
    await di.shutdown();
  }
}

importWords().catch(console.error);