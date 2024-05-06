import { Component } from '@angular/core';
import { SearchService } from '../../services/search.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user-input',
  templateUrl: './user-input.component.html',
  styleUrls: ['./user-input.component.css'],
})
export class UserInputComponent {
  value = '';

  constructor(private searchService: SearchService, private router: Router) {}

  onSearch() {
    this.searchService.setSearchTerm(this.value);
    this.router.navigate(['search']);
  }

  clear() {
    this.value = '';
    this.searchService.setSearchTerm('');
  }
}
