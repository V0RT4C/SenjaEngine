export const items = [
    {
        id: 100,
        name: 'void',
        flags: {
            blockMissile: true,
            unpassable: true
        }
    },
    {
        id: 101,
        name: 'earth',
        flags: {
            blockMissile: true,
            unpassable: true
        }
    },
    {
        id: 102,
        name: 'grass',
        attributes: {
            speed: 150
        }
    },
    {
        id: 3031,
        article: 'a',
        name: 'gold coin',
        pluralName: 'gold coins',
        attributes: {
            weight: 10
        },
        flags: {
            movable: true,
            pickupable: true,
            stackable: true
        }
    },
    {
        id: 3280,
        article: 'a',
        name: 'fire sword',
        description: 'The blade is a magic flame.',
        attributes: {
            weight: 2300,
            light: {
                intensity: 3,
                color: 199
            },
            weaponType: 'SWORD',
            attack: 35,
            defense: 20
        },
        flags: {
            movable: true,
            multiUse: true,
            pickupable: true
        }
    },
    {
        id: 3366,
        article: 'a',
        name: 'magic plate armor',
        description: 'An enchanted gem glows on the plate armor.',
        attributes: {
            weight: 8500,
            armor: 17,
            inventorySlot: 'BODY'
        },
        flags: {
            movable: true,
            pickupable: true
        }
    },
    {
        id: 3423,
        article: 'a',
        name: 'blessed shield',
        description: 'The shield grants divine protection',
        attributes: {
            weight: 6800,
            weaponType: 'SHIELD',
            defense: 40
        },
        flags: {
            movable: true,
            pickupable: true
        }
    }
]