# Senja Engine

## What is this?
This is a MMO server written in TypeScript using Deno. 
The goal is to create a server that emulates the Tibia protocol for game versions 7.4 - 7.72.
This includes damage formulas, skill formulas, monster combat behaviour, general game mechanics etc... 
This project does not strive to create a copy of the game itself, like the map or the game story. 
Instead it aims to become a modular extensible server with all the base functionality that you would need to start building your own Tibia-like game.
Right now the game communicates using TCP sockets, just like the traditional Tibia game does. However, web socket communication
will be implemented once the server is getting mature enough and stable, so that future web clients can connect to it as well..  

Right now the server works, You can login, walk around, move items / creatures and open containers. You can also communicate and some commands are working.

This server is still in its very infancy. Don't expect too much.
There are bugs. If you find any, please report them here https://github.com/V0RT4C/SenjaEngine/issues

## All working commands
**!tp** [steps] (Teleports you x amount of steps in the direction your character is pointing)  
**!up** (Teleports you up one floor)  
**!down** (Teleports you down one floor)  
**!goto** ["playername"] (Will Teleport you to a player)  
**!time** (Will send you a message to the game client console with the current world time)  
**!light** [lightlevel] Will set the light level that your character emits  
**!item** [clientItemId] Will spawn an item of the specified type underneath your character


## Running the server
To run the server you need to install Deno to your system. It's kind of like NodeJS but better :)
Instructions for installing Deno can be found here: https://deno.land/

1. Install Deno
2. Clone the repo
3. cd into project directory
4. run: deno run --allow-net --allow-read --allow-write --allow-env main.ts (OR) make app executable by chmod+x app and then run the app file

## Logging in
To log in you need to use a Tibia client that supports Protocol version 7.6 as that's the protocol im focusing on right now. I recommend using this client: https://github.com/OTCv8/otclientv8

When dev mode is enabled in config a sqlite db will be setup with an account and two players.
Use this login info: 8899/8899

If you want to connect from multiple clients you need to edit the IP in Data/worlds.json to match your IP.

![Alt text](screenshot.webp?raw=true "Screenshot")

## Tasks
The tasks below are the tasks that I'm currently focusing on.

### Protocol

- [X] Login server
- [X] Enter game
- [X] Leave game
- [x] Multiplayer

#### Game
- [X] World time
- [X] World light
- [X] World light changes based on time
- [ ] NPC system
- [ ] Spawn system
- [ ] Level advancement
- [ ] Skill advancement
- [ ] Combat system

#### Map
- [X] Read OTBM files
- [X] Multi-floor functionality

#### Player

***Movement***
- [X] Walk north
- [X] Walk east
- [X] Walk south
- [X] Walk west
- [X] Walk North-east (Not keyboard yet)
- [X] Walk South-east (Not keyboard yet)
- [X] Walk North-west (Not keyboard yet)
- [X] Walk South-west (Not keyboard yet)
- [X] Autowalk
- [X] Mouse-click walk (Related to autowalk)

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
- [X] Events for when state of container changes
- [X] Update all clients spectating a container when a container state changes

***Safe trade***
- [ ] Request trade
- [ ] Inspect trade
- [ ] Accept trade
- [ ] Reject trade

---------
### Other
- [ ] Add checks in bytes class so there is no overflow when writing