# Senja Engine

## What is this?
This is a MMO server written in TypeScript using Deno. 
The goal is to create a server that emulates the Tibia protocol for game versions 7.4 - 7.72.
This includes damage formulas, skill formulas, monster combat behaviour, general game mechanics etc... 
This project does not strive to create a copy of the game itself, like the map or the game story. 
Instead it aims to become a modular extensible server with all the base functionality that you would need to start building your own Tibia-like game.
Right now the game communicates using TCP sockets, just like the traditional Tibia game does. However, web socket communication
will be implemented once the server is getting mature enough and stable, so that future web clients can connect to it as well..  

Right now the server works, You can login, walk around, move items / creatures and open containers. You can also communicate
and some commands are working. You can create new items and put them on the map by writing !item [itemid]. You can also set
how much light you character emits by writing !light [lightlevel] ex: !light 9.

This server is still in its very infancy. Don't expect too much.

## Running the server
To run the server you need to install Deno to your system. It's kind of like NodeJS but better :)
Instructions for installing Deno can be found here: https://deno.land/

1. Install Deno
2. Clone the repo
3. cd into project directory
4. run: deno run --allow-net --allow-read --allow-write --allow-env main.ts (OR) make app executable by chmod+x app and then run the app file

## Logging in
To log in you need to use a Tibia client that supports Protocol version 7.6 as that's the only protocol that I know works
for sure right now. I recommend using this client: https://github.com/OTCv8/otclientv8

When dev mode is enabled in config a sqlite db will be setup with an account and two players.
Use this login info: 8899/8899

![Alt text](screenshot.webp?raw=true "Screenshot")

## Tasks
The tasks below are the tasks that I'm currently focusing on.

### Protocol

- [X] Login server
- [X] Enter game
- [X] Leave game
- [x] Multiplayer

#### Game
- [ ] World time
- [X] World light
- [ ] World light changes based on time
- [ ] NPC system
- [ ] Spawn system
- [ ] Level advancement
- [ ] Skill advancement
- [ ] Combat system

#### Map
- [ ] Read OTBM files
- [ ] Multi-floor functionality

#### Player

***Movement***
- [X] Walk north
- [X] Walk east
- [X] Walk south
- [X] Walk west
- [ ] Walk North-east
- [ ] Walk South-east
- [ ] Walk North-west
- [ ] Walk South-west
- [ ] Autowalk
- [ ] Mouse-click walk (Related to autowalk)

***Appearance***
- [X] Change outfit
- [ ] Item illusion

***Push***
- [X] Push items
- [X] Push creatures

***VIP List***
- [ ] Add VIP
- [ ] Edit VIP
- [ ] Remove VIP
- [ ] VIP login notify
- [ ] VIP logout notify

#### Items

***Movement***
- [X] Move on ground
- [X] Move from ground to inventory
- [X] Move from ground to container
- [X] Move from inventory to ground
- [X] Move from container to ground
- [X] Move from inventory slot to another inventory slot
- [X] Move from inventory to container
- [X] Move from container to inventory
- [X] Move in container
- [X] Move between containers

***Containers***
- [X] Open containers
- [X] Close containers
- [ ] Events for when state of container changes
- [ ] Update all clients spectating a container when a container state changes

***Safe trade***
- [ ] Request trade
- [ ] Inspect trade
- [ ] Accept trade
- [ ] Reject trade

---------
### Other
- [ ] Add checks in bytes class so there is no overflow when writing