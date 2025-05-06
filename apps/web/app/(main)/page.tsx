import Image, { type ImageProps } from "next/image";
import { POETRY_TYPE_MAP } from '@repo/common';
import { Button } from "@/components/ui/button"
import { Button as RepoButton } from "@repo/ui/button"
import styles from "./page.module.css";
import { TEXTS } from "@/lib/texts";

type Props = Omit<ImageProps, "src"> & {
  srcLight: string;
  srcDark: string;
};

const ThemeImage = (props: Props) => {
  const { srcLight, srcDark, ...rest } = props;

  return (
    <>
      <Image {...rest} src={srcLight} className="imgLight" />
      <Image {...rest} src={srcDark} className="imgDark" />
    </>
  );
};

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h1 className="text-3xl font-bold underline">
          {TEXTS.page.loginTitle}
        </h1>
        <h1 className="text-3xl font-bold underline">
          {TEXTS.page.registerTitle}
        </h1>
        <Button>{TEXTS.page.submit}</Button>
        <h1>诗词库</h1>
        <ul>
          {Object.entries(POETRY_TYPE_MAP).map(([key, value]) => (
            <li key={key}>{value}</li>
          ))}
        </ul>
        <ThemeImage
          className={styles.logo}
          srcLight="turborepo-dark.svg"
          srcDark="turborepo-light.svg"
          alt="Turborepo logo"
          width={180}
          height={38}
          priority
        />
        <ol>
          <li>
            Get started by editing <code>apps/web/app/page.tsx</code>
          </li>
          <li>Save and see your changes instantly.</li>
        </ol>
      </main>
      <footer className={styles.footer}>
        <a
          href="https://vercel.com/templates?search=turborepo&utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/window.svg"
            alt="Window icon"
            width={16}
            height={16}
          />
          Examples
        </a>
        <a
          href="https://turborepo.com?utm_source=create-turbo"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/globe.svg"
            alt="Globe icon"
            width={16}
            height={16}
          />
          Go to turborepo.com →
        </a>
      </footer>
    </div>
  );
}
