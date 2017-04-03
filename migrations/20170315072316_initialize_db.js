
exports.up = function(knex, Promise) {
  return knex.schema
  // It builds the requisite core tables
    .createTable('users', (table) => {
      table.increments('id').primary();
      table.string('firstName', 20);
      table.string('lastName', 20);
      table.string('email', 40);
      table.string('fbID');
      table.string('gID');
      table.string('picture');
      table.timestamps(true);
    })
    .createTable('itineraries', (table) => {
      table.increments('id').primary();
      table.integer('ownerID').unsigned().references('id').inTable('users').onDelete('CASCADE');
      table.string('itinName', 40);
      table.integer('isActive');
      table.integer('isPublic');
      table.timestamps(true);
    })
    .createTable('entries', (table) => {
      table.increments('id').primary();
      table.string('title', 50);
      table.text('body', 'mediumtext');
      table.decimal('lat', 24, 12);
      table.decimal('lng', 24, 12);
      table.string('name', 100);
      table.string('address', 80);
      table.integer('contributorID').unsigned().references('id').inTable('users').onDelete('CASCADE');
      table.integer('itinID').unsigned().references('id').inTable('itineraries').onDelete('CASCADE');
      table.timestamps(true);
    })
};

exports.down = function(knex, Promise) {
  return knex.schema
    .dropTableIfExists('users')
    .dropTableIfExists('itineraries')
    .dropTableIfExists('entries')
    .dropTableIfExists('users_itins')
    .dropTableIfExists('entries_itins')
};
