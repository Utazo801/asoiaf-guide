import { HttpClientModule } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { CharacterService } from './services/character.service';
import { HouseService } from './services/house.service';
import { BookService } from './services/book.service';
import { AppComponent } from './app.component';
import { RouterModule } from '@angular/router';
import { routes } from './app.routes';
import { AsoiafGuideComponent } from './components/asoiaf-guide/asoiaf-guide.component';
import { CharacterPageComponent } from './components/character-page/character-page.component';
import { BookPageComponent } from './components/book-page/book-page.component';
import { HousePageComponent } from './components/house-page/house-page.component';

@NgModule({
  imports: [HttpClientModule, BrowserModule, RouterModule.forRoot(routes)],
  declarations: [
    AppComponent,
    AsoiafGuideComponent,
    CharacterPageComponent,
    BookPageComponent,
    HousePageComponent,
  ],
  providers: [CharacterService, HouseService, BookService],
  bootstrap: [AppComponent],
})
export class AppModule {}
