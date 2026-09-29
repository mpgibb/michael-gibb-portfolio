import Link from "next/link";
import { PersistentHeader } from "./persistent-header";
import { SkylineMark } from "./skyline-mark";
import { SiteNavigation } from "./site-navigation";

export function Header() {
  return (
    <PersistentHeader>
      <div className="shell header-inner">
        <Link className="wordmark" href="/" aria-label="Michael P. Gibb, Ph.D. — Home">
          <SkylineMark />
          <span className="wordmark-type"><span className="wordmark-name">Michael P. Gibb,<span className="wordmark-credential"> Ph.D.</span></span>
            <span className="wordmark-tagline">Analytics <span>•</span> AI <span>•</span> Leadership</span>
          </span>
        </Link>
        <SiteNavigation />
      </div>
    </PersistentHeader>
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
