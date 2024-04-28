import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { House } from '../models/house.type';
import _ from 'lodash';

@Injectable({
  providedIn: 'root',
})
export class HouseService {
  private apiUrl = 'https://anapioficeandfire.com/api';
  private houses: House[];

  constructor(private http: HttpClient) {
    this.houses = [];
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

  loadHouses(): Observable<any[]> {
    const houses = this.getDataFromStorage('got_houses');
    if (houses) {
      return of(houses);
    } else {
      return this.http.get<any[]>(`${this.apiUrl}/houses`).pipe(
        tap((data) => this.setDataToStorage('got_houses', data)),
        catchError(this.handleError<any[]>('loadHouses', []))
      );
    }
  }
  getHouseById(id: string): Observable<any> {
    return this.http
      .get<any>(`${this.apiUrl}/houses/${id}`)
      .pipe(catchError(this.handleError<any>('getHouseById')));
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
          this.houses,
          (c) =>
            _.find(
              [c.name, c.region, c.words], //should implement hasWords, hasTitles, hasSeats, hasDiedOut, hasAncestralWeapons
              (e) => e && e.toLowerCase().indexOf(searchTerm.toLowerCase()) > -1
            ) !== undefined
        )
      : this.houses;
  }
}
