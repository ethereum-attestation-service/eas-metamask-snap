import { SchemaEncoder } from '@ethereum-attestation-service/eas-sdk';
import type { OnTransactionHandler } from '@metamask/snaps-sdk';
import { copyable, divider, panel, text } from '@metamask/snaps-sdk';
import dayjs from 'dayjs';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import relativeTime from 'dayjs/plugin/relativeTime';
import { ethers } from 'ethers';

import { EASabi } from './easABI';
import { EAS_CHAIN_CONFIGS } from './utils';

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
  if (!transaction.data?.startsWith('0xf17325e7')) {
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

  const config = EAS_CHAIN_CONFIGS.find(
    (chain) => chain.chainId === parseInt(chainId.split(':')[1] ?? '', 16),
  );

  const schemaResult: {
    data: {
      schema: {
        schema: string;
      };
    };
  } = await postData(
    `https://${config ? config.subdomain : ''}easscan.org/graphql`,
    {
      query: `query Schema {
  schema(where: { id: "${schema}" }) {
    schema
  }
}`,
      variables: {},
    },
  );

  const schemaEncoder = new SchemaEncoder(schemaResult.data.schema.schema);

  contentToRender.push(text('**Schema**'));
  contentToRender.push(divider());
  contentToRender.push(copyable(schema));
  contentToRender.push(text('\u200B'));

  contentToRender.push(text('**Recipient**'));
  contentToRender.push(divider());
  contentToRender.push(copyable(recipient));
  contentToRender.push(text('\u200B'));

  contentToRender.push(text('**Ref UID**'));
  contentToRender.push(divider());
  contentToRender.push(copyable(refUID));
  contentToRender.push(text('\u200B'));

  if (Number(expirationTime) !== 0) {
    contentToRender.push(text('**Expiration Time**'));
    contentToRender.push(divider());
    contentToRender.push(
      copyable(dayjs(Number(expirationTime)).format(timeFormatString)),
    );
    contentToRender.push(text('\u200B'));
  }

  contentToRender.push(text('**Revocable**'));
  contentToRender.push(divider());
  contentToRender.push(copyable(revocable.toString()));
  contentToRender.push(text('\u200B'));

  contentToRender.push(text('**Data**'));
  contentToRender.push(divider());

  const decodedData = schemaEncoder.decodeData(attestationData);

  decodedData.forEach((dd) => {
    // Name will be a variable-like string
    contentToRender.push(text(`**${dd.name}**`));
    contentToRender.push(copyable(dd.value.value.toString()));
  });

  return {
    content: panel(contentToRender),
  };
};
