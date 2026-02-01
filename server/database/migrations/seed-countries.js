// Seed countries, states and cities data from country-state-city package
import { Country, State, City } from 'country-state-city';
import { allQuery, runQuery } from '../../src/config/database.js';

async function seedCountries() {
  console.log('Seeding countries...');
  const countries = Country.getAllCountries();

  let count = 0;
  for (const country of countries) {
    await runQuery(`
      INSERT OR IGNORE INTO countries (iso2, iso3, name, phone_code, currency, currency_symbol, capital, region, subregion, flag)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      country.isoCode,
      country.isoCode, // using iso2 for iso3 as well since package only provides iso2
      country.name,
      country.phonecode,
      country.currency,
      country.currency, // currency_symbol
      country.capital || '',
      country.region || '',
      country.subregion || '',
      country.flag
    ]);
    count++;
  }

  console.log(`✓ Seeded ${count} countries`);
}

async function seedStates() {
  console.log('Seeding states...');
  
  const countries = await allQuery('SELECT id, iso2 FROM countries');

  let count = 0;
  for (const country of countries) {
    const states = State.getStatesOfCountry(country.iso2);
    for (const state of states) {
      await runQuery(`
        INSERT OR IGNORE INTO states (country_id, name, state_code)
        VALUES (?, ?, ?)
      `, [country.id, state.name, state.isoCode]);
      count++;
    }
  }

  console.log(`✓ Seeded ${count} states`);
}

async function seedCities() {
  console.log('Seeding cities...');
  
  const states = await allQuery('SELECT s.id as state_id, s.state_code, c.id as country_id, c.iso2 FROM states s JOIN countries c ON s.country_id = c.id');

  let count = 0;
  let processed = 0;
  const total = states.length;

  for (const state of states) {
    const cities = City.getCitiesOfState(state.iso2, state.state_code);
    for (const city of cities) {
      await runQuery(`
        INSERT OR IGNORE INTO cities (state_id, country_id, name)
        VALUES (?, ?, ?)
      `, [state.state_id, state.country_id, city.name]);
      count++;
    }
    
    processed++;
    if (processed % 100 === 0) {
      console.log(`  Processed ${processed}/${total} states...`);
    }
  }

  console.log(`✓ Seeded ${count} cities`);
}

async function main() {
  try {
    console.log('Starting database seeding...\n');
    
    await seedCountries();
    await seedStates();
    await seedCities();
    
    console.log('\n✓ All data seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

main();
