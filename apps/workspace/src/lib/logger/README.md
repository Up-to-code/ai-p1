# Deepened Logging Module

A structured logging system with adapter pattern for different backends.

## Features

- **Multiple log levels**: error, warn, info, debug
- **Context preservation**: Maintain context across logger instances
- **Adapter pattern**: Support for console, Sentry, and custom backends
- **Performance monitoring**: Built-in timing and performance tracking
- **Module-specific logging**: Easy to create module-specific loggers
- **Environment-based configuration**: Configure via environment variables

## Usage

### Basic Logging

```typescript
import { logger } from '@/lib/logger';

logger.error('Something went wrong', { userId: '123' }, error);
logger.warn('Deprecated API used', { endpoint: '/api/v1/old' });
logger.info('User logged in', { userId: '123' });
logger.debug('Cache state', { keys: 5, size: '1MB' });
```

### Module-Specific Logging

```typescript
const dbLogger = logger.withModule('database');
dbLogger.error('Connection failed', { database: 'postgres' });
```

### Context Preservation

```typescript
const userLogger = logger.withContext({ userId: '123' });
userLogger.info('Action performed'); // Automatically includes userId
```

### Performance Monitoring

```typescript
const timer = logger.timer('db-query');
timer.start();
// ... do work ...
timer.endAndLog('User fetch completed');
```

## Configuration

Configure via environment variables:

```bash
# Log level: error, warn, info, debug
NEXT_PUBLIC_LOG_LEVEL=info

# Adapter: console, sentry, custom
NEXT_PUBLIC_LOG_ADAPTER=console
```

## Architecture

The module follows the **adapter pattern** to provide deep leverage:

- **Interface**: `Logger` interface with simple methods (error, warn, info, debug)
- **Implementation**: Complex logic hidden behind adapters
- **Seam**: Adapter interface allows swapping backends without changing callers
- **Locality**: All logging logic concentrated in one module
- **Leverage**: Callers get structured logging, filtering, and monitoring automatically

## Migration from Old Logger

The old logger (`lib/logger.ts`) is now a compatibility wrapper. Update imports:

```typescript
// Old (deprecated)
import { logger } from '@/lib/logger';

// New (recommended)
import { logger } from '@/lib/logger/index';
```

## Testing

The module is designed to be testable by swapping adapters:

```typescript
import { createLogger } from '@/lib/logger';
import { MockAdapter } from './test/mock-adapter';

const testLogger = createLogger({
  level: 'debug',
  adapter: new MockAdapter(),
});
```