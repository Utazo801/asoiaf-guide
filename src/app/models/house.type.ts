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
  currentLord: string;
  heir: string;
  overLord: string;
  founded: string;
  founder: string;
  diedOut: string;
  ancestralWeapons: string[];
  caderBranches: string[];
  swornMembers: string[];
}
