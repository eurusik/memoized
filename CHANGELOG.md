# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2025-04-05

### Added
- Time-based caching with TTL (time-to-live) functionality
- New `@memoizedTTL(ttl)` decorator that automatically expires cached results after specified time
- Enhanced internal implementation to track cache timestamps
- Added example demonstrating time-based caching for API calls
- Updated documentation with TTL usage examples

## [1.0.0] - Initial Release

### Added
- Basic memoization functionality with `@memoized` decorator
- Support for both legacy and Stage 3 decorators
- Deep equality comparison for complex objects
- Performance optimizations for primitive values and arrays
- Cache clearing functionality with `clearMemo` and `clearAllMemoized`
- Comprehensive test suite and documentation
