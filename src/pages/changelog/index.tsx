import React from 'react';
import { Box, Flex, Stack, color } from '@stacks/ui';
import { Pre, Text, Title } from '@components/typography';
import { Meta } from '@components/meta-head';
import { NextPage } from 'next';
import { Section } from '@components/section';
import fs from 'fs';
import matter from 'gray-matter';
import path from 'path';
import hydrate from 'next-mdx-remote/hydrate';
import renderToString from 'next-mdx-remote/render-to-string';
import Image from 'next/image';

// @ts-ignore
import remarkImages from 'remark-images';
// @ts-ignore
import remarkUnwrapImages from 'remark-unwrap-images';
import rehypeImages from '@common/lib/rehype-images';
import dayjs from 'dayjs';
import { css, Theme } from '@stacks/ui-core';
import { border } from '@common/utils';

const H1: React.FC = props => <Title as="h1" {...props} />;
const H2: React.FC = props => <Title as="h2" {...props} />;
const H3: React.FC = props => <Title as="h3" {...props} />;
const P: React.FC = props => (
  <Text maxWidth="76ch" color={color('text-body')} lineHeight="28px" {...props} />
);
const Ul: React.FC = props => (
  <Stack
    mt="0"
    spacing="base"
    maxWidth="76ch"
    as="ul"
    color={color('text-body')}
    lineHeight="26px"
    {...props}
  />
);
const Li: React.FC = props => (
  <Text as="li" display="list-item" color={color('text-body')} lineHeight="28px" {...props} />
);

const Img: React.FC = ({ dimensions, ...rest }: any) => {
  return (
    <Box bg={color('bg-4')} borderRadius="18px" overflow="hidden" border={border()}>
      <Image
        layout="responsive"
        width={`${dimensions.width / 2}px`}
        height={`${dimensions.height / 2}px`}
        {...rest}
      />
    </Box>
  );
};
const components = {
  h1: H1,
  h2: H2,
  h3: H3,
  p: P,
  ul: Ul,
  li: Li,
  inlineCode: Pre,
  img: Img,
};

const ChangelogPage: NextPage = ({ posts }: any) => {
  return (
    <>
      <Meta title="Changelog" />
      <Box mb="base-loose">
        <Title mt="72px" color="white" as="h1" fontSize="36px">
          Changelog
        </Title>
        <Section minHeight="600px">
          <Box
            css={(theme: Theme) =>
              css({
                '* + h1, * + h2, * + h3, * + h4, * + h5, * + h6': {
                  marginTop: '50px',
                },
              })(theme)
            }
            p="extra-loose"
          >
            {posts.map((post: any, index: number) => {
              return (
                <Flex width="100%" key={index}>
                  <Flex flexShrink={0} justifyContent="flex-end" width="125px">
                    <Title color={color('text-caption')}>{dayjs().to(post.data.date)}</Title>
                  </Flex>
                  <Box px="extra-loose" flexGrow={1} width="100%">
                    {hydrate(post.content, { components })}
                  </Box>
                  <Flex
                    display={['none', 'none', 'none', 'flex']}
                    flexShrink={0}
                    flexGrow={1}
                    justifyContent="flex-end"
                    width="125px"
                  />
                </Flex>
              );
            })}
          </Box>
        </Section>
      </Box>
    </>
  );
};

export async function getStaticProps() {
  const POSTS = path.join(process.cwd(), 'src', 'pages', 'changelog', 'entries');
  const postFilePaths = fs.readdirSync(POSTS).filter(path => /\.mdx?$/.test(path));

  const posts = await Promise.all(
    postFilePaths.map(async filePath => {
      const source = fs.readFileSync(path.join(POSTS, filePath));
      const { content, data } = matter(source);

      const mdxSource = await renderToString(content, {
        components,
        mdxOptions: {
          remarkPlugins: [remarkImages, remarkUnwrapImages],
          rehypePlugins: [rehypeImages],
        },
      });

      return {
        content: mdxSource,
        data,
        filePath,
      };
    })
  );

  return { props: { posts } };
}

export default ChangelogPage;
