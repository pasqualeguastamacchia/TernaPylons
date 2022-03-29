import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import Map from 'ol/Map';
import View from 'ol/View';
import {Tile as TileLayer, Vector as VectorLayer} from 'ol/layer';
import OSM from 'ol/source/OSM';
import { ChartDataset } from 'chart.js';
import Feature from 'ol/Feature';
import VectorSource from 'ol/source/Vector';
import { Style, Stroke} from 'ol/style';
import { fromLonLat } from 'ol/proj';
import LineString from 'ol/geom/LineString';
import { ApiService } from './api.service';
import { Chart_Api_Service } from './chart-api.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent implements OnInit {
  @ViewChild("myChart") myChart?: ElementRef;
  numPages: number[]= [];
  filteredPoints:any[] =[];
  currentPage: number = 1;
  filteredNumPage : number[] = [];

  map: Map | undefined;
  chartTemp: {x:Date, y:number} [] = [];
  public points: any[] = [];
  temperatureChartValues: {x:Date, y:number}[] = [];
  precipitazioniChartValues: {x:Date, y:number}[] = [];
  public panelShow: boolean = false;

  showPanel(campata:string){
    this.chartApi.getTemp(campata).subscribe(res=>{
      this.temperatureChartValues = [];
      this.precipitazioniChartValues = [];
        res.results.forEach(singleCoord =>{
          this.temperatureChartValues.push({
            x:new Date(singleCoord.DATA),
            y:singleCoord.TEMPERATURA_GC
          });
           this.precipitazioniChartValues.push({
             x:new Date(singleCoord.DATA),
             y:singleCoord.PRECIPITAZIONI_MM
           });
        })
    })
    this.panelShow = true;
  };
  hidePanel(){
    this.panelShow = false;
  }
  iconPath(status:string):string{
    
    return status == 'success'? "assets\img\success.png" : (status == 'warning' ? "assets\img\warning.png" : "assets\img\danger.png")
  }

  moveMapView(campata:any){
    const view = new View({
      center: fromLonLat([(campata.coord_lon_ini+campata.coord_lon_fin)/2, (campata.coord_lat_ini+campata.coord_lat_fin)/2]),
      zoom: 17,
    });
    this.map?.setView(view);
  }

  goToPage(page:number){
    if (this.currentPage > page && page%10 === 0){
      this.filteredNumPage = this.numPages.slice(this.currentPage-11,page)
    }
    if (this.currentPage < page && page%10 === 1){
      this.filteredNumPage = this.numPages.slice(this.currentPage,this.currentPage+10)
    }
    this.filteredPoints = this.points.slice((page-1)*1000,page*1000);
    this.currentPage = page;
  }

  // basedOnRiskColorToApply (risk:number){
  //   if (risk >=0.8 && risk <=1){
  //     return '#EE360F'
  //   } else if(risk >= 0.5 && risk <0.8) {
  //     return '#FFFF00'
  //   } else {
  //     return '#008000'
  //   }
  // }

  ngOnInit(): void {
    var lineStyleDanger = new Style({
      stroke: new Stroke({
        color: '#EE360F',
        width: 5
      })
    });

    var lineStyleWarning = new Style({
      stroke: new Stroke({
        color: '#FFFF00',
        width: 5
      })
    });

    var lineStyleOk = new Style({
      stroke: new Stroke({
        color: '#008000',
        width: 5
      })
    })
    this.api.getCoords().subscribe((results)=>{
      this.points = results.results.sort((a,b)=>(a.risk[0]?.predicted || 0) > (b.risk[0]?.predicted || 0) ? -1 : (a.risk[0]?.predicted || 0) === (b.risk[0]?.predicted || 0) ? 0 :1 );
      if (results.results.length){
        this.numPages = Array(Math.ceil(results.results.length/1000)).fill(true).map((_,index)=>index+1);
        this.filteredNumPage = this.numPages.slice(0,10)
      }
      this.filteredPoints = this.points.slice(0,1000);
      const features = results.results.reduce((acc,coord)=>{
        const coordIni = [coord.coord_lon_ini,coord.coord_lat_ini];
        const coordFin = [coord.coord_lon_fin,coord.coord_lat_fin];
        const lineString = new LineString([coordIni,coordFin]);
        //this.points.push({codice_campata:coord.codice_campata,livello_di_tensione:coord.livello_di_tensione,lunghezza_linea:coord.lunghezza_campata})
        // transform to EPSG:3857
        lineString.transform('EPSG:4326', 'EPSG:3857');
        
        // create the feature
        const feature = new Feature({
          geometry: lineString,
          name: 'Line'
        });
        feature.setStyle(coord.risk[0]?.predicted >= 0.8 ?lineStyleDanger : (coord.risk[0]?.predicted >=0.5 && coord.risk[0]?.predicted <0.8)?lineStyleWarning : lineStyleOk )
        acc.push(feature)
        return acc;
      },[] as Feature[])
      
      var source = new VectorSource({
        features 
      });
      var vector = new VectorLayer({
        source: source,
        style: []
      });
  
      this.map = new Map({
        view: new View({
          center: fromLonLat([11.83929778204951, 45.869498595558426]),
          zoom: 12,
  
        }),
        layers: [
          new TileLayer({
            source: new OSM(),
          }),vector
        ],
        target: 'ol-map'
      });      
    });
  }
    
  constructor(private api: ApiService, private chartApi: Chart_Api_Service) { }
}