import { Component } from '@angular/core';
import { Character } from '../../models/character.type';
import { House } from '../../models/house.type';
import { ActivatedRoute, Router } from '@angular/router';
import { BookService } from '../../services/book.service';
import { CharacterService } from '../../services/character.service';
import { HouseService } from '../../services/house.service';
import { Book } from '../../models/book.type';
import _ from 'lodash';
import { Observable, map, of, tap } from 'rxjs';

@Component({
  selector: 'app-house-details',
  templateUrl: './house-details.component.html',
  styleUrl: './house-details.component.css',
})
export class HouseDetailsComponent {
  id!: number;
  house!: House;
  book!: Book;
  pageSize: number = 5;
  currentPage: number = 0;
  maxPage: number = 0;

  swornMemberIds: number[] = [];
  pagedSwornMembersIds: number[] = [];
  swornMemberNames: Observable<string>[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private characterService: CharacterService,
    private houseService: HouseService
  ) {}

  ngOnInit(): void {
    const houseid = this.route.snapshot.paramMap.get('id') ?? 'no';
    if (houseid === 'no') {
      this.router.navigate(['page-not-found']);
    }
    this.id = parseInt(houseid);
    this.getHouse(this.id);

    this.currentPage = 0;
    this.maxPage = Math.ceil(this.swornMemberIds.length / this.pageSize) - 1;
    this.updatePagedSwornCharacter();
  }
  getHouse(id: number) {
    this.houseService.getHouseByID(id).subscribe(
      (house) => {
        if (house !== null) {
          this.house = house;
          this.ParseSwornCharacterURls();
        } else {
          // Handle the case when character is null
          this.router.navigate(['page-not-found']);
        }
      },
      (error) => {
        // Handle error
        console.error('Error fetching house:', error);
      }
    );
  }

  private ParseSwornCharacterURls() {
    if (this.house.swornMembers && this.house.swornMembers.length > 0) {
      let sworncharacterurls = this.house.swornMembers;
      sworncharacterurls.forEach((url) => {
        const urlsplit = url.split('/');
        this.swornMemberIds.push(parseInt(urlsplit[urlsplit.length - 1]));
      });
    }
  }
  ParseCadetURls(url: string): number {
    let cadetid: number = 0;
    const urlsplit = url.split('/');
    cadetid = parseInt(urlsplit[urlsplit.length - 1]);
    return cadetid;
  }

  getCharacterName(id: number): Observable<string> {
    return this.characterService.getCharacterName(id);
  }

  getHouseName(id: number): Observable<string> {
    return this.houseService.getHouseName(id);
  }

  private loadSwornMembers(swornMemberIds: number[]): Observable<string>[] {
    return swornMemberIds.map((id) => this.getCharacterName(id));
  }

  pageSwornCharacters(event: any) {
    const startIndex = event.pageIndex * event.pageSize;
    const endIndex = startIndex + event.pageSize;
    const currentPageSwornMemberIds = this.swornMemberIds.slice(
      startIndex,
      endIndex
    );
    this.swornMemberNames = this.loadSwornMembers(currentPageSwornMemberIds);
    this.currentPage = event.pageIndex;
    this.maxPage = Math.ceil(this.swornMemberIds.length / event.pageSize) - 1;
  }

  updatePagedSwornCharacter() {
    const startIndex = this.currentPage * this.pageSize;
    const endIndex = Math.min(
      startIndex + this.pageSize,
      this.swornMemberIds.length
    );
    const currentPageSwornMemberIds = this.swornMemberIds.slice(
      startIndex,
      endIndex
    );

    this.swornMemberNames = this.loadSwornMembers(currentPageSwornMemberIds);
    this.pagedSwornMembersIds = currentPageSwornMemberIds;
  }
  prevPage() {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.updatePagedSwornCharacter();
    }
  }

  nextPage() {
    if (this.currentPage < this.maxPage) {
      this.currentPage++;
      this.updatePagedSwornCharacter();
    }
  }
}
