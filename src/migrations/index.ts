import * as migration_20260721_233248_initial_kiosk_schema from './20260721_233248_initial_kiosk_schema';

export const migrations = [
  {
    up: migration_20260721_233248_initial_kiosk_schema.up,
    down: migration_20260721_233248_initial_kiosk_schema.down,
    name: '20260721_233248_initial_kiosk_schema'
  },
];
