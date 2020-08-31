export class Player {
  private _nickname: string;
  private _positionX: number;
  private _positionY: number;
  private _score: number;
  private _version: number;

  constructor(nickname: string, positionX: number, positionY: number, score: number, version: number) {
    this._nickname = nickname;
    this._positionX = positionX;
    this._positionY = positionY;
    this._score = score;
    this._version = version;
  }

  get nickname(): string {
    return this._nickname;
  }

  set nickname(value: string) {
    this._nickname = value;
  }

  get positionX(): number {
    return this._positionX;
  }

  set positionX(value: number) {
    this._positionX = value;
  }

  get positionY(): number {
    return this._positionY;
  }

  set positionY(value: number) {
    this._positionY = value;
  }

  get score(): number {
    return this._score;
  }

  set score(value: number) {
    this._score = value;
  }

  get version(): number {
    return this._version;
  }

  set version(value: number) {
    this._version = value;
  }
}
