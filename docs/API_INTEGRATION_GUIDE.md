# API Integration Guide

This guide documents the new standardized approach for integrating backend APIs into the frontend. Following this pattern will drastically reduce the number of files you need to modify for each integration.

## 📋 Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [File Structure](#file-structure)
3. [Quick Start: Adding a New API](#quick-start-adding-a-new-api)
4. [Step-by-Step Guide](#step-by-step-guide)
5. [Best Practices](#best-practices)
6. [Examples](#examples)
7. [Troubleshooting](#troubleshooting)

---

## Architecture Overview

### Before vs After

**BEFORE** (Old Pattern):
```
Single API Integration = 5-7 file changes:
1. app/api/endpoint/route.ts (API route)
2. lib/api-config.ts (endpoint config)
3. lib/entityStore.ts (Zustand store)
4. lib/entityUtils.ts (transformations)
5. lib/entityTypes.ts (TypeScript types)
6. Component using the data
7. Debug runtime errors from unexpected backend shapes
```

**AFTER** (New Pattern):
```
Single API Integration = 2-3 file changes:
1. lib/schemas/entity.schema.ts (Zod schema - auto-generates types, validates data)
2. lib/services/entityAPI.ts (API operations + transformations)
3. Component using the data (via React Query hook)

✅ Centralized transformations
✅ Automatic type safety
✅ No manual loading states
✅ Built-in caching
✅ Error handling included
```

---

## File Structure

```
lib/
├── schemas/                    # Zod schemas (validation + types)
│   ├── job.schema.ts
│   ├── candidate.schema.ts
│   └── organization.schema.ts
├── services/                   # API operations
│   ├── jobsAPI.ts
│   ├── candidatesAPI.ts
│   └── organizationsAPI.ts
├── transformers/               # Data transformation utilities
│   ├── fieldMappers.ts         # Reusable mappers
│   ├── job.transformer.ts
│   └── candidate.transformer.ts
├── hooks/                      # React Query hooks
│   ├── useJobs.ts
│   ├── useCandidates.ts
│   └── useOrganizations.ts
└── providers/
    └── ReactQueryProvider.tsx  # React Query setup
```

---

## Quick Start: Adding a New API

### 5-Minute Integration Checklist

For a new entity (e.g., "applications"):

1. **Create Schema** (`lib/schemas/application.schema.ts`)
   - Define backend response shape with Zod
   - Handle field name variants
   - Export TypeScript types

2. **Create API Service** (`lib/services/applicationsAPI.ts`)
   - Import schema
   - Create CRUD operations
   - Use transformers

3. **Create Hook** (`lib/hooks/useApplications.ts`)
   - Wrap API calls in React Query
   - Export hooks for components

4. **Use in Components**
   ```tsx
   const { data, isLoading, error } = useApplications();
   ```

**That's it!** No manual state management, no loading flags, no error handling boilerplate.

---

## Step-by-Step Guide

### Step 1: Create Zod Schema

**File**: `lib/schemas/entity.schema.ts`

```typescript
import { z } from "zod";

// Define backend response schema
export const BackendEntitySchema = z.object({
  id: z.union([z.string(), z.number()]).transform(String),
  name: z.string(),
  // Handle field name variants
  created_at: z.string().optional(),
  createdAt: z.string().optional(),
  // Handle type inconsistencies
  status: z.union([z.number(), z.string()]).optional(),
});

// Handle wrapped responses
export const BackendEntitiesResponseSchema = z.union([
  z.array(BackendEntitySchema),
  z.object({ results: z.array(BackendEntitySchema) }),
  z.object({ data: z.array(BackendEntitySchema) }),
]);

// Auto-generate TypeScript types
export type BackendEntity = z.infer<typeof BackendEntitySchema>;
export type BackendEntitiesResponse = z.infer<typeof BackendEntitiesResponseSchema>;
```

**Benefits**:
- ✅ Runtime validation catches backend contract violations
- ✅ Auto-generates TypeScript types (no manual type definitions)
- ✅ Transforms data during validation (e.g., ID to string)
- ✅ Documents expected backend shape

### Step 2: Create Transformer

**File**: `lib/transformers/entity.transformer.ts`

```typescript
import { BackendEntity } from "@/lib/schemas/entity.schema";
import { toString, tryFields, extractArray } from "./fieldMappers";

export const transformEntityFromBackend = (raw: BackendEntity) => {
  return {
    id: String(raw.id),
    name: raw.name,
    // Use reusable helper to try multiple field names
    createdAt: toString(tryFields(raw, "created_at", "createdAt")),
  };
};

export const transformEntitiesArray = (payload: unknown) => {
  const entities = extractArray(payload, ["results", "data"]);
  return entities.map(transformEntityFromBackend);
};
```

**Reusable Helpers** (in `fieldMappers.ts`):
- `tryFields()` - Try multiple field name variants
- `toString()` - Safe type conversion
- `employmentTypeMapper` - Map employment types
- `workArrangementMapper` - Map work arrangements
- `extractArray()` - Extract arrays from wrappers

### Step 3: Create API Service

**File**: `lib/services/entityAPI.ts`

```typescript
import { apiRequest } from "@/lib/api-client";
import { BackendEntitiesResponseSchema } from "@/lib/schemas/entity.schema";
import { transformEntitiesArray } from "@/lib/transformers/entity.transformer";

export const entitiesAPI = {
  list: async () => {
    const raw = await apiRequest<unknown>("/api/entities");
    const validated = BackendEntitiesResponseSchema.parse(raw);
    return transformEntitiesArray(validated);
  },

  get: async (id: string) => {
    const raw = await apiRequest<unknown>(`/api/entities/${id}`);
    return transformEntityFromBackend(raw);
  },

  create: async (data: EntityFormValues) => {
    const payload = transformEntityToBackend(data);
    const raw = await apiRequest<unknown>("/api/entities", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return transformEntityFromBackend(raw);
  },
};
```

**Single Source of Truth**:
- All entity API calls in ONE place
- Easy to mock for testing
- Single place to update when backend changes

### Step 4: Create React Query Hooks

**File**: `lib/hooks/useEntities.ts`

```typescript
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { entitiesAPI } from "@/lib/services/entityAPI";

export const entityKeys = {
  all: ["entities"] as const,
  lists: () => [...entityKeys.all, "list"] as const,
  detail: (id: string) => [...entityKeys.all, "detail", id] as const,
};

export function useEntities() {
  return useQuery({
    queryKey: entityKeys.lists(),
    queryFn: entitiesAPI.list,
  });
}

export function useEntity(id: string | undefined) {
  return useQuery({
    queryKey: entityKeys.detail(id!),
    queryFn: () => entitiesAPI.get(id!),
    enabled: !!id,
  });
}

export function useCreateEntity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: entitiesAPI.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: entityKeys.lists() });
    },
  });
}
```

**Automatic Features**:
- ✅ Loading states
- ✅ Error handling
- ✅ Request caching
- ✅ Request deduplication
- ✅ Background refetching
- ✅ Optimistic updates

### Step 5: Use in Components

**Before** (Old Pattern):
```tsx
function JobsPage() {
  const { jobs, hasFetched, fetchJobs } = useEmployerJobsStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!hasFetched) {
      fetchJobs();
    }
  }, [hasFetched, fetchJobs]);

  if (!hasFetched) return <div>Loading...</div>;
  // ... rest of component
}
```

**After** (New Pattern):
```tsx
function JobsPage() {
  const { data: jobs = [], isLoading, error } = useJobs();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return <div>{jobs.map(job => <JobCard job={job} />)}</div>;
}
```

**90% less boilerplate!**

---

## Best Practices

### 1. Separation of Concerns

```
schemas/     → Define data shapes + validation
transformers/ → Convert backend ↔ frontend
services/    → HTTP operations
hooks/       → React data fetching
stores/      → UI state ONLY (modals, filters, selections)
```

**✅ DO**: Use Zustand for UI state (selected tab, modal open/closed, filter values)
**❌ DON'T**: Use Zustand for API data (use React Query instead)

### 2. Type Safety

```typescript
// ✅ DO: Use Zod as source of truth
export type Job = z.infer<typeof JobSchema>;

// ❌ DON'T: Manual type definitions that drift
export type Job = { id: string; title: string; };
```

### 3. Error Handling

```typescript
// ✅ DO: Handle at component boundaries
const { data, error } = useJobs();
if (error) return <ErrorBoundary error={error} />;

// ❌ DON'T: Try-catch everywhere
try { await fetch(); } catch (e) { console.log(e); }
```

### 4. Data Fetching

```typescript
// ✅ DO: React Query for server state
const { data } = useQuery({ queryKey: ["jobs"], queryFn: jobsAPI.list });

// ❌ DON'T: Zustand stores for API data
const jobs = useJobsStore(state => state.jobs);
```

### 5. Reusability

```typescript
// ✅ DO: Reuse field mappers
const type = employmentTypeMapper.toFrontend(raw.job_type);

// ❌ DON'T: Duplicate mapping logic
if (typeof raw.job_type === "number") {
  if (raw.job_type === 1) type = "Full time";
  // ...
}
```

---

## Examples

### Example 1: Jobs API (Complete)

See implementation in:
- [lib/schemas/job.schema.ts](../lib/schemas/job.schema.ts)
- [lib/services/jobsAPI.ts](../lib/services/jobsAPI.ts)
- [lib/transformers/job.transformer.ts](../lib/transformers/job.transformer.ts)
- [lib/hooks/useJobs.ts](../lib/hooks/useJobs.ts)
- [app/(employer)/employer/dashboard/listed-jobs/page.tsx](../app/(employer)/employer/dashboard/listed-jobs/page.tsx)

### Example 2: Creating a New Entity

**Scenario**: Add candidate applications API

1. **Schema** (`lib/schemas/application.schema.ts`):
```typescript
export const ApplicationSchema = z.object({
  id: z.union([z.string(), z.number()]).transform(String),
  candidate_id: z.number(),
  job_id: z.number(),
  status: z.union([z.number(), z.string()]),
  applied_at: z.string(),
});
```

2. **Service** (`lib/services/applicationsAPI.ts`):
```typescript
export const applicationsAPI = {
  list: async (jobId: string) => {
    const raw = await apiRequest<unknown>(`/api/jobs/${jobId}/applications`);
    return transformApplicationsArray(raw);
  },
};
```

3. **Hook** (`lib/hooks/useApplications.ts`):
```typescript
export function useApplications(jobId: string) {
  return useQuery({
    queryKey: ["applications", jobId],
    queryFn: () => applicationsAPI.list(jobId),
  });
}
```

4. **Component**:
```tsx
function ApplicationsList({ jobId }: { jobId: string }) {
  const { data: applications = [], isLoading } = useApplications(jobId);

  if (isLoading) return <LoadingSpinner />;
  return <div>{applications.map(app => <ApplicationCard app={app} />)}</div>;
}
```

---

## Troubleshooting

### Issue: "Type 'X' is not assignable to type 'Y'"

**Solution**: Update Zod schema to handle the actual backend type:
```typescript
// Add union type for flexibility
field: z.union([z.string(), z.number(), z.boolean()]).optional()
```

### Issue: "Cannot read property 'X' of undefined"

**Solution**: Backend returned unexpected shape. Check schema validation:
```typescript
// Add more wrapper key options
export const ResponseSchema = z.union([
  z.array(ItemSchema),
  z.object({ results: z.array(ItemSchema) }),
  z.object({ data: z.array(ItemSchema) }),
  z.object({ items: z.array(ItemSchema) }), // Add new variant
]);
```

### Issue: Query not refetching after mutation

**Solution**: Invalidate queries after mutations:
```typescript
export function useUpdateJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: jobsAPI.update,
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
    },
  });
}
```

### Issue: Too many API requests

**Solution**: Adjust staleTime and cacheTime:
```typescript
useQuery({
  queryKey: ["jobs"],
  queryFn: jobsAPI.list,
  staleTime: 5 * 60 * 1000, // 5 minutes
  gcTime: 10 * 60 * 1000,   // 10 minutes
});
```

---

## Migration Checklist

When migrating an existing feature:

- [ ] Create Zod schema for the entity
- [ ] Create transformer functions
- [ ] Create API service with all operations
- [ ] Create React Query hooks
- [ ] Update components to use hooks
- [ ] Remove old Zustand store (if only used for API data)
- [ ] Test all CRUD operations
- [ ] Verify error handling
- [ ] Check loading states

---

## Resources

- [Zod Documentation](https://zod.dev/)
- [React Query Documentation](https://tanstack.com/query/latest/docs/framework/react/overview)
- [Field Mappers Reference](../lib/transformers/fieldMappers.ts)

---

**Questions?** Check existing implementations in:
- Jobs: `lib/schemas/job.schema.ts`, `lib/services/jobsAPI.ts`, `lib/hooks/useJobs.ts`
- Components: `app/(employer)/employer/dashboard/listed-jobs/page.tsx`
