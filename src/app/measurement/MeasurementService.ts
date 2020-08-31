import {MeasurementResponse} from './MeasurementResponse';

export class MeasurementService {
  private readonly measurements = new Array<MeasurementResponse>();

  // tslint:disable-next-line:typedef
  addMeasurementResponse(id, responseTimeInMillis, specificSecondOfCommunication, version, size) {
    // if (this.measurements.length > 1999) {
    //     this.measurements.splice(0, 1);
    // }
    this.measurements.push(new MeasurementResponse(id, responseTimeInMillis, specificSecondOfCommunication, version, size))
  }

  getResponseMeasurements(): Array<MeasurementResponse> {
    return this.measurements;
  }
}
