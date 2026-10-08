# Scholarships and financial aid review

Added supporting funding links beside hero and closing application actions, a bordered card beside program costs, and an expanded native funding FAQ. Application links retain the official destination and red primary styling; information signup retains existing secondary styling. Funding uses text links. Mobile follows application, information, funding order.

Source checked October 8, 2026: https://www.eng.ufl.edu/undergraduate/programs-and-partnerships/international-programs/resources-and-funding/

The official resource loaded successfully and lists $1,000–$2,000 awards for undergraduate engineering students, UFIC summer scholarships, financial aid, and external opportunities. It lists October 15 and February 15 scholarship deadlines without a cycle year. Summer 2027 applicability was not explicitly confirmed, so award amounts and scholarship deadlines are omitted from the site. No temporary banner is included. The existing February 1, 2027 program application deadline is preserved.

All four added funding links use the exact official URL, a new tab, and noopener noreferrer. Existing aid, application, information, and guide destinations are preserved. No dependencies or deployment configuration changed.

Validation: Prettier check, git diff --check, JavaScript syntax checks, four signup server tests, and responsive/browser checks. Browser results and captures are in docs/scholarships; CHECK_OUTPUT_DIR keeps existing verification artifacts untouched. Initial restricted browser run could not load YouTube thumbnails; network-enabled rerun uses real thumbnails.

The static site has no build or separate lint/type-check scripts. Automated browser checks include WCAG A/AA axe, overflow at 1440/820/390/320px, native FAQ keyboard operation, funding link attributes, CTA order and application styling, and existing signup/media behavior. No merge or deployment is authorized.
