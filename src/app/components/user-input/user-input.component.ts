import { Component } from '@angular/core';
import { SearchService } from '../../services/search.service';
import { Router } from '@angular/router';

/**
 * Represents the component responsible for user input for search functionality.
 */
@Component({
  selector: 'app-user-input',
  templateUrl: './user-input.component.html',
  styleUrls: ['./user-input.component.css'],
})
export class UserInputComponent {
   /**
   * The value entered by the user for search.
   */
  value = '';
/**
   * Constructor of the `UserInputComponent` class.
   * @param searchService - The service for handling search functionality.
   * @param router - The router service for navigation.
   */
  constructor(private searchService: SearchService, private router: Router) {}

  /**
   * Handles the search action triggered by the user.
   * Sets the search term in the search service and navigates to the search results page.
   */
  onSearch() {
    this.searchService.setSearchTerm(this.value);
    this.router.navigate(['search']);
  }
/**
   * Clears the search input field and resets the search term in the search service.
   */
  clear() {
    this.value = '';
    this.searchService.setSearchTerm('');
  }
}
