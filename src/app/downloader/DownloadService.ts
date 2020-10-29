import {MeasurementService} from '../measurement/MeasurementService';
import {saveAs} from 'file-saver';

export class DownloadService {

  private RESPONSE_FILE = 'response_measurement.csv';

  constructor(private cacheMeasurement: MeasurementService) {
  }

  public downloadResponseFile(data: any) {
    const replacer = (key, value) => value === null ? '' : value; // specify how you want to handle null values here
    let header = ['id', 'response_time_in_millis', 'specific_second_of_communication', 'version_response', 'size', 'request_timestamp'];
    const csv = data.map(row => header.map(fieldName => JSON.stringify(row[fieldName], replacer)).join(','));
    header = header.map((x) => {
      return x.toUpperCase();
    });
    csv.unshift(header.join(','));
    const csvArray = csv.join('\r\n');

    saveAs(new Blob([csvArray], {type: 'text/csv'}), this.RESPONSE_FILE);
  }

}
