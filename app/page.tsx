import Link from "next/link";

export default function Home() {
  return (
    <div className="">
      <main className="">
        <ul>
          <li>
            <Link href={"/notes"}>Notes</Link>
          </li>
          <li>
            <Link href={"/flashcards"}>Flashcards</Link>
          </li>
          <li>
            <Link href={"/diagram"}>Diagram</Link>
          </li>
        </ul>
        <div></div>
      </main>
    </div>
  );
}
