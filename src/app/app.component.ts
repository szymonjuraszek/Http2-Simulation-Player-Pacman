import {Component, OnDestroy} from '@angular/core';

// @ts-ignore
import * as  data from '../../http2Data.json';
import {Http2SimulationConnection} from './Http2SimulationConnection';
import {HttpClient} from '@angular/common/http';
import {MeasurementService} from './measurement/MeasurementService';
import {DownloadService} from './downloader/DownloadService';
import {environment} from '../environments/environment';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  private downloadService: DownloadService;
  private readonly measurementService: MeasurementService;

  constructor(private http: HttpClient) {
    this.measurementService = new MeasurementService();
    this.downloadService = new DownloadService(this.measurementService);
  }

  setSendingSpeedAndStart(speed: number): void {
    const examplePlayers = (data as any).default;
    const simulationConnection = new Array(examplePlayers.length);

    simulationConnection[environment.whichPlayer] = new Http2SimulationConnection(
      examplePlayers[environment.whichPlayer].nickname,
      this.http, this.measurementService, speed
    );
    simulationConnection[environment.whichPlayer].initializeConnection(
      examplePlayers[environment.whichPlayer],
      1000 - (300 * environment.whichPlayer) + 10000 * environment.whichPlayer
    );
  }

  downloadFile(): void {
    this.downloadService.downloadResponseFile(this.measurementService.getResponseMeasurements());
  }
}
