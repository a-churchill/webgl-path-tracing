import Image from "next/image";

import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      Created by{" "}
      <a
        href="https://achurchill.io/"
        target="_blank"
        rel="noopener noreferrer"
      >
        <Image
          className={styles.logo}
          src="/andrew-churchill.jpg"
          alt="Picture of author"
          width={24}
          height={24}
        />
      </a>
    </footer>
  );
}
