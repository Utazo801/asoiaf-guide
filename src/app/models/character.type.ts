export interface Character {
  id: number;
  url: string; //url
  name: string;
  gender: string;
  culture: string;
  born: string;
  died: string;
  titles: string[];
  aliases: string[];
  father: Character; //url
  mother: Character; //url
  spouse: Character; //url
  allegiances: string[]; //urls
  books: string[]; //urls
  povBooks: string[]; //url
  tvSeries: string[];
  playerBy: string;
}
