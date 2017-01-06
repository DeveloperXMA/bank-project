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
  private averageSpent = 0;
  private averageEarn = 0;
  private flag = 0;

  constructor(private apiService: ApiServiceService) {

  }

  pushToTable(month, spent, earn) {
    let obj = {
      time: String,
      spent: Number,
      earn: Number
    };
    obj.time = month;
    obj.spent = spent.toFixed(2);
    obj.earn = earn.toFixed(2);
    this.averageEarn += earn;
    this.averageSpent += spent;
    this.tableData.push(obj);
  }


  getAllMonthsData(isIgnore?: boolean) {
    this.months = [];
    let previousMonth = '';
    let spent = 0;
    let earn = 0;
    let transactionTime = '';
    for (let item of this.allTransactions) {
      transactionTime = item['transaction-time'].slice(0, 7);
      if (transactionTime !== previousMonth) {
        if (previousMonth !== '') {
          this.pushToTable(previousMonth, spent / 10000, earn / 10000);
        }
        previousMonth = transactionTime;
        spent = 0;
        earn = 0;
      } else {
        if (item.amount < 0 && isIgnore !== true) {
          spent -= item.amount;
        } else if (item.amount < 0) {
          if (item.merchant !== 'Krispy Kreme Donuts' && item.merchant !== 'DUNKIN #336784') {
            spent -= item.amount;
          }
        } else {
          earn += item.amount;
        }
      }
    }
    if (previousMonth !== '') {
      this.pushToTable(previousMonth, spent / 10000, earn / 10000);
    }
    console.log(this.averageEarn, this.averageSpent, this.tableData.length);
    this.pushToTable('average', this.averageSpent / this.tableData.length, this.averageEarn / this.tableData.length);
    this.averageSpent = 0;
    this.averageEarn = 0;
  }

  getAllTransactionsData(isIgnore?: boolean) {
    this.status = 'Loading';
    this.tableData = [];
    this.apiService.getAllTransactions()
      .subscribe(
      data => {
        this.allTransactions = data;
        this.status = `${this.allTransactions.length} records founded`;
        this.getAllMonthsData(isIgnore);
        this.flag = 0;
      },
      error => {
        console.error(error);
        this.status = `No records founded`;
      }
      );
  }

  getProjectedTransactionsForMonth() {
    let date = new Date();
    let year = date.getFullYear();
    let month = date.getMonth() + 1;
    return this.apiService.GetProjectedTransactionsForMonth(year, month)
    .subscribe(
      data => {
        if (this.allTransactions.length === 0) {
          this.status = 'Please load all transactions first! Then this function would work.';
        } else if (this.flag === 0 ) {
          this.flag = 1;
          this.allTransactions = this.allTransactions.concat(data);
          this.status = `${this.allTransactions.length} records founded! ${data.length} records added`;
          this.tableData = [];
          this.getAllMonthsData();
        }
      },
      error => {
        console.log(error);
      }
    );
  }
}
