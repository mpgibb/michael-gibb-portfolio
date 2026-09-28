import Link from "next/link";

export function Header() {
  return (
    <header className="site-header">
      <div className="shell header-inner">
        <Link className="wordmark" href="/">
          Michael P. Gibb<span>, Ph.D.</span>
        </Link>
        <nav aria-label="Main navigation">
          <Link href="/#work">Research</Link>
          <Link href="/#approach">Approach</Link>
          <Link href="/#about">Leadership</Link>
          <Link href="/#contact">Contact</Link>
        </nav>
      </div>
    </header>
  );
}
export function Footer() {
  return (
    <footer className="site-footer">
      <div className="shell footer-inner">
        <div>
          <strong>Michael P. Gibb, Ph.D.</strong>
          <p>Chicago, Illinois</p>
        </div>
        <div>
          <a href="mailto:mike@michaelpgibb.com">mike@michaelpgibb.com</a>
          <p>
            <a
              href="https://www.linkedin.com/in/mp-gibb/"
              target="_blank"
              rel="noreferrer"
            >
              Connect on LinkedIn <span aria-hidden="true">↗</span>
            </a>
          </p>
        </div>
        <p className="footer-note">Statistical depth. Practical decisions.</p>
      </div>
    </footer>
  );
}
