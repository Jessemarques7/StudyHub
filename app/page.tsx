import Link from "next/link";

export default function Home() {
  return (
    <div className="">
      <main className="">
        <ul>
          <li>
            <Link href={"/notes"}>Notes</Link>
          </li>
        </ul>
        <div></div>
      </main>
    </div>
  );
}
