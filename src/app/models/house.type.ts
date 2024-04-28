import { Character } from './character.type';

export interface House {
  id: number;
  url: string;
  name: string;
  region: string;
  coatOfArms: string;
  words: string;
  titles: string[];
  seats: string[];
  currentLord: Character;
  heir: Character;
  overLord: Character;
  founded: string;
  founder: Character;
  diedOut: string;
  ancestralWeapons: string[];
  caderBranches: House[];
  swornMembers: Character[];
}
