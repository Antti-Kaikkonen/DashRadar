import { DashRadarPage } from './app.po';

describe('dash-radar App', () => {
  let page: DashRadarPage;

  beforeEach(() => {
    page = new DashRadarPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
