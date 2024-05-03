import { Character } from '../models/character.type';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { EMPTY, Observable, catchError, map, merge, of, tap } from 'rxjs';
import * as _ from 'lodash';
import { SearchResult } from '../models/search-result.type';
import { House } from '../models/house.type';

@Injectable({
  providedIn: 'root',
})
export class HouseService {
  apiUrl = 'https://anapioficeandfire.com/api/houses';
  private storageKey = 'houses';
  private houses: House[] = [];
  constructor(private http: HttpClient) {
    this.getHouses();
  }

  getHouses(options?: {
    searchTerm?: string;
    page?: number;
    pageSize?: number;
    name?: string;
    region?: string;
    words?: string;
    hasdWords?: boolean;
    hasTitles?: boolean;
    hasSeats?: boolean;
    hasDiedOut?: boolean;
    hasAncestralWeapons?: boolean;
  }): Observable<SearchResult<House>> {
    const pageSize = options?.pageSize || 10;
    const page = options?.page || 1;
    const searchTerm = options?.name || '';
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    // Check if characters are available in local storage
    const cachedData = localStorage.getItem(this.storageKey);
    if (cachedData) {
      const tempChars: House[] = JSON.parse(cachedData);
      const totalResults = tempChars.length;

      // Check if there is enough cached data to satisfy the request
      if (totalResults >= endIndex) {
        const allResults = searchTerm.length
          ? tempChars.filter((c) =>
              [c.name, c.region, c.words, c.overLord, c.founded].some(
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
    return this.fetchHousesFromApi(options).pipe(
      map((data) => {
        const totalResults = data.length;
        const results = data;

        return <SearchResult<House>>{
          allResults: totalResults,
          results: results,
          page: page,
          pageSize: pageSize,
          searchTerm: searchTerm,
        };
      })
    );
  }

  private fetchHousesFromApi(options?: {
    page?: number;
    pageSize?: number;
    name?: string;
    culture?: string;
    born?: string;
    gender?: string;
    died?: string;
    isAlive?: boolean;
  }): Observable<House[]> {
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

    return this.http.get<House[]>(this.apiUrl, { params: queryparams }).pipe(
      tap((house) => {
        house.forEach((house) => {
          const urlParts = house.url.split('/');
          house.id = parseInt(urlParts[urlParts.length - 1]);
        });
        this.saveArray(house);
      })
    );
  }

  fetchFromAPIByID(id: number): Observable<House | null> {
    return this.http.get<House>(`${this.apiUrl}/${id}`).pipe(
      map((house) => {
        this.saveSingle(house);
        return house; // Return the character
      }),
      catchError((error) => {
        console.error('Error fetching character from API:', error);
        return of(null); // Return Observable with null value in case of error
      })
    );
  }
  saveSingle(house: House) {
    let tempHouses: House[] = [];
    const cachedData = localStorage.getItem(this.storageKey);
    if (cachedData) {
      tempHouses = JSON.parse(cachedData);
    }
    tempHouses.push(house);
    localStorage.setItem(this.storageKey, JSON.stringify(tempHouses));
    this.getHouses();
  }

  getHouseByID(id: number): Observable<House | null> {
    console.log(id);
    const cachedData = localStorage.getItem(this.storageKey);
    if (cachedData) {
      const tempHouses: House[] = JSON.parse(cachedData);
      const foundHouse = tempHouses.find((t) => t.id === id);
      if (foundHouse) {
        return of(foundHouse);
      } else {
        // If character is not found in the cached data, fetch it from the API
        return this.fetchFromAPIByID(id);
      }
    } else {
      // If there's no cached data, fetch the character from the API
      return this.fetchFromAPIByID(id);
    }
  }
  private saveArray(houses: House[]) {
    // Get existing data from localStorage
    const existingData = localStorage.getItem(this.storageKey);
    let cachedHouses: House[] = [];

    // Parse existing data if it exists
    if (existingData) {
      cachedHouses = JSON.parse(existingData);
    }

    // Check for duplicates and add new data
    houses.forEach((newHouse) => {
      if (!cachedHouses.some((c) => c.id === newHouse.id)) {
        cachedHouses.push(newHouse);
      }
    });

    // Save updated data back to localStorage
    this.houses = cachedHouses;
    const characterData = JSON.stringify(cachedHouses);
    localStorage.setItem(this.storageKey, characterData);
  }
}
