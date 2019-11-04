import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AppComponent } from './app.component';
import { CanvasComponent } from './canvas.component';
import { ForestComponent } from './forest.component';
import { SkyComponent } from './sky.component';
import { GroundComponent } from './ground.component';

@NgModule({
  declarations: [
    AppComponent, CanvasComponent, ForestComponent, SkyComponent, GroundComponent
  ],
  imports: [
    BrowserModule, FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
