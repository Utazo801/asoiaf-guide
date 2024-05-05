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
  currentLord: string; //character
  currentLordid: number;
  heir: string; //character
  heirid: number;
  overlord: string; //house
  overlordid: number;
  founded: string;
  founder: string; //character
  founderid: number;
  diedOut: string;
  ancestralWeapons: string[];
  caderBranches: string[]; //houses
  swornMembers: string[]; //characters
}
