import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(private httpClient: HttpClient){}

  getCoords():Observable<{results:Coord[]}>{
    return this.httpClient.get<{results:Coord[]}>("http://localhost:3000/api/Mappatura_Meteo_Campate/riskPredictionDaily?data=2021-03-31")
  } 
}

interface Coord {
  id: string;
  codice_campata: string;
  codice_linea: string;
  livello_di_tensione: string;
  lunghezza_campata: string;
  data_entrata_in_servizio: string;
  coord_lat_ini: number;
  coord_lon_ini: number;
  coord_lat_fin: number;
  coord_lon_fin: number;
  lon_meteo: number;
  lat_meteo: number;
  distance_meteo_km: number;
  id_meteo: string;
  INSERT_DATE: string;
  risk:Risk[]
}

interface Risk{
  _id: string;
  timestamp: string;
  id_linea: string;
  id_campata: string;
  predicted: number;
}