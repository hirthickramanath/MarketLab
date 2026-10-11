# MASTER BUILD PROMPT — AI-Powered Global Stock Market Learning & Trading Simulator

You are a senior full-stack software engineer, fintech system architect, expert UI/UX designer, motion graphics developer, and quality assurance engineer.

Build a complete, production-oriented, visually outstanding web application for learning about real stock markets through virtual-money trading.

This must be a functional full-stack application, not a static landing page, mock dashboard, or collection of disconnected UI demos.

Implement all major modules, persistent data models, authentication, business logic, animations, and deployment configuration.

**Working project name:** MarketLab (make the brand name easy to change).

**Primary goal:** Help beginners understand stock markets, IPOs, financial news, trading mechanics, company fundamentals, and portfolio management through a realistic but entirely virtual environment.

No real-money trading, payments, brokerage integration, or cash withdrawals are permitted.

## 1. Development principles

- Make the application genuinely usable, not just visually attractive.
- Design for desktop first, especially the trading terminal, but make all pages responsive.
- Use sophisticated animations without compromising usability, accessibility, or performance.
- Follow modern software engineering practices and a modular architecture.
- Write clean, readable, maintainable TypeScript.
- Use secure server-side validation, authorization, and transactional database operations.
- Separate financial data retrieval, AI interpretation, order execution, and frontend rendering.
- Never fabricate real news, real prices, execution results, or company financial data.
- Clearly label illustrative data and any demonstration mode.
- Prioritize accuracy, educational value, reliability, and excellent UI.
- Do not silently omit requirements.
- If an external API or credential is unavailable, implement a working demo-data adapter, label it prominently, and document what is needed to enable real data.
- Do not stop after completing the landing page or basic dashboard.
- Complete the application module by module and test each module before declaring it finished.

## 2. Technology stack

Preferred stack:

- Next.js with App Router
- React and TypeScript
- Tailwind CSS
- shadcn/ui and Radix UI
- Framer Motion / Motion for React
- GSAP for selected cinematic timelines
- Three.js / React Three Fiber for lightweight 3D effects where appropriate
- TradingView Lightweight Charts for financial candlestick charts
- Recharts or Apache ECharts for portfolio analytics
- Supabase PostgreSQL
- Supabase Auth with secure session handling
- Supabase Row Level Security
- Zod for runtime validation
- TanStack Query where useful
- Zustand only when useful for complex client-side state
- Server-side market-data and news adapters
- An LLM provider interface for AI explanations
- Browser notifications using Web Push
- Vercel-compatible application architecture
- GitHub Actions for CI

Use stable, compatible package versions and consult current official documentation.

Do not introduce unnecessary microservices. The project should be maintainable by a small student development team.

## 3. Visual identity and design language

Create an exceptionally polished interface inspired by high-end fintech platforms, modern SaaS products, professional trading terminals, and premium interactive websites.

Do not copy an existing platform.

### Theme

Use a sophisticated light-first design with a fully implemented dark-mode toggle.

Light theme:
- Elegant off-white and cool gray surfaces
- Charcoal typography
- Deep navy and refined teal accents
- Soft shadows and careful use of translucency

Dark theme:
- Deep navy, graphite, and near-black backgrounds
- Restrained emerald and electric-cyan accents
- Subtle luminous outlines
- Carefully differentiated elevated surfaces
- Excellent readability and contrast

Use green and red consistently for market movement, with accessible alternatives that do not rely on color alone.

### Typography

Choose premium, highly readable fonts such as Inter or Geist.

Use:
- Strong heading hierarchy
- Tabular numerals for financial data
- Monospaced fonts for selected trading-terminal information
- Consistent spacing and alignment
- Responsive text scaling

### UI components

Create a coherent, reusable design system.

Include:
- Beautiful cards and panels
- Rounded surfaces where appropriate
- Premium navigation sidebar
- Elegant top navigation
- Global search with keyboard shortcut
- Command palette
- Smooth dropdowns
- Custom tooltips and contextual popovers
- Attractive modals and drawers
- Animated tabs
- Beautiful toggles, switches, sliders, and range controls
- Custom scrollbars
- Loading skeletons
- Toast notifications
- Empty states
- Error states
- Responsive tables
- Sophisticated chart controls

Avoid generic template styling.

### Motion graphics and VFX

Motion is a core requirement, not an optional decorative afterthought.

Implement meaningful, high-quality motion throughout the website:

1. Cinematic but fast initial page reveal.
2. Staggered entrance animations for cards and statistics.
3. Smooth page transitions.
4. Animated sidebar expansion and collapse.
5. Fluid layout transitions when panels resize.
6. Animated portfolio balance counters.
7. Animated financial data streams.
8. Smooth chart loading and timeframe changes.
9. Contextual glow effects for important interactions.
10. Subtle cursor-reactive depth where appropriate.
11. Elegant glass and layered-surface effects.
12. Light 3D financial illustrations in selected sections.
13. Animated financial-learning diagrams.
14. Carefully timed modal transitions.
15. Sophisticated notification animations.
16. Animated guided-tour spotlight overlays.
17. A visually impressive transition into full trading-session mode.
18. Animated results presentation at session completion.
19. Smooth hover states and responsive button feedback.
20. Graceful loading and processing transitions.

Use Three.js selectively for hero visuals or a small number of meaningful scenes. Do not make the entire dashboard WebGL-based.

Do not continuously animate critical trading controls or distract users during order entry.

Support reduced-motion preferences. Avoid flashing effects, excessive parallax, motion sickness triggers, and expensive animation loops.

Target responsive, smooth interactions and strong Core Web Vitals.

## 4. Application navigation

Create these main pages:

Public:
- Landing page
- How it works
- Features
- About the simulation
- Sign in
- Sign up

Authenticated:
- Dashboard
- Market Explorer
- Stock Details
- News Intelligence
- Learn
- Virtual Trading
- Trading Sessions
- Portfolio Analytics
- IPO Lab
- Historical Replay
- Watchlists
- Investment Journal
- Session History
- Achievements
- Leaderboards / Classroom
- Notifications
- AI Learning Assistant
- Profile and Settings

Admin-only:
- Admin Overview
- Users and Roles
- Virtual Wallet Management
- Classrooms
- Trading Rules
- Session Configuration
- Learning Content
- News and Data Sources
- Challenges
- Audit Logs
- Platform Analytics

Navigation must be clear, consistent, and responsive.

## 5. Authentication and roles

Implement authentication with Supabase Auth.

Supported roles:
- Student
- Administrator
- Optional Instructor role for future expansion

Requirements:
- Email/password authentication
- Secure authentication flow
- Password reset
- Email verification when configured
- Protected routes
- Persistent sessions
- Secure server-side authorization
- Role-based access control
- Supabase RLS policies
- Account/profile management
- User onboarding tour
- Account and classroom isolation

Never implement admin authentication using a hardcoded frontend password or client-side role checks.

Admin assignment must be controlled securely through server-side configuration or privileged operations.

## 6. Virtual currency and wallet system

Each user has a virtual wallet funded by an authorized administrator.

Features:
- Admin credits virtual funds to users
- Admin can adjust balances with documented reasons
- Detailed wallet history
- Current available cash
- Reserved cash for pending orders
- Portfolio market value
- Total account equity
- Realized and unrealized P&L
- Transaction and execution records
- Currency-aware accounting
- Optional account reset under administrative rules

Use an auditable, append-only wallet ledger.

All balance-changing operations must run in secure database transactions.

Prevent:
- Negative available balances
- Double spending
- Duplicate order execution
- Unauthorized wallet changes
- Cross-account data exposure
- Race conditions during simultaneous orders

Virtual money has no real monetary value and cannot be redeemed.

## 7. Global market support

Support real listed securities and market information from:

India:
- NSE
- BSE
- NIFTY 50
- SENSEX

United States:
- NYSE
- Nasdaq
- S&P 500
- Nasdaq-100
- Dow Jones Industrial Average

Global:
- Selected UK, European, Japanese, and other major international exchanges
- Major global market indices

Implement an extensible instrument directory with exchange identifiers, market identifiers, company names, tickers, trading currencies, and supported instrument types.

Handle symbol ambiguity across exchanges.

Show:
- Company name
- Ticker
- Exchange
- Country
- Currency
- Sector and industry
- Company description
- Latest available price
- Price change
- Historical prices
- Trading volume
- Market capitalization
- Valuation metrics when available
- Financial statements
- Dividends
- Corporate actions
- Related news

Use provider-independent market-data adapters.

Real-time data is optional where licensing prevents access. Delayed or end-of-day data is acceptable when clearly labeled.

Display data timestamps, source/provider information, market status, and delay information.

Respect exchange trading hours, market holidays, time zones, currency conversions, and corporate actions.

Never silently pretend historical, delayed, or synthetic data is live.

## 8. Market Explorer and Stock Details

Create a professional stock-discovery interface.

Features:
- Search by name or ticker
- Exchange filters
- Country filters
- Sector filters
- Market-cap filters when data is available
- Watchlist actions
- Company detail pages
- Financial ratio cards
- Related news
- Historical returns
- Comparison of multiple stocks
- Basic and advanced information views
- Market overview sections
- Top movers based on available data
- Glossary integration

Stock pages should balance beginner explanations with detailed financial information.

## 9. Professional candlestick charting

Build a full-featured interactive chart experience using TradingView Lightweight Charts.

Support:
- Candlestick charts
- Line charts
- Area charts
- OHLC information
- Volume histograms
- Multiple price timeframes when supported
- Crosshair and accurate tooltips
- Chart zooming and panning
- Responsive chart resizing
- Watchlist-to-chart navigation
- Selected indicators such as SMA, EMA, RSI, and MACD
- Basic drawing/annotation tools if feasible
- Entry and exit markers for simulated trades
- News event markers
- Session timestamps
- Currency and exchange information

Ensure all indicator calculations use valid source data.

Preserve the chart's attribution and licensing requirements.

Add a beginner guide explaining candlesticks, wicks, bodies, volume, and indicators.

Chart interaction should feel smooth and professional.

## 10. Financial news intelligence

Develop a financial news aggregation system using legally permitted feeds, reputable publishers, official regulatory announcements, and supported news APIs.

Each article must contain:
- Original headline
- Original publisher
- Clickable original source URL
- Original publication time
- Time ingested by the application
- Geographic relevance
- Related stock symbols where verified
- Related market sectors
- Original or licensed summary/excerpt where permitted
- Clearly identified AI-generated summary
- Potential market implications
- Confidence/uncertainty information
- Relevant educational concepts

Do not reproduce copyrighted full articles without authorization.

News should be grouped by:
- India
- USA
- Global
- Companies
- Sectors
- IPOs
- Central banks
- Inflation and interest rates
- Earnings announcements
- Market regulations

Implement duplicate detection and story clustering.

Clearly distinguish news facts from AI interpretations.

Avoid sensational, misleading, or unsupported trading signals.

### News notifications

Create an in-app notification center and browser push notifications.

Support:
- Important company announcements
- Watched-stock news
- IPO developments
- Major economic releases
- Earnings announcements
- Significant market events
- Classroom announcements

Include notification preferences, read/unread state, source links, deduplication, and reasonable rate limits.

Browser push must use explicit user permission.

## 11. AI-powered news analysis

AI should act as an educational financial-analysis assistant.

For every suitable news event, explain:
1. What happened?
2. Why does it matter?
3. Which sectors or companies might be affected?
4. What positive consequences are plausible?
5. What negative consequences are plausible?
6. What additional information should investors examine?
7. Which financial concepts does this event illustrate?

Provide concise and detailed explanation modes.

Use structured, verifiable source information.

The assistant must never invent prices or news events.

Do not output guaranteed predictions, definitive buy/sell instructions, or personalized investment recommendations.

Explicitly distinguish established facts, plausible scenarios, and uncertainty.

Make it possible for a student to record their own bullish, bearish, or neutral hypothesis and revisit it later.

## 12. Central feature: Timed Trading Sessions

This is one of the most important features of the entire application.

Add a prominent **Start Trading Session** button on the dashboard and trading pages.

Clicking it opens a sophisticated session-configuration experience.

### Session configuration

Users can select:
- Duration from 15 to 45 minutes
- Supported increments, initially 5 minutes
- Market region: India, USA, Global
- Session format: Live Market or Historical Replay
- Individual or classroom session
- Starting virtual capital, subject to admin configuration
- Difficulty level
- Optional learning objective

Admins can set a mandatory starting capital and supported market universe.

### Core session rules

When the user clicks Begin:

1. Create a persistent server-side session record.
2. Assign a session ID.
3. Record its start time and authoritative expiry time.
4. Allocate an isolated virtual session balance.
5. Store the exact starting capital.
6. Freeze the session's available news set.
7. Snapshot the initial market/reference-data state as applicable.
8. Open the dedicated trading terminal.
9. Start the visible countdown.
10. Preserve all orders, positions, and relevant market events.

The session starting capital must remain fixed.

Cash and equity may change due to simulated trading.

The session balance must remain separate from the user's general practice wallet unless explicitly configured otherwise.

No additional admin funding is allowed inside an active session.

### News freezing

The available news feed must be fixed when the session begins.

Do not introduce newly published news during the session.

Students can freely reread all news included at session start.

For historical replay, only reveal information that was available at the corresponding simulated market time.

Never expose future market information.

### Price behavior

Live Market sessions:
- Use the available licensed market-data stream.
- Update prices and charts when data is available.
- Respect exchange market hours.
- Identify delayed data.
- Reject or appropriately queue orders when the selected exchange is closed, according to explicit session rules.

Historical Replay sessions:
- Use chronological historical market data.
- Replay prices according to a documented simulation clock.
- Ensure all users in the same classroom competition receive equivalent information.
- Prevent future-data leakage.

The default session model must make clear whether 15–45 minutes refers to wall-clock time or replayed market time.

### Dedicated full-screen terminal

When a session begins, transition to a focused trading interface.

Display:
- Countdown timer
- Market region
- Active instrument
- Candlestick chart
- Price and volume data
- Order entry
- Buy/sell controls
- Available virtual cash
- Current equity
- Open positions
- Order history
- Transaction history
- Frozen news feed
- Watchlist
- Portfolio allocation
- Session-specific performance

Provide resizable panels on desktop.

Use a simplified, responsive layout on smaller devices.

Temporarily hide unrelated learning modules, marketing content, and ordinary dashboard notifications.

Important risk warnings and execution errors must remain visible.

No distracting pop-ups or unrelated new content during active sessions.

### Order handling

Initially support:
- Market orders
- Limit orders
- Buy and sell
- Order cancellation where appropriate
- Partial fills only where simulated execution logic supports them

Optionally implement stop-loss and stop-limit orders as advanced modules.

Define and document the simulation execution model.

The execution system must:
- Validate holdings and available funds.
- Apply configured virtual transaction costs.
- Handle order status transitions.
- Prevent duplicate fills.
- Respect trading sessions and market calendars.
- Use authoritative server-side timestamps.
- Record price provenance and fill methodology.
- Avoid unrealistic perfect fills if the data frequency cannot support them.

### Session lifecycle

Persist session state server-side.

Refreshing the browser must not reset the countdown or erase trades.

Reopening an active session must restore its current state.

Ending a session early requires confirmation.

At expiry:
- Block new orders.
- Handle pending orders according to documented rules.
- Mark all open positions to the latest valid available price.
- Preserve final holdings and cash.
- Calculate final equity and performance.
- Generate a session report.
- Transition to the results experience.

Use idempotent session finalization so reports and settlements cannot be duplicated.

## 13. Post-session analytics and AI insights

At the end of every session, generate a comprehensive visual report.

### Overview metrics

Include:
- Starting capital
- Ending cash
- Ending market value of holdings
- Total ending equity
- Total P&L
- Percentage return
- Realized P&L
- Unrealized P&L
- Number of completed trades
- Number of pending/cancelled orders
- Win/loss statistics where meaningful
- Estimated simulated fees
- Portfolio concentration
- Maximum drawdown when calculable
- Comparison with an appropriate benchmark when valid

### Visual analytics

Include:
- Equity curve
- Cash-versus-invested-capital chart
- Portfolio allocation donut
- Sector exposure breakdown
- Returns timeline
- Trade-entry/exit chart markers
- Profit/loss distribution
- Best and worst performing positions
- Session replay timeline

### AI insight report

Analyze:
- Whether trades followed the student's stated reasoning
- Which news articles influenced decisions
- Whether portfolio concentration increased
- Whether the student reacted to short-term noise
- Whether the student traded without sufficient evidence
- Whether transaction costs affected outcomes
- Which concepts should be studied next

Do not equate a profitable outcome with good reasoning or an unprofitable outcome with bad reasoning.

Separate skill assessment from randomness and short-term market movement.

### Session history

Save every session report.

Allow users to:
- Revisit previous sessions
- Compare sessions
- Review past orders
- Read AI feedback
- Track improvement over time
- Export reports as PDF
- View session achievements

Make the final transition visually memorable through elegant motion graphics and animated data visualizations.

## 14. Portfolio Analytics

Build a comprehensive portfolio analytics dashboard.

Include:
- Account equity
- Available cash
- Portfolio market value
- Total and percentage returns
- Holdings table
- Average purchase prices
- Sector diversification
- Geographic diversification
- Currency exposure
- Realized and unrealized P&L
- Dividend history when supported
- Benchmark comparisons
- Performance charts
- Risk metrics
- Transaction ledger

Use proper handling of corporate actions, currencies, and timestamps.

Never mix admin wallet credits with investment gains.

Allow educational explanations for every financial metric.

## 15. Contextual financial glossary and guided tours

Every important financial term must have a small '?' information icon or equivalent contextual help.

Examples:
- Stock
- Share
- IPO
- Market Cap
- P/E Ratio
- EPS
- Dividend
- Liquidity
- Volume
- Volatility
- Bid
- Ask
- Spread
- Market Order
- Limit Order
- Stop-Loss
- Portfolio
- Realized P&L
- Unrealized P&L
- Market Index
- ETF
- Diversification
- Revenue
- Earnings
- Balance Sheet

Clicking or focusing the icon opens a polished popover.

Each popover should offer:
- Quick definition
- Practical example
- Optional diagram
- Learn more link

Implement three explanation depths:
- Beginner
- Intermediate
- Advanced

Add interactive onboarding tours with:
- Spotlight overlays
- Animated arrows and highlights
- Next/Previous controls
- Skip and Replay Tour buttons
- Accurate positioning during scrolling
- Responsive mobile layouts
- Keyboard accessibility

Tours should cover the dashboard, portfolio, news, candlestick chart, order-entry panel, and trading session.

Do not use native browser alert dialogs for these explanations.

## 16. Financial Learning Academy

Create a structured curriculum:

Level 1: What stocks and shares are

Level 2: How stock exchanges work

Level 3: Buying, selling, and order execution

Level 4: IPOs and public listings

Level 5: Company fundamentals and financial reports

Level 6: Financial news and macroeconomics

Level 7: Portfolio management and risk

Level 8: Technical analysis and chart interpretation

Level 9: Global markets and foreign exchange

Level 10: Advanced educational market concepts

Each module should include:
- Short lessons
- Visual explanations
- Interactive examples
- Contextual definitions
- Quizzes
- Practice challenges
- Completion progress

Use animations to explain financial mechanics where useful.

Add learning achievements, but do not reward excessive risk-taking.

## 17. IPO Simulation Lab

Build a dedicated educational IPO experience.

Explain:
- Why companies go public
- The IPO process
- Prospectuses
- Issue pricing
- Application procedures
- Allotment
- Listing-day behavior
- IPO risks

Allow students to simulate IPO applications using virtual funds.

Implement clearly documented fictional or historical scenario logic rather than implying access to actual IPO allocation systems.

Track hypothetical allotment, unused funds, and subsequent simulated market performance.

## 18. Historical Market Replay

Allow users to practice against historical market situations.

Features:
- Choose a historical period
- Choose market
- Choose replay speed or session duration
- Select educational scenarios
- Freeze future information
- Reveal historical prices progressively
- Reveal relevant news at appropriate historical timestamps
- Simulate trading
- Generate post-replay analysis

Replay must not expose future prices through charts, company statistics, AI summaries, or cached endpoints.

Keep historical and live session data clearly separated.

## 19. Investment Journal

Create an AI-assisted virtual investment journal.

For every trade, users can record:
- Their investment hypothesis
- News influencing the decision
- Expected direction
- Reasoning
- Perceived risks
- Confidence
- Lessons learned

After the session, allow comparison of original expectations with observed outcomes.

Provide educational feedback on reasoning and cognitive biases.

Never label a decision objectively correct solely because the simulated trade was profitable.

## 20. Admin Dashboard

Build a fully functional administrator control center.

Admins can:
- View authorized users
- Manage student access
- Create classrooms
- Invite students
- Allocate virtual currency
- Adjust virtual balances with audit reasons
- Configure session starting capital
- Configure durations and market access
- Assign lessons
- Create educational challenges
- View student progress
- Review session reports
- Inspect trading-system activity
- Manage data-source configuration
- Monitor API integration health
- View audit logs
- Reset practice accounts where permitted

Every administrative financial adjustment must be auditable.

A student's learning performance must remain distinguishable from additional virtual funding.

## 21. Classroom and Competition Mode

Allow administrators or authorized instructors to create classrooms.

Features:
- Classroom invite codes
- Classroom membership
- Common virtual starting balance
- Scheduled educational simulations
- Fixed session rules
- Shared historical scenarios
- Instructor-facing analytics
- Student progress tracking
- Private leaderboards

Leaderboards should emphasize:
- Learning progress
- Quiz performance
- Evidence-backed reasoning
- Consistency
- Risk awareness

If performance-based rankings are shown, give appropriate context about risk and luck.

## 22. AI Learning Assistant

Provide a context-aware AI assistant across the authenticated website.

It should explain:
- Financial terms
- Company descriptions
- Financial ratios
- News developments
- Trading mechanics
- Portfolio metrics
- Historical market behavior
- Quiz answers and concepts

The assistant may reference the user's simulated portfolio and their own virtual-trading history with proper authorization.

Ground news-related answers in source material.

Mark uncertainty clearly.

Avoid fabricated citations and unsupported financial claims.

Do not expose users' private information to other users.

## 23. Data model and backend

Design normalized PostgreSQL tables for at least:

- profiles
- user_roles
- classrooms
- classroom_memberships
- virtual_accounts
- wallet_ledger
- instruments
- exchanges
- instrument_prices
- historical_ohlcv
- corporate_actions
- orders
- order_executions
- positions
- position_lots
- portfolio_valuations
- market_news
- news_sources
- news_instrument_links
- news_notifications
- watchlists
- watchlist_items
- trading_sessions
- session_instruments
- session_news_snapshots
- session_orders
- session_equity_snapshots
- session_reports
- investment_journal_entries
- learning_modules
- lessons
- quizzes
- quiz_attempts
- achievements
- admin_audit_logs

Add necessary supporting tables as appropriate.

Use proper foreign keys, indexes, unique constraints, server timestamps, and decimal/numeric types for financial values.

Do not use floating-point arithmetic for money.

Keep order execution and financial accounting authoritative on the server.

Implement data migrations and seed data.

## 24. External integrations

Build interchangeable server-side adapters for:
- Market prices
- Historical OHLCV data
- Company fundamentals
- Exchange calendars
- Financial news
- Foreign-exchange rates
- AI explanations

Evaluate currently available providers, documentation, pricing, geographic coverage, and licensing before choosing defaults.

Never assume that a provider covers every Indian, US, and international exchange.

If a required real-data integration is unavailable:
1. Show an explicit provider setup status.
2. Supply a clearly labeled demonstration mode.
3. Keep the interface functional.
4. Provide integration instructions.
5. Never disguise example data as real market data.

Cache responsibly and respect rate limits.

Never expose secret provider keys in browser bundles.

## 25. Notifications

Implement:
- In-app notification center
- Browser push when permitted
- User-controlled notification preferences
- Read/unread state
- Notification history
- Deep links to original news and related stocks
- Clear event timestamps
- Duplicate prevention

Do not interrupt a focused trading session with ordinary notifications.

## 26. Accessibility and usability

Implement:
- Keyboard navigation
- Visible focus states
- Screen-reader labels
- Appropriate contrast
- Accessible charts or accompanying data tables
- Responsive controls
- Reduced-motion support
- Loading/error/empty states
- Helpful validation messages
- Proper mobile behavior
- No content hidden beneath sticky navigation

Test popover placement, navigation drawers, scrollbars, fixed controls, and responsive tables.

All user-visible buttons must either perform their function or be explicitly disabled with an explanation.

## 27. Performance, security, and reliability

Implement:
- Server-side role validation
- Secure session management
- RLS policies
- Rate limiting for sensitive endpoints
- Strict input validation
- Secure secrets handling
- Protection against common web vulnerabilities
- Transactional order execution
- Idempotent ledger operations
- Safe external API handling
- Graceful error recovery
- Database indexing
- Efficient data fetching
- Optimized chart updates
- Lazy-loaded 3D components
- Performance monitoring hooks

Do not allow AI-generated text to directly alter financial balances, execute orders, or change permissions.

## 28. Testing

Add automated tests for critical behavior.

Unit tests:
- Wallet calculations
- P&L
- Average cost
- Currency conversion
- Simulated transaction fees
- Order validation
- Session duration logic
- Session scoring
- Financial-ratio calculations

Integration tests:
- User authentication
- Admin funding
- Order submission
- Order execution
- Account balance updates
- Session creation
- Session expiration
- Session restoration after refresh
- Session result generation
- Access control

End-to-end tests:
- New-user onboarding
- Admin funding a student account
- Student browsing real or labeled demo stocks
- Student placing a simulated order
- Student launching a 15-minute session
- Student completing a session
- Viewing the generated report
- Viewing a news article's original source
- Switching between India and US markets
- Completing a learning module

Test at multiple desktop and mobile viewport sizes.

Fix type errors, broken navigation, missing UI states, and test failures.

## 29. GitHub repository requirements

Make the entire application ready for a public or private GitHub repository.

Include:
- Professional README.md
- Clear folder structure
- .gitignore
- .env.example
- Database migrations
- Seed scripts
- Setup instructions
- Test instructions
- Architecture documentation
- Provider-integration documentation
- Contribution guidelines
- GitHub Actions workflow
- CI checks for lint, type-check, tests, and build
- Dependency and security checks

Never commit:
- API keys
- Database passwords
- Supabase service-role credentials
- User private data
- Real secrets
- Generated private environment files

## 30. Deployment requirements

Prepare the application for deployment using GitHub and Vercel, with Supabase as the managed database and authentication backend.

Create step-by-step instructions explaining:

1. Creating the local project.
2. Installing dependencies.
3. Setting up Supabase.
4. Applying database migrations.
5. Configuring authentication.
6. Adding environment variables.
7. Configuring market-data providers.
8. Configuring news providers.
9. Configuring the AI provider.
10. Running the app locally.
11. Running tests.
12. Initializing a Git repository.
13. Creating and pushing to a GitHub repository.
14. Importing the GitHub repository into Vercel.
15. Configuring Vercel environment variables.
16. Deploying the application.
17. Verifying production functionality.
18. Configuring custom domains if desired.
19. Debugging common deployment problems.

Account for scheduled news ingestion and background processing. If the deployment platform cannot support a required worker directly, document and configure an appropriate supported worker deployment.

Provide a working demo configuration that does not require paid financial data or AI services.

Do not claim a deployment succeeded unless it has actually been executed and verified.

## 31. Visual quality assurance

Before declaring the UI complete, review every page for:
- Inconsistent spacing
- Typography problems
- Low contrast
- Broken responsive layouts
- Unattractive empty states
- Incorrect icon usage
- Overflow and clipping
- Hidden navigation elements
- Chart resizing problems
- Tooltip positioning issues
- Modal animation problems
- Custom scrollbar issues
- Excessive motion
- Poor loading experiences
- Layout shifts
- Mobile usability

Ensure all major pages share a consistent premium visual identity.

## 32. Implementation workflow

Work in logical development milestones.

Milestone 1: Project initialization, design system, auth, database.

Milestone 2: Core dashboard, navigation, market explorer, stock details.

Milestone 3: Wallet ledger, virtual orders, positions, portfolio accounting.

Milestone 4: Timed trading sessions, frozen news, execution state, persistence.

Milestone 5: Post-session reports, portfolio analytics, history.

Milestone 6: News ingestion, AI explanations, notifications.

Milestone 7: Learning academy, financial popovers, tutorials, IPO lab.

Milestone 8: Historical replay, classrooms, journal, admin analytics.

Milestone 9: Advanced animations, visual refinement, responsive polish.

Milestone 10: Testing, documentation, GitHub integration, deployment readiness.

Before each milestone, inspect existing code and dependencies.

After each milestone:
- Run relevant checks.
- Fix failures.
- Verify navigation and functionality.
- Record implementation status.
- Explain remaining dependencies.

If a feature cannot be completed, document the exact limitation rather than silently substituting a nonfunctional placeholder.

## 33. Acceptance criteria

The application is considered complete only when:

- Students can register and log in.
- Admins can securely manage virtual funds.
- Users can browse supported Indian, US, and global instruments.
- Stock charts work with real or explicitly labeled demo data.
- Users can submit simulated orders.
- Virtual balances and holdings update correctly.
- Relevant financial news displays original source links.
- AI explanations clearly distinguish facts from interpretations.
- Financial terms have useful contextual popovers.
- Users can start a 15–45-minute trading session.
- Session news remains fixed.
- Starting session capital remains fixed.
- Prices behave according to the documented market-data mode.
- The countdown survives refreshes.
- Session orders and positions persist.
- Sessions end and finalize correctly.
- A useful post-session analytics report is generated.
- Portfolio analytics display real calculations.
- Lessons, quizzes, and progress tracking work.
- The admin dashboard is functional.
- The UI is responsive, visually polished, and animated.
- Security rules are enforced on the backend.
- Automated tests cover critical financial logic.
- The repository is GitHub-ready.
- The app can be deployed using the documented configuration.

## 34. Final instruction

Treat this project as a serious educational fintech product, not a coding tutorial or UI mockup.

I want a visually exceptional experience with cinematic transitions, beautifully designed components, realistic market visualizations, sophisticated portfolio analytics, and reliable full-stack functionality.

The timed trading session and its post-session insights are flagship features.

Prioritize correct financial logic over decorative animation when the two conflict.

Implement features rather than merely describing them.

Start by examining the repository, proposing the architecture and project structure, and establishing a tracked implementation plan.

Then build the application systematically, completing and verifying each milestone.

Do not substitute a static demo for the finished product.

When external credentials or permissions are required, implement everything possible without them and give exact setup instructions.

Finish with:
- A feature completion report
- Tested workflows
- Environment-variable requirements
- Commands to run locally
- GitHub publishing instructions
- Vercel deployment instructions
- Known limitations
- Recommended next improvements