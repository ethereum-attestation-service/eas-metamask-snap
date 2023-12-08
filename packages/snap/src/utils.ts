export type EASChainConfig = {
  chainId: number;
  chainName: string;
  contractAddress: string;
  schemaRegistryAddress: string;
  subdomain: string;
};
export const EAS_CHAIN_CONFIGS: EASChainConfig[] = [
  {
    chainId: 11155111,
    chainName: 'sepolia',
    subdomain: 'sepolia.',
    contractAddress: '0xC2679fBD37d54388Ce493F1DB75320D236e1815e',
    schemaRegistryAddress: '0x0a7E2Ff54e76B8E6659aedc9103FB21c038050D0',
  },
  {
    chainId: 42161,
    chainName: 'arbitrum',
    subdomain: 'arbitrum.',
    contractAddress: '0xbD75f629A22Dc1ceD33dDA0b68c546A1c035c458',
    schemaRegistryAddress: '0xA310da9c5B885E7fb3fbA9D66E9Ba6Df512b78eB',
  },
  {
    chainId: 1,
    chainName: 'mainnet',
    subdomain: '',
    contractAddress: '0xA1207F3BBa224E2c9c3c6D5aF63D0eb1582Ce587',
    schemaRegistryAddress: '0xA7b39296258348C78294F95B872b282326A97BDF',
  },

  {
    chainId: 420,
    chainName: 'optimism-goerli',
    subdomain: 'optimism-goerli-bedrock.',
    contractAddress: '0x4200000000000000000000000000000000000021',
    schemaRegistryAddress: '0x4200000000000000000000000000000000000020',
  },
  {
    chainId: 11155420,
    chainName: 'optimism-sepolia',
    subdomain: 'optimism-sepolia.',
    contractAddress: '0x4200000000000000000000000000000000000021',
    schemaRegistryAddress: '0x4200000000000000000000000000000000000020',
  },
  {
    chainId: 10,
    chainName: 'optimism',
    subdomain: 'optimism.',
    contractAddress: '0x4200000000000000000000000000000000000021',
    schemaRegistryAddress: '0x4200000000000000000000000000000000000020',
  },
  {
    chainId: 84531,
    chainName: 'base-goerli',
    subdomain: 'base-goerli-predeploy.',
    contractAddress: '0x4200000000000000000000000000000000000021',
    schemaRegistryAddress: '0x4200000000000000000000000000000000000020',
  },
  {
    chainId: 8453,
    chainName: 'base',
    subdomain: 'base.',
    contractAddress: '0x4200000000000000000000000000000000000021',
    schemaRegistryAddress: '0x4200000000000000000000000000000000000020',
  },
  {
    chainId: 59144,
    chainName: 'linea',
    subdomain: 'linea.',
    contractAddress: '0xaEF4103A04090071165F78D45D83A0C0782c2B2a',
    schemaRegistryAddress: '0x55D26f9ae0203EF95494AE4C170eD35f4Cf77797',
  },
  {
    chainId: 80001,
    chainName: 'polygon-mumbai',
    subdomain: 'polygon-mumbai.',
    contractAddress: '0xaEF4103A04090071165F78D45D83A0C0782c2B2a',
    schemaRegistryAddress: '0x55D26f9ae0203EF95494AE4C170eD35f4Cf77797',
  },
  {
    chainId: 534351,
    chainName: 'scroll-sepolia',
    subdomain: 'scroll-sepolia.',
    contractAddress: '0xaEF4103A04090071165F78D45D83A0C0782c2B2a',
    schemaRegistryAddress: '0x55D26f9ae0203EF95494AE4C170eD35f4Cf77797',
  },
];
