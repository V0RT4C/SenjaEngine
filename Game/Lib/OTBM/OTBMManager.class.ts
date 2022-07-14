import { BytesBuffer } from '~/Lib/Bytes/Bytes.class.ts';
import { MapHeader } from '~/Lib/OTBM/MapHeader.class.ts';
import { MapData } from '~/Lib/OTBM/MapData.class.ts';
import { MapTileArea } from '~/Lib/OTBM/MapTileArea.class.ts';
import { MapTile } from '~/Lib/OTBM/MapTile.class.ts';
import { MapHouseTile } from '~/Lib/OTBM/MapHouseTile.class.ts';
import { OTBMItem } from '~/Lib/OTBM/OTBMItem.class.ts';
import { OTBMNode } from '~/Lib/OTBM/OTBMNode.abstract.class.ts';
import { OTBMWaypoints } from '~/Lib/OTBM/OTBMWaypoints.class.ts';
import { OTBMWaypoint } from '~/Lib/OTBM/OTBMWaypoint.class.ts';
import { OTBMTowns } from '~/Lib/OTBM/OTBMTowns.class.ts';
import { OTBMTown } from '~/Lib/OTBM/OTBMTown.class.ts';
import { OTBM_HEADER } from 'Constants';
import { Map } from 'types';

const __VERSION__ = "1.0.1";
const NODE_ESC = 0xFD;
const NODE_INIT = 0xFE;
const NODE_TERM = 0xFF;

const getNode = (buffer : BytesBuffer, parent : OTBMNode | undefined, children : any[]) : OTBMNode => {
  //removeEscapeCharacters(buffer);
  let node! : OTBMNode;

  switch(buffer.readUint8()) {

      case OTBM_HEADER.OTBM_MAP_HEADER:
        node = new MapHeader();
        (node as MapHeader).setFromBuffer(buffer);
        break;

      // High level Map Data (e.g. areas, towns, and waypoints)
      case OTBM_HEADER.OTBM_MAP_DATA:
        node = new MapData();
        node.type = OTBM_HEADER.OTBM_MAP_DATA;
        node.setAttributes(readAttributes(buffer));
        break;

      // A tile area
      case OTBM_HEADER.OTBM_TILE_AREA:
        node = new MapTileArea();
        node.type = OTBM_HEADER.OTBM_TILE_AREA;
        (node as MapTileArea).x = buffer.readUint16LE(1);
        (node as MapTileArea).y = buffer.readUint16LE(3);
        (node as MapTileArea).z = buffer.readUint8(5);
        break;

      // A specific tile at location inside the parent tile area
      case OTBM_HEADER.OTBM_TILE:
        node = new MapTile();
        node.type = OTBM_HEADER.OTBM_TILE;
        (node as MapTile).x = buffer.readUint8(1);
        (node as MapTile).y = buffer.readUint8(2);
        node.setAttributes(readAttributes(buffer));
        break;

      // A specific item inside the parent tile
      case OTBM_HEADER.OTBM_ITEM:
        node = new OTBMItem();
        node.type = OTBM_HEADER.OTBM_ITEM;
        (node as OTBMItem).id = buffer.readUint16LE(1);
        node.setAttributes(readAttributes(buffer));
        break;

      // Parse OTBM_HEADER.OTBM_HOUSETILE entity
      case OTBM_HEADER.OTBM_HOUSETILE:
        node = new MapHouseTile();
        node.type = OTBM_HEADER.OTBM_HOUSETILE;
        (node as MapHouseTile).x = buffer.readUint8(1);
        (node as MapHouseTile).y = buffer.readUint8(2);
        (node as MapHouseTile).houseId = buffer.readUint32LE(3);
        node.setAttributes(readAttributes(buffer));
        break;

      // Parse OTBM_HEADER.OTBM_WAYPOINTS structure
      case OTBM_HEADER.OTBM_WAYPOINTS:
        node = new OTBMWaypoints();
        node.type = OTBM_HEADER.OTBM_WAYPOINTS;
        break;

      // Single waypoint entity
      case OTBM_HEADER.OTBM_WAYPOINT:
        node = new OTBMWaypoint();
        node.type = OTBM_HEADER.OTBM_WAYPOINT;
        (node as OTBMWaypoint).name = buffer.readString();
        (node as OTBMWaypoint).x = buffer.readUint16LE();
        (node as OTBMWaypoint).y = buffer.readUint16LE();
        (node as OTBMWaypoint).z = buffer.readUint8();
        break;

      // Parse OTBM_HEADER.OTBM_TOWNS
      case OTBM_HEADER.OTBM_TOWNS:
        node = new OTBMTowns();
        node.type = OTBM_HEADER.OTBM_TOWNS;
        break;

      // Single town entity
      case OTBM_HEADER.OTBM_TOWN:
        node = new OTBMTown();
        node.type = OTBM_HEADER.OTBM_TOWN;
        (node as OTBMTown).townId = buffer.readUint32LE();
        (node as OTBMTown).name = buffer.readString();
        (node as OTBMTown).x = buffer.readUint16LE();
        (node as OTBMTown).y = buffer.readUint16LE();
        (node as OTBMTown).z = buffer.readUint8();
        break;
    }

    node.parent = parent;
    node.children = children;

    // Set node children
    if(node?.children?.length) {
      setChildren(node, node.children);
    }

    return node;
}

const removeEscapeCharacters = (buffer : BytesBuffer) => {
  /* FUNCTION removeEscapeCharacter
 * Removes 0xFD escape character from the byte string
 */

var iEsc = 0;
var index;

  while(true) {

    // Find the next escape character
    index = buffer.slice(++iEsc).indexOf(NODE_ESC);

    // No more: stop iteration
    if(index === -1) {
      return;
    }

    iEsc = iEsc + index;

    // Remove the character from the buffer
    buffer = new BytesBuffer([
      ...buffer.slice(0, iEsc),
      ...buffer.slice(iEsc + 1)
    ]);

  }
}

const readAttributes = (buffer : BytesBuffer) : Map.OTBMNodeAttributes => {
  
  /* FUNCTION readAttributes
   * Parses a nodes attribute structure
   */

  var i = 0;

  // Collect additional properties
  var attributes : Map.OTBMNodeAttributes = new Object() as Map.OTBMNodeAttributes;

  // Read buffer from beginning
  while(i + 1 < buffer.length) {

    // Read the leading byte
    switch(buffer.readUint8(i++)) {

      // Text is written
      case OTBM_HEADER.OTBM_ATTR_TEXT:
        attributes.text = buffer.readString(i);
        i += attributes.text.length + 2;
        break;

      // Spawn file name
      case OTBM_HEADER.OTBM_ATTR_EXT_SPAWN_FILE:
        attributes.spawnfile = buffer.readString(i);
        i += attributes.spawnfile.length + 2;
        break;

      // House file name
      case OTBM_HEADER.OTBM_ATTR_EXT_HOUSE_FILE:
        attributes.housefile = buffer.readString(i);
        i += attributes.housefile.length + 2;
        break;

      // House door identifier (1 byte)
      case OTBM_HEADER.OTBM_ATTR_HOUSEDOORID:
        attributes.houseDoorId = buffer.readUint8(i);
        //i += properties.houseDoorId.length + 2;
        i += 3;
        break;

      // Description is written (N Bytes)
      // May be written multiple times
      case OTBM_HEADER.OTBM_ATTR_DESCRIPTION:
        var descriptionString = buffer.readString(i);
        if(attributes.description) {
          attributes.description = attributes.description + " " + descriptionString;
        } else {
          attributes.description = descriptionString;
        }
        i += descriptionString.length + 2;
        break;

      // Description is written (N Bytes)
      case OTBM_HEADER.OTBM_ATTR_DESC:
        attributes.text = buffer.readString(i);
        i += attributes.text.length + 2;
        break;

      // Depot identifier (2 byte)
      case OTBM_HEADER.OTBM_ATTR_DEPOT_ID:
        attributes.depotId = buffer.readUint16LE(i);
        i += 2;
        break;

      // Tile flags indicating the type of tile (4 Bytes)
      case OTBM_HEADER.OTBM_ATTR_TILE_FLAGS:
        attributes.tileFlags = readTileFlags(buffer.readUint32LE(i));
        i += 4;
        break;

      // N (2 Bytes)
      case OTBM_HEADER.OTBM_ATTR_RUNE_CHARGES:
        attributes.charges = buffer.readUint16LE(i);
        i += 2;
        break;

      // The item count (1 byte)
      case OTBM_HEADER.OTBM_ATTR_COUNT:
        attributes.count = buffer.readUint8(i);
        i += 1;
        break;

      // The main item identifier	(2 Bytes)
      case OTBM_HEADER.OTBM_ATTR_ITEM:
        attributes.tileId = buffer.readUint16LE(i);
        i += 2;
        break;

      // Action identifier was set (2 Bytes)
      case OTBM_HEADER.OTBM_ATTR_ACTION_ID:
        attributes.actionId = buffer.readUint16LE(i);
        i += 2;
        break;

      // Unique identifier was set (2 Bytes)
      case OTBM_HEADER.OTBM_ATTR_UNIQUE_ID:
        attributes.uniqueId = buffer.readUint16LE(i);
        i += 2;
        break;

      // Teleporter given destination (x, y, z using 2, 2, 1 Bytes respectively)
      case OTBM_HEADER.OTBM_ATTR_TELE_DEST:
        attributes.destination = {
          "x": buffer.readUint16LE(i),
          "y": buffer.readUint16LE(i + 2),
          "z": buffer.readUint8(i + 4)
        }
        i += 5;
        break;
    }

  }

  return attributes;

}

const readTileFlags = (flags : number) : Map.OTBMTileFlags => {

  /* FUNCTION readFlags
   * Reads OTBM bit flags
   */

  // Read individual tile flags using bitwise AND &
  return {
    protection: flags & OTBM_HEADER.TILESTATE_PROTECTIONZONE,
    noPVP: flags & OTBM_HEADER.TILESTATE_NOPVP,
    noLogout: flags & OTBM_HEADER.TILESTATE_NOLOGOUT,
    PVPZone: flags & OTBM_HEADER.TILESTATE_PVPZONE,
    refresh: flags & OTBM_HEADER.TILESTATE_REFRESH
  }
}

const setChildren = (parent : OTBMNode, children : OTBMNode[]) : void => {
  /* FUNCTION Node.setChildren
   * Give children of a node a particular identifier
   */
  switch(parent.type) {
      case OTBM_HEADER.OTBM_TILE_AREA:
        (parent as MapTileArea).tiles = children;
        break;
      case OTBM_HEADER.OTBM_TILE:
      case OTBM_HEADER.OTBM_HOUSETILE:
        (parent as any).items = children;
        break;
      case OTBM_HEADER.OTBM_TOWNS:
        (parent as any).towns = children;
        break;
      case OTBM_HEADER.OTBM_ITEM:
        (parent as any).content = children;
        break;
      case OTBM_HEADER.OTBM_MAP_DATA:
        (parent as any).features = children;
        break;
      default:
        (parent as any).nodes = children;
        break;
    }
  }

// class Node {
//     constructor(Data : BytesBuffer, children : any[]){
//         this.buffer = Data;
//         this.children = children;
//         this.parse();
//     }
    
//     public buffer : BytesBuffer;
//     public children : any[];
    
//     public id! : number | undefined;
//     public name! : string | undefined;
//     public type! : number | undefined;
//     public version! : number | undefined;
//     public mapWidth! : number | undefined;
//     public mapHeight! : number | undefined;
//     public itemsMajorVersion! : number | undefined;
//     public itemsMinorVersion! : number | undefined;
//     public x! : number | undefined;
//     public y! : number | undefined;
//     public z! : number | undefined;
//     public houseId! : number | undefined;
//     public townId! : number | undefined;
//     public tiles : any[] = [];
//     public items : any[] = [];
//     public towns : any[] = [];
//     public content : any[] = [];
//     public features : any[] = [];
//     public nodes : any[] = [];
//     public properties! : Map.OTBMNodeAttributes;
    
//     public parse(){
//         this.removeEscapeCharacters();

//         switch(this.buffer.readUint8(0)) {
  
//             case OTBM_HEADER.OTBM_MAP_HEADER:
//               this.type = OTBM_HEADER.OTBM_MAP_HEADER;
//               this.version = this.buffer.readUint32LE(1),
//               this.mapWidth = this.buffer.readUint16LE(5),
//               this.mapHeight = this.buffer.readUint16LE(7),
//               this.itemsMajorVersion = this.buffer.readUint32LE(9),
//               this.itemsMinorVersion = this.buffer.readUint32LE(13)
//               break;
      
//             // High level Map Data (e.g. areas, towns, and waypoints)
//             case OTBM_HEADER.OTBM_MAP_DATA:
//               this.type = OTBM_HEADER.OTBM_MAP_DATA;
//               this.properties = this.readAttributes();
//               break;
      
//             // A tile area
//             case OTBM_HEADER.OTBM_TILE_AREA:
//               this.type = OTBM_HEADER.OTBM_TILE_AREA;
//               this.x = this.buffer.readUint16LE(1);
//               this.y = this.buffer.readUint16LE(3);
//               this.z = this.buffer.readUint8(5);
//               break;
      
//             // A specific tile at location inside the parent tile area
//             case OTBM_HEADER.OTBM_TILE:
//               this.type = OTBM_HEADER.OTBM_TILE;
//               this.x = this.buffer.readUint8(1);
//               this.y = this.buffer.readUint8(2);
//               this.properties = this.readAttributes();
//               break;
      
//             // A specific item inside the parent tile
//             case OTBM_HEADER.OTBM_ITEM:
//               this.type = OTBM_HEADER.OTBM_ITEM;
//               this.id = this.buffer.readUint16LE(1);
//               this.properties = this.readAttributes();
//               break;
      
//             // Parse OTBM_HEADER.OTBM_HOUSETILE entity
//             case OTBM_HEADER.OTBM_HOUSETILE:
//               this.type = OTBM_HEADER.OTBM_HOUSETILE;
//               this.x = this.buffer.readUint8(1);
//               this.y = this.buffer.readUint8(2);
//               this.houseId = this.buffer.readUint32LE(3);
//               this.properties = this.readAttributes();
//               break;
      
//             // Parse OTBM_HEADER.OTBM_WAYPOINTS structure
//             case OTBM_HEADER.OTBM_WAYPOINTS:
//               this.type = OTBM_HEADER.OTBM_WAYPOINTS;
//               break;
      
//             // Single waypoint entity
//             case OTBM_HEADER.OTBM_WAYPOINT:
//               this.type = OTBM_HEADER.OTBM_WAYPOINT;
//               this.name = this.buffer.readString(1);
//               this.x = this.buffer.readUint16LE(3 + this.name.length);
//               this.y = this.buffer.readUint16LE(5 + this.name.length);
//               this.z = this.buffer.readUint8(7 + this.name.length);
//               break;
      
//             // Parse OTBM_HEADER.OTBM_TOWNS
//             case OTBM_HEADER.OTBM_TOWNS:
//               this.type = OTBM_HEADER.OTBM_TOWNS;
//               break;
      
//             // Single town entity
//             case OTBM_HEADER.OTBM_TOWN:
//               this.type = OTBM_HEADER.OTBM_TOWN;
//               this.townId = this.buffer.readUint32LE(1);
//               this.name = this.buffer.readString(5);
//               this.x = this.buffer.readUint16LE(7 + this.name.length);
//               this.y = this.buffer.readUint16LE(9 + this.name.length);
//               this.z = this.buffer.readUint8(11 + this.name.length);
//               break;
//           }
      
//           // Set node children
//           if(this.children.length) {
//             this.setChildren();
//           }
      
//     }

//     public removeEscapeCharacters(){
//         /* FUNCTION removeEscapeCharacter
//        * Removes 0xFD escape character from the byte string
//        */
  
//       var iEsc = 0;
//       var index;
  
//       while(true) {
  
//         // Find the next escape character
//         index = this.buffer.slice(++iEsc).indexOf(NODE_ESC);
  
//         // No more: stop iteration
//         if(index === -1) {
//           return;
//         }
  
//         iEsc = iEsc + index;
  
//         // Remove the character from the buffer
//         this.buffer = new BytesBuffer([
//           ...this.buffer.slice(0, iEsc),
//           ...this.buffer.slice(iEsc + 1)
//         ]);
  
//       }
//     }

//     public setChildren(parent : OTBMNode){
//     /* FUNCTION Node.setChildren
//      * Give children of a node a particular identifier
//      */

//     switch(this.type) {
//         case OTBM_HEADER.OTBM_TILE_AREA:
//           this.tiles = this.children;
//           break;
//         case OTBM_HEADER.OTBM_TILE:
//         case OTBM_HEADER.OTBM_HOUSETILE:
//           this.items = this.children;
//           break;
//         case OTBM_HEADER.OTBM_TOWNS:
//           this.towns = this.children;
//           break;
//         case OTBM_HEADER.OTBM_ITEM:
//           this.content = this.children;
//           break;
//         case OTBM_HEADER.OTBM_MAP_DATA:
//           this.features = this.children;
//           break;
//         default:
//           this.nodes = this.children;
//           break;
//       }
//     }

//     public readAttributes() : Map.OTBMNodeAttributes {
  
//         /* FUNCTION readAttributes
//          * Parses a nodes attribute structure
//          */
    
//         var i = 0;
    
//         // Collect additional properties
//         var properties : Map.OTBMNodeAttributes = new Object() as Map.OTBMNodeAttributes;
    
//         // Read buffer from beginning
//         while(i + 1 < this.buffer.length) {
    
//           // Read the leading byte
//           switch(this.buffer.readUint8(i++)) {
    
//             // Text is written
//             case OTBM_HEADER.OTBM_ATTR_TEXT:
//               properties.text = this.buffer.readString(i);
//               i += properties.text.length + 2;
//               break;
    
//             // Spawn file name
//             case OTBM_HEADER.OTBM_ATTR_EXT_SPAWN_FILE:
//               properties.spawnfile = this.buffer.readString(i);
//               i += properties.spawnfile.length + 2;
//               break;
    
//             // House file name
//             case OTBM_HEADER.OTBM_ATTR_EXT_HOUSE_FILE:
//               properties.housefile = this.buffer.readString(i);
//               i += properties.housefile.length + 2;
//               break;
    
//             // House door identifier (1 byte)
//             case OTBM_HEADER.OTBM_ATTR_HOUSEDOORID:
//               properties.houseDoorId = this.buffer.readUint8(i);
//               //i += properties.houseDoorId.length + 2;
//               i += 3;
//               break;
    
//             // Description is written (N Bytes)
//             // May be written multiple times
//             case OTBM_HEADER.OTBM_ATTR_DESCRIPTION:
//               var descriptionString = this.buffer.readString(i);
//               if(properties.description) {
//                 properties.description = properties.description + " " + descriptionString;
//               } else {
//                 properties.description = descriptionString;
//               }
//               i += descriptionString.length + 2;
//               break;
    
//             // Description is written (N Bytes)
//             case OTBM_HEADER.OTBM_ATTR_DESC:
//               properties.text = this.buffer.readString(i);
//               i += properties.text.length + 2;
//               break;
    
//             // Depot identifier (2 byte)
//             case OTBM_HEADER.OTBM_ATTR_DEPOT_ID:
//               properties.depotId = this.buffer.readUint16LE(i);
//               i += 2;
//               break;
    
//             // Tile flags indicating the type of tile (4 Bytes)
//             case OTBM_HEADER.OTBM_ATTR_TILE_FLAGS:
//               properties.tileFlags = this.readFlags(this.buffer.readUint32LE(i));
//               i += 4;
//               break;
    
//             // N (2 Bytes)
//             case OTBM_HEADER.OTBM_ATTR_RUNE_CHARGES:
//               properties.charges = this.buffer.readUint16LE(i);
//               i += 2;
//               break;
    
//             // The item count (1 byte)
//             case OTBM_HEADER.OTBM_ATTR_COUNT:
//               properties.count = this.buffer.readUint8(i);
//               i += 1;
//               break;
    
//             // The main item identifier	(2 Bytes)
//             case OTBM_HEADER.OTBM_ATTR_ITEM:
//               properties.tileId = this.buffer.readUint16LE(i);
//               i += 2;
//               break;
    
//             // Action identifier was set (2 Bytes)
//             case OTBM_HEADER.OTBM_ATTR_ACTION_ID:
//               properties.actionId = this.buffer.readUint16LE(i);
//               i += 2;
//               break;
    
//             // Unique identifier was set (2 Bytes)
//             case OTBM_HEADER.OTBM_ATTR_UNIQUE_ID:
//               properties.uniqueId = this.buffer.readUint16LE(i);
//               i += 2;
//               break;
    
//             // Teleporter given destination (x, y, z using 2, 2, 1 Bytes respectively)
//             case OTBM_HEADER.OTBM_ATTR_TELE_DEST:
//               properties.destination = {
//                 "x": this.buffer.readUint16LE(i),
//                 "y": this.buffer.readUint16LE(i + 2),
//                 "z": this.buffer.readUint8(i + 4)
//               }
//               i += 5;
//               break;
//           }
    
//         }
    
//         return properties;
    
//     }

//     public readFlags(flags : number) {

//         /* FUNCTION readFlags
//          * Reads OTBM bit flags
//          */
    
//         // Read individual tile flags using bitwise AND &
//         return {
//           protection: flags & OTBM_HEADER.TILESTATE_PROTECTIONZONE,
//           noPVP: flags & OTBM_HEADER.TILESTATE_NOPVP,
//           noLogout: flags & OTBM_HEADER.TILESTATE_NOLOGOUT,
//           PVPZone: flags & OTBM_HEADER.TILESTATE_PVPZONE,
//           refresh: flags & OTBM_HEADER.TILESTATE_REFRESH
//         }
    
//     }
// }

let oldNodes : any[] = [];
let count : number = 0;
function readNode(buffer : BytesBuffer, parent : OTBMNode | undefined) : { node: OTBMNode | undefined, i: number } {
  
    /* FUNCTION readNode
     * Recursively parses OTBM nodal tree structure
     */

    // Cut off the initializing 0xFE identifier
    buffer = new BytesBuffer(buffer.slice(1));

    var i = 0;
    var children = new Array();
    var nodeData! : BytesBuffer;
    var child;
    let node : OTBMNode | undefined;
    let iterator! : number;

    // Start reading the array
    while(i < buffer.length) {

      var cByte = buffer.readUint8(i);

      // Data belonging to the parent node, between 0xFE and (OxFE || 0xFF)
      if(nodeData === undefined && (cByte === NODE_INIT || cByte === NODE_TERM)) {
        nodeData = new BytesBuffer(buffer.slice(0, i));
      }

      // Escape character: skip reading this and following byte
      if(cByte === NODE_ESC) {
        i = i + 2;
        continue;
      }

      // A new node is started within another node: recursion
      if(cByte === NODE_INIT) {
        child = readNode(new BytesBuffer(buffer.slice(i)), oldNodes[0+count]);
        children.push(child.node);

        // Skip index over full child length
        i = i + 2 + child.i;
        continue;
      }

      // Node termination
      if(cByte === NODE_TERM) {
          node = getNode(nodeData, oldNodes[0+count], children);
          oldNodes.push(node);
          iterator = i;
          break;
        }
        
        i++;
        
      }
      
    count++;
    return { i: iterator, node };
}

export const readOTBM = (buffer : BytesBuffer) => {
    const MAP_IDENTIFIER = buffer.readUint32LE(0);

    // Confirm OTBM format by reading magic Bytes (NULL or "OTBM")
    if(MAP_IDENTIFIER !== 0x00000000 && MAP_IDENTIFIER !== 0x4D42544F) {
        throw("Unknown OTBM format: unexpected magic Bytes.");
    }

    // Create an object to hold the Data
    var mapData = {
        version: __VERSION__,
        identifier: MAP_IDENTIFIER,
        data: readNode(new BytesBuffer(buffer.slice(4)), undefined).node
    }

    return mapData;
}