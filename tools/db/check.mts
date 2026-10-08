// Loads every migration and seed into an in-memory Postgres (PGlite) with
// Supabase stand-ins, then checks the security rules from each role's point of
// view. Run with `npm run db:check`.

import { PGlite } from '@electric-sql/pglite';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const read = (...parts: string[]) => readFileSync(join(root, ...parts), 'utf8');

const db = new PGlite();
let failures = 0;
let passes = 0;

function check(label: string, ok: boolean, detail?: unknown) {
  if (ok) {
    passes++;
    console.log(`  ✓ ${label}`);
  } else {
    failures++;
    console.log(`  ✗ ${label}`, detail ?? '');
  }
}

async function exec(label: string, sql: string) {
  try {
    await db.exec(sql);
    console.log(`✓ ${label}`);
  } catch (error) {
    console.error(`✗ ${label}\n`, error);
    process.exit(1);
  }
}

/** Runs queries as a given user (or anon when uid is null), like PostgREST does. */
async function as<T>(uid: string | null, fn: () => Promise<T>): Promise<T> {
  await db.exec(`set role ${uid ? 'authenticated' : 'anon'}`);
  await db.query(`select set_config('request.jwt.claim.sub', $1, false)`, [uid ?? '']);
  try {
    return await fn();
  } finally {
    await db.exec('reset role');
    await db.query(`select set_config('request.jwt.claim.sub', '', false)`);
  }
}

async function rows<T = Record<string, unknown>>(sql: string, params: unknown[] = []): Promise<T[]> {
  return (await db.query<T>(sql, params)).rows;
}

async function fails(sql: string, params: unknown[] = []): Promise<boolean> {
  try {
    await db.query(sql, params);
    return false;
  } catch {
    return true;
  }
}

await exec('Supabase stand-ins', read('tools', 'db', 'supabase-stubs.sql'));
for (const file of readdirSync(join(root, 'supabase', 'migrations')).sort()) {
  await exec(`migration ${file}`, read('supabase', 'migrations', file));
}
await exec('seed base.sql', read('supabase', 'seed', 'base.sql'));
if (existsSync(join(root, 'supabase', 'seed', 'catalog.sql'))) {
  await exec('seed catalog.sql', read('supabase', 'seed', 'catalog.sql'));
} else {
  console.log('! catalog.sql missing — run npm run db:seed first');
  process.exit(1);
}

// --- Fixture data, inserted as superuser (like the service role) -------------
const ids = {
  alice: '11111111-1111-4111-8111-111111111111',
  bob: '22222222-2222-4222-8222-222222222222',
  crewUser: '33333333-3333-4333-8333-333333333333',
  supplierUser: '44444444-4444-4444-8444-444444444444',
  admin: '55555555-5555-4555-8555-555555555555',
  crewA: '00000000-0000-4000-a000-000000000001',
};

const [firstSupplier] = await rows<{ id: string }>(`select id from public.suppliers where kind = 'nursery' order by id limit 1`);
const [plant] = await rows<{ id: string; price: string }>(
  `select id, price from public.products where category = 'plant' and supplier_id = $1 order by id limit 1`,
  [firstSupplier.id],
);

await db.exec(`
  insert into auth.users (id, phone) values
    ('${ids.alice}', '8801700000001'), ('${ids.bob}', '8801700000002'),
    ('${ids.crewUser}', '8801700000003'), ('${ids.supplierUser}', '8801700000004'),
    ('${ids.admin}', '8801700000005');
  update public.profiles set role = 'crew', crew_id = '${ids.crewA}' where id = '${ids.crewUser}';
  update public.profiles set role = 'supplier', supplier_id = '${firstSupplier.id}' where id = '${ids.supplierUser}';
  update public.profiles set role = 'admin' where id = '${ids.admin}';
`);

const [address] = await rows<{ id: string }>(
  `insert into public.addresses (user_id, line1, area, city, floor) values ($1, 'House 1, Road 2', 'Dhanmondi', 'dhaka', 6) returning id`,
  [ids.alice],
);
const [design] = await rows<{ id: string }>(
  `insert into public.designs (user_id, status, city) values ($1, 'ready', 'dhaka') returning id`,
  [ids.alice],
);
const [order] = await rows<{ id: string; number: string }>(
  `insert into public.orders (user_id, kind, address_id, total) values ($1, 'design', $2, 5000) returning id, number`,
  [ids.alice, address.id],
);
const [job] = await rows<{ id: string }>(
  `insert into public.jobs (kind, status, order_id, user_id, address_id, crew_id) values ('install', 'assigned', $1, $2, $3, $4) returning id`,
  [order.id, ids.alice, address.id, ids.crewA],
);
await db.query(
  `insert into public.purchase_orders (number, supplier_id, status) values ('PO-1', $1, 'sent'), ('PO-2', $1, 'draft')`,
  [firstSupplier.id],
);

// --- Checks ------------------------------------------------------------------
console.log('\nSeed');
const counts = await rows<{ products: number; suppliers: number; bundles: number; costs: number; slots: number; plans: number }>(`
  select (select count(*)::int from public.products) as products,
         (select count(*)::int from public.suppliers) as suppliers,
         (select count(*)::int from public.bundles) as bundles,
         (select count(*)::int from public.product_costs) as costs,
         (select count(*)::int from public.install_slots) as slots,
         (select count(*)::int from public.subscription_plans) as plans`);
console.log('  ', counts[0]);
check('every product has a cost row', counts[0].products === counts[0].costs);
check('install slots generated', counts[0].slots > 0);
check('order numbers are readable', order.number.startsWith('BDU-'), order.number);

console.log('\nGuest (anon)');
await as(null, async () => {
  check('can browse the catalog', (await rows(`select 1 from public.products`)).length === counts[0].products);
  check('cannot see cost of goods', (await rows(`select 1 from public.product_costs`)).length === 0);
  check('cannot see suppliers', (await rows(`select 1 from public.suppliers`)).length === 0);
  check('cannot see designs', (await rows(`select 1 from public.designs`)).length === 0);
  check('cannot write products', await fails(`update public.products set price = 1 returning id`).then(async (f) => f || (await rows(`select 1 from public.products where price = 1`)).length === 0));
});

console.log('\nCustomer (Alice)');
await as(ids.alice, async () => {
  check('sees own design', (await rows(`select 1 from public.designs`)).length === 1);
  check('sees own order', (await rows(`select 1 from public.orders`)).length === 1);
  check('cannot see cost of goods', (await rows(`select 1 from public.product_costs`)).length === 0);
  await db.query(`update public.profiles set role = 'admin', credit_balance = 99999, full_name = 'Alice' where id = $1`, [ids.alice]);
  const [me] = await rows<{ role: string; credit_balance: string; full_name: string }>(`select role, credit_balance, full_name from public.profiles where id = $1`, [ids.alice]);
  check('cannot promote herself or add credit', me.role === 'customer' && Number(me.credit_balance) === 0, me);
  check('can still edit her name', me.full_name === 'Alice');
  const [item] = await rows<{ unit_price: string; source: string }>(
    `insert into public.design_items (design_id, product_id, quantity, unit_price, source) values ($1, $2, 2, 1, 'ai') returning unit_price, source`,
    [design.id, plant.id],
  );
  check('BOM price is forced to live catalog price', Number(item.unit_price) === Number(plant.price), item);
  check('customer-added items are marked as customer edits', item.source === 'customer_add');
  check('cannot create an order directly', await fails(`insert into public.orders (user_id, kind, total) values ($1, 'items', 1)`, [ids.alice]));
  check('cannot mark her design as reviewed', await fails(`update public.designs set status = 'needs_review' where id = $1`, [design.id]));
});

const [{ code }] = await rows<{ code: string }>(`select referral_code as code from public.profiles where id = $1`, [ids.alice]);
console.log('\nCustomer (Bob)');
await as(ids.bob, async () => {
  check("cannot see Alice's design", (await rows(`select 1 from public.designs`)).length === 0);
  check("cannot see Alice's address", (await rows(`select 1 from public.addresses`)).length === 0);
  const updated = await rows(`update public.addresses set line1 = 'hacked' where id = $1 returning id`, [address.id]);
  check("cannot edit Alice's address", updated.length === 0);
  const [{ ok }] = await rows<{ ok: boolean }>(`select public.apply_referral_code($1) as ok`, [code.toLowerCase()]);
  check("can apply Alice's referral code", ok === true);
  const [{ again }] = await rows<{ again: boolean }>(`select public.apply_referral_code($1) as again`, [code]);
  check('cannot apply a referral code twice', again === false);
});

console.log('\nCrew');
await as(ids.crewUser, async () => {
  check('sees assigned job', (await rows(`select 1 from public.jobs`)).length === 1);
  check("sees the customer's address", (await rows(`select 1 from public.addresses`)).length === 1);
  check("sees the customer's name/phone", (await rows(`select phone from public.profiles where id = $1`, [ids.alice])).length === 1);
  await db.query(`update public.jobs set status = 'on_site', crew_id = null, user_id = $2 where id = $1`, [job.id, ids.bob]);
  const [j] = await rows<{ status: string; crew_id: string; user_id: string }>(`select status, crew_id, user_id from public.jobs where id = $1`, [job.id]);
  check('can update job progress', j.status === 'on_site');
  check('cannot reassign the job or customer', j.crew_id === ids.crewA && j.user_id === ids.alice, j);
  check('cannot see designs or payments', (await rows(`select 1 from public.designs union all select 1 from public.payments`)).length === 0);
});

console.log('\nSupplier');
await as(ids.supplierUser, async () => {
  const pos = await rows<{ number: string }>(`select number from public.purchase_orders`);
  check('sees sent POs but not drafts', pos.length === 1 && pos[0].number === 'PO-1', pos);
  check('can confirm a PO', (await rows(`update public.purchase_orders set status = 'confirmed' where number = 'PO-1' returning id`)).length === 1);
  check('cannot mark a PO received', await fails(`update public.purchase_orders set status = 'received' where number = 'PO-1'`));
  check('cannot see cost of goods', (await rows(`select 1 from public.product_costs`)).length === 0);
  check('can update own stock sheet', (await rows(
    `insert into public.supplier_stock (supplier_id, product_id, available_qty) values ($1, $2, 10) returning 1`,
    [firstSupplier.id, plant.id],
  )).length === 1);
  check("cannot write another supplier's stock", await fails(
    `insert into public.supplier_stock (supplier_id, product_id, available_qty) values ('nope', $1, 10)`,
    [plant.id],
  ));
});

console.log('\nAdmin');
await as(ids.admin, async () => {
  check('sees all designs, orders and costs', (await rows(`select 1 from public.designs`)).length === 1 && (await rows(`select 1 from public.product_costs`)).length === counts[0].costs);
  check('can change settings', (await rows(`update public.app_settings set data = data || '{"guarantee_days": 90}' returning 1`)).length === 1);
});

console.log(`\n${passes} passed, ${failures} failed`);
process.exit(failures ? 1 : 0);
