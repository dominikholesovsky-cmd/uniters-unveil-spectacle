import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowUp } from "lucide-react";

const BackToTop = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 500);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <Button
      onClick={scrollToTop}
      size="icon"
      variant="hero"
      aria-label="Zpět nahoru"
      className={`fixed bottom-8 right-8 z-50 rounded-full shadow-2xl bg-white/80 text-black/90
        transform transition-all duration-300
        ${isVisible ? "opacity-100 scale-100" : "opacity-0 scale-75 pointer-events-none"}
        hover:scale-110 hover:shadow-3xl
        mix-blend-difference`}
    >
      <ArrowUp className="w-5 h-5" />
    </Button>
  );
};

export default BackToTop;
