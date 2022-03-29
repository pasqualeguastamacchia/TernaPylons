import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class Chart_Api_Service {

  constructor(private httpClient: HttpClient){}

  getTemp(codice_campata:string):Observable<{results:Temperature[]}>{
    return this.httpClient.get<{results:Temperature[]}>("http://localhost:3000/api/Mappatura_Meteo_Campate/details?codiceCampata="+codice_campata+"&data=2021-01-01T00:00:00.000Z")
  } 
}

interface Temperature {
  id: string;
  lon_meteo: number;
  lat_meteo: number;
  Codice_Campata: string;
  Codice_Linea: string;
  Lat_Campata_ini: number;
  Lon_Campata_ini: number;
  Lat_Campata_fin: number;
  Lon_Campata_fin: number;
  DATA: string;
  TEMPERATURA_GC: number;
  PRECIPITAZIONI_MM: number;
}