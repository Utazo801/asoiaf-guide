import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { EMPTY, Observable, of } from 'rxjs';
import { House } from '../models/house.type';
import { SearchResult } from '../models/search-result.type';
import { tap, catchError, map } from 'rxjs/operators';

import _ from 'lodash';

@Injectable({
  providedIn: 'root',
})
export class HouseService {
  private apiUrl = 'https://anapioficeandfire.com/api/houses';
  private localCacheName = 'houses';
  private houses!: House[];

  constructor(private http: HttpClient) {
    this.houses = [];
    this.getHouses();
  }
  //TODO: Refactor options
  getHouses(options?: {
    searchTerm?: string;
    page?: number;
    pageSize?: number;
    name?: string;
    culture?: string;
    born?: string;
    gender?: string;
    died?: string;
    isAlive?: boolean;
  }): Observable<SearchResult<House>> {
    let pageSize = options && options.pageSize ? options.pageSize : 10;
    let page = options && options.page ? options.page : 1;
    let searchTerm = (options && options.searchTerm) || '';
    const cachedData = localStorage.getItem(this.localCacheName);
    let tempChars: House[];
    if (cachedData) {
      tempChars = cachedData ? JSON.parse(cachedData) : [];
      let allResults = searchTerm.length
        ? _.filter(
            tempChars,
            (c) =>
              _.find(
                [c.name, c.founded, c.region, c.coatOfArms],
                (e) =>
                  e && e.toLowerCase().indexOf(searchTerm.toLowerCase()) > -1
              ) !== undefined
          )
        : tempChars;
      return of(
        _.slice(allResults, pageSize * page, pageSize * (page + 1))
      ).pipe(
        map(
          (results) =>
            <SearchResult<House>>{
              allResults: allResults.length,
              results,
              page,
              pageSize,
              searchTerm,
            }
        )
      );
    } else {
      this.fetchHousesFromApi(options);
      return of(
        _.slice(this.houses, pageSize * page, pageSize * (page + 1))
      ).pipe(
        map(
          (results) =>
            <SearchResult<House>>{
              allResults: this.houses.length,
              results,
              page,
              pageSize,
              searchTerm,
            }
        )
      );
    }
  }
  private fetchHousesFromApi(options?: {
    page?: number;
    pageSize?: number;
    // name?: string;
    // culture?: string;
    // born?: string;
    // gender?: string;
    // died?: string;
    // isAlive?: boolean;
  }) {
    let pageSize = options && options.pageSize ? options.pageSize : 10;
    let page = options && options.page ? options.page : 1;
    let queryparams = new HttpParams()
      .append('page', page.toString())
      .append('pageSize', pageSize.toString());

    if (options) {
      // if (options.name) queryparams = queryparams.append('name', options.name);
      // if (options.culture)
      //   queryparams = queryparams.append('culture', options.culture);
      // if (options.born) queryparams = queryparams.append('born', options.born);
      // if (options.died) queryparams = queryparams.append('died', options.died);
      // if (options.gender)
      //   queryparams = queryparams.append('gender', options.gender);
      // if (options.isAlive !== undefined)
      //   queryparams = queryparams.append('isAlive', options.isAlive.toString());
    }

    this.http.get<House[]>(this.apiUrl, { params: queryparams }).pipe(
      tap((houses) => {
        houses.forEach((house) => {
          const urlParts = house.url.split('/');
          house.id = parseInt(urlParts[urlParts.length - 1]);
          this.houses.push(house);
        });

        this.save(houses);
      }),
      catchError((error) => {
        console.error(
          'Error loading characters from API. Loading from local storage.',
          error
        );
        return EMPTY;
      })
    );
  }
  getHouseByID(id: number) {
    let character = this.http.get<House[]>(`${this.apiUrl}/houses/${id}`);
  }
  private save(characters: House[]) {
    // Get existing data from localStorage
    const existingData = localStorage.getItem(this.localCacheName);
    let cachedHouses: House[] = [];

    // Parse existing data if it exists
    if (existingData) {
      cachedHouses = JSON.parse(existingData);
    }

    // Check for duplicates and add new data
    characters.forEach((newCharacter) => {
      if (!cachedHouses.some((c) => c.id === newCharacter.id)) {
        cachedHouses.push(newCharacter);
      }
    });

    // Save updated data back to localStorage
    this.houses = cachedHouses;
    const characterData = JSON.stringify(cachedHouses);
    localStorage.setItem('characters', characterData);
  }
}
