import {interval, Subscription} from 'rxjs';
import {HttpClient, HttpHeaders, HttpResponse} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Player} from './model/Player';
import {MeasurementService} from './measurement/MeasurementService';
import {COMMUNICATION_TIME, MESSAGE_FREQUENCY, URL} from '../../globalConfig';
import {environment} from '../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class Http2SimulationConnection {
  private additionalData = this.randomString(50, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ');
  private variable = this.makeid(30000);
  private nickname;
  private http: HttpClient;
  private eventSource: EventSource;
  private sub: Subscription;
  private timeForStartCommunication;
  private measurementService: MeasurementService;

  randomString(length, chars): string {
    let result = '';
    for (let i = length; i > 0; --i) {
      result += chars[Math.floor(Math.random() * chars.length)];
    }
    return result;
  }

  constructor(nick, http, measurementService) {
    this.nickname = nick;
    this.http = http;
    this.measurementService = measurementService;
  }

  initializeConnection(data, timeToSend): void {
    console.error('Inicjalizuje polaczenie.');

    setTimeout(() => {
      this.joinToGame(this.nickname);
      this.addPlayer(this.nickname);
      console.error('Polaczylem sie');
    }, timeToSend - 500);

    let timesRun = 0;
    let strategy = true;
    // data.additionalData = this.additionalData;

    setTimeout(() => {
      console.error('Zaczynam wysylac dane.');
      this.timeForStartCommunication = new Date().getTime();
      const sender = interval(MESSAGE_FREQUENCY);
      this.sub = sender.subscribe(() => {
        console.error('Wysylam');
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
      if (environment.whichPlayer === 1) {
        if (player.body.nickname.match('first*')) {
          const responseTimeInMillis = new Date().getTime() - Number(player.headers.get('requestTimestamp'));
          this.measurementService.addMeasurementResponse(player.body.nickname,
            responseTimeInMillis,
            Math.ceil((Number(player.headers.get('requestTimestamp')) - this.timeForStartCommunication) / 1000),
            player.body.version, Number(player.headers.get('content-length')), player.headers.get('requestTimestamp'));
        }
      } else if (environment.whichPlayer === 5) {
        if (player.body.nickname.match('second*')) {
          const responseTimeInMillis = new Date().getTime() - Number(player.headers.get('requestTimestamp'));
          this.measurementService.addMeasurementResponse(player.body.nickname,
            responseTimeInMillis,
            Math.ceil((Number(player.headers.get('requestTimestamp')) - this.timeForStartCommunication) / 1000),
            player.body.version, Number(player.headers.get('content-length')), player.headers.get('requestTimestamp'));
        }
      }
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
          if (environment.whichPlayer === 1) {
            if (playersWithMeasurementInfo.player.nickname.match('first*')) {
              const responseTimeInMillis = new Date().getTime() - playersWithMeasurementInfo.requestTimestamp;
              this.measurementService.addMeasurementResponse(playersWithMeasurementInfo.player.nickname,
                responseTimeInMillis,
                Math.ceil((Number(playersWithMeasurementInfo.requestTimestamp) - this.timeForStartCommunication) / 1000),
                playersWithMeasurementInfo.player.version, playersWithMeasurementInfo.contentLength, playersWithMeasurementInfo.requestTimestamp);
            }
          } else if (environment.whichPlayer === 5) {
            if (playersWithMeasurementInfo.player.nickname.match('second*')) {
              const responseTimeInMillis = new Date().getTime() - playersWithMeasurementInfo.requestTimestamp;
              this.measurementService.addMeasurementResponse(playersWithMeasurementInfo.player.nickname,
                responseTimeInMillis,
                Math.ceil((Number(playersWithMeasurementInfo.requestTimestamp) - this.timeForStartCommunication) / 1000),
                playersWithMeasurementInfo.player.version, playersWithMeasurementInfo.contentLength, playersWithMeasurementInfo.requestTimestamp);
            }
          }
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

  makeid(length): string {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }
}
