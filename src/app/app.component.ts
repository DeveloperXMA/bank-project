import { Component } from '@angular/core';
import * as moment from 'moment';

import { ApiServiceService } from './api-service.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less'],
})
export class AppComponent {

  private title = 'Bank Project!';
  private status = '';
  private allTransactions:Array<any> = [];
  private months = [];
  private tableData = [];
  private averageSpent = 0;
  private averageEarn = 0;
  private flag = 0;
  private removedRecords = [];
  private shownCC = false;

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
    this.pushToTable('average', this.averageSpent / this.tableData.length, this.averageEarn / this.tableData.length);
    this.averageSpent = 0;
    this.averageEarn = 0;
  }

  getAllTransactionsData(isIgnore?: boolean) {
    this.status = 'Loading';
    this.shownCC = false;
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
    if (this.shownCC) {
      this.status = 'reload all transactions first!';
      return;
    }
    let date = new Date();
    let year = date.getFullYear();
    let month = date.getMonth() + 1;
    return this.apiService.GetProjectedTransactionsForMonth(year, month)
    .subscribe(
      data => {
        if (this.allTransactions.length === 0) {
          this.status = 'Please load all transactions first!';
        } else if (this.flag === 0 ) {
          this.flag = 1;
          this.shownCC = false;
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

  isLongerThen24Hours(time1, time2):Boolean {
    let duration = moment.duration(time1-time2).as('seconds');
    if (duration > 86400) {
      return true;
    } else {
      return false;
    }
  }

  uniq(a) {
   return Array.from(new Set(a));
  }

  reCalculate() {
    let indexArray = [];
    for(let item of this.removedRecords) {
      let index = item.prevIndex;
      indexArray.push(index);
    }
    indexArray = this.uniq(indexArray);
    for(let i = 0; i < indexArray.length; i++) {
      let number = indexArray[i];
      this.allTransactions.splice(i, 1);
    }
    this.tableData = [];
    this.flag = 0;
    this.getAllMonthsData();
  }


  removeCC() {
    this.status = 'Scroll down to see removed records';
    this.shownCC = true;
    this.removedRecords = [];
    for (let index = 0; index < this.allTransactions.length; index++) {
      let i = 1;
      let time1 = new Date(this.allTransactions[index]['transaction-time']).getTime();
      if (index + i >= this.allTransactions.length) continue;
      let time2 = new Date(this.allTransactions[index + i]['transaction-time']).getTime();
      while (!this.isLongerThen24Hours(time2, time1) && (index + i) < this.allTransactions.length) {
        if(this.allTransactions[index].amount + this.allTransactions[index+i].amount === 0) {
          let obj = {
            time: moment(time1),
            amount: this.allTransactions[index].amount / 10000,
            merchant: this.allTransactions[index].merchant,
            prevIndex: index,
          }
          let obj2 = {
            time: moment(time2),
            amount: this.allTransactions[index+i].amount / 10000,
            merchant: this.allTransactions[index+i].merchant,
            prevIndex: index + i,
          }
          this.removedRecords.push(obj);
          this.removedRecords.push(obj2);
          break;
        }
        i++;
      }
    }
    this.reCalculate();
  }
}
