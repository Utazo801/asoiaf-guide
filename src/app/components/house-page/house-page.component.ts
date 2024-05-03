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

  constructor(
    private houseService: HouseService,
    private route: ActivatedRoute
  ) {}
  //TODO: paging setup
  nextPage(): void {
    if (this.currentPage < this.pageSize) {
      this.currentPage++;
      this.getHouses();
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.getHouses();
    }
  }

  ngOnInit(): void {
    this.getHouses();
  }

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

  selectedHouse!: House;
  houses!: Observable<SearchResult<House>>;
}
