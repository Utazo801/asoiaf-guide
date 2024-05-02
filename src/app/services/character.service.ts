import { Character } from '../models/character.type';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { EMPTY, Observable, catchError, map, merge, of, tap } from 'rxjs';
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
    const pageSize = options?.pageSize || 10;
    const page = options?.page || 1;
    const searchTerm = options?.name || '';
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
        console.log(page);
        const startIndex = (page - 1) * pageSize;
        const endIndex = Math.min(startIndex + pageSize, totalResults);
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
            const urlParts = character.url.split('/');
            character.id = parseInt(urlParts[urlParts.length - 1]);
          });
          this.saveArray(characters);
        })
      );
  }

  fetchFromAPIByID(id: number): Observable<Character | null> {
    return this.http.get<Character>(`${this.apiUrl}/${id}`).pipe(
      map((character) => {
        this.saveSingle(character);
        return character;
      }),
      catchError((error) => {
        console.error('Error fetching character from API:', error);
        return of(null); // Return null if the character is not found
      })
    );
  }
  saveSingle(character: Character) {
    let tempChars: Character[] = [];
    const cachedData = localStorage.getItem(this.storageKey);
    if (cachedData) {
      tempChars = JSON.parse(cachedData);
    }
    tempChars.push(character);
    localStorage.setItem(this.storageKey, JSON.stringify(tempChars));
    this.getCharacters();
  }

  getCharacterByID(id: number): Character | null {
    const cachedData = localStorage.getItem(this.storageKey);
    if (cachedData) {
      const tempChars: Character[] = JSON.parse(cachedData);
      const foundCharacter = tempChars.find((t) => t.id === id);
      return foundCharacter || null;
    }
    return null;
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
    this.characters = cachedCharacters;
    const characterData = JSON.stringify(cachedCharacters);
    localStorage.setItem(this.storageKey, characterData);
  }
}
