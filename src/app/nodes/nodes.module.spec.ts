import { NodesModule } from './nodes.module';

describe('NodesModule', () => {
  let nodesModule: NodesModule;

  beforeEach(() => {
    nodesModule = new NodesModule();
  });

  it('should create an instance', () => {
    expect(nodesModule).toBeTruthy();
  });
});
