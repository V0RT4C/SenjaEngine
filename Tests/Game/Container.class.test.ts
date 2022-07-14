import { assertEquals, assertStrictEquals } from "https://deno.land/std@0.147.0/testing/asserts.ts";
import TestContext = Deno.TestContext;
import { Container } from "Container";
import { Item } from "Item";

Deno.test('Container class', async (t : TestContext) => {
    const container = new Container(2854);
    const item = new Item(3224);
    const item2 = new Item(2852);

    await t.step('set capacity',  () => {
        container.capacity = -1;
        assertEquals(container.capacity, 1);

        container.capacity = 10;
        assertEquals(container.capacity, 10);

        container.capacity = 20;
        assertEquals(container.capacity, 20);

        container.capacity = 60;
        assertEquals(container.capacity, 40);
    });

    await t.step('add item(s)', () => {
        container.addItem(item);
        assertStrictEquals(item, container.items[0]);

        container.addItem(item2);
        assertStrictEquals(item, container.items[1]);
        assertStrictEquals(item2, container.items[0]);
    });

    await t.step('dont add item if no more capacity', () => {
        container.capacity = 2;
        const addSuccess = container.addItem(new Item(2848));
        assertEquals(addSuccess, false);
        assertStrictEquals(container.items[0], item2);
        assertEquals(container.items.length, 2);
    });

    await t.step('Fail to remove item if slotId is less than 0 or larger than amount of items in container', () => {
        const result : Item | null = container.removeItemBySlotId(99)
        assertEquals(result, null);
        assertEquals(container.items.length, 2);

        const result2 : Item | null = container.removeItemBySlotId(-1);
        assertEquals(result2, null);
        assertEquals(container.items.length, 2);
    });

    await t.step('Fail to get item if slotId doesnt exist in the container', () => {
        const result : Item | null = container.getItemBySlotId(999);
        assertEquals(result, null);
    })

    await t.step('Get item by slotId', () => {
        const result : Item | null = container.getItemBySlotId(1);
        const result2 : Item | null = container.getItemBySlotId(0);

        assertStrictEquals(result, item);
        assertStrictEquals(result2, item2);
    });

    await t.step('Remove item at slotId 1', () => {
        const result : Item | null = container.removeItemBySlotId(1);
        assertStrictEquals(result, item);
        assertEquals(container.items.length, 1);
    });

    await t.step('assert container not to have a parent', () => {
        assertEquals(container.parent, null);
    });

    await t.step('add parent to container', () => {
        const parent = new Container(2854);
        container.parent = parent;
        assertEquals(container.parent, parent);
    });

    await t.step('if container is full return true', () => {
        container.capacity = container.items.length;
        assertEquals(container.isFull(), true);
    })
});