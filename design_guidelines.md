# Smart Task Planner - Design Guidelines

## Design Approach
**System:** Material Design 3 + Custom Glassmorphism** - Data-rich productivity application with strong visual feedback and modern aesthetic inspired by the provided screenshots. The design emphasizes visual hierarchy, gradient accents, and glass-morphic effects for a premium SaaS feel.

## Color Palette

### Primary Colors
- **Header Gradient:** 257 78% 62% → 191 91% 44% (Purple to Cyan)
- **Primary Actions:** 258 90% 66% → 257 78% 62% (Purple-blue gradient)
- **Sidebar:** 222 47% 11% → 222 84% 5% (Dark slate gradient)
- **Accent Cyan:** 191 91% 44%
- **Success:** 142 76% 45%
- **Warning:** 38 92% 50%
- **Danger:** 0 84% 60%

### Surface Colors
- **Card Backgrounds:** White with subtle colored tints (5% opacity overlays of purple, blue, yellow, cyan)
- **Main Content:** 210 40% 98% (Very light slate)
- **Text Primary:** 220 13% 13% on light / White on dark
- **Text Secondary:** 215 16% 47%

## Typography
- **Headings:** Inter/Poppins, 600-700 weight, sizes: 32px (h1), 24px (h2), 20px (h3), 18px (h4)
- **Body:** Inter, 400 weight, 16px base, 1.5 line height
- **Labels/Captions:** Inter, 500 weight, 12-14px
- **Monospace:** For time estimates, dates, and technical data
- **High contrast ratios maintained (WCAG AA minimum)**

## Layout System
**Spacing Primitives:** Tailwind units of 2, 4, 6, 8, 12, 16, 20, 24, 32 (p-2, p-4, p-8, etc.)

### Structure
- **Header:** Fixed, 64px height, full-width gradient
- **Sidebar:** 240px width (desktop), dark background, fixed position
- **Main Content:** Flexible, white/light background, 24px padding
- **Grid System:** 12-column responsive grid with 24px gaps

## Component Library

### Cards (Plan Cards)
- **Style:** White background, rounded-2xl, shadow-lg on hover
- **Dimensions:** Consistent height (180-200px), flexible width
- **Elements:** Status icon (top-right), title (center-top), progress text, gradient progress bar (bottom)
- **Hover:** Lift effect (translate-y-[-4px]), shadow-2xl
- **Progress Bar:** 6px height, rounded-full, gradient fill matching card theme

### Navigation
- **Sidebar Items:** 40px height, rounded-lg on hover, icon + text layout
- **Active State:** Accent color background (cyan/purple), white text
- **Header Actions:** Icon buttons (32px), circular, subtle hover background

### Buttons
- **Primary:** Purple-blue gradient, rounded-lg, 40-44px height, semibold text
- **Secondary:** White background, purple border, hover gradient
- **Outline on Images:** Backdrop-blur-md, semi-transparent white background, no hover interactions (inherits Button defaults)

### Form Elements
- **Inputs:** Rounded-lg, 44px height, border-gray-300, focus:border-purple-500
- **Textarea:** Rounded-lg, minimum 120px height, resize-y
- **Dropdowns:** Rounded-lg, chevron icon, smooth dropdown animation
- **Multi-select Chips:** Pill-shaped (rounded-full), purple/cyan background, white text, removable

### Data Visualization
- **Gantt Chart:** Recharts library, purple gradient line, white card container, axis labels, zoom controls
- **Kanban Columns:** 300px width, subtle background tint, draggable cards
- **Progress Indicators:** Circular (32-48px) or linear bars with gradient fills
- **Calendar:** Monthly grid, colored dots for tasks, purple accent for today

### Badges & Tags
- **Status:** Pill-shaped, 6px height, color-coded (green=complete, yellow=in-progress, red=overdue)
- **Priority:** High (red), Medium (yellow), Low (green), semibold text, 20px height
- **Category:** Colored border-left (4px), white background, icon + text

## Visual Style

### Glassmorphism Effects
- **Primary Cards:** backdrop-blur-xl, bg-white/80, border border-white/20
- **Gradient Halos:** Blurred purple/cyan gradients behind important elements (absolute positioned, -z-10, blur-3xl)
- **Overlay Modals:** backdrop-blur-md, bg-black/20

### Shadows & Depth
- **Card Default:** shadow-lg (0 10px 15px -3px rgb(0 0 0 / 0.1))
- **Card Hover:** shadow-2xl (0 25px 50px -12px rgb(0 0 0 / 0.25))
- **Modals:** shadow-2xl with backdrop
- **Floating Actions:** shadow-xl

### Animations
- **Card Entrance:** Stagger fade-in + slide-up (100ms delay between cards)
- **Modal Open/Close:** Scale + fade (duration-300)
- **View Transitions:** Smooth crossfade between List/Kanban/Calendar (duration-500)
- **Progress Updates:** Animated bar fills (duration-700, ease-out)
- **Confetti:** On phase completion (framer-motion)
- **Loading:** Pulse skeletons matching component shapes

## Images
**Hero Section:** No dedicated hero image - Goal input uses centered glassmorphic card with gradient halos
**Dashboard Icons:** Use lucide-react icons (24px) for plan categories with colored backgrounds
**Template Gallery:** Category icons (48px) with gradient backgrounds in modal cards
**Visualization Placeholders:** Chart/graph components (Recharts), no static images

## Accessibility
- **Keyboard Navigation:** Full support with visible focus rings (ring-2 ring-purple-500)
- **Screen Readers:** ARIA labels on all interactive elements, semantic HTML
- **Color Contrast:** All text meets WCAG AA (4.5:1 minimum)
- **Focus Indicators:** 2px purple ring, 2px offset
- **Skip Links:** "Skip to main content" for keyboard users

## Responsive Behavior
- **Desktop (1280px+):** Full sidebar, 3-column plan grid, side-by-side Gantt + Kanban
- **Tablet (768-1279px):** Collapsible sidebar, 2-column grid, stacked charts
- **Mobile (<768px):** Hamburger menu, 1-column grid, swipeable views, bottom navigation (Dashboard, Active, Calendar, Profile)
- **Touch Targets:** Minimum 44px for mobile interactions
- **Swipe Gestures:** Right=complete task, Left=delete task

## Special Features
- **Advanced Options Panel:** Collapsible with smooth slide-down animation, chevron rotation, badge showing "(Optional)"
- **PDF Export Modal:** Full-screen overlay, format radio buttons, content checkboxes, live preview pane
- **Bulk Actions:** Multi-select mode with checkbox overlays, floating action bar at bottom
- **Inline Editing:** Click-to-edit with auto-save, "Saved" toast notification
- **Dependency Visualization:** Arrows connecting tasks in Timeline view, tooltip on hover