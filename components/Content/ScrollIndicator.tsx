import styles from "./Content.module.css";

interface Props {
  pageNumber: number;
}

export default function ScrollIndicator(props: Props) {
  return (
    <button
      className={styles.scrollIndicator}
      onClick={() =>
        window.scrollTo({
          behavior: "smooth",
          top: props.pageNumber * window.innerHeight + 1,
        })
      }
    >
      Continue
      <div className={styles.arrow}>↓</div>
    </button>
  );
}
