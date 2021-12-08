import classNames from "classnames";
import Page from "components/Page";

import styles from "./Content.module.css";
import ScrollIndicator from "./ScrollIndicator";

export default function TitlePage() {
  return (
    <Page className={classNames(styles.primaryPage, styles.alignRight)}>
      <h1 className={styles.title}>Path Tracing</h1>

      <h2 className={styles.description}>
        Realistic renders of complex scenes using Monte Carlo simulations
      </h2>

      <ScrollIndicator pageNumber={1} />
    </Page>
  );
}
