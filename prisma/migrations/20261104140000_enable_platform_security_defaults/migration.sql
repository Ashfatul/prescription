INSERT INTO "SystemSetting" ("id", "key", "value", "category", "createdAt", "updatedAt")
VALUES
  (md5(random()::text || clock_timestamp()::text), 'auth_require_email_verification', 'true', 'auth', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (md5(random()::text || clock_timestamp()::text), 'auth_require_org_approval', 'true', 'auth', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (md5(random()::text || clock_timestamp()::text), 'auth_require_patient_verification', 'true', 'auth', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("key") DO UPDATE SET "value" = 'true', "category" = 'auth', "updatedAt" = CURRENT_TIMESTAMP;
