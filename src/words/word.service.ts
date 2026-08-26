import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Word } from './word.entity';

interface ListWordsOptions {
  onlyIds?: number[];
  excludeIds?: number[];
  limit?: number;
  page?: number;
  minFrequency?: number;
  maxFrequency?: number;
  letter?: string;
  sortBy?: 'popular' | 'alphabetical' | 'random';
}

@Injectable()
export class WordService {
  constructor(
    @InjectRepository(Word)
    private readonly repository: Repository<Word>,
  ) {}

  /**
   * @param options - Kelimeleri filtrelemek ve sınırlandırmak için kullanılan seçenekler nesnesi
   * @param options.onlyIds - yalnızca belirli idleri getirir
   * @param options.excludeIds - bu id listesi hariç olanları getirir
   * @param options.limit - getirilecek max word entity
   * @param options.page - pagination yapmak için sayfa numarası
   * @param options.minFrequency - frekans minimum
   * @param options.maxFrequency - frekans maximum
   * @param options.letter - Hangi harfle başlayanı getirilecek
   * @param options.sortBy - default RAND() ancak en sık ya da alfabetik için ekstra value gönderilmeli
   * @returns Word[]
   */
  async list(options: ListWordsOptions = {}): Promise<Word[]> {
    const {
      onlyIds = [],
      excludeIds = [],
      limit,
      page = 1,
      minFrequency,
      maxFrequency,
      letter,
      sortBy = 'random',
    } = options;

    const qb = this.repository.createQueryBuilder('word');

    if (onlyIds.length > 0) {
      qb.andWhere('word.id IN (:...onlyIds)', { onlyIds });
    }

    if (excludeIds.length > 0) {
      qb.andWhere('word.id NOT IN (:...excludeIds)', { excludeIds });
    }

    if (letter) {
      qb.andWhere('word.english LIKE :letter', { letter: `${letter}%` });
    }

    if (minFrequency !== undefined && maxFrequency !== undefined) {
      qb.andWhere('word.frequency BETWEEN :minFrequency AND :maxFrequency', {
        minFrequency,
        maxFrequency,
      });
    }

    if (sortBy === 'alphabetical') {
      qb.orderBy('word.english', 'ASC');
    } else if (sortBy === 'popular') {
      qb.orderBy('word.frequency', 'DESC');
    } else {
      qb.orderBy('RAND()');
    }

    // burdaki page mantıgı page 1 ise skiip 0 olur yani hiç kayıt atlama en baştan demek
    // page 2 ise limitte 50 diyelim skip 50 oldu yani ilk 50 kayıtı atla 50. den sonrakileri getir
    if (limit) {
      const skip = (page - 1) * limit;
      qb.skip(skip);
      qb.take(limit);
    }

    return await qb.getMany();
  }
}
