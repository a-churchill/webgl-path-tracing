import classNames from "classnames";
import React from "react";

import styles from "./Page.module.css";

interface Props {
  children: React.ReactNode;
  className?: string;
}

export default function Page(props: Props) {
  return (
    <div className={classNames(styles.page, props.className)}>
      {props.children}
    </div>
  );
}
