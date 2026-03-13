import { Instagram, Twitter, Linkedin, ExternalLink } from 'lucide-react';

const CURRENT_YEAR = new Date().getFullYear();
const WEBSITE_URL = 'https://aseathletics.com';
const SOCIAL = {
  instagram: 'https://instagram.com/aseathletics',
  twitter: 'https://twitter.com/aseathletics',
  linkedin: 'https://linkedin.com/company/aseathletics',
};

function Footer() {
  return (
    <footer className="app-footer" role="contentinfo">
      <div className="app-footer-inner">
        <p className="app-footer-copy">
          © {CURRENT_YEAR} ASE Athletics. Todos los derechos reservados.
        </p>
        <div className="app-footer-links">
          <a
            href={WEBSITE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="app-footer-link"
          >
            <ExternalLink size={16} aria-hidden />
            <span>Web</span>
          </a>
          <a
            href={SOCIAL.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="app-footer-link"
            aria-label="Instagram"
          >
            <Instagram size={18} />
          </a>
          <a
            href={SOCIAL.twitter}
            target="_blank"
            rel="noopener noreferrer"
            className="app-footer-link"
            aria-label="Twitter"
          >
            <Twitter size={18} />
          </a>
          <a
            href={SOCIAL.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="app-footer-link"
            aria-label="LinkedIn"
          >
            <Linkedin size={18} />
          </a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
