import {interval, Subscription} from 'rxjs';
import {HttpClient, HttpHeaders, HttpResponse} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Player} from './model/Player';
import {MeasurementService} from './measurement/MeasurementService';
import {COMMUNICATION_TIME, URL} from '../../globalConfig';
import {environment} from '../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class Http2SimulationConnection {
  private nickname;
  private timeForStartCommunication;
  private readonly speed;

  private http: HttpClient;
  private eventSource: EventSource;
  private sub: Subscription;
  private measurementService: MeasurementService;

  constructor(nick, http, measurementService, speed) {
    this.nickname = nick;
    this.http = http;
    this.measurementService = measurementService;
    this.speed = speed;
  }

  initializeConnection(data, timeToSend): void {
    console.error('Inicjalizuje polaczenie.');

    this.timeForStartCommunication = new Date().getTime();
    setTimeout(() => {
      this.joinToGame(this.nickname);
      this.addPlayer(this.nickname);
      console.error('Polaczylem sie');
    }, timeToSend - 500);

    let timesRun = 0;
    let strategy = true;

    setTimeout(() => {
      const sender = interval(this.speed);

      this.sub = sender.subscribe(() => {
        timesRun += 1;
        if (timesRun === 200) {
          timesRun = 0;
          strategy = !strategy;
        }
        if (strategy) {
          data.positionX -= 4;
        } else {
          data.positionX += 4;
        }
        data.version++;

        this.sendPosition(data);
      });
    }, timeToSend);

    setTimeout(() => {
      this.sub.unsubscribe();
      console.error('Zakonczono komunikacje z serverem');
      if (this.eventSource.OPEN) {
        this.eventSource.close();
      }
      this.http.delete(URL + '/emitter/' + this.nickname).subscribe(value => {
        console.error('Usunalem gracza');
      });
    }, COMMUNICATION_TIME);
  }

  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  sendPosition(dataToSend): void {
    this.http.put(URL + '/player', JSON.stringify(dataToSend), {
      headers: {
        'Content-Type': 'application/json',
        requestTimestamp: new Date().getTime().toString()
      },
      observe: 'response'
    }).subscribe((player: HttpResponse<Player>) => {
      this.saveMeasurement(
        player.body.nickname,
        player.headers.get('requestTimestamp'),
        player.body.version,
        player.headers.get('content-length'),
      );
    });
  }

  joinToGame(nickname: string): void {
    this.http.get(URL + '/player/' + nickname)
      .subscribe((ifExist: boolean) => {
        this.nickname = nickname;
        this.eventSource = new EventSource(URL + '/emitter/' + this.nickname);

        this.eventSource.addEventListener('/pacman/update/monster', (monsterPositionEvent: MessageEvent) => {
        });
        this.eventSource.addEventListener('/pacman/get/coin', (coinPositionEvent: MessageEvent) => {
        });
        this.eventSource.addEventListener('/pacman/refresh/coins', (updateMapEvent: MessageEvent) => {
        });
        this.eventSource.addEventListener('/pacman/remove/player', (playerToRemoveEvent: MessageEvent) => {
        });
        this.eventSource.addEventListener('/pacman/add/players', (playerToAddEvent: MessageEvent) => {
        });
        this.eventSource.addEventListener('/pacman/update/player', (playerToUpdateEvent: MessageEvent) => {
          const playersWithMeasurementInfo = JSON.parse(playerToUpdateEvent.data);

          this.saveMeasurement(
            playersWithMeasurementInfo.player.nickname,
            playersWithMeasurementInfo.requestTimestamp,
            playersWithMeasurementInfo.player.version,
            playersWithMeasurementInfo.contentLength
          );
        });
        this.http.get(URL + '/coins').subscribe((coinsPosition) => {
        });
      });
  }

  addPlayer(nickname: string): void {
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    this.http.post(URL + '/players', JSON.stringify(nickname), {headers, observe: 'response'})
      .subscribe((playerToAdd) => {
      });
  }

  saveMeasurement(nickname, requestTimestamp, version, contentLength): void {
    if (environment.whichPlayer === 6) {
      if (nickname.match('qwert*')) {
        const responseTimeInMillis = new Date().getTime() - requestTimestamp;
        this.measurementService.addMeasurementResponse(
          nickname,
          responseTimeInMillis,
          Math.ceil((Number(requestTimestamp) - this.timeForStartCommunication) / 1000),
          version,
          contentLength,
          requestTimestamp);
      }
    }
  }
}
