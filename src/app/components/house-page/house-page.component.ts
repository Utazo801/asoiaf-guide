import { Component } from '@angular/core';
import { HouseService } from '../../services/house.service';
import { ActivatedRoute, Route } from '@angular/router';
import { House } from '../../models/house.type';
import { SearchResult } from '../../models/search-result.type';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-house-page',
  templateUrl: './house-page.component.html',
  styleUrl: './house-page.component.css',
})
export class HousePageComponent {
  currentPage: number = 1;
  pageSize: number = 20;
  searchTerm: string = '';
  maxPages: number = 0;
  houses!: Observable<SearchResult<House>>; //An observable emitting search results of houses.


  /**
   * Constructor of the `HousePageComponent` class.
   * @param houseService - The service for fetching house data.
   * @param route - The activated route.
   */
  constructor(
    private houseService: HouseService,
    private route: ActivatedRoute
  ) {}
  /**
   * Lifecycle hook called after Angular has initialized all data-bound properties of a directive.
   */
  ngOnInit(): void {
    this.getHouses();
  }
   /**
   * Moves to the next page of houses.
   */
  nextPage(): void {
    if (this.currentPage < this.pageSize) {
      this.currentPage++;
      this.getHouses();
    }
  }
  /**
   * Moves to the previous page of houses.
   */
  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.getHouses();
    }
  }


/**
   * Fetches houses based on current pagination and search criteria.
   */
  getHouses() {
    this.houses = this.houseService.getHouses({
      page: this.currentPage,
      searchTerm: this.searchTerm,
    });
    this.houses.subscribe((r) => {
      this.maxPages = Math.ceil(r.allResults / this.pageSize);
      this.currentPage = r.page;
    });
  }

}
