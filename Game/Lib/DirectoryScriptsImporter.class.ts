export class DirectoryScriptsImporter {
    public static async importScripts(dirPath : string){
        const dir : Iterable<Deno.DirEntry> = Deno.readDirSync(Deno.realPathSync(dirPath));

        for (const file of [...dir]){
            await import (Deno.realPathSync(`${dirPath}/${file.name}`));
        }
    }
}