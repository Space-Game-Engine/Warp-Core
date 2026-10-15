// Runs before every e2e test file, before any application module is loaded.
process.env.NODE_ENV = 'test';
process.env.INSTALLATION_DIRECTORY ??= 'test/e2e/test-install-files';
