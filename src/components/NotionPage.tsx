import type { ExtendedRecordMap } from 'notion-types';
import { NotionRenderer } from 'react-notion-x';
import 'react-notion-x/src/styles.css';

import 'katex/dist/katex.min.css';
import 'prismjs/themes/prism-tomorrow.css';

const CustomLinks = (baseUrl: string, pageMap: Record<string, string>) => {
  if(!baseUrl.endsWith('/')) {
    baseUrl += '/';
  }
  return ({ href, children }: {href: string, children: any}) => {
    const slug = href.slice(1); // Remove the leading slash
    if (pageMap[slug]) {
      href = baseUrl + pageMap[slug];
    }
    return (
      <a className="notion-page-link notion-block-1c5c36f95168808a9eead735aa66433f" href={href}>
        {children}
      </a>
    );
  };
}

interface NotionPageProps {
  page: ExtendedRecordMap;
  pageMap: Record<string, string>;
  baseUrl: string;
}

export const NotionPage:React.FC<NotionPageProps> = ({page, pageMap, baseUrl}) => {
  return (
    <NotionRenderer recordMap={page} fullPage={true} disableHeader={true}
      components={{
        PageLink: CustomLinks(baseUrl, pageMap),
      }}
      />
  );
}