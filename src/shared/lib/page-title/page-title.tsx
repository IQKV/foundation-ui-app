import { Helmet } from "@dr.pogodin/react-helmet";
import { APP_TITLE } from "./constants";

interface PageTitleProps {
  /** Title segments from most-specific (leaf) to least-specific (section). */
  segments: string[];
  /** Override the rightmost app-name segment. */
  appTitle?: string;
}

export function PageTitle({ segments, appTitle = APP_TITLE }: PageTitleProps) {
  const title = [...segments, appTitle].join(" | ");
  return (
    <Helmet>
      <title>{title}</title>
    </Helmet>
  );
}
