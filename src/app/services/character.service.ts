import { Character } from '../models/character.type';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  EMPTY,
  Observable,
  catchError,
  concatMap,
  forkJoin,
  map,
  merge,
  of,
  tap,
} from 'rxjs';
import * as _ from 'lodash';
import { SearchResult } from '../models/search-result.type';

@Injectable({
  providedIn: 'root',
})
export class CharacterService {
  apiUrl = 'https://anapioficeandfire.com/api/characters';
  private storageKey = 'characters';
  private characters: Character[] = [];
  constructor(private http: HttpClient) {
    this.getCharacters();
  }

  getCharacters(options?: {
    searchTerm?: string;
    page?: number;
    pageSize?: number;
    name?: string;
    culture?: string;
    born?: string;
    gender?: string;
    died?: string;
    isAlive?: boolean;
  }): Observable<SearchResult<Character>> {
    const pageSize = options?.pageSize ? options.pageSize : 10;
    const page = options?.page ? options.page : 1;
    const searchTerm = options?.name ? options.name : '';
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    // Check if characters are available in local storage
    const cachedData = localStorage.getItem(this.storageKey);
    if (cachedData) {
      const tempChars: Character[] = JSON.parse(cachedData);
      const totalResults = tempChars.length;

      // Check if there is enough cached data to satisfy the request
      if (totalResults >= endIndex) {
        const allResults = searchTerm.length
          ? tempChars.filter((c) =>
              [c.name, c.gender, c.culture, c.born, c.died].some(
                (e) => e && e.toLowerCase().includes(searchTerm.toLowerCase())
              )
            )
          : tempChars.slice(startIndex, endIndex);

        return of({
          allResults: totalResults,
          results: allResults,
          page: page,
          pageSize: pageSize,
          searchTerm: searchTerm,
        });
      }
    }

    // If there is not enough cached data or no cached data, fetch from API
    return this.fetchCharactersFromApi(options).pipe(
      map((data) => {
        const totalResults = data.length;
        const results = data;

        return <SearchResult<Character>>{
          allResults: totalResults,
          results: results,
          page: page,
          pageSize: pageSize,
          searchTerm: searchTerm,
        };
      })
    );
  }

  private fetchCharactersFromApi(options?: {
    page?: number;
    pageSize?: number;
    name?: string;
    culture?: string;
    born?: string;
    gender?: string;
    died?: string;
    isAlive?: boolean;
  }): Observable<Character[]> {
    let pageSize = options && options.pageSize ? options.pageSize : 10;
    let page = options && options.page ? options.page : 1;
    let queryparams = new HttpParams()
      .append('page', page.toString())
      .append('pageSize', pageSize.toString());

    if (options) {
      if (options.name) queryparams = queryparams.append('name', options.name);
      if (options.culture)
        queryparams = queryparams.append('culture', options.culture);
      if (options.born) queryparams = queryparams.append('born', options.born);
      if (options.died) queryparams = queryparams.append('died', options.died);
      if (options.gender)
        queryparams = queryparams.append('gender', options.gender);
      if (options.isAlive !== undefined)
        queryparams = queryparams.append('isAlive', options.isAlive.toString());
    }

    return this.http
      .get<Character[]>(this.apiUrl, { params: queryparams })
      .pipe(
        tap((characters) => {
          characters.forEach((character) => {
            this.CharacterProcessing(character);
          });
          this.saveArray(characters);
        })
      );
  }

  fetchFromAPIByID(id: number): Observable<Character | null> {
    return this.http.get<Character>(`${this.apiUrl}/${id}`).pipe(
      map((character) => {
        this.CharacterProcessing(character);
        this.saveSingle(character);
        return character; // Return the character
      }),
      catchError((error) => {
        console.error('Error fetching character from API:', error);
        return of(null); // Return Observable with null value in case of error
      })
    );
  }

  private CharacterProcessing(character: Character) {
    const urlParts = character.url.split('/');
    character.id = parseInt(urlParts[urlParts.length - 1]);
    character.allegiances.forEach((a) => {
      const urlParts = a.split('/');
      character.houseids = [];
      character.houseids.push(parseInt(urlParts[urlParts.length - 1]));
    });
  }

  getCharacterByID(id: number): Observable<Character | null> {
    const cachedData = localStorage.getItem(this.storageKey);
    if (cachedData) {
      const tempChars: Character[] = JSON.parse(cachedData);
      const foundCharacter = tempChars.find((t) => t.id === id);
      if (foundCharacter) {
        return of(foundCharacter);
      } else {
        return this.fetchFromAPIByID(id);
      }
    } else {
      // If there's no cached data, fetch the character from the API
      return this.fetchFromAPIByID(id);
    }
  }

  getCharacterName(id: number): Observable<string> {
    // Look for character in cache
    const existingData = localStorage.getItem(this.storageKey);
    let cachedCharacters: Character[] = [];
    if (existingData) {
      cachedCharacters = JSON.parse(existingData);
    }
    let character = _.find(cachedCharacters || [], (c) => c.id == id);

    if (character && character.name) {
      return of(character.name);
    } else if (character && character.aliases && character.aliases.length > 0) {
      return of(character.aliases[0]);
    } else {
      // If character is not found in cache, fetch it from the API
      return this.getCharacterByID(id).pipe(
        map((character) => {
          if (character && character.name) {
            return character.name;
          } else if (
            character &&
            character.aliases &&
            character.aliases.length > 0
          ) {
            return character.aliases[0];
          } else {
            return character!.id.toString();
          }
        })
      );
    }
  }

  private saveArray(characters: Character[]) {
    // Get existing data from localStorage
    const existingData = localStorage.getItem(this.storageKey);
    let cachedCharacters: Character[] = [];

    // Parse existing data if it exists
    if (existingData) {
      cachedCharacters = JSON.parse(existingData);
    }
    // Check for duplicates and add new data
    characters.forEach((newCharacter) => {
      if (!cachedCharacters.some((c) => c.id === newCharacter.id)) {
        cachedCharacters.push(newCharacter);
      }
    });

    // Save updated data back to localStorage
    cachedCharacters = cachedCharacters.sort((a, b) => a.id - b.id);
    this.characters = cachedCharacters;
    const characterData = JSON.stringify(cachedCharacters);
    localStorage.setItem(this.storageKey, characterData);
  }

  saveSingle(character: Character) {
    let tempChars: Character[] = [];
    const cachedData = localStorage.getItem(this.storageKey);
    if (cachedData) {
      tempChars = JSON.parse(cachedData);
      if (!tempChars.some((c) => c.id === character.id)) {
        tempChars.push(character);
      }
    }
    tempChars = tempChars.sort((a, b) => a.id - b.id);
    localStorage.setItem(this.storageKey, JSON.stringify(tempChars));
    this.getCharacters();
  }
}
