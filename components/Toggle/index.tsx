import { default as AtlaskitToggle } from "@atlaskit/toggle";

import styles from "./Toggle.module.css";

interface Props {
  isChecked: boolean | undefined;
  onChange: (checked: boolean) => void;
  label: string;
  description: string;
}

export default function Toggle(props: Props) {
  return (
    <div className={styles.toggle}>
      <AtlaskitToggle
        label={props.label}
        isChecked={props.isChecked}
        isDisabled={props.isChecked === undefined}
        onChange={(e) => props.onChange(e.target.checked)}
      />
      <div className={styles.label}>{props.label}</div>
      <div className={styles.break} />
      <div className={styles.description}>{props.description}</div>
    </div>
  );
}
