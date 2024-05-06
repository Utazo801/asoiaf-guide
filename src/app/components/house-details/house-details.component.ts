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

  swornMemberIds: number[] = []; //An array to hold IDs of sworn members.
  pagedSwornMembersIds: number[] = []; //An array to hold paginated IDs of sworn members.
  swornMemberNames: Observable<string>[] = []; //An array to hold observable names of sworn members.


  /**
   * Constructor of the `HouseDetailsComponent` class.
   * @param route - The activated route.
   * @param router - The router service.
   * @param characterService - The service for fetching character details.
   * @param houseService - The service for fetching house details.
   */
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private characterService: CharacterService,
    private houseService: HouseService
  ) {}


   /**
   * Lifecycle hook called after Angular has initialized all data-bound properties of a directive.
   */
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

   /**
   * Retrieves the details of the house with the given ID.
   * @param id - The ID of the house.
   */
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

 /**
   * Parses the URLs of sworn members to extract their IDs.
   */
  private ParseSwornCharacterURls() {
    if (this.house.swornMembers && this.house.swornMembers.length > 0) {
      let sworncharacterurls = this.house.swornMembers;
      sworncharacterurls.forEach((url) => {
        const urlsplit = url.split('/');
        this.swornMemberIds.push(parseInt(urlsplit[urlsplit.length - 1]));
      });
    }
  }
   /**
   * Parses the URL of a cadet branch to extract its ID.
   * @param url - The URL of the cadet branch.
   * @returns The ID of the cadet branch.
   */
  ParseCadetURls(url: string): number {
    let cadetid: number = 0;
    const urlsplit = url.split('/');
    cadetid = parseInt(urlsplit[urlsplit.length - 1]);
    return cadetid;
  }

  /**
   * Retrieves the name of the character with the given ID.
   * @param id - The ID of the character.
   * @returns An observable emitting the name of the character.
   */
  getCharacterName(id: number): Observable<string> {
    return this.characterService.getCharacterName(id);
  }
 /**
   * Retrieves the name of the house with the given ID.
   * @param id - The ID of the house.
   * @returns An observable emitting the name of the house.
   */
  getHouseName(id: number): Observable<string> {
    return this.houseService.getHouseName(id);
  }
 /**
   * Loads observable names of sworn members based on provided IDs.
   * @param swornMemberIds - An array of sworn member IDs.
   * @returns An array of observable sworn member names.
   */
  private loadSwornMembers(swornMemberIds: number[]): Observable<string>[] {
    return swornMemberIds.map((id) => this.getCharacterName(id));
  }
  /**
   * Handles pagination for sworn members.
   * @param event - The pagination event.
   */
  pageSwornCharacters(event: any) {
    const startIndex = event.pageIndex * event.pageSize;
    const endIndex = startIndex + event.pageSize;
    const currentPageSwornMemberIds = this.swornMemberIds.slice(
      startIndex,
      endIndex
    );
    this.swornMemberNames = this.loadSwornMembers(currentPageSwornMemberIds);
    this.pagedSwornMembersIds = currentPageSwornMemberIds;
    this.currentPage = event.pageIndex;
    this.maxPage = Math.ceil(this.swornMemberIds.length / event.pageSize) - 1;
  }
  /**
   * Updates the array of paginated sworn member IDs based on current pagination settings.
   */
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
}
