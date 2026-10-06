# TaskProof Design System

TaskProof utilizes a custom "Premium Glassmorphism" aesthetic designed to convey trust, professionalism, and modern technical innovation.

## Core Identity
- **Primary Color**: Cobalt Blue (`#1A4B8F`) - Used for primary actions, branding, and emphasis. Conveys trust, corporate security, and stability.
- **Accent Color**: Polished Silver (`#E6E9EF`) - Used for backgrounds, borders, and subtle structural elements.
- **Secondary Colors**:
  - Success (Green): `#16A34A` - Used for approvals, completed tasks, and positive verification.
  - Warning (Orange): `#D97706` - Used for pending states, reviews, and alerts.
  - Danger (Red): `#DC2626` - Used for rejections and destructive actions.

## Typography
- **Font Family**: Inter (sans-serif)
- Heavy use of font weights (Medium, Bold, Black) to create distinct visual hierarchy and structural clarity.

## Visual Effects & Components
### Glassmorphism (`.glass-card`)
The core structural component for the application. It uses a semi-transparent white background over a very subtle colored backdrop with a specific shadow profile to create depth without looking cluttered.
- Background: `rgba(255, 255, 255, 0.85)`
- Backdrop Blur: `12px`
- Border: `1px solid rgba(255, 255, 255, 0.6)`
- Shadow: `0 8px 32px rgba(15, 23, 42, 0.06)`

### Buttons
- **Primary**: Solid Cobalt Blue with a slight inner shadow and hover lift effect.
- **Secondary**: White background with Polished Silver border, text in Cobalt Blue.
- **Ghost**: Transparent background, text in slate, turns subtle blue on hover.

### Badges
Used heavily to indicate status, difficulty, and rewards. Always use soft pastel backgrounds with stark, saturated text colors for high legibility (e.g., light green background `#DCFCE7` with dark green text `#16A34A`).

## Layout Strategy
- **App Shell**: Persistent left sidebar for primary navigation, top bar for context (breadcrumbs/titles).
- **Max-Width Containers**: Page content is constrained (e.g., `max-w-4xl`) to ensure readability and a clean centered aesthetic on wide screens.
- **Whitespace**: Generous padding and margins (`gap-4`, `p-6`) are used to let components breathe and feel premium.
