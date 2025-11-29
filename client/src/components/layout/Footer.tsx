import { Link } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  MapPin,
  Phone,
  Mail,
} from "lucide-react";

export function Footer() {
  const { t, language, setLanguage } = useLanguage();

  const categories = [
    { name: "Maids", nameHi: "मेड", slug: "maid" },
    { name: "Drivers", nameHi: "ड्राइवर", slug: "driver" },
    { name: "Cooks", nameHi: "कुक", slug: "cook" },
    { name: "Security Guards", nameHi: "सिक्योरिटी गार्ड", slug: "security" },
    { name: "Factory Workers", nameHi: "फैक्ट्री वर्कर", slug: "factory" },
  ];

  const areas = [
    { name: "Mansarovar", nameHi: "मानसरोवर", slug: "mansarovar" },
    { name: "Sitapura", nameHi: "सीतापुरा", slug: "sitapura" },
    { name: "Malviya Nagar", nameHi: "मालवीय नगर", slug: "malviya-nagar" },
    { name: "Vaishali Nagar", nameHi: "वैशाली नगर", slug: "vaishali-nagar" },
    { name: "C-Scheme", nameHi: "सी-स्कीम", slug: "c-scheme" },
  ];

  return (
    <footer className="bg-card border-t">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-primary-foreground font-bold text-xl">
                JH
              </div>
              <span className="font-semibold text-xl">JaipurHelp</span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-xs">
              {t("footer.tagline")}
            </p>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" asChild>
                <a href="#" aria-label="Facebook" data-testid="link-facebook">
                  <Facebook className="h-4 w-4" />
                </a>
              </Button>
              <Button variant="ghost" size="icon" asChild>
                <a href="#" aria-label="Twitter" data-testid="link-twitter">
                  <Twitter className="h-4 w-4" />
                </a>
              </Button>
              <Button variant="ghost" size="icon" asChild>
                <a href="#" aria-label="Instagram" data-testid="link-instagram">
                  <Instagram className="h-4 w-4" />
                </a>
              </Button>
              <Button variant="ghost" size="icon" asChild>
                <a href="#" aria-label="LinkedIn" data-testid="link-linkedin">
                  <Linkedin className="h-4 w-4" />
                </a>
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-sm uppercase tracking-wider">
              {t("categories.title")}
            </h3>
            <ul className="space-y-2">
              {categories.map((cat) => (
                <li key={cat.slug}>
                  <Link
                    href={`/search?category=${cat.slug}`}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    data-testid={`link-category-${cat.slug}`}
                  >
                    {language === "en" ? cat.name : cat.nameHi}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-sm uppercase tracking-wider">
              {t("areas.title")}
            </h3>
            <ul className="space-y-2">
              {areas.map((area) => (
                <li key={area.slug}>
                  <Link
                    href={`/search?area=${area.slug}`}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    data-testid={`link-area-${area.slug}`}
                  >
                    {language === "en" ? area.name : area.nameHi}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-sm uppercase tracking-wider">
              {t("footer.support")}
            </h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 shrink-0" />
                <span>Jaipur, Rajasthan, India</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4 shrink-0" />
                <span>+91 98765 43210</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4 shrink-0" />
                <span>support@jaipurhelp.in</span>
              </li>
            </ul>
            <div className="flex gap-2">
              <Button
                variant={language === "en" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setLanguage("en")}
              >
                English
              </Button>
              <Button
                variant={language === "hi" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setLanguage("hi")}
              >
                हिंदी
              </Button>
            </div>
          </div>
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} JaipurHelp. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-foreground transition-colors">
              {t("footer.privacy")}
            </Link>
            <Link href="/terms" className="hover:text-foreground transition-colors">
              {t("footer.terms")}
            </Link>
            <Link href="/faq" className="hover:text-foreground transition-colors">
              {t("footer.faq")}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
