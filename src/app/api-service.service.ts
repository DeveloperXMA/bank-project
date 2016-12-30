import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Http, Response } from '@angular/http';
import { Headers, RequestOptions } from '@angular/http';

@Injectable()
export class ApiServiceService {

  constructor(private http: Http) {
    this.getAllTransactions();
  }

  private extractData(res: Response) {
    let body = res.json();
    return body.transactions || body.data || {};
  }

  private handleError(error: Response | any) {
    // In a real world app, we might use a remote logging infrastructure
    let errMsg: string;
    if (error instanceof Response) {
      const body = error.json() || '';
      const err = body.error || JSON.stringify(body);
      errMsg = `${error.status} - ${error.statusText || ''} ${err}`;
    } else {
      errMsg = error.message ? error.message : error.toString();
    }
    console.error(errMsg);
    return Promise.reject(errMsg);
  }

  getAllTransactions():Observable<any> {
    let headers = new Headers({
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    });
    let options = new RequestOptions({ headers: headers });
    const url = 'https://2016.api.levelmoney.com/api/v2/core/get-all-transactions';
    const args = {
      args:
      { uid: 1110590645, token: '2DA6669F34EB703A301E8A7D092B8F07', 'api-token': 'AppTokenForInterview', 'json-strict-mode': false, 'json-verbose-response': false }
    };
    return this.http.post(url, JSON.stringify(args), options)
      .map(this.extractData)
      .catch(this.handleError);
  }
}
