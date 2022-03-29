import { AfterViewInit, Component, Input, OnInit } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import 'chartjs-adapter-date-fns';
import {it} from 'date-fns/locale';

@Component({
  selector: 'app-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.css']
})
export class ChartComponent implements OnInit,AfterViewInit {

  data: ChartData[] = [];
  data2: ChartData[] = []
  chart: Chart<"line", ChartData[], unknown> | undefined;
  chart2: Chart<"line", ChartData[], unknown> | undefined;

  @Input("data") set setData(data:ChartData[]) {
    this.data = data;
    if(this.chart){
      this.chart.data.datasets[0].data = data;
      this.chart.update();
    }
  }
  @Input("data2") set setData2(data:ChartData[]) {
    this.data2 = data;
    if(this.chart2){
      this.chart2.data.datasets[0].data = data;
      this.chart2.update();
    }
  }

  constructor() { }

  ngOnInit(): void {
  }

    ngAfterViewInit(): void {
      Chart.register(...registerables);
      this.chart = new Chart("myChart",{
        type:'line',
        data:{
          datasets:[{
            label:'Temperature (°C)',
            data: this.data,
            borderColor:'rgb(255,0,0)',
            backgroundColor:'rgb(255,0,0)',
            pointBackgroundColor:'rgb(255,0,0)',
            pointBorderColor:'rgb(0,0,0)',
            tension:.2
          }]
        },
        options:{
          scales:{
            x:{
              adapters:{
                date: {
                  locale: it
                }
              },
              type:"time",
              time:{
                tooltipFormat:'dd-MM-yyyy, HH:mm:ss',
                unit:'day'
              }
            }
          }
        }
      })
      this.chart2 = new Chart("myChart2",{
        type:'line',
        data:{
          datasets:[{
            label:'Precipitazioni (mm)',
            data: this.data2,
            borderColor:'rgb(0,0,255)',
            backgroundColor:'rgb(0,0,255)',
            pointBackgroundColor:'rgb(0,0,255)',
            pointBorderColor:'rgb(0,0,0)',
            tension:.2,
          }]
        },
        options:{
          scales:{
            x:{
              adapters:{
                date: {
                  locale: it
                }
              },
              type:"time",
              time:{
                tooltipFormat:'dd-MM-yyyy, HH:mm:ss',
                unit:'day'
              }
            }
          }
        }
      })
    }
}

interface ChartData {
  x:Date; 
  y:number;
}
