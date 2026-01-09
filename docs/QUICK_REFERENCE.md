# Quick Reference: New API Integration Pattern

## 🚀 5-Minute Integration

### Step 1: Schema (Validation + Types)
```typescript
// lib/schemas/entity.schema.ts
import { z } from "zod";

export const EntitySchema = z.object({
  id: z.union([z.string(), z.number()]).transform(String),
  name: z.string(),
  // Handle variants
  created_at: z.string().optional(),
  createdAt: z.string().optional(),
});

export const EntitiesResponseSchema = z.union([
  z.array(EntitySchema),
  z.object({ results: z.array(EntitySchema) }),
]);

export type Entity = z.infer<typeof EntitySchema>;
```

### Step 2: API Service
```typescript
// lib/services/entityAPI.ts
import { apiRequest } from "@/lib/api-client";
import { EntitiesResponseSchema } from "@/lib/schemas/entity.schema";

export const entityAPI = {
  list: async () => {
    const raw = await apiRequest<unknown>("/api/entities");
    const validated = EntitiesResponseSchema.parse(raw);
    return validated; // or transform if needed
  },

  get: async (id: string) => {
    return await apiRequest<Entity>(`/api/entities/${id}`);
  },

  create: async (data: EntityInput) => {
    return await apiRequest<Entity>("/api/entities", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
};
```

### Step 3: React Query Hook
```typescript
// lib/hooks/useEntity.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { entityAPI } from "@/lib/services/entityAPI";

export const entityKeys = {
  all: ["entities"] as const,
  lists: () => [...entityKeys.all, "list"] as const,
  detail: (id: string) => [...entityKeys.all, id] as const,
};

export function useEntities() {
  return useQuery({
    queryKey: entityKeys.lists(),
    queryFn: entityAPI.list,
  });
}

export function useCreateEntity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: entityAPI.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: entityKeys.lists() });
    },
  });
}
```

### Step 4: Use in Component
```tsx
import { useEntities, useCreateEntity } from "@/lib/hooks/useEntity";

export default function EntitiesPage() {
  const { data: entities = [], isLoading, error } = useEntities();
  const createEntity = useCreateEntity();

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <div>
      {entities.map(entity => (
        <EntityCard key={entity.id} entity={entity} />
      ))}
    </div>
  );
}
```

---

## 📦 Common Patterns

### Handle Multiple Field Names
```typescript
// In schema
export const JobSchema = z.object({
  job_type: z.union([z.number(), z.string()]).optional(),
  employment_type: z.union([z.number(), z.string()]).optional(),
  employmentType: z.union([z.number(), z.string()]).optional(),
});

// In transformer
import { tryFields } from "./fieldMappers";

const rawType = tryFields(raw, "job_type", "employment_type", "employmentType");
```

### Transform Choice Fields
```typescript
import { employmentTypeMapper } from "./fieldMappers";

// Backend (number) → Frontend (string)
const type = employmentTypeMapper.toFrontend(raw.job_type);
// → "Full time"

// Frontend (string) → Backend (number)
const typeId = employmentTypeMapper.toBackend("Full time");
// → 1
```

### Handle Wrapped Responses
```typescript
import { extractArray } from "./fieldMappers";

export const ResponseSchema = z.union([
  z.array(ItemSchema),
  z.object({ results: z.array(ItemSchema) }),
  z.object({ data: z.array(ItemSchema) }),
]);

// Extract array from any wrapper
const items = extractArray(response, ["results", "data", "items"]);
```

### Optimistic Updates
```typescript
export function useUpdateEntity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: entityAPI.update,
    // Optimistically update UI before API responds
    onMutate: async (newData) => {
      await queryClient.cancelQueries({ queryKey: entityKeys.lists() });

      const previous = queryClient.getQueryData(entityKeys.lists());

      queryClient.setQueryData(entityKeys.lists(), (old) =>
        old.map(item => item.id === newData.id ? newData : item)
      );

      return { previous };
    },
    // Rollback on error
    onError: (err, newData, context) => {
      queryClient.setQueryData(entityKeys.lists(), context.previous);
    },
    // Refetch after settled
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: entityKeys.lists() });
    },
  });
}
```

---

## 🛠️ Reusable Helpers

### Field Mappers (`lib/transformers/fieldMappers.ts`)

```typescript
// Try multiple field names
tryFields(obj, "field1", "field2", "field3")

// Safe string conversion
toString(value)

// Parse salary
parseSalary(value) // "50000" → 50000

// Extract array from wrapper
extractArray(payload, ["results", "data"])

// Employment type mapping
employmentTypeMapper.toFrontend(1) // → "Full time"
employmentTypeMapper.toBackend("Full time") // → 1

// Work arrangement mapping
workArrangementMapper.toFrontend(1) // → "Remote"
workArrangementMapper.toBackend("Remote") // → 1

// Boolean to Yes/No
booleanToYesNo(true) // → "Yes"
yesNoToBoolean("Yes") // → true
```

---

## 🎯 Query Key Patterns

```typescript
// Hierarchical keys for easy invalidation
export const entityKeys = {
  all: ["entities"] as const,
  lists: () => [...entityKeys.all, "list"] as const,
  list: (filters?: Filters) => [...entityKeys.lists(), filters] as const,
  details: () => [...entityKeys.all, "detail"] as const,
  detail: (id: string) => [...entityKeys.details(), id] as const,
};

// Invalidate all entity queries
queryClient.invalidateQueries({ queryKey: entityKeys.all });

// Invalidate only lists
queryClient.invalidateQueries({ queryKey: entityKeys.lists() });

// Invalidate specific detail
queryClient.invalidateQueries({ queryKey: entityKeys.detail(id) });
```

---

## ⚡ React Query Options

```typescript
useQuery({
  queryKey: ["entities"],
  queryFn: entityAPI.list,

  // How long data is considered fresh (no refetch)
  staleTime: 5 * 60 * 1000, // 5 minutes

  // How long unused data stays in cache
  gcTime: 10 * 60 * 1000, // 10 minutes

  // Retry failed requests
  retry: 1,

  // Refetch on window focus
  refetchOnWindowFocus: false,

  // Only fetch if condition is true
  enabled: !!userId,

  // Transform data after fetch
  select: (data) => data.filter(item => item.active),
})
```

---

## 🚨 Error Handling

### In Hook
```typescript
const { data, isLoading, error, refetch } = useEntities();

if (error) {
  return (
    <ErrorBoundary
      error={error}
      onRetry={refetch}
    />
  );
}
```

### In Mutation
```typescript
const createEntity = useCreateEntity();

createEntity.mutate(data, {
  onSuccess: (newEntity) => {
    toast.success("Created successfully!");
    router.push(`/entities/${newEntity.id}`);
  },
  onError: (error) => {
    toast.error(error.message);
  },
});
```

### Global Error Handler
```typescript
// In ReactQueryProvider
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      onError: (error) => {
        console.error("Query failed:", error);
        // Optional: show global error toast
      },
    },
    mutations: {
      onError: (error) => {
        console.error("Mutation failed:", error);
      },
    },
  },
});
```

---

## 📊 React Query DevTools

```typescript
// Already set up in lib/providers/ReactQueryProvider.tsx
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

// Shows in development only
{process.env.NODE_ENV === "development" && (
  <ReactQueryDevtools initialIsOpen={false} />
)}
```

**Access**: Bottom-left corner of your app (development only)

**Features**:
- View all queries and their state
- See cached data
- Manually refetch queries
- See request/error details
- Debug cache invalidation

---

## 🔄 Migration Checklist

Migrating from Zustand store to React Query:

- [ ] Create Zod schema
- [ ] Create API service
- [ ] Create React Query hooks
- [ ] Update component to use hooks
- [ ] Remove Zustand store if only used for API data
- [ ] Test loading states
- [ ] Test error handling
- [ ] Test mutations (create/update/delete)
- [ ] Verify cache invalidation works

---

## 📚 Full Documentation

- [API Integration Guide](./API_INTEGRATION_GUIDE.md) - Complete guide
- [Implementation Summary](./IMPLEMENTATION_SUMMARY.md) - What was done
- [Field Mappers](../lib/transformers/fieldMappers.ts) - Utilities reference

---

## 🎓 Examples

### Complete Working Examples

1. **Jobs** (Complete CRUD)
   - Schema: `lib/schemas/job.schema.ts`
   - Service: `lib/services/jobsAPI.ts`
   - Hooks: `lib/hooks/useJobs.ts`
   - Component: `app/(employer)/employer/dashboard/listed-jobs/page.tsx`

2. **Field Mappers** (Reusable utilities)
   - `lib/transformers/fieldMappers.ts`
   - `lib/transformers/job.transformer.ts`

---

**Pro Tip**: Copy the Jobs implementation as a template for new entities!
