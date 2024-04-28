import { Character } from './character.type';

export interface Book {
  id: number;
  url: string; //url
  name: string;
  isbn: string;
  authors: string[];
  numberOfPages: number;
  publisher: string;
  country: string;
  mediaType: string;
  released: Date;
  charachters: Character[];
  povCharacters: Character[];
}
