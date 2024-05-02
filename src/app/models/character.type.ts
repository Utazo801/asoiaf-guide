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
  father: string; //url
  mother: string; //url
  spouse: string; //url
  allegiances: string[]; //urls
  houseids: number[];
  books: string[]; //urls
  povBooks: string[]; //url
  tvSeries: string[];
  playerBy: string;
}
