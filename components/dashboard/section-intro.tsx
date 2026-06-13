import { SECTION_PURPOSE } from "@/lib/copy";
import type { Section } from "@/lib/os";

// Plain-language purpose line rendered under each section title (Addendum 13 §2). One sentence
// telling a first-time viewer what the screen is for; the optional emphasis clause reads bolder.
export function SectionIntro({ section }: { section: Section }) {
  const purpose = SECTION_PURPOSE[section];
  if (!purpose) return null;
  return (
    <p className="mb-5 max-w-3xl text-sm leading-relaxed text-muted-foreground">
      {purpose.text}
      {purpose.emphasis && (
        <>
          {" "}
          <span className="font-semibold text-foreground">{purpose.emphasis}</span>
        </>
      )}
    </p>
  );
}
