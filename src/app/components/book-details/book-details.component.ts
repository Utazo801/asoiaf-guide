import { Component } from '@angular/core';
import { Book } from '../../models/book.type';
import { ActivatedRoute, Router } from '@angular/router';
import { BookService } from '../../services/book.service';
import { CharacterService } from '../../services/character.service';
import { Character } from '../../models/character.type';
import _, { max } from 'lodash';
import { SearchResult } from '../../models/search-result.type';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-book-details',
  templateUrl: './book-details.component.html',
  styleUrl: './book-details.component.css',
})
export class BookDetailsComponent {
  id!: number;//The ID of the book whose details are being displayed.
  book!: Book; //The book object containing details.
  characters!: Character[]; //An array containing characters of the book.

  currentPageOfNamedCharacters: number = 0; //The current page index of named characters being displayed.
  currentPageOfPOVCharacters: number = 0; // The current page index of POV (Point of View) characters being displayed.

  maxPageNamedCharacters: number = 0; //The maximum page index for named characters.
  maxPagePovCharacters: number = 0; //The maximum page index for POV characters.

  pageSizeNamedCharacters: number = 5; // Number of characters per page
  pageSizePOVCharacters: number = 5; // Number of POV characters per page

  pagedNamedCharacterIds: number[] = []; // Array to hold paginated character ids
  pagedPOVCharacterIds: number[] = []; // Array to hold paginated POV character ids

  NamedCharacterIds: number[] = []; //An array to hold all named character IDs.
  POVCharacterIds: number[] = []; //An array to hold all POV character IDs.

  NamedCharacterNames: Observable<string>[] = []; //An array to hold observable named character names.
  POVCharacterNames: Observable<string>[] = []; //An array to hold observable POV character names.


  /**
   * Constructor of the `BookDetailsComponent` class.
   * @param route - The activated route.
   * @param router - The router service.
   * @param bookService - The service for fetching book details.
   * @param characterService - The service for fetching character details.
   */
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private bookService: BookService,
    private characterService: CharacterService
  ) {}

  /**
   * Lifecycle hook called after Angular has initialized all data-bound properties of a directive.
   */
  ngOnInit(): void {
    const bookId = this.route.snapshot.paramMap.get('id') ?? 'no';
    if (bookId === 'no') {
      this.router.navigate(['page-not-found']);
    }
    this.id = parseInt(bookId);
    this.getBook(this.id);
    this.getCharacters();
    this.maxPageNamedCharacters = Math.ceil(
      this.book.characterids.length / this.pageSizeNamedCharacters
    );
    this.maxPagePovCharacters = Math.ceil(
      this.book.povCharactersids.length / this.pageSizePOVCharacters
    );
  }
  /**
   * Retrieves the details of the book with the given ID.
   * @param id - The ID of the book.
   */
  getBook(id: number) {
    this.bookService.getBookByID(id).subscribe(
      (book) => {
        if (book !== null) {
          this.book = book;
        } else {
          // Handle the case when character is null
          console.error('Book not found');
          this.router.navigate(['page-not-found']);
        }
      },
      (error) => {
        // Handle error
        console.error('Error fetching character:', error);
      }
    );
  }

  /**
   * Handles pagination for POV characters.
   * @param event - The pagination event.
   */
  pagePOVCharacters(event: any) {
    const startIndex = event.pageIndex * event.pageSize;
    const endIndex = startIndex + event.pageSize;
    this.pageSizePOVCharacters = event.pageSize;
    this.pagedPOVCharacterIds = this.book.povCharactersids.slice(
      startIndex,
      endIndex
    );

    const currentPagePOVMemberIds = this.POVCharacterIds.slice(
      startIndex,
      endIndex
    );
    this.POVCharacterNames = this.loadPovCharacterArray(
      currentPagePOVMemberIds
    );
    this.currentPageOfPOVCharacters = event.pageIndex;
    this.maxPagePovCharacters =
      Math.ceil(this.POVCharacterIds.length / event.pageSize) - 1;
  }
  /**
   * Handles pagination for named characters.
   * @param event - The pagination event.
   */
  pageNamedCharacters(event: any) {
    const startIndex = event.pageIndex * event.pageSize;
    const endIndex = startIndex + event.pageSize;
    this.pageSizeNamedCharacters = event.pageSize;
    this.pagedNamedCharacterIds = this.book.characterids.slice(
      startIndex,
      endIndex
    );

    const currentPageNamedMemberIds = this.NamedCharacterIds.slice(
      startIndex,
      endIndex
    );
    this.NamedCharacterNames = this.loadNamedCharacterArray(
      currentPageNamedMemberIds
    );
    this.currentPageOfNamedCharacters = event.pageIndex;
    this.maxPageNamedCharacters =
      Math.ceil(this.NamedCharacterIds.length / event.pageSize) - 1;
  }
  /**
   * Retrieves all characters from storage or from the api
   */
  getCharacters() {
    this.characterService
      .getCharacters()
      .subscribe((r) => (this.characters = r.results));
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
   * Loads observable named character names based on provided character IDs.
   * @param characterIds - An array of character IDs.
   * @returns An array of observable character names.
   */
  private loadNamedCharacterArray(
    characterIds: number[]
  ): Observable<string>[] {
    return this.NamedCharacterIds.map((characterIds) => this.getCharacterName(characterIds));
  }
  /**
   * Loads observable POV character names based on provided character IDs.
   * @param characterIds - An array of character IDs.
   * @returns An array of observable character names.
   */
  private loadPovCharacterArray(characterIds: number[]): Observable<string>[] {
    return this.POVCharacterIds.map((characterIds) => this.getCharacterName(characterIds));
  }
/**
   * Updates the array of paginated POV character IDs based on current pagination settings.
   */
  updatePagedPOVCharacterIds() {
    const startIndex =
      this.currentPageOfPOVCharacters * this.pageSizePOVCharacters;
    const endIndex = Math.min(
      startIndex + this.pageSizePOVCharacters,
      this.POVCharacterIds.length
    );

    const currentPagePOVMemberIds = this.POVCharacterIds.slice(
      startIndex,
      endIndex
    );

    this.POVCharacterNames = this.loadPovCharacterArray(
      currentPagePOVMemberIds
    );
    this.pagedPOVCharacterIds = currentPagePOVMemberIds;
  }
  /**
   * Updates the array of paginated named character IDs based on current pagination settings.
   */
  updatePagedNamedCharacterIds() {
    const startIndex =
      this.currentPageOfNamedCharacters * this.pageSizeNamedCharacters;
    const endIndex = Math.min(
      startIndex + this.pageSizePOVCharacters,
      this.NamedCharacterIds.length
    );

    const currentPageNamedMemberIds = this.POVCharacterIds.slice(
      startIndex,
      endIndex
    );

    this.POVCharacterNames = this.loadPovCharacterArray(
      currentPageNamedMemberIds
    );
    this.pagedPOVCharacterIds = currentPageNamedMemberIds;
  }
}
