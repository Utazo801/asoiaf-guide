import { Character } from '../models/character.type';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  Observable,
  catchError,
  map,
  of,
  tap,
} from 'rxjs';
import * as _ from 'lodash';
import { SearchResult } from '../models/search-result.type';
import { House } from '../models/house.type';

/**
 * Service responsible for fetching and managing house data.
 */
@Injectable({
  providedIn: 'root',
})
export class HouseService {
  apiUrl = 'https://anapioficeandfire.com/api/houses'; //API URL for fetching house data.
  private storageKey = 'houses'; //Key for storing houses in local storage.
  private houses: House[] = []; //Array to hold cached house data.

    /**
   * Constructor of the `HouseService` class.
   * @param http - The HTTP client for making requests.
   */
  constructor(private http: HttpClient) {
    this.getHouses();
  }
 /**
   * Fetches houses based on the provided options.
   * @param options - Options for filtering and pagination.
   * @returns An observable emitting the search results of houses.
   */
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
              [c.name, c.region, c.words, c.overlord, c.founded].some(
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
/**
   * Fetches houses from the API based on the provided options.
   * @param options - Options for filtering and pagination.
   * @returns An observable emitting an array of houses.
   */
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
      tap((houses) => {
        houses.forEach((house) => {
          this.HouseOperations(house);
        });
        this.saveArray(houses);
      })
    );
  }
 /**
   * Processes house data received from the API.
   * @param house - The house object to process.
   */
  private HouseOperations(house: House) {
    const urlParts = house.url.split('/');
    house.id = parseInt(urlParts[urlParts.length - 1]);
    if (house.currentLord) {
      const currentLordurl = house.currentLord.split('/');
      house.currentLordid = parseInt(currentLordurl[currentLordurl.length - 1]);
    }
    if (house.heir) {
      const heirurl = house.heir.split('/');
      house.heirid = parseInt(heirurl[heirurl.length - 1]);
    }
    if (house.overlord) {
      const overLord = house.overlord.split('/');
      house.overlordid = parseInt(overLord[overLord.length - 1]);
    }
    if (house.founder) {
      const founder = house.founder.split('/');
      house.founderid = parseInt(founder[founder.length - 1]);
    }
  }

   /**
   * Fetches a single house from the API by ID.
   * @param id - The ID of the house to fetch.
   * @returns An observable emitting the fetched house or null if not found.
   */
  fetchFromAPIByID(id: number): Observable<House | null> {
    return this.http.get<House>(`${this.apiUrl}/${id}`).pipe(
      map((house) => {
        this.HouseOperations(house);
        this.saveSingle(house);
        return house; // Return the character
      }),
      catchError((error) => {
        console.error('Error fetching house from API:', error);
        return of(null); // Return Observable with null value in case of error
      })
    );
  }

 /**
   * Retrieves a house by ID.
   * @param id - The ID of the house to retrieve.
   * @returns An observable emitting the house with the specified ID.
   */
  getHouseByID(id: number): Observable<House | null> {
    const cachedData = localStorage.getItem(this.storageKey);
    if (cachedData) {
      const tempHouses: House[] = JSON.parse(cachedData);
      const foundHouse = tempHouses.find((t) => t.id === id);
      if (foundHouse) {
        return of(foundHouse);
      } else {
        return this.fetchFromAPIByID(id);
      }
    }
    // If character is not found in the cached data, fetch it from the API
    return this.fetchFromAPIByID(id);
  }

   /**
   * Retrieves the name of a house by ID.
   * @param id - The ID of the house.
   * @returns An observable emitting the name of the house.
   */
  getHouseName(id: number): Observable<string> {
    // Look for character in cache
    const existingData = localStorage.getItem(this.storageKey);
    let cachedHouses: Character[] = [];
    if (existingData) {
      cachedHouses = JSON.parse(existingData);
    }
    let house = _.find(cachedHouses || [], (c) => c.id == id);

    if (house && house.name) {
      return of(house.name);
    } else if (house && house.aliases && house.aliases.length > 0) {
      return of(house.aliases[0]);
    } else {
      // If character is not found in cache, fetch it from the API
      return this.getHouseByID(id).pipe(
        map((house) => {
          if (house && house.name) {
            return house.name;
          } else if (house && house.coatOfArms && house.coatOfArms.length > 0) {
            return house.coatOfArms[0];
          } else {
            return house!.id.toString();
          }
        })
      );
    }
  }

  /**
   * Saves an array of houses to local storage.
   * @param houses - The array of houses to save.
   */
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
    cachedHouses = cachedHouses.sort((a, b) => a.id - b.id);
    this.houses = cachedHouses;
    const characterData = JSON.stringify(cachedHouses);
    localStorage.setItem(this.storageKey, characterData);
  }

  /**
   * Saves a single house to local storage.
   * @param house - The house to save.
   */
  saveSingle(house: House) {
    let tempHouses: House[] = [];
    const cachedData = localStorage.getItem(this.storageKey);

    if (cachedData) {
      tempHouses = JSON.parse(cachedData);

      if (!tempHouses.some((c) => c.id === house.id)) {
        tempHouses.push(house);
      }
    }
    tempHouses = tempHouses.sort((a, b) => a.id - b.id);
    localStorage.setItem(this.storageKey, JSON.stringify(tempHouses));
    this.getHouses();
  }
}
