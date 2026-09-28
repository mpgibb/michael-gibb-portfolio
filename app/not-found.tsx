import Link from "next/link";
import { Header, Footer } from "@/components/portfolio";
export default function NotFound() {
  return (
    <>
      <Header />
      <main tabIndex={-1} id="main" className="shell section">
        <p className="eyebrow">PAGE NOT FOUND</p>
        <h1>This page isn’t available.</h1>
        <p>Explore the current research projects.</p>
        <Link className="text-link" href="/#work">
          Return to selected work
        </Link>
      </main>
      <Footer />
    </>
  );
}
