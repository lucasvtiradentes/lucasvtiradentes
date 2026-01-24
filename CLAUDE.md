# Ralph Preferences

## Behavior

- Complete tasks fully before signaling completion
- Make commits after each significant change
- Use conventional commits (feat, fix, chore, refactor, docs)
- Keep changes focused and minimal
- Do not over-engineer or add unnecessary features

## Code Style

- 2-space indentation
- Single quotes for strings
- Trailing commas in multiline
- No comments unless logic is non-obvious
- Delete unused code, never comment it out

## TypeScript

- No `any` type
- No `@ts-ignore` or `@ts-expect-error`
- Explicit return types on exported functions
- Strict mode

## Testing

- Only meaningful tests that validate real behavior
- Test edge cases, not just happy path
- No tests that just check if a function exists

## Git

- Small focused commits
- Commit message format: `type: short description`
- Do not amend previous commits
