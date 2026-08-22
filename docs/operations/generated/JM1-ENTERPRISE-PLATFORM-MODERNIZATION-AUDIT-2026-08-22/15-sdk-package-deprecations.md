# SDK and Package Deprecations

One repo npm results:

- npm outdated reports non-major updates available for Next.js 16.3.2, React 19.2.8, React DOM 19.2.8, Tailwind 4.3.3, eslint-config-next 16.3.2, and related type packages.
- npm audit reports 8 vulnerabilities total: 1 low, 7 high, 0 critical.
- Direct security item: next 16.2.0 has high advisories fixed by next 16.3.2 (non-major).
- Build warning: Node 26 emitted DEP0205 module.register deprecation warning during next build.

Classification: SECURITY_UPDATE for Next.js dependency patch; RUNTIME_MISMATCH/PACKAGE_WARNING for Node 26 build warning. No package upgrades performed.
