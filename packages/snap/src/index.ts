import type {
  OnRpcRequestHandler,
  OnTransactionHandler,
} from '@metamask/snaps-sdk';
import { divider, heading, panel, text } from '@metamask/snaps-sdk';
import dayjs from 'dayjs';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(advancedFormat);
dayjs.extend(relativeTime);

export const timeFormatString = 'MM/DD/YYYY h:mm:ss a';

export type Result = {
  data: Data;
};

export type Data = {
  attestations: Attestation[];
};

export type Attestation = {
  attester: string;
  decodedDataJson: string;
  expirationTime: number;
  id: string;
  recipient: string;
  refUID: string;
  revocationTime: number;
  revocable: boolean;
  revoked: boolean;
  schemaId: string;
  time: number;
  txid: string;
};

export type EASChainConfig = {
  chainId: number;
  chainName: string;
  version: string;
  contractAddress: string;
  schemaRegistryAddress: string;
  etherscanURL: string;
  subdomain: string;
};

export const EAS_CHAIN_CONFIGS: EASChainConfig[] = [
  {
    chainId: 11155111,
    chainName: 'sepolia',
    subdomain: 'sepolia.',
    version: '0.26',
    contractAddress: '0xC2679fBD37d54388Ce493F1DB75320D236e1815e',
    schemaRegistryAddress: '0x0a7E2Ff54e76B8E6659aedc9103FB21c038050D0',
    etherscanURL: 'https://sepolia.etherscan.io',
  },
  {
    chainId: 42161,
    chainName: 'arbitrum',
    subdomain: 'arbitrum.',
    version: '0.26',
    contractAddress: '0xbD75f629A22Dc1ceD33dDA0b68c546A1c035c458',
    schemaRegistryAddress: '0xA310da9c5B885E7fb3fbA9D66E9Ba6Df512b78eB',
    etherscanURL: 'https://arbiscan.io',
  },
  {
    chainId: 1,
    chainName: 'mainnet',
    subdomain: '',
    version: '0.26',
    contractAddress: '0xA1207F3BBa224E2c9c3c6D5aF63D0eb1582Ce587',
    schemaRegistryAddress: '0xA7b39296258348C78294F95B872b282326A97BDF',
    etherscanURL: 'https://etherscan.io',
  },
  {
    chainId: 420,
    chainName: 'optimism-goerli',
    subdomain: 'optimism-goerli-bedrock.',
    version: '1.0.0',
    contractAddress: '0x4200000000000000000000000000000000000021',
    schemaRegistryAddress: '0x4200000000000000000000000000000000000020',
    etherscanURL: 'https://goerli-optimism.etherscan.io/',
  },
  {
    chainId: 10,
    chainName: 'optimism',
    subdomain: 'optimism.',
    version: '1.0.1',
    contractAddress: '0x4200000000000000000000000000000000000021',
    schemaRegistryAddress: '0x4200000000000000000000000000000000000020',
    etherscanURL: 'https://optimistic.etherscan.io/',
  },
  {
    chainId: 84531,
    chainName: 'base-goerli',
    subdomain: 'base-goerli-predeploy.',
    version: '1.0.1',
    contractAddress: '0x4200000000000000000000000000000000000021',
    schemaRegistryAddress: '0x4200000000000000000000000000000000000020',
    etherscanURL: 'https://goerli.basescan.org/',
  },

  {
    chainId: 8453,
    chainName: 'base',
    subdomain: 'base.',
    version: '1.0.1',
    contractAddress: '0x4200000000000000000000000000000000000021',
    schemaRegistryAddress: '0x4200000000000000000000000000000000000020',
    etherscanURL: 'https://basescan.org/',
  },
  {
    chainId: 59144,
    chainName: 'linea',
    subdomain: 'linea.',
    version: '1.2.0',
    contractAddress: '0xaEF4103A04090071165F78D45D83A0C0782c2B2a',
    schemaRegistryAddress: '0x55D26f9ae0203EF95494AE4C170eD35f4Cf77797',
    etherscanURL: 'https://lineascan.build/',
  },
  {
    chainId: 80001,
    chainName: 'polygon-mumbai',
    subdomain: 'polygon-mumbai.',
    version: '1.2.0',
    contractAddress: '0xaEF4103A04090071165F78D45D83A0C0782c2B2a',
    schemaRegistryAddress: '0x55D26f9ae0203EF95494AE4C170eD35f4Cf77797',
    etherscanURL: 'https://mumbai.polygonscan.com/',
  },
];

/**
 * Handle incoming JSON-RPC requests, sent through `wallet_invokeSnap`.
 *
 * @param args - The request handler args as object.
 * @param args.origin - The origin of the request, e.g., the website that
 * invoked the snap.
 * @param args.request - A validated JSON-RPC request object.
 * @returns The result of `snap_dialog`.
 * @throws If the request method is not valid for this snap.
 */
export const onRpcRequest: OnRpcRequestHandler = async ({
  origin,
  request,
}) => {
  switch (request.method) {
    case 'hello':
      return snap.request({
        method: 'snap_dialog',
        params: {
          type: 'confirmation',
          content: panel([
            text(`Hello, **${origin}**!`),
            text('This custom confirmation is just for display purposes.'),
            text(
              'But you can edit the snap source code to make it do something, if you want to!',
            ),
          ]),
        },
      });
    default:
      throw new Error('Method not found.');
  }
};

const postData = async (url = '', data = {}) => {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  return response.json();
};

const getAttestations: (
  chainString: string,
  address: string,
) => Promise<Attestation[]> = async (chainString: string, address: string) => {
  const chainId = Number(chainString.split(':')[1]);

  const chainConfig = EAS_CHAIN_CONFIGS.find(
    (config) => config.chainId === chainId,
  );

  if (!chainConfig) {
    throw new Error('Something wrong occurred');
  }

  const attestationsData: Result = await postData(
    `https://${chainConfig.subdomain}easscan.org/graphql`,
    {
      query: `query GetAttestations {
  attestations(
    where: {
      recipient: { equals: "${address}", mode: insensitive }
    },
    orderBy: [{ time: desc }]
  ) {
    attester
    decodedDataJson
    expirationTime
    id
    recipient
    refUID
    revocationTime
    revocable
    revoked
    schemaId
    time
    txid
  }
}`,
      variables: {},
    },
  );

  return attestationsData.data.attestations;
};

const shortenHexString = (longString: string) => {
  return `${longString.slice(0, 5)}...${longString.slice(
    longString.length - 4,
    longString.length,
  )}`;
};

const renderAttestations = async (attestations: Attestation[]) => {
  return await Promise.all(
    attestations.map(async (attestation: Attestation, index: number) => {
      const isRevoked = attestation.revoked;
      const canExpire = attestation.expirationTime > 0;
      const isExpired =
        canExpire && attestation.expirationTime < Math.floor(Date.now() / 1000);
      const isActive = !isRevoked && !isExpired;
      const activeLogo = isActive ? '✅' : '❌';
      const schemaName = 'Schema Name';

      const content = [];
      let value = `${activeLogo} **${shortenHexString(
        attestation.attester,
      )}** attested "**${schemaName}**" at ${dayjs
        .unix(attestation.time)
        .format(timeFormatString)}`;

      if (canExpire) {
        if (isExpired) {
          value = value.concat(
            ` (expired ${dayjs
              .unix(attestation.expirationTime)
              .format(timeFormatString)})`,
          );
        } else {
          value = value.concat(
            ` (expires in ${dayjs
              .unix(attestation.expirationTime)
              .fromNow(true)})`,
          );
        }
      }

      if (isRevoked) {
        value = value.concat(
          ` (revoked ${dayjs
            .unix(attestation.revocationTime)
            .format(timeFormatString)})`,
        );
      }

      content.push(
        text({
          value,
          markdown: true,
        }),
      );

      if (index !== attestations.length - 1) {
        content.push(divider());
      }

      return content;
    }),
  );
};

export const onTransaction: OnTransactionHandler = async ({
  transaction,
  chainId,
}) => {
  const destinationAddress = transaction.to?.toString();

  if (!destinationAddress) {
    throw new Error('Something wrong occurred');
  }

  const attestations = await getAttestations(chainId, destinationAddress);
  const contentToRender = [];

  console.log(attestations);

  if (attestations.length) {
    contentToRender.push(
      heading(
        `${shortenHexString(destinationAddress)} has ${
          attestations.length
        } attestations`,
      ),
    );
    contentToRender.push(divider());
    const renderedAttestations = await renderAttestations(attestations);
    contentToRender.push(...renderedAttestations.flat(2));
  } else {
    contentToRender.push(
      heading(
        `${shortenHexString(destinationAddress)} doesn't have any attestation`,
      ),
    );
  }

  return {
    content: panel(contentToRender),
  };
};
