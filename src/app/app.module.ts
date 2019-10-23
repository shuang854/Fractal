import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AppComponent } from './app.component';
import { CanvasComponent } from './canvas.component';
import { ForestComponent } from './forest.component';

@NgModule({
  declarations: [
    AppComponent, CanvasComponent, ForestComponent
  ],
  imports: [
    BrowserModule, FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
