import { createFileRoute } from '@tanstack/react-router';
import { ChevronDown, ImageIcon, Pencil, Plus } from 'lucide-react';

import type { AdminInvestmentCategory } from '@/types/InvestmentTypes';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import CategoryFormSheet from '@/components/coffer/CategoryFormSheet';
import { useInvestmentSubCategories } from '@/hooks/useInvestmentCategories';
import { useInvestmentCategories } from '@/hooks/useInvestmentCategories';

export const Route = createFileRoute('/_admin/coffer/categories')({
  component: CategoriesPage,
});

function SubCategories({ category }: { category: AdminInvestmentCategory }) {
  const { subCategories, isSubCategoriesLoading } = useInvestmentSubCategories({
    categoryId: category.id,
  });

  if (isSubCategoriesLoading) {
    return <Skeleton className="h-10 w-full" />;
  }

  return (
    <div className="space-y-2">
      {subCategories.length === 0 ? (
        <p className="text-sm text-muted-foreground">No sub-categories yet.</p>
      ) : (
        subCategories.map((sub) => (
          <div
            key={sub.id}
            className="flex items-center justify-between rounded-md border border-border bg-card px-3 py-2"
          >
            <div className="flex items-center gap-2">
              <span className="text-sm text-foreground">{sub.name}</span>
              {!sub.is_active && <Badge variant="outline">Inactive</Badge>}
            </div>
            <CategoryFormSheet
              subCategory={sub}
              trigger={
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
              }
            />
          </div>
        ))
      )}
      <CategoryFormSheet
        parentCategoryId={category.id}
        trigger={
          <Button variant="outline" size="sm" className="gap-1">
            <Plus className="h-3.5 w-3.5" />
            Add sub-category
          </Button>
        }
      />
    </div>
  );
}

function CategoriesPage() {
  const { categories, isCategoriesLoading } = useInvestmentCategories({});

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-medium text-foreground">Categories</h1>
          <p className="mt-1 text-muted-foreground">
            Organise investments into categories and sub-categories used by the
            marketplace filters.
          </p>
        </div>
        <CategoryFormSheet
          trigger={
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              New category
            </Button>
          }
        />
      </div>

      {isCategoriesLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-lg" />
          ))}
        </div>
      ) : categories.length === 0 ? (
        <Card>
          <CardContent className="p-10 text-center text-muted-foreground">
            No categories yet. Create your first one.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {categories.map((category) => (
            <Collapsible key={category.id}>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-muted">
                        {category.Icon?.temporary_signed_url ? (
                          <img
                            src={category.Icon.temporary_signed_url}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <ImageIcon className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="truncate font-medium text-foreground">
                            {category.name}
                          </p>
                          {!category.is_active && (
                            <Badge variant="outline">Inactive</Badge>
                          )}
                        </div>
                        <p className="truncate text-xs text-muted-foreground">
                          {category._count?.investments ?? 0} investments ·{' '}
                          {category._count?.sub_categories ?? 0} sub-categories
                        </p>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <CategoryFormSheet
                        category={category}
                        trigger={
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Pencil className="h-4 w-4" />
                          </Button>
                        }
                      />
                      <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                      </CollapsibleTrigger>
                    </div>
                  </div>

                  <CollapsibleContent className="pt-4">
                    <SubCategories category={category} />
                  </CollapsibleContent>
                </CardContent>
              </Card>
            </Collapsible>
          ))}
        </div>
      )}
    </div>
  );
}
