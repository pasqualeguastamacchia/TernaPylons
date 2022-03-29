import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {MatMenuModule} from '@angular/material/menu';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {NgChartsModule } from 'ng2-charts';
import { ChartComponent } from './chart/chart.component';
import { ApiService } from './api.service';
import { HttpClientModule } from '@angular/common/http';
import {Chart_Api_Service} from './chart-api.service';



@NgModule({
  declarations: [
    AppComponent,
    ChartComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    MatMenuModule,
    MatButtonModule,
    FormsModule,
    MatIconModule,
    NgChartsModule,
    HttpClientModule
  ],
  providers: [ApiService,Chart_Api_Service],
  bootstrap: [AppComponent]
})
export class AppModule { }
