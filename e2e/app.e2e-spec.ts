import { BankProjectPage } from './app.po';

describe('bank-project App', function() {
  let page: BankProjectPage;

  beforeEach(() => {
    page = new BankProjectPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
