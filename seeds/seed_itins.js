exports.seed = function (knex, Promise) {
  return knex.raw('SET foreign_key_checks = 0;')
    .then(() => {
      return knex('itineraries').del()
        .then(function () {
          return knex.raw('SET foreign_key_checks = 0;')
            .then(() => {
              return knex('itineraries').insert([{
                  id: 1,
                  ownerID: '1',
                  itinName: 'Test Itinerary #1',
                  isActive: '0',
                  isPublic: '1',
                },
                {
                  id: 2,
                  ownerID: '2',
                  itinName: 'Test Itinerary #2',
                  isActive: '0',
                  isPublic: '1',
                },
                {
                  id: 3,
                  ownerID: '3',
                  itinName: 'Test Itinerary #3',
                  isActive: '0',
                  isPublic: '1',
                },
                {
                  id: 4,
                  ownerID: '1',
                  itinName: 'User #1, Itinerary 2',
                  isActive: '0',
                  isPublic: '1',
                },
                {
                  id: 5,
                  ownerID: '2',
                  itinName: 'User #2, Itinerary 2',
                  isActive: '0',
                  isPublic: '1',
                },
                {
                  id: 6,
                  ownerID: '3',
                  itinName: 'User #3, Itinerary 3',
                  isActive: '0',
                  isPublic: '1',
                }
              ]);
            })
        })
    })

  // Inserts seed entries



};