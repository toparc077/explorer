import * as React from 'react';
import { Box, BoxProps, Flex, color, Stack, Spinner, transition } from '@stacks/ui';
import { Section } from '@components/section';
import { capitalize } from '@common/utils';
import { Caption } from '@components/typography';
import { atomFamily, useRecoilState } from 'recoil';
import { memo, Fragment, useMemo } from 'react';

import { useHover } from 'web-api-hooks';
import { SECTION_HEADER_HEIGHT } from '@common/constants/sizes';
import { SectionFooterAction } from '@components/section-footer-button';
import { MempoolTransaction, Transaction } from '@blockstack/stacks-blockchain-api-types';

import { TransactionListItem } from '@components/transaction-list-item';
import { FilterButton } from '@components/filter-button';

const TX_TABS = 'tabs/tx-list';

const tabIndexState = atomFamily({
  key: 'tabs.index',
  default: 0,
});

const useTabs = (key: string) => {
  const [currentIndex, setCurrentIndex] = useRecoilState(tabIndexState(key));

  return {
    currentIndex,
    setCurrentIndex,
  };
};

interface TabProps extends BoxProps {
  tab: string;
  index: number;
}

interface TabIndicatorProps extends BoxProps {
  isHovered?: boolean;
  isActive?: boolean;
}

const TabActiveIndicator: React.FC<TabIndicatorProps> = memo(({ isHovered, isActive, ...rest }) => (
  <Box
    height="1px"
    width="100%"
    opacity={isActive ? 0.75 : isHovered ? 1 : 0}
    bg={color(isActive ? 'text-title' : 'brand')}
    position="absolute"
    bottom="-1px"
    transform={isActive || isHovered ? 'none' : 'scaleX(0)'}
    transition={transition}
    {...rest}
  />
));

const Tab: React.FC<TabProps> = memo(({ tab, index, _hover = {}, ...rest }) => {
  const [isHovered, bind] = useHover();
  const { currentIndex, setCurrentIndex } = useTabs(TX_TABS);
  const isActive = index === currentIndex;
  const hoverProps = isActive
    ? {
        ..._hover,
      }
    : {
        cursor: 'pointer',
        color: color('brand'),
        ..._hover,
      };
  return (
    <Box
      as="button"
      display="flex"
      alignItems="center"
      justifyContent="center"
      outline={0}
      border={0}
      px="base-loose"
      bg="transparent"
      onClick={() => setCurrentIndex(index)}
      color={isActive ? color('text-title') : color('text-caption')}
      _hover={hoverProps}
      position="relative"
      height={SECTION_HEADER_HEIGHT}
      {...bind}
      {...rest}
    >
      <Caption opacity={isActive ? 1 : 0.85} fontSize={2} fontWeight={500} color="currentColor">
        {capitalize(tab)} transactions
      </Caption>
      <TabActiveIndicator isActive={isActive} isHovered={isHovered} />
    </Box>
  );
});

const Tabs = memo(() => {
  const tabs = ['pending', 'confirmed'];
  return (
    <Stack isInline spacing="0">
      {tabs.map((tab, index) => (
        <Tab tab={tab} index={index} key={index} />
      ))}
    </Stack>
  );
});
type Item = MempoolTransaction | Transaction;

export interface Pages {
  limit: number;
  offset: number;
  total: number;
  results: Item[];
}

interface TransactionListProps {
  data: {
    pages: Pages[];
    pageParams: (number | undefined)[];
  };
}

const TransactionList = memo<TransactionListProps>(props => {
  const { data } = props;
  return (
    <>
      {data.pages.map(({ results }, index: number) => {
        const isLastPage = data.pages.length === index + 1;
        return (
          <Fragment key={index}>
            {results?.map((item: Item, itemIndex: number) => (
              <TransactionListItem
                tx={item}
                key={item.tx_id}
                isLast={isLastPage && itemIndex + 1 === results.length}
              />
            ))}
          </Fragment>
        );
      })}
    </>
  );
});

export const TabbedTransactionList: React.FC<{
  mempool: any;
  confirmed: any;
  infinite?: boolean;
}> = ({ mempool, confirmed, infinite }) => {
  const { currentIndex } = useTabs(TX_TABS);
  const mempoolSelected = currentIndex === 0;
  const onClick = mempoolSelected ? mempool?.fetchNextPage : confirmed?.fetchNextPage;
  const hasMore = mempoolSelected ? mempool?.hasNextPage : confirmed?.hasNextPage;
  const isLoadingMore = mempoolSelected
    ? mempool?.isFetchingNextPage
    : confirmed?.isFetchingNextPage;

  const { isFetching } = mempoolSelected ? mempool : confirmed;

  const footerProps = infinite
    ? {
        onClick,
        hasMore,
        isLoadingMore,
      }
    : {};

  return (
    <Section
      title={Tabs}
      headerProps={{
        pl: '0',
      }}
      isLoading={isFetching}
      topRight={!mempoolSelected && infinite && FilterButton}
    >
      <Flex flexGrow={1} flexDirection="column" px="base-loose">
        <Box display={mempoolSelected ? 'unset' : 'none'}>
          <TransactionList data={mempool?.data} key={'mempool'} />
        </Box>
        <Box display={!mempoolSelected ? 'unset' : 'none'}>
          <TransactionList data={confirmed?.data} key={'confirmed'} />
        </Box>
        <Box flexGrow={1} />
        <SectionFooterAction path="transactions" {...(footerProps as any)} />
      </Flex>
    </Section>
  );
};
