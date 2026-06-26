import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_admin/overview')({
  component: OverviewPage,
});

function OverviewPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-medium text-foreground">Overview</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          General admin overview will live here.
        </p>
      </div>
    </div>
  );
}
