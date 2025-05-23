export type WalrusService = {
    id: string;
    name: string;
    publisherUrl: string;
    aggregatorUrl: string;
  };

export type Data = {
    status: string;
    blobId: string;
    endEpoch: string;
    suiRefType: string;
    suiRef: string;
    suiBaseUrl: string;
    blobUrl: string;
    suiUrl: string;
    isImage: string;
};

export const services: WalrusService[] = [
    {
      id: 'service1',
      name: 'walrus.space',
      publisherUrl: '/publisher1',
      aggregatorUrl: '/aggregator1',
    },
    {
      id: 'service2',
      name: 'staketab.org',
      publisherUrl: '/publisher2',
      aggregatorUrl: '/aggregator2',
    },
    {
      id: 'service3',
      name: 'redundex.com',
      publisherUrl: '/publisher3',
      aggregatorUrl: '/aggregator3',
    },
    {
      id: 'service4',
      name: 'nodes.guru',
      publisherUrl: '/publisher4',
      aggregatorUrl: '/aggregator4',
    },
    {
      id: 'service5',
      name: 'banansen.dev',
      publisherUrl: '/publisher5',
      aggregatorUrl: '/aggregator5',
    },
    {
      id: 'service6',
      name: 'everstake.one',
      publisherUrl: '/publisher6',
      aggregatorUrl: '/aggregator6',
    },
];

export const NUM_EPOCH = 1;