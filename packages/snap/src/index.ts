import type { OnTransactionHandler } from '@metamask/snaps-sdk';
import { copyable, divider, heading, panel, text } from '@metamask/snaps-sdk';
import dayjs from 'dayjs';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import relativeTime from 'dayjs/plugin/relativeTime';
import { ethers } from 'ethers';

import { EASabi } from './easABI';
import { SchemaEncoder } from '@ethereum-attestation-service/eas-sdk';

dayjs.extend(advancedFormat);
dayjs.extend(relativeTime);

export const timeFormatString = 'MM/DD/YYYY h:mm:ss a';

type AttestationArgs = {
  recipient: string;
  expirationTime: bigint;
  revocable: boolean;
  refUID: string;
  data: string;
  value: bigint;
};

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

export const onTransaction: OnTransactionHandler = async ({
  transaction,
  chainId,
}) => {
  if (!transaction.data || transaction.data.slice(0, 10) !== '0xf17325e7') {
    return {
      content: panel([text('This transaction is not an EAS attestation')]),
    };
  }

  const contentToRender = [];

  const easInterface = new ethers.Interface(EASabi);

  const decoded = easInterface.parseTransaction({ data: transaction.data });

  if (!decoded) {
    throw new Error('Unable to decode transaction data');
  }

  const { schema, data }: { schema: string; data: AttestationArgs } =
    decoded.args[0];

  const {
    recipient,
    expirationTime,
    revocable,
    refUID,
    data: attestationData,
  } = data;

  const schemaResult: {
    data: {
      schema: {
        schema: string;
      };
    };
  } = await postData('https://optimism.easscan.org/graphql', {
    query:
      'query Schema {\n  schema(where: { id: "0xf58b8b212ef75ee8cd7e8d803c37c03e0519890502d5e99ee2412aae1456cafe" }) {\n    schema\n  }\n}',
    variables: {},
  });

  const schemaEncoder = new SchemaEncoder(schemaResult.data.schema.schema);

  contentToRender.push(text('**Schema**'));
  contentToRender.push(divider());
  contentToRender.push(text(schema));
  contentToRender.push(text('\u200B'));

  contentToRender.push(text('**Recipient**'));
  contentToRender.push(divider());
  contentToRender.push(text(recipient));
  contentToRender.push(text('\u200B'));

  contentToRender.push(text('**Ref UID**'));
  contentToRender.push(divider());
  contentToRender.push(text(refUID));
  contentToRender.push(text('\u200B'));

  if (Number(expirationTime) !== 0) {
    contentToRender.push(text('**Expiration Time**'));
    contentToRender.push(divider());
    contentToRender.push(
      text(dayjs(Number(expirationTime)).format(timeFormatString)),
    );
    contentToRender.push(text('\u200B'));
  }

  contentToRender.push(text('**Revocable**'));
  contentToRender.push(divider());
  contentToRender.push(text(revocable.toString()));
  contentToRender.push(text('\u200B'));

  contentToRender.push(text('**Data**'));
  contentToRender.push(divider());

  const decodedData = schemaEncoder.decodeData(attestationData);

  decodedData.forEach((d) => {
    contentToRender.push(text(`**${d.name}**`));
    contentToRender.push(text(d.value.value.toString()));
  });

  return {
    content: panel(contentToRender),
  };
};
