import { Character } from '../models/character.type';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import * as _ from 'lodash';

@Injectable({
  providedIn: 'root',
})
export class CharacterService {
  apiUrl = 'https://anapioficeandfire.com/api';
  private characters: Character[] = [];
  constructor(private http: HttpClient) {
    this.loadCharacters();
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(error);
      console.log(`${operation} failed: ${error.message}`);
      return of(result as T);
    };
  }

  private getDataFromStorage(key: string): any {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  }

  private setDataToStorage(key: string, data: any): void {
    localStorage.setItem(key, JSON.stringify(data));
  }
  loadCharacters(): Observable<any[]> {
    const characters = this.getDataFromStorage('got_characters');
    if (characters) {
      return of(characters);
    } else {
      return this.http.get<any[]>(`${this.apiUrl}/characters`).pipe(
        tap((data) => this.setDataToStorage('got_characters', data)),
        catchError(this.handleError<any[]>('loadCharacters', []))
      );
    }
  }

  getCharacterById(id: string): Observable<any> {
    return this.http
      .get<any>(`${this.apiUrl}/characters/${id}`)
      .pipe(catchError(this.handleError<any>('getCharacterById')));
  }

  getCharactersByFilter(options?: {
    searchTerm?: string;
    pageSize?: number;
    page?: number;
  }) {
    let pageSize = (options && options.pageSize) || 5;
    let page = (options && options.page) || 0;
    let searchTerm = (options && options.searchTerm) || '';
    let allResults = searchTerm.length
      ? _.filter(
          this.characters,
          (c) =>
            _.find(
              [c.name, c.gender, c.culture, c.born, c.died], //should implement isAlive as well
              (e) => e && e.toLowerCase().indexOf(searchTerm.toLowerCase()) > -1
            ) !== undefined
        )
      : this.characters;
  }
}
