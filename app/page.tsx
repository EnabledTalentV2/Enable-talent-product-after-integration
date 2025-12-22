
import Link from "next/link";

export default function Home() {
  return (
    <>
      <Link href="/signup">Sign up</Link>
      <Link href="/login">Log in</Link>
    <p>Hello from home page</p></>
  );
}
