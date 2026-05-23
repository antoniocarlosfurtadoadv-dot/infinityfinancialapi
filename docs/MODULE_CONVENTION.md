# Module Creation Convention

## Overview

Each feature is a **parent module** composed of **sub-modules**, one per action.

```
features/
  users/
    users.module.ts          ← parent module
    user-create/             ← sub-module
    user-list/
    user-update/
    user-delete/
    user-find/
```

---

## Steps

### 1. Scaffold with Nest CLI

```bash
nest g res features/<name>
```

- Choose **REST API** as transport layer.
- Answer **No** to CRUD entry points.

### 2. Clean up generated files

Inside `src/features/<name>/`, **delete everything except** `<name>.module.ts`.

### 3. Create sub-modules

For each action (e.g. `create`, `list`, `update`, `delete`, `find`), run:

```bash
nest g res features/<name>/<name>-<action>
```

Same answers: REST API, No CRUD.

Then **delete everything except**:
- `<name>-<action>.module.ts`
- `<name>-<action>.controller.ts`
- `<name>-<action>.controller.spec.ts`
- `<name>-<action>.service.ts`
- `<name>-<action>.service.spec.ts`

### 4. Add a `dto/` folder when needed

Sub-modules that receive a body (`create`, `update`) must have a `dto/` folder:

```
user-create/
  dto/
    create-user.dto.ts
```

Sub-modules that only use route/query params (`delete`, `find`) do **not** need a `dto/` folder.

### 5. Register sub-modules in the parent module

```ts
// users.module.ts
@Module({
  imports: [
    UserCreateModule,
    UserListModule,
    UserUpdateModule,
    UserDeleteModule,
    UserFindModule,
    // any extra sub-modules...
  ],
})
export class UsersModule {}
```

### 6. Register the parent module in `FeaturesModule`

```ts
// features.module.ts
@Module({
  imports: [UsersModule, /* other feature modules */],
})
export class FeaturesModule {}
```

---

## Controller pattern

All controllers follow the same structure:

```ts
@ApiTags('<resource>')        // Swagger tag
@ApiBearerAuth()              // JWT auth
@Controller('<resource>')
export class ResourceActionController {
  constructor(
    private readonly resourceActionService: ResourceActionService,
    private readonly responseService: ApiResponseService,  // always inject
  ) {}

  @Post() | @Put(':id') | @Delete(':id')
  @Permissions(Permission.YOUR_PERMISSION)
  @ApiOperation({ summary: '...' })
  async methodName(
    @Body() dto: ActionDto,           // create / update only
    @Param('id') id: string,          // update / delete / find only
    @CurrentUser() user: UserPayload, // always inject
  ) {
    const result = await this.resourceActionService.methodName(...);
    return this.responseService.success({
      message: '...',
      data: result,
    });
  }
}
```

Rules:
- Always wrap the response with `this.responseService.success({ message, data })`.
- Always use `@CurrentUser()` to get the authenticated user.
- Always protect endpoints with `@Permissions(Permission.SOME_PERMISSION)`.

---

## Service pattern

```ts
@Injectable()
export class ResourceActionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventDispatcher: EventDispatcherService, // create / update / delete only
  ) {}

  async methodName(dto: ActionDto, currentUser: UserPayload) {
    // 1. Validate / query with prisma
    // 2. Execute inside prisma.$transaction when multiple writes
    // 3. Dispatch event AFTER the transaction
    this.eventDispatcher.dispatch(
      EVENT_NAMES.RESOURCE_ACTION,
      new ResourceActionEvent(...),
    );
    return result;
  }
}
```

Rules:
- Inject `EventDispatcherService` only when the action must dispatch an event (create, update, delete).
- Read-only actions (`find`, `list`) do **not** inject `EventDispatcherService`.
- Always use `prisma.$transaction` when performing multiple writes.
- Dispatch the event **after** the transaction completes, not inside it.

---

## Event pattern

For each action that dispatches an event, three things must exist:

### 1. Event class — `src/core/events/events/<resource>-<action>.event.ts`

```ts
export class ResourceActionEvent {
  constructor(
    public readonly resourceId: string,
    // ...relevant fields
    public readonly tenantId?: string,
    public readonly triggeredByUserId?: string,
    public readonly timestamp: Date = new Date(),
  ) {}
}
```

### 2. Event name constant — `src/core/events/constants/event-names.constant.ts`

```ts
export const EVENT_NAMES = {
  RESOURCE_CREATED: 'resource.created',
  RESOURCE_UPDATED: 'resource.updated',
  RESOURCE_DELETED: 'resource.deleted',
  // ...
};
```

Convention: `'<resource>.<action>'` in lowercase with dots, e.g. `user.created`.

### 3. Export from the events barrel — `src/core/events/events/index.ts`

Add the new event class to the existing `index.ts` barrel export.

---

## Quick reference

| Sub-module type          | Has `dto/`? | Dispatches event? |
|--------------------------|-------------|-------------------|
| `create`                 | Yes         | Yes               |
| `update`                 | Yes         | Yes               |
| `delete`                 | No          | Yes               |
| `find`, `list`           | No          | No                |
| Custom actions           | If needed   | If needed         |
