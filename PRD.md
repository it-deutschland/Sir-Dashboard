# Sir Dashboard - Security Awareness & Monitoring Platform

A comprehensive security awareness dashboard with a distinctive hacker-inspired aesthetic, providing educational security insights and monitoring capabilities for web application security best practices.

**Experience Qualities**:
1. **Authoritative** - Commands respect through bold visual design and comprehensive security information presentation
2. **Technical** - Appeals to security professionals with detailed categorization and technical terminology
3. **Immersive** - Creates an authentic "command center" atmosphere through cohesive hacker-themed styling

**Complexity Level**: Complex Application (advanced functionality, likely with multiple views)
This is a multi-view security dashboard with user authentication, role-based access (owner-only account creation), multiple security scanning categories, detailed scan configurations, and persistent data management across sessions.

## Essential Features

### User Authentication & Authorization
- **Functionality**: Secure login system with owner-only account creation privileges
- **Purpose**: Protect sensitive security data and limit account creation to authorized owners
- **Trigger**: User navigates to dashboard or attempts restricted action
- **Progression**: Login screen → Credential validation → Dashboard access (or owner panel for account creation)
- **Success criteria**: Only authenticated users access dashboard; only owners can create accounts

### Security Scanner Categories
- **Functionality**: Organized display of security scanning categories (Vulnerability Assessment, Configuration Analysis, Advanced Categories with OWASP ZAP/Burp Suite/Qualys features)
- **Purpose**: Provide comprehensive security monitoring across multiple vectors
- **Trigger**: User selects category from navigation
- **Progression**: Dashboard view → Category selection → Detailed scanner options → Configuration panel
- **Success criteria**: All security categories accessible and configurable

### Scan Configuration & Execution
- **Functionality**: Configure and simulate security scans with various options (targets, scan types, depth)
- **Purpose**: Allow users to customize security assessments for their needs
- **Trigger**: User initiates new scan from category
- **Progression**: Select scan type → Configure parameters → Execute scan → View results
- **Success criteria**: Scans are configurable, save settings, and display mock results

### Results Dashboard
- **Functionality**: Display scan history, findings, severity levels, and recommendations
- **Purpose**: Centralize security findings for review and action
- **Trigger**: Scan completes or user views history
- **Progression**: Results list → Detailed finding → Remediation guidance
- **Success criteria**: Clear presentation of vulnerabilities with actionable insights

### Owner Administration Panel
- **Functionality**: Create user accounts, manage permissions, view audit logs
- **Purpose**: Allow owners to control access and monitor usage
- **Trigger**: Owner accesses admin section
- **Progression**: Admin panel → Create user form → Account created → Credentials displayed
- **Success criteria**: Only owners access this; accounts are created and persisted

## Edge Case Handling
- **Empty Scan History**: Display "No scans yet" state with call-to-action to run first scan
- **Invalid Login**: Show error message with helpful guidance, prevent brute force with rate limiting UI feedback
- **Non-owner Account Creation Attempt**: Redirect with "Unauthorized" message
- **Network Simulation Delays**: Show loading states with progress indicators during scan execution
- **Concurrent Scans**: Queue system or prevent multiple simultaneous scans with clear messaging

## Design Direction
The design should evoke a **high-tech security operations center** - think terminal interfaces, matrix-style aesthetics, and command-line inspiration. Users should feel like elite security professionals operating sophisticated scanning infrastructure. The interface balances technical credibility with usability through clear hierarchies and purposeful use of hacker motifs (monospace fonts, green-on-black terminals, ASCII art accents, hexadecimal references).

## Color Selection
A bold, high-contrast hacker aesthetic using terminal-inspired colors with vibrant accent highlights.

- **Primary Color**: Matrix Green `oklch(0.75 0.20 145)` - Evokes classic terminal interfaces and communicates technical expertise
- **Secondary Colors**: 
  - Deep Black `oklch(0.12 0 0)` - Foundation for terminal-style backgrounds
  - Charcoal `oklch(0.20 0 0)` - Card backgrounds with subtle elevation
  - Neon Cyan `oklch(0.70 0.15 195)` - Secondary actions and informational elements
- **Accent Color**: Electric Lime `oklch(0.85 0.22 130)` - Critical alerts, CTAs, and active states demand attention
- **Foreground/Background Pairings**:
  - Background (Deep Black #1a1a1a): Matrix Green text (#5eff5e) - Ratio 9.2:1 ✓
  - Card (Charcoal #2d2d2d): Matrix Green text (#5eff5e) - Ratio 8.1:1 ✓
  - Primary (Matrix Green #5eff5e): Deep Black text (#1a1a1a) - Ratio 9.2:1 ✓
  - Accent (Electric Lime #c4ff5e): Deep Black text (#1a1a1a) - Ratio 12.5:1 ✓

## Font Selection
Typefaces that communicate technical precision and command-line authenticity while maintaining excellent readability.

- **Primary**: JetBrains Mono - Authentic monospace font used in developer tools, perfect for the hacker aesthetic
- **Secondary**: Space Grotesk - Modern geometric sans-serif for UI elements and headings, provides contrast to monospace

**Typographic Hierarchy**:
- H1 (Page Titles): Space Grotesk Bold / 32px / tight tracking (-0.02em)
- H2 (Section Headers): Space Grotesk SemiBold / 24px / normal tracking
- H3 (Subsections): Space Grotesk Medium / 18px / normal tracking
- Body (Content): JetBrains Mono Regular / 14px / relaxed leading (1.6)
- Code/Terminal: JetBrains Mono Regular / 13px / monospace leading (1.5)
- Small (Labels): JetBrains Mono Regular / 12px / normal tracking

## Animations
Animations should reinforce the "live system" feeling of a security operations center - subtle scanning effects, data streaming in, status updates pulsing. Balance between functional feedback (button states, loading indicators) and atmospheric details (terminal cursor blinks, scan progress bars, glitch effects on transitions). Keep transitions quick (200-300ms) to maintain the snappy feel of command-line tools, but add strategic delays to simulate "processing" during scans for realism.

## Component Selection

**Components**:
- **Tabs** (shadcn): Navigate between scanner categories (Vulnerability Assessment, Configuration, Advanced)
- **Card** (shadcn): Container for scan configurations, results, and category groupings
- **Table** (shadcn): Display scan history, findings list, vulnerability details
- **Dialog** (shadcn): Scan configuration modals, account creation forms, detailed result views
- **Button** (shadcn): Primary actions (Start Scan, Create Account) with variants for danger zones
- **Input** (shadcn): Form fields for scan targets, user credentials, search filters
- **Select** (shadcn): Dropdown for scan types, severity filters, category selection
- **Badge** (shadcn): Severity indicators (Critical, High, Medium, Low), status tags (Running, Complete)
- **Progress** (shadcn): Scan execution progress bars
- **Accordion** (shadcn): Expandable vulnerability details and remediation steps
- **Switch** (shadcn): Toggle advanced scan options
- **Separator** (shadcn): Visual division between dashboard sections
- **ScrollArea** (shadcn): Scrollable terminal output and long result lists

**Customizations**:
- **Terminal Display Component**: Custom component mimicking terminal output for scan logs and real-time updates
- **Scan Progress Indicator**: Custom animated component showing active scanning with rotating status messages
- **ASCII Logo Header**: Custom component featuring Sir Dashboard branding in ASCII art style

**States**:
- Buttons: Default (matrix green border), Hover (filled matrix green bg), Active (brighter glow), Disabled (dimmed 50% opacity)
- Inputs: Default (cyan border), Focus (bright cyan glow with ring), Error (red border with shake animation), Success (green border)
- Cards: Default (charcoal bg), Hover (subtle green border glow on interactive cards), Active (green left border accent)
- Scan Status: Idle (gray), Running (animated green pulse), Complete (solid green), Failed (red with warning icon)

**Icon Selection**: 
- Terminal (command line access)
- ShieldCheck (security status)
- Bug (vulnerability findings)
- Lightning (quick scan)
- Lock (authentication)
- User (account management)
- Warning (alerts and critical items)
- CaretRight (navigation and expansion)
- MagnifyingGlass (search/scan initiation)

**Spacing**:
- Section padding: p-6 to p-8
- Card internal padding: p-4 to p-6
- Component gaps: gap-4 (default), gap-6 (major sections)
- Form field spacing: space-y-4
- Grid layouts: gap-4 for dense data, gap-6 for cards

**Mobile**:
- Tabs transform to vertical stacked navigation with hamburger menu
- Table converts to card-based list view with expandable rows
- Two-column layouts stack to single column below 768px
- Reduce heading sizes by 20% on mobile
- Touch targets minimum 44px for all interactive elements
- Sticky header with navigation drawer for mobile scanning access
