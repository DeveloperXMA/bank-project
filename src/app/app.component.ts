import { Component } from '@angular/core';

import { ApiServiceService } from './api-service.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less'],
})
export class AppComponent {

  private title = 'Bank Project!';
  private status = '';
  private allTransactions = [];
  private months = [];
  private tableData = [];

  constructor(private apiService: ApiServiceService) {

  }

  pushToTable(month, spent, earn) {
    let obj = {
      time: String,
      spent: Number,
      earn: Number
    };
    obj.time = month;
    obj.spent = spent;
    obj.earn = earn;
    this.tableData.push(obj);
  }

  getAllMonthsData() {
    this.months = [];
    let previousMonth = '';
    let spent = 0;
    let earn = 0;
    for (let item of this.allTransactions) {
      let transactionTime = item['transaction-time'].slice(0,7);
      if (transactionTime !== previousMonth) {
        this.pushToTable(previousMonth, spent/10000, earn/10000);
        previousMonth = transactionTime;
        spent = 0;
        earn = 0;
      } else {
        if (item.amount < 0) {
          spent -= item.amount;
        } else {
          earn += item.amount;
        }
      }
      console.log(transactionTime);
    }
  }

  getAllTransactionsData() {
    this.status = 'Loading';
    this.tableData = [];
    this.apiService.getAllTransactions()
      .subscribe(
      data => {
        this.allTransactions = data;
        this.status = `${this.allTransactions.length} records founded`;
        this.getAllMonthsData();
      },
      error => {
        console.error(error);
        this.status = `No records founded`;
      }
      );
  }
}
