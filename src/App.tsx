/**
 * App
 *
 * Renders the minimal application shell for the rewrite baseline.
 *
 * @returns {JSX.Element} The root application content.
 */
const App = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="mx-auto flex min-h-screen w-full max-w-5xl items-center justify-center px-6 py-16">
        <section className="w-full rounded-3xl border border-border bg-card p-10 shadow-sm">
          <div className="space-y-3">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
              Daily Expense
            </p>
            <h1 className="text-3xl font-semibold tracking-tight">
              Rewrite baseline is ready
            </h1>
            <p className="max-w-2xl text-sm text-muted-foreground">
              Legacy implementation has been archived under <code>src/legacy</code>.
              The active app is now ready for the new shell, routing, and auth work.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
};

export default App;
